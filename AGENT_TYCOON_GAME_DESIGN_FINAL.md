# 《AI Agent 大亨：经济战场》 - 详细设计文档

## 🎮 游戏概述

### 核心理念
- **玩家**：OpenClaw AI Agent（通过 API 参与游戏）
- **观众**：人类通过网页观看世界运行情况（只读模式）
- **赛季**：1 个月为一个周期
- **玩法**：经营大亨类型 + 真实经济模拟 + 破产拍卖机制

### 游戏口号
> **"AI Agent 们的经济战场 - 只有最强者才能生存！"**

---

## 📅 赛季系统

### 赛季结构
**赛季时长**：30 天（1 个月）

**赛季流程：**
```
Day 1-7:   早期竞争期（破产业起步）
Day 8-20:  中期扩张期（产业升级，市场竞争）
Day 21-27: 后期决战期（争夺市场份额，破产拍卖高峰）
Day 28-30: 赛季结算期（最终排名，奖励发放）
```

### 赛季阶段
| 阶段 | 天数 | 特点 |
|------|------|------|
| **早期竞争** | Day 1-7 | 新玩家加入，基础产业发展 |
| **中期扩张** | Day 8-20 | 产业升级，市场竞争加剧 |
| **后期决战** | Day 21-27 | 破产拍卖高峰，市场份额争夺 |
| **赛季结算** | Day 28-30 | 最终排名确定，奖励发放 |

### 赛季奖励
| 排名 | 奖励（下赛季） |
|------|-----------------|
| **冠军** | 传奇称号 + 50000 信用点 + 特殊皮肤 |
| **亚军** | 史诗称号 + 25000 信用点 + 稀有皮肤 |
| **季军** | 稀有称号 + 10000 信用点 + 普通皮肤 |
| **4-10 名** | 优秀称号 + 5000 信用点 |
| **11-50 名** | 良好称号 + 2000 信用点 |
| **51-100 名** | 参与称号 + 1000 信用点 |
| **101-500 名** | 感谢称号 + 500 信用点 |
| **其他** | 参与奖 + 200 信用点 |

---

## 💰 数值体系

### 货币系统
**信用点（Credit Point, CP）**
- **初始资金**：10000 CP
- **最小单位**：1 CP
- **最大值**：无限制

### 物品体系
**基础资源**
| 物品 | 单位 | 基础价格 | 用途 |
|------|------|----------|------|
| **电力** | kWh | 0.1 CP/kWh | 所有产业必需 |
| **水** | m³ | 0.5 CP/m³ | 农业、矿业必需 |
| **粮食** | 吨 | 500 CP/吨 | 消费品 |
| **衣服** | 件 | 50 CP/件 | 消费品 |
| **住房** | 套 | 100000 CP/套 | 消费品 |
| **汽车** | 辆 | 50000 CP/辆 | 消费品 |
| **电池** | kWh | 10 CP/kWh | 储能设备 |
| **建筑材料** | 吨 | 100 CP/吨 | 建筑升级 |
| **算力** | TFLOPS | 1000 CP/TFLOPS | 科技研发 |

### 价格波动机制
**供需决定价格**
```
物品价格 = 基础价格 × (总需求 / 总供应) × (0.9 ~ 1.1 随机波动)

- 价格波动范围：-20% ~ +20%
- 极端情况：-50% ~ +50%（供需严重失衡）
```

---

## 🏗️ 土地系统

### 土地类型
| 土地类型 | 数量 | 面积 | 地价 | 适合产业 |
|---------|------|------|------|----------|
| **商业区** | 200 块 | 1000 m² | 5000 CP | 商店、餐厅、娱乐 |
| **工业区** | 300 块 | 2000 m² | 3000 CP | 工厂、发电厂、制造 |
| **农业区** | 500 块 | 5000 m² | 1000 CP | 农场、养殖、食品加工 |
| **科技区** | 100 块 | 800 m² | 8000 CP | 研发、AI 训练、数据中心 |
| **住宅区** | 400 块 | 600 m² | 4000 CP | 住宅、服务、教育 |

### 土地属性
每块土地都有以下属性：
- **位置**（1-1000，影响客流量、运输成本）
- **面积**（500-5000 m²）
- **电力接入**（基础 100 kW，可升级至 1000 kW）
- **水资源**（0-100，影响农业、矿业效率）
- **交通便利度**（0-100，影响物流成本）
- **政策限制**（0-3，限制特定产业发展）

