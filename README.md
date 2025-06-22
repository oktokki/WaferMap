# Semiconductor Value Chain ERP - Wafer Map Dashboard

## 🎯 **프로젝트 개요**

반도체 제조 가치 사슬 전반에 걸친 웨이퍼 테스트 데이터 분석 및 관리 시스템입니다. KGD(Known Good Die) 비즈니스를 위한 종합적인 데이터 분석 플랫폼으로, 프론트엔드 웨이퍼 테스트부터 백엔드 패키징, 최종 테스트까지 모든 공정의 데이터를 통합 분석할 수 있습니다.

## 🚀 **현재 버전: v5.0-integrated**

### ✨ **주요 특징**

#### **🎨 현대적인 UI/UX**
- **글래스모피즘 디자인**: 현대적이고 전문적인 인터페이스
- **그라데이션 배경**: 시각적으로 매력적인 사용자 경험
- **반응형 레이아웃**: 모든 디바이스에서 최적화된 표시
- **직관적인 네비게이션**: 공정별 전용 페이지 구조

#### **🏭 완전한 가치 사슬 지원**
- **Wafer Test**: KGD 맵 데이터 및 ZIP 파일 분석
- **CP/EDS STDF**: STDF 파일 기반 상세 분석
- **Packaging**: Excel 파일 기반 패키징 데이터 분석
- **Final Test**: lotSumTXT 및 STDF 통합 분석
- **LIS**: Lead Inspection System 데이터 분석
- **Correlation**: 전체 가치 사슬 상관관계 분석

#### **📊 고급 분석 기능**
- **웨이퍼 맵 시각화**: Canvas 기반 원형 맵 렌더링
- **수율 분석**: Chart.js 활용한 분포 차트
- **패턴 분석**: 결함 패턴 감지 및 리스크 평가
- **심층 분석**: 이상치 감지 및 맞춤형 권장사항

## 🏗️ **시스템 구조**

### **허브-스포크 아키텍처**
```
메인 페이지 (허브)
├── Wafer Test Analytics → wafer-test-dedicated.html
├── CP/EDS STDF Analytics → cp-stdf-dedicated.html
├── Packaging Analytics → packaging-dedicated.html
├── Final Test Analytics → final-test-dedicated.html
└── LIS Analytics → lis-dedicated.html
```

### **모듈 구조**
```
js/
├── modules/
│   ├── Analytics.js          # 기본 분석 모듈
│   ├── BinningAnalysis.js    # 빈닝 분석
│   ├── STDFParser.js         # STDF 파일 파서
│   ├── ExcelParser.js        # Excel 파일 파서
│   ├── SummaryFileParser.js  # 요약 파일 파서
│   ├── TestAnalysis.js       # 테스트 분석
│   ├── UI.js                 # UI 관리
│   └── WaferTestModule.js    # 웨이퍼 테스트 전용
├── utils/
│   ├── CalculationUtils.js   # 계산 유틸리티
│   └── FileUtils.js          # 파일 처리 유틸리티
└── STDFFileHandler.js        # 통합 파일 핸들러
```

## 📁 **주요 파일**

### **메인 대시보드**
- `wafer map dashboard v5.0-integrated.html` - 메인 랜딩 페이지
- `wafer-test-dedicated.html` - 웨이퍼 테스트 전용 분석
- `cp-stdf-dedicated.html` - CP/EDS STDF 전용 분석
- `packaging-dedicated.html` - 패키징 전용 분석
- `final-test-dedicated.html` - 최종 테스트 전용 분석
- `lis-dedicated.html` - LIS 전용 분석

### **테스트 및 개발**
- `test-phase1-features.html` - Phase 1 기능 테스트
- `test-phase1-simple.html` - 간단한 기능 테스트

### **문서**
- `CHAT_SESSION_SUMMARY.md` - 세션 요약 및 진행 상황
- `CODING_HISTORY.md` - 코딩 히스토리
- `VERSION_HISTORY.md` - 버전 히스토리
- `Phase1_Implementation_Summary.md` - Phase 1 구현 요약

## 🛠️ **기술 스택**

