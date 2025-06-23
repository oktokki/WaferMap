# ✅ WaferMap 환경 설정 체크리스트

## 🎯 목적
회사 환경에서 WaferMap 프로젝트를 성공적으로 설정하기 위한 단계별 체크리스트입니다.

## 📋 사전 준비

### 필수 소프트웨어 설치
- [ ] **Node.js 18.x 이상** 설치
  - [ ] 다운로드: https://nodejs.org/
  - [ ] 설치 확인: `node --version`
  - [ ] npm 확인: `npm --version`

- [ ] **Git** 설치
  - [ ] 다운로드: https://git-scm.com/
  - [ ] 설치 확인: `git --version`
  - [ ] 사용자 설정: `git config --global user.name "이름"`
  - [ ] 이메일 설정: `git config --global user.email "이메일"`

- [ ] **Cursor IDE** 설치
  - [ ] 다운로드: https://cursor.sh/
  - [ ] 설치 확인: Cursor 실행
  - [ ] 권장 확장 기능 설치

### 회사 네트워크 설정
- [ ] **프록시 설정** (필요시)
  ```bash
  npm config set proxy http://proxy.company.com:8080
  npm config set https-proxy http://proxy.company.com:8080
  ```
- [ ] **방화벽 포트 허용**
  - [ ] 포트 8000 (HTTP 서버)
  - [ ] 포트 3000 (개발 서버)
  - [ ] 포트 8080 (WebSocket)

## 🚀 프로젝트 설정

### 1단계: 프로젝트 클론
- [ ] **Git 클론**
  ```bash
  git clone https://github.com/oktokki/WaferMap.git
  cd WaferMap
  ```
- [ ] **클론 확인**
  - [ ] `package.json` 파일 존재
  - [ ] `src/` 디렉토리 존재
  - [ ] `scripts/` 디렉토리 존재

### 2단계: 의존성 설치
- [ ] **npm 설치**
  ```bash
  npm install
  ```
- [ ] **설치 확인**
  - [ ] `node_modules/` 디렉토리 생성
  - [ ] 오류 메시지 없음
  - [ ] `package-lock.json` 생성

### 3단계: 빌드 테스트
- [ ] **프로덕션 빌드**
  ```bash
  npm run build
  ```
- [ ] **빌드 확인**
  - [ ] `dist/` 디렉토리 생성
  - [ ] `bundle.js` 파일 생성
  - [ ] 오류 메시지 없음

### 4단계: 설정 파일 확인
- [ ] **핵심 파일 존재 확인**
  - [ ] `.cursorrules` (Cursor IDE 설정)
  - [ ] `.gitignore` (Git 제외 파일)
  - [ ] `webpack.config.js` (빌드 설정)
  - [ ] `ENVIRONMENT_SETUP_GUIDE.md` (이 가이드)

## 🧪 기능 테스트

### 1단계: 로컬 서버 실행
- [ ] **서버 시작**
  ```bash
  # 방법 1: Python
  python -m http.server 8000
  
  # 방법 2: Node.js
  npx http-server -p 8000
  ```
- [ ] **서버 확인**
  - [ ] 터미널에 서버 시작 메시지
  - [ ] 포트 8000에서 서비스 시작

### 2단계: 브라우저 접속
- [ ] **메인 대시보드 접속**
  ```
  http://localhost:8000/wafer%20map%20dashboard%20v5.0-integrated.html
  ```
- [ ] **페이지 로드 확인**
  - [ ] 페이지 정상 로드
  - [ ] JavaScript 오류 없음
  - [ ] CSS 스타일 적용

### 3단계: 기능별 테스트
- [ ] **웨이퍼 테스트 페이지**
  ```
  http://localhost:8000/wafer-test-dedicated.html
  ```
- [ ] **CP STDF 페이지**
  ```
  http://localhost:8000/cp-stdf-dedicated.html
  ```
- [ ] **패키징 페이지**
  ```
  http://localhost:8000/packaging-dedicated.html
  ```

## 🔧 개발 도구 설정

### Cursor IDE 설정
- [ ] **프로젝트 열기**
  - [ ] Cursor에서 WaferMap 폴더 열기
  - [ ] `.cursorrules` 파일 인식 확인

- [ ] **확장 기능 설치**
  - [ ] JavaScript (ES6) code snippets
  - [ ] HTML CSS Support
  - [ ] Auto Rename Tag
  - [ ] Bracket Pair Colorizer
  - [ ] GitLens

### 개발 워크플로우
- [ ] **개발 모드 실행**
  ```bash
  npm run dev
  ```
- [ ] **실시간 빌드 확인**
  - [ ] 파일 변경 시 자동 빌드
  - [ ] 브라우저 새로고침 시 변경사항 반영

## 📊 유틸리티 테스트

### 채팅 세션 관리
- [ ] **세션 정보 확인**
  ```bash
  npm run session-info
  ```
- [ ] **세션 목록 확인**
  ```bash
  npm run session-list
  ```
- [ ] **채팅 매니저 실행**
  ```bash
  npm run chat-manager
  ```

### 빠른 설정 스크립트
- [ ] **자동 설정 실행**
  ```bash
  npm run quick-setup
  ```
- [ ] **Windows 배치 파일 실행**
  ```bash
  scripts\setup-windows.bat
  ```

## 🚨 문제 해결

### 일반적인 문제들
- [ ] **npm install 실패**
  - [ ] 네트워크 연결 확인
  - [ ] 프록시 설정 확인
  - [ ] 캐시 클리어: `npm cache clean --force`

- [ ] **권한 문제 (Windows)**
  - [ ] 관리자 권한으로 실행
  - [ ] 실행 정책 변경: `Set-ExecutionPolicy RemoteSigned`

- [ ] **포트 충돌**
  - [ ] 다른 포트 사용: `npx http-server -p 3000`
  - [ ] 실행 중인 프로세스 종료

- [ ] **브라우저 캐시 문제**
  - [ ] 브라우저 캐시 클리어
  - [ ] 하드 새로고침: `Ctrl + F5`

## ✅ 완료 확인

### 최종 체크리스트
- [ ] 모든 필수 소프트웨어 설치 완료
- [ ] 프로젝트 클론 및 의존성 설치 완료
- [ ] 빌드 테스트 성공
- [ ] 로컬 서버 실행 및 접속 성공
- [ ] 메인 대시보드 정상 작동
- [ ] Cursor IDE 설정 완료
- [ ] 개발 워크플로우 확인
- [ ] 유틸리티 기능 테스트 완료

## 📞 지원

### 문제 발생 시
1. [ ] 이 체크리스트 다시 확인
2. [ ] `ENVIRONMENT_SETUP_GUIDE.md` 참조
3. [ ] 브라우저 개발자 도구 확인
4. [ ] 팀 리더에게 문의

### 유용한 명령어
```bash
# 환경 정보 확인
node --version
npm --version
git --version

# 프로젝트 상태 확인
npm run session-info
npm run session-list

# 빠른 설정
npm run quick-setup
```

---

**체크리스트 완료일**: ___________  
**설정 담당자**: ___________  
**특이사항**: ___________ 