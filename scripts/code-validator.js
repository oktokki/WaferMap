#!/usr/bin/env node

/**
 * AI 코딩 품질 검증 스크립트
 * 반복적인 실수를 방지하기 위한 자동화 도구
 * 
 * 사용법: node scripts/code-validator.js
 */

const fs = require('fs');
const path = require('path');

class CodeValidator {
    constructor() {
        this.issues = [];
        this.stats = {
            filesChecked: 0,
            issuesFound: 0,
            criticalIssues: 0
        };
    }

    /**
     * 메인 검증 프로세스
     */
    async validate() {
        console.log('🔍 AI 코딩 품질 검증 시작...\n');

        // JavaScript 파일 검증
        await this.validateJavaScriptFiles();
        
        // HTML 파일 검증
        await this.validateHTMLFiles();
        
        // CSS 파일 검증
        await this.validateCSSFiles();
        
        // 결과 출력
        this.printResults();
    }

    /**
     * JavaScript 파일 검증
     */
    async validateJavaScriptFiles() {
        const jsFiles = this.getFilesRecursive('./js', '.js');
        
        for (const file of jsFiles) {
            this.stats.filesChecked++;
            const content = fs.readFileSync(file, 'utf8');
            
            // 1. Strict Mode 예약어 검사
            this.checkStrictModeReservedWords(file, content);
            
            // 2. 모듈 Export 검사
            this.checkModuleExports(file, content);
            
            // 3. 이벤트 리스너 검사
            this.checkEventListenerConnections(file, content);
            
            // 4. 변수명 일관성 검사
            this.checkVariableNaming(file, content);
        }
    }

    /**
     * HTML 파일 검증
     */
    async validateHTMLFiles() {
        const htmlFiles = this.getFilesRecursive('.', '.html');
        
        for (const file of htmlFiles) {
            this.stats.filesChecked++;
            const content = fs.readFileSync(file, 'utf8');
            
            // 1. 이벤트 리스너 연결 검사
            this.checkHTMLEventListeners(file, content);
            
            // 2. 모듈 Import 검사
            this.checkHTMLModuleImports(file, content);
            
            // 3. CSS 클래스 연결 검사
            this.checkHTMLCSSConnections(file, content);
        }
    }

    /**
     * CSS 파일 검증
     */
    async validateCSSFiles() {
        const cssFiles = this.getFilesRecursive('./css', '.css');
        
        for (const file of cssFiles) {
            this.stats.filesChecked++;
            const content = fs.readFileSync(file, 'utf8');
            
            // 1. CSS 예약어 검사
            this.checkCSSReservedWords(file, content);
            
            // 2. CSS 클래스 정의 검사
            this.checkCSSClassDefinitions(file, content);
        }
    }

