# 🚀 HƯỚNG DẪN CHẠY REALTIME PIPELINE - E-COMMERCE

Pipeline xử lý dữ liệu realtime cho hệ thống TMĐT:
**Event Generator → Kafka → Spark Structured Streaming → PostgreSQL → API Node → Frontend**

---

## 📋 MỤC LỤC
1. [Cài Đặt Môi Trường](#1-cài-đặt-môi-trường)
2. [Khởi Động Hạ Tầng (Docker)](#2-khởi-động-hạ-tầng-docker)
3. [Chạy Event Generator](#3-chạy-event-generator)
4. [Chạy Spark Streaming](#4-chạy-spark-streaming)
5. [Kiểm Tra Dữ Liệu](#5-kiểm-tra-dữ-liệu)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. CÀI ĐẶT MÔI TRƯỜNG

### 1.1. Yêu Cầu Hệ Thống
- **OS**: Windows 10/11, macOS, Linux
- **RAM**: Tối thiểu 8GB (khuyên dùng 16GB)
- **Disk**: Tối thiểu 10GB trống

### 1.2. Cài Đặt Docker Desktop
```bash
# Windows/macOS: Tải Docker Desktop
https://www.docker.com/products/docker-desktop/

# Linux (Ubuntu/Debian):
sudo apt-get update
sudo apt-get install docker.io docker-compose

# Kiểm tra cài đặt
docker --version
docker-compose --version
```

### 1.3. Cài Đặt Java (cho Spark)
```bash
# Windows: Tải Java 11 hoặc 17 JDK
https://adoptium.net/

# macOS:
brew install openjdk@11

# Linux:
sudo apt-get install openjdk-11-jdk

# Kiểm tra
java -version
# Phải thấy: openjdk version "11.x.x" hoặc "17.x.x"
```

**Windows**: Đặt biến môi trường:
- `JAVA_HOME` = `C:\Program Files\Eclipse Adoptium\jdk-11.x.x-hotspot`
- Thêm `%JAVA_HOME%\bin` vào `PATH`

### 1.4. Cài Đặt Python 3.8+
```bash
# Kiểm tra phiên bản
python --version
# hoặc
python3 --version

# Windows: Tải từ python.org
https://www.python.org/downloads/

# macOS:
brew install python@3.11

# Linux:
sudo apt-get install python3 python3-pip
```

### 1.5. Cài Đặt Python Dependencies
```bash
cd backend

# Tạo virtual environment (khuyên dùng)
python -m venv venv

# Kích hoạt virtual environment
# Windows:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate

# Cài đặt packages
pip install -r requirements.txt
```

---

## 2. KHỞI ĐỘNG HẠ TẦNG (DOCKER)

### 2.1. Khởi Động Kafka & PostgreSQL
```bash
# Từ thư mục gốc của project (chứa docker-compose.yml)
docker-compose up -d

# Xem logs
docker-compose logs -f

# Kiểm tra containers đang chạy
docker ps
# Phải thấy 3 containers: zookeeper, kafka, postgres
```

### 2.2. Đợi Services Sẵn Sàng
```bash
# Đợi khoảng 30 giây để Kafka và PostgreSQL khởi động

# Kiểm tra Kafka
docker exec -it kafka kafka-topics --bootstrap-server localhost:9092 --list
# Nếu không có lỗi => Kafka OK

# Kiểm tra PostgreSQL
docker exec -it postgres psql -U app -d realtime -c "\dt"
# Phải thấy 2 bảng: events_clean, kpi_1m
```

### 2.3. Tạo Kafka Topics (Tự Động)
Kafka đã được cấu hình auto-create topics, nhưng bạn có thể tạo thủ công:
```bash
docker exec -it kafka kafka-topics \
  --bootstrap-server localhost:9092 \
  --create --topic events_raw \
  --partitions 3 \
  --replication-factor 1
```

---

## 3. CHẠY EVENT GENERATOR

Generator sẽ sinh event giả lập và gửi vào Kafka topic `events_raw`.

### 3.1. Chạy Generator
```bash
cd backend

# Kích hoạt virtual environment (nếu chưa)
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Chạy generator
python generator.py
```

### 3.2. Kết Quả Mong Đợi
```
======================================================================
🚀 E-COMMERCE EVENT GENERATOR
======================================================================
📡 Kafka: ['localhost:9092']
📝 Topic: events_raw
⚡ Rate: 5 events/second
======================================================================

✅ Kafka producer connected to ['localhost:9092']
🟢 Starting event generation... (Press Ctrl+C to stop)

📊 Sent 10 events | Last: payment_success | Order: ORD123456 | Amount: 1234567.89 VND
📊 Sent 20 events | Last: order_created | Order: ORD789012 | Amount: 567890.12 VND
...
```

### 3.3. Điều Chỉnh Tốc Độ Event
Mở [backend/generator.py](backend/generator.py) và sửa dòng:
```python
EVENTS_PER_SECOND = 5  # Tăng hoặc giảm số này
```

### 3.4. Kiểm Tra Events Trong Kafka
```bash
# Terminal mới
docker exec -it kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic events_raw \
  --from-beginning \
  --max-messages 10
```

---

## 4. CHẠY SPARK STREAMING

Spark Streaming sẽ đọc từ Kafka, xử lý, và ghi vào PostgreSQL.

### 4.1. Chạy Spark Job
```bash
cd backend

# Kích hoạt virtual environment (nếu chưa)
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Chạy Spark Streaming
python spark_stream.py
```

**⚠️ LƯU Ý**: Lần đầu chạy, Spark sẽ tự động tải các JAR files (Kafka connector, PostgreSQL JDBC). Quá trình này mất khoảng 1-2 phút.

### 4.2. Kết Quả Mong Đợi
```
======================================================================
🚀 SPARK STRUCTURED STREAMING - E-COMMERCE PIPELINE
======================================================================
📡 Kafka: localhost:9092
📝 Topic: events_raw
🗄️  PostgreSQL: jdbc:postgresql://localhost:5432/realtime
📂 Checkpoint: ./checkpoints/spark_stream
======================================================================

📖 Reading from Kafka...
🔍 UC03: Parsing and validating events...
🧹 UC04: Cleaning and deduplicating...
📊 UC05: Calculating KPIs...
💾 UC06: Setting up persistence to PostgreSQL...
✅ Streaming queries started!
🟢 Pipeline is running... (Press Ctrl+C to stop)

✅ Batch 0: Wrote 15 rows to events_clean
✅ Batch 0: Wrote 1 rows to kpi_1m
✅ Batch 1: Wrote 28 rows to events_clean
✅ Batch 1: Wrote 2 rows to kpi_1m
...
```

### 4.3. Giải Thích Các Use Case
- **UC03 - Parse & Validate**: Đọc JSON từ Kafka, validate schema và business rules
- **UC04 - Clean & Deduplicate**: Chuẩn hóa timestamp, loại bỏ duplicate theo `id`, watermark 5 phút
- **UC05 - Calculate KPIs**: Tính revenue, orders, success rate theo window 1 phút
- **UC06 - Persist**: Ghi vào PostgreSQL với checkpoint để đảm bảo exactly-once

---

## 5. KIỂM TRA DỮ LIỆU

### 5.1. Kiểm Tra PostgreSQL Trực Tiếp
```bash
# Kết nối vào PostgreSQL container
docker exec -it postgres psql -U app -d realtime
```

**Query 1: Xem events gần nhất**
```sql
SELECT * FROM events_clean ORDER BY event_time DESC LIMIT 10;
```

**Query 2: Xem KPIs gần nhất**
```sql
SELECT * FROM kpi_1m ORDER BY window_start DESC LIMIT 10;
```

**Query 3: Tổng revenue 15 phút gần nhất**
```sql
SELECT * FROM v_kpi_15m;
```

**Query 4: Tổng revenue 1 giờ gần nhất**
```sql
SELECT * FROM v_kpi_1h;
```

**Query 5: Thống kê theo event type**
```sql
SELECT event_type, COUNT(*), SUM(amount) 
FROM events_clean 
GROUP BY event_type 
ORDER BY COUNT(*) DESC;
```

### 5.2. Kiểm Tra Qua DBeaver/pgAdmin
Thông tin kết nối:
- **Host**: localhost
- **Port**: 5432
- **Database**: realtime
- **User**: app
- **Password**: app

---

## 6. TROUBLESHOOTING

### 6.1. Docker Không Khởi Động
```bash
# Xem logs chi tiết
docker-compose logs kafka
docker-compose logs postgres

# Restart tất cả
docker-compose down
docker-compose up -d
```

### 6.2. Kafka Connection Refused
**Nguyên nhân**: Kafka chưa sẵn sàng hoặc port conflict.

**Giải pháp**:
```bash
# Kiểm tra port 9092
# Windows:
netstat -ano | findstr :9092

# macOS/Linux:
lsof -i :9092

# Restart Kafka
docker-compose restart kafka

# Đợi 30 giây rồi thử lại
```

### 6.3. Spark Không Tải Được JAR Files
**Nguyên nhân**: Maven repository không accessible.

**Giải pháp**:
```bash
# Tải JAR files thủ công
cd backend
mkdir -p jars

# Tải Kafka connector
curl -O https://repo1.maven.org/maven2/org/apache/spark/spark-sql-kafka-0-10_2.12/3.5.0/spark-sql-kafka-0-10_2.12-3.5.0.jar

# Tải PostgreSQL JDBC
curl -O https://jdbc.postgresql.org/download/postgresql-42.6.0.jar

# Sửa spark_stream.py, thay dòng .config('spark.jars.packages', ...) bằng:
.config('spark.jars', './jars/spark-sql-kafka-0-10_2.12-3.5.0.jar,./jars/postgresql-42.6.0.jar')
```

### 6.4. PostgreSQL - Lỗi "relation does not exist"
**Nguyên nhân**: Schema chưa được khởi tạo.

**Giải pháp**:
```bash
# Chạy lại schema
docker exec -it postgres psql -U app -d realtime -f /docker-entrypoint-initdb.d/01-schema.sql

# Hoặc thủ công
docker cp backend/schema.sql postgres:/tmp/
docker exec -it postgres psql -U app -d realtime -f /tmp/schema.sql
```

### 6.5. Generator - ModuleNotFoundError: kafka
**Nguyên nhân**: Chưa cài package hoặc chưa activate virtual environment.

**Giải pháp**:
```bash
# Kích hoạt venv
cd backend
source venv/bin/activate  # macOS/Linux
# hoặc
venv\Scripts\activate  # Windows

# Cài lại
pip install -r requirements.txt
```

### 6.6. Spark - Java Heap Space Error
**Nguyên nhân**: Không đủ RAM.

**Giải pháp**:
Sửa [backend/spark_stream.py](backend/spark_stream.py), thêm cấu hình:
```python
.config('spark.driver.memory', '2g') \
.config('spark.executor.memory', '2g') \
```

---

## 7. KIẾN TRÚC TỔNG QUAN

```
┌─────────────┐      ┌───────┐      ┌───────────┐      ┌────────────┐
│  Generator  │─────▶│ Kafka │─────▶│   Spark   │─────▶│ PostgreSQL │
│  (Python)   │ JSON │ Topic │ JSON │ Streaming │ JDBC │  (Tables)  │
└─────────────┘      └───────┘      └───────────┘      └────────────┘
                                                               │
                                                               ▼
                                                        ┌──────────────┐
                                                        │  API Node.js │
                                                        │   (Backend)  │
                                                        └──────────────┘
                                                               │
                                                               ▼
                                                        ┌──────────────┐
                                                        │   Frontend   │
                                                        │ React + Vite │
                                                        └──────────────┘
```

---

## 8. DỪNG TẤT CẢ SERVICES

```bash
# Dừng Generator: Ctrl+C trong terminal generator

# Dừng Spark: Ctrl+C trong terminal spark

# Dừng Docker services
docker-compose down

# Xóa volumes (cẩn thận - mất hết dữ liệu)
docker-compose down -v
```

---

## 9. NEXT STEPS

Sau khi pipeline chạy thành công, bạn có thể:

1. **Tạo API Node.js** để frontend query PostgreSQL
2. **Kết nối Frontend** với API backend (đổi `VITE_USE_MOCK=false`)
3. **Add monitoring** với Prometheus + Grafana
4. **Scale up** với nhiều Kafka partitions + Spark executors
5. **Deploy lên cloud** (AWS, Azure, GCP)

---

## 📚 TÀI LIỆU THAM KHẢO

- Spark Structured Streaming: https://spark.apache.org/docs/latest/structured-streaming-programming-guide.html
- Kafka Quickstart: https://kafka.apache.org/quickstart
- PostgreSQL Docs: https://www.postgresql.org/docs/

---

**✅ Chúc bạn thành công!** 🚀

Nếu gặp vấn đề, hãy kiểm tra phần Troubleshooting hoặc xem logs chi tiết của từng service.
