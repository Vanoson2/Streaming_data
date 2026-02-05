# ⚡ QUICKSTART - 5 Phút Chạy Pipeline

Hướng dẫn nhanh để chạy pipeline realtime trong 5 phút.

---

## ✅ Yêu cầu đã cài

- ✅ Docker Desktop
- ✅ Java 11 hoặc 17
- ✅ Python 3.8+
- ✅ Node.js 18+ (cho frontend)

---

## 🚀 Bước 1: Setup Python Environment (1 phút)

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# Cài packages
pip install -r requirements.txt
```

---

## 🐳 Bước 2: Start Infrastructure (30 giây)

```bash
# Quay lại thư mục root
cd ..

# Windows
scripts\start-pipeline.bat

# macOS/Linux
./scripts/start-pipeline.sh
```

**Hoặc chạy thủ công:**
```bash
docker-compose up -d
```

Đợi 30 giây để Kafka và PostgreSQL khởi động.

---

## 📊 Bước 3: Chạy Event Generator (10 giây)

**Terminal 1:**
```bash
cd backend
# Kích hoạt venv nếu chưa
python generator.py
```

Bạn sẽ thấy:
```
🚀 E-COMMERCE EVENT GENERATOR
✅ Kafka producer connected
🟢 Starting event generation...
📊 Sent 10 events | Last: payment_success...
```

---

## ⚡ Bước 4: Chạy Spark Streaming (30 giây)

**Terminal 2 (mở terminal mới):**
```bash
cd backend
# Kích hoạt venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

python spark_stream.py
```

**Lần đầu chạy**: Spark sẽ tải JAR files (1-2 phút), sau đó bạn sẽ thấy:
```
🚀 SPARK STRUCTURED STREAMING
✅ Streaming queries started!
✅ Batch 0: Wrote 15 rows to events_clean
✅ Batch 0: Wrote 1 rows to kpi_1m
```

---

## 🌐 Bước 5: Chạy Frontend (10 giây)

**Terminal 3 (mở terminal mới):**
```bash
# Từ thư mục root
npm run dev
```

Mở browser: **http://localhost:3000**

---

## ✅ Kiểm tra Pipeline Hoạt Động

### Kiểm tra PostgreSQL
```bash
docker exec -it postgres psql -U app -d realtime

# Trong psql:
SELECT COUNT(*) FROM events_clean;
SELECT COUNT(*) FROM kpi_1m;

# Xem KPIs gần nhất
SELECT * FROM kpi_1m ORDER BY window_start DESC LIMIT 5;

# Thoát
\q
```

### Kiểm tra Frontend
1. Vào **Dashboard** - thấy KPI cards với số liệu
2. Vào **Events** - thấy table với events
3. Vào **Ops** - thấy system health

---

## 🛑 Dừng Pipeline

```bash
# Terminal 1 (Generator): Ctrl+C
# Terminal 2 (Spark): Ctrl+C
# Terminal 3 (Frontend): Ctrl+C

# Dừng Docker
docker-compose down
```

---

## ❓ Lỗi Thường Gặp

### Lỗi: Cannot connect to Kafka
- Đợi thêm 30 giây sau khi `docker-compose up`
- Chạy: `docker ps` để xem containers đang chạy

### Lỗi: ModuleNotFoundError
- Activate virtual environment: `venv\Scripts\activate`
- Reinstall: `pip install -r requirements.txt`

### Lỗi: Spark JAR download failed
- Kiểm tra internet connection
- Xem phần Troubleshooting trong [BACKEND_SETUP.md](BACKEND_SETUP.md)

---

## 📖 Tài liệu chi tiết

- **[BACKEND_SETUP.md](BACKEND_SETUP.md)** - Hướng dẫn đầy đủ từng bước
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Giải thích kiến trúc
- **[../README.md](../README.md)** - Overview toàn bộ project

---

**🎉 Chúc mừng! Pipeline của bạn đã chạy!**