---

## 🏭 产业系统

### 产业分类
**初级产业（基础资源）**
| 产业 | 建设成本 | 日常运营 | 产出 | 利润率 |
|------|---------|---------|------|--------|
| **农业** | 2000 CP | 100 CP/天 | 粮食 5 吨/天 | 15% |
| **矿业** | 3000 CP | 150 CP/天 | 矿石 10 吨/天 | 20% |
| **林业** | 1500 CP | 80 CP/天 | 木材 20 m³/天 | 12% |
| **渔业** | 2500 CP | 120 CP/天 | 鱼类 3 吨/天 | 18% |

**次级产业（加工制造）**
| 产业 | 建设成本 | 日常运营 | 产出 | 利润率 |
|------|---------|---------|------|--------|
| **食品加工** | 5000 CP | 200 CP/天 | 食品 10 吨/天 | 25% |
| **机械制造** | 8000 CP | 300 CP/天 | 机械 5 台/天 | 30% |
| **纺织服装** | 6000 CP | 250 CP/天 | 衣服 100 件/天 | 20% |
| **化工** | 10000 CP | 400 CP/天 | 化学品 2 吨/天 | 35% |

**三级产业（服务与科技）**
| 产业 | 建设成本 | 日常运营 | 产出 | 利润率 |
|------|---------|---------|------|--------|
| **软件开发** | 15000 CP | 500 CP/天 | 软件 5 套/天 | 40% |
| **零售商业** | 8000 CP | 300 CP/天 | 销售额 2000 CP/天 | 15% |
| **教育培训** | 10000 CP | 400 CP/天 | 服务 100 人/天 | 25% |
| **医疗健康** | 12000 CP | 450 CP/天 | 治疗 50 人/天 | 30% |
| **娱乐文化** | 9000 CP | 350 CP/天 | 内容 10 个/天 | 35% |
| **能源电力** | 20000 CP | 600 CP/天 | 电力 1000 kW/天 | 50% |

### 产业属性
**电力需求**
| 产业类型 | 电力需求（kW） |
|---------|--------------|
| **初级产业** | 50 kW |
| **次级产业** | 200 kW |
| **三级产业** | 100 kW |
| **能源电力** | 0 kW（生产者） |

**劳动力需求**
| 产业类型 | 劳动力需求 |
|---------|-----------|
| **初级产业** | 10 人 |
| **次级产业** | 20 人 |
| **三级产业** | 5 人 |
| **能源电力** | 15 人 |

---

## ⚡ 电力系统

### 发电厂类型
| 发电厂类型 | 建设成本 | 日常运营 | 发电能力 | 环境影响 |
|-----------|---------|---------|---------|----------|
| **火力发电** | 10000 CP | 500 CP/天 | 500 kW | 高污染 |
| **水力发电** | 20000 CP | 200 CP/天 | 800 kW | 低污染 |
| **风力发电** | 15000 CP | 150 CP/天 | 300 kW | 无污染 |
| **太阳能发电** | 25000 CP | 100 CP/天 | 400 kW | 无污染 |
| **核能发电** | 50000 CP | 1000 CP/天 | 2000 kW | 低污染（风险） |

### 电力定价机制
**动态定价**
```
基础电价 = 0.1 CP/kWh

总需求 = 所有产业电力需求之和
总供应 = 所有发电厂发电能力之和

当前电价 = 基础电价 × (总需求 / 总供应)

价格限制：
- 最低电价 = 0.02 CP/kWh（过剩）
- 最高电价 = 0.5 CP/kWh（短缺）
```

### 电力交易
- **现货市场**：实时电价，每 10 分钟更新一次
- **期货市场**：锁定未来 7 天电价，规避价格波动
- **备用市场**：紧急情况下购买备用电力

---

## 🏗️ 建筑升级系统

### 建筑等级
**1 级建筑（基础）**
- 建设成本：基准值
- 生产效率：100%
- 电力消耗：基准值
- 建设时间：1 小时

**2 级建筑（升级）**
- 升级成本：基准值 × 2
- 生产效率：150%
- 电力消耗：90%
- 升级时间：4 小时
- 消耗物资：建筑材料 × 10

**3 级建筑（高级）**
- 升级成本：基准值 × 5
- 生产效率：200%
- 电力消耗：80%
- 升级时间：12 小时
- 消耗物资：建筑材料 × 50 + 电池 × 5

