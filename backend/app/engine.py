"""规则引擎总调度：串起 5 个 rule + AI agent，返回完整 JSON"""
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError

from app.schemas import AnalyzeRequest
from app.data_loader import match_problems_for_task
from app.rules.urgency import get_urgency
from app.rules.chapters import build_chapter_plan
from app.rules.daily_plan import build_daily_plan
from app.rules.memorize import build_must_memorize
from app.rules.ai_advice import build_ai_advice
from app.rules.ai_agent import call_minimax_agent, _fallback_analysis
from app.rules.risk import build_fail_risk
from app.rules.triage import build_triage
from app.rules.mission import build_today_mission


def analyze(payload: AnalyzeRequest):
    total_hours = payload.days * payload.hours

    urgency = get_urgency(
        scope=payload.scope,
        days=payload.days,
        level=payload.level,
        hours=payload.hours,
        teacher=payload.teacher,
    )

    chapters = build_chapter_plan(
        scope=payload.scope,
        level=payload.level,
        total_hours=total_hours,
        teacher=payload.teacher,
    )

    daily_plan = build_daily_plan(
        chapters=chapters,
        days=payload.days,
        hours_per_day=payload.hours,
        teacher=payload.teacher,
    )

    # 题库智能匹配：为每个任务从题库中选对应题目
    allowed = {c["name"] for c in chapters} if chapters else None
    for day in daily_plan:
        for task in day.get("tasks", []):
            if task.get("chapter"):
                task["problems"] = match_problems_for_task(task["task"], allowed)

    must_memorize = build_must_memorize(
        chapters=chapters,
        level=payload.level,
    )

    ai_advice = build_ai_advice(
        scope=payload.scope,
        days=payload.days,
        level=payload.level,
        hours=payload.hours,
        teacher=payload.teacher,
        total_hours=total_hours,
        urgency_level=urgency["level"],
        chapters=chapters,
    )

    # MiniMax AI agent: 个性化分析（非阻塞，2s 超时）
    ai_analysis = _fallback_analysis(payload.level, payload.teacher, urgency, chapters)
    executor = ThreadPoolExecutor(max_workers=1)
    future = executor.submit(
        call_minimax_agent,
        payload.scope, payload.days, payload.level,
        payload.hours, payload.teacher, urgency, chapters,
    )
    try:
        result = future.result(timeout=2)
        if result:
            ai_analysis = result
    except FuturesTimeoutError:
        print("[Engine] MiniMax timed out after 2s, using fallback")
    except Exception as e:
        print(f"[Engine] AI agent thread failed: {e}")
    finally:
        executor.shutdown(wait=False)

    # 应用 AI 紧急度修正
    if ai_analysis and ai_analysis.get("score_adjust"):
        adjust = ai_analysis["score_adjust"]
        urgency["score"] = min(99, max(8, urgency.get("score", 50) + adjust))
        s = urgency["score"]
        if s >= 85:      urgency["level"], urgency["color"] = "极度紧急", "red"
        elif s >= 65:    urgency["level"], urgency["color"] = "高度紧急", "orange"
        elif s >= 40:    urgency["level"], urgency["color"] = "适中", "yellow"
        else:            urgency["level"], urgency["color"] = "充裕", "green"

    risk = build_fail_risk(
        urgency=urgency,
        level=payload.level,
        days=payload.days,
        hours=payload.hours,
        scope=payload.scope,
        teacher=payload.teacher,
    )

    triage = build_triage(
        chapters=chapters,
        level=payload.level,
        days=payload.days,
        hours=payload.hours,
        teacher=payload.teacher,
    )

    today_mission = build_today_mission(
        daily_plan=daily_plan,
        risk=risk,
        triage=triage,
    )

    return {
        "urgency": urgency,
        "chapters": chapters,
        "daily_plan": daily_plan,
        "must_memorize": must_memorize,
        "ai_advice": ai_advice,
        "ai_analysis": ai_analysis,
        "risk": risk,
        "triage": triage,
        "today_mission": today_mission,
        "meta": {
            "generated_by": "back-end-rules",
            "scope": payload.scope,
            "level": payload.level,
            "teacher": payload.teacher
        }
    }
