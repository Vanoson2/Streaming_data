# 🔧 Data Source Setup Guide

Hướng dẫn thiết lập nguồn dữ liệu cho hệ thống realtime theo kiến trúc:

```
API Generator → Kafka Producer Poller → Kafka (events_raw) → Spark → PostgreSQL
```

---

## 📋 Kiến Trúc Data Ingestion

```
┌─────────────────┐      HTTP GET       ┌──────────────────┐
│  API Generator  │ <─────────────────  │ Producer Poller  │
│   (Node.js)     │                     │    (Python)      │
│   Port: 7070    │                     │                  │
└─────────────────┘                     └────────┬─────────┘
                                                 │ Kafka Send
                                                 ▼
                                        ┌──────────────────┐
                                        │  Kafka Broker    │
                                        │  Topic:          │
                                        │  events_raw      │
                                        └──────────────────┘
```

### Tại Sao Tách Riêng API Generator?

✅ **Mô phỏng thực tế**: Trong production, data thường đến từ external APIs  
✅ **Decoupling**: API và Producer độc lập, dễ scale  
✅ **Testing**: Có thể test từng component riêng lẻ  
✅ **Flexibility**: Dễ thêm authentication, rate limiting, caching...

---

## 🛠️ Bước 1: Cài Đặt Cần Thiết

### 1.1. Node.js (cho API Generator)

**Windows**:
```powershell
# Tải từ: https://nodejs.org/ (LTS version)
# Hoặc dùng Chocolatey:
choco install nodejs-lts

# Verify
node --version  # v20.x.x
npm --version   # v10.x.x
```

**Linux/macOS**:
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS
brew install node

# Verify
node --version
npm --version
```

### 1.2. Python 3.8+ (cho Producer Poller)

**Windows**:
```powershell
# Tải từ: https://www.python.org/downloads/
# Hoặc:
choco install python

# Verify
python --version  # 3.8+
pip --version
```

**Linux/macOS**:
```bash
# Ubuntu/Debian
sudo apt-get install python3 python3-pip

# macOS
brew install python@3.11

# Verify
python3 --version
pip3 --version
```

### 1.3. Docker (cho Kafka)

**Windows**:
- Tải Docker Desktop: https://www.docker.com/products/docker-desktop/
- Enable WSL 2 backend

**Linux**:
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

**Verify**:
```bash
docker --version
docker-compose --version
```

---

## 🚀 Bước 2: Chạy Kafka (Docker Compose)

### 2.1. Start Kafka Cluster

```powershell
# Windows PowerShell
cd D:\Detai\code
docker-compose up -d zookeeper kafka postgres

# Linux/macOS
docker compose up -d zookeeper kafka postgres
```

### 2.2. Verify Kafka Running

```powershell
# Check containers
docker ps

# Expected output:
# CONTAINER ID   IMAGE                             STATUS
# xxxxx          confluentinc/cp-kafka:7.5.0      Up
# xxxxx          confluentinc/cp-zookeeper:7.5.0  Up
# xxxxx          postgres:15-alpine               Up
```

### 2.3. Create Kafka Topic (Optional)

```powershell
# Auto-create is enabled, but you can manually create:
docker exec -it kafka kafka-topics --create \
  --bootstrap-server localhost:9092 \
  --topic events_raw \
  --partitions 3 \
  --replication-factor 1

# List topics
docker exec -it kafka kafka-topics --list --bootstrap-server localhost:9092
```

---

## 🌐 Bước 3: Chạy API Generator

### 3.1. Cài Đặt Dependencies

```powershell
cd backend/api-generator
npm install
```

### 3.2. Start API Generator

**Development Mode** (auto-reload):
```powershell
npm run dev
```

**Production Mode**:
```powershell
npm start
```

### 3.3. Test API

```powershell
# PowerShell
Invoke-WebRequest -Uri "http://localhost:7070/gen/event" -Method GET | Select-Object -Expand Content

