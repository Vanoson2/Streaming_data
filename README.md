# E-commerce Realtime Dashboard & Pipeline

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Kafka](https://img.shields.io/badge/Kafka-7.5-red)](https://kafka.apache.org/)
[![Spark](https://img.shields.io/badge/Spark-3.5-orange)](https://spark.apache.org/)

Full-stack realtime data pipeline cho hệ thống TMĐT:  
**Event Generator → Kafka → Spark Structured Streaming → PostgreSQL → Frontend Dashboard**

## 📁 Cấu trúc project

```
.
├── 📂 backend/               # Backend pipeline (Python + Spark)
│   ├── generator.py         # Event generator → Kafka
│   ├── spark_stream.py      # Spark Structured Streaming job
│   ├── schema.sql           # PostgreSQL schema
│   └── requirements.txt     # Python dependencies
│
├── 📂 src/                   # Frontend (React + Vite)
│   ├── features/            # Feature modules (dashboard, events, ops)
│   ├── components/          # UI components
│   └── lib/                 # API client
│
├── 📂 docs/                  # 📖 Tất cả tài liệu hướng dẫn
│   ├── QUICKSTART.md        # ⚡ Quick start 5 phút
│   ├── BACKEND_SETUP.md     # 📖 Setup chi tiết
│   ├── ARCHITECTURE.md      # 🏗️ Giải thích kiến trúc
├── 📂 docs/                  # 📖 Tất cả tài liệu hướng dẫn
│   ├── QUICKSTART.md        # ⚡ Quick start 5 phút
│   ├── BACKEND_SETUP.md     # 📖 Setup chi tiết
│   └── ARCHITECTURE.md      # 🏗️ Giải thích kiến trúc
│
├── 📂 scripts/               # 🚀 Startup scripts
│   ├── start-pipeline.sh    # Linux/macOS: ./scripts/start-pipeline.sh
│   └── start-pipeline.bat   # Windows: scripts\start-pipeline.bat
│
├── 🐳 docker-compose.yml    # Kafka + PostgreSQL
└── 📋 Config files (phải ở root): package.json, vite.config.ts, tsconfig.json, etc.
```

## 🚀 Quick Start

```bash
# 1. Khởi động Docker services
docker-compose up -d

# 2. Chạy backend (2 terminals)
cd backend
python generator.py      # Terminal 1
python spark_stream.py   # Terminal 2

# 3. Chạy frontend
npm run dev
```

📖 **Chi tiết**: Xem [docs/QUICKSTART.md](docs/QUICKSTART.md) hoặc [docs/BACKEND_SETUP.md](docs/BACKEND_SETUP.md)

## 🚀 Tech Stack

### Backend
- **Kafka**: Message broker (Confluent Platform 7.5.0)
- **Spark**: Structured Streaming 3.5.0 (Python)
- **PostgreSQL**: Database 15
- **Python**: 3.8+, kafka-python, pyspark

### Frontend

- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Utils**: date-fns

## 📋 Tính năng

### 1. Dashboard (/dashboard) - Business KPI
- **KPI Cards**:
  - Total Revenue (VND)
  - Orders Created
  - Payment Success
  - Payment Failed
  - Success Rate (%)
- **Time Range Selector**: 15 phút, 1 giờ, 24 giờ
- **Auto Refresh Toggle**: Bật/tắt polling mỗi 10 giây
- **Charts**:
  - Line Chart: Revenue theo thời gian
  - Stacked Bar Chart: Số đơn theo trạng thái (Success/Failed)
- **States**: Loading spinner, error handling

### 2. Events (/events) - Đối soát
- **Table events_clean** với columns:
  - Event Time
  - Event Type (order_created, payment_initiated, payment_success, payment_failed, order_cancelled)
  - Order ID
  - User ID
  - Amount
  - Currency
  - Status
- **Filters**:
  - Event Type dropdown
  - Status dropdown (success/failed/pending)
  - Clear filters button
- **Pagination**: 20 items/page với Previous/Next controls
- **Detail Modal**: Click icon Eye để xem chi tiết event (bao gồm metadata)
- **Color-coded badges** cho event types và status

### 3. Ops (/ops) - Admin Console
- **System Health Cards**:
  - Kafka (status + message)
  - Spark (status + message)
  - Postgres (status + message)
- **Status colors**: Healthy (green), Degraded (yellow), Down (red)
- **System Metrics**:
  - Kafka Lag (messages behind)
  - Processing Rate (events/second)
- **Simulation Controls**:
  - Button: Kafka Down
  - Button: Spark Crash
  - Button: Reset All
- **Alerts List**: Hiển thị alerts với severity (critical/warning/info), timestamp, service
- **Auto Refresh**: Polling mỗi 5 giây

## 📁 Cấu trúc Project

```
ecommerce-realtime-dashboard/
├── public/
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── ui/                  # Generic UI components
│   │   │   ├── Card.tsx
│   │   │   ├── KPICard.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── index.ts
│   │   └── layout/              # Layout components
│   │       ├── Layout.tsx
│   │       └── index.ts
│   ├── features/                # Feature modules
│   │   ├── dashboard/           # Dashboard feature
│   │   │   ├── Dashboard.tsx
│   │   │   └── index.ts
│   │   ├── events/              # Events feature
│   │   │   ├── Events.tsx
│   │   │   └── index.ts
│   │   └── ops/                 # Ops feature
│   │       ├── Ops.tsx
│   │       └── index.ts
│   ├── lib/                     # Libraries & utilities
│   │   └── api.ts               # API client & mock data
│   ├── App.tsx                  # App router
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles
├── .env                         # Environment variables
├── .env.production              # Production env vars
├── .env.example                 # Env template
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.cjs
└── README.md
```

### 📂 Giải thích cấu trúc:

**`src/components/`** - Shared components có thể tái sử dụng
- `ui/` - Generic UI components (Card, Modal, etc.)
- `layout/` - Layout components (Header, Sidebar, etc.)

**`src/features/`** - Feature-based organization
- `dashboard/` - Business KPI dashboard
- `events/` - Events table & filters  
- `ops/` - Operations console
- Mỗi feature có thể có components riêng trong folder của nó

**`src/lib/`** - Utilities & services
- `api.ts` - Centralized API client với MOCK/REAL mode

### ✨ Ưu điểm cấu trúc mới:

✅ **Feature-based**: Dễ scale khi thêm features mới
✅ **Clear separation**: UI components vs Feature modules
✅ **Barrel exports**: Import dễ hơn với index.ts
✅ **Maintainable**: Dễ tìm và maintain code

## 🛠️ Cài đặt & Chạy

### Yêu cầu hệ thống
- Node.js 18+ (download tại: https://nodejs.org)
- npm (đi kèm với Node.js)

### ⚠️ QUAN TRỌNG: Nếu chưa cài Node.js

**Windows**:
1. Download Node.js từ https://nodejs.org (chọn LTS version)
2. Chạy installer và làm theo hướng dẫn
3. Restart terminal/PowerShell sau khi cài
4. Kiểm tra: `node --version` và `npm --version`

### Bước 1: Cài đặt dependencies

**⚠️ LỖI PowerShell trên Windows?**

Nếu gặp lỗi `UnauthorizedAccess` hoặc `running scripts is disabled`, chọn 1 trong 2 cách:

**Cách 1: Dùng Command Prompt (cmd) thay vì PowerShell** *(Khuyên dùng)*
1. Mở **Command Prompt** (tìm "cmd" trong Start Menu)
2. cd đến thư mục project: `cd d:\Detai\code`
3. Chạy: `npm install`

**Cách 2: Cho phép chạy scripts trong PowerShell**
Chạy PowerShell **as Administrator** và gõ:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```
Sau đó chạy lại `npm install` trong PowerShell bình thường.

**Cài đặt dependencies:**
```bash
npm install
```

> **Lưu ý**: Lần đầu chạy có thể mất 2-3 phút để download các packages.

### Bước 2: Chạy development server

```bash
npm run dev
```

App sẽ tự động mở tại: **http://localhost:3000**

> Nếu port 3000 bị chiếm, Vite sẽ tự động dùng port khác (3001, 3002...)

### Bước 3: Build cho production

```bash
npm run build
npm run preview
```

## 🎮 Hướng dẫn Demo (cho Giảng viên)

### Scenario 1: Dashboard - Theo dõi Business KPI

1. Mở trang **Dashboard** (trang mặc định)
2. Quan sát 5 KPI cards với các metrics:
   - Revenue hiển thị bằng triệu (M)
   - Success Rate tính theo %
   - Các số liệu khác có thousand separator
3. **Thay đổi Time Range**:
   - Click "Last 15 minutes" → Charts update với data points phù hợp
   - Click "Last 1 hour" → Nhiều data points hơn
   - Click "Last 24 hours" → Data aggregated theo 30 phút
4. **Auto Refresh**:
   - Observe "Auto Refresh ON" button (màu xanh, có spinning icon)
   - Data tự động refresh mỗi 10 giây
   - Click để tắt → Button chuyển sang màu trắng, không refresh
5. **Charts**:
   - Hover trên line chart để xem tooltip revenue
   - Hover trên bar chart để xem số lượng success/failed orders

### Scenario 2: Events - Đối soát dữ liệu

1. Navigate đến trang **Events**
2. **View Table**:
   - Xem danh sách 20 events đầu tiên
   - Quan sát color-coded badges cho event types và status
   - Note: Timestamps được format dd/MM/yyyy HH:mm:ss
3. **Filtering**:
   - Select "Payment Success" trong Event Type dropdown
   - Table chỉ hiển thị payment success events
   - Select "Failed" trong Status dropdown
   - Click "Clear filters" để reset
4. **Pagination**:
   - Scroll xuống dưới table
   - Xem "Showing X to Y of Z results"
   - Click Next → Chuyển sang page 2
   - Click Previous → Quay lại page 1
5. **View Details**:
   - Click icon Eye ở cột Action
   - Modal popup hiển thị full event details
   - Xem metadata section (IP, device)
   - Click X hoặc outside để đóng modal

### Scenario 3: Ops - Simulate Failures

1. Navigate đến trang **Ops**
2. **System Health (ban đầu)**:
   - Tất cả 3 services đều GREEN (Healthy)
   - Messages: "All brokers operational", "Streaming jobs running", etc.
3. **Simulate Kafka Down**:
   - Click button "Kafka Down" (màu đỏ)
   - Quan sát:
     - Kafka card chuyển sang RED với status "down"
     - Message thay đổi: "Connection timeout - brokers unreachable"
     - Alert mới xuất hiện ở Alerts section với severity CRITICAL
     - Alert color-coded đỏ
4. **Simulate Spark Crash**:
   - Click button "Spark Crash"
   - Quan sát:
     - Spark card chuyển sang RED
     - Alert CRITICAL mới xuất hiện
5. **View Alerts**:
   - Scroll đến "Recent Alerts" section
   - Xem danh sách alerts theo thời gian
   - Mỗi alert có: severity badge, service name, title, message, timestamp
6. **Reset Simulations**:
   - Click button "Reset All" (màu xanh)
   - Tất cả services quay về HEALTHY
   - Alert INFO "System Reset" xuất hiện
7. **Metrics**:
   - Quan sát "Kafka Lag" và "Processing Rate" metrics
   - Numbers auto-refresh mỗi 5 giây

## 🔧 Configuration

### Environment Variables

Project sử dụng **Vite environment variables** để config API mode.

**File `.env`** (development - đã có sẵn):
```bash
VITE_USE_MOCK=true
VITE_API_BASE_URL=http://localhost:8080
```

**File `.env.production`** (production - đã có sẵn):
```bash
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://api.production.com
```

### Chuyển từ Mock sang Real API

**Cách 1: Sửa file `.env`**
```bash
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:8080
```

**Cách 2: Override khi chạy**
```bash
VITE_USE_MOCK=false npm run dev
```

### Vite Proxy Configuration

Vite đã được config proxy `/api` sang `localhost:8080`:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
}
```

Khi REAL API mode, các request sẽ:
- Frontend: `fetch('/api/kpi')` 
- Vite proxy forward: `http://localhost:8080/api/kpi`

### API Endpoints (khi dùng Real API)

Service layer đã wrap tất cả endpoints. Components **KHÔNG** được gọi fetch trực tiếp.

**Dashboard:**
```typescript
api.getKpi(timeRange: TimeRange): Promise<BusinessKPI>
// → GET /api/kpi?timeRange=15m|1h|24h

api.getTimeSeries(timeRange: TimeRange): Promise<TimeSeriesData[]>
// → GET /api/timeseries?timeRange=15m|1h|24h
```

**Events:**
```typescript
api.getEvents(params: {
  page?: number;
  pageSize?: number;
  eventType?: EventType;
  status?: EventStatus;
}): Promise<EventsResponse>
// → GET /api/events?page=1&pageSize=20&eventType=...&status=...
```

**Ops:**
```typescript
api.getSystemHealth(): Promise<SystemHealth>
// → GET /api/health

api.getSystemMetrics(): Promise<SystemMetrics>
// → GET /api/metrics

api.getAlerts(): Promise<Alert[]>
// → GET /api/alerts

api.simulateIssue(type: 'kafka_down' | 'spark_crash' | 'reset'): Promise<SystemHealth>
// → POST /api/simulate
```

### Kiểm tra API Mode

Khi app chạy, check browser console:
```
🔧 API Configuration: { mode: 'MOCK', baseURL: '/api' }
```

### Polling Intervals

**Dashboard**: 10 giây
**Events**: No auto-refresh (manual pagination)
**Ops**: 5 giây

Chỉnh sửa trong từng page file:
```typescript
refetchInterval: autoRefresh ? 10000 : false, // 10000ms = 10 giây
```

## 🎨 Customization

### Thay đổi màu sắc

Edit `tailwind.config.js`:

```javascript
colors: {
  primary: '#3B82F6',    // Blue
  success: '#10B981',    // Green
  warning: '#F59E0B',    // Yellow
  danger: '#EF4444',     // Red
  info: '#06B6D4',       // Cyan
}
```

### Thay đổi page size (Events)

Edit `src/pages/Events.tsx`:

```typescript
const [pageSize] = useState(50) // Thay đổi từ 20 sang 50
```

## 📊 Mock Data Behavior

### Dashboard
- Revenue: Random variations trong phạm vi 1M-1.2M VND
- Orders: Phụ thuộc vào time range (x1, x4, x96)
- Success Rate: ~85% (realistic e-commerce conversion)
- Time Series: Generated với intervals phù hợp (1 phút cho 15m/1h, 30 phút cho 24h)

### Events
- Total: 2,847 events (mock)
- Event Types: Phân bố đều giữa 5 loại
- Status: ~85% success, ~10% failed, ~5% pending
- Amounts: Random từ 100K-5M VND
- Currencies: VND và USD

### Ops
- Kafka Lag: 50-250 messages
- Processing Rate: 800-1,300 events/s
- Simulations persist in memory (reset on page reload)
- Alerts accumulate up to 20 (oldest removed)

## 🐛 Troubleshooting

### PowerShell: npm command không chạy được (Windows)

**Lỗi**: `running scripts is disabled on this system`

**Giải pháp nhanh**: Dùng **Command Prompt (cmd)** thay vì PowerShell
1. Mở Start Menu → tìm "cmd" → chọn "Command Prompt"
2. Navigate: `cd d:\Detai\code`
3. Chạy: `npm install` và `npm run dev`

**Giải pháp vĩnh viễn**: Cho phép PowerShell chạy scripts
```powershell
# Chạy PowerShell as Administrator
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### Port 3000 đã được sử dụng

Edit `vite.config.ts`:
```typescript
server: {
  port: 3001, // Đổi sang port khác
}
```

Hoặc chạy:
```bash
npm run dev -- --port 3001
```

### Build errors với path alias

Đảm bảo `tsconfig.json` và `vite.config.ts` đều có path mapping:

```json
// tsconfig.json
"paths": {
  "@/*": ["./src/*"]
}
```

```typescript
// vite.config.ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

### Recharts không render

Kiểm tra browser console. Nếu có lỗi, thử:
```bash
npm install recharts@latest
```

## 📝 Code Quality

### TypeScript
- ✅ Strict mode enabled
- ✅ No `any` types (except metadata)
- ✅ Full type coverage cho API responses
- ✅ Interface-driven development

### React Best Practices
- ✅ Functional components với hooks
- ✅ React Query cho server state
- ✅ Proper error boundaries
- ✅ Loading states cho tất cả async operations
- ✅ Memoization khi cần thiết

### UI/UX
- ✅ Responsive design (mobile-friendly)
- ✅ Consistent spacing và typography
- ✅ Color-coded status indicators
- ✅ Smooth transitions
- ✅ Accessible (keyboard navigation)

## 🎓 Tips cho Sinh viên

### Học từ codebase này:
1. **Component Architecture**: Xem cách tái sử dụng components (Card, Modal, KPICard)
2. **State Management**: React Query patterns cho server state
3. **Type Safety**: TypeScript types và interfaces
4. **API Layer**: Separation of concerns (services/api.ts)
5. **Routing**: React Router setup và navigation
6. **Styling**: TailwindCSS utility-first approach
7. **Data Visualization**: Recharts integration

### Bài tập mở rộng:
- [ ] Thêm trang Settings để config polling intervals
- [ ] Thêm Dark mode toggle
- [ ] Export events table to CSV
- [ ] Add more chart types (pie, area)
- [ ] Implement real-time WebSocket updates
- [ ] Add user authentication
- [ ] Create mobile-optimized views

## 📄 License

MIT License - Free to use for educational purposes

## � Tài liệu liên quan

- **[QUICKSTART.md](docs/QUICKSTART.md)** - ⚡ Quick start trong 5 phút
- **[BACKEND_SETUP.md](docs/BACKEND_SETUP.md)** - 📖 Hướng dẫn chi tiết chạy backend pipeline (Kafka, Spark, PostgreSQL)
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - 🏗️ Giải thích kiến trúc và luồng dữ liệu
- **Frontend README** - Tài liệu này

## 👨‍💻 Support

### Frontend Issues
Nếu gặp vấn đề khi chạy frontend:
1. Xóa `node_modules` và reinstall: `rm -rf node_modules && npm install`
2. Clear Vite cache: `rm -rf .vite`
3. Kiểm tra Node version: `node --version` (cần >= 18)
4. Kiểm tra console errors trong browser DevTools

### Backend Issues
Xem chi tiết trong [docs/BACKEND_SETUP.md](docs/BACKEND_SETUP.md) phần **Troubleshooting**:
- Docker connection issues
- Kafka/PostgreSQL setup
- Spark JAR dependencies
- Python environment problems

---

**Built with ❤️ for E-commerce Realtime Data Processing**
