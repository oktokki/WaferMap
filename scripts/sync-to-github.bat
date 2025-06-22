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