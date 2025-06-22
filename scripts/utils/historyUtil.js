const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const historyPath = path.join(__dirname, '../../CODING_HISTORY.md');

function getChangedFiles() {
  try {
    // git diff --name-only HEAD~1 HEAD (최근 커밋의 변경 파일)
    const changedFiles = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(file => file.length > 0);
    
    // git status --porcelain (스테이징되지 않은 변경 파일)
    const unstagedFiles = execSync('git status --porcelain', { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(line => line.length > 0)
      .map(line => line.substring(3)); // " M filename" -> "filename"
    
    return [...new Set([...changedFiles, ...unstagedFiles])];
  } catch (error) {
    console.log('Git 정보를 가져올 수 없습니다:', error.message);
    return [];
  }
}

function appendHistory({type, result, files = [], warnings = [], errors = [], details = ''}) {
  const now = new Date();
  const dateStr = now.toISOString().replace('T', ' ').substring(0, 16);
  
  // git diff로 최근 변경 파일 자동 감지
  const changedFiles = getChangedFiles();
  const allFiles = [...new Set([...files, ...changedFiles])];
  
  let log = `\n## [${dateStr}] ${type} 자동 기록\n`;
  log += `- 실행자: 자동화 스크립트\n`;
  if (allFiles.length > 0) {
    log += `- 관련 파일: ${allFiles.map(f => path.basename(f)).join(', ')}\n`;
  }
  log += `- 결과: ${result}\n`;
  if (warnings.length > 0) log += `- 경고: ${warnings.join('; ')}\n`;
  if (errors.length > 0) log += `- 오류: ${errors.join('; ')}\n`;
  if (details) log += `- 상세: ${details}\n`;
  if (changedFiles.length > 0) {
    log += `- 최근 변경 파일: ${changedFiles.map(f => path.basename(f)).join(', ')}\n`;
  }
  
  fs.appendFileSync(historyPath, log, 'utf8');
}

module.exports = { appendHistory, getChangedFiles }; 