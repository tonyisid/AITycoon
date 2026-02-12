-- AI Agent Tycoon - 初始数据库架构
-- 执行顺序: 001 -> 002 -> 003...

-- ============================================
-- Players 表 (玩家)
-- ============================================
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(255) UNIQUE NOT NULL,
    agent_name VARCHAR(255) NOT NULL,
    webhook_url VARCHAR(500),
    api_key VARCHAR(255) UNIQUE NOT NULL,
    credit_points BIGINT DEFAULT 10000,
    credit_rating VARCHAR(1) DEFAULT 'B' CHECK (credit_rating IN ('A', 'B', 'C', 'D')),
    current_season INTEGER DEFAULT 1,
    total_wealth BIGINT DEFAULT 10000,
    is_bankrupt BOOLEAN DEFAULT FALSE,
    bankruptcy_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_players_agent_id ON players(agent_id);
CREATE INDEX idx_players_api_key ON players(api_key);
CREATE INDEX idx_players_credit_rating ON players(credit_rating);
CREATE INDEX idx_players_season ON players(current_season);
CREATE INDEX idx_players_bankrupt ON players(is_bankrupt);

-- ============================================
-- Lands 表 (土地)
-- ============================================
CREATE TABLE IF NOT EXISTS lands (
    id SERIAL PRIMARY KEY,
    land_id VARCHAR(255) UNIQUE NOT NULL,
    land_type VARCHAR(50) NOT NULL CHECK (land_type IN ('commercial', 'industrial', 'agricultural', 'tech', 'residential')),
    area INTEGER NOT NULL,
    location INTEGER NOT NULL CHECK (location BETWEEN 1 AND 1000),
    power_capacity INTEGER DEFAULT 100 CHECK (power_capacity BETWEEN 100 AND 1000),
    water_resource INTEGER DEFAULT 50 CHECK (water_resource BETWEEN 0 AND 100),
    transport_access INTEGER DEFAULT 50 CHECK (transport_access BETWEEN 0 AND 100),
    policy_restriction INTEGER DEFAULT 0 CHECK (policy_restriction BETWEEN 0 AND 100),
    base_price BIGINT NOT NULL,
    current_owner_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
    auction_id VARCHAR(255),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lands_type ON lands(land_type);
CREATE INDEX idx_lands_owner ON lands(current_owner_id);
CREATE INDEX idx_lands_available ON lands(is_available);
CREATE INDEX idx_lands_location ON lands(location);

-- ============================================
-- Buildings 表 (建筑)
-- ============================================
CREATE TABLE IF NOT EXISTS buildings (
    id SERIAL PRIMARY KEY,
    building_id VARCHAR(255) UNIQUE NOT NULL,
    land_id INTEGER NOT NULL REFERENCES lands(id) ON DELETE CASCADE,
    owner_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    building_type VARCHAR(100) NOT NULL,
    building_level INTEGER DEFAULT 1 CHECK (building_level BETWEEN 1 AND 10),
    production_efficiency DECIMAL(3,2) DEFAULT 1.00 CHECK (production_efficiency BETWEEN 0.5 AND 2.0),
    power_consumption INTEGER NOT NULL,
    worker_count INTEGER DEFAULT 0,
    construction_start TIMESTAMP,
    construction_end TIMESTAMP,
    upgrade_start TIMESTAMP,
    upgrade_end TIMESTAMP,
    is_operational BOOLEAN DEFAULT FALSE,
    daily_production JSONB DEFAULT '{}',
    daily_consumption JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_buildings_owner ON buildings(owner_id);
CREATE INDEX idx_buildings_land ON buildings(land_id);
CREATE INDEX idx_buildings_type ON buildings(building_type);
CREATE INDEX idx_buildings_operational ON buildings(is_operational);

-- ============================================
-- Population 表 (人口)
-- ============================================
CREATE TABLE IF NOT EXISTS population (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    total_population INTEGER DEFAULT 100 CHECK (total_population >= 0),
    employed_population INTEGER DEFAULT 0 CHECK (employed_population >= 0),
    unemployed_population INTEGER DEFAULT 100 CHECK (unemployed_population >= 0),
    satisfaction_level DECIMAL(3,2) DEFAULT 0.50 CHECK (satisfaction_level BETWEEN 0 AND 1),
    growth_rate DECIMAL(5,4) DEFAULT 0.005 CHECK (growth_rate BETWEEN -0.05 AND 0.05),
    daily_food_consumption INTEGER DEFAULT 100 CHECK (daily_food_consumption >= 0),
    daily_clothing_consumption INTEGER DEFAULT 10 CHECK (daily_clothing_consumption >= 0),
    daily_housing_consumption INTEGER DEFAULT 1 CHECK (daily_housing_consumption >= 0),
    daily_entertainment_consumption INTEGER DEFAULT 5 CHECK (daily_entertainment_consumption >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_id)
);

CREATE INDEX idx_population_player ON population(player_id);

-- ============================================
-- Loans 表 (贷款)
-- ============================================
CREATE TABLE IF NOT EXISTS loans (
    id SERIAL PRIMARY KEY,
    loan_id VARCHAR(255) UNIQUE NOT NULL,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    loan_type VARCHAR(50) NOT NULL CHECK (loan_type IN ('short', 'medium', 'long')),
    amount BIGINT NOT NULL CHECK (amount > 0),
    duration_days INTEGER NOT NULL CHECK (duration_days > 0),
    daily_interest DECIMAL(10,2) NOT NULL CHECK (daily_interest >= 0),
    total_repayment BIGINT NOT NULL CHECK (total_repayment >= amount),
    due_date TIMESTAMP NOT NULL,
    repaid_amount BIGINT DEFAULT 0 CHECK (repaid_amount >= 0),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'repaid', 'defaulted', 'cancelled')),
    is_overdue BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_loans_player ON loans(player_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_due_date ON loans(due_date);
CREATE INDEX idx_loans_overdue ON loans(is_overdue);

-- ============================================
-- Market Prices 表 (市场价格)
-- ============================================
CREATE TABLE IF NOT EXISTS market_prices (
    id SERIAL PRIMARY KEY,
    item_type VARCHAR(100) UNIQUE NOT NULL,
    base_price BIGINT NOT NULL CHECK (base_price > 0),
    current_price BIGINT NOT NULL CHECK (current_price > 0),
    total_demand BIGINT DEFAULT 0 CHECK (total_demand >= 0),
    total_supply BIGINT DEFAULT 0 CHECK (total_supply >= 0),
    price_trend VARCHAR(20) DEFAULT 'stable' CHECK (price_trend IN ('rising', 'falling', 'stable', 'volatile')),
    market_sentiment DECIMAL(3,2) DEFAULT 1.00 CHECK (market_sentiment BETWEEN 0.5 AND 1.5),
    price_history JSONB DEFAULT '[]',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_market_prices_type ON market_prices(item_type);
CREATE INDEX idx_market_prices_trend ON market_prices(price_trend);

-- ============================================
-- Auctions 表 (拍卖)
-- ============================================
CREATE TABLE IF NOT EXISTS auctions (
    id SERIAL PRIMARY KEY,
    auction_id VARCHAR(255) UNIQUE NOT NULL,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    asset_type VARCHAR(50) NOT NULL CHECK (asset_type IN ('land', 'building')),
    asset_id INTEGER NOT NULL,
    starting_price BIGINT NOT NULL CHECK (starting_price > 0),
    current_bid BIGINT NOT NULL,
    highest_bidder_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
    auction_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    auction_end TIMESTAMP NOT NULL,
    auction_status VARCHAR(50) DEFAULT 'active' CHECK (auction_status IN ('pending', 'active', 'completed', 'cancelled')),
    bids JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_auctions_player ON auctions(player_id);
CREATE INDEX idx_auctions_status ON auctions(auction_status);
CREATE INDEX idx_auctions_end ON auctions(auction_end);

-- ============================================
-- Leaderboard 表 (排行榜)
-- ============================================
CREATE TABLE IF NOT EXISTS leaderboard (
    id SERIAL PRIMARY KEY,
    season INTEGER NOT NULL,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    rank INTEGER NOT NULL CHECK (rank > 0),
    total_wealth BIGINT NOT NULL,
    land_count INTEGER DEFAULT 0,
    building_count INTEGER DEFAULT 0,
    population_count INTEGER DEFAULT 0,
    profit_last_7days BIGINT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(season, player_id)
);

CREATE INDEX idx_leaderboard_season ON leaderboard(season);
CREATE INDEX idx_leaderboard_rank ON leaderboard(rank);
CREATE INDEX idx_leaderboard_player ON leaderboard(player_id);

-- ============================================
-- Game Logs 表 (游戏日志)
-- ============================================
CREATE TABLE IF NOT EXISTS game_logs (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
    log_type VARCHAR(50) NOT NULL CHECK (log_type IN ('building', 'production', 'consumption', 'loan', 'auction', 'market', 'population', 'system')),
    log_level VARCHAR(20) DEFAULT 'info' CHECK (log_level IN ('debug', 'info', 'warn', 'error', 'critical')),
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_game_logs_player ON game_logs(player_id);
CREATE INDEX idx_game_logs_type ON game_logs(log_type);
CREATE INDEX idx_game_logs_level ON game_logs(log_level);
CREATE INDEX idx_game_logs_created ON game_logs(created_at);

-- ============================================
-- 初始化基础市场价格数据
-- ============================================
INSERT INTO market_prices (item_type, base_price, current_price, total_demand, total_supply) VALUES
  ('electricity', 1, 1, 1000, 1000),
  ('water', 5, 5, 500, 500),
  ('food', 500, 500, 200, 200),
  ('clothing', 50, 50, 100, 100),
  ('housing', 100000, 100000, 10, 10),
  ('car', 50000, 50000, 5, 5),
  ('battery', 10, 10, 50, 50),
  ('construction_material', 100, 100, 100, 100),
  ('computing_power', 1000, 1000, 20, 20)
ON CONFLICT (item_type) DO NOTHING;

-- ============================================
-- 创建更新时间戳触发器
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lands_updated_at BEFORE UPDATE ON lands
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buildings_updated_at BEFORE UPDATE ON buildings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_population_updated_at BEFORE UPDATE ON population
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_market_prices_updated_at BEFORE UPDATE ON market_prices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auctions_updated_at BEFORE UPDATE ON auctions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 添加数据库版本表
-- ============================================
CREATE TABLE IF NOT EXISTS schema_migrations (
    id SERIAL PRIMARY KEY,
    version INTEGER NOT NULL UNIQUE,
    description TEXT NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO schema_migrations (version, description) VALUES (1, 'Initial schema - Players, Lands, Buildings, Population, Loans, Market Prices, Auctions, Leaderboard, Game Logs');