# Bash/Linux
curl http://localhost:7070/gen/event

# Expected response:
# {
#   "id": "550e8400-e29b-41d4-a716-446655440000",
#   "eventTime": "2026-02-06T03:30:45.123Z",
#   "eventType": "payment_success",
#   "orderId": "ORD-1707191445123-abc",
#   "userId": "USER-5432",
#   "amount": 1250000,
#   "currency": "VND",
#   "status": "success",
#   "metadata": { "device": "mobile" }
# }
```

### 3.4. Health Check

```powershell
curl http://localhost:7070/health

# Response:
# { "status": "UP", "timestamp": "...", "service": "event-generator-api" }
```

---

## 🔄 Bước 4: Chạy Producer Poller

### 4.1. Cài Đặt Python Dependencies

```powershell
cd backend
pip install -r requirements.txt
```

### 4.2. Start Producer Poller

```powershell
python producer.py
```

**Expected Output**:
```
======================================================================
🚀 Kafka Producer Poller Starting...
======================================================================
API URL: http://localhost:7070/gen/event
Kafka: localhost:9092
Topic: events_raw
Poll Interval: 500ms
======================================================================
✅ Connected to Kafka: localhost:9092
📥 Pulled event from API: payment_success | Order: ORD-1707191445123-abc
📤 Produced to Kafka: topic=events_raw | partition=1 | offset=42 | ...
```

### 4.3. Configuration (Optional)

Tạo file `.env` hoặc set environment variables:

```env
# API Configuration
API_URL=http://localhost:7070/gen/event
API_TIMEOUT=5

# Kafka Configuration
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
KAFKA_TOPIC=events_raw

# Polling Configuration
POLL_INTERVAL_MS=500       # 500ms = 2 events/sec
MAX_RETRIES=3
RETRY_DELAY_SEC=2
```

Load `.env` file:
```powershell
# PowerShell
Get-Content backend\.env | ForEach-Object {
  $name, $value = $_.split('=')
  Set-Content env:\$name $value
}
python backend/producer.py
```

---

## ✅ Bước 5: Kiểm Tra Dữ Liệu Trong Kafka

### 5.1. Kafka Console Consumer

**PowerShell**:
```powershell
docker exec -it kafka kafka-console-consumer `
  --bootstrap-server localhost:9092 `
  --topic events_raw `
  --from-beginning `
  --max-messages 10
```

**Linux/macOS**:
```bash
docker exec -it kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic events_raw \
  --from-beginning \
  --max-messages 10
```

**Expected Output**:
```json
{"id":"550e8400-...","eventTime":"2026-02-06T...","eventType":"order_created",...}
{"id":"660f9511-...","eventTime":"2026-02-06T...","eventType":"payment_success",...}
{"id":"770a0622-...","eventTime":"2026-02-06T...","eventType":"payment_initiated",...}
...
```

### 5.2. Check Consumer Lag

```powershell
docker exec -it kafka kafka-consumer-groups \
  --bootstrap-server localhost:9092 \
  --describe \
  --all-groups
```

### 5.3. Monitor Kafka Topics

```powershell
# List all topics
docker exec -it kafka kafka-topics --list --bootstrap-server localhost:9092

# Describe topic
docker exec -it kafka kafka-topics --describe --bootstrap-server localhost:9092 --topic events_raw
```

---

## 📊 Luồng Dữ Liệu Chi Tiết

```
Step 1: API Generator generates random event
  ├── eventType: weighted random (40% order_created, 25% payment_initiated, ...)
  ├── amount: > 0 for payment_success, 0 for others
  └── eventTime: current UTC time

Step 2: Producer Poller polls API every 500ms
  ├── HTTP GET http://localhost:7070/gen/event
  ├── Receive JSON event
  └── Retry with backoff if API fails

Step 3: Producer sends to Kafka
  ├── Topic: events_raw
  ├── Key: orderId (for partitioning)
  ├── Value: JSON event (serialized)
  └── Wait for ack from all replicas

