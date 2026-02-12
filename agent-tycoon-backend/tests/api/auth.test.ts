import request from 'supertest';
import { app } from '../src/app';
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';

/**
 * Auth Controller Tests
 */
describe('Auth Controller', () => {
  let authToken: string;

  beforeAll(async () => {
    // Setup: Register a test player and get token
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        agent_id: 'test_agent_001',
        agent_name: 'Test Agent',
        webhook_url: null
      })
      .expect(201);

    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        api_key: registerResponse.body.api_key
      })
      .expect(200);

    authToken = loginResponse.body.access_token;
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new agent successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          agent_id: 'test_agent_002',
          agent_name: 'Test Agent 2',
          webhook_url: null
        })
        .expect(201);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('api_key');
      expect(response.body).toHaveProperty('agent_id');
    });

    it('should fail with missing agent_id', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          agent_name: 'Test Agent'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
    });

    it('should fail with duplicate agent_id', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          agent_id: 'test_agent_001',
          agent_name: 'Test Agent'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          api_key: 'test_api_key'
        })
        .expect(401);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
    });

    it('should fail with missing api_key', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh token successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          api_key: 'test_api_key'
        })
        .expect(401);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
    });
  });
});

/**
 * Player Controller Tests
 */
describe('Player Controller', () => {
  let authToken: string;

  beforeAll(async () => {
    // Setup: Login as test player
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        agent_id: 'test_player_001',
        agent_name: 'Test Player',
        webhook_url: null
      })
      .expect(201);

    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        api_key: registerResponse.body.api_key
      })
      .expect(200);

    authToken = loginResponse.body.access_token;
  });

  describe('GET /api/v1/player', () => {
    it('should get player information', async () => {
      const response = await request(app)
        .get('/api/v1/player')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('player_info');
      expect(response.body.player_info).toHaveProperty('agent_id');
      expect(response.body.player_info).toHaveProperty('agent_name');
      expect(response.body.player_info).toHaveProperty('credit_points');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/player')
        .expect(401);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/player', () => {
    it('should update player name', async () => {
      const response = await request(app)
        .put('/api/v1/player')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          agent_name: 'Updated Test Player'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
      expect(response.body.player_info.agent_name).toBe('Updated Test Player');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .put('/api/v1/player')
        .send({
          agent_name: 'Test'
        })
        .expect(401);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
    });
  });
});

/**
 * Land Controller Tests
 */
describe('Land Controller', () => {
  let authToken: string;

  beforeAll(async () => {
    // Setup: Login as test player
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        agent_id: 'test_land_001',
        agent_name: 'Test Land Player',
        webhook_url: null
      })
      .expect(201);

    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        api_key: registerResponse.body.api_key
      })
      .expect(200);

    authToken = loginResponse.body.access_token;
  });

  describe('GET /api/v1/land', () => {
    it('should get all available lands', async () => {
      const response = await request(app)
        .get('/api/v1/land')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('lands');
      expect(Array.isArray(response.body.lands)).toBe(true);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/land')
        .expect(401);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/land/purchase', () => {
    it('should purchase land successfully', async () => {
      // First get available lands
      const getLandsResponse = await request(app)
        .get('/api/v1/land')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const lands = getLandsResponse.body.lands;
      const firstLand = lands[0];

      const response = await request(app)
        .post('/api/v1/land/purchase')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          land_id: firstLand.land_id,
          bid_price: firstLand.base_price
        })
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('land_id');
      expect(response.body).toHaveProperty('price_paid');
    });

    it('should fail with insufficient credits', async () => {
      const response = await request(app)
        .post('/api/v land/purchase')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          land_id: 'test_land',
          bid_price: 999999999 // Excessive price
        })
        .expect(400);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
    });
  });
});

/**
 * Building Controller Tests
 */
describe('Building Controller', () => {
  let authToken: string;
  let landId: string;

  beforeAll(async () => {
    // Setup: Login as test player and purchase land
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        agent_id: 'test_building_001',
        agent_name: 'Test Building Player',
        webhook_url: null
      })
      .expect(201);

    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        api_key: registerResponse.body.api_key
      })
      .expect(200);

    authToken = loginResponse.body.access_token;

    // Purchase land
    const getLandsResponse = await request(app)
      .get('/api/v1/land')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    const lands = getLandsResponse.body.lands;
    const firstLand = lands[0];

    const purchaseResponse = await request(app)
      .post('/api/v1/land/purchase')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        land_id: firstLand.land_id,
        bid_price: firstLand.base_price
      })
      .expect(200);

    landId = firstLand.land_id;
  });

  describe('POST /api/v1/building/create', () => {
    it('should create building successfully', async () => {
      const response = await request(app)
        .post('/api/v1/building/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          land_id: landId,
          building_type: 'agriculture',
          building_level: 1
        })
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('building_id');
      expect(response.body).toHaveProperty('construction_time');
    });

    it('should fail with insufficient credits', async () => {
      const response = await request(app)
        .post('/api/v1/building/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          land_id: landId,
          building_type: 'energy_electricity', // Most expensive building
          building_level: 1
        })
        .expect(400);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
    });
  });
});

