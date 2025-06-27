/**
 * Database Manager Module - Phase 4 Implementation
 * Handles data persistence, indexing, and real-time monitoring
 * Version: 4.0
 * Created: 2025-01-27
 */

export class DatabaseManager {
    constructor() {
        this.dbName = 'WaferMapDB';
        this.dbVersion = 4;
        this.db = null;
        this.isInitialized = false;
        
        // Define object stores
        this.stores = {
            lots: 'lots',
            testResults: 'testResults', 
            partResults: 'partResults',
            files: 'files',
            analytics: 'analytics',
            monitoring: 'monitoring',
            sessions: 'sessions'
        };
        
        this.monitoring = {
            isActive: false,
            interval: null,
            subscribers: []
        };
        
        // Initialize on construction
        this.initialize();
    }

    /**
     * Initialize IndexedDB database
     */
    async initialize() {
        try {
            console.log('🔄 Initializing WaferMap Database...');
            
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(this.dbName, this.dbVersion);
                
                request.onerror = () => {
                    console.error('❌ Database initialization failed:', request.error);
                    reject(request.error);
                };
                
                request.onsuccess = () => {
                    this.db = request.result;
                    this.isInitialized = true;
                    console.log('✅ Database initialized successfully');
                    resolve(this.db);
                };
                
                request.onupgradeneeded = (event) => {
                    console.log('🔧 Upgrading database schema...');
                    const db = event.target.result;
                    
                    // Lots store
                    if (!db.objectStoreNames.contains(this.stores.lots)) {
                        const lotsStore = db.createObjectStore(this.stores.lots, { 
                            keyPath: 'lotId', 
                            autoIncrement: false 
                        });
                        lotsStore.createIndex('deviceName', 'deviceName', { unique: false });
                        lotsStore.createIndex('operator', 'operator', { unique: false });
                        lotsStore.createIndex('timestamp', 'timestamp', { unique: false });
                        lotsStore.createIndex('process', 'process', { unique: false });
                    }
                    
                    // Test Results store
                    if (!db.objectStoreNames.contains(this.stores.testResults)) {
                        const testStore = db.createObjectStore(this.stores.testResults, { 
                            keyPath: 'id', 
                            autoIncrement: true 
                        });
                        testStore.createIndex('lotId', 'lotId', { unique: false });
                        testStore.createIndex('testNumber', 'testNumber', { unique: false });
                        testStore.createIndex('siteNumber', 'siteNumber', { unique: false });
                        testStore.createIndex('passed', 'passed', { unique: false });
                        testStore.createIndex('timestamp', 'timestamp', { unique: false });
                    }
                    
                    // Part Results store
                    if (!db.objectStoreNames.contains(this.stores.partResults)) {
                        const partStore = db.createObjectStore(this.stores.partResults, { 
                            keyPath: 'id', 
                            autoIncrement: true 
                        });
                        partStore.createIndex('lotId', 'lotId', { unique: false });
                        partStore.createIndex('partId', 'partId', { unique: false });
                        partStore.createIndex('hardBin', 'hardBin', { unique: false });
                        partStore.createIndex('softBin', 'softBin', { unique: false });
                        partStore.createIndex('coordinates', ['xCoord', 'yCoord'], { unique: false });
                        partStore.createIndex('passed', 'passed', { unique: false });
                    }
                    
                    // Files store
                    if (!db.objectStoreNames.contains(this.stores.files)) {
                        const filesStore = db.createObjectStore(this.stores.files, { 
                            keyPath: 'fileId', 
                            autoIncrement: true 
                        });
                        filesStore.createIndex('fileName', 'fileName', { unique: false });
                        filesStore.createIndex('fileType', 'fileType', { unique: false });
                        filesStore.createIndex('uploadTime', 'uploadTime', { unique: false });
                        filesStore.createIndex('lotId', 'lotId', { unique: false });
                    }
                    
                    // Analytics store
                    if (!db.objectStoreNames.contains(this.stores.analytics)) {
                        const analyticsStore = db.createObjectStore(this.stores.analytics, { 
                            keyPath: 'id', 
                            autoIncrement: true 
                        });
                        analyticsStore.createIndex('lotId', 'lotId', { unique: false });
                        analyticsStore.createIndex('analysisType', 'analysisType', { unique: false });
                        analyticsStore.createIndex('timestamp', 'timestamp', { unique: false });
                    }
                    
                    // Monitoring store
                    if (!db.objectStoreNames.contains(this.stores.monitoring)) {
                        const monitoringStore = db.createObjectStore(this.stores.monitoring, { 
                            keyPath: 'id', 
                            autoIncrement: true 
                        });
                        monitoringStore.createIndex('eventType', 'eventType', { unique: false });
                        monitoringStore.createIndex('timestamp', 'timestamp', { unique: false });
                        monitoringStore.createIndex('severity', 'severity', { unique: false });
                    }
                    
                    // Sessions store
                    if (!db.objectStoreNames.contains(this.stores.sessions)) {
                        const sessionsStore = db.createObjectStore(this.stores.sessions, { 
                            keyPath: 'sessionId', 
                            autoIncrement: false 
                        });
                        sessionsStore.createIndex('startTime', 'startTime', { unique: false });
                        sessionsStore.createIndex('userId', 'userId', { unique: false });
                    }
                    
                    console.log('✅ Database schema upgrade completed');
                };
            });
            
        } catch (error) {
            console.error('❌ Database initialization error:', error);
            throw error;
        }
    }

    /**
     * Store lot information
     */
    async storeLot(lotData) {
        try {
            const transaction = this.db.transaction([this.stores.lots], 'readwrite');
            const store = transaction.objectStore(this.stores.lots);
            
            const lotRecord = {
                lotId: lotData.LOT_ID || lotData.lotId,
                deviceName: lotData.PART_TYP || lotData.deviceName,
                operator: lotData.OPER_NAM || lotData.operator,
                process: lotData.process || 'Unknown',
                temperature: lotData.TST_TEMP || lotData.temperature,
                startTime: lotData.START_T || lotData.startTime,
                setupTime: lotData.SETUP_T || lotData.setupTime,
                nodeInfo: lotData.NODE_NAM || lotData.nodeInfo,
                testerType: lotData.TSTR_TYP || lotData.testerType,
                jobName: lotData.JOB_NAM || lotData.jobName,
                packageType: lotData.PKG_TYP || lotData.packageType,
                timestamp: new Date().toISOString(),
                status: 'active',
                metadata: lotData
            };
            
            await store.put(lotRecord);
            
            console.log(`💾 Lot stored: ${lotRecord.lotId}`);
            
            // Trigger monitoring event
            this.logMonitoringEvent('lot_stored', {
                lotId: lotRecord.lotId,
                deviceName: lotRecord.deviceName
            });
            
            return lotRecord;
            
        } catch (error) {
            console.error('❌ Error storing lot:', error);
            throw error;
        }
    }

    /**
     * Store test results
     */
    async storeTestResults(testResults, lotId) {
        try {
            const transaction = this.db.transaction([this.stores.testResults], 'readwrite');
            const store = transaction.objectStore(this.stores.testResults);
            
            const promises = testResults.map(test => {
                const testRecord = {
                    lotId: lotId,
                    testNumber: test.testNumber,
                    testName: test.testName,
                    result: test.result,
                    units: test.units,
                    lowLimit: test.lowLimit,
                    highLimit: test.highLimit,
                    headNumber: test.headNumber,
                    siteNumber: test.siteNumber,
                    passed: test.passed,
                    timestamp: test.timestamp || new Date().toISOString(),
                    metadata: test
                };
                
                return store.add(testRecord);
            });
            
            await Promise.all(promises);
            
            console.log(`💾 Stored ${testResults.length} test results for lot ${lotId}`);
            
            // Trigger monitoring event
            this.logMonitoringEvent('test_results_stored', {
                lotId: lotId,
                testCount: testResults.length
            });
            
        } catch (error) {
            console.error('❌ Error storing test results:', error);
            throw error;
        }
    }

    /**
     * Store part results
     */
    async storePartResults(partResults, lotId) {
        try {
            const transaction = this.db.transaction([this.stores.partResults], 'readwrite');
            const store = transaction.objectStore(this.stores.partResults);
            
            const promises = partResults.map(part => {
                const partRecord = {
                    lotId: lotId,
                    partId: part.partId,
                    headNumber: part.headNumber,
                    siteNumber: part.siteNumber,
                    xCoord: part.xCoord,
                    yCoord: part.yCoord,
                    hardBin: part.hardBin,
                    softBin: part.softBin,
                    testCount: part.testCount,
                    testTime: part.testTime,
                    passed: part.passed,
                    timestamp: part.timestamp || new Date().toISOString(),
                    metadata: part
                };
                
                return store.add(partRecord);
            });
            
            await Promise.all(promises);
            
            console.log(`💾 Stored ${partResults.length} part results for lot ${lotId}`);
            
            // Trigger monitoring event
            this.logMonitoringEvent('part_results_stored', {
                lotId: lotId,
                partCount: partResults.length
            });
            
        } catch (error) {
            console.error('❌ Error storing part results:', error);
            throw error;
        }
    }

    /**
     * Store file information
     */
    async storeFileInfo(fileData) {
        try {
            const transaction = this.db.transaction([this.stores.files], 'readwrite');
            const store = transaction.objectStore(this.stores.files);
            
            const fileRecord = {
                fileName: fileData.fileName,
                fileType: fileData.fileType || this.getFileType(fileData.fileName),
                fileSize: fileData.fileSize,
                uploadTime: new Date().toISOString(),
                lotId: fileData.lotId,
                parsedData: fileData.parsedData,
                status: 'processed',
                checksum: fileData.checksum,
                metadata: fileData
            };
            
            const result = await store.add(fileRecord);
            
            console.log(`💾 File info stored: ${fileRecord.fileName}`);
            
            return { ...fileRecord, fileId: result };
            
        } catch (error) {
            console.error('❌ Error storing file info:', error);
            throw error;
        }
    }

    /**
     * Get lots with filtering and pagination
     */
    async getLots(options = {}) {
        try {
            const transaction = this.db.transaction([this.stores.lots], 'readonly');
            const store = transaction.objectStore(this.stores.lots);
            
            let request;
            
            if (options.deviceName) {
                const index = store.index('deviceName');
                request = index.getAll(options.deviceName);
            } else if (options.operator) {
                const index = store.index('operator');
                request = index.getAll(options.operator);
            } else {
                request = store.getAll();
            }
            
            const lots = await request;
            
            // Apply additional filtering
            let filteredLots = lots;
            
            if (options.startDate) {
                filteredLots = filteredLots.filter(lot => 
                    new Date(lot.timestamp) >= new Date(options.startDate)
                );
            }
            
            if (options.endDate) {
                filteredLots = filteredLots.filter(lot => 
                    new Date(lot.timestamp) <= new Date(options.endDate)
                );
            }
            
            // Apply pagination
            if (options.limit) {
                const offset = options.offset || 0;
                filteredLots = filteredLots.slice(offset, offset + options.limit);
            }
            
            return filteredLots;
            
        } catch (error) {
            console.error('❌ Error getting lots:', error);
            throw error;
        }
    }

    /**
     * Get test results for a lot
     */
    async getTestResults(lotId, options = {}) {
        try {
            const transaction = this.db.transaction([this.stores.testResults], 'readonly');
            const store = transaction.objectStore(this.stores.testResults);
            const index = store.index('lotId');
            
            const testResults = await index.getAll(lotId);
            
            // Apply filtering
            let filteredResults = testResults;
            
            if (options.siteNumber !== undefined) {
                filteredResults = filteredResults.filter(test => 
                    test.siteNumber === options.siteNumber
                );
            }
            
            if (options.passed !== undefined) {
                filteredResults = filteredResults.filter(test => 
                    test.passed === options.passed
                );
            }
            
            if (options.testNumber !== undefined) {
                filteredResults = filteredResults.filter(test => 
                    test.testNumber === options.testNumber
                );
            }
            
            return filteredResults;
            
        } catch (error) {
            console.error('❌ Error getting test results:', error);
            throw error;
        }
    }

    /**
     * Get part results for a lot
     */
    async getPartResults(lotId, options = {}) {
        try {
            const transaction = this.db.transaction([this.stores.partResults], 'readonly');
            const store = transaction.objectStore(this.stores.partResults);
            const index = store.index('lotId');
            
            const partResults = await index.getAll(lotId);
            
            // Apply filtering
            let filteredResults = partResults;
            
            if (options.hardBin !== undefined) {
                filteredResults = filteredResults.filter(part => 
                    part.hardBin === options.hardBin
                );
            }
            
            if (options.passed !== undefined) {
                filteredResults = filteredResults.filter(part => 
                    part.passed === options.passed
                );
            }
            
            return filteredResults;
            
        } catch (error) {
            console.error('❌ Error getting part results:', error);
            throw error;
        }
    }

    /**
     * Store analytics results
     */
    async storeAnalytics(analyticsData) {
        try {
            const transaction = this.db.transaction([this.stores.analytics], 'readwrite');
            const store = transaction.objectStore(this.stores.analytics);
            
            const analyticsRecord = {
                lotId: analyticsData.lotId,
                analysisType: analyticsData.analysisType,
                results: analyticsData.results,
                parameters: analyticsData.parameters,
                timestamp: new Date().toISOString(),
                metadata: analyticsData
            };
            
            await store.add(analyticsRecord);
            
            console.log(`💾 Analytics stored: ${analyticsData.analysisType} for ${analyticsData.lotId}`);
            
        } catch (error) {
            console.error('❌ Error storing analytics:', error);
            throw error;
        }
    }

    /**
     * Start real-time monitoring
     */
    startMonitoring(options = {}) {
        if (this.monitoring.isActive) {
            console.log('⚠️ Monitoring already active');
            return;
        }
        
        this.monitoring.isActive = true;
        const interval = options.interval || 30000; // 30 seconds default
        
        console.log(`🔄 Starting real-time monitoring (${interval}ms interval)`);
        
        this.monitoring.interval = setInterval(() => {
            this.performMonitoringCheck();
        }, interval);
        
        // Initial check
        this.performMonitoringCheck();
    }

    /**
     * Stop real-time monitoring
     */
    stopMonitoring() {
        if (!this.monitoring.isActive) {
            console.log('⚠️ Monitoring not active');
            return;
        }
        
        this.monitoring.isActive = false;
        
        if (this.monitoring.interval) {
            clearInterval(this.monitoring.interval);
            this.monitoring.interval = null;
        }
        
        console.log('⏹️ Real-time monitoring stopped');
    }

    /**
     * Perform monitoring check
     */
    async performMonitoringCheck() {
        try {
            // Check database size
            const dbSize = await this.getDatabaseSize();
            
            // Check recent lots
            const recentLots = await this.getLots({
                limit: 10,
                startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            });
            
            // Check for anomalies
            const anomalies = await this.detectAnomalies();
            
            const monitoringData = {
                timestamp: new Date().toISOString(),
                dbSize: dbSize,
                recentLotsCount: recentLots.length,
                anomalies: anomalies,
                systemHealth: this.getSystemHealth()
            };
            
            // Store monitoring data
            await this.logMonitoringEvent('system_check', monitoringData);
            
            // Notify subscribers
            this.notifySubscribers('monitoring_update', monitoringData);
            
        } catch (error) {
            console.error('❌ Error in monitoring check:', error);
            await this.logMonitoringEvent('monitoring_error', { error: error.message });
        }
    }

    /**
     * Log monitoring event
     */
    async logMonitoringEvent(eventType, data) {
        try {
            const transaction = this.db.transaction([this.stores.monitoring], 'readwrite');
            const store = transaction.objectStore(this.stores.monitoring);
            
            const eventRecord = {
                eventType: eventType,
                data: data,
                timestamp: new Date().toISOString(),
                severity: this.getEventSeverity(eventType)
            };
            
            await store.add(eventRecord);
            
        } catch (error) {
            console.error('❌ Error logging monitoring event:', error);
        }
    }

    /**
     * Subscribe to monitoring updates
     */
    subscribe(callback) {
        this.monitoring.subscribers.push(callback);
        
        return () => {
            const index = this.monitoring.subscribers.indexOf(callback);
            if (index > -1) {
                this.monitoring.subscribers.splice(index, 1);
            }
        };
    }

    /**
     * Notify subscribers
     */
    notifySubscribers(eventType, data) {
        this.monitoring.subscribers.forEach(callback => {
            try {
                callback(eventType, data);
            } catch (error) {
                console.error('❌ Error notifying subscriber:', error);
            }
        });
    }

    /**
     * Get database size
     */
    async getDatabaseSize() {
        try {
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                const estimate = await navigator.storage.estimate();
                return {
                    used: estimate.usage,
                    available: estimate.quota,
                    percentage: ((estimate.usage / estimate.quota) * 100).toFixed(2)
                };
            }
            return { used: 0, available: 0, percentage: 0 };
        } catch (error) {
            console.error('❌ Error getting database size:', error);
            return { used: 0, available: 0, percentage: 0 };
        }
    }

    /**
     * Detect anomalies
     */
    async detectAnomalies() {
        // Placeholder for anomaly detection logic
        // In real implementation, this would analyze patterns and detect outliers
        return [];
    }

    /**
     * Get system health
     */
    getSystemHealth() {
        return {
            database: this.isInitialized ? 'healthy' : 'error',
            monitoring: this.monitoring.isActive ? 'active' : 'inactive',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Get event severity
     */
    getEventSeverity(eventType) {
        const severityMap = {
            'lot_stored': 'info',
            'test_results_stored': 'info',
            'part_results_stored': 'info',
            'system_check': 'info',
            'monitoring_error': 'error',
            'anomaly_detected': 'warning'
        };
        
        return severityMap[eventType] || 'info';
    }

    /**
     * Get file type from filename
     */
    getFileType(fileName) {
        const extension = fileName.split('.').pop().toLowerCase();
        const typeMap = {
            'stdf': 'STDF',
            'gz': 'Compressed STDF',
            'txt': 'Summary',
            'xlsx': 'Excel',
            'xls': 'Excel'
        };
        
        return typeMap[extension] || 'Unknown';
    }

    /**
     * Clean up old data
     */
    async cleanup(options = {}) {
        try {
            const retentionDays = options.retentionDays || 30;
            const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
            
            console.log(`🧹 Starting cleanup for data older than ${retentionDays} days`);
            
            // Clean monitoring events
            const transaction = this.db.transaction([this.stores.monitoring], 'readwrite');
            const store = transaction.objectStore(this.stores.monitoring);
            const index = store.index('timestamp');
            
            const range = IDBKeyRange.upperBound(cutoffDate.toISOString());
            const request = index.openCursor(range);
            
            let deletedCount = 0;
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    deletedCount++;
                    cursor.continue();
                } else {
                    console.log(`✅ Cleanup completed: ${deletedCount} old monitoring events deleted`);
                }
            };
            
        } catch (error) {
            console.error('❌ Error during cleanup:', error);
            throw error;
        }
    }

    /**
     * Export data
     */
    async exportData(options = {}) {
        try {
            const exportData = {};
            
            if (options.includeLots !== false) {
                exportData.lots = await this.getLots();
            }
            
            if (options.lotId) {
                exportData.testResults = await this.getTestResults(options.lotId);
                exportData.partResults = await this.getPartResults(options.lotId);
            }
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `wafermap_export_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('📤 Data export completed');
            
        } catch (error) {
            console.error('❌ Error exporting data:', error);
            throw error;
        }
    }

    /**
     * Get database statistics
     */
    async getStatistics() {
        try {
            const stats = {};
            
            for (const storeName of Object.values(this.stores)) {
                const transaction = this.db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const count = await store.count();
                stats[storeName] = count;
            }
            
            stats.timestamp = new Date().toISOString();
            stats.dbSize = await this.getDatabaseSize();
            
            return stats;
            
        } catch (error) {
            console.error('❌ Error getting statistics:', error);
            throw error;
        }
    }
} 