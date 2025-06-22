const fs = require('fs');
const path = require('path');

class ChatSessionManager {
  constructor(sessionId = null) {
    this.sessionId = sessionId || this.generateSessionId();
    this.roundCount = 0;
    this.maxRounds = 50; // 기본 한계
    this.sessionDataPath = path.join(__dirname, '../../data/chat-sessions');
    this.currentSessionFile = path.join(this.sessionDataPath, `${this.sessionId}.json`);
    this.summaryFile = path.join(__dirname, '../../CHAT_SESSION_SUMMARY.md');
    
    this.ensureDirectories();
    this.loadSession();
  }

  generateSessionId() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `session-${timestamp}`;
  }

  ensureDirectories() {
    if (!fs.existsSync(this.sessionDataPath)) {
      fs.mkdirSync(this.sessionDataPath, { recursive: true });
    }
  }

  loadSession() {
    try {
      if (fs.existsSync(this.currentSessionFile)) {
        const data = JSON.parse(fs.readFileSync(this.currentSessionFile, 'utf8'));
        this.roundCount = data.roundCount || 0;
        this.sessionData = data.sessionData || [];
      } else {
        this.sessionData = [];
        this.saveSession();
      }
    } catch (error) {
      console.log('세션 로드 오류:', error.message);
      this.sessionData = [];
    }
  }

  saveSession() {
    try {
      const data = {
        sessionId: this.sessionId,
        roundCount: this.roundCount,
        sessionData: this.sessionData,
        lastUpdated: new Date().toISOString()
      };
      fs.writeFileSync(this.currentSessionFile, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.log('세션 저장 오류:', error.message);
    }
  }

  addRound(userInput, aiOutput, summary = '') {
    this.roundCount++;
    
    const round = {
      roundNumber: this.roundCount,
      timestamp: new Date().toISOString(),
      userInput: this.truncateText(userInput, 500),
      aiOutput: this.truncateText(aiOutput, 1000),
      summary: summary || this.generateSummary(userInput, aiOutput),
      inputLength: userInput.length,
      outputLength: aiOutput.length
    };

    this.sessionData.push(round);
    this.saveSession();
    
    // 진행률 표시
    const progress = `${this.roundCount}/${this.maxRounds}`;
    console.log(`\n🔄 라운드 ${progress} 완료`);
    
    // 용량 한계 체크
    if (this.isNearCapacity()) {
      this.showCapacityWarning();
    }
    
    return round;
  }

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  generateSummary(userInput, aiOutput) {
    // 간단한 요약 생성
    const inputWords = userInput.split(' ').slice(0, 10).join(' ');
    const outputWords = aiOutput.split(' ').slice(0, 20).join(' ');
    return `사용자: ${inputWords} | AI: ${outputWords}`;
  }

  isNearCapacity() {
    return this.roundCount >= this.maxRounds * 0.8; // 80% 도달 시
  }

  isAtCapacity() {
    return this.roundCount >= this.maxRounds;
  }

  showCapacityWarning() {
    const remaining = this.maxRounds - this.roundCount;
    console.log(`\n⚠️  채팅 용량 한계 임박: ${remaining} 라운드 남음`);
    console.log(`💡 새로운 채팅 세션을 시작하는 것을 권장합니다.`);
  }

  finalizeSession() {
    if (this.sessionData.length === 0) return;

    const summary = this.generateSessionSummary();
    this.appendToSummaryFile(summary);
    
    console.log(`\n✅ 세션 ${this.sessionId} 완료`);
    console.log(`📊 총 ${this.roundCount} 라운드 진행`);
    console.log(`📝 요약이 ${this.summaryFile}에 저장되었습니다.`);
    
    return summary;
  }

  generateSessionSummary() {
    const totalInputLength = this.sessionData.reduce((sum, round) => sum + round.inputLength, 0);
    const totalOutputLength = this.sessionData.reduce((sum, round) => sum + round.outputLength, 0);
    
    const keyTopics = this.extractKeyTopics();
    
    return {
      sessionId: this.sessionId,
      roundCount: this.roundCount,
      startTime: this.sessionData[0]?.timestamp,
      endTime: new Date().toISOString(),
      totalInputLength,
      totalOutputLength,
      keyTopics,
      rounds: this.sessionData.map(round => ({
        round: round.roundNumber,
        summary: round.summary
      }))
    };
  }

  extractKeyTopics() {
    // 간단한 키워드 추출 (실제로는 더 정교한 NLP 사용 가능)
    const allText = this.sessionData.map(round => 
      round.userInput + ' ' + round.aiOutput
    ).join(' ');
    
    const words = allText.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word, count]) => `${word}(${count})`);
  }

  appendToSummaryFile(summary) {
    try {
      let content = '';
      if (fs.existsSync(this.summaryFile)) {
        content = fs.readFileSync(this.summaryFile, 'utf8');
      } else {
        content = '# 채팅 세션 요약\n\n';
      }

      const summaryText = `
## 세션 ${summary.sessionId}

**기간**: ${summary.startTime} ~ ${summary.endTime}
**라운드**: ${summary.roundCount}회
**총 입력**: ${summary.totalInputLength}자
**총 출력**: ${summary.totalOutputLength}자
**주요 키워드**: ${summary.keyTopics.join(', ')}

### 라운드별 요약
${summary.rounds.map(round => 
  `${round.round}. ${round.summary}`
).join('\n')}

---
`;
      
      fs.writeFileSync(this.summaryFile, content + summaryText, 'utf8');
    } catch (error) {
      console.log('요약 파일 저장 오류:', error.message);
    }
  }

  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      roundCount: this.roundCount,
      maxRounds: this.maxRounds,
      progress: `${this.roundCount}/${this.maxRounds}`,
      remaining: this.maxRounds - this.roundCount,
      isNearCapacity: this.isNearCapacity(),
      isAtCapacity: this.isAtCapacity()
    };
  }

  loadPreviousSession(sessionId) {
    const sessionFile = path.join(this.sessionDataPath, `${sessionId}.json`);
    try {
      if (fs.existsSync(sessionFile)) {
        const data = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
        console.log(`📚 이전 세션 ${sessionId} 로드됨`);
        console.log(`📊 ${data.roundCount} 라운드 진행됨`);
        return data;
      }
    } catch (error) {
      console.log('이전 세션 로드 오류:', error.message);
    }
    return null;
  }

  listPreviousSessions() {
    try {
      const files = fs.readdirSync(this.sessionDataPath);
      const sessions = files
        .filter(file => file.endsWith('.json'))
        .map(file => {
          const sessionId = file.replace('.json', '');
          const filePath = path.join(this.sessionDataPath, file);
          const stats = fs.statSync(filePath);
          return { sessionId, lastModified: stats.mtime };
        })
        .sort((a, b) => b.lastModified - a.lastModified);
      
      return sessions;
    } catch (error) {
      console.log('세션 목록 조회 오류:', error.message);
      return [];
    }
  }
}

module.exports = ChatSessionManager; 