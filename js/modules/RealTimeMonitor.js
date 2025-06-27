/**
 * Real-Time Monitor Module - Phase 4 Implementation
 * Handles real-time data monitoring and alerts
 * Version: 4.0
 * Created: 2025-01-27
 */

export class RealTimeMonitor {
    constructor(databaseManager) {
        this.db = databaseManager;
        this.isActive = false;
        this.subscribers = new Map();
        this.metrics = new Map();
        this.alerts = [];
        this.thresholds = {
            yield: { min: 80, max: 100 },
            testTime: { min: 0, max: 300 },
            temperature: { min: 20, max: 30 },
            defectRate: { min: 0, max: 5 }
        };
        
        this.updateInterval = 5000; // 5 seconds
        this.intervalId = null;
        
        console.log('🔧 Real-Time Monitor initialized');
    }

    /**
     * Start real-time monitoring
     */
    start() {
        if (this.isActive) {
            console.log('⚠️ Real-time monitoring already active');
            return;
        }
        
        this.isActive = true;
        console.log('🚀 Starting real-time monitoring...');
        
        // Start monitoring loop
        this.intervalId = setInterval(() => {
            this.performMonitoringCycle();
        }, this.updateInterval);
        
        // Initial monitoring cycle
        this.performMonitoringCycle();
        
        // Create monitoring UI
        this.createMonitoringUI();
        
        console.log(`✅ Real-time monitoring started (${this.updateInterval}ms interval)`);
    }

    /**
     * Stop real-time monitoring
     */
    stop() {
        if (!this.isActive) {
            console.log('⚠️ Real-time monitoring not active');
            return;
        }
        
        this.isActive = false;
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        this.removeMonitoringUI();
        
        console.log('⏹️ Real-time monitoring stopped');
    }

    /**
     * Perform monitoring cycle
     */
    async performMonitoringCycle() {
        try {
            const timestamp = new Date().toISOString();
            
            // Collect current metrics
            const currentMetrics = await this.collectMetrics();
            
            // Store metrics
            this.metrics.set(timestamp, currentMetrics);
            
            // Keep only last 100 data points
            if (this.metrics.size > 100) {
                const oldestKey = this.metrics.keys().next().value;
                this.metrics.delete(oldestKey);
            }
            
            // Check for alerts
            this.checkAlerts(currentMetrics);
            
            // Notify subscribers
            this.notifySubscribers('metrics_update', {
                timestamp: timestamp,
                metrics: currentMetrics,
                alerts: this.alerts.slice(-10) // Last 10 alerts
            });
            
            // Update UI
            this.updateMonitoringUI(currentMetrics);
            
        } catch (error) {
            console.error('❌ Error in monitoring cycle:', error);
            this.notifySubscribers('error', { error: error.message });
        }
    }

    /**
     * Collect current metrics
     */
    async collectMetrics() {
        try {
            const metrics = {
                timestamp: new Date().toISOString(),
                system: await this.getSystemMetrics(),
                database: await this.getDatabaseMetrics(),
                processing: await this.getProcessingMetrics(),
                quality: await this.getQualityMetrics()
            };
            
            return metrics;
            
        } catch (error) {
            console.error('❌ Error collecting metrics:', error);
            return {
                timestamp: new Date().toISOString(),
                error: error.message
            };
        }
    }

    /**
     * Get system metrics
     */
    async getSystemMetrics() {
        const metrics = {
            memoryUsage: this.getMemoryUsage(),
            cpuUsage: await this.getCPUUsage(),
            networkStatus: navigator.onLine ? 'online' : 'offline',
            browserInfo: this.getBrowserInfo()
        };
        
        return metrics;
    }

