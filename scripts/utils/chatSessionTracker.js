class ChatSessionTracker {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.roundCount = 0;
    this.maxRounds = 50;
    this.sessionData = [];
    this.startTime = new Date().toISOString();
    
    // 로컬 스토리지 키
    this.storageKey = `chat_session_${this.sessionId}`;
    this.summaryKey = 'chat_session_summaries';
    
    this.loadFromStorage();
    this.initializeUI();
  }

  generateSessionId() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `web-session-${timestamp}`;
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        this.roundCount = data.roundCount || 0;
        this.sessionData = data.sessionData || [];
        this.startTime = data.startTime || this.startTime;
      }
    } catch (error) {
      console.log('세션 로드 오류:', error.message);
    }
  }

  saveToStorage() {
    try {
      const data = {
        sessionId: this.sessionId,
        roundCount: this.roundCount,
        sessionData: this.sessionData,
        startTime: this.startTime,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
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
    this.saveToStorage();
    this.updateUI();
    
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
    const inputWords = userInput.split(' ').slice(0, 10).join(' ');
    const outputWords = aiOutput.split(' ').slice(0, 20).join(' ');
    return `사용자: ${inputWords} | AI: ${outputWords}`;
  }

  isNearCapacity() {
    return this.roundCount >= this.maxRounds * 0.8;
  }

  isAtCapacity() {
    return this.roundCount >= this.maxRounds;
  }

  showCapacityWarning() {
    const remaining = this.maxRounds - this.roundCount;
    const warning = `⚠️ 채팅 용량 한계 임박: ${remaining} 라운드 남음. 새로운 채팅을 시작하는 것을 권장합니다.`;
    
    // UI에 경고 표시
    this.showNotification(warning, 'warning');
    
    // 콘솔에도 출력
    console.log(warning);
  }

  finalizeSession() {
    if (this.sessionData.length === 0) return null;

    const summary = this.generateSessionSummary();
    this.saveSummaryToStorage(summary);
    
    // UI에 완료 메시지 표시
    this.showNotification(`✅ 세션 ${this.sessionId} 완료. 총 ${this.roundCount} 라운드 진행.`, 'success');
    
    return summary;
  }

  generateSessionSummary() {
    const totalInputLength = this.sessionData.reduce((sum, round) => sum + round.inputLength, 0);
    const totalOutputLength = this.sessionData.reduce((sum, round) => sum + round.outputLength, 0);
    
    const keyTopics = this.extractKeyTopics();
    
    return {
      sessionId: this.sessionId,
      roundCount: this.roundCount,
      startTime: this.startTime,
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

  saveSummaryToStorage(summary) {
    try {
      const summaries = this.getSummariesFromStorage();
      summaries.push(summary);
      
      // 최근 10개만 유지
      if (summaries.length > 10) {
        summaries.splice(0, summaries.length - 10);
      }
      
      localStorage.setItem(this.summaryKey, JSON.stringify(summaries));
    } catch (error) {
      console.log('요약 저장 오류:', error.message);
    }
  }

  getSummariesFromStorage() {
    try {
      const saved = localStorage.getItem(this.summaryKey);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.log('요약 로드 오류:', error.message);
      return [];
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
      isAtCapacity: this.isAtCapacity(),
      startTime: this.startTime
    };
  }

  initializeUI() {
    // 세션 트래커 UI 생성
    this.createTrackerUI();
    this.updateUI();
  }

  createTrackerUI() {
    // 기존 UI가 있으면 제거
    const existingTracker = document.getElementById('chat-session-tracker');
    if (existingTracker) {
      existingTracker.remove();
    }

    // 새로운 UI 생성
    const tracker = document.createElement('div');
    tracker.id = 'chat-session-tracker';
    tracker.className = 'fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 max-w-sm';
    tracker.innerHTML = `
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-semibold text-gray-700">채팅 세션</h3>
        <button id="tracker-close" class="text-gray-400 hover:text-gray-600">×</button>
      </div>
      <div class="space-y-2">
        <div class="text-xs text-gray-600">
          <span id="session-id">세션: ${this.sessionId}</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="flex-1 bg-gray-200 rounded-full h-2">
            <div id="progress-bar" class="bg-blue-500 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
          </div>
          <span id="progress-text" class="text-xs text-gray-600">0/50</span>
        </div>
        <div id="capacity-warning" class="text-xs text-orange-600 hidden">
          ⚠️ 용량 한계 임박
        </div>
        <div class="flex space-x-2">
          <button id="session-info" class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
            정보
          </button>
          <button id="session-finalize" class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">
            종료
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(tracker);

    // 이벤트 리스너 추가
    document.getElementById('tracker-close').addEventListener('click', () => {
      tracker.style.display = 'none';
    });

    document.getElementById('session-info').addEventListener('click', () => {
      this.showSessionInfo();
    });

    document.getElementById('session-finalize').addEventListener('click', () => {
      this.finalizeSession();
    });
  }

  updateUI() {
    const info = this.getSessionInfo();
    
    // 진행률 업데이트
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const capacityWarning = document.getElementById('capacity-warning');
    
    if (progressBar && progressText) {
      const percentage = (info.roundCount / info.maxRounds) * 100;
      progressBar.style.width = `${percentage}%`;
      progressText.textContent = info.progress;
      
      // 색상 변경
      if (info.isNearCapacity) {
        progressBar.className = 'bg-orange-500 h-2 rounded-full transition-all duration-300';
        capacityWarning.classList.remove('hidden');
      } else if (info.isAtCapacity) {
        progressBar.className = 'bg-red-500 h-2 rounded-full transition-all duration-300';
        capacityWarning.classList.remove('hidden');
      } else {
        progressBar.className = 'bg-blue-500 h-2 rounded-full transition-all duration-300';
        capacityWarning.classList.add('hidden');
      }
    }
  }

  showSessionInfo() {
    const info = this.getSessionInfo();
    const message = `
📊 세션 정보
세션 ID: ${info.sessionId}
진행률: ${info.progress}
남은 라운드: ${info.remaining}
시작 시간: ${new Date(info.startTime).toLocaleString()}
용량 한계 임박: ${info.isNearCapacity ? '예' : '아니오'}
용량 한계 도달: ${info.isAtCapacity ? '예' : '아니오'}
    `;
    
    this.showNotification(message, 'info');
  }

  showNotification(message, type = 'info') {
    // 간단한 알림 표시
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-md ${
      type === 'warning' ? 'bg-orange-100 text-orange-800 border border-orange-300' :
      type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' :
      'bg-blue-100 text-blue-800 border border-blue-300'
    }`;
    
    notification.innerHTML = `
      <div class="flex items-start">
        <div class="flex-1 text-sm whitespace-pre-line">${message}</div>
        <button class="ml-2 text-gray-400 hover:text-gray-600" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // 5초 후 자동 제거
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  // 자동 라운드 추가 (Cursor 채팅에서 사용)
  autoAddRound(userInput, aiOutput) {
    return this.addRound(userInput, aiOutput);
  }

  // 세션 내보내기
  exportSession() {
    const data = {
      sessionId: this.sessionId,
      roundCount: this.roundCount,
      sessionData: this.sessionData,
      startTime: this.startTime,
      summary: this.generateSessionSummary()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-session-${this.sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// 전역 인스턴스 생성
window.chatSessionTracker = new ChatSessionTracker();

// 자동 라운드 추가 함수 (Cursor에서 호출 가능)
window.addChatRound = function(userInput, aiOutput) {
  return window.chatSessionTracker.autoAddRound(userInput, aiOutput);
};

// 세션 종료 함수
window.finalizeChatSession = function() {
  return window.chatSessionTracker.finalizeSession();
};

// 세션 정보 조회 함수
window.getChatSessionInfo = function() {
  return window.chatSessionTracker.getSessionInfo();
};

export default ChatSessionTracker; 