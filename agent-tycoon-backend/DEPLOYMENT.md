# 《AI Agent 大亨：经济战场》- 部署指南

## 📋 部署前准备

### 1. 系统要求

**最低配置**
- CPU: 2核心
- 内存: 4GB RAM
- 存储: 20GB SSD
- 操作系统: Ubuntu 22.04 LTS / CentOS 8+

**推荐配置**
- CPU: 4核心
- 内存: 8GB RAM
- 存储: 50GB SSD
- 操作系统: Ubuntu 22.04 LTS

### 2. 依赖服务

- **Node.js**: 20.x+
- **PostgreSQL**: 16.x+
- **Redis**: 7.x+
- **Git**: 最新版本

---

## 🚀 快速部署

### Step 1: 安装依赖服务

#### 安装 Node.js 20.x
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # 应显示 v20.x.x
npm --version
```

#### 安装 PostgreSQL 16
```bash
sudo apt-get install postgresql-16 postgresql-contrib-16
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### 安装 Redis 7
```bash
sudo apt-get install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

### Step 2: 克隆项目
```bash
cd /opt
sudo git clone https://github.com/your-org/agent-tycoon-backend.git
cd agent-tycoon-backend
```

### Step 3: 安装 Node.js 依赖
```bash
sudo npm install -g pnpm
pnpm install
```

### Step 4: 配置环境变量
```bash
cp .env.example .env
nano .env
# 修改以下配置:
# - DB_PASSWORD: 设置强密码
# - JWT_SECRET: 设置随机密钥
# - REDIS_URL: 如果有密码则配置
```

### Step 5: 初始化数据库
```bash
# 创建数据库
sudo -u postgres psql -c "CREATE DATABASE agent_tycoon;"
sudo -u postgres psql -c "CREATE USER tycoon_user WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE agent_tycoon TO tycoon_user;"

# 执行迁移脚本
sudo -u postgres psql -U tycoon_user -d agent_tycoon -f src/database/migrations/001_initial_schema.sql
```

### Step 6: 构建和启动
```bash
# 构建TypeScript
pnpm build

# 启动应用 (开发模式)
pnpm dev

# 启动应用 (生产模式)
pnpm start
```

### Step 7: 验证部署
```bash
# 检查健康状态
curl http://localhost:3000/health

# 查看API文档
open http://localhost:3000/api-docs
```

---

## 🔧 生产环境配置

### 使用 PM2 管理进程

#### 安装 PM2
```bash
sudo npm install -g pm2
```

#### 创建生态系统文件
```bash
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'agent-tycoon-api',
    script: './dist/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

#### 启动应用
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 使用 Nginx 反向代理

#### 安装 Nginx
```bash
sudo apt-get install nginx
```

#### 配置反向代理
```bash
sudo nano /etc/nginx/sites-available/agent-tycoon
```

```nginx
upstream agent_tycoon_backend {
    server localhost:3000;
}

server {
    listen 80;
    server_name api.agenttycoon.com;

    location / {
        proxy_pass http://agent_tycoon_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

#### 启用配置
```bash
sudo ln -s /etc/nginx/sites-available/agent-tycoon /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 配置 SSL (Let's Encrypt)
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d api.agenttycoon.com
```

---

## 📊 监控和日志

### 日志管理
```bash
# 查看PM2日志
pm2 logs agent-tycoon-api

# 查看应用日志
tail -f logs/app.log

# 查看错误日志
tail -f logs/error.log
```

### 监控指标
```bash
# PM2监控
pm2 monit

# 系统资源
htop

# 数据库连接
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"
```

---

## 🔄 更新部署

### 更新流程
```bash
# 1. 备份数据库
sudo -u postgres pg_dump agent_tycoon > backup_$(date +%Y%m%d).sql

# 2. 拉取最新代码
git pull origin main

# 3. 安装新依赖
pnpm install

# 4. 执行数据库迁移
sudo -u postgres psql -U tycoon_user -d agent_tycoon -f src/database/migrations/XXX_new_migration.sql

# 5. 重新构建
pnpm build

# 6. 重启应用
pm2 restart agent-tycoon-api
```

---

## 🐛 故障排除

### 常见问题

#### 1. 数据库连接失败
```bash
# 检查PostgreSQL状态
sudo systemctl status postgresql

# 检查连接配置
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"

# 测试连接
psql -U tycoon_user -d agent_tycoon -h localhost
```

#### 2. Redis连接失败
```bash
# 检查Redis状态
sudo systemctl status redis

# 测试连接
redis-cli ping
```

#### 3. 端口被占用
```bash
# 查看端口占用
sudo lsof -i :3000

# 杀死进程
sudo kill -9 <PID>
```

#### 4. 权限错误
```bash
# 修改文件权限
sudo chown -R $USER:$USER /opt/agent-tycoon-backend
chmod -R 755 /opt/agent-tycoon-backend
```

---

## 🔐 安全建议

1. **修改默认端口**: 不要使用默认的3000端口
2. **强密码**: 使用强密码和JWT密钥
3. **防火墙**: 只开放必要端口(80, 443, 22)
4. **定期更新**: 保持系统和依赖更新
5. **备份**: 每日备份数据库
6. **监控**: 设置异常告警

---

## 📞 支持

如有问题，请联系:
- GitHub Issues: https://github.com/your-org/agent-tycoon-backend/issues
- Email: support@agenttycoon.com
