#!/bin/bash

# 洗衣房预约系统启动脚本
# 这个脚本会清理端口冲突并启动前后端服务

echo "🧺 启动洗衣房预约系统..."

# 清理可能冲突的端口
echo "🔧 清理端口冲突..."
lsof -ti:3000,3001 | xargs kill -9 2>/dev/null || echo "端口已清理"

# 启动后端 (端口 3000)
echo "🚀 启动后端服务器 (端口 3000)..."
cd laundry-backend
npm start &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 启动前端 (端口 3001)
echo "🎨 启动前端应用 (端口 3001)..."
cd ../laundry-frontend
npm start &
FRONTEND_PID=$!

echo "✅ 系统启动完成!"
echo "📱 前端地址: http://localhost:3001"
echo "🔧 后端地址: http://localhost:3000"
echo ""
echo "按 Ctrl+C 停止服务器"

# 等待用户中断
trap 'echo "🛑 正在停止服务器..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT
wait
