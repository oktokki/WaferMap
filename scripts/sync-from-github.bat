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