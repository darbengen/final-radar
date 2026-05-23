def build_today_mission(daily_plan, risk, triage):
    tasks = []
    if daily_plan:
        first_day = daily_plan[0]
        tasks = first_day.get("tasks", [])[:3]

    must_finish = []
    for t in tasks:
        text = t.get("task", "")
        if "背" in text or "公式" in text:
            rewritten = f"闭卷写出 {text}，写完再对答案，错的标出来"
        elif "题" in text or "练" in text:
            rewritten = f"先独立做 {text}，做完再一起对答案，每个错题写一句错因"
        else:
            rewritten = f"先回忆已知内容，再{text}"
        must_finish.append(rewritten)

    mode = risk.get("verdict", "稳定提分模式")

    must_learn = triage.get("must_learn", [])
    if must_learn:
        main_goal = f"今天主救：{must_learn[0]['name']}"
    else:
        main_goal = "今天主救：最高频章节"

    danger_map = {
        "地狱保命模式": "今天这三件事做完，明天醒来会比今天轻松一截。不做的话，后面的每一天都会更难。",
        "高压抢分模式": "今天拖一下，明天身上会同时压着新内容和旧漏洞。今天搞定，明天只用面对新的。",
        "稳定提分模式": "最亏的不是不学——是学了但不动手做。今天只看不练，明天会忘掉一半。",
        "冲分模式": "警惕舒适区。你已经会的东西再刷一遍不会提分，今天去找你不会的。",
    }
    danger = danger_map.get(mode, "只看不练，明天会忘掉一半")

    drop_map = {
        "地狱保命模式": 10,
        "高压抢分模式": 8,
        "稳定提分模式": 6,
        "冲分模式": 4,
    }
    urgency_drop_if_completed = drop_map.get(mode, 6)

    reward_map = {
        "地狱保命模式": f"今天救完，紧迫指数直降 {urgency_drop_if_completed}%。每完成一项都是在把自己从挂科线往回拉。",
        "高压抢分模式": f"完成后紧迫指数下降 {urgency_drop_if_completed}%。积少成多，几天后你会感谢今天的自己。",
        "稳定提分模式": f"完成后紧迫指数下降 {urgency_drop_if_completed}%。稳稳推进，每一步都算数。",
        "冲分模式": f"完成后紧迫指数下降 {urgency_drop_if_completed}%。你在往上走，别停下来。",
    }
    reward = reward_map.get(mode, f"完成后紧迫指数预计下降 {urgency_drop_if_completed}%")

    return {
        "mode": mode,
        "main_goal": main_goal,
        "must_finish": must_finish,
        "method": "先闭卷回忆、再做题或写公式、最后记录错因",
        "danger": danger,
        "reward": reward,
        "urgency_drop_if_completed": urgency_drop_if_completed,
    }
