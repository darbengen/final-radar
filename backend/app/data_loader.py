import json
import os

_CONTENT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "content")


def _load_json(filename: str):
    path = os.path.join(_CONTENT_DIR, filename)
    if not os.path.exists(path):
        return {}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_chapters(scope: str) -> list:
    """返回章节列表。下册用真实 B2 数据，上册用 mock。"""
    data = _load_json("chapters.json")

    # 上册 mock（保持结构一致）
    UPPER_MOCK = [
        {
            "id": "CH_U1", "name": "极限与连续", "weight": 0.25, "difficulty": "高",
            "panic_value": "最高", "skip_allowed": False,
            "core_topics": ["极限定义", "极限四则运算", "两个重要极限", "无穷小比较", "连续与间断点", "零点定理"],
            "common_tasks": [
                "极限计算：代入法、因式分解、有理化各练3道",
                "练两个重要极限应用（含幂指函数变形），做5道",
                "练无穷小阶的比较与等价无穷小替换，做5道",
                "练间断点分类判断与连续性讨论，做4道",
                "练零点定理证明方程根的存在性，做3道",
            ],
            "easy_mistakes": [
                "0/0型不能直接代入，要先化简或洛必达",
                "重要极限lim(sinx/x)=1前提是x→0，不是x→∞",
                "可去间断点补充定义后可以连续，但本质还是间断",
                "分段函数分段点必须单独讨论左右极限",
            ],
            "must_formulas": [
                "lim sinx/x = 1 (x→0)",
                "lim(1+1/x)^x = e (x→∞)",
                "f(x)在x0连续 ⇔ lim f(x)=f(x0)",
            ],
        },
        {
            "id": "CH_U2", "name": "导数与微分", "weight": 0.20, "difficulty": "中",
            "panic_value": "高", "skip_allowed": False,
            "core_topics": ["导数定义", "四则求导法则", "复合函数求导", "隐函数求导", "参数方程求导", "对数求导法", "高阶导数", "微分"],
            "common_tasks": [
                "练导数定义求极限（凑增量形式），做5道",
                "练复合函数链式求导与隐函数求导，做6道",
                "练参数方程求导与对数求导法，做4道",
                "练高阶导数计算，做3道",
                "练微分近似计算与几何应用，做3道",
            ],
            "easy_mistakes": [
                "导数定义是lim(f(x+h)-f(x))/h，不是除法",
                "(uv)′ ≠ u′v′，乘积求导必须用乘法法则",
                "隐函数求导对y求导后要乘y′",
                "微分dy=f′(x)dx，不要漏掉dx",
            ],
            "must_formulas": [
                "(uv)′=u′v+uv′",
                "(u/v)′=(u′v-uv′)/v²",
                "dy=f′(x)dx",
            ],
        },
        {
            "id": "CH_U3", "name": "微分中值定理", "weight": 0.10, "difficulty": "中",
            "panic_value": "中", "skip_allowed": True,
            "core_topics": ["罗尔定理", "拉格朗日中值定理", "柯西中值定理", "泰勒公式", "洛必达法则"],
            "common_tasks": [
                "练罗尔定理条件验证与求ξ，做4道",
                "练拉格朗日中值定理证明不等式，做3道",
                "练洛必达法则求极限（含多次洛必达），做6道",
            ],
            "easy_mistakes": [
                "洛必达只适用于0/0和∞/∞，其他形式要先变形",
                "中值定理的条件是充分非必要——不满足条件也可能有ξ",
                "泰勒展开要写清楚余项是o(x^n)还是拉格朗日余项",
            ],
            "must_formulas": [
                "f′(ξ)=(f(b)-f(a))/(b-a)",
                "lim f/g = lim f′/g′（0/0或∞/∞）",
                "f(x)=f(a)+f′(a)(x-a)+f″(a)/2!·(x-a)²+…",
            ],
        },
        {
            "id": "CH_U4", "name": "不定积分", "weight": 0.25, "difficulty": "高",
            "panic_value": "高", "skip_allowed": False,
            "core_topics": ["原函数与不定积分", "基本积分公式", "凑微分法", "第二类换元", "分部积分法", "有理函数积分"],
            "common_tasks": [
                "练凑微分法（第一类换元积分），做8道",
                "练三角换元与根式换元积分，做5道",
                "练分部积分法（反对幂指三选u），做6道",
                "练有理函数分解与积分，做4道",
                "练不定积分混合方法综合，做5道",
            ],
            "easy_mistakes": [
                "不定积分结果必须 +C，漏写扣分",
                "凑微分时符号容易搞反（尤其是d(-x)和d(1/x)）",
                "分部积分选u有优先级：反三角函数 > 对数 > 幂函数 > 指数 > 三角",
                "换元后要换回原变量",
            ],
            "must_formulas": [
                "∫x^n dx = x^(n+1)/(n+1) + C",
                "∫1/x dx = ln|x| + C",
                "∫e^x dx = e^x + C",
                "∫sin x dx = -cos x + C",
            ],
        },
        {
            "id": "CH_U5", "name": "定积分及应用", "weight": 0.20, "difficulty": "中",
            "panic_value": "高", "skip_allowed": False,
            "core_topics": ["定积分定义", "牛顿-莱布尼茨公式", "定积分换元", "分部积分", "对称区间奇偶性", "旋转体体积", "反常积分"],
            "common_tasks": [
                "练定积分换元法（注意换限），做6道",
                "练定积分分部积分与对称区间奇偶化简，做5道",
                "练变上限积分求导，做4道",
                "练旋转体体积计算，做5道",
                "练反常积分审敛与计算，做3道",
            ],
            "easy_mistakes": [
                "定积分换元必须同步换积分上下限",
                "对称区间：奇函数积分为0，偶函数=2倍半区间",
                "旋转体体积V=π∫y²dx，注意y要平方",
                "反常积分要拆成极限形式，不能直接代无穷",
            ],
            "must_formulas": [
                "∫[a,b] f(x)dx = F(b) - F(a)",
                "V = π∫[a,b] y² dx（绕x轴）",
                "d/dx ∫[a,x] f(t)dt = f(x)",
            ],
        },
    ]

    if scope == "上册":
        return UPPER_MOCK
    if scope == "下册":
        return data if isinstance(data, list) else data.get("下册", [])
    return UPPER_MOCK + (data if isinstance(data, list) else data.get("下册", []))


