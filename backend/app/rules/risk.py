def build_fail_risk(urgency, level, days, hours, scope, teacher):
    total_hours = days * hours

    level_risk_add = {"A": 25, "B": 15, "C": 5, "D": -10}
    teacher_risk_add = {"C": 12, "B": 0, "A": -8, "D": 5}
    scope_risk_add = {"上下册": 15, "下册": 5, "上册": 0}

    if total_hours <= 4:
        time_add = 25
    elif total_hours <= 8:
        time_add = 18
    elif total_hours <= 16:
        time_add = 8
    elif total_hours <= 30:
        time_add = 0
    else:
        time_add = -8

    raw = (
        urgency.get("score", 50)
        + level_risk_add.get(level, 0)
        + teacher_risk_add.get(teacher, 0)
        + scope_risk_add.get(scope, 0)
        + time_add
        - 40
    )
    urgency_index = max(5, min(95, raw))

    estimated_score_now = max(20, min(85, 100 - urgency_index - 5))

    if total_hours <= 6:
        gain = 8
    elif total_hours <= 15:
        gain = 14
    elif total_hours <= 30:
        gain = 18
    else:
        gain = 22

    if level == "A":
        gain += 4
    if teacher in ("A", "B"):
        gain += 3
    elif teacher == "C":
        gain -= 3

    estimated_score_after_plan = min(88, estimated_score_now + gain)
    expected_gain = estimated_score_after_plan - estimated_score_now

    if urgency_index >= 75:
        verdict = "地狱保命模式"
        message = "你的备考覆盖度极低——这不是能力问题，是还没开始覆盖。最后这点时间，只救最可能变成分数的内容。"
    elif urgency_index >= 55:
        verdict = "高压抢分模式"
        message = "时间紧但不是没机会。集中打穿高频考点，比平均用力多拿至少15分。"
    elif urgency_index >= 35:
        verdict = "稳定提分模式"
        message = "节奏在你手里。按计划稳步推进，不贪多、不跳步，分数自然上去。"
    else:
        verdict = "冲分模式"
        message = "底子不错。别满足于及格——你现在的位置，多花一点力气就能拉开差距。"

    return {
        "urgency_index": urgency_index,
        "estimated_score_now": estimated_score_now,
        "estimated_score_after_plan": estimated_score_after_plan,
        "expected_gain": expected_gain,
        "verdict": verdict,
        "message": message,
    }
