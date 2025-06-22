/**
 * UI Module
 * Handles all user interface related functions and display logic
 * Version: 1.0
 * Created: 2025-01-27
 */

export class UI {
    constructor() {
        this.initializeEventListeners();
    }

    /**
     * Initialize all event listeners
     */
    initializeEventListeners() {
        // Tab navigation
        document.querySelectorAll('#main-tabs .main-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.handleTabClick(e));
        });

        // File upload
        const uploadInput = document.getElementById('final-test-upload');
        if (uploadInput) {
            uploadInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }

        // Export buttons
        this.initializeExportButtons();
    }

    /**
     * Handle tab click events
     * @param {Event} event - Click event
     */
    handleTabClick(event) {
        const tabId = event.target.getAttribute('data-tab');
        
        // Update active tab
        document.querySelectorAll('#main-tabs .main-tab').forEach(t => t.classList.remove('active'));
        event.target.classList.add('active');
        
        // Show corresponding content
        document.querySelectorAll('.tab-content').forEach(tc => tc.classList.add('hidden'));
        document.getElementById(tabId + '-tab').classList.remove('hidden');
    }

    /**
     * Handle file upload events
     * @param {Event} event - File upload event
     */
    async handleFileUpload(event) {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        // Show loading state
        this.showLoadingState();

        try {
            // Process files (this will be handled by the main application)
            window.handleFileUpload(files);
        } catch (error) {
            console.error('Error handling file upload:', error);
            this.showError('Error processing files: ' + error.message);
        }
    }

    /**
     * Show loading state
     */
    showLoadingState() {
        const loadingDiv = document.getElementById('final-test-loading');
        const resultDiv = document.getElementById('final-test-result');
        
        if (loadingDiv) loadingDiv.classList.remove('hidden');
        if (resultDiv) resultDiv.classList.add('hidden');
    }

    /**
     * Hide loading state
     */
    hideLoadingState() {
        const loadingDiv = document.getElementById('final-test-loading');
        const resultDiv = document.getElementById('final-test-result');
        
        if (loadingDiv) loadingDiv.classList.add('hidden');
        if (resultDiv) resultDiv.classList.remove('hidden');
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        const resultDiv = document.getElementById('final-test-result');
        if (resultDiv) {
            resultDiv.innerHTML = `<div class="p-4 bg-red-100 text-red-700 rounded">${message}</div>`;
            resultDiv.classList.remove('hidden');
        }
    }

    /**
     * Initialize export buttons
     */
    initializeExportButtons() {
        const exportSummary = document.getElementById('export-summary');
        const exportDetails = document.getElementById('export-details');
        const exportComparison = document.getElementById('export-comparison');

        if (exportSummary) {
            exportSummary.addEventListener('click', () => this.exportData('summary'));
        }
        if (exportDetails) {
            exportDetails.addEventListener('click', () => this.exportData('details'));
        }
        if (exportComparison) {
            exportComparison.addEventListener('click', () => this.exportData('comparison'));
        }
    }

    /**
     * Export data to CSV
     * @param {string} type - Export type (summary, details, comparison)
     */
    exportData(type) {
        if (!window.generateExportData) {
            console.error('Export data generator not available');
            return;
        }

        const data = window.generateExportData(type);
        this.downloadCSV(data, `wafer_test_${type}_${new Date().toISOString().split('T')[0]}.csv`);
    }

    /**
     * Download CSV file
     * @param {Array} data - CSV data
     * @param {string} filename - Filename
     */
    downloadCSV(data, filename) {
        const csvContent = data.map(row => 
            row.map(cell => `"${cell}"`).join(',')
        ).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Display multi-file summary
     * @param {Object} analytics - Analytics data
     */
    displayMultiFileSummary(analytics) {
        console.log('=== Displaying Multi-File Summary ===');
        console.log('Received analytics:', analytics);

        try {
            if (!analytics || typeof analytics !== 'object') {
                throw new Error("Invalid or null analytics object received.");
            }

            // Unhide the result section
            document.getElementById('final-test-result').classList.remove('hidden');

            // Display Aggregated Stats
            this.displayAggregatedStats(analytics);

            // Display Lot Comparison Table
            if (analytics.testSequences && typeof analytics.testSequences === 'object') {
                this.displayLotComparison(analytics);
            } else {
                console.warn('No test sequences found in analytics object.');
                this.displayEmptyLotComparison();
            }
            
            // Display Enhanced Aggregated Analytics
            if (analytics.enhancedAnalytics && typeof analytics.enhancedAnalytics === 'object') {
                this.displayEnhancedAnalytics(analytics.enhancedAnalytics);
            } else {
                console.warn('No enhanced analytics found in analytics object.');
                document.getElementById('enhanced-analytics').classList.add('hidden');
            }

        } catch (error) {
            console.error('Error in displayMultiFileSummary:', error);
            this.showError(`Error displaying multi-file summary: ${error.message}`);
        }
    }

    /**
     * Display aggregated statistics
     * @param {Object} analytics - Analytics data
     */
    displayAggregatedStats(analytics) {
        const aggregatedStats = document.getElementById('aggregated-stats');
        if (!aggregatedStats) return;

        const yieldPercent = analytics.overallYield || 0;
        const yieldStatus = yieldPercent >= 95 ? 'Excellent' : 
                           yieldPercent >= 90 ? 'Good' : 
                           yieldPercent >= 80 ? 'Fair' : 'Poor';
        const statusColor = yieldPercent >= 95 ? 'text-green-600' : 
                           yieldPercent >= 90 ? 'text-blue-600' : 
                           yieldPercent >= 80 ? 'text-yellow-600' : 'text-red-600';

        aggregatedStats.innerHTML = `
            <div class="text-center">
                <div class="text-3xl font-bold">${(analytics.totalGood || 0).toLocaleString()}</div>
                <div class="text-sm text-gray-600">Total Good</div>
            </div>
            <div class="text-center">
                <div class="text-3xl font-bold">${(analytics.totalFail || 0).toLocaleString()}</div>
                <div class="text-sm text-gray-600">Total Fail</div>
            </div>
            <div class="text-center">
                <div class="text-3xl font-bold ${statusColor}">${yieldPercent.toFixed(2)}%</div>
                <div class="text-sm text-gray-600">Overall Yield</div>
            </div>
        `;
    }

    /**
     * Display lot comparison table
     * @param {Object} analytics - Analytics data
     */
    displayLotComparison(analytics) {
        try {
            const lotComparisonTable = document.querySelector('#lot-comparison-table tbody');
            const sequences = analytics.testSequences;
            
            console.log('=== Display Lot Comparison Debug ===');
            
            if (!sequences || typeof sequences !== 'object') {
                console.error("displayLotComparison received invalid or null sequences.");
                this.displayEmptyLotComparison();
                return;
            }

            const sequenceKeys = Object.keys(sequences);
            console.log('Total sequences for display:', sequenceKeys.length);
            
            if (sequenceKeys.length === 0) {
                this.displayEmptyLotComparison();
                return;
            }
            
            lotComparisonTable.innerHTML = Object.entries(sequences).map(([lotNumber, sequence]) => {
                const yieldPercent = sequence.finalYield || 0;
                const totalPass = sequence.totalPass || 0;
                const totalFail = sequence.totalFail || 0;
                const lotSize = sequence.totalInput || 0;
                const device = sequence.device || 'Unknown';
                
                // Get other info from the first test in the sequence
                let testDate = 'N/A';
                let operator = 'N/A';
                if (sequence.tests && sequence.tests.length > 0) {
                    const firstTestInfo = sequence.tests[0].data.lotInfo;
                    testDate = firstTestInfo.Start_time || firstTestInfo.Test_date || 'N/A';
                    operator = firstTestInfo.Operator_id || firstTestInfo.Operator || 'N/A';
                }

                return `
                    <tr class="lot-row border-t hover:bg-gray-50 cursor-pointer" data-lot="${lotNumber}">
                        <td class="p-2 font-medium">${lotNumber}</td>
                        <td class="p-2 text-center">${device}</td>
                        <td class="p-2 text-center">${lotSize.toLocaleString()}</td>
                        <td class="p-2 text-center font-bold">${yieldPercent.toFixed(2)}%</td>
                        <td class="p-2 text-center text-green-600">${totalPass.toLocaleString()}</td>
                        <td class="p-2 text-center text-red-600">${totalFail.toLocaleString()}</td>
                        <td class="p-2 text-center">${testDate}</td>
                        <td class="p-2 text-center">${operator}</td>
                    </tr>
                `;
            }).join('');
            
            // Add event listeners to lot rows
            this.addLotRowEventListeners();
            
            // Select first lot by default
            const firstLot = Object.keys(sequences)[0];
            if (firstLot) {
                setTimeout(() => this.selectLot(firstLot), 100);
            }
            
        } catch (error) {
            console.error('Error in displayLotComparison:', error);
            this.displayEmptyLotComparison();
        }
    }

    /**
     * Display empty lot comparison
     */
    displayEmptyLotComparison() {
        const lotComparisonTable = document.querySelector('#lot-comparison-table tbody');
        if (lotComparisonTable) {
            lotComparisonTable.innerHTML = '<tr><td colspan="8" class="p-4 text-center text-gray-500">No lot data available to compare</td></tr>';
        }
    }

    /**
     * Add event listeners to lot rows
     */
    addLotRowEventListeners() {
        document.querySelectorAll('.lot-row').forEach(row => {
            row.addEventListener('click', function() {
                const lotNumber = this.getAttribute('data-lot');
                if (lotNumber) {
                    window.selectLot(lotNumber);
                } else {
                    console.error('No lot number found in row data');
                }
            });
        });
    }

    /**
     * Select lot and update details display
     * @param {string} lotNumber - Lot number to select
     */
    selectLot(lotNumber) {
        console.log('=== selectLot Triggered ===');
        console.log('Selected lot number:', lotNumber);
        
        // Update visual highlighting
        document.querySelectorAll('.lot-row').forEach(row => {
            row.classList.toggle('bg-blue-100', row.getAttribute('data-lot') === lotNumber);
        });

        if (window.getAggregatedAnalytics) {
            const aggregatedAnalytics = window.getAggregatedAnalytics();
            const sequence = aggregatedAnalytics.testSequences[lotNumber];

            if (sequence) {
                console.log('Found sequence for lot. Displaying details.', sequence);
                this.displaySequenceDetails(sequence);
            } else {
                console.error('Could not find sequence for lot:', lotNumber);
                this.displaySequenceDetails(null);
            }
        }
    }

    /**
     * Display sequence details
     * @param {Object} sequence - Sequence data
     */
    displaySequenceDetails(sequence) {
        const selectedLotSection = document.getElementById('selected-lot-section');
        if (!selectedLotSection) {
            console.error('Could not find the main details section: #selected-lot-section');
            return;
        }

        if (!sequence) {
            selectedLotSection.classList.add('hidden');
            return;
        }

        // Make the section visible
        selectedLotSection.classList.remove('hidden');

        const lotInfo = sequence.tests[0].data.lotInfo;
        const analytics = sequence.analytics;

        // Display lot info
        this.displayLotInfo(sequence, lotInfo);
        
        // Display test summary
        this.displayTestSummary(sequence);
        
        // Display re-test flow
        this.displayRetestFlow(analytics);
        
        // Display quality metrics
        this.displayQualityMetrics(analytics);
        
        // Display failure analysis
        this.displayFailureAnalysis(analytics);
        
        // Display hard bin table
        this.displayHardBinTable(sequence);
        
        // Display test results table
        this.displayTestResultsTable(sequence, analytics);
    }

    /**
     * Display lot information
     * @param {Object} sequence - Sequence data
     * @param {Object} lotInfo - Lot info
     */
    displayLotInfo(sequence, lotInfo) {
        const lotInfoDiv = document.getElementById('selected-lot-info');
        if (!lotInfoDiv) return;

        lotInfoDiv.innerHTML = `
            <div class="bg-white p-4 rounded-lg border">
                <h3 class="font-semibold text-gray-700 mb-3 text-sm">📋 Lot Information</h3>
                <div class="grid grid-cols-2 gap-2 text-xs">
                    <div><span class="font-medium text-gray-600">Lot:</span> ${sequence.lotNumber}</div>
                    <div><span class="font-medium text-gray-600">Device:</span> ${sequence.device}</div>
                    <div><span class="font-medium text-gray-600">Size:</span> ${(lotInfo.Lot_Size || 0).toLocaleString()}</div>
                    <div><span class="font-medium text-gray-600">Date:</span> ${lotInfo.Start_time || lotInfo.Test_date || 'N/A'}</div>
                    <div class="col-span-2"><span class="font-medium text-gray-600">Operator:</span> ${lotInfo.Operator_id || lotInfo.Operator || 'N/A'}</div>
                </div>
            </div>`;
    }

    /**
     * Display test summary
     * @param {Object} sequence - Sequence data
     */
    displayTestSummary(sequence) {
        const summaryDiv = document.getElementById('selected-lot-summary');
        if (!summaryDiv) return;

        summaryDiv.innerHTML = `
            <div class="bg-white p-4 rounded-lg border">
                <h3 class="font-semibold text-gray-700 mb-3 text-sm">📊 Test Summary</h3>
                <div class="grid grid-cols-3 gap-3">
                    <div class="text-center">
                        <div class="text-lg font-bold text-green-600">${sequence.totalPass.toLocaleString()}</div>
                        <div class="text-xs text-gray-600">Pass</div>
                    </div>
                    <div class="text-center">
                        <div class="text-lg font-bold text-red-600">${sequence.totalFail.toLocaleString()}</div>
                        <div class="text-xs text-gray-600">Fail</div>
                    </div>
                    <div class="text-center">
                        <div class="text-lg font-bold text-blue-600">${sequence.finalYield.toFixed(1)}%</div>
                        <div class="text-xs text-gray-600">Yield</div>
                    </div>
                </div>
            </div>`;
    }

    /**
     * Display re-test flow
     * @param {Object} analytics - Analytics data
     */
    displayRetestFlow(analytics) {
        const retestFlowDiv = document.getElementById('selected-lot-retest-flow');
        if (!retestFlowDiv) return;

        // Get sequence data from current analytics
        const currentLot = this.getCurrentSelectedLot();
        if (!currentLot) return;

        const sequence = currentLot;
        const tests = sequence.tests || [];
        
        // Calculate re-test flow data
        const testSequence = tests.map(test => test.testType).join(' → ');
        const initialLotSize = sequence.totalInput || 0;
        const finalYield = sequence.finalYield || 0;
        const totalPass = sequence.totalPass || 0;
        const totalFail = sequence.totalFail || 0;
        
        // Calculate yield improvement through re-test
        const initialYield = tests.length > 0 ? (tests[0].yield || 0) : 0;
        const yieldImprovement = finalYield - initialYield;
        
        // Calculate step-by-step flow based on actual data structure
        let stepDetails = '';
        if (tests.length >= 3) {
            // Extract data from the sequence structure
            const primaryData = tests.find(t => t.testType === 'P1') || tests[0];
            const retest1Data = tests.find(t => t.testType === 'R1') || tests[1];
            const retest2Data = tests.find(t => t.testType === 'R2') || tests[2];
            
            // Calculate based on actual flow: P1 -> R1 -> R2
            const p1Input = primaryData.inputCount || initialLotSize;
            const p1Pass = primaryData.passCount || 0;
            const p1Fail = primaryData.failCount || 0;
            const p1Yield = primaryData.yield || 0;
            
            const r1Input = p1Fail; // R1 input = P1 fail
            const r1Pass = retest1Data.passCount || 0;
            const r1Fail = retest1Data.failCount || 0;
            const r1Yield = retest1Data.yield || 0;
            
            const r2Input = r1Fail; // R2 input = R1 fail
            const r2Pass = retest2Data.passCount || 0;
            const r2Fail = retest2Data.failCount || 0;
            const r2Yield = retest2Data.yield || 0;
            
            // Calculate total pass and final fail
            const totalPassFromFlow = p1Pass + r1Pass + r2Pass;
            const finalFailFromFlow = r2Fail;
            
            stepDetails = `
                <div class="mt-2 pt-2 border-t border-gray-200">
                    <div class="text-xs font-medium text-gray-600 mb-1">📋 Step-by-Step Flow:</div>
                    <div class="space-y-1 text-xs">
                        <div class="flex justify-between">
                            <span class="font-medium">P1:</span>
                            <span>${p1Input} → ${p1Pass}P (${p1Yield.toFixed(1)}%) → ${p1Fail}F</span>
                        </div>
                        <div class="flex justify-between text-blue-600">
                            <span class="font-medium">R1:</span>
                            <span>${r1Input} → ${r1Pass}P (${r1Yield.toFixed(1)}%) → ${r1Fail}F</span>
                        </div>
                        <div class="flex justify-between text-green-600">
                            <span class="font-medium">R2:</span>
                            <span>${r2Input} → ${r2Pass}P (${r2Yield.toFixed(1)}%) → ${r2Fail}F</span>
                        </div>
                    </div>
                    <div class="mt-2 pt-1 border-t border-gray-200">
                        <div class="flex justify-between text-xs font-medium">
                            <span>Total Pass:</span>
                            <span class="text-green-600">${totalPassFromFlow}</span>
                        </div>
                        <div class="flex justify-between text-xs font-medium">
                            <span>Final Fail:</span>
                            <span class="text-red-600">${finalFailFromFlow}</span>
                        </div>
                        <div class="flex justify-between text-xs font-medium">
                            <span>Final Yield:</span>
                            <span class="text-blue-600">${((totalPassFromFlow / p1Input) * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        retestFlowDiv.innerHTML = `
            <div class="bg-white p-4 rounded-lg border">
                <h3 class="font-semibold text-gray-700 mb-3 text-sm">🔄 Re-Test Flow Analysis</h3>
                <div class="space-y-2 text-xs">
                    <div><span class="font-medium text-gray-600">Sequence:</span> ${testSequence}</div>
                    <div><span class="font-medium text-gray-600">Initial Size:</span> ${initialLotSize.toLocaleString()}</div>
                    <div><span class="font-medium text-gray-600">Initial Yield:</span> ${initialYield.toFixed(1)}%</div>
                    <div><span class="font-medium text-gray-600">Final Yield:</span> <span class="font-bold text-blue-600">${finalYield.toFixed(1)}%</span></div>
                    <div><span class="font-medium text-gray-600">Improvement:</span> <span class="font-bold ${yieldImprovement >= 0 ? 'text-green-600' : 'text-red-600'}">${yieldImprovement >= 0 ? '+' : ''}${yieldImprovement.toFixed(1)}%</span></div>
                    ${stepDetails}
                </div>
            </div>`;
    }

    /**
     * Display quality metrics
     * @param {Object} analytics - Analytics data
     */
    displayQualityMetrics(analytics) {
        const qualityDiv = document.getElementById('selected-lot-quality');
        if (!qualityDiv) return;

        const quality = analytics.qualityMetrics || {};
        const sigmaLevel = quality.sigmaLevel || 0;
        const cpk = quality.cpk || 0;
        const qualityScore = quality.qualityScore || 0;
        
        // Get status and colors
        const yieldStatus = this.getYieldStatus(qualityScore);
        const yieldColor = this.getYieldStatusColor(qualityScore);
        const processCapability = this.getProcessCapability(cpk);
        const processColor = this.getProcessCapabilityColor(cpk);
        
        qualityDiv.innerHTML = `
            <div class="bg-white p-4 rounded-lg border">
                <h3 class="font-semibold text-gray-700 mb-3 text-sm">🏅 Quality Metrics</h3>
                <div class="space-y-2 text-xs">
                    <div class="flex justify-between">
                        <span class="font-medium text-gray-600">Sigma Level:</span>
                        <span class="font-medium">${sigmaLevel.toFixed(2)}σ</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium text-gray-600">Cpk:</span>
                        <span class="font-medium">${cpk.toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium text-gray-600">Quality Score:</span>
                        <span class="font-bold ${yieldColor}">${qualityScore.toFixed(1)}/100</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium text-gray-600">Yield Status:</span>
                        <span class="font-medium ${yieldColor}">${yieldStatus}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium text-gray-600">Process Capability:</span>
                        <span class="font-medium ${processColor}">${processCapability}</span>
                    </div>
                </div>
            </div>`;
    }

    /**
     * Display failure analysis
     * @param {Object} analytics - Analytics data
     */
    displayFailureAnalysis(analytics) {
        const failureDiv = document.getElementById('selected-lot-failure-analysis');
        if (!failureDiv) return;

        const rootCause = analytics.rootCause || {};
        const potentialCauses = rootCause.potentialCauses || [];
        const failureCategories = rootCause.failureCategories || {};
        const recommendations = rootCause.recommendations || [];
        
        // Get site-specific issues if available
        const siteIssues = rootCause.siteIssues || {};
        const siteDetails = Object.entries(siteIssues).map(([site, count]) => 
            `${site}(${count})`
        ).join(', ');
        
        failureDiv.innerHTML = `
            <div class="bg-white p-4 rounded-lg border">
                <h3 class="font-semibold text-gray-700 mb-3 text-sm">🔬 Failure Analysis</h3>
                <div class="space-y-3 text-xs">
                    ${potentialCauses.length > 0 ? `
                        <div>
                            <div class="font-medium text-gray-600 mb-1">Potential Root Causes:</div>
                            <ul class="list-disc list-inside space-y-1 text-gray-700">
                                ${potentialCauses.slice(0, 5).map(cause => `<li>${cause}</li>`).join('')}
                                ${potentialCauses.length > 5 ? `<li class="text-gray-500">... and ${potentialCauses.length - 5} more</li>` : ''}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${Object.keys(failureCategories).length > 0 ? `
                        <div>
                            <div class="font-medium text-gray-600 mb-1">Failure Categories:</div>
                            <div class="grid grid-cols-2 gap-1 text-gray-700">
                                ${Object.entries(failureCategories).map(([category, count]) => 
                                    `<div class="flex justify-between">
                                        <span>${category}:</span>
                                        <span class="font-medium">${count} failures</span>
                                    </div>`
                                ).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${siteDetails ? `
                        <div>
                            <div class="font-medium text-gray-600 mb-1">Site-specific issues:</div>
                            <div class="text-gray-700">${siteDetails}</div>
                        </div>
                    ` : ''}
                    
                    ${recommendations.length > 0 ? `
                        <div>
                            <div class="font-medium text-gray-600 mb-1">Recommendations:</div>
                            <ul class="list-disc list-inside space-y-1 text-gray-700">
                                ${recommendations.slice(0, 3).map(rec => `<li>${rec}</li>`).join('')}
                                ${recommendations.length > 3 ? `<li class="text-gray-500">... and ${recommendations.length - 3} more</li>` : ''}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            </div>`;
    }

    /**
     * Display hard bin table
     * @param {Object} sequence - Sequence data
     */
    displayHardBinTable(sequence) {
        console.log('[Debug] displayHardBinTable called. Sequence data:', sequence);
        
        const hardBinContainer = document.getElementById('hard-bin-table-container');
        if (!hardBinContainer) {
            console.log('[Debug] Hard bin container not found!');
            return;
        }

        const hardBinTbody = document.getElementById('hard-bin-tbody');
        if (!hardBinTbody) {
            console.log('[Debug] Hard bin table body not found!');
            return;
        }

        // Get hard bin data from the sequence
        const hardBinData = sequence.tests[0]?.data?.hardbin || {};
        
        if (Object.keys(hardBinData).length === 0) {
            hardBinTbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                        No hard bin data available for this lot
                    </td>
                </tr>
            `;
            return;
        }

        // Calculate total for percentage calculation
        const total = Object.values(hardBinData).reduce((sum, count) => sum + count, 0);

        // Generate table rows
        const tableRows = Object.entries(hardBinData).map(([binCode, count]) => {
            const percentage = total > 0 ? ((count / total) * 100).toFixed(2) : '0.00';
            const category = binCode === '1' ? 'Pass' : 'Fail';
            const rowClass = binCode === '1' ? 'text-green-600' : 'text-red-600';
            
            return `
                <tr class="${rowClass}">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">${binCode}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">${category} Bin</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">${count.toLocaleString()}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">${percentage}%</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            binCode === '1' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }">
                            ${category}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');

        hardBinTbody.innerHTML = tableRows;
        console.log('[Debug] Hard bin table populated successfully');
    }

    /**
     * Display test results table
     * @param {Object} sequence - Sequence data
     * @param {Object} analytics - Analytics data
     */
    displayTestResultsTable(sequence, analytics) {
        // Check if test results container exists
        const testResultsContainer = document.getElementById('test-results-container');
        if (!testResultsContainer) {
            console.log('[Debug] Test results container not found');
            return;
        }

        // Get test results from the first test in the sequence (individual lot data)
        const testResults = sequence.tests[0]?.data?.testResults || [];
        console.log(`Displaying test results for ${sequence.lotNumber}:`, testResults);
        
        if (testResults && testResults.length > 0) {
            // Filter out PASS results and show only FAIL results for better analysis
            const failResults = testResults.filter(test => test.result === 'FAIL');
            
            if (failResults.length > 0) {
                const tableHTML = `
                    <div class="bg-white rounded-lg shadow border">
                        <div class="p-6 border-b">
                            <h3 class="text-lg font-semibold text-gray-800">📋 Test Results (Failures Only)</h3>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Description</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site 1</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site 2</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site 3</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site 4</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    ${failResults.slice(0, 20).map(test => `
                                        <tr class="border-t">
                                            <td class="px-6 py-4 whitespace-nowrap text-sm">${test.test || test.description || 'Unknown Test'}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">${test.result}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-center">${test.total || 0}</td>
                                            ${[1, 2, 3, 4].map(siteNum => `<td class="px-6 py-4 whitespace-nowrap text-sm text-center">${test[`site${siteNum}`] || 0}</td>`).join('')}
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
                testResultsContainer.innerHTML = tableHTML;
            } else {
                testResultsContainer.innerHTML = `
                    <div class="bg-white rounded-lg shadow border">
                        <div class="p-6 text-center">
                            <div class="text-green-600 text-lg font-medium mb-2">✅ All tests passed</div>
                            <p class="text-gray-500">No failures detected for this lot</p>
                        </div>
                    </div>
                `;
            }
        } else {
            testResultsContainer.innerHTML = `
                <div class="bg-white rounded-lg shadow border">
                    <div class="p-6 text-center">
                        <p class="text-gray-500">No detailed failure data available for this lot</p>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Display enhanced analytics
     * @param {Object} analytics - Enhanced analytics data
     */
    displayEnhancedAnalytics(analytics) {
        console.log('=== Displaying Enhanced Analytics ===', analytics);
        const enhancedAnalyticsDiv = document.getElementById('enhanced-analytics');
        
        // Check if we have meaningful data to display
        const hasTestResults = analytics.testResults && analytics.testResults.length > 0;
        const hasMultipleLots = window.allData && window.allData.length > 1;
        
        if (!hasTestResults && !hasMultipleLots) {
            enhancedAnalyticsDiv.classList.add('hidden');
            return;
        }
        
        enhancedAnalyticsDiv.classList.remove('hidden');

        // Display yield trend analysis
        this.displayYieldTrendAnalysis(analytics, hasMultipleLots);

        // Display failure pattern analysis
        this.displayFailurePatternAnalysis(analytics, hasTestResults);

        // Display site performance
        this.displaySitePerformance(analytics, hasTestResults);
        
        // Display failure correlation analysis
        this.displayFailureCorrelationAnalysis(analytics, hasTestResults);
    }

    /**
     * Display yield trend analysis
     * @param {Object} analytics - Analytics data
     * @param {boolean} hasMultipleLots - Whether multiple lots are available
     */
    displayYieldTrendAnalysis(analytics, hasMultipleLots) {
        const trendContent = document.getElementById('trend-content');
        if (!trendContent) return;

        if (hasMultipleLots && analytics.yieldTrend && analytics.yieldTrend.average > 0) {
            const trend = analytics.yieldTrend;
            trendContent.innerHTML = `
                <div class="text-sm space-y-1">
                    <div><span class="font-medium">Average Yield:</span> <span class="font-bold">${trend.average.toFixed(2)}%</span></div>
                    <div><span class="font-medium">Yield Range:</span> ${trend.range}</div>
                    <div><span class="font-medium">Trend:</span> <span class="font-semibold">${trend.trend}</span></div>
                    <div><span class="font-medium">Variation:</span> ${trend.variation.toFixed(2)}%</div>
                </div>`;
        } else {
            trendContent.innerHTML = `<p class="text-sm text-gray-500">Multiple distinct lots needed for trend analysis.</p>`;
        }
    }

    /**
     * Display failure pattern analysis
     * @param {Object} analytics - Analytics data
     * @param {boolean} hasTestResults - Whether test results are available
     */
    displayFailurePatternAnalysis(analytics, hasTestResults) {
        const patternContent = document.getElementById('pattern-content');
        if (!patternContent) return;

        if (hasTestResults && analytics.failurePatterns && analytics.failurePatterns.topPatterns && analytics.failurePatterns.topPatterns.length > 0) {
            const patterns = analytics.failurePatterns.topPatterns;
            patternContent.innerHTML = `
                <ul class="text-xs space-y-1">
                    ${patterns.map(p => `
                        <li class="flex justify-between">
                            <span class="truncate pr-2" title="${p.pattern}">${p.pattern}</span>
                            <span class="font-bold">${p.count}</span>
                        </li>`).join('')}
                </ul>`;
        } else {
            patternContent.innerHTML = `<p class="text-sm text-gray-500">No significant failure patterns found.</p>`;
        }
    }

    /**
     * Display site performance
     * @param {Object} analytics - Analytics data
     * @param {boolean} hasTestResults - Whether test results are available
     */
    displaySitePerformance(analytics, hasTestResults) {
        const siteContent = document.getElementById('site-content');
        if (!siteContent) return;

        if (hasTestResults && analytics.sitePerformance && analytics.sitePerformance.distribution && Object.keys(analytics.sitePerformance.distribution).length > 0) {
            const distribution = analytics.sitePerformance.distribution;
            const total = Object.values(distribution).reduce((sum, site) => sum + site.total, 0);
            siteContent.innerHTML = `
                <ul class="text-sm space-y-1">
                    ${Object.entries(distribution).map(([site, data]) => `
                        <li class="flex justify-between">
                            <span>${site.toUpperCase()}</span>
                            <span class="font-semibold">${((data.total / total) * 100).toFixed(1)}%</span>
                        </li>`).join('')}
                </ul>`;
        } else {
            siteContent.innerHTML = `<p class="text-sm text-gray-500">No site performance data available.</p>`;
        }
    }

    /**
     * Display failure correlation analysis
     * @param {Object} analytics - Analytics data
     * @param {boolean} hasTestResults - Whether test results are available
     */
    displayFailureCorrelationAnalysis(analytics, hasTestResults) {
        const correlationContent = document.getElementById('correlation-content');
        if (!correlationContent) return;

        if (hasTestResults && analytics.failureCorrelations && analytics.failureCorrelations.correlations && analytics.failureCorrelations.correlations.length > 0) {
            const correlations = analytics.failureCorrelations.correlations;
            correlationContent.innerHTML = `
                <ul class="text-xs space-y-1">
                    ${correlations.slice(0, 5).map(c => `
                        <li class="border-t pt-1 mt-1">
                            <div class="flex justify-between">
                                <span class="truncate pr-2" title="${c.pair}">${c.pair}</span>
                                <span class="font-bold">${(c.correlation * 100).toFixed(1)}%</span>
                            </div>
                            <div class="text-right text-gray-500">${c.interpretation}</div>
                        </li>`).join('')}
                </ul>`;
        } else {
            correlationContent.innerHTML = `<p class="text-sm text-gray-500">Insufficient data for correlation analysis.</p>`;
        }
    }
} 