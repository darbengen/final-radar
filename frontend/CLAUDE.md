# 前端说明

## A负责的文件
index.html / form.html / loading.html
js/form.js / css/form.css

## B负责的文件
result.html / js/result.js / css/result.css

## 共用文件（都可以改，改之前说一声）
css/base.css / js/api.js / js/config.js

## 调接口方式（统一用这个）
import { analyzeCourse } from './api.js'
const result = await analyzeCourse(formData)

## 数据传递
表单提交后存入：
localStorage.setItem('userInput', JSON.stringify(data))
localStorage.setItem('result', JSON.stringify(result))

结果页读取：
const result = JSON.parse(localStorage.getItem('result'))

## B开发时用这份假数据
const FAKE_RESULT = {
  urgency: {
    level: "高度紧急",
    color: "orange",
    total_hours: 21,
    days: 7,
    hours_per_day: 3
  },
  chapters: [
    { name: "极限与连续", priority: "必学",
      priority_color: "red", suggested_hours: 6, weight_percent: 25 },
    { name: "不定积分", priority: "必学",
      priority_color: "red", suggested_hours: 5, weight_percent: 25 },
    { name: "导数与微分", priority: "重要",
      priority_color: "orange", suggested_hours: 4, weight_percent: 20 },
    { name: "定积分", priority: "重要",
      priority_color: "orange", suggested_hours: 4, weight_percent: 20 },
    { name: "微分中值定理", priority: "次要",
      priority_color: "yellow", suggested_hours: 2, weight_percent: 10 }
  ],
  daily_plan: [
    { day: 1, label: "今天", tasks: [
      { task: "背诵7个等价无穷小替换", hours: 0.5 },
      { task: "洛必达法则做10道题", hours: 2.5 }
    ]},
    { day: 2, label: "明天", tasks: [
      { task: "极限综合练习", hours: 1.5 },
      { task: "导数基本公式背诵", hours: 1.5 }
    ]}
  ],
  must_memorize: {
    formulas: [
      "7个等价无穷小替换",
      "洛必达法则",
      "基本积分公式表",
      "分部积分法",
      "微积分基本定理"
    ],
    problem_types: [
      "0/0型极限 → 等价替换或洛必达",
      "换元积分法3步走",
      "定积分面积计算"
    ]
  },
  ai_advice: {
    warning: "时间不多，别什么都想学",
    core_advice: "极限和积分占卷面50%，先把这两章例题刷完，60分基本稳了",
    quick_win: "找历年真题对题型，先知道考什么再学",
    motivation: "7天够了，很多人靠最后一周翻盘"
  }
}

## 手机端适配
- 设计宽度：375px
- 最小字号：14px
- 按钮最小高度：48px
- 不用hover效果

## 结果页6个区块顺序
1. 紧急诊断卡（urgency）
2. 章节优先级（chapters）
3. 每日计划（daily_plan，默认展示前3天）
4. 必背清单（must_memorize）
5. AI建议（ai_advice）
6. 底部按钮（截图保存+重新填写）
