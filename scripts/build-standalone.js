#!/usr/bin/env node

/**
 * WaferMap Standalone HTML 빌드 스크립트
 * 모든 JS 모듈을 하나의 HTML 파일로 인라인 번들링
 * 결과: wafer map dashboard v4.1-standalone.html
 * 빌드 성공 시 CODING_HISTORY.md에 자동 기록
 */

const fs = require('fs');
const path = require('path');
const { appendHistory } = require('./utils/historyUtil');

// 원본 HTML 경로
const htmlPath = path.join(__dirname, '../wafer map dashboard v4.1.html');
const outputPath = path.join(__dirname, '../wafer map dashboard v4.1-standalone.html');

// 인라인할 JS 파일 목록 (순서 중요)
const jsFiles = [
  '../js/utils/FileUtils.js',
  '../js/utils/CalculationUtils.js',
  '../js/modules/Analytics.js',
  '../js/modules/UI.js',
  '../js/STDFFileHandler.js',
  '../js/modules/SummaryFileParser.js'
];

function stripES6ModuleSyntax(js) {
  // export class ... → class ...
  js = js.replace(/export class /g, 'class ');
  // export default class ... → class ...
  js = js.replace(/export default class /g, 'class ');
  // export { ... };
  js = js.replace(/export \{[^}]+\};?/g, '');
  // import ... from ...; (라인 전체 제거)
  js = js.replace(/^import .*;\s*$/gm, '');
  // module.exports ... 제거
  js = js.replace(/^if \(typeof module !== 'undefined'.*\n[\s\S]*?\n}/gm, '');
  return js;
}

function extractMainScript(html) {
  const moduleScriptMatch = html.match(/<script[^>]*type="module"[^>]*>([\s\S]*?)<\/script>/);
  if (moduleScriptMatch) {
    let mainScript = moduleScriptMatch[1];
    
    // import 구문 제거 (여러 줄에 걸친 경우도 처리)
    mainScript = mainScript.replace(/^import\s+.*?from\s+['"][^'"]*['"];?\s*$/gm, '');
    mainScript = mainScript.replace(/^import\s+.*?;?\s*$/gm, '');
    
    // 추가: import 구문이 여러 줄에 걸쳐 있는 경우도 처리
    mainScript = mainScript.replace(/import\s*\{[^}]*\}\s*from\s*['"][^'"]*['"];?\s*/g, '');
    mainScript = mainScript.replace(/import\s+[^;]*;?\s*/g, '');
    
    return mainScript;
  }
  return '';
}

function buildStandaloneHTML() {
  let result = '빌드 성공';
  let errorMsg = '';
  let warnings = [];
  let currentTime = '';
  
  try {
    // 1. 원본 HTML 읽기
    let html = fs.readFileSync(htmlPath, 'utf8');

    // 2. 빌드 정보 시간 자동 업데이트
    currentTime = new Date().toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\./g, '-').replace(/\s/g, ' ');
    
    html = html.replace(
      /\(빌드정보: [^)]+\)/g, 
      `(빌드정보: ${currentTime})`
    );

    // 3. 메인 스크립트 추출
    const mainScript = extractMainScript(html);

    // 4. 기존 <script type="module"> 또는 import 관련 태그 제거
    html = html.replace(/<script[^>]*type="module"[^>]*>[\s\S]*?<\/script>/g, '');
    html = html.replace(/<script[^>]*src="\.\/js\/[^"]+"[^>]*><\/script>/g, '');

    // 5. 모든 JS 파일을 인라인 <script>로 합치기
    let inlinedJS = '';
    jsFiles.forEach(jsPath => {
      const absPath = path.join(__dirname, jsPath);
      let js = fs.readFileSync(absPath, 'utf8');
      js = stripES6ModuleSyntax(js);
      inlinedJS += `\n// ===== ${path.basename(jsPath)} =====\n`;
      inlinedJS += js + '\n';
    });

    // 6. 메인 스크립트 추가
    inlinedJS += `\n// ===== Main Application Script =====\n`;
    inlinedJS += mainScript + '\n';

    // 7. </body> 직전에 인라인 JS 삽입
    html = html.replace('</body>', `<script>\n${inlinedJS}\n</script>\n</body>`);

    // 8. 결과물 저장
    fs.writeFileSync(outputPath, html, 'utf8');
    console.log(`✅ Standalone HTML 생성 완료: ${outputPath}`);
    console.log(`📊 포함된 JS 파일: ${jsFiles.length}개`);
    console.log(`📝 메인 스크립트 포함: ${mainScript.length > 0 ? '예' : '아니오'}`);
    console.log(`🕐 빌드 시간: ${currentTime}`);
  } catch (e) {
    result = '빌드 실패';
    errorMsg = e.message;
    console.error('❌ 빌드 오류:', e);
  }
  
  // 공통 기록 유틸 사용
  appendHistory({
    type: 'Standalone 빌드',
    result: result,
    files: [outputPath, ...jsFiles],
    warnings: warnings,
    errors: errorMsg ? [errorMsg] : [],
    details: `생성 파일: ${path.basename(outputPath)}, 포함 JS: ${jsFiles.length}개, 빌드 시간: ${currentTime || 'N/A'}`
  });
}

buildStandaloneHTML(); 