const API_BASE = typeof API_BASE_URL === 'undefined' ? 'http://localhost:8000' : API_BASE_URL;
const API_ENDPOINT = `${API_BASE}/api/analyze`;
const MISSION_COMPLETE_ENDPOINT = `${API_BASE}/api/mission/complete`;
const FEEDBACK_FORM_URL = window.FEEDBACK_FORM_URL || '';

const FORM_KEY = 'ab_rescue_form';
const RESULT_KEY = 'ab_rescue_result';
const THEME_KEY = 'ab_rescue_theme';
const RESCUE_STATE_KEY = 'rescueState';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const SCOPE_LABELS = { upper: '上册', lower: '下册', both: '上下册' };
const LEVEL_TEXT = {
  A: '课本基本没打开，完全不会',
  B: '上课有去，但还没系统复习',
  C: '复习过一些，有印象但不稳',
  D: '基本掌握，需要查漏补缺'
};
const TEACHER_TEXT = {
  A: '大量原题，背例题很有用',
  B: '严格按 PPT，PPT 就是答案',
  C: '喜欢综合题，题型比较灵活',
  D: '不知道，没有往届参考'
};

const RESCUE_PROFILES = {
  fire: {
    code: 'T-W-B-U',
    name: '极限救火型',
    slogan: '别全学，先抢分。',
    fit: '时间紧、基础弱、范围广、老师难预测。',
    protocol: '停止完整复习，立刻进入高频题型和公式模板抢分。',
    todayTasks: ['整理核心公式', '刷最高频题型', '复盘错题模板'],
    dont: ['从第一章重新看视频', '整理漂亮笔记', '刷低频难题', '临时开一套全新资料'],
    sentence: '你现在不需要完整复习，你需要取舍。'
  },
  focus: {
    code: 'F-O-C-U',
    name: '重点突击型',
    slogan: '你不是不会，是需要排序。',
    fit: '基础还可以，但时间少或范围大。',
    protocol: '先按章节权重排序，把代表题和 PPT 重点打穿。',
    todayTasks: ['看 PPT 标重点', '每章只刷代表题', '限时训练'],
    dont: ['无目的刷题', '临时开新资料', '已经会的题重复刷太多', '一边焦虑一边换计划'],
    sentence: '你最缺的不是努力，是任务排序。'
  },
  basic: {
    code: 'B-A-S-E',
    name: '补基础追赶型',
    slogan: '你还有机会，但不能散学。',
    fit: '时间相对够，但基础不稳。',
    protocol: '每天只补一个薄弱点，立刻用基础题验证。',
    todayTasks: ['补一个最薄弱章节', '做基础题', '复盘公式'],
    dont: ['一上来做综合难题', '只看视频不动笔', '同时开太多章节', '把不会当成放弃理由'],
    sentence: '你还来得及，但必须把学习变窄。'
  },
  steady: {
    code: 'S-A-F-E',
    name: '稳稳上岸型',
    slogan: '你现在要提高上限。',
    fit: '时间够、基础稳、范围小、老师可预测。',
    protocol: '用限时训练和错题分类把稳定性拉高。',
    todayTasks: ['限时训练', '错题分类', '提高计算准确率'],
    dont: ['过度焦虑', '重复低收益基础题', '临考前学复杂新技巧', '因为会一点就不模拟'],
    sentence: '你不是抢救局，你要把能拿的分拿稳。'
  }
};

const DEFAULT_MISSIONS = ['闭卷写出核心公式', '独立做 5 道高频题', '复盘错题并写一句错因'];

const CHAPTER_BANK = {
  upper: [
    {
      name: '极限与连续',
      weight: 0.25,
      difficulty: '高',
      tasks: ['背 7 个等价无穷小', '做 0/0 型极限', '整理间断点模板'],
      formulas: ['等价无穷小替换', '洛必达法则', '左右极限与连续判定'],
      problem_types: ['0/0 型极限', '无穷型极限', '间断点分类']
    },
    {
      name: '导数与微分',
      weight: 0.2,
      difficulty: '中',
      tasks: ['默写求导公式', '做隐函数求导', '做切线法线题'],
      formulas: ['复合函数链式法则', '隐函数求导', "dy=f'(x)dx"],
      problem_types: ['复合函数求导', '隐函数求导', '切线法线']
    },
    {
      name: '不定积分',
      weight: 0.25,
      difficulty: '高',
      tasks: ['背基本积分表', '做换元积分', '做分部积分'],
      formulas: ['基本积分公式', '凑微分法', '分部积分公式'],
      problem_types: ['换元积分', '分部积分', '三角恒等变形']
    },
    {
      name: '定积分及应用',
      weight: 0.2,
      difficulty: '中',
      tasks: ['做牛顿-莱布尼茨公式题', '练定积分换元', '画面积题草图'],
      formulas: ['牛顿-莱布尼茨公式', '定积分换元', '奇偶函数积分性质'],
      problem_types: ['定积分计算', '对称区间积分', '面积应用']
    },
    {
      name: '微分中值定理',
      weight: 0.1,
      difficulty: '中',
      tasks: ['背罗尔定理条件', '做拉格朗日中值定理题', '整理单调性模板'],
      formulas: ['罗尔定理', '拉格朗日中值定理', '单调性与极值判定'],
      problem_types: ['存在性证明', '极值最值', '不等式证明']
    }
  ],
  lower: [
    {
      name: '多元函数微分',
      weight: 0.3,
      difficulty: '高',
      tasks: ['做偏导数计算', '练全微分', '整理极值条件题'],
      formulas: ['偏导数计算规则', '全微分公式', '多元复合函数链式法则'],
      problem_types: ['偏导计算', '复合偏导', '条件极值']
    },
    {
      name: '重积分',
      weight: 0.25,
      difficulty: '高',
      tasks: ['画积分区域', '做交换积分次序', '练极坐标二重积分'],
      formulas: ['二重积分累次积分', '极坐标变换', '积分区域画图法'],
      problem_types: ['区域积分', '极坐标积分', '交换次序']
    },
    {
      name: '级数',
      weight: 0.2,
      difficulty: '中',
      tasks: ['背判别法', '做比值判别法', '默写常用泰勒展开'],
      formulas: ['比较判别法', '比值判别法', '幂级数收敛半径'],
      problem_types: ['正项级数', '交错级数', '幂级数']
    },
    {
      name: '曲线曲面积分',
      weight: 0.15,
      difficulty: '高',
      tasks: ['看曲线积分例题', '做格林公式题', '过一遍曲面积分概念'],
      formulas: ['第一类曲线积分', '第二类曲线积分', '格林公式'],
      problem_types: ['曲线积分', '闭合曲线', '曲面积分']
    },
    {
      name: '微分方程',
      weight: 0.1,
      difficulty: '低',
      tasks: ['做可分离变量方程', '套一阶线性方程公式', '看初值问题模板'],
      formulas: ['可分离变量方程', '一阶线性方程通解', '二阶常系数方程特征根'],
      problem_types: ['可分离变量', '一阶线性', '常系数方程']
    }
  ]
};

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);

  $('#themeToggle')?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(THEME_KEY, next);
    updateThemeIcon(next);
  });
}