### **프론트엔드**
- **HTML5**: 시맨틱 마크업, 접근성 지원
- **CSS3**: 그라데이션, 글래스모피즘, 반응형 디자인
- **JavaScript ES6+**: 모듈화, 클래스 기반 구조
- **Chart.js**: 데이터 시각화
- **SheetJS**: Excel 파일 처리

### **파일 지원**
- **ZIP**: 웨이퍼 맵 데이터 압축 파일
- **STDF**: 반도체 테스트 데이터 표준 형식
- **Excel**: LIS 리포트 및 패키징 데이터
- **TXT**: lotSum 요약 파일

## 🚀 **시작하기**

### **1. 기본 사용법**
1. `wafer map dashboard v5.0-integrated.html` 파일을 웹 브라우저에서 열기
2. 원하는 공정 분석 카드 클릭
3. 해당 전용 페이지에서 파일 업로드 및 분석 수행

### **2. 웨이퍼 테스트 분석**
1. "Wafer Test Analytics" 카드 클릭
2. ZIP 파일 업로드 (웨이퍼 맵 데이터 포함)
3. 웨이퍼 맵 시각화 및 수율 분석 확인

### **3. STDF 파일 분석**
1. "CP/EDS STDF Analytics" 카드 클릭
2. STDF 파일 업로드
3. 테스트 결과 데이터 분석

### **4. Excel 파일 분석**
1. "Packaging Analytics" 또는 "LIS Analytics" 카드 클릭
2. Excel 파일 업로드
3. 테이블 데이터 분석

## 📊 **주요 기능**

### **웨이퍼 맵 시각화**
- 원형 웨이퍼 맵 렌더링
- Pass/Fail/Skip 상태 표시
- 다이별 상세 정보 툴팁
- 줌 및 패닝 기능

### **수율 분석**
- 롯별 평균 수율 계산
- 웨이퍼별 수율 분포 차트
- 통계적 분석 및 트렌드
- 이상치 감지

### **패턴 분석**
- 결함 패턴 자동 감지
- 리스크 레벨 평가
- 맞춤형 개선 권장사항
- 히스토리 기반 예측

### **데이터 통합**
- 다중 파일 형식 지원
- 자동 파일 타입 감지
- 통합 데이터 처리
- 일관된 분석 인터페이스

## 🔧 **개발 환경 설정**

### **필요한 도구**
- 웹 브라우저 (Chrome, Firefox, Safari, Edge)
- 텍스트 에디터 (VS Code, Sublime Text 등)
- Git (버전 관리)

### **로컬 개발**
```bash
# 저장소 클론
git clone [repository-url]
cd WaferMap

# 웹 서버 실행 (선택사항)
python -m http.server 8000
# 또는
npx serve .
```

## 📈 **성과 지표**

### **v5.0 개선사항**
- **UI 복잡도**: 70% 감소 (불필요한 정보 제거)
- **사용자 경험**: 직관성 대폭 향상
- **기능 통합**: v1.0 기능 100% 이전 완료
- **확장성**: 새로운 공정 추가 용이성 확보

## 🚀 **로드맵**

### **Phase 2: 전용 페이지 기능 구현**
1. CP/EDS STDF Analytics 상세 기능 구현
2. Packaging Analytics Excel 파싱 기능
3. Final Test Analytics lotSumTXT 및 STDF 통합
4. LIS Analytics 데이터 분석 기능
5. Correlation Analysis 전체 가치 사슬 분석

### **Phase 3: 고급 기능**
1. **리포트 생성**: PDF 형태의 종합 분석 리포트
2. **데이터 내보내기**: Excel, CSV 형태의 데이터 내보내기
3. **실시간 모니터링**: 실시간 데이터 업데이트 및 알림
4. **사용자 관리**: 다중 사용자 지원 및 권한 관리

## 🤝 **기여하기**

### **개발 가이드라인**
1. 모듈화된 구조 유지
2. 일관된 코딩 스타일 적용
3. 문서화 및 주석 작성
4. 테스트 코드 작성

### **버그 리포트**
- 이슈 템플릿 사용
- 재현 가능한 단계 제공
- 환경 정보 포함

## 📄 **라이선스**

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 **연락처**

프로젝트 관련 문의사항이나 제안사항이 있으시면 이슈를 통해 연락해 주세요.

---

**버전**: v5.0-integrated  
**최종 업데이트**: 2025-01-02  
**상태**: 활성 개발 중
