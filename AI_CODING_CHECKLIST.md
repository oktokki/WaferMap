# AI 코딩 품질 관리 체크리스트

## 🎯 목적
AI 코딩 에디터(Cursor) 사용 시 반복적인 실수를 방지하고 코드 품질을 향상시키기 위한 체크리스트

## 🎯 **최근 수정 사항 (2025-06-22 21:00)**
- ✅ PDF 리포트 생성 시스템 완전 구현
- ✅ jsPDF 라이브러리 통합
- ✅ 7페이지 전문 PDF 리포트 자동 생성
- ✅ 단일 "Generate Comprehensive Report" 버튼으로 3개 내보내기 버튼 대체
- ✅ Webpack 빌드 JavaScript 오류 해결
- ✅ src/index.html 구조 개선
- ✅ #selected-lot-section 요소 추가
- ✅ #hard-bin-table-container 요소 추가
- ✅ 모든 UI 요소 올바르게 연결
- ✅ 리사이즈 기능 완전 구현

---

## 📋 필수 체크리스트

### 1. 코드 수정 전 체크리스트
- [ ] **이전 이슈 히스토리 확인**
  - `CODING_HISTORY.md` 파일에서 유사한 이슈 패턴 검토
  - 재발 가능성이 높은 이슈 목록 확인

- [ ] **의존성 영향도 분석**
  - 수정할 파일이 다른 모듈에 미치는 영향 검토
  - Import/Export 관계 확인
  - 전역 변수나 함수 사용 시 영향 범위 확인

- [ ] **변수명 및 함수명 검토**
  - JavaScript 예약어 사용 금지: `yield`, `class`, `function`, `let`, `const`, `var`
  - HTML 예약어 사용 금지: `class`, `id`, `name` 등
  - CSS 예약어 사용 금지: `color`, `background`, `border` 등

- [ ] **개발 환경 확인**
  - ES6 모듈 사용 시 HTTP 서버 필요 여부 확인
  - 브라우저 콘솔에서 CORS 또는 모듈 로드 오류 확인
  - Python HTTP 서버 실행 상태 확인 (`python -m http.server 8000`)

- [ ] **빌드 시스템 확인**
  - **모듈 버전**: `wafer map dashboard v4.1.html` (개발용)
  - **Standalone 버전**: `wafer map dashboard v4.1-standalone.html` (배포용)
  - **Webpack 버전**: `dist/bundle.js` (프로덕션용)
  - 각 버전별 HTML 구조 일치성 확인

### 2. 코드 수정 중 체크리스트
- [ ] **모듈 시스템 검증**
  - ES6 모듈: `export class`, `import { }` 구문 확인
  - 모듈 경로 정확성 확인
  - 순환 의존성 방지

- [ ] **이벤트 리스너 연결**
  - HTML 요소 ID와 JavaScript 셀렉터 일치 확인
  - 이벤트 타입 정확성 확인 (`click`, `change`, `submit` 등)
  - 이벤트 리스너 중복 등록 방지

- [ ] **스타일 및 CSS 검증**
  - CSS 클래스명과 HTML class 속성 일치 확인
  - Tailwind CSS 클래스명 정확성 확인
  - 반응형 디자인 클래스 적용 확인

- [ ] **HTML 요소 존재 확인**
  - `#selected-lot-section` 요소 존재 확인
  - `#hard-bin-table-container` 요소 존재 확인
  - `#test-results-container` 요소 존재 확인
  - 모든 필수 UI 요소 ID 확인

### 3. 코드 수정 후 체크리스트
- [ ] **브라우저 콘솔 오류 확인**
  - JavaScript 구문 오류 확인
  - 모듈 로드 오류 확인
  - 네트워크 오류 확인

- [ ] **기능 동작 테스트**
  - 수정된 기능 직접 테스트
  - 연관된 기능들 정상 동작 확인
  - 사용자 인터페이스 반응성 확인

- [ ] **코드 리뷰**
  - 변수명 일관성 확인
  - 함수 구조 및 로직 검토
  - 주석 및 문서화 확인

- [ ] **빌드 테스트**
  - Webpack 빌드 성공 확인 (`npm run build`)
  - Standalone 빌드 성공 확인
  - 모든 버전에서 기능 정상 동작 확인

---

## 🚨 고위험 이슈 패턴

### 1. Strict Mode 예약어 충돌
**위험도**: 🔴 높음  
**재발 가능성**: 🔴 높음

**예방책**:
```javascript
// ❌ 잘못된 예시
const yield = calculateYield(data);
const class = getClassInfo();

// ✅ 올바른 예시
const yieldValue = calculateYield(data);
const className = getClassInfo();
```