    /**
     * Get database metrics
     */
    async getDatabaseMetrics() {
        try {
            const stats = await this.db.getStatistics();
            const dbSize = await this.db.getDatabaseSize();
            
            return {
                totalRecords: Object.values(stats).reduce((sum, count) => sum + count, 0),
                storeCounts: stats,
                storageUsed: dbSize.used,
                storageAvailable: dbSize.available,
                storagePercentage: dbSize.percentage
            };
            
        } catch (error) {
            console.error('❌ Error getting database metrics:', error);
            return { error: error.message };
        }
    }

    /**
     * Get processing metrics
     */
    async getProcessingMetrics() {
        try {
            const recentLots = await this.db.getLots({
                limit: 10,
                startDate: new Date(Date.now() - 60 * 60 * 1000).toISOString() // Last hour
            });
            
            const processing = {
                recentLotsCount: recentLots.length,
                avgProcessingTime: this.calculateAvgProcessingTime(recentLots),
                activeProcesses: this.getActiveProcesses(),
                queueSize: this.getQueueSize()
            };
            
            return processing;
            
        } catch (error) {
            console.error('❌ Error getting processing metrics:', error);
            return { error: error.message };
        }
    }

    /**
     * Get quality metrics
     */
    async getQualityMetrics() {
        try {
            // Get recent test results for quality analysis
            const recentLots = await this.db.getLots({ limit: 5 });
            
            if (recentLots.length === 0) {
                return { noData: true };
            }
            
            const qualityData = [];
            
            for (const lot of recentLots) {
                const testResults = await this.db.getTestResults(lot.lotId);
                const partResults = await this.db.getPartResults(lot.lotId);
                
                if (testResults.length > 0 || partResults.length > 0) {
                    const lotQuality = this.calculateLotQuality(testResults, partResults);
                    qualityData.push({
                        lotId: lot.lotId,
                        ...lotQuality
                    });
                }
            }
            
            const avgYield = qualityData.length > 0 ? 
                qualityData.reduce((sum, lot) => sum + lot.yield, 0) / qualityData.length : 0;
            
            const avgDefectRate = qualityData.length > 0 ?
                qualityData.reduce((sum, lot) => sum + lot.defectRate, 0) / qualityData.length : 0;
            
            return {
                averageYield: avgYield.toFixed(2),
                averageDefectRate: avgDefectRate.toFixed(2),
                lotCount: qualityData.length,
                lots: qualityData.slice(0, 3), // Top 3 recent lots
                trend: this.calculateQualityTrend(qualityData)
            };
            
        } catch (error) {
            console.error('❌ Error getting quality metrics:', error);
            return { error: error.message };
        }
    }

    /**
     * Calculate lot quality metrics
     */
    calculateLotQuality(testResults, partResults) {
        const totalTests = testResults.length;
        const passedTests = testResults.filter(test => test.passed).length;
        
        const totalParts = partResults.length;
        const passedParts = partResults.filter(part => part.passed).length;
        
        const yield = totalParts > 0 ? (passedParts / totalParts) * 100 : 0;
        const testYield = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
        const defectRate = totalParts > 0 ? ((totalParts - passedParts) / totalParts) * 100 : 0;
        
        return {
            yield: yield,
            testYield: testYield,
            defectRate: defectRate,
            totalParts: totalParts,
            totalTests: totalTests
        };
    }

    /**
     * Calculate quality trend
     */
    calculateQualityTrend(qualityData) {
        if (qualityData.length < 2) return 'stable';
        
        const yields = qualityData.map(lot => lot.yield);
        const recentYield = yields[0];
        const oldYield = yields[yields.length - 1];
        
        const difference = recentYield - oldYield;
        
        if (difference > 2) return 'improving';
        if (difference < -2) return 'declining';
        return 'stable';
    }