def load_teacher_profile(teacher_id: str) -> dict:
    profiles = _load_json("teacher_profiles.json")
    if isinstance(profiles, list):
        for p in profiles:
            if p.get("id") == teacher_id:
                return p
    return profiles.get(teacher_id, {})


def load_daily_task_pool() -> dict:
    return _load_json("daily_task_pool.json")


def load_must_memorize() -> dict:
    return _load_json("must_memorize.json")


def load_formulas() -> dict:
    """兼容旧接口：从 上册mock + 下册chapters 提取每章的公式和易错点字典"""
    chapters = load_chapters("上下册")
    result = {}
    for ch in chapters:
        result[ch["name"]] = {
            "formulas": ch.get("must_formulas", []),
            "problem_types": ch.get("core_topics", []),
            "easy_mistakes": ch.get("easy_mistakes", []),
        }
    return result


def load_question_bank(chapter: str = None, section: str = None, limit: int = None) -> list:
    """加载题库，可按章节/练习册节筛选"""
    data = _load_json("question_bank.json")
    if not isinstance(data, list):
        return []
    if chapter:
        data = [p for p in data if p.get("chapter") == chapter]
    if section:
        data = [p for p in data if p.get("section") == section]
    if limit:
        data = data[:limit]
    return data


def match_problems_for_task(task_text: str, allowed_chapters: set = None) -> list:
    """根据任务描述从题库匹配对应题目，返回 problem 对象列表。
    allowed_chapters: 限定章节范围，防止上册任务匹配到下册题库"""
    import re
    bank = _load_json("question_bank.json")
    if not isinstance(bank, list):
        return []

    # 限定章节范围
    if allowed_chapters:
        filtered = [p for p in bank if p.get("chapter") in allowed_chapters]
        # 章节过滤后为空（如上册题库缺失）→ 用全库兜底
        bank = filtered if filtered else bank

    matched = {}

    # 1) 练习册 §X.Y 或 §X.Y-X.Y，可选"第M-N题"
    wb_pattern = re.findall(
        r'练习册[§§]\s*(\d+\.\d+)(?:\s*[-–—]\s*(?:§\s*)?(\d+\.\d+))?.*?(?:第\s*(\d+)\s*[-–—]\s*(\d+)\s*题|第\s*(\d+)\s*题)?',
        task_text
    )
    for m in wb_pattern:
        sec_start, sec_end, num_start, num_end, num_single = m
        sections = _expand_sections(sec_start, sec_end)
        numbers = _expand_numbers(num_start or num_single, num_end)
        for p in bank:
            if p.get("source") != "练习册":
                continue
            if sections and p.get("section") not in sections:
                continue
            if numbers and p.get("number") not in numbers:
                continue
            if sections or numbers:
                matched[p["id"]] = p

    # 2) 模拟卷(X)第Y题 或 模拟卷（X）第Y题
    exam_pattern = re.findall(
        r'模拟卷[（(]\s*([一二三四])\s*[）)]\s*第\s*(\d+)\s*题',
        task_text
    )
    for exam_name, num in exam_pattern:
        src = f"模拟卷({exam_name})"
        for p in bank:
            if p.get("source") == src and p.get("number") == int(num):
                matched[p["id"]] = p

    # 3) 选择(M-N) / 填空(M-N) — late_stage 任务用
    choice_pattern = re.findall(r'(选择|填空|单选)\s*[（(]\s*(\d+)\s*[-–—]\s*(\d+)\s*[）)]', task_text)
    for qtype, n1, n2 in choice_pattern:
        type_map = {"选择": "单选", "单选": "单选", "填空": "填空"}
        target_type = type_map.get(qtype, qtype)
        numbers = set(range(int(n1), int(n2) + 1))
        for p in bank:
            if p.get("type") == target_type and p.get("number") in numbers:
                matched[p["id"]] = p

    # 4) "前三道大题(11-13)" / "大题(11-13)"
    big_pattern = re.findall(r'(?:大题|综合)[^)]*[（(]\s*(\d+)\s*[-–—]\s*(\d+)\s*[）)]', task_text)
    for n1, n2 in big_pattern:
        numbers = set(range(int(n1), int(n2) + 1))
        for p in bank:
            if p.get("type") in ("综合",) and p.get("number") in numbers:
                matched[p["id"]] = p

    # 5) "模拟卷（一）" 全卷引用 → 匹配该卷所有题
    full_exam = re.findall(r'模拟卷[（(]\s*([一二三四])\s*[）)]', task_text)
    if full_exam and not exam_pattern:
        for exam_name in full_exam:
            src = f"模拟卷({exam_name})"
            for p in bank:
                if p.get("source") == src:
                    matched[p["id"]] = p

    # 输出时只保留关键字段，控制响应体积
    result = []
    for pid, p in sorted(matched.items()):
        result.append({
            "id": pid,
            "problem": _clean_pdf_text(p.get("problem", "")),
            "answer": _clean_pdf_text(p.get("answer", "")),
            "difficulty": p.get("difficulty", ""),
            "type": p.get("type", ""),
        })

    # 兜底：如果没匹配到任何题，按章节关键词模糊匹配
    if not result:
        result = _keyword_fallback(task_text, bank)

    return result


