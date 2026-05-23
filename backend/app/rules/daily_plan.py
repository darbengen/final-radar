from app.data_loader import load_daily_task_pool, load_chapters, match_problems_for_task
from app.rules.chapters import build_chapter_plan

_TASK_DURATION = {
    "背诵": 0.5, "练习": 1.0, "计算": 1.0, "判断": 0.5,
    "综合": 1.5, "辨认": 0.5, "推导": 1.0, "证明": 1.0,
    "真题": 1.5, "应用": 1.0,
}


def _guess_hours(task_text: str) -> float:
    for keyword, h in _TASK_DURATION.items():
        if keyword in task_text:
            return h
    return 1.0


def _build_primer(task_text: str, ch: dict) -> dict:
    """从章节数据中提取该任务的前置知识点"""
    if not ch:
        return {}
    formulas = ch.get("must_formulas", [])[:3]
    concepts = ch.get("core_topics", [])[:3]
    mistakes = ch.get("easy_mistakes", [])[:2]
    return {
        "formulas": formulas,
        "concepts": concepts,
        "mistakes": mistakes,
    }


def _get_or_build_primer(task_text: str, ch_lookup: dict, chapters: list) -> dict:
    """智能匹配知识点：章节任务用章节数据，模拟卷任务用全科考前提示"""
    # 尝试从任务文本匹配章节名
    for ch_name, ch in ch_lookup.items():
        if ch_name in task_text:
            return _build_primer(task_text, ch)

    # 模拟卷/综合练习 → 全科考前公式
    if "模拟卷" in task_text or "真题" in task_text or "综合练习" in task_text:
        return _exam_primer(chapters)

    return {}


def _exam_primer(chapters: list) -> dict:
    """为模拟卷/综合练习生成全科考前速查"""
    all_f = []
    all_m = []
    for ch in chapters:
        all_f.extend(ch.get("must_formulas", []))
        all_m.extend(ch.get("easy_mistakes", []))
    seen = set()
    top_f = []
    for f in all_f:
        if f not in seen:
            seen.add(f)
            top_f.append(f)
        if len(top_f) >= 6:
            break
    return {
        "formulas": top_f,
        "concepts": ["限时完成，模拟考试节奏", "先做会的，难题先跳过", "做完再对答案，不要边做边看"],
        "mistakes": all_m[:3] if all_m else [],
    }


