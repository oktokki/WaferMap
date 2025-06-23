@echo off
chcp 65001 >nul
echo 🏢 WaferMap 프로젝트 Windows 환경 설정
echo ======================================
echo.

:: 관리자 권한 확인
net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ 관리자 권한으로 실행 중
) else (
    echo ⚠️  관리자 권한이 없습니다. 일부 기능이 제한될 수 있습니다.
)
echo.

:: Node.js 확인
echo 📋 Node.js 확인 중...
node --version >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Node.js 설치됨
    node --version
) else (
    echo ❌ Node.js가 설치되지 않았습니다.
    echo    https://nodejs.org/ 에서 다운로드하세요.
    pause
    exit /b 1
)

:: npm 확인
echo.
echo 📋 npm 확인 중...
npm --version >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ npm 설치됨
    npm --version
) else (
    echo ❌ npm이 설치되지 않았습니다.
    pause
    exit /b 1
)

:: Git 확인
echo.
echo 📋 Git 확인 중...
git --version >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Git 설치됨
    git --version
) else (
    echo ❌ Git이 설치되지 않았습니다.
    echo    https://git-scm.com/ 에서 다운로드하세요.
    pause
    exit /b 1
)

:: package.json 확인
echo.
echo 📋 프로젝트 파일 확인 중...
if exist package.json (
    echo ✅ package.json 발견
) else (
    echo ❌ package.json을 찾을 수 없습니다.
    echo    올바른 프로젝트 디렉토리에서 실행하세요.
    pause
    exit /b 1
)

:: 의존성 설치
echo.
echo 📦 npm 의존성 설치 중...
npm install
if %errorLevel% == 0 (
    echo ✅ 의존성 설치 완료
) else (
    echo ❌ 의존성 설치 실패
    echo    네트워크 연결을 확인하거나 프록시 설정을 확인하세요.
    pause
    exit /b 1
)

:: 빌드 테스트
echo.
echo 🔨 빌드 테스트 중...
npm run build
if %errorLevel% == 0 (
    echo ✅ 빌드 성공
) else (
    echo ⚠️  빌드에 실패했지만 계속 진행합니다.
)

:: 설정 파일 확인
echo.
echo 📁 설정 파일 확인 중...
if exist .cursorrules (
    echo ✅ .cursorrules 존재
) else (
    echo ⚠️  .cursorrules 없음
)

if exist .gitignore (
    echo ✅ .gitignore 존재
) else (
    echo ⚠️  .gitignore 없음
)

if exist webpack.config.js (
    echo ✅ webpack.config.js 존재
) else (
    echo ⚠️  webpack.config.js 없음
)

:: 디렉토리 확인
echo.
echo 📂 디렉토리 구조 확인 중...
if exist src\ (
    echo ✅ src\ 디렉토리 존재
) else (
    echo ⚠️  src\ 디렉토리 없음
)

if exist dist\ (
    echo ✅ dist\ 디렉토리 존재
) else (
    echo ⚠️  dist\ 디렉토리 없음
)

if exist scripts\ (
    echo ✅ scripts\ 디렉토리 존재
) else (
    echo ⚠️  scripts\ 디렉토리 없음
)

:: 완료 메시지
echo.
echo 🎉 환경 설정이 완료되었습니다!
echo.
echo 📋 다음 단계:
echo 1. 로컬 서버 실행:
echo    python -m http.server 8000
echo    또는
echo    npx http-server -p 8000
echo.
echo 2. 브라우저에서 접속:
echo    http://localhost:8000/wafer%%20map%%20dashboard%%20v5.0-integrated.html
echo.
echo 3. 개발 모드 실행:
echo    npm run dev
echo.
echo 4. 채팅 세션 관리:
echo    npm run chat-manager
echo.

:: 회사 환경 특화 정보
echo 🏢 회사 환경 특화 정보:
echo - 방화벽에서 포트 8000, 3000, 8080 허용 필요
echo - 프록시 설정이 필요한 경우:
echo   npm config set proxy http://proxy.company.com:8080
echo   npm config set https-proxy http://proxy.company.com:8080
echo.

pause 