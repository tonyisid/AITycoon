#!/bin/bash
# AI Agent Tycoon - 前端本地测试脚本

set -e

echo "=========================================="
echo "  AI Agent Tycoon - 前端本地测试"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}步骤 1: 检查Node.js环境${NC}"
NODE_VERSION=$(node -v 2>&1)
NPM_VERSION=$(npm -v 2>&1)
echo "Node.js: $NODE_VERSION"
echo "npm: $NPM_VERSION"

if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: Node.js未安装${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}步骤 2: 安装前端依赖${NC}"
cd /root/.openclaw/workspace/agent-tycoon-frontend

# 检查是否已安装
if [ -d "node_modules" ]; then
    echo "依赖已安装，跳过..."
else
    echo "正在安装依赖..."
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ 前端依赖安装成功${NC}"
    else
        echo -e "${RED}✗ 前端依赖安装失败${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}步骤 3: 检查TypeScript配置${NC}"
if [ -f "tsconfig.json" ]; then
    echo "✓ tsconfig.json 存在"
else
    echo -e "${RED}✗ tsconfig.json 不存在${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}步骤 4: 验证Vite配置${NC}"
if [ -f "vite.config.ts" ]; then
    echo "✓ vite.config.ts 存在"
else
    echo -e "${RED}✗ vite.config.ts 不存在${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}步骤 5: 检查环境变量${NC}"
if [ -f ".env" ]; then
    echo "✓ .env 文件存在"
    echo "VITE_API_BASE_URL=$(grep VITE_API_BASE_URL .env || echo '未设置')"
else
    echo -e "${YELLOW}⚠ .env 文件不存在，使用默认配置${NC}"
    echo "VITE_API_BASE_URL=http://localhost:3000/api"
fi

echo ""
echo -e "${GREEN}步骤 6: 检查关键文件${NC}"
CRITICAL_FILES=(
    "src/App.tsx"
    "src/main.tsx"
    "src/pages/HomePage.tsx"
    "src/pages/DashboardPage.tsx"
    "src/pages/MarketPage.tsx"
    "src/pages/LeaderboardPage.tsx"
    "src/pages/PlayerPage.tsx"
    "src/services/api.ts"
    "src/store/index.ts"
    "src/types/index.ts"
)

ALL_FILES_OK=true
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file"
    else
        echo -e "${RED}✗ $file 缺失${NC}"
        ALL_FILES_OK=false
    fi
done

if [ "$ALL_FILES_OK" = false ]; then
    echo -e "${RED}错误: 关键文件缺失${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}步骤 7: 统计代码行数${NC}"
echo "正在统计..."

TS_COUNT=$(find src -name "*.ts" -o -name "*.tsx" | wc -l)
echo "TypeScript文件数: $TS_COUNT"

TOTAL_LINES=$(find src -name "*.ts" -o -name "*.tsx" | xargs wc -l | tail -1 | awk '{print $1}')
echo "总代码行数: $TOTAL_LINES"

echo ""
echo -e "${GREEN}步骤 8: 构建测试${NC}"
echo "正在构建前端应用..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 前端构建成功${NC}"
    echo "构建输出: /root/.openclaw/workspace/agent-tycoon-frontend/dist/"

    # 检查构建输出
    if [ -d "dist" ]; then
        BUILD_SIZE=$(du -sh dist | cut -f1)
        echo "构建大小: $BUILD_SIZE"

        FILE_COUNT=$(find dist -type f | wc -l)
        echo "文件数量: $FILE_COUNT"
    fi
else
    echo -e "${RED}✗ 前端构建失败${NC}"
    exit 1
fi

echo ""
echo "=========================================="
echo "  测试完成！"
echo "=========================================="
echo ""
echo -e "${GREEN}✓ 所有测试通过！${NC}"
echo ""
echo "前端应用已准备就绪！"
echo ""
echo "下一步："
echo "  1. 启动开发服务器: npm run dev"
echo "  2. 启动预览服务器: npm run preview"
echo "  3. 访问应用: http://localhost:5173"
echo ""
echo "注意：由于测试环境没有后端API，"
echo "某些功能可能无法正常工作。"
echo "在生产环境中，需要同时启动后端服务。"
