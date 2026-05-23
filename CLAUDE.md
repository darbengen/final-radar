# 期末雷达 Final Radar · 项目总说明

## 项目背景
这是一个黑客松项目，24小时内完成
帮大学生制定高数期末急救计划
用户填5个问题 → AI生成专属备考方案

## 比赛信息
- 赛道：生活成长赛道
- 评分重点：商业化验证35分 > 产品完成度25分
- 提交截止：周日中午12点

## 技术栈
- 前端：原生 HTML + CSS + JS（不用任何框架）
- 后端：Python FastAPI
- AI：智谱GLM API（open.bigmodel.cn）
- 部署：前端 Vercel，后端 Railway

## 5人分工
- A：frontend/ 首页+表单页+Loading页
- B：frontend/ 结果页 result.html（最重要）
- C：backend/ 规则引擎+API+部署上线（v1 不接 AI，纯规则引擎）
- D：content/ 高数内容库 JSON 文件（独立于 backend，可自行修改）
- E：docs/ PPT+商业化验证材料整理

## 项目结构
final-radar/
├── CLAUDE.md
├── frontend/
│   ├── CLAUDE.md
│   ├── index.html        ← A
│   ├── form.html         ← A
│   ├── loading.html      ← A
│   ├── result.html       ← B
│   ├── css/
│   │   ├── base.css      ← A+E共同定义
│   │   ├── form.css      ← A
│   │   └── result.css    ← B
│   └── js/
│       ├── config.js     ← C建，A+B用
│       ├── api.js        ← C建，A+B用
│       ├── form.js       ← A
│       └── result.js     ← B
├── backend/
│   ├── CLAUDE.md
│   ├── requirements.txt  ← C
│   └── app/
│       ├── __init__.py
│       ├── main.py       ← FastAPI 入口，只收发包
│       ├── schemas.py    ← 输入输出 Pydantic 模型
│       ├── engine.py     ← 规则引擎总调度
│       ├── data_loader.py ← 读 content/*.json
│       └── rules/        ← 每个规则一个文件
│           ├── urgency.py
│           ├── chapters.py
│           ├── daily_plan.py
│           ├── memorize.py
│           └── ai_advice.py
├── content/              ← D 负责，独立于 backend
│   ├── CLAUDE.md
│   ├── chapters.json
│   ├── teacher_profiles.json
│   ├── daily_task_pool.json
│   ├── seven_day_template.json
│   └── must_memorize.json
└── docs/
    └── CLAUDE.md

## 接口约定（禁止擅自修改）

### 前端 → 后端
POST /api/analyze
{
  "scope": "上册",     // "上册"/"下册"/"上下册"
  "days": 7,           // 数字 1-30
  "level": "B",        // "A"/"B"/"C"/"D"
  "hours": 3,          // 1/2/3/4/5
  "teacher": "A"       // "A"/"B"/"C"/"D"
}

### 后端 → 前端
{
  "urgency": {
    "level": "高度紧急",
    "color": "orange",
    "total_hours": 21,
    "days": 7,
    "hours_per_day": 3
  },
  "chapters": [
    {
      "name": "空间解析几何与向量代数",
      "priority": "必学",
      "priority_color": "red",
      "suggested_hours": 4.1,
      "weight_percent": 22,
      "strategy": "优先刷近三年真题和课堂例题...",
      "common_tasks": ["向量数量积...", "平面与直线方程..."],
      "core_topics": ["向量数量积", "向量积", "混合积"],
      "easy_mistakes": ["a×b=a×c 不能推出 b=c"]
    }
  ],
  "daily_plan": [
    {
      "day": 1,
      "label": "今天",
      "tasks": [
        {
          "task": "向量数量积/向量积/混合积各练5道",
          "hours": 1.0,
          "problems": [
            { "id": "WB_6_2_7", "problem": "证明恒等式...", "answer": "", "difficulty": "中等", "type": "证明" }
          ]
        }
      ]
    }
  ],
  "must_memorize": {
    "formulas": ["公式1", "公式2"],
    "problem_types": ["题型1", "题型2"],
    "easy_mistakes": ["易错1", "易错2"]
  },
  "ai_advice": {
    "warning": "最需要注意的事",
    "core_advice": "核心建议",
    "quick_win": "最快提分方法",
    "motivation": "鼓励的话"
  }
}

## 颜色规范
--color-red:     #FF4444;   /* 极度紧急 */
--color-orange:  #FF8800;   /* 高度紧急 */
--color-yellow:  #FFCC00;   /* 适中 */
--color-green:   #44BB44;   /* 充裕 */
--color-primary: #2B5CE6;   /* 主色调 */
--color-bg:      #F5F7FA;   /* 背景色 */
--color-text:    #1A1A1A;   /* 主文字 */

## 规则引擎核心逻辑
total_hours = days × hours
< 10h  → 极度紧急 red
10-25h → 高度紧急 orange
25-50h → 适中 yellow
≥ 50h  → 充裕 green

章节选择：A=前3章（排除skip_allowed），B=前4章，C/D=全学
某章建议时间 = total_hours × 章节权重 × 状态系数 × panic系数
状态系数：A=0.8 / B=1.0 / C=0.9 / D=0.7
panic系数：最高=1.1 / 中=0.9 / 一般=1.0

优先级：A级且skip_allowed=可跳 / weight≥0.20=必学 / weight≥0.10=重要 / 其他=次要
教师风格：A=刷真题 / B=按PPT覆盖 / C=跨章节综合 / D=全面覆盖

## 重要约定
1. 改接口格式必须全员确认
2. 前端调接口统一用 js/api.js
3. 后端数据统一从 content/ 读取（项目根目录，独立于 backend）
4. 本地后端地址：http://localhost:8000
5. 前后端数据传递用 localStorage
6. 启动命令：cd backend && uvicorn app.main:app --port 8000
