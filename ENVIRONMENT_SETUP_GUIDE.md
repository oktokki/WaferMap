# 🏢 WaferMap 프로젝트 환경 설정 가이드

## 📋 개요
이 문서는 WaferMap 프로젝트를 회사 환경에서 동일하게 설정하기 위한 완전한 가이드입니다.

## 🛠️ 필수 소프트웨어 설치

### 1. Node.js 설치
- **버전**: 18.x 이상 권장
- **다운로드**: https://nodejs.org/
- **설치 확인**: `node --version`, `npm --version`

### 2. Git 설치
- **다운로드**: https://git-scm.com/
- **설정**: 
  ```bash
  git config --global user.name "Your Name"
  git config --global user.email "your.email@company.com"
  ```

### 3. Cursor IDE 설치
- **다운로드**: https://cursor.sh/
- **권장 확장 기능**:
  - JavaScript (ES6) code snippets
  - HTML CSS Support
  - Auto Rename Tag
  - Bracket Pair Colorizer
  - GitLens

## 📦 프로젝트 설정

### 1. 프로젝트 클론
```bash
git clone https://github.com/oktokki/WaferMap.git
cd WaferMap
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 빌드 설정 확인
```bash
# 개발 모드 빌드
npm run dev

# 프로덕션 빌드
npm run build
```

## 🔧 프로젝트 구조

```
WaferMap/
├── src/                    # 소스 코드
│   ├── index.html         # 메인 HTML
│   ├── index.js           # 메인 JavaScript
│   ├── css/               # 스타일시트
│   └── js/                # JavaScript 모듈
├── dist/                  # 빌드 결과물
├── scripts/               # 유틸리티 스크립트
├── data/                  # 데이터 파일
├── sample-data/           # 샘플 데이터 (gitignore)
└── package.json           # 프로젝트 설정
```

## 📁 중요 파일 설명

### 핵심 설정 파일들
- **package.json**: 프로젝트 의존성 및 스크립트
- **webpack.config.js**: 번들링 설정
- **.cursorrules**: Cursor IDE 설정
- **.gitignore**: Git 제외 파일 설정

### 주요 HTML 파일들
- `wafer map dashboard v5.0-integrated.html`: 최신 통합 대시보드
- `wafer-test-dedicated.html`: 웨이퍼 테스트 전용
- `cp-stdf-dedicated.html`: CP STDF 전용
- `packaging-dedicated.html`: 패키징 전용

## 🚀 실행 방법

### 1. 로컬 서버 실행
```bash
# Python 3 사용
python -m http.server 8000

# 또는 Node.js http-server 사용
npx http-server -p 8000
```

### 2. 브라우저에서 접속
```
http://localhost:8000/wafer%20map%20dashboard%20v5.0-integrated.html
```

## 🔍 문제 해결

### 일반적인 문제들

#### 1. npm install 실패
```bash
# 캐시 클리어
npm cache clean --force

# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

#### 2. 권한 문제 (Windows)
- 관리자 권한으로 PowerShell 실행
- 실행 정책 변경: `Set-ExecutionPolicy RemoteSigned`

#### 3. 네트워크 문제
```bash
# 프록시 설정 (회사 네트워크)
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
```

#### 4. Cursor IDE 문제
- Cursor 재시작
- 확장 기능 비활성화 후 재활성화
- 설정 파일 확인: `.cursorrules`

## 📊 개발 워크플로우

### 1. 코드 수정
- `src/` 폴더의 파일 수정
- `npm run dev`로 실시간 빌드

### 2. 테스트
- 브라우저에서 직접 테스트
- 다양한 HTML 파일로 기능별 테스트

### 3. 배포
- `npm run build`로 프로덕션 빌드
- `dist/` 폴더의 파일 배포

## 🔐 보안 고려사항

### 회사 환경 특화 설정
- **네트워크**: 회사 프록시 설정
- **방화벽**: 개발 포트 허용 (8000, 3000 등)
- **백업**: 정기적인 코드 백업
- **권한**: 적절한 파일 권한 설정

### 데이터 보안
- `sample-data/` 폴더는 민감한 데이터 포함
- `.gitignore`에 의해 Git에서 제외됨
- 회사 데이터는 별도 보안 정책 준수

## 📞 지원

### 문제 발생 시
1. 이 가이드의 문제 해결 섹션 확인
2. 로그 파일 확인 (`*.log`)
3. 브라우저 개발자 도구 확인
4. 팀 리더에게 문의

### 유용한 명령어
```bash
# 프로젝트 상태 확인
npm run session-info
npm run session-list

# 채팅 세션 관리
npm run chat-manager
```

---

**마지막 업데이트**: 2024년 현재
**버전**: 1.0
**작성자**: 개발팀 