def build_daily_plan(chapters, days: int, hours_per_day: int, teacher: str = "D"):
    labels = {1: "今天", 2: "明天"}
    pool = load_daily_task_pool()

    # 章节名 → 章节数据 速查表
    ch_lookup = {c["name"]: c for c in chapters}

    day_hours = [0.0] * days
    day_buckets = [[] for _ in range(days)]
    current_day = 0

    # ── 前 2/3 天：early_stage 任务 ──
    sorted_chapters = sorted(
        [c for c in chapters if c.get("suggested_hours", 0) > 0],
        key=lambda c: c["suggested_hours"], reverse=True,
    )

    for ch in sorted_chapters:
        budget = ch["suggested_hours"]
        raw_tasks = ch.get("common_tasks", [])
        if not raw_tasks:
            raw_tasks = ch.get("core_topics", [f"学习{ch['name']}：核心概念 + 典型例题"])

        for task_text in raw_tasks:
            if budget < 0.5:
                break
            task_hours = min(_guess_hours(task_text), budget)

            placed = False
            for d in range(current_day, days):
                space = round(hours_per_day - day_hours[d], 1)
                if task_hours <= space + 0.01:
                    day_buckets[d].append({
                        "task": task_text,
                        "hours": round(task_hours, 1),
                        "chapter_name": ch["name"],
                    })
                    day_hours[d] = round(day_hours[d] + task_hours, 1)
                    budget = round(budget - task_hours, 1)
                    current_day = d
                    placed = True
                    break
            if not placed:
                break

    # ── 后 1/3 天：teacher 分化的 late_stage 任务 ──
    late_stage = pool.get("late_stage", {})
    teacher_late = late_stage.get(teacher, late_stage.get("D", []))
    supplement = pool.get("common_supplement", [])

    for d in range(days):
        progress = d / max(days - 1, 1)
        if progress < 0.66:
            continue

        day_num = d + 1
        for lt in teacher_late:
            if lt.get("day") == day_num:
                if day_hours[d] + lt["hours"] <= hours_per_day + 0.01:
                    day_buckets[d].append({
                        "task": lt["task"],
                        "hours": lt["hours"],
                        "chapter_name": "",  # late_stage 不绑定特定章节
                    })
                    day_hours[d] = round(day_hours[d] + lt["hours"], 1)
                break

        gap = round(hours_per_day - day_hours[d], 1)
        for sp in supplement:
            if gap <= 0:
                break
            if sp["hours"] <= gap + 0.01:
                day_buckets[d].append(dict(sp))
                day_hours[d] = round(day_hours[d] + sp["hours"], 1)
                gap = round(gap - sp["hours"], 1)

        # 多余时间按教师风格填扩展练习
        ext_map = {
            "A": {"task": "加做一套真题卷（限时完成，对答案自批）", "hours": 1.0},
            "B": {"task": "翻课堂PPT，重做标记的例题", "hours": 1.0},
            "C": {"task": "找2道跨章节综合题，练习拆解题干", "hours": 1.0},
            "D": {"task": "自测一道未练过的综合大题", "hours": 1.0},
        }
        ext = ext_map.get(teacher, ext_map["D"])
        while gap >= 0.5:
            h = round(min(ext["hours"], gap), 1)
            day_buckets[d].append({"task": ext["task"], "hours": h})
            day_hours[d] = round(day_hours[d] + h, 1)
            gap = round(gap - h, 1)

    # ── 前 2/3 天的空缺用早期 review 填 ──
    early_review = [
        {"task": "回顾当天错题 + 重做标记的题目", "hours": 0.5},
        {"task": "背诵当天章节核心公式", "hours": 0.5},
    ]
    for d in range(days):
        progress = d / max(days - 1, 1)
        if progress >= 0.66:
            continue
        gap = round(hours_per_day - day_hours[d], 1)
        for rt in early_review:
            if gap <= 0:
                break
            if rt["hours"] <= gap + 0.01:
                day_buckets[d].append(dict(rt))
                day_hours[d] = round(day_hours[d] + rt["hours"], 1)
                gap = round(gap - rt["hours"], 1)

    # ── 组装输出 ──
    daily_plan = []
    for d in range(days):
        tasks = day_buckets[d]
        if not tasks:
            tasks = [{"task": "复盘错题 + 背诵公式 + 做一套综合练习", "hours": float(hours_per_day)}]

        enriched = []
        seen_chapters = set()
        for t in tasks:
            ch_name = t.pop("chapter_name", "")
            ch = ch_lookup.get(ch_name, {})
            if ch:
                if ch_name in seen_chapters:
                    primer = {}  # 同一章第二个任务起不再重复知识点
                else:
                    seen_chapters.add(ch_name)
                    primer = _build_primer(t["task"], ch)
            else:
                primer = _get_or_build_primer(t["task"], ch_lookup, chapters)

            enriched.append({
                "task": t["task"],
                "hours": round(t["hours"], 1),
                "chapter": ch_name or None,
                "problems": [],  # 由 engine.py: AI选题 或 关键词兜底
                "primer": primer,
            })

        # 当天公式汇总：从当天涉及的所有章节中提取公式（去重）
        day_chapters = set()
        for t in enriched:
            if t.get("chapter"):
                day_chapters.add(t["chapter"])
        day_formulas = []
        seen_f = set()
        for ch_name in day_chapters:
            ch = ch_lookup.get(ch_name, {})
            for f in ch.get("must_formulas", []):
                if f not in seen_f:
                    seen_f.add(f)
                    day_formulas.append(f)
        # 如果当天没有章节公式，从 primer 中提取
        if not day_formulas:
            for t in enriched:
                for f in t.get("primer", {}).get("formulas", []):
                    if f not in seen_f:
                        seen_f.add(f)
                        day_formulas.append(f)

        daily_plan.append({
            "day": d + 1,
            "label": labels.get(d + 1, f"第{d + 1}天"),
            "tasks": enriched,
            "day_formulas": day_formulas,
        })

    return daily_plan