    /**
     * Check for alerts
     */
    checkAlerts(metrics) {
        const alerts = [];
        const timestamp = new Date().toISOString();
        
        // Check yield threshold
        if (metrics.quality && metrics.quality.averageYield) {
            const yield = parseFloat(metrics.quality.averageYield);
            if (yield < this.thresholds.yield.min) {
                alerts.push({
                    type: 'yield_low',
                    severity: 'warning',
                    message: `Average yield (${yield}%) below threshold (${this.thresholds.yield.min}%)`,
                    timestamp: timestamp,
                    value: yield,
                    threshold: this.thresholds.yield.min
                });
            }
        }
        
        // Check defect rate threshold
        if (metrics.quality && metrics.quality.averageDefectRate) {
            const defectRate = parseFloat(metrics.quality.averageDefectRate);
            if (defectRate > this.thresholds.defectRate.max) {
                alerts.push({
                    type: 'defect_rate_high',
                    severity: 'error',
                    message: `Average defect rate (${defectRate}%) above threshold (${this.thresholds.defectRate.max}%)`,
                    timestamp: timestamp,
                    value: defectRate,
                    threshold: this.thresholds.defectRate.max
                });
            }
        }
        
        // Check storage usage
        if (metrics.database && metrics.database.storagePercentage) {
            const usage = parseFloat(metrics.database.storagePercentage);
            if (usage > 80) {
                alerts.push({
                    type: 'storage_high',
                    severity: usage > 90 ? 'error' : 'warning',
                    message: `Storage usage (${usage}%) is high`,
                    timestamp: timestamp,
                    value: usage,
                    threshold: 80
                });
            }
        }
        
        // Add new alerts
        alerts.forEach(alert => {
            this.alerts.push(alert);
            console.log(`🚨 Alert: ${alert.message}`);
        });
        
        // Keep only last 50 alerts
        if (this.alerts.length > 50) {
            this.alerts = this.alerts.slice(-50);
        }
    }

    /**
     * Create monitoring UI
     */
    createMonitoringUI() {
        // Remove existing monitoring UI
        this.removeMonitoringUI();
        
        const monitoringContainer = document.createElement('div');
        monitoringContainer.id = 'real-time-monitor';
        monitoringContainer.className = 'fixed top-4 right-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50';
        
        monitoringContainer.innerHTML = `
            <div class="flex items-center justify-between mb-3">
                <h3 class="font-semibold text-sm text-gray-800">실시간 모니터링</h3>
                <div class="flex items-center gap-2">
                    <div id="monitor-status" class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <button id="monitor-close" class="text-gray-400 hover:text-gray-600">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            </div>
            
            <div id="monitor-content" class="space-y-2 text-xs">
                <div id="monitor-loading" class="text-gray-500">모니터링 데이터 로딩 중...</div>
            </div>
            
            <div id="monitor-alerts" class="mt-3 space-y-1"></div>
        `;
        
        document.body.appendChild(monitoringContainer);
        
        // Add event listeners
        document.getElementById('monitor-close').addEventListener('click', () => {
            this.stop();
        });
        
        console.log('🖥️ Monitoring UI created');
    }

    /**
     * Update monitoring UI
     */
    updateMonitoringUI(metrics) {
        const contentElement = document.getElementById('monitor-content');
        const alertsElement = document.getElementById('monitor-alerts');
        
        if (!contentElement || !alertsElement) return;
        
        // Update content
        contentElement.innerHTML = `
            <div class="grid grid-cols-2 gap-2">
                <div class="bg-blue-50 p-2 rounded">
                    <div class="text-xs text-blue-600 font-medium">데이터베이스</div>
                    <div class="text-sm font-bold text-blue-800">
                        ${metrics.database ? metrics.database.totalRecords || 0 : 0} 레코드
                    </div>
                </div>
                <div class="bg-green-50 p-2 rounded">
                    <div class="text-xs text-green-600 font-medium">품질</div>
                    <div class="text-sm font-bold text-green-800">
                        ${metrics.quality && metrics.quality.averageYield ? metrics.quality.averageYield + '%' : 'N/A'}
                    </div>
                </div>
                <div class="bg-yellow-50 p-2 rounded">
                    <div class="text-xs text-yellow-600 font-medium">스토리지</div>
                    <div class="text-sm font-bold text-yellow-800">
                        ${metrics.database && metrics.database.storagePercentage ? metrics.database.storagePercentage + '%' : 'N/A'}
                    </div>
                </div>
                <div class="bg-purple-50 p-2 rounded">
                    <div class="text-xs text-purple-600 font-medium">상태</div>
                    <div class="text-sm font-bold text-purple-800">
                        ${metrics.system && metrics.system.networkStatus === 'online' ? '온라인' : '오프라인'}
                    </div>
                </div>
            </div>
        `;
        
        // Update alerts
        const recentAlerts = this.alerts.slice(-3);
        alertsElement.innerHTML = recentAlerts.map(alert => `
            <div class="bg-red-50 border border-red-200 rounded p-2">
                <div class="flex items-center gap-1">
                    <div class="w-1 h-1 bg-red-500 rounded-full"></div>
                    <span class="text-xs text-red-800 font-medium">${alert.type}</span>
                </div>
                <div class="text-xs text-red-600 mt-1">${alert.message}</div>
            </div>
        `).join('');
    }

