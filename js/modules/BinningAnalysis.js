/**
 * Binning Analysis Module
 * Handles advanced binning analysis and yield optimization insights
 */
export class BinningAnalysis {
    constructor() {
        this.binningData = [];
        this.filteredData = [];
        this.charts = {};
        this.initializeEventListeners();
    }

    /**
     * Initialize event listeners for binning analysis controls
     */
    initializeEventListeners() {
        // Bin category filter
        const binCategoryFilter = document.getElementById('bin-category-filter');
        if (binCategoryFilter) {
            binCategoryFilter.addEventListener('change', () => this.applyFilters());
        }

        // Analysis period filter
        const binPeriodFilter = document.getElementById('bin-period-filter');
        if (binPeriodFilter) {
            binPeriodFilter.addEventListener('change', () => this.applyFilters());
        }

        // Sort filter
        const binSortFilter = document.getElementById('bin-sort-filter');
        if (binSortFilter) {
            binSortFilter.addEventListener('change', () => this.applyFilters());
        }

        // Refresh button
        const refreshBtn = document.getElementById('refresh-binning-analysis');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshAnalysis());
        }
    }

    /**
     * Load binning data from final test results
     * @param {Array} finalTestData - Data from final test analysis
     */
    loadBinningData(finalTestData) {
        this.binningData = this.processBinningData(finalTestData);
        this.applyFilters();
        this.updateOverview();
        this.updateCharts();
        this.updateBinningTable();
        this.generateInsights();
    }

    /**
     * Process raw test data into binning analysis format
     * @param {Array} rawData - Raw test data
     * @returns {Array} Processed binning data
     */
    processBinningData(rawData) {
        const processedData = [];
        
        rawData.forEach(lot => {
            if (lot.testResults && Array.isArray(lot.testResults)) {
                lot.testResults.forEach(test => {
                    // Create bin entries for each test result
                    const binInfo = {
                        binCode: this.extractBinCode(test.test),
                        description: this.getBinDescription(test.test),
                        lotNumber: lot.lotNumber,
                        device: lot.device,
                        testDate: lot.testDate,
                        count: 1,
                        category: this.categorizeBin(test.test),
                        result: test.result,
                        site1: test.site1 || 0,
                        site2: test.site2 || 0,
                        site3: test.site3 || 0,
                        site4: test.site4 || 0,
                        testName: test.test
                    };
                    processedData.push(binInfo);
                });
            }
        });

        console.log('BinningAnalysis: Processed binning data:', processedData.length, 'entries');
        return processedData;
    }

    /**
     * Extract bin code from test name
     * @param {string} testName - Name of the test
     * @returns {string} Bin code
     */
    extractBinCode(testName) {
        // Extract bin code from test name (e.g., "BIN1", "BIN2", etc.)
        const binMatch = testName.match(/BIN(\d+)/i);
        if (binMatch) {
            return `BIN${binMatch[1]}`;
        }
        
        // If no explicit bin code, categorize based on test result
        return testName.includes('PASS') ? 'BIN1' : 'BIN0';
    }

    /**
     * Get bin description
     * @param {string} testName - Name of the test
     * @returns {string} Bin description
     */
    getBinDescription(testName) {
        const name = testName.toLowerCase();
        
        if (name.includes('pass') || name.includes('good')) {
            return 'Pass - Good Device';
        } else if (name.includes('fail') || name.includes('bad')) {
            return 'Fail - Bad Device';
        } else if (name.includes('marginal') || name.includes('borderline')) {
            return 'Marginal - Borderline Device';
        } else if (name.includes('retest') || name.includes('retry')) {
            return 'Retest Required';
        } else {
            return 'Other - Unknown Category';
        }
    }

    /**
     * Categorize bin based on test name and result
     * @param {string} testName - Name of the test
     * @returns {string} Bin category
     */
    categorizeBin(testName) {
        const name = testName.toLowerCase();
        
        if (name.includes('pass') || name.includes('good')) {
            return 'pass';
        } else if (name.includes('fail') || name.includes('bad')) {
            return 'fail';
        } else if (name.includes('marginal') || name.includes('borderline')) {
            return 'marginal';
        } else {
            return 'other';
        }
    }

    /**
     * Apply filters to binning data
     */
    applyFilters() {
        const binCategoryFilter = document.getElementById('bin-category-filter')?.value || 'all';
        const binPeriodFilter = document.getElementById('bin-period-filter')?.value || 'all';
        const binSortFilter = document.getElementById('bin-sort-filter')?.value || 'count';

        this.filteredData = this.binningData.filter(bin => {
            // Bin category filter
            if (binCategoryFilter !== 'all' && bin.category !== binCategoryFilter) {
                return false;
            }

            // Time period filter (simplified - would need actual date parsing)
            if (binPeriodFilter !== 'all') {
                // TODO: Implement actual date filtering
                return true;
            }

            return true;
        });

        // Sort data based on filter
        this.sortBinningData(binSortFilter);

        this.updateOverview();
        this.updateCharts();
        this.updateBinningTable();
    }

    /**
     * Sort binning data based on criteria
     * @param {string} sortBy - Sort criteria
     */
    sortBinningData(sortBy) {
        // Group by bin code first
        const binGroups = {};
        this.filteredData.forEach(bin => {
            if (!binGroups[bin.binCode]) {
                binGroups[bin.binCode] = {
                    binCode: bin.binCode,
                    description: bin.description,
                    count: 0,
                    category: bin.category,
                    totalCount: 0
                };
            }
            binGroups[bin.binCode].count += bin.count;
            binGroups[bin.binCode].totalCount += bin.count;
        });

        // Calculate percentages
        const totalBins = Object.values(binGroups).reduce((sum, group) => sum + group.count, 0);
        Object.values(binGroups).forEach(group => {
            group.percentage = totalBins > 0 ? ((group.count / totalBins) * 100).toFixed(1) : 0;
        });

        // Sort based on criteria
        const sortedGroups = Object.values(binGroups).sort((a, b) => {
            switch (sortBy) {
                case 'count':
                    return b.count - a.count;
                case 'percentage':
                    return parseFloat(b.percentage) - parseFloat(a.percentage);
                case 'trend':
                    // TODO: Implement trend-based sorting
                    return b.count - a.count;
                default:
                    return b.count - a.count;
            }
        });

        this.filteredData = sortedGroups;
    }

    /**
     * Update overview statistics
     */
    updateOverview() {
        if (this.filteredData.length === 0) {
            this.setOverviewValues('--', '--', '--', '--');
            return;
        }

        const totalBins = this.filteredData.length;
        const passBins = this.filteredData.filter(b => b.category === 'pass').reduce((sum, b) => sum + b.count, 0);
        const failBins = this.filteredData.filter(b => b.category === 'fail').reduce((sum, b) => sum + b.count, 0);
        const marginalBins = this.filteredData.filter(b => b.category === 'marginal').reduce((sum, b) => sum + b.count, 0);
        const totalCount = this.filteredData.reduce((sum, b) => sum + b.count, 0);

        const passRate = totalCount > 0 ? ((passBins / totalCount) * 100).toFixed(1) : 0;
        const failRate = totalCount > 0 ? ((failBins / totalCount) * 100).toFixed(1) : 0;
        const marginalRate = totalCount > 0 ? ((marginalBins / totalCount) * 100).toFixed(1) : 0;

        this.setOverviewValues(
            totalBins.toString(),
            `${passRate}%`,
            `${failRate}%`,
            `${marginalRate}%`
        );
    }

    /**
     * Set overview card values
     */
    setOverviewValues(totalBins, passRate, failRate, marginalRate) {
        const totalBinsEl = document.getElementById('total-bins');
        const passRateEl = document.getElementById('pass-rate');
        const failRateEl = document.getElementById('fail-rate');
        const marginalRateEl = document.getElementById('marginal-rate');

        if (totalBinsEl) totalBinsEl.textContent = totalBins;
        if (passRateEl) passRateEl.textContent = passRate;
        if (failRateEl) failRateEl.textContent = failRate;
        if (marginalRateEl) marginalRateEl.textContent = marginalRate;
    }

    /**
     * Update charts with filtered data
     */
    updateCharts() {
        this.updateBinDistributionChart();
        this.updateBinTrendChart();
    }

    /**
     * Update bin distribution chart
     */
    updateBinDistributionChart() {
        const chartContainer = document.getElementById('bin-distribution-chart');
        if (!chartContainer) return;

        // Group by bin category
        const categoryCounts = {};
        this.filteredData.forEach(bin => {
            categoryCounts[bin.category] = (categoryCounts[bin.category] || 0) + bin.count;
        });

        const chartData = Object.entries(categoryCounts).map(([category, count]) => ({
            category: category.toUpperCase(),
            count: count
        }));

        // Create pie chart
        chartContainer.innerHTML = this.createSimplePieChart(chartData);
    }

    /**
     * Update bin trend chart
     */
    updateBinTrendChart() {
        const chartContainer = document.getElementById('bin-trend-chart');
        if (!chartContainer) return;

        // Group by bin code and calculate trends
        const binTrends = {};
        this.filteredData.forEach(bin => {
            if (!binTrends[bin.binCode]) {
                binTrends[bin.binCode] = {
                    code: bin.binCode,
                    count: 0,
                    percentage: 0
                };
            }
            binTrends[bin.binCode].count += bin.count;
        });

        const totalCount = Object.values(binTrends).reduce((sum, bin) => sum + bin.count, 0);
        Object.values(binTrends).forEach(bin => {
            bin.percentage = totalCount > 0 ? ((bin.count / totalCount) * 100).toFixed(1) : 0;
        });

        const chartData = Object.values(binTrends).sort((a, b) => b.count - a.count);

        // Create bar chart
        chartContainer.innerHTML = this.createSimpleBarChart(chartData, 'Bin Distribution');
    }

    /**
     * Create simple pie chart HTML
     */
    createSimplePieChart(data) {
        if (data.length === 0) {
            return '<p class="text-gray-400">No data available</p>';
        }

        const total = data.reduce((sum, item) => sum + item.count, 0);
        const colors = ['#10B981', '#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6'];
        
        let currentAngle = 0;
        const segments = data.map((item, index) => {
            const percentage = total > 0 ? (item.count / total) * 100 : 0;
            const angle = (percentage / 100) * 360;
            const color = colors[index % colors.length];
            
            const segment = `
                <div class="flex items-center mb-2">
                    <div class="w-4 h-4 rounded-full mr-2" style="background-color: ${color}"></div>
                    <span class="text-sm">${item.category}: ${percentage.toFixed(1)}%</span>
                </div>
            `;
            
            currentAngle += angle;
            return segment;
        }).join('');

        return `
            <div class="flex flex-col items-center">
                <div class="w-32 h-32 rounded-full mb-4 relative">
                    ${this.createPieSegments(data, total, colors)}
                </div>
                <div class="text-sm">
                    ${segments}
                </div>
            </div>
        `;
    }

    /**
     * Create pie chart segments
     */
    createPieSegments(data, total, colors) {
        let currentAngle = 0;
        const segments = data.map((item, index) => {
            const percentage = total > 0 ? (item.count / total) * 100 : 0;
            const angle = (percentage / 100) * 360;
            const color = colors[index % colors.length];
            
            if (angle === 0) return '';
            
            const startAngle = currentAngle;
            currentAngle += angle;
            
            // Create SVG path for pie segment
            const radius = 64; // 32 * 2
            const startRad = (startAngle - 90) * Math.PI / 180;
            const endRad = (currentAngle - 90) * Math.PI / 180;
            
            const x1 = radius * Math.cos(startRad);
            const y1 = radius * Math.sin(startRad);
            const x2 = radius * Math.cos(endRad);
            const y2 = radius * Math.sin(endRad);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            const path = `
                M 64 64
                L ${64 + x1} ${64 + y1}
                A ${radius} ${radius} 0 ${largeArcFlag} 1 ${64 + x2} ${64 + y2}
                Z
            `;
            
            return `<path d="${path}" fill="${color}" />`;
        }).join('');
        
        return `<svg width="128" height="128" viewBox="0 0 128 128">${segments}</svg>`;
    }

    /**
     * Create simple bar chart HTML
     */
    createSimpleBarChart(data, yAxisLabel) {
        if (data.length === 0) {
            return '<p class="text-gray-400">No data available</p>';
        }

        const maxValue = Math.max(...data.map(d => parseFloat(d.count || d.percentage)));
        const barHeight = 200;
        const barWidth = 300 / Math.min(data.length, 8);

        const bars = data.slice(0, 8).map(item => {
            const value = parseFloat(item.count || item.percentage);
            const height = maxValue > 0 ? (value / maxValue) * barHeight : 0;
            const color = '#3B82F6';

            return `
                <div class="flex flex-col items-center">
                    <div class="w-8 bg-${color} rounded-t" style="height: ${height}px; min-height: 4px;"></div>
                    <div class="text-xs mt-1 text-center">${item.code || item.category}</div>
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
     * Update binning details table
     */
    updateBinningTable() {
        const tbody = document.getElementById('binning-details-tbody');
        if (!tbody) return;

        const tableRows = this.filteredData.map(bin => {
            const trend = this.calculateTrend(bin.binCode);
            const trendIcon = trend > 0 ? '↗️' : trend < 0 ? '↘️' : '→';
            const trendColor = trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600';

            return `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${bin.binCode}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${bin.description}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${bin.count}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${bin.percentage}%</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            bin.category === 'pass' ? 'bg-green-100 text-green-800' :
                            bin.category === 'fail' ? 'bg-red-100 text-red-800' :
                            bin.category === 'marginal' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                        }">
                            ${bin.category.toUpperCase()}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm ${trendColor}">
                        ${trendIcon} ${Math.abs(trend).toFixed(1)}%
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button class="text-blue-600 hover:text-blue-900" onclick="binningAnalysis.showBinDetails('${bin.binCode}')">
                            Details
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = tableRows;
    }

    /**
     * Calculate trend for a bin (simplified)
     * @param {string} binCode - Bin code
     * @returns {number} Trend percentage
     */
    calculateTrend(binCode) {
        // TODO: Implement actual trend calculation based on historical data
        // For now, return a random trend between -5 and 5
        return (Math.random() - 0.5) * 10;
    }

    /**
     * Generate optimization insights
     */
    generateInsights() {
        const insightsContainer = document.getElementById('binning-insights');
        if (!insightsContainer) return;

        const opportunities = this.analyzeYieldOpportunities();
        const suggestions = this.analyzeConsolidationSuggestions();
        
        const opportunitiesHTML = opportunities.map(opp => `
            <div class="bg-white p-3 rounded border border-blue-200">
                <div class="flex items-start">
                    <div class="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2"></div>
                    <div>
                        <p class="text-sm font-medium text-blue-900">${opp.title}</p>
                        <p class="text-xs text-blue-700 mt-1">${opp.description}</p>
                        <p class="text-xs text-blue-500 mt-1">Potential Impact: ${opp.impact}</p>
                    </div>
                </div>
            </div>
        `).join('');

        const suggestionsHTML = suggestions.map(sugg => `
            <div class="bg-white p-3 rounded border border-green-200">
                <div class="flex items-start">
                    <div class="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-2"></div>
                    <div>
                        <p class="text-sm font-medium text-green-900">${sugg.title}</p>
                        <p class="text-xs text-green-700 mt-1">${sugg.description}</p>
                        <p class="text-xs text-green-500 mt-1">Expected Benefit: ${sugg.benefit}</p>
                    </div>
                </div>
            </div>
        `).join('');

        insightsContainer.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-blue-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-blue-800 mb-2">🎯 Yield Improvement Opportunities</h4>
                    <div class="space-y-2">
                        ${opportunitiesHTML}
                    </div>
                </div>
                
                <div class="bg-green-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-green-800 mb-2">🔧 Bin Consolidation Suggestions</h4>
                    <div class="space-y-2">
                        ${suggestionsHTML}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Analyze yield improvement opportunities
     */
    analyzeYieldOpportunities() {
        const opportunities = [];

        // Analyze high fail rate bins
        const highFailBins = this.filteredData.filter(bin => 
            bin.category === 'fail' && parseFloat(bin.percentage) > 10
        );

        if (highFailBins.length > 0) {
            opportunities.push({
                title: 'High Failure Rate Bins',
                description: `${highFailBins.length} bins showing failure rates above 10%. Review test parameters and equipment.`,
                impact: 'High - Direct yield impact'
            });
        }

        // Analyze marginal bins
        const marginalBins = this.filteredData.filter(bin => bin.category === 'marginal');
        if (marginalBins.length > 0) {
            opportunities.push({
                title: 'Marginal Bin Optimization',
                description: `${marginalBins.length} marginal bins identified. Consider retest strategies or parameter adjustment.`,
                impact: 'Medium - Yield improvement potential'
            });
        }

        return opportunities;
    }

    /**
     * Analyze bin consolidation suggestions
     */
    analyzeConsolidationSuggestions() {
        const suggestions = [];

        // Suggest consolidation for similar bins
        const similarBins = this.filteredData.filter(bin => 
            bin.category === 'fail' && parseFloat(bin.percentage) < 2
        );

        if (similarBins.length > 1) {
            suggestions.push({
                title: 'Low Volume Bin Consolidation',
                description: `${similarBins.length} low-volume fail bins could be consolidated to reduce complexity.`,
                benefit: 'Reduced test complexity and improved efficiency'
            });
        }

        // Suggest new bin categories
        if (this.filteredData.length < 5) {
            suggestions.push({
                title: 'Bin Category Expansion',
                description: 'Consider adding more granular bin categories for better yield analysis.',
                benefit: 'Improved yield tracking and optimization'
            });
        }

        return suggestions;
    }

    /**
     * Show detailed bin information
     */
    showBinDetails(binCode) {
        const binDetails = this.binningData.filter(b => b.binCode === binCode);
        console.log(`Bin Details for ${binCode}:`, binDetails);
        
        // TODO: Implement detailed bin view modal or expandable section
        alert(`Detailed analysis for ${binCode} - Check console for data`);
    }

    /**
     * Refresh analysis with current data
     */
    refreshAnalysis() {
        this.applyFilters();
        console.log('Binning analysis refreshed');
    }

    /**
     * Export binning analysis data
     */
    exportBinningAnalysis() {
        const exportData = {
            timestamp: new Date().toISOString(),
            filters: {
                binCategory: document.getElementById('bin-category-filter')?.value,
                period: document.getElementById('bin-period-filter')?.value,
                sortBy: document.getElementById('bin-sort-filter')?.value
            },
            summary: {
                totalBins: this.filteredData.length,
                passRate: this.calculatePassRate(),
                failRate: this.calculateFailRate()
            },
            binningDetails: this.getBinningSummary(),
            insights: {
                opportunities: this.analyzeYieldOpportunities(),
                suggestions: this.analyzeConsolidationSuggestions()
            }
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `binning-analysis-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Calculate pass rate
     */
    calculatePassRate() {
        const totalCount = this.filteredData.reduce((sum, b) => sum + b.count, 0);
        const passCount = this.filteredData.filter(b => b.category === 'pass').reduce((sum, b) => sum + b.count, 0);
        return totalCount > 0 ? ((passCount / totalCount) * 100).toFixed(1) : 0;
    }

    /**
     * Calculate fail rate
     */
    calculateFailRate() {
        const totalCount = this.filteredData.reduce((sum, b) => sum + b.count, 0);
        const failCount = this.filteredData.filter(b => b.category === 'fail').reduce((sum, b) => sum + b.count, 0);
        return totalCount > 0 ? ((failCount / totalCount) * 100).toFixed(1) : 0;
    }

    /**
     * Get binning summary
     */
    getBinningSummary() {
        return this.filteredData.map(bin => ({
            binCode: bin.binCode,
            description: bin.description,
            count: bin.count,
            percentage: bin.percentage,
            category: bin.category
        }));
    }
} 