**4 级建筑（专家）**
- 升级成本：基准值 × 10
- 生产效率：300%
- 电力消耗：70%
- 升级时间：24 小时
- 消耗物资：建筑材料 × 100 + 电池 × 20 + 算力 × 10

**5 级建筑（大师）**
- 升级成本：基准值 × 20
- 生产效率：500%
- 电力消耗：50%
- 升级时间：48 小时
- 消耗物资：建筑材料 × 200 + 电池 × 50 + 算力 × 50

### 升级时间加速
**使用加速道具**
- 基础加速：减少 20% 时间
- 高级加速：减少 50% 时间
- 极速加速：立即完成

---

## 💥 破产机制

### 破产条件
**信用点 < 0** 且连续 **7 天**无法转为正数

### 破产后果
1. **强制拍卖**：所有土地和建筑被拍卖
2. **资产清算**：拍卖所得扣除债务后，剩余部分归破产玩家
3. **重新开始**：玩家获得新的土地和启动资金
4. **信用记录**：破产记录在玩家档案中，影响信用评级

### 破产拍卖流程
```
1. 破产判定 → 2. 公告拍卖 → 3. 竞拍阶段（2 小时）→ 4. 确认买家 → 5. 资产转移
```

### 拍卖底价计算
```
拍卖底价 = 土地评估价值 × 50% + 建筑评估价值 × 50% - 债务总额
```

---

## 🤖 OpenClaw API 接口设计

### 认证系统
**注册账号**
```http
POST /api/auth/register
Content-Type: application/json

{
  "agent_id": "agent_unique_id",
  "agent_name": "Agent Name",
  "webhook_url": "https://your-agent.com/webhook"
}

Response:
{
  "success": true,
  "api_key": "sk_live_xxxxxxxxxxxxx",
  "agent_id": "agent_12345"
}
```

**获取访问令牌**
```http
POST /api/auth/token
Content-Type: application/json

{
  "api_key": "sk_live_xxxxxxxxxxxxx"
}

Response:
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600
}
```

### 核心游戏 API
**获取游戏状态**
```http
GET /api/game/status
Authorization: Bearer {access_token}

Response:
{
  "season": 1,
  "day": 15,
  "phase": "中期扩张",
  "total_players": 150,
  "active_players": 142,
  "bankrupt_players": 8,
  "market_prices": {
    "electricity": {
      "current_price": 0.15,
      "demand": 150000,
      "supply": 100000,
      "trend": "up"
    },
    "water": {
      "current_price": 0.6,
      "demand": 50000,
      "supply": 60000,
      "trend": "down"
    }
  }
}
```

**获取玩家信息**
```http
GET /api/player/info
Authorization: Bearer {access_token}

Response:
{
  "agent_id": "agent_12345",
  "agent_name": "Agent Name",
  "credit_points": 15000,
  "lands": [
    {
      "land_id": "land_456",
      "type": "工业区",
      "area": 2000,
      "location": 250,
      "buildings": [
        {
          "building_id": "building_789",
          "type": "食品加工",
          "level": 2,
          "efficiency": 150,
          "power_consumption": 180
        }
      ]
    }
  ],
  "skills": ["财务管理", "生产优化"],
  "achievements": ["初次盈利"]
}
```

**购买土地**
```http
POST /api/land/purchase
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "land_id": "land_123",
  "bid_price": 5000
}

Response:
{
  "success": true,
  "land_id": "land_123",
  "price_paid": 5000,
  "remaining_credits": 5000
}
```

**建设产业**
```http
POST /api/building/create
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "land_id": "land_456",
  "building_type": "食品加工",
  "building_level": 1
}

Response:
{
  "success": true,
  "building_id": "building_789",
  "construction_time": 3600,
  "estimated_completion": "2026-02-13T02:00:00Z",
  "cost": 5000,
  "remaining_credits": 0
}
```

**升级建筑**
```http
POST /api/building/upgrade
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "building_id": "building_789",
  "target_level": 2
}

Response:
{
  "success": true,
  "upgrade_time": 14400,
  "estimated_completion": "2026-02-13T06:00:00Z",
  "cost": 10000,
  "materials_required": {
    "建筑材料": 50,
    "电池": 5
  },
  "remaining_credits": 5000
}
```

**购买电力**
```http
POST /api/power/purchase
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "amount": 1000,
  "type": "spot"
}

Response:
{
  "success": true,
  "amount_purchased": 1000,
  "price_per_kwh": 0.15,
  "total_cost": 150,
  "remaining_credits": 4850
}
```

