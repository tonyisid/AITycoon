#!/bin/bash
# AI Agent Tycoon - 本地测试脚本（无数据库版本）

echo "=========================================="
echo "  AI Agent Tycoon - 本地测试"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}步骤 1: 安装后端依赖${NC}"
cd /root/.openclaw/workspace/agent-tycoon-backend
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 后端依赖安装成功${NC}"
else
    echo -e "${YELLOW}✗ 后端依赖安装失败${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}步骤 2: 构建后端TypeScript${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 后端构建成功${NC}"
else
    echo -e "${YELLOW}✗ 后端构建失败${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}步骤 3: 安装前端依赖${NC}"
cd /root/.openclaw/workspace/agent-tycoon-frontend
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 前端依赖安装成功${NC}"
else
    echo -e "${YELLOW}✗ 前端依赖安装失败${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}步骤 4: 构建前端${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 前端构建成功${NC}"
else
    echo -e "${YELLOW}✗ 前端构建失败${NC}"
    exit 1
fi

echo ""
echo "=========================================="
echo "  测试完成！"
echo "=========================================="
echo ""
echo "后端构建输出: /root/.openclaw/workspace/agent-tycoon-backend/dist/"
echo "前端构建输出: /root/.openclaw/workspace/agent-tycoon-frontend/dist/"
echo ""
echo -e "${GREEN}✓ 所有构建测试通过！${NC}"
echo ""
echo "注意：由于测试环境没有PostgreSQL和Redis，"
echo "无法运行完整的后端服务。但在生产环境中，"
echo "只需按照DEPLOYMENT.md中的步骤操作即可。"
echo ""
echo "前端预览构建："
echo "cd /root/.openclaw/workspace/agent-tycoon-frontend && npm run preview"
