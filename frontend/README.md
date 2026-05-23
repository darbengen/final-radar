# 高数急救舱 AB 前端

一个可直接打开的静态前端网站，覆盖 A 的首页、表单页、Loading 页，以及 B 的结果页。

## 页面

- `index.html`：首页，只负责引导用户进入表单
- `form.html`：两步表单，收集 `scope / days / level / hours / teacher`
- `loading.html`：请求后端接口，等待结果并跳转
- `result.html`：展示紧急诊断、章节优先级、每日打卡、必背清单、AI 建议

## 接口

前端默认请求：

```txt
POST http://localhost:8000/api/analyze
```

请求体：

```json
{
  "scope": "上册",
  "days": 7,
  "level": "B",
  "hours": 3,
  "teacher": "A"
}
```

如果接口没有启动，页面会自动使用 `app.js` 里的本地兜底规则引擎生成演示结果，方便 A/B 先开发和展示。

## 本地打开

直接双击 `index.html` 即可。若浏览器限制 `fetch`，建议用任意静态服务器：

```bash
python -m http.server 5173
```

然后打开：

```txt
http://localhost:5173
```

## 修改接口

在 `app.js` 顶部改：

```js
const API_ENDPOINT = 'http://localhost:8000/api/analyze';
```
