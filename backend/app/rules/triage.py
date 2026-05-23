def build_triage(chapters, level, days, hours, teacher):
    total_hours = days * hours

    must_learn = []
    should_learn = []
    can_skip = []

    for ch in chapters:
        priority = ch.get("priority", "")
        entry = {"name": ch["name"]}

        if priority in ("必学", "重要"):
            entry["reason"] = "卷面高频区，短时间投入回报最高"
            must_learn.append(entry)
        elif priority in ("次要", "了解即可"):
            entry["reason"] = "考的概率不低但不是主力，有余力再补"
            should_learn.append(entry)
        else:
            entry["reason"] = "性价比不够——同样的时间花在必学章节上能多拿分"
            can_skip.append(entry)

    if total_hours <= 8:
        can_skip.extend([
            {"name": "复杂证明题", "reason": "一道证明题耗半小时，不如做五道计算题稳拿分"},
            {"name": "冷门压轴题", "reason": "整张卷子可能就一道，投入产出比太低"},
            {"name": "跨章节高难综合题", "reason": "基础没稳之前硬做综合题，效率不到正常的一半"},
        ])
    elif 9 <= total_hours <= 18:
        can_skip.append(
            {"name": "高难压轴题", "reason": "先把基础计算和中档题的分吃稳，压轴题最后再说"}
        )

    if level == "A":
        brutal_truth = "实话：你现在最该做的是把基础计算题救回来，不是挑战难题。基础题占卷面一半以上，拿下了就离及格不远。"
    elif total_hours <= 8:
        brutal_truth = "时间不够完整复习了。但你不需要完整复习——你只需要把最可能考的先救起来。下面是优先级清单。"
    else:
        brutal_truth = "别平均用力。精力像钱，要花在最可能回报你的地方。下面是优先级清单。"

    teacher_warnings = {
        "A": "你老师喜欢出原题和例题改编。把例题模板背熟，考场上等于提前知道题目结构。",
        "B": "你老师按 PPT 出题。PPT 里的定义、例题、标星题是直接考试范围，别跑偏。",
        "C": "你老师喜欢跨章节综合题。但最后阶段先保基础入口，综合题是在基础稳了之后的事。",
    }
    teacher_warning = teacher_warnings.get(teacher, "没往届参考没关系——优先保通用高频题，这些哪个老师都会考。")

    return {
        "brutal_truth": brutal_truth,
        "teacher_warning": teacher_warning,
        "must_learn": must_learn[:5],
        "should_learn": should_learn[:4],
        "can_skip": can_skip[:5],
        "survival_rule": "先保基础计算题，再做中档综合题；先背公式，再刷难题",
    }
