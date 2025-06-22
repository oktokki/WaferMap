#!/usr/bin/env node

const ChatSessionManager = require('./utils/chatSessionManager');

async function testChatSession() {
  console.log('🧪 채팅 세션 시스템 테스트 시작\n');

  // 새 세션 생성
  const manager = new ChatSessionManager('test-session');
  console.log(`✅ 세션 생성: ${manager.sessionId}`);

  // 테스트 라운드들 추가
  const testRounds = [
    {
      userInput: "채팅 세션 관리 시스템을 만들어주세요",
      aiOutput: "네, 채팅 세션 관리 시스템을 구현해드리겠습니다. 이 시스템은 라운드 카운팅, 용량 한계 추정, 세션 요약 기능을 포함합니다.",
      summary: "채팅 세션 관리 시스템 요청 및 구현 계획"
    },
    {
      userInput: "라운드 카운팅 기능은 어떻게 구현하나요?",
      aiOutput: "라운드 카운팅은 매 사용자 입력과 AI 출력을 하나의 라운드로 계산합니다. addRound() 메서드를 사용하여 라운드를 추가하고, roundCount 변수로 추적합니다.",
      summary: "라운드 카운팅 구현 방법 설명"
    },
    {
      userInput: "용량 한계는 어떻게 설정하나요?",
      aiOutput: "용량 한계는 maxRounds 변수로 설정하며, 기본값은 50라운드입니다. 80% 도달 시 경고를 표시하고, 100% 도달 시 세션 종료를 권장합니다.",
      summary: "용량 한계 설정 방법"
    },
    {
      userInput: "세션 요약 기능을 추가해주세요",
      aiOutput: "세션 요약 기능을 추가했습니다. generateSessionSummary() 메서드로 라운드별 요약, 키워드 추출, 통계 정보를 생성합니다.",
      summary: "세션 요약 기능 구현"
    },
    {
      userInput: "이전 세션을 계속할 수 있나요?",
      aiOutput: "네, loadPreviousSession() 메서드를 사용하여 이전 세션을 로드할 수 있습니다. 세션 데이터는 JSON 파일로 저장되어 세션 간 연속성을 보장합니다.",
      summary: "이전 세션 계속 기능 설명"
    }
  ];

  // 라운드 추가
  for (let i = 0; i < testRounds.length; i++) {
    const round = testRounds[i];
    const addedRound = manager.addRound(round.userInput, round.aiOutput, round.summary);
    console.log(`🔄 라운드 ${addedRound.roundNumber} 추가됨: ${round.summary}`);
    
    // 진행률 표시
    const info = manager.getSessionInfo();
    console.log(`   진행률: ${info.progress} (${info.remaining} 라운드 남음)`);
    
    // 용량 한계 체크
    if (info.isNearCapacity) {
      console.log(`   ⚠️  용량 한계 임박!`);
    }
    
    console.log('');
  }

  // 세션 정보 출력
  console.log('📊 최종 세션 정보:');
  const finalInfo = manager.getSessionInfo();
  console.log(`세션 ID: ${finalInfo.sessionId}`);
  console.log(`총 라운드: ${finalInfo.roundCount}`);
  console.log(`진행률: ${finalInfo.progress}`);
  console.log(`남은 라운드: ${finalInfo.remaining}`);
  console.log(`용량 한계 임박: ${finalInfo.isNearCapacity ? '예' : '아니오'}`);
  console.log(`용량 한계 도달: ${finalInfo.isAtCapacity ? '예' : '아니오'}`);

  // 세션 종료 및 요약 생성
  console.log('\n📝 세션 종료 및 요약 생성...');
  const summary = manager.finalizeSession();
  
  if (summary) {
    console.log('\n📋 세션 요약:');
    console.log(`기간: ${summary.startTime} ~ ${summary.endTime}`);
    console.log(`총 입력: ${summary.totalInputLength}자`);
    console.log(`총 출력: ${summary.totalOutputLength}자`);
    console.log(`주요 키워드: ${summary.keyTopics.join(', ')}`);
    
    console.log('\n라운드별 요약:');
    summary.rounds.forEach(round => {
      console.log(`${round.round}. ${round.summary}`);
    });
  }

  // 이전 세션 목록 확인
  console.log('\n📚 이전 세션 목록:');
  const sessions = manager.listPreviousSessions();
  if (sessions.length > 0) {
    sessions.forEach((session, index) => {
      console.log(`${index + 1}. ${session.sessionId} (${session.lastModified.toLocaleString()})`);
    });
  } else {
    console.log('저장된 세션이 없습니다.');
  }

  console.log('\n✅ 테스트 완료!');
}

// 테스트 실행
testChatSession().catch(console.error); 