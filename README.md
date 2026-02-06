# 🚀 E-commerce Realtime Data Pipeline

> **Full-stack realtime analytics platform**: Kafka → Spark Structured Streaming → PostgreSQL → React Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Apache Kafka](https://img.shields.io/badge/Kafka-7.5-red)](https://kafka.apache.org/)
[![Apache Spark](https://img.shields.io/badge/Spark-3.5-orange)](https://spark.apache.org/)

---

## 📖 Giới Thiệu

Hệ thống xử lý và phân tích dữ liệu **realtime** cho nền tảng thương mại điện tử, bao gồm:

- 📊 **Dashboard Realtime**: Hiển thị metrics (GMV, order rate, success rate) cập nhật liên tục
- ⚡ **Stream Processing**: Xử lý hàng triệu events với độ trễ dưới 1 giây
- 🔄 **Auto-scaling**: Pipeline xử lý tự động scale theo volume dữ liệu
- 📈 **Multi-timeframe Analytics**: KPI theo 1 phút, 15 phút, 1 giờ, 24 giờ

### Kiến Trúc Tổng Quan

```
┌─────────────────┐    HTTP GET     ┌──────────────────┐
│ Event Generator │ ◄───────────────│ Producer Poller  │
│   (Node.js)     │                 │    (Python)      │
└─────────────────┘                 └────────┬─────────┘
                                             │ Produce
                                             ▼
                                    ┌──────────────────┐
                                    │   Kafka Broker   │
                                    │  (events_raw)    │
                                    └────────┬─────────┘
                                             │ Stream
                                             ▼
                                    ┌──────────────────┐
                                    │ Spark Streaming  │
                                    │ UC03-UC06 Jobs   │
                                    └────────┬─────────┘
                                             │ Write
                                             ▼
                                    ┌──────────────────┐
                                    │   PostgreSQL     │
                                    │ events_clean +   │
                                    │ kpi_1m tables    │
                                    └────────┬─────────┘
                                             │ Query
                                             ▼
                                    ┌──────────────────┐
                                    │ React Dashboard  │
                                    │   (Port 5173)    │
                                    └──────────────────┘
```

---

## 🛠️ Yêu Cầu Môi Trường

| Tool | Version | Mục đích |
|------|---------|----------|
| **Docker** | 20.10+ | Chạy Kafka, Zookeeper, PostgreSQL |
| **Docker Compose** | 2.0+ | Orchestration infrastructure |
| **Node.js** | 20+ | Event Generator API |
| **Python** | 3.8+ | Producer Poller + Spark |
| **Java** | 11+ | Spark Runtime (JRE) |
| **npm** | 10+ | Frontend dependencies |

### Cài Đặt Nhanh

**Windows**:
```powershell
choco install docker-desktop nodejs python jdk11
```

**macOS**:
```bash
brew install docker node python@3.11 openjdk@11
```

**Linux (Ubuntu)**:
```bash
sudo apt update
sudo apt install docker.io docker-compose nodejs npm python3 python3-pip openjdk-11-jre
```

---

## 📁 Cấu Trúc Project

```
ecommerce-realtime-pipeline/
│
├── backend/
│   ├── api-generator/          # REST API sinh events ngẫu nhiên
│   ├── producer.py             # Poll API → push Kafka
│   ├── spark_stream.py         # Spark Streaming: Kafka → Postgres
│   ├── generator.py            # (Legacy - không dùng)
│   ├── schema.sql              # PostgreSQL schema
│   └── requirements.txt        # Python dependencies
│
├── src/                        # React Dashboard
│   ├── components/
│   ├── features/
│   └── lib/
│
├── docs/                       # Documentation
│   ├── QUICKSTART.md
│   ├── DATA_SOURCE_SETUP.md
│   ├── BACKEND_SETUP.md
│   ├── ARCHITECTURE.md
│   └── GITHUB_SETUP.md
│
├── scripts/                    # Helper scripts
│   ├── start-pipeline.sh
│   └── git-init.sh
│
├── docker-compose.yml          # Infrastructure
├── package.json                # Frontend dependencies
├── vite.config.ts              # Vite configuration
└── README.md                   # 👈 BẠN ĐANG ĐỌC FILE NÀY
```

---

## 🚀 Quick Start

**👉 Xem hướng dẫn chi tiết:** [docs/SETUP.md](docs/SETUP.md)

```powershell
# 1. Start Infrastructure
cd infra && docker-compose up -d

# 2. Start Generator API
cd services/generator-api && npm install && npm start

# 3. Start Producer
cd services/producer-poller && pip install -r requirements.txt && python producer.py

# 4. Start Frontend
cd frontend && npm install && npm run dev
```

**Dashboard:** http://localhost:5173

---

## 📚 Documentation

### Setup & Guides
- **[SETUP.md](docs/SETUP.md)** ⭐ Setup guide cho người mới (bắt đầu từ đây!)
- [BACKEND_SETUP.md](docs/BACKEND_SETUP.md) - Chi tiết cấu hình backend

### Architecture & Design
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Kiến trúc hệ thống
- [DATA_SOURCE_SETUP.md](docs/DATA_SOURCE_SETUP.md) - Cấu hình data source
- [DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) - Script demo

### Components
- [Generator API](docs/readmes/GENERATOR_API.md) - REST API documentation
- [Generator UI](docs/readmes/GENERATOR_UI.md) - React dashboard
- [Environment](docs/readmes/ENV.md) - Environment config

---

### 📋 Chi Tiết Từng Bước

#### **Bước 1: Khởi Động Infrastructure**

```powershell
docker-compose up -d
```

Chờ 30-60 giây để Kafka khởi động hoàn toàn:

```powershell
# Kiểm tra status
docker ps

# Kiểm tra Kafka ready
docker logs kafka | Select-String "started"
```

**Services đang chạy**:
- Zookeeper (port 2181)
- Kafka Broker (port 9092)
- PostgreSQL (port 5432)

#### **Bước 2: Chạy API Generator**

```powershell
cd backend/api-generator
npm install
npm start
```

**Test API**:
```powershell
curl http://localhost:7070/gen/event
```

#### **Bước 3: Chạy Producer Poller**

Mở terminal mới:

```powershell
pip install -r backend/requirements.txt
python backend/producer.py
```

**Log thành công**:
```
✅ Connected to Kafka: localhost:9092
📥 Pulled event from API: payment_success | Order: ORD-...
📤 Produced to Kafka: topic=events_raw | partition=1 | offset=42
```

#### **Bước 4: Chạy Spark Streaming**

Mở terminal mới:

```powershell
python backend/spark_stream.py
```

**Log thành công**:
```
✅ Spark Streaming started
✅ Reading from Kafka: events_raw
📊 Processing batch 1 with 100 events
✅ Written to PostgreSQL
```

#### **Bước 5: Chạy Frontend**

Mở terminal mới:

```powershell
npm install
npm run dev
```

Mở browser: **http://localhost:5173**

---

## 🎬 Demo Nhanh (Cho Bảo Vệ Đồ Án)

### Scenario 1: Realtime Pipeline Hoàn Chỉnh

```powershell
# 1. Start tất cả services (3-5 phút)
docker-compose up -d
cd backend/api-generator && npm start &
python backend/producer.py &
python backend/spark_stream.py &
npm run dev

# 2. Mở dashboard: http://localhost:5173
# 3. Giải thích:
#    - Events từ API Generator → Producer → Kafka
#    - Spark đọc Kafka → xử lý → ghi Postgres
#    - Dashboard query Postgres → hiển thị realtime
```

### Scenario 2: Kiểm Tra Kafka Consumer

```powershell
docker exec -it kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic events_raw \
  --from-beginning \
  --max-messages 10
```

### Scenario 3: Kiểm Tra PostgreSQL

```powershell
docker exec -it postgres psql -U app -d realtime

# Query KPI
SELECT * FROM kpi_1m ORDER BY window_start DESC LIMIT 5;

# Query events
SELECT event_type, COUNT(*) FROM events_clean GROUP BY event_type;
```

### Scenario 4: Stop Toàn Bộ

```powershell
# Stop Python processes (Ctrl+C trong từng terminal)
# Stop Node.js (Ctrl+C)
# Stop Docker
docker-compose down
```

---

## 📊 Các Use Cases Đã Implement

| Use Case | Mô tả | Status |
|----------|-------|--------|
| **UC03** | Parse & Validate Events | ✅ Hoàn thành |
| **UC04** | Clean & Deduplicate | ✅ Hoàn thành |
| **UC05** | Calculate KPIs (1 min window) | ✅ Hoàn thành |
| **UC06** | Persist to PostgreSQL | ✅ Hoàn thành |

---

## 🔧 Configuration

### Environment Variables

**Producer Poller** (`backend/.env`):
```env
API_URL=http://localhost:7070/gen/event
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
KAFKA_TOPIC=events_raw
POLL_INTERVAL_MS=500
```

**Spark Streaming**:
```python
# backend/spark_stream.py
KAFKA_BOOTSTRAP_SERVERS = "localhost:9092"
POSTGRES_HOST = "localhost"
POSTGRES_PORT = 5432
POSTGRES_DB = "realtime"
```

**Frontend** (`vite.config.ts`):
```typescript
server: {
  port: 5173,
  proxy: {
    '/api': 'http://localhost:8080'  // Nếu có API backend
  }
}
```

---

## 🐛 Troubleshooting

### Kafka Connection Error

**Triệu chứng**: `NoBrokersAvailable`

**Giải pháp**:
```powershell
docker-compose restart kafka
# Chờ 30s
docker logs kafka | Select-String "started"
```

### PostgreSQL Connection Error

**Triệu chứng**: `Connection refused to localhost:5432`

**Giải pháp**:
```powershell
docker ps  # Check postgres running
docker logs postgres

# Nếu cần init lại schema
docker exec -it postgres psql -U app -d realtime -f /docker-entrypoint-initdb.d/init.sql
```

### Frontend Build Error

**Triệu chứng**: `Module not found`

**Giải pháp**:
```powershell
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 📚 Documentation Chi Tiết

- [📖 QUICKSTART.md](docs/QUICKSTART.md) - Hướng dẫn chạy nhanh
- [🔧 DATA_SOURCE_SETUP.md](docs/DATA_SOURCE_SETUP.md) - Thiết lập nguồn dữ liệu (API → Kafka)
- [⚙️ BACKEND_SETUP.md](docs/BACKEND_SETUP.md) - Spark Streaming & PostgreSQL
- [🏗️ ARCHITECTURE.md](docs/ARCHITECTURE.md) - Kiến trúc hệ thống
- [🐙 GITHUB_SETUP.md](docs/GITHUB_SETUP.md) - Push lên GitHub

---

## 🔄 Chế Độ MOCK vs REAL

### MOCK Mode (Default)

API Generator tự tạo dữ liệu ngẫu nhiên - phù hợp demo:

```javascript
// backend/api-generator/server.js
const eventType = weightedRandom(EVENT_TYPES);  // Random events
```

### REAL Mode (Tích Hợp API Thật)

Sửa `backend/producer.py` để call API thật thay vì API Generator:

```python
# Thay vì
API_URL = 'http://localhost:7070/gen/event'

# Thành
API_URL = 'https://your-real-api.com/events'
```

---

## 🎓 Tech Stack

### Backend
- **Apache Kafka 7.5.0** - Distributed streaming platform
- **Apache Spark 3.5.0** - Stream processing engine
- **PostgreSQL 15** - Relational database
- **Python 3.11** - Scripting & Spark jobs
- **Node.js 20** - Event Generator API

### Frontend
- **React 18.3** - UI framework
- **TypeScript 5.3** - Type safety
- **Vite 5.4** - Build tool
- **TailwindCSS 3.4** - Styling

### DevOps
- **Docker & Docker Compose** - Containerization
- **Git** - Version control

---

## 📝 TODO / Future Enhancements

- [ ] Thêm API backend cho dashboard (hiện tại query trực tiếp Postgres từ frontend)
- [ ] Thêm authentication (JWT)
- [ ] Thêm monitoring (Prometheus + Grafana)
- [ ] Thêm alerting (khi error rate > threshold)
- [ ] Scale Kafka lên 3 brokers
- [ ] Thêm unit tests (Jest, pytest)

---

## 👥 Contributors

- **Your Name** - Initial work

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Apache Kafka & Spark communities
- React & Vite teams
- Docker team

---

**⭐ Nếu project hữu ích, đừng quên star repo!**

**📧 Contact**: your.email@example.com