function updateThemeIcon(theme) {
  const btn = $('#themeToggle');
  if (btn) btn.textContent = theme === 'light' ? '☾' : '☀';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = theme === 'light' ? '#f7f8fb' : '#000000';
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function safeText(value, fallback = '') {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value);
}

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function safeHtml(value, fallback = '') {
  return safeText(value, fallback)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function getTodayKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function loadRescueState() {
  return readJson(RESCUE_STATE_KEY, null);
}

function saveRescueState(state) {
  writeJson(RESCUE_STATE_KEY, state);
  return state;
}

function clearRescueState() {
  localStorage.removeItem(RESCUE_STATE_KEY);
  localStorage.removeItem(RESULT_KEY);
}

function defaultFormData() {
  return { scope: 'upper', days: 7, level: 'B', hours: 2, teacher: 'A' };
}

function scopeKeyFromLabel(label) {
  if (label === '下册') return 'lower';
  if (label === '上下册') return 'both';
  return 'upper';
}

function readFormData() {
  const raw = readJson(FORM_KEY, {});
  const scope = ['upper', 'lower', 'both'].includes(raw.scope) ? raw.scope : scopeKeyFromLabel(raw.scope);
  return {
    ...defaultFormData(),
    ...raw,
    scope,
    days: clampNumber(raw.days, 1, 30, 7),
    hours: clampNumber(raw.hours, 1, 5, 2)
  };
}

function toApiPayload(input) {
  return {
    scope: SCOPE_LABELS[input.scope] || '上册',
    days: clampNumber(input.days, 1, 30, 7),
    level: input.level || 'B',
    hours: clampNumber(input.hours, 1, 5, 2),
    teacher: input.teacher || 'A'
  };
}

function getRiskLevel(score) {
  if (score >= 85) return { level: '极度紧急', color: 'red' };
  if (score >= 65) return { level: '高度紧急', color: 'orange' };
  if (score >= 40) return { level: '适中', color: 'yellow' };
  return { level: '充裕', color: 'green' };
}

function riskColorFromScore(score) {
  return getRiskLevel(score).color;
}

function calculateUrgency(input) {
  const days = clampNumber(input.days, 1, 30, 7);
  const hours = clampNumber(input.hours, 1, 5, 2);
  const totalHours = days * hours;
  const scopeRisk = { upper: 48, lower: 56, both: 82 }[input.scope] || 55;
  const daysRisk = days <= 1 ? 98 : days <= 2 ? 90 : days <= 4 ? 78 : days <= 7 ? 62 : days <= 14 ? 40 : 22;
  const levelRisk = { A: 95, B: 72, C: 45, D: 22 }[input.level] || 60;
  const hourRisk = { 1: 92, 2: 72, 3: 52, 4: 32, 5: 18 }[hours] || 52;
  const teacherRisk = { A: 35, B: 30, C: 72, D: 60 }[input.teacher] || 55;
  const baseNeed = { upper: 42, lower: 48, both: 80 }[input.scope] || 48;
  const levelMult = { A: 1.2, B: 1, C: 0.75, D: 0.55 }[input.level] || 1;
  const teacherMult = { A: 0.9, B: 0.9, C: 1.15, D: 1.05 }[input.teacher] || 1;
  const requiredHours = Math.round(baseNeed * levelMult * teacherMult);
  const gapRisk = Math.min(100, Math.max(0, ((requiredHours - totalHours) / Math.max(requiredHours, 1)) * 100));
  const score = Math.round(levelRisk * 0.3 + gapRisk * 0.2 + daysRisk * 0.18 + scopeRisk * 0.12 + hourRisk * 0.1 + teacherRisk * 0.1);
  const finalScore = Math.min(99, Math.max(8, score));
  return {
    ...getRiskLevel(finalScore),
    score: finalScore,
    total_hours: totalHours,
    required_hours: requiredHours,
    days,
    hours_per_day: hours
  };
}

function getChapters(scope) {
  if (scope === 'upper') return CHAPTER_BANK.upper.map(ch => ({ ...ch, volume: '上册' }));
  if (scope === 'lower') return CHAPTER_BANK.lower.map(ch => ({ ...ch, volume: '下册' }));
  return [
    ...CHAPTER_BANK.upper.map(ch => ({ ...ch, volume: '上册' })),
    ...CHAPTER_BANK.lower.map(ch => ({ ...ch, volume: '下册' }))
  ];
}

function chooseProfile(input, urgency) {
  const score = safeNumber(urgency.score, 50);
  const weak = ['A', 'B'].includes(input.level);
  const broad = input.scope === 'both';
  const unpredictable = ['C', 'D'].includes(input.teacher);

  if (score >= 85 || input.days <= 2 || (weak && broad && unpredictable)) return RESCUE_PROFILES.fire;
  if (score >= 65 || (input.days <= 7 && (broad || input.level === 'B'))) return RESCUE_PROFILES.focus;
  if (weak || input.level === 'C') return RESCUE_PROFILES.basic;
  return RESCUE_PROFILES.steady;
}

function buildMockChapters(input, urgency) {
  const chapters = getChapters(input.scope).sort((a, b) => b.weight - a.weight);
  const activeLimit = input.level === 'A' ? Math.min(3, chapters.length) : input.level === 'B' ? Math.min(4, chapters.length) : chapters.length;
  return chapters.map((chapter, index) => {
    const active = index < activeLimit;
    const isMust = active && (chapter.weight >= 0.2 || urgency.score >= 80);
    const priority = !active ? '可跳' : isMust ? '必学' : chapter.weight >= 0.12 ? '重要' : '次要';
    const priorityColor = !active ? 'gray' : isMust ? 'red' : chapter.weight >= 0.12 ? 'orange' : 'green';
    return {
      name: chapter.name,
      volume: chapter.volume,
      priority,
      priority_color: priorityColor,
      suggested_hours: active ? Math.max(0.5, Math.round(urgency.total_hours * chapter.weight * 10) / 10) : 0,
      weight_percent: Math.round(chapter.weight * 100),
      difficulty: chapter.difficulty,
      strategy: active ? '先公式模板，再代表题，最后错题复盘。' : '当前阶段低收益，先放弃。',
      common_tasks: chapter.tasks,
      core_topics: chapter.problem_types,
      easy_mistakes: ['公式记混', '步骤跳太快', '计算不验算'],
      must_formulas: chapter.formulas,
      problem_types: chapter.problem_types
    };
  });
}

function buildMockDailyPlan(input, profile, chapters) {
  const days = clampNumber(input.days, 1, 30, 7);
  const dailyHours = clampNumber(input.hours, 1, 5, 2);
  const active = chapters.filter(ch => ch.suggested_hours > 0);
  const plan = [];
  for (let day = 1; day <= days; day += 1) {
    const chapter = active[(day - 1) % Math.max(active.length, 1)] || chapters[0];
    const tasks = profile.todayTasks.map((task, index) => ({
      task: `${task}${chapter?.name ? `：${chapter.name}` : ''}`,
      hours: Math.max(0.5, Math.round((dailyHours / 3) * 10) / 10),
      chapter: chapter?.name || null,
      primer: index === 0 ? {
        formulas: (chapter?.must_formulas || []).slice(0, 3),
        concepts: (chapter?.core_topics || []).slice(0, 3),
        mistakes: (chapter?.easy_mistakes || []).slice(0, 2)
      } : {}
    }));
    plan.push({ day, label: day === 1 ? '今天' : day === 2 ? '明天' : `第 ${day} 天`, tasks });
  }
  return plan;
}

function mockAnalyze(input) {
  const normalized = { ...defaultFormData(), ...input };
  const urgency = calculateUrgency(normalized);
  const profile = chooseProfile(normalized, urgency);
  const chapters = buildMockChapters(normalized, urgency);
  const activeChapters = chapters.filter(ch => ch.suggested_hours > 0).slice(0, normalized.level === 'A' ? 3 : 5);
  const memoTopics = activeChapters.map(ch => ({
    topic: ch.name,
    formulas: (ch.must_formulas || []).slice(0, 3),
    problem_types: (ch.problem_types || ch.core_topics || []).slice(0, 3),
    easy_mistakes: (ch.easy_mistakes || []).slice(0, 2)
  }));

  return {
    urgency,
    chapters,
    today_mission: { must_finish: profile.todayTasks.slice(0, 3) },
    triage: classifyChapters(chapters),
    daily_plan: buildMockDailyPlan(normalized, profile, chapters),
    must_memorize: {
      topics: memoTopics,
      formulas: memoTopics.flatMap(item => item.formulas).slice(0, 12),
      problem_types: memoTopics.flatMap(item => item.problem_types).slice(0, 12),
      easy_mistakes: memoTopics.flatMap(item => item.easy_mistakes).slice(0, 8)
    },
    ai_advice: {
      warning: profile.sentence,
      core_advice: `${profile.slogan} ${profile.protocol}`,
      quick_win: `今天只做：${profile.todayTasks.join('、')}。`,
      motivation: '能上岸的人不是学完所有东西的人，是在最后阶段做对取舍的人。'
    },
    ai_analysis: {
      insight: `你的范围是${SCOPE_LABELS[normalized.scope]}，当前水平为“${LEVEL_TEXT[normalized.level]}”。`,
      study_tip: `老师风格：${TEACHER_TEXT[normalized.teacher]}。`
    },
    meta: {
      generated_by: 'front-end-fallback',
      scope: SCOPE_LABELS[normalized.scope],
      level: normalized.level,
      teacher: normalized.teacher
    }
  };
}

function getResultRisk(result) {
  const direct = result?.risk?.urgency_index;
  if (Number.isFinite(Number(direct))) return clampNumber(direct, 0, 100, 50);
  return clampNumber(result?.urgency?.score, 0, 100, 50);
}

function getMissionTasks(result, profile) {
  const mustFinish = result?.today_mission?.must_finish;
  if (Array.isArray(mustFinish) && mustFinish.length) return mustFinish.slice(0, 3).map(String);
  if (Array.isArray(profile?.todayTasks) && profile.todayTasks.length) return profile.todayTasks.slice(0, 3);
  return DEFAULT_MISSIONS.slice();
}

function initializeRescueState(userInput, result) {
  const normalizedInput = { ...defaultFormData(), ...userInput };
  const normalizedResult = normalizeResult(result, normalizedInput);
  const profile = chooseProfile(normalizedInput, normalizedResult.urgency);
  const currentRisk = getResultRisk(normalizedResult);
  const todayMission = normalizedResult.today_mission || { must_finish: getMissionTasks(normalizedResult, profile) };
  const triage = classifyChapters(normalizedResult.chapters || []);
  const state = {
    userInput: normalizedInput,
    analysisResult: normalizedResult,
    currentRisk,
    currentDay: 1,
    todayMission,
    triage,
    completedTasks: [],
    missionHistory: [],
    lastActiveDate: getTodayKey()
  };
  saveRescueState(state);
  return state;
}

function updateResultWithRescueState(result) {
  const state = loadRescueState();
  if (!state) return result;
  const merged = normalizeResult(state.analysisResult || result, state.userInput || readFormData());
  const risk = clampNumber(state.currentRisk, 0, 100, getResultRisk(merged));
  const riskMeta = getRiskLevel(risk);
  merged.urgency = {
    ...(merged.urgency || {}),
    score: risk,
    level: riskMeta.level,
    color: riskMeta.color
  };
  merged.risk = {
    ...(merged.risk || {}),
    urgency_index: risk
  };
  merged.today_mission = state.todayMission || merged.today_mission;
  merged.triage = classifyChapters(merged.chapters || []);
  // Preserve state-modified daily_plan (may contain hybrid review days)
  const statePlan = state.analysisResult?.daily_plan;
  if (Array.isArray(statePlan) && statePlan.length) {
    merged.daily_plan = statePlan;
  }
  return merged;
}

function calculateLocalRiskDrop(currentRisk, completedCount, totalCount) {
  if (!completedCount || !totalCount) return { drop: 0, newRisk: currentRisk };
  const ratio = completedCount / totalCount;
  const riskDropBase = currentRisk >= 75 ? 10 : currentRisk >= 55 ? 8 : currentRisk >= 35 ? 6 : 4;
  const drop = Math.round(riskDropBase * ratio);
  return {
    drop,
    newRisk: Math.max(5, currentRisk - drop)
  };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function requestBackend(input) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  const payload = toApiPayload(input);
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function requestMissionComplete(payload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(MISSION_COMPLETE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function requestNextDay(payload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`${API_BASE}/api/next-day`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function initLoadingPage() {
  const loadingText = $('#loadingText');
  const slowTip = $('#slowTip');
  if (!loadingText) return;

  const messages = [
    '正在定位你的期末紧迫区',
    '正在匹配高频题型',
    '正在生成今日生存协议',
    '正在删除不该学的内容',
    '正在打开上岸通道'
  ];
  let index = 0;
  const textTimer = setInterval(() => {
    index = (index + 1) % messages.length;
    loadingText.textContent = messages[index];
  }, 850);
  const slowTimer = setTimeout(() => slowTip?.classList.remove('hidden'), 10000);
  const input = readFormData();

  try {
    const started = Date.now();
    const result = await requestBackend(input);
    const elapsed = Date.now() - started;
    if (elapsed < 1400) await sleep(1400 - elapsed);
    const state = initializeRescueState(input, result);
    writeJson(RESULT_KEY, { ...state.analysisResult, _form: input });
    loadingText.textContent = '救援舱已生成';
  } catch (error) {
    console.warn('[Final Rescue OS] Backend failed, using mockAnalyze:', error.message);
    await sleep(900);
    const result = mockAnalyze(input);
    const state = initializeRescueState(input, result);
    writeJson(RESULT_KEY, { ...state.analysisResult, _form: input });
    loadingText.textContent = '已使用前端兜底协议生成计划';
  } finally {
    clearInterval(textTimer);
    clearTimeout(slowTimer);
    await sleep(550);
    window.location.href = 'result.html';
  }
}

function normalizeResult(result, input) {
  const fallback = mockAnalyze(input);
  const chapters = Array.isArray(result?.chapters) && result.chapters.length ? result.chapters : fallback.chapters;
  return {
    ...fallback,
    ...(result || {}),
    urgency: { ...fallback.urgency, ...(result?.urgency || {}) },
    chapters,
    daily_plan: Array.isArray(result?.daily_plan) && result.daily_plan.length ? result.daily_plan : fallback.daily_plan,
    must_memorize: { ...fallback.must_memorize, ...(result?.must_memorize || {}) },
    ai_advice: { ...fallback.ai_advice, ...(result?.ai_advice || {}) },
    ai_analysis: { ...fallback.ai_analysis, ...(result?.ai_analysis || {}) },
    risk: { ...fallback.risk, ...(result?.risk || {}) },
    triage: classifyChapters(chapters),
    today_mission: { ...fallback.today_mission, ...(result?.today_mission || {}) },
    meta: { ...fallback.meta, ...(result?.meta || {}) }
  };
}

function colorToCss(color) {
  return {
    red: '#ff4d6d',
    orange: '#ff9f43',
    yellow: '#ffd166',
    green: '#2fd27d',
    gray: '#8f96a3'
  }[color] || '#67d7ff';
}

function classifyChapters(chapters) {
  const groups = {
    must: { title: '必救区', subtitle: '必须学，不学会死', items: [] },
    score: { title: '抢分区', subtitle: '时间够就冲', items: [] },
    skip: { title: '放弃区', subtitle: '现在别碰', items: [] }
  };

  (chapters || []).forEach((chapter, index) => {
    const priority = safeText(chapter.priority);
    const color = safeText(chapter.priority_color);
    const hours = safeNumber(chapter.suggested_hours, 0);
    if (priority.includes('必') || color === 'red' || index < 2) groups.must.items.push(chapter);
    else if (priority.includes('跳') || priority.includes('了解') || color === 'gray' || hours <= 0) groups.skip.items.push(chapter);
    else groups.score.items.push(chapter);
  });

  if (!groups.skip.items.length && groups.score.items.length > 2) {
    groups.skip.items = groups.score.items.splice(2);
  }
  return groups;
}

function renderContinueEntry() {
  const hero = $('.hero-panel');
  if (!hero) return;
  const state = loadRescueState();
  if (!state) return;

  const history = Array.isArray(state.missionHistory) ? state.missionHistory : [];
  const last = history[history.length - 1];
  const lastDrop = last ? safeNumber(last.drop, 0) : 0;
  const currentDay = Math.max(1, safeNumber(state.currentDay, 1));
  const currentRisk = clampNumber(state.currentRisk, 0, 100, 50);

  hero.innerHTML = `
    <div class="brand-row">
      <span class="brand-mark">FR</span>
      <span class="brand-name">Final Rescue OS</span>
    </div>
    <article class="continue-card">
      <p class="eyebrow">连续作战系统</p>
      <h1>欢迎回来，今天是第 ${currentDay} 天。</h1>
      <p class="hero-copy">当前紧迫指数：<strong>${currentRisk}%</strong><br>今天继续救回一部分。</p>
      <div class="continue-stats">
        <span>继续第 ${currentDay} 天作战</span>
        <span>当前紧迫指数：${currentRisk}%</span>
        <span>上次作战救回：${lastDrop}%</span>
      </div>
      <div class="hero-actions">
        <a class="primary-button magnetic" href="result.html">继续今日作战 <span aria-hidden="true">→</span></a>
        <button class="secondary-button" id="rediagnoseBtn" type="button">重新诊断</button>
      </div>
    </article>
  `;

  $('#rediagnoseBtn')?.addEventListener('click', () => {
    clearRescueState();
    window.location.href = 'form.html';
  });

  const screenRisk = $('.screen-header b');
  if (screenRisk) screenRisk.textContent = String(currentRisk);
}

function initFormPage() {
  const form = $('#studyForm');
  if (!form) return;

  let state = readFormData();
  let currentStep = 1;

  function syncUI() {
    Object.entries(state).forEach(([field, value]) => {
      $$(`[data-field="${field}"]`).forEach(group => {
        $$('[data-value]', group).forEach(btn => {
          btn.classList.toggle('selected', String(btn.dataset.value) === String(value));
        });
      });
    });
    const daysInput = $('#daysInput');
    if (daysInput) daysInput.value = state.days;
  }

  function updateStep(step) {
    currentStep = clampNumber(step, 1, 5, 1);
    $$('.form-step').forEach(el => el.classList.toggle('is-active', Number(el.dataset.step) === currentStep));
    $$('.dot').forEach(dot => dot.classList.toggle('active', Number(dot.dataset.dot) <= currentStep));
    const stepText = $('#stepText');
    if (stepText) stepText.textContent = `SCAN ${String(currentStep).padStart(2, '0')} / 05`;
  }

  $$('.option-card, .list-option', form).forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('[data-field]');
      if (!group) return;
      const field = group.dataset.field;
      state[field] = field === 'hours' ? Number(btn.dataset.value) : btn.dataset.value;
      $$('[data-value]', group).forEach(item => item.classList.toggle('selected', item === btn));
      writeJson(FORM_KEY, state);
    });
  });

  $('#daysInput')?.addEventListener('input', event => {
    state.days = clampNumber(event.target.value, 1, 30, 7);
    writeJson(FORM_KEY, state);
  });

  $$('.next-step', form).forEach(btn => {
    btn.addEventListener('click', () => {
      state.days = clampNumber($('#daysInput')?.value, 1, 30, 7);
      writeJson(FORM_KEY, state);
      updateStep(currentStep + 1);
    });
  });

  $('#backBtn')?.addEventListener('click', () => {
    if (currentStep > 1) updateStep(currentStep - 1);
    else window.location.href = 'index.html';
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    state.days = clampNumber($('#daysInput')?.value, 1, 30, 7);
    writeJson(FORM_KEY, state);
    clearRescueState();
    window.location.href = 'loading.html';
  });

  syncUI();
  updateStep(1);
}

function renderIdentity(result, input, profile) {
  const box = $('#identitySection');
  if (!box) return;
  const urgency = result.urgency || {};
  const score = safeNumber(urgency.score, 50);
  const totalHours = safeNumber(urgency.total_hours, input.days * input.hours);
  const required = safeNumber(urgency.required_hours, 0);
  const gap = totalHours - required;
  const color = colorToCss(urgency.color || riskColorFromScore(score));

  const verdict = score >= 85
    ? '时间极紧，系统已聚焦最高权重章节，请严格按顺序执行。'
    : score >= 65
      ? '时间偏紧，已优先核心章节，完成今日任务即可覆盖最大分值。'
      : score >= 40
        ? '时间可覆盖主要章节，按节奏推进并留复盘时间。'
        : '时间比较充足，建议完整覆盖后做模拟测试查漏。';

  box.innerHTML = `
    <div class="status-bar" style="--status-color:${color}">
      <div class="status-bar-inner">
        <div class="status-identity">
          <span class="status-label">你现在的复习状态</span>
          <span class="status-level">${profile.name}</span>
        </div>
        <div class="status-metrics">
          <span class="status-pill">紧迫 <b>${score}</b></span>
          <span class="status-pill">可用 <b>${totalHours}h</b></span>
          <span class="status-pill">建议 <b>${required || '—'}h</b></span>
          <span class="status-pill">${gap >= 0 ? `富余 ${gap}h` : `缺口 ${Math.abs(gap)}h`}</span>
        </div>
        <div class="status-verdict">${verdict}</div>
      </div>
    </div>
  `;
}

function _getTaskReason(task, chapters, profile) {
  // Generate a short reason why this task was assigned
  const chName = task.chapter || '';
  const ch = (chapters || []).find(c => c.name === chName);
  if (ch) {
    const w = safeNumber(ch.weight_percent, 0);
    if (w >= 25) return `权重 ${w}%，是试卷最高频章节`;
    if (w >= 18) return `权重 ${w}%，属于核心得分区`;
    if (w >= 10) return `权重 ${w}%，可稳定拿分`;
    return '属于基础内容，优先巩固';
  }
  if (task.task && (task.task.includes('公式') || task.task.includes('背诵'))) return '公式是解题基础，必须先记牢';
  if (task.task && (task.task.includes('错题') || task.task.includes('复盘'))) return '错题复盘是最快提分方式';
  return profile.protocol || '系统根据你的复习阶段推荐';
}

function _getCompletionCriteria(task) {
  // Generate completion criteria from task text and primer
  const t = task.task || '';
  const primer = task.primer || {};
  const formulas = primer.formulas || [];
  if (formulas.length > 0) return `能不看书写出 ${formulas.slice(0, 3).join('、')}`;
  if (t.includes('公式')) return '能闭卷默写相关公式';
  if (t.includes('错题') || t.includes('复盘')) return '每道错题都能说出错因';
  if (t.includes('练习') || t.includes('练') || t.includes('题')) return '独立完成，不看答案';
  if (t.includes('背') || t.includes('默写')) return '能闭卷复述';
  return '完成后能用自己的话讲出来';
}

function renderRoadmap(dailyPlan) {
  const box = $('#roadmapSection');
  if (!box) return;
  const plan = Array.isArray(dailyPlan) ? dailyPlan : [];
  if (!plan.length) return;

  box.innerHTML = `
    <section class="result-card roadmap-card">
      <div class="section-title"><span>📋</span><h2>复习路线总览</h2></div>
      <div class="roadmap-timeline">
        ${plan.map((day, di) => {
          const tasks = Array.isArray(day.tasks) ? day.tasks : [];
          // Group tasks by chapter and sum hours
          const chapterHours = {};
          tasks.forEach(t => {
            const ch = t.chapter || '综合复习';
            chapterHours[ch] = (chapterHours[ch] || 0) + safeNumber(t.hours, 0.5);
          });
          const totalH = Object.values(chapterHours).reduce((s, h) => s + h, 0);
          const chapters = Object.entries(chapterHours);
          const isToday = day.label === '今天' || day.label?.startsWith('今天');

          return `
            <div class="roadmap-day${isToday ? ' roadmap-today' : ''}">
              <div class="roadmap-day-head">
                <span class="roadmap-day-num">Day ${day.day}</span>
                <span class="roadmap-day-label">${safeHtml(day.label || `第${day.day}天`)}</span>
                <span class="roadmap-day-hours">${Math.round(totalH)}h</span>
              </div>
              <div class="roadmap-day-chapters">
                ${chapters.map(([chName, chHours]) => `
                  <span class="roadmap-chapter-tag">
                    ${safeHtml(chName, '章节')}
                    <b>${Math.round(chHours * 10) / 10}h</b>
                  </span>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </section>
  `;
}

function renderMissionCheckin(result) {
  const box = $('#todaySection');
  if (!box) return;
  const state = loadRescueState();
  const input = state?.userInput || readFormData();
  const profile = chooseProfile(input, result.urgency || {});
  const currentDay = state ? safeNumber(state.currentDay, 1) : 1;
  const plan = Array.isArray(result.daily_plan) ? result.daily_plan : [];
  const totalDays = plan.length || 7;
  const todayPlan = plan.find(d => d.day === currentDay) || plan[currentDay - 1];
  const chapters = Array.isArray(result.chapters) ? result.chapters : [];

  let allTaskObjects = [];
  if (todayPlan && Array.isArray(todayPlan.tasks) && todayPlan.tasks.length) {
    allTaskObjects = todayPlan.tasks;
  } else {
    const fallbackTexts = getMissionTasks(result, profile);
    allTaskObjects = fallbackTexts.map(t => ({ task: t, hours: 0.5, chapter: null, problems: [], primer: {} }));
  }

  // Separate normal tasks from catch-up (补：) tasks
  const normalTasks = allTaskObjects.filter(t => !(t.task || '').startsWith('补：'));
  const catchupTasks = allTaskObjects.filter(t => (t.task || '').startsWith('补：'));
  const displayNormal = normalTasks.slice(0, 3);

  const completed = new Set(Array.isArray(state?.completedTasks) ? state.completedTasks : []);
  const completedToday = state.completedTodayDay === currentDay;
  const progressPct = Math.round((currentDay / totalDays) * 100);
  const isReviewDay = todayPlan?.is_review_day;
  const label = todayPlan?.label || '今天';
  const debtHours = safeNumber(todayPlan?.debt_hours, 0);
  const requiresRecalc = todayPlan?.requires_recalculation;

  function _renderTaskCard(t, index) {
    const checked = completed.has(t.task) ? 'checked' : '';
    const disabled = completedToday ? 'disabled' : '';
    const isDone = checked && completedToday;
    const probCount = Array.isArray(t.problems) ? t.problems.length : 0;
    const reason = _getTaskReason(t, chapters, profile);
    const criteria = _getCompletionCriteria(t);
    const hours = safeNumber(t.hours, 0.5);
    const minutes = Math.round(hours * 60);
    return `
      <div class="today-task-card${isDone ? ' completed' : ''}">
        <input type="checkbox" class="task-checkbox" value="${safeHtml(t.task)}" ${checked} ${disabled} data-task-index="${index}">
        <div class="task-card-body">
          <p class="task-card-title">${safeHtml(t.task)}</p>
          <div class="task-card-meta">
            <span>⏱ 预计 ${minutes} 分钟</span>
            <span class="task-reason">📌 ${reason}</span>
          </div>
          <p class="task-card-criteria">✅ 完成标准：${criteria}</p>
          ${t.primer && (t.primer.formulas || t.primer.concepts || t.primer.mistakes) ? `
            <div class="task-card-primer">${renderPrimer(t.primer)}</div>` : ''}
          ${probCount > 0 ? `
            <details class="task-card-problems-link">
              <summary>📋 ${probCount} 道配套练习题</summary>
              <div class="tp-list" style="margin-top:8px">${(t.problems || []).map(p => `
                <div class="tp-item">
                  <div class="problem-head"><span class="problem-badge">${safeHtml(p.difficulty, '练习')}</span><span class="problem-id">${safeHtml(p.id, '')}</span></div>
                  <p class="problem-text">${safeHtml(p.problem, '题目加载中')}</p>
                </div>
              `).join('')}</div>
            </details>` : ''}
        </div>
      </div>
    `;
  }

  const isConsolidation = (todayPlan?.label || '').includes('巩固复习');
  const normalCount = displayNormal.length;
  const titleText = isConsolidation ? '考前巩固与状态调整' : `今天先完成这 ${normalCount} 件事`;

  let moduleCopy;
  if (isConsolidation) {
    moduleCopy = '计划任务已全部完成，今天是巩固复习日 — 回顾全科公式、做综合练习、调整状态。';
  } else if (isReviewDay) {
    moduleCopy = '今天正常计划 + 额外补充昨天未完成的内容。';
  } else {
    moduleCopy = '每件事都有原因和完成标准，做完打勾即可。';
  }

  box.innerHTML = `
    <section class="result-card">
      <div class="section-title"><span>01</span><h2>${titleText}</h2></div>
      <p class="module-copy">${moduleCopy}</p>

      ${requiresRecalc ? `
        <div class="recalculate-banner">
          <p>你已经落后 <b>${debtHours} 小时</b>，债务已超过一天的复习量，继续按原计划会越来越被动。</p>
          <button class="primary-button" id="recalculateBtn" type="button">重新评估计划（剩余 ${Math.max(1, totalDays - currentDay + 1)} 天）</button>
        </div>
      ` : (debtHours > 0 ? `
        <div class="debt-notice">
          <p>进度欠了 <b>${debtHours} 小时</b>，下面额外补充了昨天的未完成任务。</p>
        </div>
      ` : '')}

      <div class="today-task-list">
        ${displayNormal.map((t, i) => _renderTaskCard(t, i)).join('')}
      </div>

      ${catchupTasks.length > 0 ? `
        <div class="catchup-section">
          <p class="catchup-heading">补充 — 昨天未完成的 ${catchupTasks.length} 项（欠 ${debtHours}h）</p>
          <div class="today-task-list">
            ${catchupTasks.map((t, i) => _renderTaskCard(t, displayNormal.length + i)).join('')}
          </div>
        </div>
      ` : ''}

      <div class="mission-progress">
        <span>Day ${currentDay} / ${totalDays}</span>
        <div class="mp-bar"><div class="mp-fill" style="width:${progressPct}%"></div></div>
      </div>
      <button class="primary-button full" id="completeMissionBtn" type="button">
        ${completedToday ? '进入下一天计划' : '完成今日任务'}
      </button>
      <div id="missionCompleteFeedback"></div>
    </section>
  `;

  $('#completeMissionBtn')?.addEventListener('click', completeTodayMission);

  // Recalculation: re-run analyze with remaining days
  $('#recalculateBtn')?.addEventListener('click', async () => {
    const btn = $('#recalculateBtn');
    if (!btn) return;
    btn.textContent = '重新评估中...';
    btn.disabled = true;

    const currentState = loadRescueState();
    const input = currentState?.userInput || readFormData();
    const remainingDays = Math.max(1, totalDays - currentDay + 1);

    try {
      const newResult = await requestBackend({ ...input, days: remainingDays });
      if (newResult) {
        const newState = initializeRescueState({ ...input, days: remainingDays }, newResult);
        saveRescueState(newState);
        writeJson(RESULT_KEY, { ...newResult, _form: { ...input, days: remainingDays } });
        window.location.reload();
      }
    } catch (e) {
      console.warn('[Final Rescue OS] Recalculation failed:', e.message);
    } finally {
      btn.textContent = '重新评估计划';
      btn.disabled = false;
    }
  });
}

function renderUrgencySidePanel(urgency) {
  const box = $('#urgencyPanelContent');
  if (!box) return;
  const score = safeNumber(urgency.score, 50);
  const color = colorToCss(urgency.color || riskColorFromScore(score));
  const totalH = safeNumber(urgency.total_hours, 0);
  const requiredH = safeNumber(urgency.required_hours, 0);
  const gap = totalH - requiredH;
  const pct = Math.min(100, Math.max(0, Math.round(score)));

  box.innerHTML = `
    <div style="--status-color:${color}">
      <div class="urgency-side-score" style="color:${color}">${score}<span style="font-size:16px;font-weight:700;color:var(--muted);margin-left:6px;">/ 100</span></div>
      <div class="urgency-side-label">${safeHtml(urgency.level, '紧迫')}</div>
      <div class="urgency-mini-bar"><i style="width:${pct}%"></i></div>
      <div class="urgency-detail">
        可用时间 <b>${totalH}h</b> · 建议复习 <b>${requiredH || '—'}h</b><br>
        ${gap >= 0 ? `时间富余 ${gap}h，可适当扩展复习范围` : `时间缺口 ${Math.abs(gap)}h，需严格聚焦高权重章节`}
      </div>
    </div>
  `;
}

function renderRationale(result, input) {
  const box = $('#rationaleContent');
  if (!box) return;
  const urgency = result.urgency || {};
  const chapters = Array.isArray(result.chapters) ? result.chapters : [];
  const activeCount = chapters.filter(c => safeNumber(c.suggested_hours, 0) > 0).length;
  const totalCount = chapters.length;
  const skippedCount = totalCount - activeCount;
  const totalH = safeNumber(urgency.total_hours, input.days * input.hours);

  const items = [
    `你有 ${safeNumber(input.days, 7)} 天 × 每天 ${safeNumber(input.hours, 2)}h = 共 ${totalH}h 可用复习时间`,
    activeCount < totalCount
      ? `系统从 ${totalCount} 章中筛选了 ${activeCount} 章，暂弃 ${skippedCount} 章低收益内容`
      : `系统覆盖了全部 ${totalCount} 章，按权重排序`,
    '优先安排权重高、提分快的章节，先保基础分再冲难题',
    totalH < 20
      ? '时间较紧，系统优先保分而非追求全覆盖'
      : '按照当前节奏稳步推进，每周留出复盘时间'
  ];

  box.innerHTML = items.map(text => `<div class="rationale-item">${safeHtml(text)}</div>`).join('');
}

function renderStrategy(profile, result) {
  const box = $('#strategyContent');
  if (!box) return;
  const state = loadRescueState();
  const currentDay = state ? safeNumber(state.currentDay, 1) : 1;
  const plan = state?.analysisResult?.daily_plan || [];
  const totalDays = plan.length || 7;
  const remaining = totalDays - currentDay;
  const advice = result.ai_advice || {};
  const chapters = Array.isArray(result.chapters) ? result.chapters : [];

  // Do items: from profile protocol + advice core
  const doItems = [
    profile.protocol,
    advice.core_advice || advice.quick_win || ''
  ].filter(Boolean);

  // Don't items: phase-based
  let dontItems;
  if (remaining <= 1) {
    dontItems = ['不要开新章节', '不要做难题', '不要熬夜', '不要焦虑换计划'];
  } else if (remaining <= 3) {
    dontItems = ['不要跳过错题复盘', '不要只看不练', '不要在已掌握章节花太多时间', '不要跳过公式背诵'];
  } else {
    dontItems = Array.isArray(profile.dont) ? profile.dont : [];
  }

  // Emergency: only if remaining <= 3
  let emergencyItems = null;
  if (remaining <= 1) {
    emergencyItems = [
      '只背最高频公式，至少写出 5 个',
      '只刷必救区代表题，不看新内容',
      '把错题模板写一遍，记住第一步怎么入手',
      '保证睡眠，不要通宵，考试状态 > 多学一点'
    ];
  } else if (remaining <= 3) {
    emergencyItems = [
      '把已学章节的公式过一遍',
      '每天先复盘前一天错题再学新内容',
      '标记最不熟的 2 个知识点，集中攻克'
    ];
  }

  box.innerHTML = `
    <div class="strategy-block do">
      <div class="strategy-label">✅ 先做什么</div>
      <ul class="strategy-items">${doItems.map(s => `<li>${safeHtml(s)}</li>`).join('')}</ul>
    </div>
    <div class="strategy-block dont">
      <div class="strategy-label">❌ 暂时别浪费时间</div>
      <ul class="strategy-items">${dontItems.map(s => `<li>${safeHtml(s)}</li>`).join('')}</ul>
    </div>
    ${emergencyItems ? `
    <div class="strategy-block emergency">
      <div class="strategy-label">⚠️ 如果只剩最后 ${remaining} 天</div>
      <ul class="strategy-items">${emergencyItems.map(s => `<li>${safeHtml(s)}</li>`).join('')}</ul>
    </div>` : ''}
  `;
}

function renderDont(profile) {
  const box = $('#dontSection');
  if (!box) return;
  const state = loadRescueState();
  const currentDay = state ? safeNumber(state.currentDay, 1) : 1;
  const totalDays = (state?.analysisResult?.daily_plan || []).length || 7;
  const remaining = totalDays - currentDay;

  // Phase-based don't list
  let dontItems;
  if (remaining <= 1) {
    dontItems = ['不要开新章节', '不要做难题', '不要熬夜', '不要焦虑换计划'];
  } else if (remaining <= 3) {
    dontItems = ['不要跳过错题复盘', '不要只看不练', '不要在已掌握章节花太多时间', '不要跳过公式背诵'];
  } else {
    dontItems = profile.dont;
  }

  box.innerHTML = `
    <section class="result-card dont-card">
      <div class="section-title"><span>03</span><h2>现在不要做什么</h2></div>
      <p class="module-copy">${remaining <= 3 ? '冲刺阶段，聚焦核心。' : '系统已帮你删除低收益任务。'}</p>
      <div class="dont-list">
        ${dontItems.map(item => `<span>${safeHtml(item)}</span>`).join('')}
      </div>
    </section>
  `;
}

function getChapterProgress(dailyPlan, currentDay) {
  // Returns a map: chapter_name → 'done' | 'active' | 'untouched'
  const status = {};
  if (!Array.isArray(dailyPlan)) return status;

  for (const day of dailyPlan) {
    const d = safeNumber(day.day, 1);
    if (d > currentDay) break;
    const tasks = day.tasks || [];
    for (const t of tasks) {
      const ch = t.chapter;
      if (!ch) continue;
      if (d < currentDay) {
        if (status[ch] !== 'active') status[ch] = 'done';
      } else if (d === currentDay) {
        status[ch] = 'active';
      }
    }
  }
  return status;
}

function renderChapterMap(chapters) {
  const box = $('#chapterSection');
  if (!box) return;
  const state = loadRescueState();
  const currentDay = state ? safeNumber(state.currentDay, 1) : 1;
  const plan = state?.analysisResult?.daily_plan || [];
  const progress = getChapterProgress(plan, currentDay);
  const groups = classifyChapters(chapters || []);

  box.innerHTML = `
    <section class="result-card">
      <div class="section-title"><span>03</span><h2>哪些章节先救，哪些可以放</h2></div>
      <div class="battle-map">
        ${Object.entries(groups).map(([key, group]) => {
          if (!group.items?.length) return '';
          return `
          <article class="map-lane ${key}">
            <div class="lane-head">
              <h3>${safeHtml(group.title)}</h3>
              <p>${safeHtml(group.subtitle)}</p>
            </div>
            <div class="lane-list">
              ${group.items.map(chapter => {
                const chName = chapter.name || '';
                const chProgress = progress[chName] || 'untouched';
                const badge = chProgress === 'done'
                  ? '<span class="chapter-badge done">已攻克</span>'
                  : chProgress === 'active'
                    ? '<span class="chapter-badge active">进行中</span>'
                    : '';
                const w = safeNumber(chapter.weight_percent, 0);
                const h = safeNumber(chapter.suggested_hours, 0);
                const rationale = w >= 25 ? '最高频，优先拿下' : w >= 18 ? '核心得分区' : h > 0 ? '可稳定拿分' : '当前暂放，保分优先';
                return `
                <div class="lane-item ${chProgress}">
                  <div class="lane-item-head">
                    <strong>${safeHtml(chName)}</strong>${badge}
                  </div>
                  <span>${h}h / 权重 ${w}%</span>
                  <small style="color:var(--soft);display:block;margin-top:2px;font-size:12px;">${rationale}</small>
                </div>`;
              }).join('')}
            </div>
          </article>`;
        }).join('')}
      </div>
    </section>
  `;
}

async function completeTodayMission() {
  const state = loadRescueState();
  if (!state) return;

  const checkboxes = $$('.task-checkbox');
  const completedTasks = checkboxes.filter(input => input.checked).map(input => input.value);
  const completedCount = completedTasks.length;
  const totalCount = Math.max(checkboxes.length, 3);
  const currentDay = safeNumber(state.currentDay, 1);
  const oldRisk = clampNumber(state.currentRisk, 0, 100, getResultRisk(state.analysisResult));
  let dropInfo = calculateLocalRiskDrop(oldRisk, completedCount, totalCount);

  // Call mission/complete for risk update
  if (completedCount > 0) {
    try {
      const profile = chooseProfile(state.userInput || readFormData(), state.analysisResult?.urgency || {});
      const mode = profile.name || '';
      const remote = await requestMissionComplete({
        old_urgency_index: oldRisk,
        completed_count: completedCount,
        total_count: totalCount,
        mode,
        urgency_drop_if_completed: oldRisk >= 80 ? 10 : oldRisk >= 60 ? 8 : 6
      });
      const remoteRisk = remote?.new_urgency_index;
      if (Number.isFinite(Number(remoteRisk))) {
        const newRisk = clampNumber(remoteRisk, 0, 100, dropInfo.newRisk);
        dropInfo = { drop: Math.max(0, oldRisk - newRisk), newRisk };
      }
    } catch (error) {
      console.warn('[Final Rescue OS] /api/mission/complete unavailable, using local risk drop:', error.message);
    }
  }

  // Check if completed enough (≥ 2/3)
  const ratio = completedCount / totalCount;
  const completedEnough = ratio >= 0.66;

  // Prepare next-day state
  const totalDays = Array.isArray(state.analysisResult?.daily_plan) ? state.analysisResult.daily_plan.length : 7;
  const nextDay = currentDay + 1;
  const allDone = nextDay > totalDays;

  // If not completed enough AND there are more days, call /api/next-day for a hybrid day
  let updatedPlan = Array.isArray(state.analysisResult?.daily_plan) ? [...state.analysisResult.daily_plan] : [];
  let isReviewDay = false;

  if (!completedEnough && !allDone && updatedPlan.length) {
    const input = state.userInput || readFormData();
    const todayPlan = updatedPlan.find(d => d.day === currentDay) || updatedPlan[currentDay - 1];
    const todayTasks = todayPlan?.tasks || [];

    // Only send UNCHECKED tasks — not the ones the user already did
    const uncheckedTasks = todayTasks.filter(t => !completedTasks.includes(t.task));
    const unfinishedTasks = uncheckedTasks.map(t => ({
      task: t.task || '',
      hours: t.hours || 1.0,
      chapter: t.chapter || '',
      problems: t.problems || [],
      primer: t.primer || {}
    }));
    const previousChapters = [...new Set(uncheckedTasks.map(t => t.chapter).filter(Boolean))];

    try {
      const hybrid = await requestNextDay({
        scope: SCOPE_LABELS[input.scope] || input.scope || '下册',
        days: input.days || 7,
        level: input.level || 'B',
        hours: input.hours || 3,
        teacher: input.teacher || 'D',
        current_day: currentDay,
        completed_count: completedCount,
        total_count: totalCount,
        previous_tasks: unfinishedTasks.map(t => t.task),
        previous_chapters: previousChapters,
        unfinished_tasks: unfinishedTasks
      });
      if (hybrid && hybrid.tasks && hybrid.tasks.length) {
        const idx = updatedPlan.findIndex(d => d.day === nextDay);
        if (idx >= 0) {
          updatedPlan[idx] = { ...updatedPlan[idx], ...hybrid, tasks: hybrid.tasks, day_formulas: hybrid.day_formulas || [] };
        } else {
          updatedPlan.push({ ...hybrid, day: nextDay, label: hybrid.label || `第${nextDay}天 · 追赶日` });
        }
        isReviewDay = hybrid.is_review_day;
      }
    } catch (e) {
      console.warn('[Final Rescue OS] /api/next-day failed, using original plan:', e.message);
    }
  }

  const historyItem = {
    day: currentDay,
    oldRisk,
    newRisk: dropInfo.newRisk,
    drop: dropInfo.drop,
    completedCount,
    completedEnough,
    date: getTodayKey()
  };

  const nextState = {
    ...state,
    currentRisk: dropInfo.newRisk,
    currentDay: allDone ? currentDay : nextDay,
    completedTasks,
    completedTodayDay: currentDay,
    completedTodayTasks: true,
    missionHistory: [...(Array.isArray(state.missionHistory) ? state.missionHistory : []), historyItem],
    lastActiveDate: getTodayKey()
  };

  // Update analysisResult with potentially modified plan
  nextState.analysisResult = {
    ...updateResultRisk(state.analysisResult, nextState.currentRisk),
    daily_plan: updatedPlan
  };
  saveRescueState(nextState);
  writeJson(RESULT_KEY, { ...nextState.analysisResult, _form: nextState.userInput });

  // Re-render
  const result = updateResultWithRescueState(nextState.analysisResult);
  const input = nextState.userInput || readFormData();
  const profile = chooseProfile(input, result.urgency);
  renderIdentity(result, input, profile);
  renderUrgencySidePanel(result.urgency || {});
  renderMissionCompleteCard(dropInfo.drop, oldRisk, dropInfo.newRisk, completedCount, totalCount, completedEnough);
  renderMoreSection(profile, result);

  if (allDone) {
    const planBox = $('#dailyPlan');
    if (planBox) planBox.innerHTML = `
      <div class="day-card day-today" style="text-align:center;padding:40px 24px;">
        <div class="day-head"><b>全部计划已完成</b></div>
        <p style="color:var(--muted);margin-top:12px;">${totalDays} 天救援计划执行完毕。紧迫指数从 ${oldRisk}% 降至 ${dropInfo.newRisk}%。</p>
        <p style="color:var(--accent);margin-top:4px;">去考试吧。你准备好了。</p>
      </div>`;
    const missionBox = $('#todaySection');
    if (missionBox) missionBox.innerHTML = `
      <section class="result-card">
        <div class="section-title"><span>01</span><h2>救援完成</h2></div>
        <p class="module-copy">${totalDays} 天计划已全部完成。紧迫指数下降 ${oldRisk - dropInfo.newRisk}%。</p>
      </section>`;
  } else {
    renderStrategy(profile, result);
    renderChapterMap(result.chapters || []);
    renderRoadmap(updatedPlan);
    renderDailyPlan(updatedPlan);
    renderMissionCheckin(updateResultWithRescueState(nextState.analysisResult));
  }
}

function updateResultRisk(result, risk) {
  const meta = getRiskLevel(risk);
  return {
    ...(result || {}),
    urgency: {
      ...(result?.urgency || {}),
      score: risk,
      level: meta.level,
      color: meta.color
    },
    risk: {
      ...(result?.risk || {}),
      urgency_index: risk
    }
  };
}

function renderMissionCompleteCard(drop, oldRisk, newRisk, completedCount, totalCount, completedEnough) {
  const box = $('#missionCompleteFeedback');
  if (!box) return;

  const completedText = completedCount != null ? `完成了 ${completedCount} / ${totalCount} 个任务` : '';
  const riskText = oldRisk != null && newRisk != null ? `紧迫指数：${oldRisk} → ${newRisk}` : '';
  const catchupText = !completedEnough ? '未完成内容已自动移入明天的追赶计划。' : '';

  box.innerHTML = `
    <div class="mission-complete-card">
      <span class="risk-drop">${drop > 0 ? `-${drop}%` : '0%'}</span>
      <strong>${completedText}${completedText && riskText ? ' · ' : ''}${riskText}</strong>
      ${catchupText ? `<p style="margin:6px 0 0;font-size:13px;color:var(--muted);">${catchupText}</p>` : ''}
    </div>
  `;
}

function renderEmergency(profile) {
  const box = $('#emergencySection');
  if (!box) return;
  const state = loadRescueState();
  const currentDay = state ? safeNumber(state.currentDay, 1) : 1;
  const totalDays = (state?.analysisResult?.daily_plan || []).length || 7;
  const remaining = totalDays - currentDay;

  // Hide emergency panel if more than 3 days left
  if (remaining > 3) {
    box.innerHTML = '';
    return;
  }

  const label = remaining <= 1 ? '我只剩 1 天了，直接告诉我怎么救' : `还剩 ${remaining} 天，紧急预案`;
  const hours = remaining <= 1 ? 6 : remaining * 2;
  const steps = remaining <= 1
    ? [
        `背公式，优先背 ${safeHtml(profile.todayTasks[0])}`,
        '刷高频题，只刷必救区和代表题',
        '错题复盘，写出第一步模板',
        '只看错题和模板，不再开新内容'
      ]
    : [
        `完成今天 ${safeHtml(profile.todayTasks[0])}`,
        `${safeHtml(profile.todayTasks[1] || '复盘今日错题')}`,
        '背诵本章核心公式',
        '标记未掌握题型，明天优先补'
      ];

  box.innerHTML = `
    <section class="result-card emergency-card">
      <button class="primary-button full" id="emergencyBtn" type="button">${label}</button>
      <div class="emergency-panel hidden" id="emergencyPanel">
        <h3>接下来 ${hours} 小时</h3>
        <ol>
          ${steps.map((s, i) => `<li><b>第 ${i + 1} 步：</b>${s}</li>`).join('')}
        </ol>
      </div>
    </section>
  `;
  $('#emergencyBtn')?.addEventListener('click', () => $('#emergencyPanel')?.classList.toggle('hidden'));
}

function renderDailyPlan(plan) {
  const box = $('#dailyPlan');
  if (!box) return;
  if (!plan || !plan.length) return;

  const state = loadRescueState();
  const currentDay = state ? safeNumber(state.currentDay, 1) : 1;
  const totalDays = plan.length;

  // Find the plan entry for the current day
  const today = plan.find(d => d.day === currentDay) || plan[currentDay - 1];
  if (!today) {
    // All days completed
    box.innerHTML = `
      <div class="day-card day-today" style="text-align:center;padding:40px 24px;">
        <div class="day-head"><b>全部计划已完成</b></div>
        <p style="color:var(--muted);margin-top:12px;">${totalDays} 天救援计划执行完毕。去考试吧。</p>
      </div>`;
    return;
  }

  const todayFormulas = today.day_formulas || [];
  const isReviewDay = today.is_review_day;
  const completedToday = state && state.completedTodayTasks && state.completedTodayDay === currentDay;

  let html = '';
  const badge = isReviewDay
    ? '<span class="review-badge">复习日 — 昨天未完成，今天补上</span>'
    : '';

  html += `
    <div class="day-card day-today${completedToday ? ' day-done' : ''}">
      <div class="day-head">
        <b>Day ${safeNumber(today.day, currentDay)} · ${completedToday ? '已完成' : '当天安排'}</b>
        <span>${safeHtml(today.label, '今天')}${!completedToday && currentDay > 1 ? ` · 还剩 ${totalDays - currentDay + 1} 天` : ''}</span>
        ${badge}
      </div>
      <ul class="task-list">
        ${(today.tasks || []).map(task => `
          <li class="task-item">
            <p class="task-main"><strong>${safeNumber(task.hours, 0)}h</strong> ${safeHtml(task.task, '复盘公式与错题')}</p>
            ${renderPrimer(task.primer)}
            ${Array.isArray(task.problems) && task.problems.length ? renderTaskProblems(task.problems) : ''}
          </li>
        `).join('')}
      </ul>
      ${todayFormulas.length ? `
        <div class="day-formulas">
          <b>今日必背公式</b>
          <div class="formula-tags">${todayFormulas.map(f => `<code>${safeHtml(f)}</code>`).join('')}</div>
        </div>` : ''}
    </div>`;

  // Show progress indicator if there are remaining days
  if (currentDay < totalDays) {
    html += `
      <div class="plan-progress" style="margin-top:16px;text-align:center;">
        <span style="color:var(--muted);font-size:13px;">进度：Day ${currentDay} / ${totalDays}</span>
        <div style="background:var(--panel);height:3px;border-radius:3px;margin-top:6px;overflow:hidden;">
          <div style="background:var(--accent);height:100%;width:${(currentDay / totalDays) * 100}%;transition:width .3s;"></div>
        </div>
      </div>`;
  }

  box.innerHTML = html;
}

function renderTaskProblems(problems) {
  return `
    <details class="task-problems">
      <summary>${problems.length} 道匹配题目</summary>
      <div class="tp-list">
        ${problems.map(p => `
          <div class="tp-item">
            <div class="tp-head">
              <span class="tp-badge">${safeHtml(p.difficulty, '练习')}</span>
              <span class="tp-id">${safeHtml(p.id, '')}</span>
            </div>
            <p class="tp-text">${safeHtml(p.problem, '题目')}</p>
            ${p.answer ? `<p class="tp-answer"><b>答案</b> ${safeHtml(p.answer)}</p>` : ''}
          </div>
        `).join('')}
      </div>
    </details>`;
}

function renderPrimer(primer) {
  if (!primer) return '';
  const formulas = primer.formulas || [];
  const concepts = primer.concepts || [];
  const mistakes = primer.mistakes || [];
  if (!formulas.length && !concepts.length && !mistakes.length) return '';
  return `
    <div class="primer-box">
      ${formulas.length ? `<div><b>公式</b>${formulas.map(item => `<code>${safeHtml(item)}</code>`).join('')}</div>` : ''}
      ${concepts.length ? `<div><b>入口</b>${concepts.map(item => `<span>${safeHtml(item)}</span>`).join('')}</div>` : ''}
      ${mistakes.length ? `<div><b>易错</b>${mistakes.map(item => `<span>${safeHtml(item)}</span>`).join('')}</div>` : ''}
    </div>
  `;
}

function renderMemorize(memo) {
  const box = $('#memorizeBox');
  if (!box) return;
  const topics = Array.isArray(memo?.topics) ? memo.topics : [];
  if (topics.length) {
    box.innerHTML = topics.map(topic => `
      <div class="memo-topic">
        <div class="memo-topic-header">${safeHtml(topic.topic, '重点')}</div>
        <div class="memo-topic-cols">
          ${renderMemoColumn('公式 / 定理', topic.formulas)}
          ${renderMemoColumn('题型入口', topic.problem_types)}
          ${renderMemoColumn('常见易错', topic.easy_mistakes)}
        </div>
      </div>
    `).join('');
    return;
  }

  box.innerHTML = `
    ${renderMemoColumn('公式 / 定理', memo?.formulas)}
    ${renderMemoColumn('题型入口', memo?.problem_types)}
    ${renderMemoColumn('常见易错', memo?.easy_mistakes)}
  `;
}

function renderMemoColumn(title, items = []) {
  const safeItems = Array.isArray(items) && items.length ? items : ['暂无数据，先按今日三件事执行'];
  return `
    <div class="memo-col">
      <h4>${title}</h4>
      <ul>${safeItems.slice(0, 8).map(item => `<li>${safeHtml(item)}</li>`).join('')}</ul>
    </div>
  `;
}

function renderAdvice(advice, aiAnalysis) {
  const box = $('#adviceBox');
  if (!box) return;
  const items = [
    ['最需要注意', advice?.warning],
    ['核心建议', advice?.core_advice],
    ['最快提分', advice?.quick_win],
    ['稳定心态', advice?.motivation],
    ['AI 洞察', aiAnalysis?.insight],
    ['学习提示', aiAnalysis?.study_tip]
  ].filter(([, text]) => text);

  box.innerHTML = items.map(([title, text]) => `
    <div class="advice-item"><b>${safeHtml(title)}</b><p>${safeHtml(text)}</p></div>
  `).join('');
}

function renderProblemSection(dailyPlan) {
  const box = $('#problemSection');
  if (!box) return;
  const byChapter = {};
  (dailyPlan || []).forEach(day => {
    (day.tasks || []).forEach(task => {
      (task.problems || []).forEach(problem => {
        const chapter = task.chapter || problem.chapter || '综合练习';
        byChapter[chapter] ||= [];
        if (byChapter[chapter].length < 8) byChapter[chapter].push(problem);
      });
    });
  });

  const chapters = Object.keys(byChapter);
  if (!chapters.length) {
    box.innerHTML = `
      <p class=”module-copy”>后端暂未返回题目，先按章节作战地图的必救区刷代表题。</p>
    `;
    return;
  }

  box.innerHTML = `
    <div class=”problem-groups”>
      ${chapters.map(chapter => `
        <details class="chapter-problem-group">
          <summary>${safeHtml(chapter)} / ${byChapter[chapter].length} 题</summary>
          <div class="cp-list">
            ${byChapter[chapter].map(problem => `
              <div class="problem-item">
                <div class="problem-head">
                  <span class="problem-badge">${safeHtml(problem.difficulty, '练习')}</span>
                  <span class="problem-id">${safeHtml(problem.id, '')}</span>
                </div>
                <p class="problem-text">${safeHtml(problem.problem, '按本章节代表题练习')}</p>
                ${problem.answer ? `<p class="problem-answer"><b>答案</b> ${safeHtml(problem.answer)}</p>` : ''}
              </div>
            `).join('')}
          </div>
        </details>
      `).join('')}
    </div>
  `;
  // Render KaTeX math in problem text (deferred — runs when KaTeX is loaded)
  setTimeout(() => renderMath(box), 200);
}

function renderMoreSection(profile, result) {
  const shareCard = $('#shareCard');
  const historyCard = $('#historyCard');
  const feedbackCard = $('#feedbackCard');
  const score = safeNumber(result?.urgency?.score, 50);

  if (shareCard) {
    shareCard.innerHTML = `
      <b style="display:block;margin-bottom:6px;">🎯 上岸身份卡</b>
      <span>${profile.name} · 紧迫 ${score}</span>
      <p style="margin:6px 0 0;font-size:12px;">${profile.slogan}</p>
    `;
  }

  if (historyCard) {
    const state = loadRescueState();
    const history = Array.isArray(state?.missionHistory) ? state.missionHistory : [];
    historyCard.innerHTML = `
      <b style="display:block;margin-bottom:6px;">📊 作战轨迹</b>
      ${history.length ? history.slice(-3).map(h => `
        <div style="font-size:12px;margin-bottom:4px;">Day ${safeNumber(h.day,1)}：${safeNumber(h.oldRisk,0)}% → ${safeNumber(h.newRisk,0)}% <span style="color:var(--green)">-${safeNumber(h.drop,0)}%</span></div>
      `).join('') : '<span style="font-size:12px;">完成今日任务后显示轨迹</span>'}
    `;
  }

  if (feedbackCard) {
    feedbackCard.innerHTML = `
      <b style="display:block;margin-bottom:6px;">💬 反馈</b>
      <p style="font-size:12px;margin:0;">觉得有用？把结果页截图发给同学。</p>
    `;
  }
}

function renderShare(profile, result) {
  const box = $('#shareSection');
  if (!box) return;
  const score = safeNumber(result.urgency?.score, 50);
  box.innerHTML = `
    <section class="result-card share-card">
      <div class="section-title"><span>ID</span><h2>生成上岸身份卡</h2></div>
      <button class="secondary-button" id="shareBtn" type="button">生成我的上岸身份卡</button>
      <div class="screenshot-card hidden" id="screenshotCard">
        <p>我的上岸身份</p>
        <h3>${profile.name}</h3>
        <span>紧迫指数 ${score}</span>
        <ul>${profile.todayTasks.map(task => `<li>${safeHtml(task)}</li>`).join('')}</ul>
        <strong>${profile.slogan}</strong>
      </div>
    </section>
  `;
  $('#shareBtn')?.addEventListener('click', event => {
    $('#screenshotCard')?.classList.remove('hidden');
    event.currentTarget.textContent = '上岸身份卡已生成，可直接截图';
  });
}

function renderMissionHistory() {
  const box = $('#historySection');
  if (!box) return;
  const state = loadRescueState();
  const history = Array.isArray(state?.missionHistory) ? state.missionHistory : [];
  box.innerHTML = `
    <section class="result-card mission-history">
      <div class="section-title"><span>TR</span><h2>作战轨迹</h2></div>
      ${history.length ? `
        <div class="history-list">
          ${history.map(item => `
            <div class="history-row">
              <span>第 ${safeNumber(item.day, 1)} 天</span>
              <strong>紧迫指数 ${safeNumber(item.oldRisk, 0)}% → ${safeNumber(item.newRisk, 0)}%</strong>
              <b>下降 ${safeNumber(item.drop, 0)}%</b>
            </div>
          `).join('')}
        </div>
      ` : '<p class="module-copy">完成今天任务后，这里会生成你的上岸轨迹。</p>'}
    </section>
  `;
}

function renderFeedback() {
  const box = $('#feedbackSection');
  if (!box) return;
  box.innerHTML = `
    <section class="result-card retention-cta">
      <div>
        <p class="eyebrow">连续作战 CTA</p>
        <h2>想要明天的任务？</h2>
        <p>如果你愿意，我们可以继续帮你生成明天的复习任务。</p>
      </div>
      <div class="cta-actions">
        <button class="primary-button" data-intent="tomorrow" type="button">我要明日计划</button>
        <button class="secondary-button" data-intent="feedback" type="button">我愿意反馈体验</button>
      </div>
    </section>
  `;
  $$('[data-intent]', box).forEach(btn => {
    btn.addEventListener('click', () => {
      alert('已记录你的意向，后续可接入飞书表单/留资系统。');
      if (FEEDBACK_FORM_URL) btn.dataset.feedbackUrl = FEEDBACK_FORM_URL;
    });
  });
}

function initResultPage() {
  if (!$('#identitySection')) return;
  const stored = readJson(RESULT_KEY, null);
  let state = loadRescueState();
  const input = state?.userInput || stored?._form || readFormData();
  let result = stored || state?.analysisResult || mockAnalyze(input);

  if (!state) {
    state = initializeRescueState(input, result);
  }

  result = updateResultWithRescueState(result);
  const profile = chooseProfile(state.userInput || input, result.urgency);
  const source = result.meta?.generated_by || 'unknown';
  const currentDay = safeNumber(state.currentDay, 1);

  // ── Top: compact status bar ──
  renderIdentity(result, state.userInput || input, profile);

  // ── Main column ──
  renderRoadmap(result.daily_plan || []);
  renderMissionCheckin(result);
  renderDailyPlan(result.daily_plan || []);
  renderChapterMap(result.chapters || []);
  renderProblemSection(result.daily_plan || []);

  // ── Sidebar ──
  renderUrgencySidePanel(result.urgency || {});
  renderRationale(result, state.userInput || input);
  renderStrategy(profile, result);
  renderMemorize(result.must_memorize || {});

  // ── Bottom more area ──
  renderMoreSection(profile, result);

  // Update hero to show current day
  const heroH1 = $('.result-hero h1');
  if (heroH1 && currentDay > 1) {
    heroH1.textContent = `第 ${currentDay} 天 · 继续救援。`;
  }

  const heroDiv = $('.result-hero div');
  if (heroDiv && !$('.source-badge', heroDiv)) {
    const badge = document.createElement('span');
    badge.className = `source-badge ${source === 'back-end-rules' ? 'backend' : 'fallback'}`;
    badge.textContent = source === 'back-end-rules' ? '后端 API 已接入' : '前端兜底结果';
    heroDiv.appendChild(badge);
  }

  $('#restartBtn')?.addEventListener('click', () => {
    clearRescueState();
    window.location.href = 'form.html';
  });
  $('#printBtn')?.addEventListener('click', () => window.print());
  $('#copyBtn')?.addEventListener('click', async event => {
    const currentState = loadRescueState();
    const text = JSON.stringify({ result, rescueState: currentState }, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      event.currentTarget.textContent = '已复制 JSON';
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
      event.currentTarget.textContent = '已复制 JSON';
    }
    setTimeout(() => { event.currentTarget.textContent = '复制计划 JSON'; }, 1600);
  });
}

function initHomeMotion() {
  $$('.magnetic').forEach(button => {
    button.addEventListener('pointermove', event => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      button.style.transform = `translate(${x * 0.04}px, ${y * 0.08}px)`;
    });
    button.addEventListener('pointerleave', () => { button.style.transform = ''; });
  });
}

function renderMath(el) {
  if (!el || typeof renderMathInElement === 'undefined') return;
  try {
    renderMathInElement(el, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true },
      ],
      throwOnError: false,
      strict: false,
    });
  } catch (_) {
    // KaTeX not loaded yet, skip silently
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderContinueEntry();
  initHomeMotion();
  initFormPage();
  initLoadingPage();
  initResultPage();
});
