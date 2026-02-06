# Event Generator API

REST API for generating e-commerce event data with realistic business logic.

## Features

- **Weighted Event Distribution**: 30% order_created, 25% payment_initiated, 35% payment_success, 8% payment_failed, 2% order_cancelled
- **Business Rule Compliance**: Amount validation based on event type
- **Batch Generation**: Generate 1-500 events per request
- **Health Monitoring**: Built-in health check endpoint
- **Configuration Endpoint**: View current distribution settings

## Quick Start

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start server
npm start

# Development mode with auto-reload
npm run dev
```

## API Endpoints

### 1. Generate Single Event
```bash
GET /gen/event
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "eventTime": "2024-01-20T15:30:45.123Z",
  "eventType": "payment_success",
  "orderId": "ORD-20240120-12345",
  "userId": "USR-67890",
  "amount": 1250000,
  "currency": "VND",
  "status": "success",
  "metadata": {
    "device": "mobile",
    "ip": "192.168.1.100",
    "sessionId": "sess_1705762245_abc123"
  }
}
```

### 2. Generate Multiple Events
```bash
GET /gen/events?count=50
```

**Parameters:**
- `count` (optional): Number of events (1-500, default: 10)

**Response:**
```json
{
  "total": 50,
  "events": [ /* array of events */ ]
}
```

### 3. Health Check
```bash
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T15:30:45.123Z",
  "service": "event-generator-api"
}
```

### 4. Configuration
```bash
GET /gen/config
```

**Response:**
```json
{
  "distribution": {
    "order_created": 30,
    "payment_initiated": 25,
    "payment_success": 35,
    "payment_failed": 8,
    "order_cancelled": 2
  },
  "amountRules": {
    "payment_success": "50,000 - 5,000,000 VND",
    "payment_initiated": "50,000 - 3,000,000 VND",
    "order_created": "50,000 - 3,000,000 VND",
    "payment_failed": "0 VND",
    "order_cancelled": "0 VND"
  }
}
```

## Event Schema

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique event identifier |
| `eventTime` | ISO-8601 | Event timestamp |
| `eventType` | String | Event type (see distribution) |
| `orderId` | String | Order identifier (ORD-YYYYMMDD-XXXXX) |
| `userId` | String | User identifier (USR-XXXXX) |
| `amount` | Number | Transaction amount (VND) |
| `currency` | String | Currency code (VND) |
| `status` | String | Event status (pending/success/failed) |
| `metadata` | Object | Additional context |
| `metadata.device` | String | Device type (mobile/desktop/tablet) |
| `metadata.ip` | String | IP address |
| `metadata.sessionId` | String | Session identifier |

## Business Rules

### Amount Logic
- **payment_success**: 50,000 - 5,000,000 VND
- **payment_initiated**: 50,000 - 3,000,000 VND
- **order_created**: 50,000 - 3,000,000 VND
- **payment_failed**: 0 VND (failed transactions)
- **order_cancelled**: 0 VND (cancelled orders)

### Status Mapping
- **pending**: order_created, payment_initiated
- **success**: payment_success
- **failed**: payment_failed, order_cancelled

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 7070 | Server port |
| `DEFAULT_BATCH_COUNT` | 10 | Default events per batch |
| `MAX_BATCH_COUNT` | 500 | Maximum events per batch |

## Examples

### Single Event
```bash
curl http://localhost:7070/gen/event
```

### Batch of 100 Events
```bash
curl http://localhost:7070/gen/events?count=100
```

### Check Distribution
```bash
curl http://localhost:7070/gen/config
```

## Integration with Producer

The producer service polls this API at regular intervals:

```python
response = requests.get(f"{API_URL}/gen/events?count=50")
events = response.json()['events']
for event in events:
    producer.send('ecommerce-events', event)
```

## Tech Stack

- **Node.js 18+**: Runtime environment
- **Express 4.x**: Web framework
- **UUID 9.x**: Unique identifier generation
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment configuration

## License

MIT
