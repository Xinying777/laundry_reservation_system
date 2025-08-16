#!/bin/bash

# 洗衣房预约系统停止脚本

echo "🛑 停止洗衣房预约系统..."

# 停止前后端服务器
echo "🔧 停止React开发服务器..."
pkill -f "react-scripts" 2>/dev/null || echo "React服务器已停止"

echo "🔧 停止Node.js后端服务器..."
lsof -ti:3000,3001 | xargs kill -9 2>/dev/null || echo "后端服务器已停止"

echo "✅ 所有服务已停止"
