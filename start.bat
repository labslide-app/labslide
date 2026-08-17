@echo off
chcp 65001 >nul
title LabSlide 一键启动

echo ==========================================
echo    LabSlide 一键启动（前端 + 后端）
echo ==========================================
echo.

echo [1/2] 正在启动后端服务 (http://localhost:8000) ...
start "LabSlide-后端" cmd /k "cd /d F:\LabSlide\backend && .venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

echo [2/2] 正在启动前端服务 (http://localhost:5173) ...
start "LabSlide-前端" cmd /k "cd /d F:\LabSlide\frontend && set PATH=C:\Program Files\nodejs;%PATH% && npm run dev"

echo.
echo 启动完成！请在浏览器打开： http://localhost:5173
echo.
echo 提示：关闭上面两个弹出的黑色窗口即可停止对应服务。
echo.
pause
