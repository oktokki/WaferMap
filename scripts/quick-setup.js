#!/usr/bin/env node

/**
 * 🚀 WaferMap 프로젝트 빠른 설정 스크립트
 * 회사 환경에서 프로젝트를 빠르게 설정하기 위한 자동화 도구
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🏢 WaferMap 프로젝트 환경 설정을 시작합니다...\n');

// 색상 출력 함수
const colors = {
    green: (text) => `\x1b[32m${text}\x1b[0m`,
    red: (text) => `\x1b[31m${text}\x1b[0m`,
    yellow: (text) => `\x1b[33m${text}\x1b[0m`,
    blue: (text) => `\x1b[34m${text}\x1b[0m`
};

// 체크 함수
function checkCommand(command, description) {
    try {
        execSync(command, { stdio: 'pipe' });
        console.log(colors.green(`✅ ${description}`));
        return true;
    } catch (error) {
        console.log(colors.red(`❌ ${description} - 설치 필요`));
        return false;
    }
}

// 실행 함수
function runCommand(command, description) {
    try {
        console.log(colors.blue(`🔄 ${description}...`));
        execSync(command, { stdio: 'inherit' });
        console.log(colors.green(`✅ ${description} 완료`));
        return true;
    } catch (error) {
        console.log(colors.red(`❌ ${description} 실패: ${error.message}`));
        return false;
    }
}

// 메인 설정 함수
async function setupEnvironment() {
    console.log('📋 환경 검사를 시작합니다...\n');

    // 1. 필수 도구 검사
    const nodeInstalled = checkCommand('node --version', 'Node.js 설치 확인');
    const npmInstalled = checkCommand('npm --version', 'npm 설치 확인');
    const gitInstalled = checkCommand('git --version', 'Git 설치 확인');

    if (!nodeInstalled || !npmInstalled || !gitInstalled) {
        console.log(colors.yellow('\n⚠️  필수 도구가 설치되지 않았습니다.'));
        console.log('다음 링크에서 다운로드하세요:');
        console.log('- Node.js: https://nodejs.org/');
        console.log('- Git: https://git-scm.com/');
        console.log('- Cursor: https://cursor.sh/\n');
        return false;
    }

    // 2. package.json 확인
    if (!fs.existsSync('package.json')) {
        console.log(colors.red('❌ package.json 파일을 찾을 수 없습니다.'));
        console.log('올바른 프로젝트 디렉토리에서 실행하세요.\n');
        return false;
    }

    // 3. 의존성 설치
    console.log('\n📦 의존성을 설치합니다...');
    if (!runCommand('npm install', 'npm 의존성 설치')) {
        return false;
    }

    // 4. 빌드 테스트
    console.log('\n🔨 빌드를 테스트합니다...');
    if (!runCommand('npm run build', '프로덕션 빌드')) {
        console.log(colors.yellow('⚠️  빌드에 실패했지만 계속 진행합니다.'));
    }

    // 5. 설정 파일 복사
    console.log('\n📁 설정 파일을 확인합니다...');
    
    const requiredFiles = [
        '.cursorrules',
        '.gitignore',
        'webpack.config.js'
    ];

    let allFilesExist = true;
    requiredFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(colors.green(`✅ ${file} 존재`));
        } else {
            console.log(colors.red(`❌ ${file} 없음`));
            allFilesExist = false;
        }
    });

    // 6. 디렉토리 구조 확인
    console.log('\n📂 디렉토리 구조를 확인합니다...');
    const requiredDirs = ['src', 'dist', 'scripts', 'data'];
    
    requiredDirs.forEach(dir => {
        if (fs.existsSync(dir)) {
            console.log(colors.green(`✅ ${dir}/ 디렉토리 존재`));
        } else {
            console.log(colors.yellow(`⚠️  ${dir}/ 디렉토리 없음`));
        }
    });

    // 7. 설정 완료 메시지
    console.log('\n🎉 환경 설정이 완료되었습니다!');
    console.log('\n📋 다음 단계:');
    console.log('1. 로컬 서버 실행:');
    console.log('   python -m http.server 8000');
    console.log('   또는');
    console.log('   npx http-server -p 8000');
    console.log('\n2. 브라우저에서 접속:');
    console.log('   http://localhost:8000/wafer%20map%20dashboard%20v5.0-integrated.html');
    console.log('\n3. 개발 모드 실행:');
    console.log('   npm run dev');
    console.log('\n4. 채팅 세션 관리:');
    console.log('   npm run chat-manager');

    return true;
}

// 회사 환경 특화 설정
function setupCompanyEnvironment() {
    console.log('\n🏢 회사 환경 특화 설정을 확인합니다...');
    
    // 프록시 설정 확인
    const proxyConfig = execSync('npm config get proxy', { stdio: 'pipe' }).toString().trim();
    if (proxyConfig && proxyConfig !== 'null') {
        console.log(colors.green(`✅ 프록시 설정됨: ${proxyConfig}`));
    } else {
        console.log(colors.yellow('⚠️  프록시 설정이 없습니다.'));
        console.log('회사 네트워크에서 npm 설치에 문제가 있다면:');
        console.log('npm config set proxy http://proxy.company.com:8080');
        console.log('npm config set https-proxy http://proxy.company.com:8080');
    }

    // 방화벽 포트 확인
    console.log('\n🔒 개발 포트 확인:');
    console.log('- HTTP 서버: 8000');
    console.log('- 개발 서버: 3000');
    console.log('- WebSocket: 8080');
    console.log('회사 방화벽에서 이 포트들이 허용되어야 합니다.');
}

// 스크립트 실행
if (require.main === module) {
    setupEnvironment()
        .then(success => {
            if (success) {
                setupCompanyEnvironment();
            } else {
                console.log(colors.red('\n❌ 환경 설정에 실패했습니다.'));
                process.exit(1);
            }
        })
        .catch(error => {
            console.log(colors.red(`\n❌ 오류 발생: ${error.message}`));
            process.exit(1);
        });
}

module.exports = { setupEnvironment, setupCompanyEnvironment }; 