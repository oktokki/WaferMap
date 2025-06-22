# 🏠 ↔ 🏢 Workspace Synchronization Guide

## 목적
홈과 오피스 환경 간의 원활한 개발 작업 전환을 위한 자동화 가이드

## 📋 **환경 전환 체크리스트**

### 🏠 **HOME → 🏢 OFFICE 전환**

#### 1. **HOME에서 작업 완료 후**
```bash
# 1. 현재 작업 상태 확인
git status

# 2. 모든 변경사항 스테이징
git add .

# 3. 커밋 생성
git commit -m "작업 내용: [구체적인 변경사항 설명]"

# 4. GitHub에 푸시
git push origin main

# 5. 푸시 성공 확인
git log --oneline -5
```

#### 2. **OFFICE에서 작업 시작**
```bash
# 1. 프로젝트 클론 (처음 사용 시)
git clone https://github.com/oktokki/WaferMap.git
cd WaferMap

# 2. 최신 버전 가져오기 (이미 클론된 경우)
git pull origin main

# 3. 의존성 설치/업데이트
npm install

# 4. 개발 환경 시작
python -m http.server 8000
# 또는
npx http-server
```

### 🏢 **OFFICE → 🏠 HOME 전환**

#### 1. **OFFICE에서 작업 완료 후**
```bash
# 1. 현재 작업 상태 확인
git status

# 2. 모든 변경사항 스테이징
git add .

# 3. 커밋 생성
git commit -m "오피스 작업: [구체적인 변경사항 설명]"

# 4. GitHub에 푸시
git push origin main

# 5. 푸시 성공 확인
git log --oneline -5
```

#### 2. **HOME에서 작업 재개**
```bash
# 1. 최신 버전 가져오기
git pull origin main

# 2. 의존성 업데이트 (필요시)
npm install

# 3. 개발 환경 시작
python -m http.server 8000
# 또는
npx http-server
```

---

## 🔧 **자동화 스크립트**

### **sync-to-github.bat** (Windows)
```batch
@echo off
echo ========================================
echo    HOME -> OFFICE 동기화 스크립트
echo ========================================

echo 1. Git 상태 확인...
git status

echo.
echo 2. 변경사항 스테이징...
git add .

echo.
echo 3. 커밋 생성...
set /p commit_msg="커밋 메시지를 입력하세요: "
git commit -m "%commit_msg%"

echo.
echo 4. GitHub에 푸시...
git push origin main

echo.
echo 5. 푸시 완료 확인...
git log --oneline -3

echo.
echo ========================================
echo    동기화 완료! 오피스에서 git pull 실행
echo ========================================
pause
```

### **sync-from-github.bat** (Windows)
```batch
@echo off
echo ========================================
echo    OFFICE -> HOME 동기화 스크립트
echo ========================================

echo 1. 최신 버전 가져오기...
git pull origin main

echo.
echo 2. 의존성 업데이트...
npm install

echo.
echo 3. 개발 환경 시작...
echo HTTP 서버를 시작합니다...
echo 브라우저에서 http://localhost:8000/src/ 접속
echo.
python -m http.server 8000
```

### **sync-to-github.sh** (Linux/Mac)
```bash
#!/bin/bash
echo "========================================"
echo "    HOME -> OFFICE 동기화 스크립트"
echo "========================================"

echo "1. Git 상태 확인..."
git status

echo ""
echo "2. 변경사항 스테이징..."
git add .

echo ""
echo "3. 커밋 생성..."
read -p "커밋 메시지를 입력하세요: " commit_msg
git commit -m "$commit_msg"

echo ""
echo "4. GitHub에 푸시..."
git push origin main

echo ""
echo "5. 푸시 완료 확인..."
git log --oneline -3

echo ""
echo "========================================"
echo "    동기화 완료! 오피스에서 git pull 실행"
echo "========================================"
```

