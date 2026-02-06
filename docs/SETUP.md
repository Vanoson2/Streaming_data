# 🚀 Setup Guide - E-commerce Realtime System

Hướng dẫn chạy project cho người mới pull code về.

## 📋 Yêu cầu hệ thống

Cài đặt trước:
- **Node.js 18+** - https://nodejs.org
- **Python 3.9+** - https://python.org
- **Docker Desktop** - https://docker.com/products/docker-desktop

## 📥 Clone Project

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

## ⚙️ Setup & Run

### 1️⃣ Khởi động Infrastructure (Docker)

```bash
cd infra
docker-compose up -d
```

Chờ ~30s để Kafka, Zookeeper, PostgreSQL khởi động.

**Verify:**
```bash
docker-compose ps
# Tất cả container phải status "Up" và "healthy"
```

### 2️⃣ Khởi động Generator API

```bash
cd ../services/generator-api
npm install
npm start
```

**Test API:**
```bash
curl http://localhost:7070/health
# Response: {"ok": true, "time": "..."}
```

➡️ **Để lại terminal này chạy**, mở terminal mới cho bước tiếp.

### 3️⃣ Khởi động Generator UI (Optional - Demo)

```bash
cd ../../generator-ui
npm install
npm run dev
```

**Mở browser:** http://localhost:5174

➡️ **Để lại terminal này chạy**, mở terminal mới cho bước tiếp.

### 4️⃣ Khởi động Producer (Kafka)

```bash
cd ../services/producer-poller
pip install -r requirements.txt
python producer.py
```

**Verify:** Sẽ thấy logs "Polling event from API..." mỗi 5 giây.

➡️ **Để lại terminal này chạy**, mở terminal mới cho bước tiếp.

### 5️⃣ Khởi động Spark Streaming

```bash
cd ../services/spark-streaming
pip install -r requirements.txt
python spark_stream.py
```

**Verify:** Sẽ thấy logs "Starting Spark Streaming..."

### 6️⃣ Khởi động Frontend Dashboard

```bash
cd ../../frontend
npm install
npm run dev
```

**Mở browser:** http://localhost:5173

## ✅ Kiểm tra hoạt động

### Test full pipeline:

1. **Generator UI** (http://localhost:5174):
   - Click "Emit 1 Event" → tạo event
   - Click "Emit Batch" với count=50 → tạo 50 events

2. **Producer logs**: Sẽ thấy "Produced event: ..."

3. **Spark logs**: Sẽ thấy "Processing batch..."

4. **Dashboard** (http://localhost:5173):
   - Tab "Events" → xem realtime events
   - Tab "Dashboard" → xem KPI metrics
   - Tab "Ops" → xem operational metrics

## 🔧 Troubleshooting

### Port đã được sử dụng

**Lỗi:** `EADDRINUSE: address already in use :::7070`

**Fix:**
```bash
# Windows
Get-Process -Id (Get-NetTCPConnection -LocalPort 7070).OwningProcess | Stop-Process -Force

# Linux/Mac
lsof -ti:7070 | xargs kill -9
```

### Docker không khởi động

**Fix:**
```bash
docker-compose down
docker-compose up -d --force-recreate
```

### API không connect được Kafka

**Kiểm tra:** Kafka phải chạy trước API
```bash
cd infra
docker-compose ps kafka
# Status phải là "Up (healthy)"
```

### Python dependencies lỗi

**Fix:**
```bash
# Tạo virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

# Install lại
pip install -r requirements.txt
```

## 📚 Tài liệu chi tiết

- **Architecture:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Backend Setup:** [docs/BACKEND_SETUP.md](docs/BACKEND_SETUP.md)
- **Data Source:** [docs/DATA_SOURCE_SETUP.md](docs/DATA_SOURCE_SETUP.md)
- **Demo Script:** [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md)
- **Generator API:** [services/generator-api/README.md](services/generator-api/README.md)
- **Generator UI:** [generator-ui/README.md](generator-ui/README.md)

## 🎯 Quick Start (Tất cả trong 1)

**PowerShell (Windows):**
```powershell
# Terminal 1: Infrastructure
cd infra; docker-compose up -d

# Terminal 2: Generator API
cd services/generator-api; npm install; npm start

# Terminal 3: Producer
cd services/producer-poller; pip install -r requirements.txt; python producer.py

# Terminal 4: Spark
cd services/spark-streaming; pip install -r requirements.txt; python spark_stream.py

# Terminal 5: Frontend
cd frontend; npm install; npm run dev
```

## 🛑 Dừng tất cả

```bash
# Dừng Docker
cd infra
docker-compose down

# Dừng các service khác: Ctrl+C ở từng terminal
```

## 💡 Tips

1. **Generator UI** (http://localhost:5174) - Dễ nhất để test pipeline
2. Kiểm tra logs ở mỗi terminal để debug
3. Docker phải chạy trước các service khác
4. Mỗi service cần 1 terminal riêng (trừ Docker)

## 📞 Hỗ trợ

Gặp vấn đề? Kiểm tra:
1. Logs của service bị lỗi
2. Ports có bị trùng không (7070, 5173, 5174, 9092, 5432)
3. Docker containers có healthy không: `docker-compose ps`
4. File [docs/BACKEND_SETUP.md](docs/BACKEND_SETUP.md) để debug chi tiết
