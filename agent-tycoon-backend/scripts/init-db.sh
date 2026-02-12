#!/bin/bash
# AI Agent Tycoon - 数据库初始化脚本

set -e

echo "=========================================="
echo "  AI Agent Tycoon - 数据库初始化"
echo "=========================================="
echo ""

# 加载环境变量
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "错误: .env 文件不存在"
    exit 1
fi

# 数据库配置
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-agent_tycoon}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-}

echo "数据库配置:"
echo "  主机: $DB_HOST"
echo "  端口: $DB_PORT"
echo "  数据库名: $DB_NAME"
echo "  用户: $DB_USER"
echo ""

# 检查PostgreSQL是否运行
echo "检查PostgreSQL服务..."
if ! pg_isready -h $DB_HOST -p $DB_PORT > /dev/null 2>&1; then
    echo "错误: PostgreSQL未运行或无法连接"
    echo "请确保PostgreSQL正在运行"
    exit 1
fi

echo -e "PostgreSQL运行正常 ✓"
echo ""

# 创建数据库（如果不存在）
echo "检查数据库是否存在..."
DB_EXISTS=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -w $DB_NAME | wc -l)

if [ "$DB_EXISTS" -eq 0 ]; then
    echo "创建数据库: $DB_NAME"
    createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME
    echo -e "数据库创建成功 ✓"
else
    echo "数据库已存在 ✓"
fi

echo ""

# 执行迁移脚本
echo "执行数据库迁移..."
MIGRATION_FILE="src/database/migrations/001_initial_schema.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "错误: 迁移文件不存在: $MIGRATION_FILE"
    exit 1
fi

psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$MIGRATION_FILE"

if [ $? -eq 0 ]; then
    echo -e "数据库迁移成功 ✓"
else
    echo "错误: 数据库迁移失败"
    exit 1
fi

echo ""
echo "=========================================="
echo "  数据库初始化完成！"
echo "=========================================="
echo ""
echo "下一步:"
echo "  1. 配置 .env 文件"
echo "  2. 运行: ./scripts/start.sh"
echo ""
