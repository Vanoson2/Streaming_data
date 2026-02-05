# 🚀 Hướng Dẫn Đẩy Project Lên GitHub

## Bước 1: Tạo Repository Trên GitHub

1. Truy cập https://github.com/new
2. Điền thông tin:
   - **Repository name**: `ecommerce-realtime-pipeline` (hoặc tên khác)
   - **Description**: `Full-stack realtime data pipeline: Kafka → Spark → PostgreSQL → React Dashboard`
   - **Visibility**: Public hoặc Private
   - ❌ **KHÔNG** chọn "Initialize with README" (vì đã có README.md)
   - ❌ **KHÔNG** chọn .gitignore và license (đã có sẵn)
3. Click **Create repository**

---

## Bước 2: Khởi Tạo Git Và Push

Mở PowerShell/Terminal trong thư mục project (`D:\Detai\code`):

### 2.1. Kiểm tra Git
```powershell
git --version
# Nếu chưa có git, tải tại: https://git-scm.com/download/win
```

### 2.2. Cấu hình Git (nếu lần đầu)
```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 2.3. Khởi tạo Git repository
```powershell
# Khởi tạo git
git init

# Thêm tất cả files (trừ những file trong .gitignore)
git add .

# Xem files sẽ được commit
git status

# Commit lần đầu
git commit -m "Initial commit: E-commerce Realtime Pipeline"
```

### 2.4. Kết nối với GitHub repository
```powershell
# Thay YOUR_USERNAME và YOUR_REPO bằng thông tin của bạn
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Kiểm tra remote
git remote -v
```

### 2.5. Push lên GitHub
```powershell
# Push lần đầu
git branch -M main
git push -u origin main

# Nếu gặp lỗi authentication, dùng Personal Access Token:
# Settings → Developer settings → Personal access tokens → Generate new token
```

---

## Bước 3: Kiểm Tra

1. Mở repository trên GitHub
2. Kiểm tra:
   - ✅ README.md hiển thị đẹp
   - ✅ Cấu trúc folder đầy đủ (backend/, docs/, scripts/, src/)
   - ✅ **KHÔNG** có `node_modules/`, `.env`, `backend/venv/`, `checkpoints/`

---

## 📂 Files Sẽ Được Push

### ✅ Được Push Lên GitHub:
```
✅ README.md
✅ docker-compose.yml
✅ package.json, package-lock.json
✅ vite.config.ts, tsconfig.json, tailwind.config.js, etc.
✅ .env.example, .env.production (templates)
✅ .gitignore
✅ backend/ (generator.py, spark_stream.py, schema.sql, requirements.txt)
✅ docs/ (QUICKSTART.md, BACKEND_SETUP.md, ARCHITECTURE.md)
✅ scripts/ (start-pipeline.sh, start-pipeline.bat)
✅ src/ (React code)
✅ .vscode/ (settings.json, extensions.json)
```

### ❌ KHÔNG Push (theo .gitignore):
```
❌ .env (local environment - có secrets)
❌ node_modules/ (quá lớn, rebuild bằng npm install)
❌ backend/venv/ (Python virtual env - rebuild)
❌ backend/checkpoints/ (Spark state - runtime data)
❌ dist/ (build output - rebuild)
❌ *.log files
```

---

## 🔄 Cập Nhật Sau Này

Khi có thay đổi:

```powershell
# Xem files đã thay đổi
git status

# Thêm files thay đổi
git add .
# Hoặc thêm từng file:
# git add backend/generator.py

# Commit với message rõ ràng
git commit -m "feat: add KPI calculation logic"
# hoặc
# git commit -m "fix: resolve Spark checkpoint issue"
# git commit -m "docs: update QUICKSTART guide"

# Push lên GitHub
git push
```

---

## 📝 Git Commit Message Convention

Theo best practices:

```
feat: thêm tính năng mới
fix: sửa bug
docs: cập nhật documentation
refactor: refactor code
style: format code, không ảnh hưởng logic
test: thêm tests
chore: cập nhật dependencies, config
```

**Ví dụ**:
```powershell
git commit -m "feat: add real-time alerts for Kafka lag"
git commit -m "fix: resolve PostgreSQL connection timeout"
git commit -m "docs: add API integration guide"
```

---

## 🔐 Bảo Mật

### ⚠️ QUAN TRỌNG: KHÔNG Commit Secrets!

Kiểm tra `.env` đã trong `.gitignore`:
```powershell
git check-ignore .env
# Output: .env (nghĩa là đã ignore)
```

Nếu vô tình đã commit `.env`:
```powershell
# Xóa khỏi git history
git rm --cached .env
git commit -m "chore: remove .env from git"
git push
```

---

## 🌟 Thêm Badges Vào README (Optional)

Thêm vào đầu README.md:

```markdown
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Kafka](https://img.shields.io/badge/Kafka-7.5-red)](https://kafka.apache.org/)
[![Spark](https://img.shields.io/badge/Spark-3.5-orange)](https://spark.apache.org/)
```

---

## 📋 Checklist Trước Khi Push

- [ ] Đã xóa/gitignore các files nhạy cảm (.env, credentials)
- [ ] README.md rõ ràng và đầy đủ
- [ ] .gitignore đã cover node_modules/, venv/, checkpoints/
- [ ] Đã test build: `npm run build` và `pip install -r requirements.txt`
- [ ] Commit message rõ ràng
- [ ] Đã kiểm tra `git status` trước khi commit

---

## 🆘 Troubleshooting

### Lỗi: "Support for password authentication was removed"
**Giải pháp**: Dùng Personal Access Token thay vì password
1. GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Chọn scopes: `repo`
4. Dùng token làm password khi push

### Lỗi: "failed to push some refs"
**Giải pháp**: Pull trước rồi push
```powershell
git pull origin main --rebase
git push
```

### Lỗi: File quá lớn
**Giải pháp**: Thêm vào .gitignore và xóa khỏi cache
```powershell
echo "large-file.zip" >> .gitignore
git rm --cached large-file.zip
git commit -m "chore: remove large file"
```

---

## 🎓 Học Thêm Git

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)

---

**✅ Sau khi push xong, repository của bạn sẽ online và có thể share link với ai cũng được!**

Example: `https://github.com/your-username/ecommerce-realtime-pipeline`
