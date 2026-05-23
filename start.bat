@echo off
chcp 65001 >nul
cd /d "%~dp0backend"

echo ===== Final Radar =====
echo 正在检查环境...

where python >nul 2>&1
if %errorlevel% neq 0 (
    echo 未找到 Python，请先安装 Python 3
    echo 下载地址：https://www.python.org/downloads/
    pause
    exit /b 1
)

python --version

python -c "import uvicorn" >nul 2>&1
if %errorlevel% neq 0 (
    echo 正在安装依赖...
    python -m pip install -r requirements.txt
)

echo.
echo 启动服务器...
echo 浏览器访问: http://localhost:8000
echo.

start http://localhost:8000
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
pause
