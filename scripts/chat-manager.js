#!/usr/bin/env node

const ChatSessionManager = require('./utils/chatSessionManager');
const readline = require('readline');

class ChatManagerCLI {
  constructor() {
    this.manager = null;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async start() {
    console.log('🤖 채팅 세션 관리자 v1.0');
    console.log('================================');
    
    await this.showMainMenu();
  }

  async showMainMenu() {
    console.log('\n📋 메인 메뉴:');
    console.log('1. 새 세션 시작');
    console.log('2. 이전 세션 계속');
    console.log('3. 세션 목록 보기');
    console.log('4. 세션 요약 보기');
    console.log('5. 현재 세션 정보');
    console.log('6. 세션 종료');
    console.log('0. 종료');

    const choice = await this.question('선택하세요: ');
    
    switch (choice) {
      case '1':
        await this.startNewSession();
        break;
      case '2':
        await this.continuePreviousSession();
        break;
      case '3':
        await this.listSessions();
        break;
      case '4':
        await this.showSessionSummary();
        break;
      case '5':
        await this.showCurrentSessionInfo();
        break;
      case '6':
        await this.finalizeCurrentSession();
        break;
      case '0':
        await this.exit();
        break;
      default:
        console.log('❌ 잘못된 선택입니다.');
        await this.showMainMenu();
    }
  }

  async startNewSession() {
    console.log('\n🚀 새 세션 시작');
    
    const sessionId = await this.question('세션 ID (엔터 시 자동 생성): ');
    this.manager = new ChatSessionManager(sessionId || null);
    
    console.log(`✅ 세션 ${this.manager.sessionId} 시작됨`);
    await this.showSessionMenu();
  }

  async continuePreviousSession() {
    console.log('\n📚 이전 세션 계속');
    
    const sessions = this.manager ? this.manager.listPreviousSessions() : 
                    new ChatSessionManager().listPreviousSessions();
    
    if (sessions.length === 0) {
      console.log('❌ 이전 세션이 없습니다.');
      await this.showMainMenu();
      return;
    }

    console.log('\n이전 세션 목록:');
    sessions.forEach((session, index) => {
      console.log(`${index + 1}. ${session.sessionId} (${session.lastModified.toLocaleString()})`);
    });

    const choice = await this.question('계속할 세션 번호 선택: ');
    const selectedIndex = parseInt(choice) - 1;
    
    if (selectedIndex >= 0 && selectedIndex < sessions.length) {
      const sessionId = sessions[selectedIndex].sessionId;
      this.manager = new ChatSessionManager(sessionId);
      console.log(`✅ 세션 ${sessionId} 로드됨`);
      await this.showSessionMenu();
    } else {
      console.log('❌ 잘못된 선택입니다.');
      await this.showMainMenu();
    }
  }

  async listSessions() {
    console.log('\n📋 세션 목록');
    
    const sessions = this.manager ? this.manager.listPreviousSessions() : 
                    new ChatSessionManager().listPreviousSessions();
    
    if (sessions.length === 0) {
      console.log('❌ 저장된 세션이 없습니다.');
    } else {
      sessions.forEach((session, index) => {
        console.log(`${index + 1}. ${session.sessionId}`);
        console.log(`   마지막 수정: ${session.lastModified.toLocaleString()}`);
      });
    }
    
    await this.showMainMenu();
  }

  async showSessionSummary() {
    console.log('\n📊 세션 요약');
    
    const summaryPath = new ChatSessionManager().summaryFile;
    try {
      if (require('fs').existsSync(summaryPath)) {
        const content = require('fs').readFileSync(summaryPath, 'utf8');
        console.log(content);
      } else {
        console.log('❌ 요약 파일이 없습니다.');
      }
    } catch (error) {
      console.log('❌ 요약 파일 읽기 오류:', error.message);
    }
    
    await this.showMainMenu();
  }

  async showCurrentSessionInfo() {
    if (!this.manager) {
      console.log('❌ 활성 세션이 없습니다.');
      await this.showMainMenu();
      return;
    }

    const info = this.manager.getSessionInfo();
    console.log('\n📊 현재 세션 정보:');
    console.log(`세션 ID: ${info.sessionId}`);
    console.log(`진행률: ${info.progress}`);
    console.log(`남은 라운드: ${info.remaining}`);
    console.log(`용량 한계 임박: ${info.isNearCapacity ? '예' : '아니오'}`);
    console.log(`용량 한계 도달: ${info.isAtCapacity ? '예' : '아니오'}`);
    
    await this.showSessionMenu();
  }

  async finalizeCurrentSession() {
    if (!this.manager) {
      console.log('❌ 활성 세션이 없습니다.');
      await this.showMainMenu();
      return;
    }

    const summary = this.manager.finalizeSession();
    if (summary) {
      console.log('\n📝 세션 요약:');
      console.log(`총 라운드: ${summary.roundCount}`);
      console.log(`총 입력: ${summary.totalInputLength}자`);
      console.log(`총 출력: ${summary.totalOutputLength}자`);
      console.log(`주요 키워드: ${summary.keyTopics.join(', ')}`);
    }
    
    this.manager = null;
    await this.showMainMenu();
  }

  async showSessionMenu() {
    if (!this.manager) {
      await this.showMainMenu();
      return;
    }

    const info = this.manager.getSessionInfo();
    console.log(`\n🔄 세션 ${info.sessionId} (${info.progress})`);
    console.log('1. 라운드 추가');
    console.log('2. 세션 정보 보기');
    console.log('3. 세션 종료');
    console.log('4. 메인 메뉴로');

    const choice = await this.question('선택하세요: ');
    
    switch (choice) {
      case '1':
        await this.addRound();
        break;
      case '2':
        await this.showCurrentSessionInfo();
        break;
      case '3':
        await this.finalizeCurrentSession();
        break;
      case '4':
        await this.showMainMenu();
        break;
      default:
        console.log('❌ 잘못된 선택입니다.');
        await this.showSessionMenu();
    }
  }

  async addRound() {
    if (!this.manager) {
      console.log('❌ 활성 세션이 없습니다.');
      await this.showMainMenu();
      return;
    }

    if (this.manager.isAtCapacity()) {
      console.log('❌ 세션 용량 한계에 도달했습니다.');
      console.log('💡 세션을 종료하고 새 세션을 시작하세요.');
      await this.showSessionMenu();
      return;
    }

    console.log('\n💬 라운드 추가');
    
    const userInput = await this.question('사용자 입력: ');
    const aiOutput = await this.question('AI 출력: ');
    const summary = await this.question('요약 (선택사항): ');

    const round = this.manager.addRound(userInput, aiOutput, summary);
    
    console.log(`✅ 라운드 ${round.roundNumber} 추가됨`);
    
    if (this.manager.isNearCapacity()) {
      console.log('⚠️  용량 한계가 임박했습니다. 세션 종료를 고려하세요.');
    }
    
    await this.showSessionMenu();
  }

  async exit() {
    if (this.manager) {
      const choice = await this.question('활성 세션이 있습니다. 종료하시겠습니까? (y/N): ');
      if (choice.toLowerCase() === 'y') {
        this.manager.finalizeSession();
      }
    }
    
    console.log('👋 채팅 세션 관리자를 종료합니다.');
    this.rl.close();
    process.exit(0);
  }

  question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }
}

// CLI 실행
if (require.main === module) {
  const cli = new ChatManagerCLI();
  cli.start().catch(console.error);
}

module.exports = ChatManagerCLI; 