### **sync-from-github.sh** (Linux/Mac)
```bash
#!/bin/bash
echo "========================================"
echo "    OFFICE -> HOME 동기화 스크립트"
echo "========================================"

echo "1. 최신 버전 가져오기..."
git pull origin main

echo ""
echo "2. 의존성 업데이트..."
npm install

echo ""
echo "3. 개발 환경 시작..."
echo "HTTP 서버를 시작합니다..."
echo "브라우저에서 http://localhost:8000/src/ 접속"
echo ""
python -m http.server 8000
```

---

## 🚀 **빠른 시작 가이드**

### **첫 번째 설정 (각 환경에서 한 번만)**

#### **HOME 환경**
```bash
# 1. 프로젝트 폴더로 이동
cd WaferMap

# 2. Git 설정 확인
git config --list | grep user

# 3. 의존성 설치
npm install

# 4. 개발 환경 테스트
python -m http.server 8000
# 브라우저에서 http://localhost:8000/src/ 접속 확인
```

#### **OFFICE 환경**
```bash
# 1. 프로젝트 클론
git clone https://github.com/oktokki/WaferMap.git
cd WaferMap

# 2. Git 설정 (필요시)
git config user.name "Your Name"
git config user.email "your.email@company.com"

# 3. 의존성 설치
npm install

# 4. 개발 환경 테스트
python -m http.server 8000
# 브라우저에서 http://localhost:8000/src/ 접속 확인
```

---

## 📊 **작업 흐름**

### **일반적인 작업 흐름**
```
🏠 HOME 작업 → git push → 🏢 OFFICE git pull → 작업 → git push → 🏠 HOME git pull
```

### **충돌 해결**
```bash
# 1. 충돌 발생 시
git status  # 충돌 파일 확인

# 2. 충돌 해결 후
git add .
git commit -m "충돌 해결: [설명]"
git push origin main
```

---

## 🔍 **문제 해결**

### **자주 발생하는 문제들**

#### 1. **Git 인증 오류**
```bash
# Personal Access Token 사용
git remote set-url origin https://[TOKEN]@github.com/oktokki/WaferMap.git
```

#### 2. **의존성 문제**
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules
npm install
```

#### 3. **포트 충돌**
```bash
# 다른 포트 사용
python -m http.server 8080
# 또는
npx http-server -p 8080
```

#### 4. **파일 권한 문제 (Linux/Mac)**
```bash
# 스크립트 실행 권한 부여
chmod +x sync-to-github.sh
chmod +x sync-from-github.sh
```

---

## 📝 **작업 로그 템플릿**

### **커밋 메시지 템플릿**
```
[환경] 작업 내용: [구체적인 설명]

예시:
[HOME] PDF 리포트 생성 기능 구현: jsPDF 라이브러리 통합 및 7페이지 리포트 자동 생성
[OFFICE] UI 개선: 리사이즈 기능 완전 구현 및 버튼 디자인 개선
[HOME] 버그 수정: Hard bin 테이블 표시 오류 해결
[OFFICE] 문서화: README.md 업데이트 및 사용법 가이드 추가
```

### **작업 체크리스트**
- [ ] 코드 변경사항 테스트 완료
- [ ] 브라우저에서 기능 동작 확인
- [ ] 빌드 성공 확인 (`npm run build`)
- [ ] 문서 업데이트 (필요시)
- [ ] Git 커밋 및 푸시 완료
- [ ] 다른 환경에서 pull 테스트

---

## 🎯 **최적화 팁**

### **빠른 동기화**
```bash
# 변경사항만 확인
git diff

# 특정 파일만 커밋
git add [파일명]
git commit -m "특정 파일 수정"
git push origin main
```

### **작업 분기 관리**
```bash
# 새로운 기능 개발 시
git checkout -b feature/new-feature
# 작업 완료 후
git checkout main
git merge feature/new-feature
git push origin main
```

---

**마지막 업데이트**: 2025-06-22 21:00  
**버전**: v4.2.0  
**작성자**: AI Assistant  
**상태**: 활성 및 안정적 