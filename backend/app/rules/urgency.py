def get_urgency(scope: str, days: int, level: str, hours: int, teacher: str):
    total_hours = days * hours

    scope_risk = {"上册": 48, "下册": 56, "上下册": 82}.get(scope, 60)

    if days <= 1:      days_risk = 98
    elif days <= 2:    days_risk = 90
    elif days <= 4:    days_risk = 78
    elif days <= 7:    days_risk = 62
    elif days <= 14:   days_risk = 40
    elif days <= 21:   days_risk = 25
    else:              days_risk = 15

    level_risk = {"A": 95, "B": 72, "C": 45, "D": 22}.get(level, 72)
    hours_risk = {1: 92, 2: 72, 3: 52, 4: 32, 5: 18}.get(hours, 52)
    teacher_risk = {"A": 35, "B": 30, "C": 72, "D": 60}.get(teacher, 60)

    base_need = {"上册": 42, "下册": 48, "上下册": 80}.get(scope, 48)
    level_mult = {"A": 1.2, "B": 1.0, "C": 0.75, "D": 0.55}.get(level, 1.0)
    teacher_mult = {"A": 0.9, "B": 0.9, "C": 1.15, "D": 1.05}.get(teacher, 1.0)

    required_hours = round(base_need * level_mult * teacher_mult)

    if required_hours > 0:
        gap_risk = min(100, max(0, ((required_hours - total_hours) / required_hours) * 100))
    else:
        gap_risk = 0

    score = round(
        level_risk * 0.30 +
        gap_risk * 0.20 +
        days_risk * 0.18 +
        scope_risk * 0.12 +
        hours_risk * 0.10 +
        teacher_risk * 0.10
    )

    final_score = min(99, max(8, score))

    if final_score >= 85:
        level, color = "极度紧急", "red"
    elif final_score >= 65:
        level, color = "高度紧急", "orange"
    elif final_score >= 40:
        level, color = "适中", "yellow"
    else:
        level, color = "充裕", "green"

    return {
        "level": level,
        "color": color,
        "score": final_score,
        "total_hours": total_hours,
        "required_hours": required_hours,
        "days": days,
        "hours_per_day": hours,
    }
