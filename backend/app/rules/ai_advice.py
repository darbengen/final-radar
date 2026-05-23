from app.data_loader import load_teacher_profile, load_formulas


def fallback_advice(urgency_level: str, easy_mistakes: list = None, teacher_hint: str = ""):
    mistakes_hint = ""
    if easy_mistakes:
        top = easy_mistakes[:3]
        mistakes_hint = "常见易错：" + "；".join(top) + "。"

    if urgency_level == "极度紧急":
        return {
            "warning": "时间极少，不要分散精力，只攻最高权重章节。",
            "core_advice": f"现在不要追求完整复习，先把最可能考的章节拿下。优先背公式、看例题、做原题。不会的难题直接跳过，别被一道题拖死。{teacher_hint} {mistakes_hint}",
            "quick_win": "先找历年题和老师PPT，确认最常考题型再开始刷。",
            "motivation": "别慌，最后冲一把，捞分比摆烂强太多。",
        }
    if urgency_level == "高度紧急":
        return {
            "warning": "别什么都想学，先把必学章节学扎实。",
            "core_advice": f"每天按计划完成核心章节，不要频繁换资料。先背公式，再做例题，最后用真题检查。只要必学章节稳定拿分，成绩就能明显提高。{teacher_hint} {mistakes_hint}",
            "quick_win": "必背公式先背完，做题时至少知道往哪个方向走。",
            "motivation": "一周真的能翻盘，前提是今天就开始。",
        }
    if urgency_level == "适中":
        return {
            "warning": "时间还可以，但不要拖到最后三天才开始。",
            "core_advice": f"先按章节顺序建立框架，再集中突破高权重内容。每天留一点时间复盘错题。最后两天用套卷模拟考试节奏。{teacher_hint} {mistakes_hint}",
            "quick_win": "把高频题型整理成模板，考试时直接套。",
            "motivation": "节奏稳住，高数没有你想的那么吓人。",
        }
    return {
        "warning": "时间比较充裕，别只看不练。",
        "core_advice": f"你可以完整过一遍章节内容，但重点还是做题。每学完一章就做对应题型，及时整理错题。最后阶段再集中背公式和刷综合题。{teacher_hint} {mistakes_hint}",
        "quick_win": "用错题本找薄弱点，比盲目刷题更有效。",
        "motivation": "你现在不是救火，是可以认真提分。",
    }


def build_ai_advice(**kwargs):
    chapters = kwargs.get("chapters", [])
    teacher = kwargs.get("teacher", "D")
    profile = load_teacher_profile(teacher)
    formula_data = load_formulas()

    easy_mistakes = []
    for ch in chapters:
        if ch.get("priority") in ["必学", "重要"]:
            bank = formula_data.get(ch.get("name"), {})
            easy_mistakes.extend(bank.get("easy_mistakes", []))

    teacher_hint = profile.get("strategy", "")
    quick_win = profile.get("quick_win", "必背公式先背完，做题时至少知道往哪个方向走。")

    advice = fallback_advice(kwargs["urgency_level"], easy_mistakes, teacher_hint)
    if quick_win and quick_win != advice["quick_win"]:
        advice["quick_win"] = quick_win

    return advice
