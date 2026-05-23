from typing import List, Literal
from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    scope: Literal["上册", "下册", "上下册"]
    days: int = Field(ge=1, le=30)
    level: Literal["A", "B", "C", "D"]
    hours: int = Field(ge=1, le=5)
    teacher: Literal["A", "B", "C", "D"]


class Urgency(BaseModel):
    level: str
    color: str
    score: int = 50
    total_hours: int
    required_hours: int = 0
    days: int
    hours_per_day: int


class ChapterResult(BaseModel):
    name: str
    priority: str
    priority_color: str
    suggested_hours: float
    weight_percent: int
    strategy: str = ""
    common_tasks: List[str] = []
    core_topics: List[str] = []
    easy_mistakes: List[str] = []
    must_formulas: List[str] = []


class Task(BaseModel):
    task: str
    hours: float
    chapter: str | None = None
    problems: list = []
    primer: dict = {}


class DailyPlanItem(BaseModel):
    day: int
    label: str
    tasks: List[Task]
    day_formulas: List[str] = []


class TopicMemo(BaseModel):
    topic: str
    formulas: List[str] = []
    problem_types: List[str] = []
    easy_mistakes: List[str] = []


class MustMemorize(BaseModel):
    topics: List[TopicMemo] = []
    formulas: List[str] = []
    problem_types: List[str] = []
    easy_mistakes: List[str] = []


class AIAdvice(BaseModel):
    warning: str
    core_advice: str
    quick_win: str
    motivation: str


class ResponseMeta(BaseModel):
    generated_by: str = "back-end-rules"
    scope: str = ""
    level: str = ""
    teacher: str = ""


class AnalyzeResponse(BaseModel):
    urgency: Urgency
    chapters: List[ChapterResult]
    daily_plan: List[DailyPlanItem]
    must_memorize: MustMemorize
    ai_advice: AIAdvice
    ai_analysis: dict = {}
    risk: dict = {}
    triage: dict = {}
    today_mission: dict = {}
    meta: ResponseMeta = ResponseMeta()


class MissionCompleteRequest(BaseModel):
    old_urgency_index: int
    completed_count: int = 3
    total_count: int = 3
    mode: str = ""
    urgency_drop_if_completed: int = 6


class NextDayRequest(BaseModel):
    scope: str = "下册"
    days: int = 7
    level: str = "B"
    hours: int = 3
    teacher: str = "D"
    current_day: int = 1
    completed_count: int = 0
    total_count: int = 3
    previous_tasks: List[str] = []        # deprecated — task texts, kept for compat
    previous_chapters: List[str] = []     # deprecated — kept for compat
    unfinished_tasks: List[dict] = []     # [{task, chapter, problems, primer}] — only unchecked ones


class NextDayResponse(BaseModel):
    day: int
    label: str
    tasks: List[Task]
    day_formulas: List[str] = []
    is_review_day: bool = False
    debt_hours: float = 0.0
    requires_recalculation: bool = False