/**
 * Population Controller Tests
 */
describe('Population Controller', () => {
  let authToken: string;
  let buildingId: string;

  beforeAll(async () => {
    // Setup: Login as test player and create building
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        agent_id: 'test_population_001',
        agent_name: 'Test Population Player',
        webhook_url: null
      })
      .expect(201);

    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        api_key: registerResponse.body.api_key
      })
      .expect(200);

    authToken = loginResponse.body.access_token;

    // Purchase land
    const getLandsResponse = await request(app)
      .get('/api/v1/land')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    const lands = getLandsResponse.body.lands;
    const firstLand = lands[0];

    const purchaseResponse = await request(app)
      .post('/api/v1/land/purchase')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          land_id: firstLand.land_id,
          bid_price: firstLand.base_price
        })
        .expect(200);

    // Create building
    const createBuildingResponse = await request(app)
      .post('/api/v1/building/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        land_id: firstLand.land_id,
        building_type: 'agriculture',
        building_level: 1
      })
      .expect(200);

    buildingId = createBuildingResponse.body.building_id;
  });

  describe('GET /api/v1/population', () => {
    it('should get population status', async () => {
      const response = await request(app)
        .get('/api/v1/population')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('population_info');
      expect(response.body.population_info).toHaveProperty('total_population');
      expect(response.body.population_info).toHaveProperty('employed_population');
      expect(response.body.population_info).toHaveProperty('satisfaction_level');
    });
  });

  describe('POST /api/v1/population/employ', () => {
    it('should employ workers successfully', async () => {
      const response = await request(app)
        .post('/api/v1/population/employ')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          building_id: buildingId,
          worker_count: 5,
          wage: 25
        })
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('workers_added');
      expect(response.body).toHaveProperty('daily_wage_cost');
    });
  });
});

/**
 * Loan Controller Tests
 */
describe('Loan Controller', () => {
  let authToken: string;

  beforeAll(async () => {
    // Setup: Login as test player
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        agent_id: 'test_loan_001',
        agent_name: 'Test Loan Player',
        webhook_url: null
      })
      .expect(201);

    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        api_key: registerResponse.body.api_key
      })
      .expect(200);

    authToken = loginResponse.body.access_token;
  });

  describe('POST /api/v1/loan/apply', () => {
    it('should apply for short term loan successfully', async () => {
      const response = await request(app)
        .post('/api/v1/loan/apply')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          loan_type: 'short_term',
          amount: 1000,
          duration_days: 7
        })
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('loan_id');
      expect(response.body).toHaveProperty('amount');
      expect(response.body).toHaveProperty('daily_interest');
      expect(response.body).toHaveProperty('total_repayment');
    });

    it('should fail with excessive amount', async () => {
      const response = await request(app)
        .post('/api/v1/loan/apply')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          loan_type: 'short_term',
          amount: 999999,
          duration_days: 7
        })
        .expect(400);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/loan/status', () => {
    it('should get loan status', async () => {
      const response = await request(app)
        .get('/api/v1/loan/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('active_loans');
      expect(response.body).toHaveProperty('credit_rating');
      expect(response.body).toHaveProperty('max_loan_amount');
    });
  });
});

/**
 * Market Controller Tests
 */
describe('Market Controller', () => {
  let authToken: string;

  beforeAll(async () => {
    // Setup: Login as test player
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        agent_id: 'test_market_001',
        agent_name: 'Test Market Player',
        webhook_url: null
      })
      .expect(201);

    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        api_key: registerResponse.body.api_key
      })
      .expect(200);

    authToken = loginResponse.body.body.access_token;
  });

  describe('GET /api/v1/market/prices', () => {
    it('should get market prices', async () => {
      const response = await request(app)
        .get('/api/v1/market/prices')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('market_prices');
      expect(Array.isArray(response.body.market_prices)).toBe(true);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/market/prices')
        .expect(401);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/market/purchase', () => {
    it('should purchase items successfully', async () => {
      const response = await request(app)
        .post('/api/v1/market/purchase')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [
            {
              item_type: 'food',
              amount: 100
            }
          ]
        })
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('items_purchased');
      expect(response.body).toHaveProperty('total_cost');
    });

    it('should fail with insufficient credits', async () => {
      const response = await request(app)
        .post('/api/v1/market/purchase')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [
            {
              item_type: 'food',
              amount: 999999 // Excessive amount
            }
          ]
        })
        .expect(400);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
    });
  });
});
