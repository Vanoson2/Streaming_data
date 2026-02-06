# 🔧 Environment Configuration

Thư mục này chứa các file cấu hình môi trường cho project.

## 📁 Files

### `.env.example` 
Template cho local development. Copy và đổi tên thành `.env`:
```bash
cp .env.example .env
```

### `.env.production`
Template cho production deployment.

### `.env` (local - KHÔNG commit)
File thật chứa secrets của bạn. **KHÔNG được push lên Git!**

---

## 🚀 Sử dụng

1. **Tạo file `.env` từ template**:
   ```bash
   cp env/.env.example env/.env
   ```

2. **Chỉnh sửa giá trị** trong `env/.env` theo môi trường của bạn

3. **Kiểm tra file đã ignore**:
   ```bash
   git check-ignore env/.env
   # Output: env/.env (= an toàn)
   ```

---

## ⚠️ Lưu ý

- ✅ `.env.example` và `.env.production` được commit (không có secrets)
- ❌ `.env` KHÔNG được commit (có secrets thật)
- 🔒 Luôn kiểm tra trước khi push: `git status`
