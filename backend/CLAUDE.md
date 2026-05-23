# 后端说明

## 启动命令
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# 如系统有多个 Python，用完整路径：
# /Library/Frameworks/Python.framework/Versions/3.13/bin/uvicorn app.main:app --port 8000

## C负责的文件
app/
├── __init__.py
├── main.py              # FastAPI 入口，只收发
├── schemas.py           # Pydantic 输入输出模型（接口契约）
├── engine.py            # 规则引擎总调度
├── data_loader.py       # 统一加载 content/*.json
└── rules/
    ├── __init__.py
    ├── urgency.py       # 紧急程度判定
    ├── chapters.py      # 章节筛选 + 时间分配
    ├── daily_plan.py    # 每日计划编排
    ├── memorize.py      # 必背公式/题型/易错
    └── ai_advice.py     # AI 建议（v1 纯兜底模板）

## D负责的文件（项目根目录 content/）
content/
├── chapters.json             # 章节目录（上册mock + 下册真实B2）
├── teacher_profiles.json     # 4位老师风格描述
├── daily_task_pool.json      # 早/晚期任务池（含教师分化）
├── seven_day_template.json   # 7天模板
└── must_memorize.json        # 全局必背精选

## 数据流
main.py 收5个字段 → engine.py 调度5个规则 → 返回完整JSON
每个规则函数只做一件事，data_loader.py 负责所有文件读写

## 规则速查

### urgency.py
total_hours = days × hours
<10h 极度紧急, 10-25h 高度紧急, 25-50h 适中, ≥50h 充裕

### chapters.py
- A级：前N章，排除 skip_allowed=True 的章节
- B级：前4章（按权重排序）
- C/D级：全学
- 建议时间 = total_hours × weight × 状态系数 × panic系数
- 状态系数：A=0.8 B=1.0 C=0.9 D=0.7
- panic系数：最高=×1.1 中=×0.9

### daily_plan.py
- 前2/3天：按章节 common_tasks 逐章排任务（每章结束后推进一天）
- 后1/3天：daily_task_pool["late_stage"][teacher] 教师分化任务
- 空缺用 early_review / common_supplement 填充

### memorize.py
- 优先读 must_memorize.json（全局精选）
- A级限3条，B级限5条，C/D不限
- fallback：从每章提取

### ai_advice.py
- v1 纯兜底模板，不接任何外部 API
- 4个紧急度 × 4个老师 = 差异化文案
- 注入 teacher_profiles 的 strategy/quick_win + 章节易错点

## 接口响应格式
见项目根目录 CLAUDE.md 的"接口约定"章节
