/**
 * Test Analysis Module
 * Handles comprehensive test performance analysis and optimization insights
 */
export class TestAnalysis {
    constructor() {
        this.testData = [];
        this.filteredData = [];
        this.charts = {};
        this.initializeEventListeners();
    }

    /**
     * Initialize event listeners for test analysis controls
     */
    initializeEventListeners() {
        // Test type filter
        const testTypeFilter = document.getElementById('test-type-filter');
        if (testTypeFilter) {
            testTypeFilter.addEventListener('change', () => this.applyFilters());
        }

        // Time range filter
        const timeRangeFilter = document.getElementById('time-range-filter');
        if (timeRangeFilter) {
            timeRangeFilter.addEventListener('change', () => this.applyFilters());
        }

        // Device filter
        const deviceFilter = document.getElementById('device-filter');
        if (deviceFilter) {
            deviceFilter.addEventListener('change', () => this.applyFilters());
        }

        // Refresh button
        const refreshBtn = document.getElementById('refresh-test-analysis');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshAnalysis());
        }
    }

    /**
     * Load test data from final test results
     * @param {Array} finalTestData - Data from final test analysis
     */
    loadTestData(finalTestData) {
        this.testData = this.processTestData(finalTestData);
        this.applyFilters();
        this.updateOverview();
        this.updateCharts();
        this.updatePerformanceTable();
        this.generateRecommendations();
    }

    /**
     * Process raw test data into analysis format
     * @param {Array} rawData - Raw test data
     * @returns {Array} Processed test data
     */
    processTestData(rawData) {
        const processedData = [];
        
        rawData.forEach(lot => {
            if (lot.testResults && Array.isArray(lot.testResults)) {
                lot.testResults.forEach(test => {
                    const testInfo = {
                        testName: test.test || 'Unknown Test',
                        testType: this.categorizeTestType(test.test),
                        lotNumber: lot.lotNumber,
                        device: lot.device,
                        testDate: lot.testDate,
                        yield: test.result === 'PASS' ? 100 : 0,
                        failCount: test.result === 'FAIL' ? 1 : 0,
                        totalCount: 1,
                        avgTime: test.time || 0,
                        status: test.result,
                        site1: test.site1 || 0,
                        site2: test.site2 || 0,
                        site3: test.site3 || 0,
                        site4: test.site4 || 0
                    };
                    processedData.push(testInfo);
                });
            }
        });

        console.log('TestAnalysis: Processed test data:', processedData.length, 'entries');
        return processedData;
    }

    /**
     * Categorize test type based on test name
     * @param {string} testName - Name of the test
     * @returns {string} Test category
     */
    categorizeTestType(testName) {
        const name = testName.toLowerCase();
        
        if (name.includes('dc') || name.includes('voltage') || name.includes('current')) {
            return 'dc';
        } else if (name.includes('ac') || name.includes('frequency') || name.includes('timing')) {
            return 'ac';
        } else if (name.includes('func') || name.includes('logic') || name.includes('pattern')) {
            return 'functional';
        } else if (name.includes('param') || name.includes('measure')) {
            return 'parametric';
        } else {
            return 'other';
        }
    }

    /**
     * Apply filters to test data
     */
    applyFilters() {
        const testTypeFilter = document.getElementById('test-type-filter')?.value || 'all';
        const timeRangeFilter = document.getElementById('time-range-filter')?.value || 'all';
        const deviceFilter = document.getElementById('device-filter')?.value || 'all';

        this.filteredData = this.testData.filter(test => {
            // Test type filter
            if (testTypeFilter !== 'all' && test.testType !== testTypeFilter) {
                return false;
            }

            // Device filter
            if (deviceFilter !== 'all' && test.device !== deviceFilter) {
                return false;
            }

            // Time range filter (simplified - would need actual date parsing)
            if (timeRangeFilter !== 'all') {
                // TODO: Implement actual date filtering
                return true;
            }

            return true;
        });

        this.updateOverview();
        this.updateCharts();
        this.updatePerformanceTable();
    }

    /**
     * Update overview statistics
     */
    updateOverview() {
        if (this.filteredData.length === 0) {
            this.setOverviewValues('--', '--', '--', '--');
            return;
        }

        const totalTests = this.filteredData.length;
        const passTests = this.filteredData.filter(t => t.status === 'PASS').length;
        const failTests = this.filteredData.filter(t => t.status === 'FAIL').length;
        const overallYield = totalTests > 0 ? ((passTests / totalTests) * 100).toFixed(1) : 0;
        const failureRate = totalTests > 0 ? ((failTests / totalTests) * 100).toFixed(1) : 0;
        const avgTestTime = this.filteredData.reduce((sum, t) => sum + t.avgTime, 0) / totalTests;

        this.setOverviewValues(
            `${overallYield}%`,
            `${avgTestTime.toFixed(1)}ms`,
            `${failureRate}%`,
            totalTests.toString()
        );
    }

    /**
     * Set overview card values
     */
    setOverviewValues(yieldValue, time, failure, count) {
        const yieldEl = document.getElementById('overall-yield');
        const timeEl = document.getElementById('avg-test-time');
        const failureEl = document.getElementById('failure-rate');
        const countEl = document.getElementById('total-tests');

        if (yieldEl) yieldEl.textContent = yieldValue;
        if (timeEl) timeEl.textContent = time;
        if (failureEl) failureEl.textContent = failure;
        if (countEl) countEl.textContent = count;
    }

    /**
     * Update charts with filtered data
     */
    updateCharts() {
        this.updateYieldTrendChart();
        this.updateFailureDistributionChart();
    }

    /**
     * Update yield trend chart
     */
    updateYieldTrendChart() {
        const chartContainer = document.getElementById('test-yield-chart');
        if (!chartContainer) return;

        // Group by test type and calculate yield
        const testTypeYields = {};
        this.filteredData.forEach(test => {
            if (!testTypeYields[test.testType]) {
                testTypeYields[test.testType] = { pass: 0, total: 0 };
            }
            testTypeYields[test.testType].total++;
            if (test.status === 'PASS') {
                testTypeYields[test.testType].pass++;
            }
        });

        const chartData = Object.entries(testTypeYields).map(([type, data]) => ({
            type: type.toUpperCase(),
            yield: data.total > 0 ? ((data.pass / data.total) * 100).toFixed(1) : 0
        }));

        console.log('TestAnalysis: Yield trend chart data:', chartData);

        // Create simple bar chart
        chartContainer.innerHTML = this.createSimpleBarChart(chartData, 'Yield (%)');
    }

    /**
     * Update failure distribution chart
     */
    updateFailureDistributionChart() {
        const chartContainer = document.getElementById('test-failure-chart');
        if (!chartContainer) return;

        // Count failures by test type
        const failureCounts = {};
        this.filteredData.filter(t => t.status === 'FAIL').forEach(test => {
            failureCounts[test.testType] = (failureCounts[test.testType] || 0) + 1;
        });

        const chartData = Object.entries(failureCounts).map(([type, count]) => ({
            type: type.toUpperCase(),
            count: count
        }));

        console.log('TestAnalysis: Failure distribution chart data:', chartData);

        // Create simple bar chart
        chartContainer.innerHTML = this.createSimpleBarChart(chartData, 'Fail Count');
    }

    /**
     * Create simple bar chart HTML
     */
    createSimpleBarChart(data, yAxisLabel) {
        if (data.length === 0) {
            return '<p class="text-gray-400">No data available</p>';
        }

        const maxValue = Math.max(...data.map(d => parseFloat(d.yield || d.count)));
        const barHeight = 200;
        const barWidth = 300 / data.length;

        const bars = data.map(item => {
            const value = parseFloat(item.yield || item.count);
            const height = maxValue > 0 ? (value / maxValue) * barHeight : 0;
            const color = item.yield ? 
                (value > 80 ? '#10B981' : value > 60 ? '#F59E0B' : '#EF4444') :
                '#EF4444';

            return `
                <div class="flex flex-col items-center">
                    <div class="w-8 bg-${color} rounded-t" style="height: ${height}px; min-height: 4px;"></div>
                    <div class="text-xs mt-1 text-center">${item.type}</div>
                    <div class="text-xs text-gray-500">${value}</div>
                </div>
            `;
        }).join('');

        return `
            <div class="flex items-end justify-center space-x-2 h-64">
                ${bars}
            </div>
            <div class="text-center text-sm text-gray-600 mt-2">${yAxisLabel}</div>
        `;
    }

    /**
     * Update performance table
     */
    updatePerformanceTable() {
        const tbody = document.getElementById('test-performance-tbody');
        if (!tbody) return;

        // Group tests by name
        const testGroups = {};
        this.filteredData.forEach(test => {
            if (!testGroups[test.testName]) {
                testGroups[test.testName] = {
                    name: test.testName,
                    type: test.testType,
                    total: 0,
                    pass: 0,
                    fail: 0,
                    totalTime: 0
                };
            }
            testGroups[test.testName].total++;
            testGroups[test.testName].totalTime += test.avgTime;
            if (test.status === 'PASS') {
                testGroups[test.testName].pass++;
            } else {
                testGroups[test.testName].fail++;
            }
        });

        const tableRows = Object.values(testGroups).map(group => {
            const yieldValue = group.total > 0 ? ((group.pass / group.total) * 100).toFixed(1) : 0;
            const avgTime = group.total > 0 ? (group.totalTime / group.total).toFixed(1) : 0;
            const status = yieldValue > 90 ? 'Excellent' : yieldValue > 70 ? 'Good' : yieldValue > 50 ? 'Fair' : 'Poor';
            const statusColor = yieldValue > 90 ? 'text-green-600' : yieldValue > 70 ? 'text-blue-600' : yieldValue > 50 ? 'text-yellow-600' : 'text-red-600';

            return `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${group.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${group.type.toUpperCase()}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${yieldValue}%</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${group.fail}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${avgTime}ms</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}">
                            ${status}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button class="text-blue-600 hover:text-blue-900" onclick="testAnalysis.showTestDetails('${group.name}')">
                            Details
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = tableRows;
    }

    /**
     * Generate optimization recommendations
     */
    generateRecommendations() {
        const recommendationsContainer = document.getElementById('test-recommendations');
        if (!recommendationsContainer) return;

        const recommendations = this.analyzeTestPerformance();
        
        const recommendationsHTML = recommendations.map(rec => `
            <div class="bg-white p-4 rounded-lg border border-gray-200">
                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-${rec.priority === 'high' ? 'red' : rec.priority === 'medium' ? 'yellow' : 'blue'}-100 rounded-full flex items-center justify-center">
                            <span class="text-${rec.priority === 'high' ? 'red' : rec.priority === 'medium' ? 'yellow' : 'blue'}-600 text-sm font-bold">${rec.priority === 'high' ? '!' : rec.priority === 'medium' ? '?' : 'i'}</span>
                        </div>
                    </div>
                    <div class="ml-3">
                        <h4 class="text-sm font-medium text-gray-900">${rec.title}</h4>
                        <p class="text-sm text-gray-500 mt-1">${rec.description}</p>
                        <p class="text-xs text-gray-400 mt-2">Impact: ${rec.impact}</p>
                    </div>
                </div>
            </div>
        `).join('');

        recommendationsContainer.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${recommendationsHTML}
            </div>
        `;
    }

    /**
     * Analyze test performance and generate recommendations
     */
    analyzeTestPerformance() {
        const recommendations = [];

        // Analyze low yield tests
        const lowYieldTests = this.filteredData.filter(t => {
            const testGroup = this.filteredData.filter(tt => tt.testName === t.testName);
            const yieldValue = testGroup.filter(tt => tt.status === 'PASS').length / testGroup.length;
            return yieldValue < 0.7;
        });

        if (lowYieldTests.length > 0) {
            recommendations.push({
                priority: 'high',
                title: 'Low Yield Tests Detected',
                description: `${lowYieldTests.length} tests showing yield below 70%. Review test parameters and equipment calibration.`,
                impact: 'High - Direct yield impact'
            });
        }

        // Analyze slow tests
        const slowTests = this.filteredData.filter(t => t.avgTime > 1000);
        if (slowTests.length > 0) {
            recommendations.push({
                priority: 'medium',
                title: 'Slow Test Performance',
                description: `${slowTests.length} tests taking longer than 1 second. Consider test optimization.`,
                impact: 'Medium - Throughput impact'
            });
        }

        // Analyze test type distribution
        const testTypeCounts = {};
        this.filteredData.forEach(t => {
            testTypeCounts[t.testType] = (testTypeCounts[t.testType] || 0) + 1;
        });

        if (Object.keys(testTypeCounts).length < 3) {
            recommendations.push({
                priority: 'low',
                title: 'Limited Test Coverage',
                description: 'Consider adding more diverse test types for comprehensive coverage.',
                impact: 'Low - Coverage improvement'
            });
        }

        return recommendations;
    }

    /**
     * Show detailed test information
     */
    showTestDetails(testName) {
        const testDetails = this.filteredData.filter(t => t.testName === testName);
        console.log(`Test Details for ${testName}:`, testDetails);
        
        // TODO: Implement detailed test view modal or expandable section
        alert(`Detailed analysis for ${testName} - Check console for data`);
    }

    /**
     * Refresh analysis with current data
     */
    refreshAnalysis() {
        this.applyFilters();
        console.log('Test analysis refreshed');
    }

    /**
     * Export test analysis data
     */
    exportTestAnalysis() {
        const exportData = {
            timestamp: new Date().toISOString(),
            filters: {
                testType: document.getElementById('test-type-filter')?.value,
                timeRange: document.getElementById('time-range-filter')?.value,
                device: document.getElementById('device-filter')?.value
            },
            summary: {
                totalTests: this.filteredData.length,
                overallYield: this.calculateOverallYield(),
                averageTestTime: this.calculateAverageTestTime()
            },
            testPerformance: this.getTestPerformanceSummary(),
            recommendations: this.analyzeTestPerformance()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `test-analysis-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Calculate overall yield
     */
    calculateOverallYield() {
        if (this.filteredData.length === 0) return 0;
        const passCount = this.filteredData.filter(t => t.status === 'PASS').length;
        return ((passCount / this.filteredData.length) * 100).toFixed(1);
    }

    /**
     * Calculate average test time
     */
    calculateAverageTestTime() {
        if (this.filteredData.length === 0) return 0;
        const totalTime = this.filteredData.reduce((sum, t) => sum + t.avgTime, 0);
        return (totalTime / this.filteredData.length).toFixed(1);
    }

    /**
     * Get test performance summary
     */
    getTestPerformanceSummary() {
        const testGroups = {};
        this.filteredData.forEach(test => {
            if (!testGroups[test.testName]) {
                testGroups[test.testName] = {
                    name: test.testName,
                    type: test.testType,
                    total: 0,
                    pass: 0,
                    fail: 0,
                    totalTime: 0
                };
            }
            testGroups[test.testName].total++;
            testGroups[test.testName].totalTime += test.avgTime;
            if (test.status === 'PASS') {
                testGroups[test.testName].pass++;
            } else {
                testGroups[test.testName].fail++;
            }
        });

        return Object.values(testGroups).map(group => ({
            name: group.name,
            type: group.type,
            yield: group.total > 0 ? ((group.pass / group.total) * 100).toFixed(1) : 0,
            failCount: group.fail,
            avgTime: group.total > 0 ? (group.totalTime / group.total).toFixed(1) : 0
        }));
    }
} 