def _expand_sections(start: str, end: str) -> set:
    """展开节号范围，如 6.2 → {6.2}, 6.3-6.4 → {6.3,6.4}"""
    if not start:
        return set()
    if not end:
        return {start}
    sections = set()
    try:
        parts_s = start.split(".")
        parts_e = end.split(".")
        if len(parts_s) == 2 and len(parts_e) == 2 and parts_s[0] == parts_e[0]:
            for minor in range(int(parts_s[1]), int(parts_e[1]) + 1):
                sections.add(f"{parts_s[0]}.{minor}")
    except (ValueError, IndexError):
        sections.add(start)
    return sections


def _expand_numbers(n_start: str, n_end: str) -> set:
    """展开题号范围"""
    if not n_start:
        return set()
    try:
        s = int(n_start)
        e = int(n_end) if n_end else s
        return set(range(s, e + 1))
    except (ValueError, TypeError):
        return set()


def _clean_pdf_text(text: str) -> str:
    """清洗 PDF 提取产生的 Private Use Area 乱码字符 + 排版瑕疵"""
    if not text:
        return text

    # Greek lowercase via Symbol font (U+F06x-U+F07x range)
    GREEK_MAP = {
        0x61: 'α', 0x62: 'β', 0x63: 'χ', 0x64: 'δ', 0x65: 'ε',
        0x66: 'φ', 0x67: 'γ', 0x68: 'η', 0x69: 'ι', 0x6A: 'ϕ',
        0x6B: 'κ', 0x6C: 'λ', 0x6D: 'μ', 0x6E: 'ν', 0x6F: 'ο',
        0x70: 'π', 0x71: 'θ', 0x72: 'ρ', 0x73: 'σ', 0x74: 'τ',
        0x75: 'υ', 0x76: 'ω', 0x77: 'ω', 0x78: 'ξ', 0x79: 'ψ',
        0x7A: 'ζ',
    }

    # Symbol font math (U+F0Ax-U+F0Fx range)
    SYMBOL_MAP = {
        0xA2: '′', 0xA3: '≤', 0xA5: '∞', 0xAE: '→', 0xB0: '°',
        0xB2: '″', 0xB3: '≥', 0xB4: '×', 0xB5: '∝', 0xB6: '∂',
        0xB7: '•', 0xB8: '÷', 0xB9: '≠', 0xBA: '≡', 0xBB: '≈',
        0xBC: '…', 0xBF: '↵', 0xD0: 'ϒ', 0xD6: '⁄', 0xD7: '×',
        0xE5: '∑', 0xE6: '∴', 0xE7: '∵', 0xE8: '〈', 0xE9: '〈',
        0xEA: '〉', 0xEB: '〉', 0xEC: '∫', 0xED: '⌠', 0xEE: '⎮',
        0xEF: '⎯', 0xF0: '⎰', 0xF1: '⎱', 0xF2: '∫', 0xF6: '∫',
        0xF7: '÷',
    }

    result = []
    for ch in text:
        code = ord(ch)
        if 0xF020 <= code <= 0xF05F:
            result.append(chr(code & 0x7F))
        elif 0xF060 <= code <= 0xF07F:
            lower = code & 0x7F
            result.append(GREEK_MAP.get(lower, ''))
        elif 0xF0A0 <= code <= 0xF0FF:
            lower = code & 0xFF
            mapped = SYMBOL_MAP.get(lower)
            if mapped:
                result.append(mapped)
            elif 0xC0 <= lower <= 0xFF:
                pass
            else:
                result.append(ch)
        else:
            result.append(ch)

    cleaned = ''.join(result)

    # Fix PDF extraction artifacts
    import re
    cleaned = re.sub(r' {2,}', ' ', cleaned)                       # collapse multiple spaces
    cleaned = re.sub(r' ,([a-zA-Zα-ω])', r' \1,', cleaned)        # " ,a" → " a,"
    cleaned = re.sub(r'(cos|sin|tan|lim|log|ln) ,', r'\1 ', cleaned)  # "cos ," → "cos "
    cleaned = re.sub(r'< >', '<>', cleaned)                        # "< >" → "<>"
    cleaned = re.sub(r' ,<', ' <', cleaned)                        # " ,<" → " <"
    cleaned = cleaned.strip()

    # Split MCQ options onto separate lines
    cleaned = _format_mcq(cleaned)

    return cleaned


