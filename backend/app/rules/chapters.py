from app.data_loader import load_chapters, load_teacher_profile

LEVEL_COEFFICIENT = {
    "A": 0.8,
    "B": 1.0,
    "C": 0.9,
    "D": 0.7,
}


def get_priority(chapter: dict, level: str):
    """用 skip_allowed 字段替代旧的 weight 阈值逻辑"""
    if level == "A" and chapter.get("skip_allowed", False):
        return "可跳", "gray"

    weight = chapter.get("weight", 0.15)
    if weight >= 0.20 and level != "D":
        return "必学", "red"

    if weight >= 0.10:
        return "重要", "orange"

    return "次要", "green"


def build_chapter_plan(scope: str, level: str, total_hours: int, teacher: str = "D"):
    chapters = load_chapters(scope)
    chapters = sorted(chapters, key=lambda x: x.get("weight", 0), reverse=True)

    # A 学前三，B 学前四，C/D 全学（结合 skip_allowed）
    if level == "A":
        selected_names = {c.get("name") for c in chapters if not c.get("skip_allowed", False)}
        if not selected_names:
            selected_names = {c.get("name") for c in chapters[:3]}
    elif level == "B":
        selected_names = {c.get("name") for c in chapters[:4]}
    else:
        selected_names = {c.get("name") for c in chapters}

    coefficient = LEVEL_COEFFICIENT[level]
    teacher_profile = load_teacher_profile(teacher)
    strategy = teacher_profile.get("strategy", "全面覆盖不押题")

    result = []
    for chapter in chapters:
        name = chapter.get("name")
        weight = chapter.get("weight", 0.15)
        priority, color = get_priority(chapter, level)

        if name not in selected_names:
            if level == "A":
                priority = "可跳"
                color = "gray"
            elif level == "B":
                priority = "了解即可"
                color = "gray"

        if priority == "可跳":
            suggested_hours = 0
        elif priority == "了解即可":
            suggested_hours = 0.5
        else:
            # panic_value 微调：最高 → ×1.1, 中 → ×0.9
            panic = chapter.get("panic_value", "中")
            panic_mult = 1.1 if panic == "最高" else (0.9 if panic == "中" else 1.0)
            suggested_hours = round(total_hours * weight * coefficient * panic_mult, 1)

        result.append({
            "name": name,
            "priority": priority,
            "priority_color": color,
            "suggested_hours": suggested_hours,
            "weight_percent": int(weight * 100),
            "strategy": strategy,
            "common_tasks": chapter.get("common_tasks", []),
            "core_topics": chapter.get("core_topics", []),
            "easy_mistakes": chapter.get("easy_mistakes", []),
            "must_formulas": chapter.get("must_formulas", []),
        })

    return result
