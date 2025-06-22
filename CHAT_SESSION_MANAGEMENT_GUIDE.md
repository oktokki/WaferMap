# 채팅 세션 관리 시스템 가이드

## 개요

이 시스템은 Cursor AI 채팅의 용량 한계를 관리하고 효율적으로 세션을 관리하기 위해 개발되었습니다. 매 라운드(사용자 입력 + AI 출력)를 추적하고, 용량 한계에 도달하기 전에 세션을 정리하여 새로운 채팅을 시작할 수 있도록 도와줍니다.

## 주요 기능

### 🔄 라운드 추적
- 매 라운드마다 자동 카운팅 (1/50, 2/50, ...)
- 사용자 입력과 AI 출력의 길이 측정
- 자동 요약 생성

### ⚠️ 용량 한계 관리
- 80% 도달 시 경고 표시
- 100% 도달 시 세션 종료 권장
- 실시간 진행률 표시

### 📊 세션 요약
- 라운드별 요약 기록
- 주요 키워드 추출
- 세션 통계 생성

### 🔄 세션 연속성
- 이전 세션 정보 로드
- 세션 간 지식 전달
- 요약 파일 자동 생성

## 사용 방법

### 1. CLI 도구 사용

```bash
# 채팅 관리자 실행
node scripts/chat-manager.js

# 또는 npm 스크립트로 실행 (package.json에 추가 필요)
npm run chat-manager
```

#### CLI 메뉴 옵션:
- **1. 새 세션 시작**: 새로운 채팅 세션 생성
- **2. 이전 세션 계속**: 저장된 세션 로드
- **3. 세션 목록 보기**: 모든 세션 조회
- **4. 세션 요약 보기**: 전체 요약 파일 확인
- **5. 현재 세션 정보**: 활성 세션 상태 확인
- **6. 세션 종료**: 현재 세션 정리 및 요약 생성

### 2. 웹 인터페이스 사용

웹 페이지에서 자동으로 세션 트래커가 활성화됩니다:

```javascript
// 자동 라운드 추가 (Cursor에서 사용)
window.addChatRound("사용자 입력", "AI 출력");

// 세션 정보 조회
const info = window.getChatSessionInfo();

// 세션 종료
window.finalizeChatSession();
```

### 3. 수동 라운드 추가

```javascript
// CLI에서
const ChatSessionManager = require('./scripts/utils/chatSessionManager');
const manager = new ChatSessionManager();

// 라운드 추가
const round = manager.addRound(
  "사용자 질문", 
  "AI 답변", 
  "선택적 요약"
);

// 세션 정보 확인
const info = manager.getSessionInfo();
console.log(`진행률: ${info.progress}`);

// 세션 종료
const summary = manager.finalizeSession();
```

## 파일 구조

```
scripts/
├── utils/
│   ├── chatSessionManager.js    # 서버 사이드 세션 관리
│   └── chatSessionTracker.js    # 웹 사이드 세션 추적
├── chat-manager.js              # CLI 도구
└── utils/
    └── historyUtil.js           # 기존 히스토리 유틸리티

data/
└── chat-sessions/               # 세션 데이터 저장소
    ├── session-2024-01-01.json
    └── session-2024-01-02.json

CHAT_SESSION_SUMMARY.md          # 전체 세션 요약
```

## 세션 데이터 형식

### 세션 파일 (JSON)
```json
{
  "sessionId": "session-2024-01-01T10-00-00-000Z",
  "roundCount": 25,
  "sessionData": [
    {
      "roundNumber": 1,
      "timestamp": "2024-01-01T10:00:00.000Z",
      "userInput": "사용자 질문...",
      "aiOutput": "AI 답변...",
      "summary": "사용자: 질문 | AI: 답변",
      "inputLength": 50,
      "outputLength": 200
    }
  ],
  "lastUpdated": "2024-01-01T10:30:00.000Z"
}
```

### 요약 파일 (Markdown)
```markdown
# 채팅 세션 요약

## 세션 session-2024-01-01T10-00-00-000Z

**기간**: 2024-01-01T10:00:00.000Z ~ 2024-01-01T10:30:00.000Z
**라운드**: 25회
**총 입력**: 1250자
**총 출력**: 5000자
**주요 키워드**: 웨이퍼(5), 분석(3), 데이터(2)

### 라운드별 요약
1. 사용자: 웨이퍼 맵 분석 | AI: STDF 파일 처리 방법
2. 사용자: 데이터 시각화 | AI: 차트 라이브러리 추천
...
```

## 설정 옵션

### 용량 한계 조정
```javascript
// chatSessionManager.js에서
this.maxRounds = 50; // 기본값: 50라운드

// 80% 경고 임계값
this.isNearCapacity() {
  return this.roundCount >= this.maxRounds * 0.8;
}
```

### 텍스트 길이 제한
```javascript
// 입력/출력 텍스트 자동 축약
this.truncateText(userInput, 500);   // 입력: 500자
this.truncateText(aiOutput, 1000);   // 출력: 1000자
```

## 모범 사례

### 1. 정기적인 세션 관리
- 40라운드 이상 진행 시 새 세션 고려
- 중요한 결정사항은 별도 문서로 저장
- 세션 요약을 새 채팅 시작 시 참조

### 2. 효율적인 라운드 활용
- 명확하고 구체적인 질문 작성
- 관련 없는 주제는 별도 세션으로 분리
- 복잡한 작업은 단계별로 진행

### 3. 지식 전달
- 이전 세션의 핵심 내용을 새 세션 시작 시 언급
- `CHAT_SESSION_SUMMARY.md` 파일 활용
- 프로젝트별로 세션 분리

## 문제 해결

### 세션 파일 손상
```bash
# 세션 파일 백업 및 복구
cp data/chat-sessions/session-*.json backup/
# 손상된 파일 삭제 후 새 세션 시작
```

### 용량 한계 초과
```javascript
// 강제로 세션 종료
manager.finalizeSession();
// 새 세션 시작
const newManager = new ChatSessionManager();
```

### 웹 인터페이스 오류
```javascript
// 브라우저 콘솔에서
localStorage.clear(); // 모든 세션 데이터 삭제
location.reload();    // 페이지 새로고침
```

## 업데이트 계획

### v1.1 예정 기능
- [ ] 세션 병합 기능
- [ ] 고급 키워드 분석
- [ ] 세션 템플릿 기능
- [ ] 자동 백업 시스템

### v1.2 예정 기능
- [ ] AI 기반 요약 생성
- [ ] 세션 검색 기능
- [ ] 통계 대시보드
- [ ] 팀 협업 기능

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 