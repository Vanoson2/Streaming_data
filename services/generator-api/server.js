/**
 * E-commerce Event Generator API
 * 
 * REST API generating random e-commerce events for Kafka ingestion
 * Port: 7070
 */

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

// ============================================================================
// CONFIGURATION
// ============================================================================

const PORT = process.env.PORT || 7070;
const DEFAULT_BATCH_COUNT = parseInt(process.env.DEFAULT_BATCH_COUNT) || 10;
const MAX_BATCH_COUNT = 500;

/**
 * Event type distribution (theo yêu cầu)
 * - 30% order_created
 * - 25% payment_initiated
 * - 35% payment_success
 * - 8% payment_failed
 * - 2% order_cancelled
 */
let EVENT_DISTRIBUTION = {
  order_created: 30,
  payment_initiated: 25,
  payment_success: 35,
  payment_failed: 8,
  order_cancelled: 2
};

let CONFIG = {
  defaultCount: DEFAULT_BATCH_COUNT,
  ratePerSec: 1
};

const DEVICES = ['mobile', 'desktop', 'tablet'];

// Middleware
app.use(cors({
  origin: ['http://localhost:5174', 'http://127.0.0.1:5174'],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// ============================================================================
// EVENT GENERATION LOGIC
// ============================================================================

/**
 * Weighted random selection based on distribution
 */
function weightedRandomEventType() {
  const entries = Object.entries(EVENT_DISTRIBUTION);
  const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const [type, weight] of entries) {
    random -= weight;
    if (random <= 0) {
      return type;
    }
  }
  return entries[0][0]; // fallback
}

/**
 * Generate amount based on event type
 * 
 * Rules:
 * - payment_success: 50k - 5M VND (có giao dịch thành công)
 * - payment_failed: 0 VND (giao dịch thất bại không có amount)
 * - payment_initiated: 50k - 3M VND (đang chờ thanh toán)
 * - order_created: 50k - 3M VND (giá trị đơn hàng ước tính)
 * - order_cancelled: 0 VND (đã hủy không tính amount)
 */
function generateAmount(eventType) {
  switch (eventType) {
    case 'payment_success':
      // Giao dịch thành công: 50k - 5M VND
      return Math.floor(Math.random() * (5000000 - 50000 + 1)) + 50000;
    
    case 'payment_initiated':
    case 'order_created':
      // Pending: 50k - 3M VND
      return Math.floor(Math.random() * (3000000 - 50000 + 1)) + 50000;
    
    case 'payment_failed':
    case 'order_cancelled':
      // Failed: 0 VND
      return 0;
    
    default:
      return 0;
  }
}

/**
 * Map event type to status
 * 
 * Logic:
 * - order_created: pending (đơn hàng mới tạo, chờ thanh toán)
 * - payment_initiated: pending (đã bắt đầu thanh toán, chờ xác nhận)
 * - payment_success: success (thanh toán thành công)
 * - payment_failed: failed (thanh toán thất bại)
 * - order_cancelled: failed (đơn hàng đã bị hủy, coi như thất bại)
 */
function mapEventToStatus(eventType) {
  switch (eventType) {
    case 'order_created':
    case 'payment_initiated':
      return 'pending';
    
    case 'payment_success':
      return 'success';
    
    case 'payment_failed':
    case 'order_cancelled':
      return 'failed';
    
    default:
      return 'pending';
  }
}

/**
 * Generate random IP address
 */
function generateIP() {
  return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

/**
 * Generate random session ID
 */
function generateSessionId() {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a single event according to schema
 */
function generateEvent() {
  const eventType = weightedRandomEventType();
  const amount = generateAmount(eventType);
  const status = mapEventToStatus(eventType);
  
  return {
    id: uuidv4(),
    eventTime: new Date().toISOString(),
    eventType: eventType,
    orderId: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    userId: `USR${Math.floor(Math.random() * 10000)}`,
    amount: amount,
    currency: 'VND',
    status: status,
    metadata: {
      device: DEVICES[Math.floor(Math.random() * DEVICES.length)],
      ip: generateIP(),
      sessionId: generateSessionId()
    }
  };
}

/**
 * Generate multiple events
 */
function generateEvents(count) {
  const events = [];
  for (let i = 0; i < count; i++) {
    events.push(generateEvent());
  }
  return events;
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * GET /gen/event
 * 
 * Generate and return a single random e-commerce event
 */
app.get('/gen/event', (req, res) => {
  try {
    const event = generateEvent();
    
    // Log for monitoring
    console.log(`[${new Date().toISOString()}] Generated: ${event.eventType} | Order: ${event.orderId} | Amount: ${event.amount.toLocaleString()} VND`);
    
    res.json(event);
  } catch (error) {
    console.error('Error generating event:', error);
    res.status(500).json({ 
      error: 'Failed to generate event',
      message: error.message 
    });
  }
});

/**
 * GET /gen/events?count=50
 * 
 * Generate and return multiple events
 * - count: số lượng events (default: DEFAULT_BATCH_COUNT, max: 500)
 */
app.get('/gen/events', (req, res) => {
  try {
    let count = parseInt(req.query.count) || DEFAULT_BATCH_COUNT;
    
    // Validate count
    if (count < 1) {
      return res.status(400).json({
        error: 'Invalid count',
        message: 'count must be at least 1'
      });
    }
    
    if (count > MAX_BATCH_COUNT) {
      return res.status(400).json({
        error: 'Count too large',
        message: `count cannot exceed ${MAX_BATCH_COUNT}`
      });
    }
    
    const events = generateEvents(count);
    
    console.log(`[${new Date().toISOString()}] Generated ${count} events in batch`);
    
    res.json({
      count: events.length,
      events: events
    });
  } catch (error) {
    console.error('Error generating events:', error);
    res.status(500).json({ 
      error: 'Failed to generate events',
      message: error.message 
    });
  }
});

/**
 * GET /health
 * 
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ 
    ok: true,
    time: new Date().toISOString(),
    service: 'event-generator-api',
    port: PORT
  });
});

/**
 * GET /gen/config
 * 
 * Return current configuration
 */
app.get('/gen/config', (req, res) => {
  res.json({
    distribution: EVENT_DISTRIBUTION,
    defaultCount: CONFIG.defaultCount,
    ratePerSec: CONFIG.ratePerSec,
    amountRules: {
      payment_success: '50,000 - 5,000,000 VND',
      payment_initiated: '50,000 - 3,000,000 VND',
      order_created: '50,000 - 3,000,000 VND',
      payment_failed: '0 VND',
      order_cancelled: '0 VND'
    }
  });
});

/**
 * POST /gen/config
 * 
 * Update configuration
 */
app.post('/gen/config', (req, res) => {
  try {
    const { distribution, defaultCount, ratePerSec } = req.body;

    // Update distribution if provided
    if (distribution) {
      const total = Object.values(distribution).reduce((sum, val) => sum + val, 0);
      if (Math.abs(total - 1.0) > 0.01 && Math.abs(total - 100) > 0.01) {
        return res.status(400).json({ 
          error: 'Distribution must sum to 1.0 or 100',
          received: total
        });
      }

      // Convert to percentage if needed
      const normalizedDist = {};
      Object.entries(distribution).forEach(([key, val]) => {
        normalizedDist[key] = val > 1 ? val : val * 100;
      });
      
      EVENT_DISTRIBUTION.order_created = normalizedDist.order_created || EVENT_DISTRIBUTION.order_created;
      EVENT_DISTRIBUTION.payment_initiated = normalizedDist.payment_initiated || EVENT_DISTRIBUTION.payment_initiated;
      EVENT_DISTRIBUTION.payment_success = normalizedDist.payment_success || EVENT_DISTRIBUTION.payment_success;
      EVENT_DISTRIBUTION.payment_failed = normalizedDist.payment_failed || EVENT_DISTRIBUTION.payment_failed;
      EVENT_DISTRIBUTION.order_cancelled = normalizedDist.order_cancelled || EVENT_DISTRIBUTION.order_cancelled;
    }

    // Update other config
    if (defaultCount !== undefined) CONFIG.defaultCount = defaultCount;
    if (ratePerSec !== undefined) CONFIG.ratePerSec = ratePerSec;

    res.json({
      message: 'Configuration updated successfully',
      config: {
        distribution: EVENT_DISTRIBUTION,
        defaultCount: CONFIG.defaultCount,
        ratePerSec: CONFIG.ratePerSec
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /gen/emit
 * 
 * Generate custom event with overrides
 */
app.post('/gen/emit', (req, res) => {
  try {
    const { eventType, status, amount, orderId, userId, lateMinutes } = req.body;

    let event = generateEvent();

    // Apply overrides
    if (eventType) {
      event.eventType = eventType;
      // Recalculate status and amount based on eventType
      event.status = mapEventToStatus(eventType);
      if (eventType === 'payment_success') {
        event.amount = amount !== undefined ? amount : generateAmount(eventType);
      } else if (['payment_failed', 'order_cancelled'].includes(eventType)) {
        event.amount = 0;
      } else {
        event.amount = amount !== undefined ? amount : generateAmount(eventType);
      }
    }

    if (status) event.status = status;
    if (amount !== undefined) event.amount = amount;
    if (orderId) event.orderId = orderId;
    if (userId) event.userId = userId;

    // Handle late events
    if (lateMinutes && lateMinutes > 0) {
      const eventDate = new Date(event.eventTime);
      eventDate.setMinutes(eventDate.getMinutes() - lateMinutes);
      event.eventTime = eventDate.toISOString();
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /
 * 
 * API documentation
 */
app.get('/', (req, res) => {
  res.json({
    service: 'E-commerce Event Generator API',
    version: '1.0.0',
    endpoints: {
      'GET /gen/event': 'Generate a single random e-commerce event',
      'GET /gen/events?count=N': `Generate N events (default: ${CONFIG.defaultCount}, max: ${MAX_BATCH_COUNT})`,
      'GET /gen/config': 'Get current API configuration',
      'POST /gen/config': 'Update configuration (distribution, defaultCount, ratePerSec)',
      'POST /gen/emit': 'Generate custom event with overrides',
      'GET /health': 'Health check',
      'GET /': 'API documentation (this page)'
    },
    eventTypes: Object.keys(EVENT_DISTRIBUTION),
    eventDistribution: EVENT_DISTRIBUTION,
    examples: {
      single: `http://localhost:${PORT}/gen/event`,
      batch: `http://localhost:${PORT}/gen/events?count=50`,
      config: `http://localhost:${PORT}/gen/config`,
      health: `http://localhost:${PORT}/health`,
      emit: `curl -X POST http://localhost:${PORT}/gen/emit -H "Content-Type: application/json" -d '{"eventType":"payment_success","amount":1000000}'`
    }
  });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log('='.repeat(70));
  console.log(`🚀 E-commerce Event Generator API`);
  console.log('='.repeat(70));
  console.log(`📍 Port: ${PORT}`);
  console.log(`🔗 Endpoints:`);
  console.log(`   - GET http://localhost:${PORT}/gen/event`);
  console.log(`   - GET http://localhost:${PORT}/gen/events?count=50`);
  console.log(`   - GET http://localhost:${PORT}/gen/config`);
  console.log(`   - GET http://localhost:${PORT}/health`);
  console.log('='.repeat(70));
  console.log(`📊 Event Distribution:`);
  Object.entries(EVENT_DISTRIBUTION).forEach(([type, weight]) => {
    console.log(`   - ${type}: ${weight}%`);
  });
  console.log('='.repeat(70));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  process.exit(0);
});
