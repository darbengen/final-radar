#!/bin/bash
cd "$(dirname "$0")/backend"

echo "===== Final Radar 期末雷达 ====="

# 优先用已知可用的 Python，再 fallback
for py in "/Library/Frameworks/Python.framework/Versions/3.13/bin/python3" python3 python; do
    if command -v "$py" &>/dev/null && "$py" --version &>/dev/null; then
        PYTHON="$py"
        break
    fi
done

if [ -z "$PYTHON" ]; then
    echo "❌ 未找到 Python，请先安装 Python 3"
    echo "   下载地址：https://www.python.org/downloads/"
    read -p "按回车退出..."
    exit 1
fi

echo "Python: $($PYTHON --version)"

echo "正在检查/安装依赖..."
$PYTHON -m pip install -r requirements.txt -q 2>/dev/null

echo ""
echo "🚀 启动服务器..."
echo "   浏览器访问: http://localhost:8000"
echo "   按 Ctrl+C 停止"
echo ""

sleep 1
open http://localhost:8000 2>/dev/null || xdg-open http://localhost:8000 2>/dev/null
$PYTHON -m uvicorn app.main:app --host 0.0.0.0 --port 8000
