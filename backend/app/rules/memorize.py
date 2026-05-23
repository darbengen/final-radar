from app.data_loader import load_must_memorize


def build_must_memorize(chapters, level: str):
    """按考试考点分类列出必背内容，过滤到学生所选章节相关的话题"""
    mm = load_must_memorize()
    topics_data = mm.get("topics", [])

    selected_names = {c.get("name", "") for c in chapters}

    # 章节名 → 考点话题映射（模糊匹配）
    topic_keywords = {
        "极限": "极限与连续",
        "导数": "导数与微分",
        "不定积分": "不定积分",
        "定积分": "定积分及应用",
        "空间解析几何": "空间解析几何",
        "向量": "空间解析几何",
        "多元函数微分": "多元函数微分",
        "偏导": "多元函数微分",
        "二重积分": "二重积分",
        "曲线积分": "曲线积分",
        "曲面积分": "曲线积分",
        "级数": "无穷级数",
        "微分方程": "常微分方程",
    }

    # 确定相关话题
    relevant_topics = set()
    for ch_name in selected_names:
        for kw, topic in topic_keywords.items():
            if kw in ch_name:
                relevant_topics.add(topic)

    # 如果没有匹配到（上册用 mock 章节名），回退到全部包含
    if not relevant_topics:
        relevant_topics = {t["topic"] for t in topics_data}

    # A级限3个话题，B级限5个
    if level == "A":
        max_topics = 3
    elif level == "B":
        max_topics = 5
    else:
        max_topics = None

    filtered = [t for t in topics_data if t["topic"] in relevant_topics]
    if max_topics:
        filtered = filtered[:max_topics]

    # 扁平化：兼容旧版前端
    all_formulas = []
    all_ptypes = []
    all_mistakes = []
    for t in filtered:
        all_formulas.extend(t.get("formulas", []))
        all_ptypes.extend(t.get("problem_types", []))
        all_mistakes.extend(t.get("easy_mistakes", []))

    return {
        "topics": filtered,
        "formulas": all_formulas,
        "problem_types": all_ptypes,
        "easy_mistakes": all_mistakes,
    }