Step 4: Kafka stores event
  ├── Partition: based on orderId hash
  ├── Offset: auto-increment
  └── Retention: 24 hours (configurable)

Step 5: Consumers read from Kafka
  └── Spark Structured Streaming (next step)
```

---

## 🛑 Dừng Services

### Stop Producer Poller
```powershell
# Press Ctrl+C in terminal running producer.py
```

### Stop API Generator
```powershell
# Press Ctrl+C in terminal running npm start
```

### Stop Kafka
```powershell
docker-compose down
# hoặc giữ data:
docker-compose stop
```

---

## 🐛 Troubleshooting

### Lỗi 1: API Generator không chạy

**Triệu chứng**:
```
Error: Cannot find module 'express'
```

**Giải pháp**:
```powershell
cd backend/api-generator
npm install
```

### Lỗi 2: Producer không connect được Kafka

**Triệu chứng**:
```
❌ Failed to connect to Kafka: NoBrokersAvailable
```

**Giải pháp**:
```powershell
# Kiểm tra Kafka running
docker ps | Select-String kafka

# Restart Kafka
docker-compose restart kafka

# Check logs
docker logs kafka
```

### Lỗi 3: Producer không poll được API

**Triệu chứng**:
```
🔌 API connection error (attempt 1/3)
```

**Giải pháp**:
```powershell
# Kiểm tra API running
curl http://localhost:7070/health

# Check firewall/port
netstat -an | Select-String 7070

# Restart API
cd backend/api-generator
npm start
```

### Lỗi 4: Python requests module missing

**Triệu chứng**:
```
ModuleNotFoundError: No module named 'requests'
```

**Giải pháp**:
```powershell
pip install -r backend/requirements.txt
```

---

## 📈 Monitoring & Metrics

### API Generator Logs
```
[2026-02-06T03:30:45.123Z] Generated event: payment_success | Order: ORD-... | Amount: 1,250,000 VND
```

### Producer Poller Logs
```
📥 Pulled event from API: payment_success | Order: ORD-...
📤 Produced to Kafka: topic=events_raw | partition=1 | offset=42
📊 Stats: Pulled=100 | Produced=98 | Failed=2
```

### Kafka Metrics
```powershell
# Topic info
docker exec -it kafka kafka-topics --describe --bootstrap-server localhost:9092 --topic events_raw

# Consumer groups
docker exec -it kafka kafka-consumer-groups --bootstrap-server localhost:9092 --list
```

---

## 🎓 Mở Rộng

### Tăng Event Rate

Thay đổi `POLL_INTERVAL_MS` trong `producer.py`:
```python
POLL_INTERVAL_MS = 100  # 100ms = 10 events/sec
```

### Chạy Multiple Producers

```powershell
# Terminal 1
$env:POLL_INTERVAL_MS="500"; python backend/producer.py

# Terminal 2
$env:POLL_INTERVAL_MS="500"; python backend/producer.py
```

### Thêm Authentication cho API

Trong `backend/api-generator/server.js`:
```javascript
app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== 'YOUR_SECRET_KEY') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});
```

### Scale API Generator

```powershell
docker-compose up -d --scale api-generator=3
```

---

## ✅ Checklist

- [ ] Node.js installed (v20+)
- [ ] Python installed (3.8+)
- [ ] Docker & Docker Compose installed
- [ ] Kafka running (`docker ps`)
- [ ] API Generator running (port 7070)
- [ ] Producer Poller running
- [ ] Dữ liệu xuất hiện trong Kafka (`kafka-console-consumer`)
- [ ] Logs không có lỗi

---

**🎉 Setup hoàn tất! Giờ bạn có nguồn dữ liệu realtime cho Spark Streaming.**

Next steps: [BACKEND_SETUP.md](./BACKEND_SETUP.md) - Chạy Spark Streaming