### 2. 모듈 Import/Export 불일치
**위험도**: 🔴 높음  
**재발 가능성**: 🟡 중간

**예방책**:
```javascript
// ❌ 잘못된 예시
class MyClass { }
// export 누락

// ✅ 올바른 예시
export class MyClass { }
```

### 3. 이벤트 리스너 누락
**위험도**: 🟡 중간  
**재발 가능성**: 🟡 중간

**예방책**:
```javascript
// ❌ 잘못된 예시
// HTML에 버튼만 있고 이벤트 리스너 없음
<button id="uploadBtn">Upload</button>

// ✅ 올바른 예시
document.getElementById('uploadBtn').addEventListener('click', handleUpload);
```

### 4. HTTP 서버 필요성 (ES6 모듈)
**위험도**: 🔴 높음  
**재발 가능성**: 🟢 낮음

**예방책**:
```bash
# ❌ 잘못된 예시 - file:// 프로토콜에서 ES6 모듈 로드 실패
# 브라우저에서 HTML 파일 직접 열기

# ✅ 올바른 예시 - HTTP 서버 사용
python -m http.server 8000
# 또는
npx http-server
# 또는
# VS Code Live Server 확장 사용
```

### 5. HTML 요소 누락 (Webpack 빌드)
**위험도**: 🔴 높음  
**재발 가능성**: 🟡 중간

**예방책**:
```html
<!-- ❌ 잘못된 예시 -->
<!-- 필수 요소 누락 -->

<!-- ✅ 올바른 예시 -->
<div id="selected-lot-section" class="hidden">
    <div id="hard-bin-table-container">
        <table id="hard-bin-table">
            <tbody id="hard-bin-tbody"></tbody>
        </table>
    </div>
    <div id="test-results-container"></div>
</div>
```

### 6. PDF 리포트 생성 라이브러리 누락
**위험도**: 🔴 높음  
**재발 가능성**: 🟢 낮음

**예방책**:
```html
<!-- ❌ 잘못된 예시 -->
<!-- jsPDF 라이브러리 누락 -->

<!-- ✅ 올바른 예시 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.29/jspdf.plugin.autotable.min.js"></script>
```

### 7. PDF 생성 함수 오류 처리 누락
**위험도**: 🟡 중간  
**재발 가능성**: 🟡 중간

**예방책**:
```javascript
// ❌ 잘못된 예시
generateComprehensiveReport() {
    this.createPDFReport(analytics);
}

// ✅ 올바른 예시
generateComprehensiveReport() {
    try {
        if (typeof window.jspdf === 'undefined') {
            this.showError('PDF generation library not loaded');
            return;
        }
        if (!window.currentAnalytics) {
            this.showError('No data available for report generation');
            return;
        }
        this.createPDFReport(window.currentAnalytics);
    } catch (error) {
        this.showError(`Error generating report: ${error.message}`);
    }
}
```

---

## 🔧 자동화 도구 및 스크립트

### 1. 코드 검증 스크립트
```bash
# JavaScript 예약어 검사
grep -r "yield\|class\|function" js/ --exclude-dir=node_modules

# 모듈 export 검사
grep -r "export class\|export function" js/

# 이벤트 리스너 검사
grep -r "addEventListener" js/

# HTML 요소 존재 검사
grep -r "selected-lot-section\|hard-bin-table-container" *.html

# PDF 라이브러리 검사
grep -r "jspdf" *.html

# PDF 생성 함수 검사
grep -r "generateComprehensiveReport\|createPDFReport" js/
```

### 2. 브라우저 테스트 체크리스트
- [ ] 페이지 로드 시 콘솔 오류 없음
- [ ] 모든 탭 전환 정상 동작
- [ ] 파일 업로드 기능 정상 동작
- [ ] 데이터 표시 및 계산 정확성
- [ ] 반응형 디자인 정상 동작
- [ ] Lot 선택 시 상세 정보 표시
- [ ] Hard bin 테이블 정상 표시
- [ ] Test results 테이블 정상 표시
- [ ] **PDF 리포트 생성 버튼 정상 동작**
- [ ] **PDF 파일 다운로드 성공**
- [ ] **PDF 내용 정확성 검증**
- [ ] **PDF 포맷팅 품질 확인**

### 3. 빌드 시스템 체크리스트
- [ ] `npm run build` 성공
- [ ] Standalone 빌드 성공
- [ ] 모든 버전에서 기능 동일
- [ ] 번들 크기 최적화
- [ ] **jsPDF 라이브러리 정상 로드**
- [ ] **PDF 생성 기능 번들 포함**

---

