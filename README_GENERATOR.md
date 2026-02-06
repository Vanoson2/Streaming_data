# Event Generator System

Hệ thống tạo event e-commerce demo-friendly với REST API (Node.js) và Dashboard UI (React).

## 🚀 Quick Start

### 1. Khởi động API
```bash
cd services/generator-api
npm install
npm start
```
API sẽ chạy tại: http://localhost:7070

### 2. Khởi động UI
```bash
cd generator-ui
npm install
npm run dev
```
UI sẽ chạy tại: http://localhost:5174

## 📁 Cấu trúc Project

```
.
├── services/
│   └── generator-api/          # Node.js REST API (port 7070)
│       ├── server.js
│       ├── package.json
│       └── README.md
├── generator-ui/               # React Dashboard (port 5174)
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── services/          # API client
│   │   ├── types/             # TypeScript types
│   │   └── App.tsx
│   ├── package.json
│   └── README.md
└── README.md                   # This file
```

## 🔌 API Endpoints

### GET /gen/event
Tạo 1 event ngẫu nhiên

```bash
curl http://localhost:7070/gen/event
```

### GET /gen/events?count=50
Tạo batch events (max 500)

```bash
curl http://localhost:7070/gen/events?count=100
```

### POST /gen/emit
Tạo event với parameters custom

```bash
curl -X POST http://localhost:7070/gen/emit \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "payment_success",
    "amount": 1500000,
    "lateMinutes": 3
  }'
```

### GET /gen/config
Xem cấu hình hiện tại

```bash
curl http://localhost:7070/gen/config
```

### POST /gen/config
Cập nhật distribution

```bash
curl -X POST http://localhost:7070/gen/config \
  -H "Content-Type: application/json" \
  -d '{
    "distribution": {
      "order_created": 0.3,
      "payment_initiated": 0.25,
      "payment_success": 0.35,
      "payment_failed": 0.08,
      "order_cancelled": 0.02
    },
    "ratePerSec": 10
  }'
```

### GET /health
Health check

```bash
curl http://localhost:7070/health
```

## 📊 Event Schema

```json
{
  "id": "uuid",
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

## 🎯 Event Distribution (Default)

- `order_created`: 30%
- `payment_initiated`: 25%
- `payment_success`: 35%
- `payment_failed`: 8%
- `order_cancelled`: 2%

## 💡 Business Rules

### Amount Logic
- **payment_success**: 50,000 - 5,000,000 VND
- **payment_initiated**: 50,000 - 3,000,000 VND
- **order_created**: 50,000 - 3,000,000 VND
- **payment_failed**: 0 VND
- **order_cancelled**: 0 VND

### Status Mapping
- **pending**: order_created, payment_initiated
- **success**: payment_success
- **failed**: payment_failed, order_cancelled

## 🎨 UI Features

1. **Connection Status**: Real-time API monitoring
2. **Quick Emit**: Tạo 1 event với parameters custom
3. **Batch Emit**: Tạo nhiều events cùng lúc
4. **Auto Emit**: Tự động tạo events liên tục (1-100/sec)
5. **Distribution Editor**: Chỉnh sửa tỷ lệ phân phối
6. **Event Log**: Xem 50 events gần nhất + JSON detail

## 🛠️ Tech Stack

### API
- Node.js 18+
- Express 4.x
- UUID, CORS, dotenv

### UI
- React 18
- TypeScript
- Vite
- Tailwind CSS

## 📝 Notes

- Không dùng database (in-memory)
- Không dùng websocket (polling)
- Không dùng Next.js
- Port API: 7070
- Port UI: 5174

## 📚 Documentation

- API: [services/generator-api/README.md](services/generator-api/README.md)
- UI: [generator-ui/README.md](generator-ui/README.md)
