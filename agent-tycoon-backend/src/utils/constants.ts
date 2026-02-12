export const CONSTANTS = {
  // Game Constants
  SEASON_DURATION_DAYS: 30,
  INITIAL_CREDIT_POINTS: 10000,
  INITIAL_POPULATION: 100,
  GAME_SPEED_MINUTES_PER_DAY: 10,

  // Population Constants
  INITIAL_POPULATION_GROWTH_RATE: 0.005, // 0.5% per day
  POPULATION_ATTRACT_RATE: 5, // people per day
  POPULATION_LOSS_RATE: 0.01, // 1% per day

  // Loan Constants
  SHORT_TERM_LOAN_MAX: 5000,
  SHORT_TERM_LOAN_DURATION: 7,
  SHORT_TERM_LOAN_INTEREST: 0.005, // 0.5% per day

  MEDIUM_TERM_LOAN_MAX: 20000,
  MEDIUM_TERM_LOAN_DURATION: 15,
  MEDIUM_TERM_LOAN_INTEREST: 0.003, // 0.3% per day

  LONG_TERM_LOAN_MAX: 50000,
  LONG_TERM_LOAN_DURATION: 30,
  LONG_TERM_LOAN_INTEREST: 0.002, // 0.2% per day

  EMERGENCY_LOAN_MAX: 2000,
  EMERGENCY_LOAN_DURATION: 3,
  EMERGENCY_LOAN_INTEREST: 0.01, // 1.0% per day

  // Population Consumption
  DAILY_FOOD_CONSUMPTION_PER_PERSON: 1, // tons
  DAILY_CLOTHING_CONSUMPTION_PER_PERSON: 0.1, // pieces
  DAILY_HOUSING_CONSUMPTION_PER_PERSON: 0.01, // sets
  DAILY_ENTERTAINMENT_CONSUMPTION_PER_PERSON: 0.05, // times

  // Item Prices
  FOOD_BASE_PRICE: 500, // CP per ton
  CLOTHING_BASE_PRICE: 50, // CP per piece
  HOUSING_BASE_PRICE: 10000, // CP per set
  ENTERTAINMENT_BASE_PRICE: 30, // CP per time

  // Building Construction Costs
  AGRICULTURE_COST: 2000,
  MINING_COST: 3000,
  FORESTRY_COST: 1500,
  FISHERY_COST: 2500,

  FOOD_PROCESSING_COST: 5000,
  MACHINERY_MANUFACTURING_COST: 8000,
  TEXTILE_CLOTHING_COST: 6000,
  CHEMICAL_COST: 10000,

  SOFTWARE_DEVELOPMENT_COST: 15000,
  RETAIL_COMMERCE_COST: 8000,
  EDUCATION_TRAINING_COST: 10000,
  MEDICAL_HEALTHCARE_COST: 12000,
  ENTERTAINMENT_CULTURE_COST: 9000,
  ENERGY_ELECTRICITY_COST: 20000,

  // Power Plant Costs
  THERMAL_PLANT_COST: 10000,
  HYDRO_PLANT_COST: 20000,
  WIND_PLANT_COST: 15000,
  SOLAR_PLANT_COST: 25000,
  NUCLEAR_PLANT_COST: 50000,

  // Building Levels
  BUILDING_LEVELS: {
    1: { efficiency: 1.0, powerMultiplier: 1.0, constructionTime: 3600 },
    2: { efficiency: 1.5, powerMultiplier: 0.9, constructionTime: 14400 },
    3: { efficiency: 2.0, powerMultiplier: 0.8, constructionTime: 43200 },
    4: { efficiency: 3.0, powerMultiplier: 0.7, constructionTime: 86400 },
    5: { efficiency: 5.0, powerMultiplier: 0.5, constructionTime: 172800 }
  },

  // Industry Types
  PRIMARY_INDUSTRIES: ['agriculture', 'mining', 'forestry', 'fishery'],
  SECONDARY_INDUSTRIES: ['food_processing', 'machinery_manufacturing', 'textile_clothing', 'chemical'],
  TERTIARY_INDUSTRIES: ['software_development', 'retail_commerce', 'education_training', 'medical_healthcare', 'entertainment_culture', 'energy_electricity'],

  // Land Types
  LAND_TYPES: ['commercial', 'industrial', 'agricultural', 'tech', 'residential'],

  // Credit Ratings
  CREDIT_RATINGS: ['S', 'A', 'B', 'C', 'D'],

  // Loan Types
  LOAN_TYPES: ['short_term', 'medium_term', 'long_term', 'emergency'],

  // Item Types
  ITEM_TYPES: ['food', 'clothing', 'housing', 'entertainment', 'building_materials', 'battery', 'computing_power'],

  // Error Messages
  ERROR_MESSAGES: {
    UNAUTHORIZED: 'Unauthorized access',
    INVALID_CREDENTIALS: 'Invalid credentials',
    PLAYER_NOT_FOUND: 'Player not found',
    INSUFFICIENT_CREDITS: 'Insufficient credit points',
    LAND_NOT_FOUND: 'Land not found',
    BUILDING_NOT_FOUND: 'Building not found',
    LOAN_NOT_FOUND: 'Loan not found',
    INSUFFICIENT_LOAN_AMOUNT: 'Insufficient loan amount',
    LOAN_ALREADY_PAID: 'Loan already paid',
    INVALID_LOAN_TYPE: 'Invalid loan type',
    POPULATION_NOT_FOUND: 'Population not found',
    ITEM_NOT_FOUND: 'Item not found',
    MARKET_CLOSED: 'Market is closed'
  }
};

export default CONSTANTS;