def _build_consolidation_tasks(chapters: list, ch_lookup: dict, hours_per_day: int) -> list:
    """Generate a consolidation/review day when all planned days are finished early."""
    tasks = []

    # 1. 全科公式大回顾（从所有章节提取公式去重）
    all_formulas = []
    seen = set()
    for ch in chapters:
        for f in ch.get("must_formulas", []):
            if f not in seen:
                seen.add(f)
                all_formulas.append(f)

    if all_formulas:
        formula_text = "、".join(all_formulas[:8])
        tasks.append({
            "task": f"闭卷默写全科公式：{formula_text}",
            "hours": min(0.5 * (len(all_formulas[:8]) // 3 + 1), 1.5),
            "chapter": None,
            "problems": [],
            "primer": {
                "formulas": all_formulas[:8],
                "concepts": ["闭卷默写，写完再对照教材检查", "每次考前公式是保底分"],
                "mistakes": [],
            },
        })

    # 2. 跨章节综合题
    all_mistakes = []
    for ch in chapters:
        all_mistakes.extend(ch.get("easy_mistakes", [])[:2])
    tasks.append({
        "task": "做一套跨章节综合练习（或找2道综合大题，拆解题干后独立完成）",
        "hours": 1.0,
        "chapter": None,
        "problems": [],
        "primer": {
            "formulas": all_formulas[:3] if all_formulas else [],
            "concepts": ["跨章节综合是期末常考形式", "练习拆解题干→识别考点→选择方法的完整流程"],
            "mistakes": all_mistakes[:3] if all_mistakes else [],
        },
    })

    # 3. 重做所有标记/错题
    tasks.append({
        "task": "重做之前标记的所有错题和难题",
        "hours": 0.5,
        "chapter": None,
        "problems": [],
        "primer": {
            "formulas": [],
            "concepts": ["错题是最有效的复习材料", "遮住答案重新独立完成"],
            "mistakes": [],
        },
    })

    # 4. 休息 + 考前状态调整
    tasks.append({
        "task": "整理考试用品，早睡保持状态，考前不再学新内容",
        "hours": 0.5,
        "chapter": None,
        "problems": [],
        "primer": {
            "formulas": [],
            "concepts": ["充足的睡眠比考前突击更重要", "准备好计算器、铅笔、准考证等"],
            "mistakes": [],
        },
    })

    return tasks


def build_next_day(scope: str, days: int, level: str, hours: int, teacher: str,
                   current_day: int, completed_count: int, total_count: int,
                   previous_tasks: list, previous_chapters: list,
                   unfinished_tasks: list = None) -> dict:
    """Generate the next day based on previous day's completion.

    If completed >= 2/3: return the original pre-generated Day N+1.
    If not: return today's normal plan FIRST, then catch-up tasks from yesterday
            as supplementary (not replacing today's work).

    debt_hours: total hours of unfinished tasks
    requires_recalculation: True when debt exceeds one day's capacity
    """
    # Use build_chapter_plan (same filtering as original analyze) for consistency
    total_hours = days * hours
    chapters = build_chapter_plan(scope, level, total_hours, teacher)
    ch_lookup = {c["name"]: c for c in chapters}
    labels = {1: "今天", 2: "明天"}
    next_day_num = current_day + 1
    label = labels.get(next_day_num, f"第{next_day_num}天")
    unfinished = unfinished_tasks or []

    # Re-generate full plan using the SAME filtered chapters as original analyze
    full_plan = build_daily_plan(chapters, days=days, hours_per_day=hours, teacher=teacher)
    original_next = None
    for d in full_plan:
        if d["day"] == next_day_num:
            original_next = d
            break

    ratio = completed_count / max(total_count, 1)
    completed_enough = ratio >= 0.66

    if completed_enough and original_next:
        return {**original_next, "is_review_day": False, "debt_hours": 0.0, "requires_recalculation": False}

    # ── 计算债务 ──
    debt_hours = round(sum(float(ut.get("hours", 1.0)) for ut in unfinished), 1)
    requires_recalculation = debt_hours >= hours

    # ── 今天正常计划（Day N+1 的全部任务）──
    all_tasks = []

    if original_next and original_next.get("tasks"):
        for t in original_next["tasks"]:
            all_tasks.append({
                "task": t.get("task", ""),
                "hours": float(t.get("hours", 1.0)),
                "chapter": t.get("chapter"),
                "problems": t.get("problems", []),
                "primer": t.get("primer", {}),
            })
    else:
        # 所有计划天数已完成 → 巩固复习日
        all_tasks = _build_consolidation_tasks(chapters, ch_lookup, hours)

    # ── 追赶任务：补昨天没做的，放在正常计划后面 ──
    for ut in unfinished:
        task_text = ut.get("task", "")
        task_hours = float(ut.get("hours", 1.0))
        chapter_name = ut.get("chapter") or ""
        problems = ut.get("problems", [])
        primer = ut.get("primer", {})
        if not primer and chapter_name:
            ch = ch_lookup.get(chapter_name, {})
            primer = {
                "formulas": ch.get("must_formulas", [])[:3],
                "concepts": ch.get("core_topics", [])[:3],
                "mistakes": ch.get("easy_mistakes", [])[:2],
            }

        all_tasks.append({
            "task": f"补：{task_text}",
            "hours": task_hours,
            "chapter": chapter_name or None,
            "problems": problems,
            "primer": primer,
        })

    # Collect formulas from all chapters involved
    day_chapters = set()
    for t in all_tasks:
        if t.get("chapter"):
            day_chapters.add(t["chapter"])
    day_formulas = []
    seen_f = set()
    for ch_name in day_chapters:
        ch = ch_lookup.get(ch_name, {})
        for f in ch.get("must_formulas", []):
            if f not in seen_f:
                seen_f.add(f)
                day_formulas.append(f)

    # 题库匹配：为每个有章节的任务匹配对应题目（与 engine.py 保持一致）
    allowed = {c["name"] for c in chapters}
    for t in all_tasks:
        if t.get("chapter") and not t.get("problems"):
            t["problems"] = match_problems_for_task(t["task"], allowed)

    is_consolidation = original_next is None
    suffix = "巩固复习日" if is_consolidation else "追赶日"

    return {
        "day": next_day_num,
        "label": f"{label} · {suffix}",
        "tasks": all_tasks,
        "day_formulas": day_formulas,
        "is_review_day": True,
        "debt_hours": debt_hours,
        "requires_recalculation": requires_recalculation,
    }