def _format_mcq(text: str) -> str:
    """Split multiple choice options (A)(B)(C)(D) onto separate lines."""
    import re

    # Match patterns like （A）...（B）... or (A)...(B)... or (A）...（B)...
    # Find all MCQ option markers
    markers = list(re.finditer(r'[（(]\s*[A-E]\s*[）)]', text))

    if len(markers) < 2:
        return text

    # Extract text before first option and the options themselves
    first = markers[0]
    preamble = text[:first.start()].strip()

    options = []
    for i, m in enumerate(markers):
        start = m.start()
        end = markers[i + 1].start() if i + 1 < len(markers) else len(text)
        options.append(text[start:end].strip())

    return preamble + '\n' + '\n'.join(options)


def _keyword_fallback(task_text: str, bank: list, max_results: int = 8) -> list:
    """章节关键词兜底匹配：从任务文本提取关键词，在题库中搜索"""
    import re

    # 提取可能的章节/知识点关键词
    keywords = []
    # 从冒号、加号、顿号、斜杠分隔的内容中提取
    parts = re.split(r'[：:+，,、/\s]+', task_text)
    skip_words = {"练习册", "模拟卷", "限时", "重做", "整理", "只背", "对照", "背诵",
                  "把", "今天", "选择", "填空", "综合", "大题", "回顾", "并", "的"}
    for part in parts:
        part = part.strip()
        if not part or part in skip_words:
            continue
        # 去掉题号/节号引用
        clean = re.sub(r'[§§]\s*\d+\.\d+(\s*[-–—]\s*\d+\.\d+)?', '', part)
        clean = re.sub(r'\d+[-–—]\d+题|第\d+题|^\d+\.\d+$|\(\d+.*?\）|（\d+.*?）', '', clean)
        clean = re.sub(r'练习册|模拟卷[（(][一二三四][）)]|限时|做|只|和|前|后|半', '', clean)
        clean = clean.strip()
        if len(clean) >= 2:
            keywords.append(clean)
        elif len(clean) == 1:
            keywords.append(clean)

    # 按关键词匹配
    scored = []
    for p in bank:
        text = p.get("problem", "") + p.get("topic", "")
        score = 0
        for kw in keywords:
            if len(kw) <= 1:
                continue
            if kw in text:
                score += 1
            elif len(kw) == 2 and all(ch in text for ch in kw):
                score += 0.5
            elif len(kw) >= 3:
                # 长关键词：拆成2字片段匹配
                sub_matches = 0
                for i in range(len(kw) - 1):
                    bigram = kw[i:i+2]
                    if bigram in text:
                        sub_matches += 1
                if sub_matches >= 1:
                    score += sub_matches * 0.3
        if score > 0:
            scored.append((score, p))

    scored.sort(key=lambda x: -x[0])
    result = []
    for score, p in scored[:max_results]:
        result.append({
            "id": p["id"],
            "problem": _clean_pdf_text(p.get("problem", "")),
            "answer": _clean_pdf_text(p.get("answer", "")),
            "difficulty": p.get("difficulty", ""),
            "type": p.get("type", ""),
        })
    return result
