#!/bin/bash
# AI Agent Tycoon Backend - 启动脚本

set -e

echo "=========================================="
echo "  AI Agent Tycoon - Backend Server"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查环境变量文件
if [ ! -f .env ]; then
    echo -e "${RED}错误: .env 文件不存在${NC}"
    echo "请先复制 .env.example 到 .env 并配置环境变量"
    echo "运行: cp .env.example .env"
    exit 1
fi

# 检查Node.js版本
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}错误: 需要 Node.js 20.x 或更高版本${NC}"
    echo "当前版本: $(node -v)"
    exit 1
fi

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}未检测到依赖，正在安装...${NC}"
    pnpm install
fi

# 检查PostgreSQL连接
echo -e "${GREEN}检查数据库连接...${NC}"
if ! psql "$DATABASE_URL" -c '\q' 2>/dev/null; then
    echo -e "${RED}警告: 无法连接到数据库${NC}"
    echo "请确保PostgreSQL正在运行并且配置正确"
    echo "DATABASE_URL: $DATABASE_URL"
fi

# 检查Redis连接
echo -e "${GREEN}检查Redis连接...${NC}"
if ! redis-cli ping > /dev/null 2>&1; then
    echo -e "${RED}警告: 无法连接到Redis${NC}"
    echo "请确保Redis正在运行"
fi

# 构建TypeScript
echo -e "${GREEN}构建TypeScript...${NC}"
pnpm build

# 检查构建结果
if [ ! -d "dist" ]; then
    echo -e "${RED}错误: 构建失败${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}=========================================="
echo "  所有检查通过，准备启动服务器！"
echo "==========================================${NC}"
echo ""
echo "环境: $NODE_ENV"
echo "端口: $PORT"
echo "时间: $(date)"
echo ""

# 启动应用
if [ "$NODE_ENV" = "production" ]; then
    echo -e "${GREEN}启动生产服务器...${NC}"
    node dist/app.js
else
    echo -e "${GREEN}启动开发服务器...${NC}"
    pnpm dev
fi
