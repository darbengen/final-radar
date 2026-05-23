from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.schemas import AnalyzeRequest, AnalyzeResponse, MissionCompleteRequest, NextDayRequest, NextDayResponse
from app.engine import analyze
from app.rules.daily_plan import build_next_day

app = FastAPI(title="Final Radar API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Final Radar backend is running"}


@app.post("/api/analyze", response_model=AnalyzeResponse)
def analyze_api(payload: AnalyzeRequest):
    return analyze(payload)


@app.post("/api/mission/complete")
def mission_complete(payload: MissionCompleteRequest):
    if payload.total_count > 0:
        ratio = payload.completed_count / payload.total_count
    else:
        ratio = 1.0

    actual_drop = round(payload.urgency_drop_if_completed * ratio)
    new_urgency_index = max(5, payload.old_urgency_index - actual_drop)

    if actual_drop >= 8:
        message = f"紧迫指数下降 {actual_drop}%。今天救回来了。"
    elif actual_drop >= 5:
        message = f"紧迫指数下降 {actual_drop}%。今天有效果。"
    elif actual_drop >= 1:
        message = f"紧迫指数下降 {actual_drop}%。明天继续。"
    else:
        message = "今天任务没完成，紧迫指数没变，明天加油。"

    if payload.mode == "地狱保命模式":
        next_action = "明天继续复盘今天的内容，不要开新章节"
    elif payload.mode == "高压抢分模式":
        next_action = "明天复盘今天内容10分钟，再推进下一章"
    else:
        next_action = "明天先复盘今天内容，再继续计划"

    return {
        "old_urgency_index": payload.old_urgency_index,
        "new_urgency_index": new_urgency_index,
        "drop": actual_drop,
        "message": message,
        "next_action": next_action,
    }


@app.post("/api/next-day", response_model=NextDayResponse)
def next_day(payload: NextDayRequest):
    return build_next_day(
        scope=payload.scope,
        days=payload.days,
        level=payload.level,
        hours=payload.hours,
        teacher=payload.teacher,
        current_day=payload.current_day,
        completed_count=payload.completed_count,
        total_count=payload.total_count,
        previous_tasks=payload.previous_tasks,
        previous_chapters=payload.previous_chapters,
        unfinished_tasks=payload.unfinished_tasks,
    )


# 前端静态文件 — 必须在 API 路由之后注册，否则会拦截 /api/*
# 尝试多个路径：项目根目录 / 与 backend 同级
_base = Path(__file__).resolve().parent.parent.parent  # 项目根 final-radar/
_frontend_dir = _base / "frontend"
if not _frontend_dir.exists():
    _frontend_dir = Path(__file__).resolve().parent.parent / "frontend"  # 与 backend 同级
if _frontend_dir.exists():
    app.mount("/", StaticFiles(directory=str(_frontend_dir), html=True), name="frontend")
