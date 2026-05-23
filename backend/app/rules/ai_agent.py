"""
MiniMax AI Agent — 分析学生画像，提供个性化题目推荐策略和紧急度修正。

协议：Anthropic Messages（api.minimaxi.com/anthropic）
模型：MiniMax M2.7
"""
import json
import os
import re
import requests

MINIMAX_URL = "https://api.minimaxi.com/anthropic/v1/messages"
MINIMAX_KEY = os.environ.get(
    "MINIMAX_API_KEY",
    "sk-cp-dFlFJiv8H6QCFzGbOeYp6pmDdHPnzHemNhWtdFQHRwRIaKQU9lepsh9obUQ-T7vfakzzL3IwzfSGjpLTQuHQoIj98hNU8yaMu-piA5l--7CYKeT3rpFP6NU"
)
MINIMAX_MODEL = "MiniMax-M2.7"


def _build_student_profile(scope, days, level, hours, teacher, urgency):
    level_map = {
        "A": "完全零基础，课本从没打开过，什么都不会",
        "B": "上过课但课后没复习过，有模糊印象但不扎实",
        "C": "复习过一些章节，有点印象但不够系统",
        "D": "基本掌握了大部分内容，主要需要查漏补缺",
    }
    teacher_map = {
        "A": "老师喜欢出原题/例题改编，背例题很有用",
        "B": "老师严格按PPT出题，PPT就是考试范围",
        "C": "老师喜欢出综合题，题型灵活多变",
        "D": "没有往届参考，不知道老师出题风格",
    }
    return {
        "考试范围": scope,
        "剩余天数": f"{days}天",
        "每天学习时间": f"{hours}小时",
        "总可用时间": f"{days * hours}小时",
        "当前水平": level_map.get(level, level),
        "老师风格": teacher_map.get(teacher, teacher),
        "紧急程度": f"{urgency['level']}（风险分{urgency.get('score', '?')}）",
    }


def call_minimax_agent(scope, days, level, hours, teacher, urgency, chapters):
    """
    调用 MiniMax AI 分析学生画像，返回：
    - score_adjust: 紧急度修正值 (-15 ~ +15)
    - adjust_reason: 修正理由
    - problem_strategy: 题目推荐策略（按章节）
    - insight: 一句话洞察
    """
    profile = _build_student_profile(scope, days, level, hours, teacher, urgency)

    chapter_summary = "\n".join(
        f"- {ch['name']}：优先级{ch.get('priority','?')}，建议{ch.get('suggested_hours',0)}h，权重{ch.get('weight_percent',0)}%"
        for ch in chapters[:6]
    )

    prompt = f"""你是高数期末急救教练。根据学生画像推荐题目策略。

## 学生画像
{json.dumps(profile, ensure_ascii=False, indent=2)}

## 章节
{chapter_summary}

返回纯JSON（不要markdown）：
{{
  "score_adjust": -10到+15的整数,
  "adjust_reason": "一句话",
  "problem_strategy": {{
    "focus_type": "基础计算题/概念理解题/证明题/综合应用题/真题模拟",
    "difficulty_prefer": "基础/中等/挑战",
    "chapter_tips": {{"章节名": "策略一句话"}}
  }},
  "insight": "一句话洞察",
  "study_tip": "一条学习建议"
}}

规则：A级→基础计算题+基础难度，C/D且老师C→综合应用题，老师A/B→真题模拟。chapter_tips只写最重要的2-3章。"""

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {MINIMAX_KEY}",
        "anthropic-version": "2023-06-01",
    }

    body = {
        "model": MINIMAX_MODEL,
        "max_tokens": 1024,
        "temperature": 0.3,
        "messages": [{"role": "user", "content": prompt}],
    }

    try:
        resp = requests.post(MINIMAX_URL, json=body, headers=headers, timeout=12)
        if resp.status_code == 200:
            data = resp.json()
            text = ""
            for block in data.get("content", []):
                if block.get("type") == "text":
                    text = block.get("text", "")
                    break
            if not text:
                text = data.get("content", [{}])[-1].get("text", "")
            return _parse_agent_response(text)
        else:
            print(f"[MiniMax] API error: {resp.status_code} {resp.text[:200]}")
            return _fallback_analysis(level, teacher, urgency, chapters)
    except Exception as e:
        print(f"[MiniMax] Request failed: {e}")
        return _fallback_analysis(level, teacher, urgency, chapters)


def _parse_agent_response(text: str) -> dict:
    """从 AI 返回中提取 JSON"""
    text = re.sub(r'```(?:json)?\s*', '', text)
    text = re.sub(r'```', '', text)

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    m = re.search(r'\{.*\}', text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group())
        except json.JSONDecodeError:
            pass

    m = re.search(r'\{[^{}]*"score_adjust"[^{}]*\}', text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group())
        except json.JSONDecodeError:
            pass

    return {}


def _fallback_analysis(level, teacher, urgency, chapters) -> dict:
    """MiniMax 不可用时的规则兜底"""
    level_score = {"A": 8, "B": 3, "C": -2, "D": -8}.get(level, 0)
    teacher_score = {"A": -3, "B": -4, "C": 5, "D": 2}.get(teacher, 0)
    score_adjust = level_score + teacher_score

    focus = {
        "A": "基础计算题", "B": "基础计算题",
        "C": "综合应用题", "D": "综合应用题"
    }.get(level, "基础计算题")

    if teacher in ("A", "B"):
        focus = "真题模拟"

    diff = {"A": "基础", "B": "基础", "C": "中等", "D": "挑战"}.get(level, "基础")

    active = [ch for ch in chapters if ch.get("suggested_hours", 0) > 0][:3]
    tips = {}
    for ch in active:
        if level in ("A", "B"):
            tips[ch["name"]] = "先背公式再做基础题，不要跳步"
        else:
            tips[ch["name"]] = "重点做综合题，练识别题型入口"

    return {
        "score_adjust": score_adjust,
        "adjust_reason": "基于规则兜底：水平与老师风格综合评估",
        "problem_strategy": {
            "focus_type": focus,
            "difficulty_prefer": diff,
            "chapter_tips": tips,
        },
        "insight": f"学生处于{level}级水平，建议先确保基础分再冲难题",
        "study_tip": "每天先复盘错题再学新内容，避免重复犯错",
    }
