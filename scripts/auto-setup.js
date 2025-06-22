#!/usr/bin/env node

/**
 * WaferMap 프로젝트 자동 설정 스크립트
 * 개발 환경 설정 및 일반적인 이슈 검사
 * 점검 결과를 CODING_HISTORY.md에 자동 기록
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { appendHistory } = require('./utils/historyUtil');

console.log('🔬 WaferMap 프로젝트 자동 설정 시작...\n');

let warnings = [];
let errors = [];
let result = '점검 성공';

// 1. 필수 파일 존재 확인
const requiredFiles = [
    '.cursorrules',
    'CODING_HISTORY.md',
    'AI_CODING_CHECKLIST.md',
    'wafer map dashboard v4.1.html'
];

console.log('📋 필수 파일 확인 중...');
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - 누락됨`);
        warnings.push(`${file} 누락`);
    }
});

// 2. JavaScript 예약어 검사
console.log('\n🔍 JavaScript 예약어 검사 중...');
const jsFiles = [
    'js/modules/Analytics.js',
    'js/modules/UI.js',
    'js/modules/SummaryFileParser.js',
    'js/utils/FileUtils.js',
    'js/utils/CalculationUtils.js',
    'js/STDFFileHandler.js'
];

const reservedWords = ['yield', 'class', 'function', 'let', 'const', 'var'];
let foundIssues = false;

jsFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        reservedWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\s*=`, 'g');
            if (regex.test(content)) {
                console.log(`⚠️  ${file}: '${word}' 변수명 사용 발견`);
                warnings.push(`${file}: '${word}' 변수명 사용`);
                foundIssues = true;
            }
        });
    }
});

if (!foundIssues) {
    console.log('✅ JavaScript 예약어 사용 없음');
}

// 3. 모듈 export 검사
console.log('\n📦 ES6 모듈 export 검사 중...');
jsFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('class') && !content.includes('export class')) {
            console.log(`⚠️  ${file}: export 키워드 누락 가능성`);
            warnings.push(`${file}: export 누락 가능성`);
        }
    }
});

// 4. HTTP 서버 상태 확인
console.log('\n🌐 HTTP 서버 상태 확인 중...');
try {
    const response = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:8000', { encoding: 'utf8' });
    if (response.trim() === '200') {
        console.log('✅ HTTP 서버 실행 중 (포트 8000)');
    } else {
        console.log('❌ HTTP 서버 응답 없음');
        warnings.push('HTTP 서버 응답 없음');
        console.log('💡 다음 명령어로 서버를 시작하세요:');
        console.log('   python -m http.server 8000');
    }
} catch (error) {
    console.log('❌ HTTP 서버 연결 실패');
    warnings.push('HTTP 서버 연결 실패');
    console.log('💡 다음 명령어로 서버를 시작하세요:');
    console.log('   python -m http.server 8000');
}

// 5. 개발 환경 설정 안내
console.log('\n🚀 개발 환경 설정 완료!');
console.log('\n📝 다음 단계:');
console.log('1. HTTP 서버가 실행 중인지 확인');
console.log('2. 브라우저에서 http://localhost:8000 접속');
console.log('3. wafer map dashboard v4.1.html 파일 열기');
console.log('4. 파일 업로드 기능 테스트');

console.log('\n📚 참고 문서:');
console.log('- CODING_HISTORY.md: 이슈 히스토리');
console.log('- AI_CODING_CHECKLIST.md: 품질 체크리스트');
console.log('- .cursorrules: Cursor AI 지침');

console.log('\n✨ 설정 완료!');

// 결과 기록
if (warnings.length > 0) result = '경고 있음';
if (errors.length > 0) result = '오류 있음';

// 공통 기록 유틸 사용
appendHistory({
    type: '개발 환경 점검',
    result: result,
    files: [...requiredFiles, ...jsFiles],
    warnings: warnings,
    errors: errors,
    details: `점검 항목: 필수 파일(${requiredFiles.length}개), 예약어, export, HTTP 서버`
}); 