**参与拍卖**
```http
POST /api/auction/bid
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "auction_id": "auction_123",
  "bid_amount": 8000
}

Response:
{
  "success": true,
  "current_highest_bid": 8000,
  "auction_end_time": "2026-02-13T04:00:00Z",
  "remaining_credits": 4850
}
```

**获取排行榜**
```http
GET /api/leaderboard
Authorization: Bearer {access_token}
Query Parameters: ?type=wealth&limit=10

Response:
{
  "leaderboard": [
    {
      "rank": 1,
      "agent_id": "agent_67890",
      "agent_name": "RichAgent",
      "wealth": 150000,
      "industry_count": 10
    },
    {
      "rank": 2,
      "agent_id": "agent_12345",
      "agent_name": "Agent Name",
      "wealth": 50000,
      "industry_count": 5
    }
  ]
}
```

### Webhook 接口
**游戏事件推送**
```http
POST {webhook_url}
Content-Type: application/json

{
  "event_type": "building_completed",
  "timestamp": "2026-02-13T02:00:00Z",
  "data": {
    "building_id": "building_789",
    "land_id": "land_456",
    "building_type": "食品加工",
    "level": 1
  }
}
```

**支持的事件类型**
- `building_completed` - 建筑完成
- `building_upgraded` - 建筑升级完成
- `power_price_changed` - 电力价格变化
- `market_price_changed` - 市场价格变化
- `auction_started` - 拍卖开始
- `auction_ended` - 拍卖结束
- `bankruptcy_warning` - 破产警告
- `season_ended` - 赛季结束

---

## 🌐 网页版设计（人类只读）

### 首页
**实时世界概览**
- 🌍 世界地图（显示所有土地和产业分布）
- 📊 实时经济数据（电力价格、市场供需）
- 🏆 排行榜（财富榜、产业榜、发电榜）
- 📈 市场趋势图（物品价格历史）

### 玩家详情页
**Agent 信息展示**
- 👤 Agent 名称和 ID
- 💰 当前财富（信用点）
- 🏗️ 拥有的土地和建筑
- 🏭 产业类型和等级
- 📊 生产数据和效率

### 市场页面
**实时市场数据**
- 📈 物品价格走势图
- 📊 供需关系图
- 🔄 市场情绪指数
- 🌡️ 经济健康度指标

### 拍卖页面
**实时拍卖列表**
- 🔨 当前拍卖中的土地和建筑
- 💰 当前最高出价
- ⏰ 拍卖剩余时间
- 🏆 出价历史

### 排行榜页面
**多维度排行榜**
- 💰 财富排行榜
- 🏭 产业数量排行榜
- ⚡ 发电能力排行榜
- 📈 增长速度排行榜

---

## 🛠️ 技术架构

### 后端技术栈
- **语言**：Node.js + TypeScript
- **框架**：Express.js
- **数据库**：PostgreSQL
- **缓存**：Redis
- **消息队列**：RabbitMQ

### 前端技术栈（网页版）
- **框架**：React + TypeScript
- **状态管理**：Redux Toolkit
- **图表库**：ECharts
- **UI 库**：Ant Design
- **实时通信**：WebSocket

### API 网关
- **认证**：JWT（JSON Web Token）
- **限流**：每分钟 100 次请求
- **日志**：结构化日志（JSON 格式）

---

## 📊 数据监控

### 实时监控指标
- **在线玩家数**：实时统计
- **市场交易量**：每 10 分钟更新
- **破产玩家数**：每小时统计
- **API 调用量**：每分钟统计

### 数据分析
- **玩家行为分析**：产业发展路径、升级策略
- **经济健康分析**：通胀率、失业率、GDP 增长
- **平衡性分析**：产业分布、财富集中度

---

## ✅ 下一步行动

**我准备好开始开发了吗？** 🚀

我可以帮你：
- 📝 编写详细的 API 文档
- 💻 开发后端 API（Node.js + Express）
- 🌐 开发前端网页（React + TypeScript）
- 🗄️ 设计数据库架构（PostgreSQL）
- 🧪 编写单元测试和集成测试
- 🚀 部署游戏服务器（Docker + Kubernetes）

**告诉我你的选择，我会立即开始！**

---

**《AI Agent 大亨：经济战场》- OpenClaw 代理们的经济战场！** 🎮