    /**
     * Remove monitoring UI
     */
    removeMonitoringUI() {
        const existingUI = document.getElementById('real-time-monitor');
        if (existingUI) {
            existingUI.remove();
        }
    }

    /**
     * Subscribe to monitoring updates
     */
    subscribe(eventType, callback) {
        if (!this.subscribers.has(eventType)) {
            this.subscribers.set(eventType, []);
        }
        
        this.subscribers.get(eventType).push(callback);
        
        // Return unsubscribe function
        return () => {
            const callbacks = this.subscribers.get(eventType);
            if (callbacks) {
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            }
        };
    }

    /**
     * Notify subscribers
     */
    notifySubscribers(eventType, data) {
        const callbacks = this.subscribers.get(eventType);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('❌ Error notifying subscriber:', error);
                }
            });
        }
    }

    /**
     * Set alert thresholds
     */
    setThresholds(newThresholds) {
        this.thresholds = { ...this.thresholds, ...newThresholds };
        console.log('⚙️ Alert thresholds updated:', this.thresholds);
    }

    /**
     * Get memory usage
     */
    getMemoryUsage() {
        if ('memory' in performance) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }

    /**
     * Get CPU usage (approximation)
     */
    async getCPUUsage() {
        // Simple CPU usage approximation
        const start = performance.now();
        await new Promise(resolve => setTimeout(resolve, 100));
        const end = performance.now();
        
        const expectedTime = 100;
        const actualTime = end - start;
        const usage = Math.max(0, Math.min(100, (actualTime - expectedTime) / expectedTime * 100));
        
        return usage.toFixed(2);
    }

    /**
     * Get browser info
     */
    getBrowserInfo() {
        return {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine
        };
    }

    /**
     * Calculate average processing time
     */
    calculateAvgProcessingTime(lots) {
        if (lots.length === 0) return 0;
        
        const processingTimes = lots
            .filter(lot => lot.metadata && lot.metadata.processingTime)
            .map(lot => {
                const start = new Date(lot.timestamp);
                const end = new Date(lot.metadata.processingTime);
                return end - start;
            });
        
        if (processingTimes.length === 0) return 0;
        
        const avgTime = processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length;
        return (avgTime / 1000).toFixed(2); // Convert to seconds
    }

    /**
     * Get active processes count
     */
    getActiveProcesses() {
        // In a real implementation, this would track active file processing
        return 0;
    }

    /**
     * Get queue size
     */
    getQueueSize() {
        // In a real implementation, this would track pending processing queue
        return 0;
    }

    /**
     * Export monitoring data
     */
    exportMonitoringData() {
        const data = {
            metrics: Array.from(this.metrics.entries()),
            alerts: this.alerts,
            thresholds: this.thresholds,
            exportTime: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `monitoring_data_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('📤 Monitoring data exported');
    }
} 