    /**
     * Strict Mode 예약어 검사
     */
    checkStrictModeReservedWords(file, content) {
        const reservedWords = [
            'yield', 'class', 'function', 'let', 'const', 'var',
            'import', 'export', 'default', 'static', 'extends'
        ];
        
        const lines = content.split('\n');
        
        reservedWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\s*=`, 'g');
            const matches = content.match(regex);
            
            if (matches) {
                matches.forEach((match, index) => {
                    const lineNumber = this.findLineNumber(content, match);
                    this.addIssue({
                        type: 'CRITICAL',
                        category: 'Strict Mode Reserved Word',
                        file: file,
                        line: lineNumber,
                        message: `예약어 '${word}'를 변수명으로 사용: ${match.trim()}`,
                        suggestion: `${word} → ${word}Value 또는 ${word}Name으로 변경`
                    });
                });
            }
        });
    }

    /**
     * 모듈 Export 검사
     */
    checkModuleExports(file, content) {
        // 클래스나 함수가 정의되어 있지만 export되지 않은 경우 검사
        const classMatches = content.match(/class\s+(\w+)/g);
        const functionMatches = content.match(/function\s+(\w+)/g);
        
        if (classMatches || functionMatches) {
            const hasExport = content.includes('export');
            
            if (!hasExport) {
                this.addIssue({
                    type: 'CRITICAL',
                    category: 'Module Export Missing',
                    file: file,
                    line: 1,
                    message: '모듈에서 export 선언이 누락됨',
                    suggestion: '클래스나 함수 앞에 export 키워드 추가'
                });
            }
        }
    }

    /**
     * 이벤트 리스너 연결 검사
     */
    checkEventListenerConnections(file, content) {
        const addEventListenerMatches = content.match(/addEventListener\(['"`]([^'"`]+)['"`]/g);
        
        if (addEventListenerMatches) {
            addEventListenerMatches.forEach(match => {
                const eventType = match.match(/['"`]([^'"`]+)['"`]/)[1];
                const validEvents = ['click', 'change', 'submit', 'load', 'DOMContentLoaded', 'input', 'focus', 'blur'];
                
                if (!validEvents.includes(eventType)) {
                    this.addIssue({
                        type: 'WARNING',
                        category: 'Invalid Event Type',
                        file: file,
                        line: this.findLineNumber(content, match),
                        message: `잘못된 이벤트 타입: ${eventType}`,
                        suggestion: `유효한 이벤트 타입 사용: ${validEvents.join(', ')}`
                    });
                }
            });
        }
    }

    /**
     * HTML 이벤트 리스너 연결 검사
     */
    checkHTMLEventListeners(file, content) {
        // HTML에 ID가 있지만 JavaScript에서 해당 ID를 참조하지 않는 경우 검사
        const idMatches = content.match(/id=['"`]([^'"`]+)['"`]/g);
        
        if (idMatches) {
            const ids = idMatches.map(match => match.match(/['"`]([^'"`]+)['"`]/)[1]);
            
            // JavaScript 파일들에서 해당 ID 참조 검사
            const jsFiles = this.getFilesRecursive('./js', '.js');
            const allJSContent = jsFiles.map(f => fs.readFileSync(f, 'utf8')).join('\n');
            
            ids.forEach(id => {
                if (!allJSContent.includes(`getElementById('${id}')`) && 
                    !allJSContent.includes(`querySelector('#${id}')`)) {
                    this.addIssue({
                        type: 'WARNING',
                        category: 'Unused HTML ID',
                        file: file,
                        line: this.findLineNumber(content, `id="${id}"`),
                        message: `HTML ID '${id}'가 JavaScript에서 참조되지 않음`,
                        suggestion: 'JavaScript에서 이벤트 리스너 추가 또는 ID 제거'
                    });
                }
            });
        }
    }

    /**
     * 변수명 일관성 검사
     */
    checkVariableNaming(file, content) {
        // camelCase 규칙 검사
        const variableMatches = content.match(/(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g);
        
        if (variableMatches) {
            variableMatches.forEach(match => {
                const varName = match.match(/(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/)[1];
                
                // camelCase가 아닌 경우 검사 (단, 상수는 제외)
                if (varName !== varName.toLowerCase() && 
                    varName !== varName.toUpperCase() &&
                    !/^[a-z][a-zA-Z0-9]*$/.test(varName)) {
                    this.addIssue({
                        type: 'INFO',
                        category: 'Variable Naming Convention',
                        file: file,
                        line: this.findLineNumber(content, match),
                        message: `변수명 '${varName}'이 camelCase 규칙을 따르지 않음`,
                        suggestion: 'camelCase 규칙 적용 (예: myVariableName)'
                    });
                }
            });
        }
    }

    /**
     * 이슈 추가
     */
    addIssue(issue) {
        this.issues.push(issue);
        this.stats.issuesFound++;
        
        if (issue.type === 'CRITICAL') {
            this.stats.criticalIssues++;
        }
    }

    /**
     * 결과 출력
     */
    printResults() {
        console.log('\n📊 검증 결과');
        console.log('='.repeat(50));
        console.log(`검사된 파일 수: ${this.stats.filesChecked}`);
        console.log(`발견된 이슈 수: ${this.stats.issuesFound}`);
        console.log(`심각한 이슈 수: ${this.stats.criticalIssues}`);
        
        if (this.issues.length === 0) {
            console.log('\n✅ 모든 검증을 통과했습니다!');
            return;
        }
        
        console.log('\n🚨 발견된 이슈들:');
        console.log('='.repeat(50));
        
        // 이슈 타입별로 그룹화
        const groupedIssues = this.groupIssuesByType();
        
        Object.entries(groupedIssues).forEach(([type, issues]) => {
            const icon = type === 'CRITICAL' ? '🔴' : type === 'WARNING' ? '🟡' : '🔵';
            console.log(`\n${icon} ${type} (${issues.length}개)`);
            
            issues.forEach(issue => {
                console.log(`  📁 ${issue.file}:${issue.line}`);
                console.log(`     ${issue.message}`);
                console.log(`     💡 ${issue.suggestion}`);
                console.log('');
            });
        });
        
        // 권장사항 출력
        this.printRecommendations();
    }

    /**
     * 이슈 타입별 그룹화
     */
    groupIssuesByType() {
        return this.issues.reduce((groups, issue) => {
            if (!groups[issue.type]) {
                groups[issue.type] = [];
            }
            groups[issue.type].push(issue);
            return groups;
        }, {});
    }

    /**
     * 권장사항 출력
     */
    printRecommendations() {
        console.log('💡 권장사항:');
        console.log('='.repeat(50));
        
        if (this.stats.criticalIssues > 0) {
            console.log('🔴 심각한 이슈가 발견되었습니다. 즉시 수정이 필요합니다.');
        }
        
        if (this.issues.some(i => i.category === 'Strict Mode Reserved Word')) {
            console.log('📝 JavaScript 예약어 사용을 피하고 대안 변수명을 사용하세요.');
        }
        
        if (this.issues.some(i => i.category === 'Module Export Missing')) {
            console.log('📦 ES6 모듈에서 export 선언을 확인하세요.');
        }
        
        if (this.issues.some(i => i.category === 'Unused HTML ID')) {
            console.log('🔗 HTML ID와 JavaScript 이벤트 리스너 연결을 확인하세요.');
        }
        
        console.log('\n📋 AI_CODING_CHECKLIST.md 파일을 참조하여 체크리스트를 확인하세요.');
    }

    /**
     * 재귀적으로 파일 찾기
     */
    getFilesRecursive(dir, extension) {
        const files = [];
        
        if (!fs.existsSync(dir)) {
            return files;
        }
        
        const items = fs.readdirSync(dir);
        
        items.forEach(item => {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                files.push(...this.getFilesRecursive(fullPath, extension));
            } else if (item.endsWith(extension)) {
                files.push(fullPath);
            }
        });
        
        return files;
    }

    /**
     * 라인 번호 찾기
     */
    findLineNumber(content, searchText) {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(searchText)) {
                return i + 1;
            }
        }
        return 1;
    }
}

// 스크립트 실행
if (require.main === module) {
    const validator = new CodeValidator();
    validator.validate().catch(console.error);
}

module.exports = CodeValidator; 