## 📝 문서화 규칙

### 1. 이슈 기록 규칙
- **발생 일시**: YYYY-MM-DD HH:MM
- **파일 위치**: 정확한 파일명과 라인 번호
- **문제 설명**: 구체적인 오류 메시지와 상황
- **해결 방법**: 적용한 수정 내용
- **재발 가능성**: 높음/중간/낮음

### 2. 코드 주석 규칙
```javascript
/**
 * 함수 설명
 * @param {string} param1 - 매개변수 설명
 * @returns {Object} 반환값 설명
 * @throws {Error} 발생 가능한 오류
 */
function exampleFunction(param1) {
    // 구현 내용
}
```

---

## 🎯 AI 코딩 모범 사례

### 1. 점진적 수정
- 한 번에 여러 파일을 수정하지 말고 단계별로 진행
- 각 단계마다 테스트 및 검증 수행
- 문제 발생 시 즉시 롤백 가능하도록 백업 유지

### 2. 모듈화 원칙
- 단일 책임 원칙: 한 모듈은 하나의 기능만 담당
- 의존성 최소화: 모듈 간 의존성을 최소화
- 인터페이스 명확화: 모듈 간 인터페이스를 명확히 정의

### 3. 테스트 우선
- 기능 구현 전 테스트 케이스 작성
- 자동화된 테스트 스크립트 활용
- 수동 테스트 체크리스트 준수

### 4. 빌드 시스템 관리
- 모든 빌드 버전 동기화 유지
- HTML 구조 일관성 확인
- 버전별 테스트 수행

---

## 📊 품질 지표

### 1. 이슈 발생률
- **목표**: 월 1회 이하
- **현재**: 4회 (초기 설정 단계)
- **개선 방안**: 체크리스트 준수율 향상

### 2. 빌드 성공률
- **목표**: 100%
- **현재**: 100% (모든 빌드 성공)
- **개선 방안**: 지속적 모니터링

### 3. JavaScript 오류 해결률
- **목표**: 100%
- **현재**: 100% (모든 오류 해결)
- **개선 방안**: 사전 예방적 체크리스트 강화

---

## 🏗️ **현재 프로젝트 상태**

### **버전 정보**
- **현재 버전**: v4.2.0 (2025-06-22)
- **빌드 상태**: ✅ 모든 빌드 성공
- **JavaScript 오류**: ✅ 해결됨
- **UI 기능**: ✅ 완전 작동
- **PDF 리포트 생성**: ✅ 완전 구현

### **주요 기능**
- **7페이지 전문 PDF 리포트** 자동 생성
- **jsPDF 라이브러리** 통합
- **단일 "Generate Comprehensive Report" 버튼**
- **전문적인 포맷팅** 및 브랜딩
- **상황별 개선 제안** 자동 생성

### **파일 구조**
```
WaferMap/
├── js/                    # 모듈 버전용
├── src/                   # Webpack 빌드용
│   ├── js/
│   ├── index.html        # Webpack용 HTML (jsPDF 포함)
│   └── index.js
├── dist/                  # Webpack 빌드 결과
│   └── bundle.js         # PDF 기능 포함
├── wafer map dashboard v4.1.html          # 모듈 버전
├── wafer map dashboard v4.1-standalone.html # Standalone 버전
└── package.json
```

### **빌드 프로세스**
```bash
# 개발 환경
python -m http.server 8000

# Standalone 빌드
node scripts/build-standalone.js

# Webpack 빌드
npm install
npm run build
```

### **PDF 리포트 구성**
1. **Executive Summary** - 핵심 발견사항 및 수율 상태
2. **Overall Statistics** - 집계된 성능 지표
3. **Lot Comparison Analysis** - 로트별 상세 비교
4. **Quality Metrics & Process Capability** - 시그마 레벨, Cpk, 품질 점수
5. **Failure Analysis & Root Causes** - 주요 실패 패턴 및 원인
6. **Detailed Test Results** - 사이트별 상세 테스트 데이터
7. **Recommendations & Action Items** - 상황별 개선 제안

---

**마지막 업데이트**: 2025-06-22 21:00
**업데이트 내용**: PDF 리포트 생성 시스템 완전 구현, jsPDF 라이브러리 통합, 7페이지 전문 PDF 리포트 자동 생성, 단일 "Generate Comprehensive Report" 버튼으로 3개 내보내기 버튼 대체, Webpack 빌드 JavaScript 오류 해결, src/index.html 구조 개선, #selected-lot-section 요소 추가, #hard-bin-table-container 요소 추가, 모든 UI 요소 올바르게 연결, 리사이즈 기능 완전 구현 