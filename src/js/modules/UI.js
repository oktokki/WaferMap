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
        // File upload event listeners
        const fileInput = document.getElementById('final-test-upload');
        if (fileInput) {
            fileInput.addEventListener('change', (event) => {
                this.handleFileUpload(event);
            });
        }

        // Debug buttons
        const debugBtn = document.getElementById('debugBtn');
        if (debugBtn) {
            debugBtn.addEventListener('click', () => {
                this.showDebugInfo();
            });
        }

        const debugDataBtn = document.getElementById('debugDataBtn');
        if (debugDataBtn) {
            debugDataBtn.addEventListener('click', () => {
                this.showDebugData();
            });
        }

        // Export buttons
        this.initializeExportButtons();

        // Tab switching
        const tabs = document.querySelectorAll('.main-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (event) => this.handleTabClick(event));
        });

        // Lot comparison table resize functionality
        this.initializeTableResize();

        // Lot comparison table width control buttons
        this.initializeTableWidthControls();

        // Lot analytics container resize functionality
        this.initializeAnalyticsResize();

        // Lot analytics container width control buttons
        this.initializeAnalyticsWidthControls();

        // Individual card resize functionality
        this.initializeCardResize();
    }

    /**
     * Initialize table resize functionality
     */
    initializeTableResize() {
        const container = document.getElementById('lot-comparison-table-container');
        const resizeHandle = container?.querySelector('.resize-handle');
        const tableWrapper = container?.querySelector('.overflow-x-auto');
        
        if (!container || !resizeHandle || !tableWrapper) return;

        let isResizing = false;
        let startX, startWidth;

        resizeHandle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startWidth = parseInt(getComputedStyle(tableWrapper).maxWidth, 10);
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            
            e.preventDefault();
        });

        const handleMouseMove = (e) => {
            if (!isResizing) return;
            
            const deltaX = e.clientX - startX;
            const newWidth = Math.max(600, Math.min(2000, startWidth + deltaX));
            
            tableWrapper.style.maxWidth = `${newWidth}px`;
        };

        const handleMouseUp = () => {
            isResizing = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }

    /**
     * Initialize table width control buttons
     */
    initializeTableWidthControls() {
        const resetBtn = document.getElementById('reset-table-width');
        const fitContentBtn = document.getElementById('fit-content-width');
        const printBtn = document.getElementById('print-friendly-width');
        const tableWrapper = document.querySelector('#lot-comparison-table-container .overflow-x-auto');
        
        if (!tableWrapper) return;

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                tableWrapper.style.maxWidth = '1200px';
                tableWrapper.style.minWidth = '800px';
            });
        }

        if (fitContentBtn) {
            fitContentBtn.addEventListener('click', () => {
                const table = document.getElementById('lot-comparison-table');
                if (table) {
                    const tableWidth = table.scrollWidth;
                    const containerWidth = Math.max(800, Math.min(1500, tableWidth + 50));
                    tableWrapper.style.maxWidth = `${containerWidth}px`;
                    tableWrapper.style.minWidth = `${containerWidth}px`;
                }
            });
        }

        if (printBtn) {
            printBtn.addEventListener('click', () => {
                // Set print-friendly width (A4 landscape equivalent)
                tableWrapper.style.maxWidth = '1000px';
                tableWrapper.style.minWidth = '1000px';
                
                // Optional: Trigger print
                setTimeout(() => {
                    if (confirm('Print the lot comparison table?')) {
                        window.print();
                    }
                }, 100);
            });
        }
    }

    /**
     * Initialize analytics container resize functionality
     */
    initializeAnalyticsResize() {
        const container = document.getElementById('lot-analytics-container');
        const resizeHandle = container?.querySelector('.resize-handle');
        const analyticsWrapper = container?.querySelector('.overflow-x-auto');
        
        if (!container || !resizeHandle || !analyticsWrapper) return;

        let isResizing = false;
        let startX, startWidth;

        resizeHandle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startWidth = parseInt(getComputedStyle(analyticsWrapper).maxWidth, 10);
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            
            e.preventDefault();
        });

        const handleMouseMove = (e) => {
            if (!isResizing) return;
            
            const deltaX = e.clientX - startX;
            const newWidth = Math.max(800, Math.min(2000, startWidth + deltaX));
            
            analyticsWrapper.style.maxWidth = `${newWidth}px`;
        };

        const handleMouseUp = () => {
            isResizing = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }

    /**
     * Initialize analytics container width control buttons
     */
    initializeAnalyticsWidthControls() {
        const resetBtn = document.getElementById('reset-analytics-width');
        const fitContentBtn = document.getElementById('fit-analytics-content');
        const printBtn = document.getElementById('print-analytics-width');
        const analyticsWrapper = document.querySelector('#lot-analytics-container .overflow-x-auto');
        
        if (!analyticsWrapper) return;

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                analyticsWrapper.style.maxWidth = '1400px';
                analyticsWrapper.style.minWidth = '1000px';
            });
        }

        if (fitContentBtn) {
            fitContentBtn.addEventListener('click', () => {
                // Calculate content width based on the analytics content
                const analyticsContent = document.querySelector('#lot-analytics-container');
                if (analyticsContent) {
                    const contentWidth = analyticsContent.scrollWidth;
                    const containerWidth = Math.max(1000, Math.min(1800, contentWidth + 50));
                    analyticsWrapper.style.maxWidth = `${containerWidth}px`;
                    analyticsWrapper.style.minWidth = `${containerWidth}px`;
                }
            });
        }

        if (printBtn) {
            printBtn.addEventListener('click', () => {
                // Set print-friendly width (A4 landscape equivalent)
                analyticsWrapper.style.maxWidth = '1200px';
                analyticsWrapper.style.minWidth = '1200px';
                
                // Optional: Trigger print
                setTimeout(() => {
                    if (confirm('Print the lot analytics?')) {
                        window.print();
                    }
                }, 100);
            });
        }
    }

    /**
     * Initialize individual card resize functionality
     */
    initializeCardResize() {
        // Function to initialize resize for a single card
        const initializeSingleCard = (card) => {
            const handle = card.querySelector('.resize-handle-card');
            const resetBtn = card.querySelector('.reset-card-width');
            const fitBtn = card.querySelector('.fit-card-width');
            const printBtn = card.querySelector('.print-card-width');
            if (!handle) return;

            let isResizing = false;
            let startX, startWidth;

            handle.addEventListener('mousedown', (e) => {
                isResizing = true;
                startX = e.clientX;
                startWidth = parseInt(getComputedStyle(card).width, 10);
                document.body.style.cursor = 'col-resize';
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
                e.preventDefault();
            });

            const handleMouseMove = (e) => {
                if (!isResizing) return;
                const deltaX = e.clientX - startX;
                const newWidth = Math.max(220, Math.min(1200, startWidth + deltaX));
                card.style.width = `${newWidth}px`;
            };

            const handleMouseUp = () => {
                isResizing = false;
                document.body.style.cursor = '';
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };

            // Reset width
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    card.style.width = '';
                });
            }
            // Fit content
            if (fitBtn) {
                fitBtn.addEventListener('click', () => {
                    card.style.width = '';
                    const content = card.querySelector('div:not(.resize-handle-card):not(.flex)');
                    if (content) {
                        const rect = content.getBoundingClientRect();
                        card.style.width = `${Math.max(220, Math.min(1200, rect.width + 40))}px`;
                    }
                });
            }
            // Print width
            if (printBtn) {
                printBtn.addEventListener('click', () => {
                    card.style.width = '400px';
                    setTimeout(() => {
                        if (confirm('Print this card?')) {
                            window.print();
                        }
                    }, 100);
                });
            }
        };

        // Initialize existing cards
        const cards = document.querySelectorAll('.resizable-card');
        cards.forEach(initializeSingleCard);

        // Set up observer for dynamically added cards
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.classList && node.classList.contains('resizable-card')) {
                            initializeSingleCard(node);
                        }
                        // Check for resizable cards within added nodes
                        const newCards = node.querySelectorAll ? node.querySelectorAll('.resizable-card') : [];
                        newCards.forEach(initializeSingleCard);
                    }
                });
            });
        });

        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
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
        
        // Initialize tab-specific functionality
        this.initializeTabFunctionality(tabId);
    }

    /**
     * Initialize tab-specific functionality
     * @param {string} tabId - Tab ID
     */
    initializeTabFunctionality(tabId) {
        switch (tabId) {
            case 'test-analysis':
                if (window.initializeTestAnalysis) {
                    window.initializeTestAnalysis();
                }
                // Initialize charts after a short delay to ensure DOM is ready
                setTimeout(() => {
                    if (window.initializeCharts) {
                        window.initializeCharts();
                    }
                }, 100);
                break;
            case 'binning-analysis':
                if (window.initializeBinningAnalysis) {
                    window.initializeBinningAnalysis();
                }
                // Initialize charts after a short delay to ensure DOM is ready
                setTimeout(() => {
                    if (window.initializeCharts) {
                        window.initializeCharts();
                    }
                }, 100);
                break;
            case 'map-analysis':
                // MAP 분석 기능 초기화 (향후 구현)
                console.log('MAP Analysis tab selected');
                break;
            case 'risk-assessment':
                // RISK 평가 기능 초기화 (향후 구현)
                console.log('Risk Assessment tab selected');
                break;
            default:
                break;
        }
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
            // Clear previous data
            if (window.allData) {
                window.allData = [];
            }
            
            // Process each file using SummaryFileParser for .lotSumTXT files
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                console.log(`Processing file ${i + 1}/${files.length}: ${file.name}`);
                
                try {
                    // Use SummaryFileParser for .lotSumTXT files
                    if (window.SummaryFileParser) {
                        const parser = new window.SummaryFileParser();
                        const text = await file.text();
                        const parsed = parser.parseSummaryFile(text);
                        
                        // Transform the parsed data to match the expected format
                        const transformedData = {
                            lotNumber: parsed.lotInfo?.Lot_number || 
                                      parsed.lotInfo?.Lot_ID || 
                                      parsed.lotInfo?.LotNumber ||
                                      this.extractLotNumberFromFileName(file.name),
                            lotInfo: parsed.lotInfo,
                            summary: parsed.summary,
                            testResults: parsed.testResults,
                            siteResults: parsed.siteResults,
                            hardbin: parsed.hardbin,
                            analytics: parsed.analytics,
                            deviceName: parsed.lotInfo?.Device_name || 'Unknown',
                            fileName: file.name
                        };
                        
                        const data = { 
                            success: true, 
                            data: transformedData, 
                            fileName: file.name 
                        };
                        
                        if (window.allData && Array.isArray(window.allData)) {
                            window.allData.push(data);
                        } else {
                            window.allData = [data];
                        }
                        
                        console.log(`File ${file.name} processed successfully`);
                    } else {
                        console.error('SummaryFileParser not available');
                        throw new Error('SummaryFileParser not available');
                    }
                } catch (fileError) {
                    console.error(`Error processing file ${file.name}:`, fileError);
                }
            }

            console.log('All files processed. Total data entries:', window.allData.length);
            
            // Display results
            if (window.allData && window.allData.length > 0) {
                console.log('Displaying results...');
                
                try {
                    // Get aggregated analytics
                    const aggregatedAnalytics = window.Analytics.getAggregatedAnalytics(window.allData);
                    console.log('Aggregated analytics:', aggregatedAnalytics);
                    
                    // Display results using UI module
                    this.displayMultiFileSummary(aggregatedAnalytics);
                    
                    // Transform data for analysis modules if available
                    if (window.transformDataForAnalysis) {
                        const transformedData = window.transformDataForAnalysis(window.allData);
                        
                        // Initialize new analysis modules if available
                        if (window.TestAnalysis) {
                            const testAnalysis = new window.TestAnalysis();
                            testAnalysis.loadTestData(transformedData);
                            window.testAnalysis = testAnalysis;
                        }
                        
                        if (window.BinningAnalysis) {
                            const binningAnalysis = new window.BinningAnalysis();
                            binningAnalysis.loadBinningData(transformedData);
                            window.binningAnalysis = binningAnalysis;
                        }
                        
                        // Populate device filters if available
                        if (window.populateDeviceFilters) {
                            window.populateDeviceFilters(transformedData);
                        }
                    }
                    
                    console.log('✅ All displays completed successfully');
                } catch (displayError) {
                    console.error('Error in display functions:', displayError);
                    this.showError(`Error displaying data: ${displayError.message}`);
                }
            } else {
                console.error('No valid data found in uploaded files');
                this.showError('No valid data found in uploaded files. Check console for details.');
            }
        } catch (e) {
            console.error('Error processing files:', e);
            this.showError(`Error processing files: ${e.message}`);
        } finally {
            // Hide loading state
            this.hideLoadingState();
        }
    }

    /**
     * Extract lot number from filename
     * @param {string} filename - Filename
     * @returns {string} Lot number
     */
    extractLotNumberFromFileName(filename) {
        // Try to extract lot number from filename
        const match = filename.match(/([A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+)/);
        if (match) {
            return match[1];
        }
        
        // Fallback: use filename without extension
        return filename.replace(/\.[^/.]+$/, '');
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
     * Initialize report generation button
     */
    initializeExportButtons() {
        const generateReportBtn = document.getElementById('generate-report');

        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', () => this.generateComprehensiveReport());
        }
    }

    /**
     * Generate comprehensive PDF report
     */
    generateComprehensiveReport() {
        try {
            console.log('Generating comprehensive PDF report...');
            
            // Check if jsPDF is available
            if (typeof window.jspdf === 'undefined') {
                this.showError('PDF generation library not loaded. Please refresh the page.');
                return;
            }

            // Check if we have data to report
            if (!window.currentAnalytics) {
                this.showError('No data available for report generation. Please upload files first.');
                return;
            }

            // Show loading state
            this.showLoadingState();
            
            // Generate the report
            this.createPDFReport(window.currentAnalytics);
            
        } catch (error) {
            console.error('Error generating report:', error);
            this.showError(`Error generating report: ${error.message}`);
        } finally {
            this.hideLoadingState();
        }
    }

    /**
     * Create comprehensive PDF report
     * @param {Object} analytics - Analytics data
     */
    createPDFReport(analytics) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        let yPosition = margin;
        
        // Helper function to add new page
        const addNewPage = () => {
            doc.addPage();
            yPosition = margin;
        };
        
        // Helper function to check if we need a new page
        const checkPageBreak = (requiredSpace = 20) => {
            if (yPosition + requiredSpace > pageHeight - margin) {
                addNewPage();
            }
        };

        // Page 1: Executive Summary
        this.addReportHeader(doc, 'Executive Summary', yPosition);
        yPosition += 20;
        
        this.addExecutiveSummary(doc, analytics, yPosition);
        yPosition += 80;
        
        // Page 2: Overall Statistics
        addNewPage();
        this.addReportHeader(doc, 'Overall Statistics', yPosition);
        yPosition += 20;
        
        this.addOverallStatistics(doc, analytics, yPosition);
        yPosition += 60;
        
        // Page 3: Lot Comparison
        addNewPage();
        this.addReportHeader(doc, 'Lot Comparison Analysis', yPosition);
        yPosition += 20;
        
        this.addLotComparisonTable(doc, analytics, yPosition);
        yPosition += 80;
        
        // Page 4: Quality Metrics
        addNewPage();
        this.addReportHeader(doc, 'Quality Metrics & Process Capability', yPosition);
        yPosition += 20;
        
        this.addQualityMetrics(doc, analytics, yPosition);
        yPosition += 60;
        
        // Page 5: Failure Analysis
        addNewPage();
        this.addReportHeader(doc, 'Failure Analysis & Root Causes', yPosition);
        yPosition += 20;
        
        this.addFailureAnalysis(doc, analytics, yPosition);
        yPosition += 80;
        
        // Page 6: Test Results Details
        addNewPage();
        this.addReportHeader(doc, 'Detailed Test Results', yPosition);
        yPosition += 20;
        
        this.addTestResultsDetails(doc, analytics, yPosition);
        yPosition += 60;
        
        // Page 7: Recommendations
        addNewPage();
        this.addReportHeader(doc, 'Recommendations & Action Items', yPosition);
        yPosition += 20;
        
        this.addRecommendations(doc, analytics, yPosition);
        
        // Save the PDF
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `Wafer_Analysis_Report_${timestamp}.pdf`;
        doc.save(filename);
        
        console.log('PDF report generated successfully:', filename);
    }

    /**
     * Add report header
     * @param {Object} doc - PDF document
     * @param {string} title - Header title
     * @param {number} yPosition - Y position
     */
    addReportHeader(doc, title, yPosition) {
        const pageWidth = doc.internal.pageSize.getWidth();
        
        // Add company logo/header
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(59, 130, 246); // Blue color
        doc.text('Wafer Map Analysis Report', pageWidth / 2, yPosition, { align: 'center' });
        
        yPosition += 15;
        
        // Add subtitle
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(107, 114, 128); // Gray color
        doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
        
        yPosition += 10;
        
        // Add date
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
        
        yPosition += 20;
        
        // Add separator line
        doc.setDrawColor(229, 231, 235);
        doc.line(20, yPosition, pageWidth - 20, yPosition);
        
        return yPosition + 10;
    }

    /**
     * Add executive summary
     * @param {Object} doc - PDF document
     * @param {Object} analytics - Analytics data
     * @param {number} yPosition - Y position
     */
    addExecutiveSummary(doc, analytics, yPosition) {
        const pageWidth = doc.internal.pageSize.getWidth();
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Key Findings:', 20, yPosition);
        
        yPosition += 15;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        const overallYield = analytics.overallYield || 0;
        const totalLots = Object.keys(analytics.testSequences || {}).length;
        const totalDevices = (analytics.totalGood || 0) + (analytics.totalFail || 0);
        
        const summaryPoints = [
            `• Overall Yield: ${overallYield.toFixed(2)}%`,
            `• Total Lots Analyzed: ${totalLots}`,
            `• Total Devices Tested: ${totalDevices.toLocaleString()}`,
            `• Pass Rate: ${analytics.totalGood ? ((analytics.totalGood / totalDevices) * 100).toFixed(2) : 0}%`,
            `• Fail Rate: ${analytics.totalFail ? ((analytics.totalFail / totalDevices) * 100).toFixed(2) : 0}%`
        ];
        
        summaryPoints.forEach(point => {
            doc.text(point, 25, yPosition);
            yPosition += 8;
        });
        
        yPosition += 10;
        
        // Add yield status
        const yieldStatus = this.getYieldStatus(overallYield);
        
        doc.setFont('helvetica', 'bold');
        doc.text(`Yield Status: ${yieldStatus}`, 20, yPosition);
        
        return yPosition + 15;
    }

    /**
     * Add overall statistics
     * @param {Object} doc - PDF document
     * @param {Object} analytics - Analytics data
     * @param {number} yPosition - Y position
     */
    addOverallStatistics(doc, analytics, yPosition) {
        const pageWidth = doc.internal.pageSize.getWidth();
        
        // Create statistics table
        const statsData = [
            ['Metric', 'Value', 'Status'],
            ['Overall Yield', `${(analytics.overallYield || 0).toFixed(2)}%`, this.getYieldStatus(analytics.overallYield)],
            ['Total Good', (analytics.totalGood || 0).toLocaleString(), 'Pass'],
            ['Total Fail', (analytics.totalFail || 0).toLocaleString(), 'Fail'],
            ['Total Lots', Object.keys(analytics.testSequences || {}).length.toString(), 'Analyzed'],
            ['Average Lot Size', analytics.averageLotSize ? Math.round(analytics.averageLotSize).toLocaleString() : 'N/A', 'Devices']
        ];
        
        doc.autoTable({
            startY: yPosition,
            head: [statsData[0]],
            body: statsData.slice(1),
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246], textColor: 255 },
            styles: { fontSize: 10 }
        });
        
        return doc.lastAutoTable.finalY + 10;
    }

    /**
     * Add lot comparison table
     * @param {Object} doc - PDF document
     * @param {Object} analytics - Analytics data
     * @param {number} yPosition - Y position
     */
    addLotComparisonTable(doc, analytics, yPosition) {
        const sequences = analytics.testSequences || {};
        const lotData = Object.entries(sequences).map(([lotNumber, sequence]) => [
            lotNumber,
            sequence.device || 'Unknown',
            (sequence.totalInput || 0).toLocaleString(),
            `${(sequence.finalYield || 0).toFixed(2)}%`,
            (sequence.totalPass || 0).toLocaleString(),
            (sequence.totalFail || 0).toLocaleString()
        ]);
        
        doc.autoTable({
            startY: yPosition,
            head: [['Lot Number', 'Device', 'Lot Size', 'Yield (%)', 'Pass', 'Fail']],
            body: lotData,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246], textColor: 255 },
            styles: { fontSize: 8 },
            columnStyles: {
                0: { cellWidth: 30 },
                1: { cellWidth: 35 },
                2: { cellWidth: 25 },
                3: { cellWidth: 25 },
                4: { cellWidth: 25 },
                5: { cellWidth: 25 }
            }
        });
        
        return doc.lastAutoTable.finalY + 10;
    }

    /**
     * Add quality metrics
     * @param {Object} doc - PDF document
     * @param {Object} analytics - Analytics data
     * @param {number} yPosition - Y position
     */
    addQualityMetrics(doc, analytics, yPosition) {
        const overallYield = analytics.overallYield || 0;
        const sigmaLevel = this.calculateSigmaLevel(overallYield);
        const cpk = this.calculateCpk(overallYield);
        const qualityScore = this.calculateQualityScore(overallYield, sigmaLevel, cpk);
        
        const metricsData = [
            ['Quality Metric', 'Value', 'Status'],
            ['Sigma Level', `${sigmaLevel.toFixed(2)}σ`, sigmaLevel >= 3 ? 'Good' : 'Needs Improvement'],
            ['Process Capability (Cpk)', cpk.toFixed(2), cpk >= 1.33 ? 'Capable' : 'Not Capable'],
            ['Quality Score', qualityScore.toFixed(1), qualityScore >= 80 ? 'High' : 'Low'],
            ['Yield Status', this.getYieldStatus(overallYield), 'Current']
        ];
        
        doc.autoTable({
            startY: yPosition,
            head: [metricsData[0]],
            body: metricsData.slice(1),
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246], textColor: 255 },
            styles: { fontSize: 10 }
        });
        
        return doc.lastAutoTable.finalY + 10;
    }

    /**
     * Add failure analysis
     * @param {Object} doc - PDF document
     * @param {Object} analytics - Analytics data
     * @param {number} yPosition - Y position
     */
    addFailureAnalysis(doc, analytics, yPosition) {
        // Get failure patterns from the first lot (if available)
        const sequences = analytics.testSequences || {};
        const firstLot = Object.values(sequences)[0];
        
        if (firstLot && firstLot.tests && firstLot.tests.length > 0) {
            const failurePatterns = this.analyzeFailurePatterns(firstLot.tests[0].data.testResults || []);
            
            if (failurePatterns.rootCauses && failurePatterns.rootCauses.length > 0) {
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text('Top Root Causes:', 20, yPosition);
                yPosition += 15;
                
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                
                failurePatterns.rootCauses.slice(0, 5).forEach((cause, index) => {
                    doc.text(`${index + 1}. ${cause}`, 25, yPosition);
                    yPosition += 8;
                });
                
                yPosition += 10;
            }
        }
        
        // Add failure categories if available
        if (analytics.enhancedAnalytics && analytics.enhancedAnalytics.failureCategories) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Failure Categories:', 20, yPosition);
            yPosition += 15;
            
            const categories = analytics.enhancedAnalytics.failureCategories;
            const categoryData = Object.entries(categories).map(([category, count]) => [category, count.toString()]);
            
            doc.autoTable({
                startY: yPosition,
                head: [['Category', 'Failure Count']],
                body: categoryData,
                theme: 'grid',
                headStyles: { fillColor: [239, 68, 68], textColor: 255 },
                styles: { fontSize: 9 }
            });
            
            yPosition = doc.lastAutoTable.finalY + 10;
        }
        
        return yPosition;
    }

    /**
     * Add test results details
     * @param {Object} doc - PDF document
     * @param {Object} analytics - Analytics data
     * @param {number} yPosition - Y position
     */
    addTestResultsDetails(doc, analytics, yPosition) {
        const sequences = analytics.testSequences || {};
        const firstLot = Object.values(sequences)[0];
        
        if (firstLot && firstLot.tests && firstLot.tests.length > 0) {
            const testResults = firstLot.tests[0].data.testResults || [];
            const failResults = testResults.filter(test => test.result === 'FAIL').slice(0, 10);
            
            if (failResults.length > 0) {
                const testData = failResults.map(test => [
                    test.test || test.description || 'Unknown',
                    test.result,
                    test.total || 0,
                    test.site1 || 0,
                    test.site2 || 0,
                    test.site3 || 0,
                    test.site4 || 0
                ]);
                
                doc.autoTable({
                    startY: yPosition,
                    head: [['Test Name', 'Result', 'Total', 'Site1', 'Site2', 'Site3', 'Site4']],
                    body: testData,
                    theme: 'grid',
                    headStyles: { fillColor: [239, 68, 68], textColor: 255 },
                    styles: { fontSize: 7 },
                    columnStyles: {
                        0: { cellWidth: 50 },
                        1: { cellWidth: 20 },
                        2: { cellWidth: 20 },
                        3: { cellWidth: 20 },
                        4: { cellWidth: 20 },
                        5: { cellWidth: 20 },
                        6: { cellWidth: 20 }
                    }
                });
                
                return doc.lastAutoTable.finalY + 10;
            }
        }
        
        doc.setFontSize(10);
        doc.text('No detailed test results available', 20, yPosition);
        return yPosition + 20;
    }

    /**
     * Add recommendations
     * @param {Object} doc - PDF document
     * @param {Object} analytics - Analytics data
     * @param {number} yPosition - Y position
     */
    addRecommendations(doc, analytics, yPosition) {
        const overallYield = analytics.overallYield || 0;
        const recommendations = [];
        
        // Generate recommendations based on yield
        if (overallYield < 80) {
            recommendations.push('• Implement immediate yield improvement measures');
            recommendations.push('• Review and optimize test parameters');
            recommendations.push('• Investigate equipment calibration and maintenance');
        } else if (overallYield < 90) {
            recommendations.push('• Focus on process optimization');
            recommendations.push('• Analyze failure patterns for systematic issues');
            recommendations.push('• Consider test time optimization');
        } else {
            recommendations.push('• Maintain current process parameters');
            recommendations.push('• Continue monitoring for any yield degradation');
            recommendations.push('• Consider further process improvements for excellence');
        }
        
        // Add general recommendations
        recommendations.push('• Regular review of test results and trends');
        recommendations.push('• Continuous improvement of test procedures');
        recommendations.push('• Training for operators on new test procedures');
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Recommendations:', 20, yPosition);
        
        yPosition += 15;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        recommendations.forEach(rec => {
            doc.text(rec, 25, yPosition);
            yPosition += 8;
        });
        
        return yPosition + 10;
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

            // Store analytics data globally for access by other functions
            window.currentAnalytics = analytics;

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

        // Show the entire details section before populating it
        const detailsSection = document.getElementById('selected-lot-section');
        if (detailsSection) {
            detailsSection.classList.remove('hidden');
        } else {
            console.error('Could not find the main details section: #selected-lot-section');
        }

        // Use the globally stored analytics data
        if (window.currentAnalytics && window.currentAnalytics.testSequences) {
            const sequence = window.currentAnalytics.testSequences[lotNumber];

            if (sequence) {
                console.log('Found sequence for lot. Displaying details.', sequence);
                this.displaySequenceDetails(sequence);
            } else {
                console.error('Could not find sequence for lot:', lotNumber);
                this.displaySequenceDetails(null);
            }
        } else {
            console.error('No analytics data available for lot selection');
            this.displaySequenceDetails(null);
        }
    }

    /**
     * Display sequence details
     * @param {Object} sequence - Sequence data
     */
    displaySequenceDetails(sequence) {
        const detailsSection = document.getElementById('selected-lot-section');

        if (!sequence) {
            if (detailsSection) {
                detailsSection.classList.add('hidden');
            }
            return;
        }
        
        if (detailsSection) {
            detailsSection.classList.remove('hidden');
        }

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

        // Ensure equal heights for items in the same horizontal zone
        setTimeout(() => {
            this.ensureEqualHeights();
        }, 100);
    }

    /**
     * Ensure equal heights for items in the same horizontal zone
     */
    ensureEqualHeights() {
        // Zone 1: Lot Info, Test Summary, Quality Metrics
        const zone1Items = [
            document.getElementById('selected-lot-info'),
            document.getElementById('selected-lot-summary'),
            document.getElementById('selected-lot-quality')
        ].filter(item => item);

        if (zone1Items.length > 0) {
            const maxHeight = Math.max(...zone1Items.map(item => item.offsetHeight));
            zone1Items.forEach(item => {
                item.style.height = `${maxHeight}px`;
            });
        }

        // Zone 2: Re-test Flow, Failure Analysis
        const zone2Items = [
            document.getElementById('selected-lot-retest-flow'),
            document.getElementById('selected-lot-failure-analysis')
        ].filter(item => item);

        if (zone2Items.length > 0) {
            const maxHeight = Math.max(...zone2Items.map(item => item.offsetHeight));
            zone2Items.forEach(item => {
                item.style.height = `${maxHeight}px`;
            });
        }
    }

    /**
     * Display lot information
     * @param {Object} sequence - Sequence data
     * @param {Object} lotInfo - Lot info
     */
    displayLotInfo(sequence, lotInfo) {
        const lotInfoDiv = document.getElementById('selected-lot-info');
        if (!lotInfoDiv) return;

        const startDate = lotInfo.Start_time || lotInfo.Test_date || 'N/A';
        const operator = lotInfo.Operator_id || lotInfo.Operator || 'N/A';
        const lotSize = (lotInfo.Lot_Size || 0).toLocaleString();
        const deviceName = sequence.device || 'N/A';
        const finalYield = sequence.finalYield || 0;
        const yieldStatus = this.getYieldStatus(finalYield);
        const yieldColor = this.getYieldStatusColor(finalYield);

        lotInfoDiv.innerHTML = `
            <div class="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl border border-blue-200 shadow-sm">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-bold text-gray-800 flex items-center">
                        <span class="text-2xl mr-2">📋</span>
                        Lot Information
                    </h3>
                    <div class="text-right">
                        <div class="text-sm font-medium text-gray-600">Yield Status</div>
                        <div class="text-lg font-bold ${yieldColor}">${yieldStatus}</div>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 gap-4">
                    <div class="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-100">
                        <span class="font-semibold text-gray-700">Lot Number:</span>
                        <span class="font-bold text-blue-600 text-lg">${sequence.lotNumber}</span>
                    </div>
                    
                    <div class="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-100">
                        <span class="font-semibold text-gray-700">Device:</span>
                        <span class="font-bold text-gray-800">${deviceName}</span>
                    </div>
                    
                    <div class="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-100">
                        <span class="font-semibold text-gray-700">Lot Size:</span>
                        <span class="font-bold text-green-600">${lotSize}</span>
                    </div>
                    
                    <div class="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-100">
                        <span class="font-semibold text-gray-700">Test Date:</span>
                        <span class="font-medium text-gray-600">${startDate}</span>
                    </div>
                    
                    <div class="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-100">
                        <span class="font-semibold text-gray-700">Operator:</span>
                        <span class="font-medium text-gray-600">${operator}</span>
                    </div>
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

        const totalPass = sequence.totalPass || 0;
        const totalFail = sequence.totalFail || 0;
        const finalYield = sequence.finalYield || 0;
        const totalInput = sequence.totalInput || (totalPass + totalFail);
        const sigmaLevel = this.calculateSigmaLevel(finalYield);
        const cpk = this.calculateCpk(finalYield);

        summaryDiv.innerHTML = `
            <div class="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl border border-green-200 shadow-sm">
                <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <span class="text-2xl mr-2">📊</span>
                    Test Summary
                </h3>
                
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="bg-white p-4 rounded-lg border border-green-100 text-center">
                        <div class="text-2xl font-bold text-green-600 mb-1">${totalPass.toLocaleString()}</div>
                        <div class="text-sm font-medium text-gray-600">Pass</div>
                        <div class="text-xs text-gray-500 mt-1">${((totalPass / totalInput) * 100).toFixed(1)}%</div>
                    </div>
                    <div class="bg-white p-4 rounded-lg border border-green-100 text-center">
                        <div class="text-2xl font-bold text-red-600 mb-1">${totalFail.toLocaleString()}</div>
                        <div class="text-sm font-medium text-gray-600">Fail</div>
                        <div class="text-xs text-gray-500 mt-1">${((totalFail / totalInput) * 100).toFixed(1)}%</div>
                    </div>
                </div>
                
                <div class="bg-white p-4 rounded-lg border border-green-100">
                    <div class="text-center mb-3">
                        <div class="text-3xl font-bold text-blue-600 mb-1">${finalYield.toFixed(1)}%</div>
                        <div class="text-sm font-medium text-gray-600">Final Yield</div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3 text-xs">
                        <div class="flex justify-between">
                            <span class="font-medium text-gray-600">Sigma Level:</span>
                            <span class="font-bold text-purple-600">${sigmaLevel.toFixed(2)}σ</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="font-medium text-gray-600">Cpk:</span>
                            <span class="font-bold text-orange-600">${cpk.toFixed(2)}</span>
                        </div>
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
                <div class="mt-4 space-y-3">
                    <div class="text-sm font-semibold text-gray-700 mb-2">📋 Step-by-Step Flow:</div>
                    
                    <div class="bg-white p-3 rounded-lg border border-blue-100">
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-semibold text-blue-700">Primary Test (P1)</span>
                            <span class="text-sm font-medium text-gray-600">${p1Yield.toFixed(1)}% Yield</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span>Input: ${p1Input.toLocaleString()}</span>
                            <span class="text-green-600">Pass: ${p1Pass.toLocaleString()}</span>
                            <span class="text-red-600">Fail: ${p1Fail.toLocaleString()}</span>
                        </div>
                    </div>
                    
                    <div class="bg-white p-3 rounded-lg border border-purple-100">
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-semibold text-purple-700">1st Retest (R1)</span>
                            <span class="text-sm font-medium text-gray-600">${r1Yield.toFixed(1)}% Yield</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span>Input: ${r1Input.toLocaleString()}</span>
                            <span class="text-green-600">Pass: ${r1Pass.toLocaleString()}</span>
                            <span class="text-red-600">Fail: ${r1Fail.toLocaleString()}</span>
                        </div>
                    </div>
                    
                    <div class="bg-white p-3 rounded-lg border border-green-100">
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-semibold text-green-700">2nd Retest (R2)</span>
                            <span class="text-sm font-medium text-gray-600">${r2Yield.toFixed(1)}% Yield</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span>Input: ${r2Input.toLocaleString()}</span>
                            <span class="text-green-600">Pass: ${r2Pass.toLocaleString()}</span>
                            <span class="text-red-600">Fail: ${r2Fail.toLocaleString()}</span>
                        </div>
                    </div>
                    
                    <div class="bg-gradient-to-r from-blue-50 to-green-50 p-3 rounded-lg border border-blue-200">
                        <div class="grid grid-cols-3 gap-2 text-sm font-semibold">
                            <div class="text-center">
                                <div class="text-green-600">${totalPassFromFlow.toLocaleString()}</div>
                                <div class="text-xs text-gray-600">Total Pass</div>
                            </div>
                            <div class="text-center">
                                <div class="text-red-600">${finalFailFromFlow.toLocaleString()}</div>
                                <div class="text-xs text-gray-600">Final Fail</div>
                            </div>
                            <div class="text-center">
                                <div class="text-blue-600">${((totalPassFromFlow / p1Input) * 100).toFixed(1)}%</div>
                                <div class="text-xs text-gray-600">Final Yield</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        retestFlowDiv.innerHTML = `
            <div class="bg-gradient-to-br from-purple-50 to-indigo-100 p-6 rounded-xl border border-purple-200 shadow-sm">
                <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <span class="text-2xl mr-2">🔄</span>
                    Re-Test Flow Analysis
                </h3>
                
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="bg-white p-4 rounded-lg border border-purple-100">
                        <div class="text-sm font-semibold text-gray-600 mb-1">Test Sequence</div>
                        <div class="font-bold text-purple-700">${testSequence}</div>
                    </div>
                    <div class="bg-white p-4 rounded-lg border border-purple-100">
                        <div class="text-sm font-semibold text-gray-600 mb-1">Initial Size</div>
                        <div class="font-bold text-gray-800">${initialLotSize.toLocaleString()}</div>
                    </div>
                </div>
                
                <div class="grid grid-cols-3 gap-3 mb-4">
                    <div class="bg-white p-3 rounded-lg border border-purple-100 text-center">
                        <div class="text-sm font-semibold text-gray-600">Initial Yield</div>
                        <div class="text-lg font-bold text-gray-700">${initialYield.toFixed(1)}%</div>
                    </div>
                    <div class="bg-white p-3 rounded-lg border border-purple-100 text-center">
                        <div class="text-sm font-semibold text-gray-600">Final Yield</div>
                        <div class="text-lg font-bold text-blue-600">${finalYield.toFixed(1)}%</div>
                    </div>
                    <div class="bg-white p-3 rounded-lg border border-purple-100 text-center">
                        <div class="text-sm font-semibold text-gray-600">Improvement</div>
                        <div class="text-lg font-bold ${yieldImprovement >= 0 ? 'text-green-600' : 'text-red-600'}">${yieldImprovement >= 0 ? '+' : ''}${yieldImprovement.toFixed(1)}%</div>
                    </div>
                </div>
                
                ${stepDetails}
            </div>`;
    }

    /**
     * Display quality metrics
     * @param {Object} analytics - Analytics data
     */
    displayQualityMetrics(analytics) {
        const qualityDiv = document.getElementById('selected-lot-quality');
        if (!qualityDiv) return;

        // Get sequence data from current analytics
        const currentLot = this.getCurrentSelectedLot();
        if (!currentLot) return;

        const sequence = currentLot;
        const finalYield = sequence.finalYield || 0;
        
        // Calculate quality metrics
        const sigmaLevel = this.calculateSigmaLevel(finalYield);
        const cpk = this.calculateCpk(finalYield);
        const qualityScore = this.calculateQualityScore(finalYield, sigmaLevel, cpk);
        
        // Get status and colors
        const yieldStatus = this.getYieldStatus(finalYield);
        const yieldColor = this.getYieldStatusColor(finalYield);
        const processCapability = this.getProcessCapability(cpk);
        const processColor = this.getProcessCapabilityColor(cpk);
        
        qualityDiv.innerHTML = `
            <div class="bg-gradient-to-br from-orange-50 to-amber-100 p-6 rounded-xl border border-orange-200 shadow-sm">
                <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <span class="text-2xl mr-2">🏅</span>
                    Quality Metrics
                </h3>
                
                <div class="space-y-4">
                    <div class="bg-white p-4 rounded-lg border border-orange-100">
                        <div class="text-center mb-3">
                            <div class="text-2xl font-bold text-orange-600 mb-1">${qualityScore.toFixed(1)}</div>
                            <div class="text-sm font-medium text-gray-600">Quality Score</div>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-gradient-to-r from-orange-400 to-amber-500 h-2 rounded-full" style="width: ${qualityScore}%"></div>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3">
                        <div class="bg-white p-3 rounded-lg border border-orange-100 text-center">
                            <div class="text-sm font-semibold text-gray-600 mb-1">Sigma Level</div>
                            <div class="text-lg font-bold text-purple-600">${sigmaLevel.toFixed(2)}σ</div>
                        </div>
                        <div class="bg-white p-3 rounded-lg border border-orange-100 text-center">
                            <div class="text-sm font-semibold text-gray-600 mb-1">Cpk</div>
                            <div class="text-lg font-bold text-blue-600">${cpk.toFixed(2)}</div>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 gap-2">
                        <div class="bg-white p-3 rounded-lg border border-orange-100">
                            <div class="flex justify-between items-center">
                                <span class="font-semibold text-gray-700">Yield Status:</span>
                                <span class="font-bold ${yieldColor}">${yieldStatus}</span>
                            </div>
                        </div>
                        <div class="bg-white p-3 rounded-lg border border-orange-100">
                            <div class="flex justify-between items-center">
                                <span class="font-semibold text-gray-700">Process Capability:</span>
                                <span class="font-bold ${processColor}">${processCapability}</span>
                            </div>
                        </div>
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

        // Get sequence data from current analytics
        const currentLot = this.getCurrentSelectedLot();
        if (!currentLot) return;

        const sequence = currentLot;
        const tests = sequence.tests || [];
        
        // Analyze failure patterns
        const failureAnalysis = this.analyzeFailurePatterns(tests);
        
        // Get site-specific issues if available
        const siteIssues = failureAnalysis.siteIssues || {};
        const siteDetails = Object.entries(siteIssues).map(([site, count]) => 
            `${site}(${count})`
        ).join(', ');
        
        failureDiv.innerHTML = `
            <div class="bg-gradient-to-br from-red-50 to-pink-100 p-6 rounded-xl border border-red-200 shadow-sm">
                <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <span class="text-2xl mr-2">🔬</span>
                    Failure Analysis
                </h3>
                
                <div class="space-y-4">
                    ${failureAnalysis.potentialCauses.length > 0 ? `
                        <div class="bg-white p-4 rounded-lg border border-red-100">
                            <div class="font-semibold text-gray-700 mb-3 flex items-center">
                                <span class="text-lg mr-2">🎯</span>
                                Potential Root Causes
                            </div>
                            <ul class="space-y-2">
                                ${failureAnalysis.potentialCauses.slice(0, 5).map(cause => 
                                    `<li class="flex items-start">
                                        <span class="text-red-500 mr-2 mt-1">•</span>
                                        <span class="text-sm text-gray-700">${cause}</span>
                                    </li>`
                                ).join('')}
                                ${failureAnalysis.potentialCauses.length > 5 ? 
                                    `<li class="text-sm text-gray-500 italic">... and ${failureAnalysis.potentialCauses.length - 5} more causes</li>` : ''}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${Object.keys(failureAnalysis.categories).length > 0 ? `
                        <div class="bg-white p-4 rounded-lg border border-red-100">
                            <div class="font-semibold text-gray-700 mb-3 flex items-center">
                                <span class="text-lg mr-2">📊</span>
                                Failure Categories
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                ${Object.entries(failureAnalysis.categories).map(([category, count]) => 
                                    `<div class="flex justify-between items-center p-2 bg-gray-50 rounded">
                                        <span class="text-sm font-medium text-gray-700">${category}:</span>
                                        <span class="font-bold text-red-600">${count} failures</span>
                                    </div>`
                                ).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${siteDetails ? `
                        <div class="bg-white p-4 rounded-lg border border-red-100">
                            <div class="font-semibold text-gray-700 mb-2 flex items-center">
                                <span class="text-lg mr-2">🏭</span>
                                Site-specific Issues
                            </div>
                            <div class="text-sm text-gray-700 bg-gray-50 p-3 rounded">${siteDetails}</div>
                        </div>
                    ` : ''}
                    
                    ${failureAnalysis.recommendations.length > 0 ? `
                        <div class="bg-white p-4 rounded-lg border border-red-100">
                            <div class="font-semibold text-gray-700 mb-3 flex items-center">
                                <span class="text-lg mr-2">💡</span>
                                Recommendations
                            </div>
                            <ul class="space-y-2">
                                ${failureAnalysis.recommendations.slice(0, 3).map(rec => 
                                    `<li class="flex items-start">
                                        <span class="text-blue-500 mr-2 mt-1">•</span>
                                        <span class="text-sm text-gray-700">${rec}</span>
                                    </li>`
                                ).join('')}
                                ${failureAnalysis.recommendations.length > 3 ? 
                                    `<li class="text-sm text-gray-500 italic">... and ${failureAnalysis.recommendations.length - 3} more recommendations</li>` : ''}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            </div>`;
    }

    /**
     * Get currently selected lot data
     * @returns {Object|null} Selected lot sequence data
     */
    getCurrentSelectedLot() {
        if (!window.currentAnalytics || !window.currentAnalytics.testSequences) return null;
        
        // Find the currently selected lot (highlighted row)
        const selectedRow = document.querySelector('.lot-row.bg-blue-100');
        if (!selectedRow) return null;
        
        const lotNumber = selectedRow.getAttribute('data-lot');
        return window.currentAnalytics.testSequences[lotNumber] || null;
    }

    /**
     * Calculate sigma level from yield
     */
    calculateSigmaLevel(yieldValue) {
        // Convert yield percentage to sigma level
        const defectRate = (100 - yieldValue) / 100;
        if (defectRate === 0) return 6.0;
        if (defectRate >= 1) return 0.0;
        
        // Approximate sigma calculation
        const z = Math.abs(this.inverseNormalCDF(defectRate));
        return z;
    }

    /**
     * Calculate Cpk from yield
     */
    calculateCpk(yieldValue) {
        // Simplified Cpk calculation based on yield
        const sigmaLevel = this.calculateSigmaLevel(yieldValue);
        return Math.max(0, (sigmaLevel - 1.5) / 3);
    }

    /**
     * Calculate quality score
     */
    calculateQualityScore(yieldValue, sigmaLevel, cpk) {
        const yieldScore = yieldValue * 0.4; // 40% weight
        const sigmaScore = Math.min(100, sigmaLevel * 16.67); // 40% weight
        const cpkScore = Math.min(100, cpk * 100); // 20% weight
        
        return yieldScore + sigmaScore + cpkScore;
    }

    /**
     * Get yield status
     */
    getYieldStatus(yieldValue) {
        if (yieldValue >= 99) return 'Excellent';
        if (yieldValue >= 95) return 'Good';
        if (yieldValue >= 90) return 'Fair';
        if (yieldValue >= 80) return 'Poor';
        return 'Critical';
    }

    /**
     * Get yield status color
     */
    getYieldStatusColor(yieldValue) {
        if (yieldValue >= 99) return 'text-green-600';
        if (yieldValue >= 95) return 'text-blue-600';
        if (yieldValue >= 90) return 'text-yellow-600';
        if (yieldValue >= 80) return 'text-orange-600';
        return 'text-red-600';
    }

    /**
     * Get process capability
     */
    getProcessCapability(cpk) {
        if (cpk >= 1.67) return 'Excellent';
        if (cpk >= 1.33) return 'Good';
        if (cpk >= 1.0) return 'Marginal';
        return 'Poor';
    }

    /**
     * Get process capability color
     */
    getProcessCapabilityColor(cpk) {
        if (cpk >= 1.67) return 'text-green-600';
        if (cpk >= 1.33) return 'text-blue-600';
        if (cpk >= 1.0) return 'text-yellow-600';
        return 'text-red-600';
    }

    /**
     * Analyze failure patterns
     */
    analyzeFailurePatterns(tests) {
        const analysis = {
            potentialCauses: [],
            categories: {},
            recommendations: []
        };

        // Get detailed test results from the first test
        const testResults = tests[0]?.data?.testResults || [];
        
        // Analyze failure patterns based on actual test data
        if (testResults.length > 0) {
            const failResults = testResults.filter(test => {
                // Soft Bin 1은 PASS, 나머지는 모두 FAIL
                const isSoftBin1 = test.softBin === 1 || test.description === 'PASS' || test.description === '1';
                // 실제 FAIL 카운트가 0보다 큰 테스트만 표시
                return !isSoftBin1 && test.result === 'FAIL' && (test.total || 0) > 0;
            });
            
            // Categorize failures by test type
            const failureCategories = {
                'USB Tests': 0,
                'Function Tests': 0,
                'Power Tests': 0,
                'Memory Tests': 0,
                'ADC Tests': 0,
                'Other Tests': 0
            };
            
            failResults.forEach(test => {
                const testName = test.description || '';
                if (testName.includes('USB') || testName.includes('FT_USB')) {
                    failureCategories['USB Tests'] += test.total || 0;
                } else if (testName.includes('FUNCTION_')) {
                    failureCategories['Function Tests'] += test.total || 0;
                } else if (testName.includes('PWR_') || testName.includes('POWER')) {
                    failureCategories['Power Tests'] += test.total || 0;
                } else if (testName.includes('RAM') || testName.includes('ROM') || testName.includes('M7') || testName.includes('M5')) {
                    failureCategories['Memory Tests'] += test.total || 0;
                } else if (testName.includes('ADC')) {
                    failureCategories['ADC Tests'] += test.total || 0;
                } else {
                    failureCategories['Other Tests'] += test.total || 0;
                }
            });
            
            analysis.categories = failureCategories;
            
            // Find top failure tests
            const topFailures = failResults
                .filter(test => (test.total || 0) > 0)
                .sort((a, b) => (b.total || 0) - (a.total || 0))
                .slice(0, 5);
            
            // Generate potential causes based on top failures
            topFailures.forEach(test => {
                const testName = test.description || '';
                const failCount = test.total || 0;
                
                if (testName.includes('FUNCTION_VOH')) {
                    analysis.potentialCauses.push(`Voltage output high (VOH) issues - ${failCount} failures`);
                    analysis.recommendations.push('Check voltage regulation and output buffer circuits');
                } else if (testName.includes('FUNCTION_VOL')) {
                    analysis.potentialCauses.push(`Voltage output low (VOL) issues - ${failCount} failures`);
                    analysis.recommendations.push('Review output driver design and load conditions');
                } else if (testName.includes('USB_test')) {
                    analysis.potentialCauses.push(`USB interface test failures - ${failCount} failures`);
                    analysis.recommendations.push('Verify USB PHY configuration and signal integrity');
                } else if (testName.includes('USB_HSchirp')) {
                    analysis.potentialCauses.push(`USB high-speed chirp failures - ${failCount} failures`);
                    analysis.recommendations.push('Check USB high-speed timing and termination');
                } else if (testName.includes('RAM') || testName.includes('ROM')) {
                    analysis.potentialCauses.push(`Memory test failures - ${failCount} failures`);
                    analysis.recommendations.push('Verify memory interface timing and power supply');
                } else if (testName.includes('ADC')) {
                    analysis.potentialCauses.push(`ADC performance issues - ${failCount} failures`);
                    analysis.recommendations.push('Check ADC reference voltage and analog signal path');
                } else if (testName.includes('PWR_SHORT')) {
                    analysis.potentialCauses.push(`Power short circuit detection - ${failCount} failures`);
                    analysis.recommendations.push('Investigate power supply and protection circuits');
                } else {
                    analysis.potentialCauses.push(`${testName} - ${failCount} failures`);
                    analysis.recommendations.push('Review test conditions and device specifications');
                }
            });
            
            // Add general recommendations based on failure patterns
            if (failureCategories['USB Tests'] > 0) {
                analysis.recommendations.push('Focus on USB interface design and signal integrity');
            }
            if (failureCategories['Function Tests'] > 0) {
                analysis.recommendations.push('Review voltage levels and timing specifications');
            }
            if (failureCategories['Power Tests'] > 0) {
                analysis.recommendations.push('Check power supply stability and protection circuits');
            }
            
            // Site-specific analysis
            const siteFailures = {1: 0, 2: 0, 3: 0, 4: 0};
            failResults.forEach(test => {
                [1, 2, 3, 4].forEach(site => {
                    siteFailures[site] += test.sites[site] || 0;
                });
            });
            
            const maxSiteFailures = Math.max(...Object.values(siteFailures));
            const problematicSites = Object.entries(siteFailures)
                .filter(([site, count]) => count > 0)
                .sort(([,a], [,b]) => b - a);
            
            if (problematicSites.length > 0) {
                analysis.potentialCauses.push(`Site-specific issues: ${problematicSites.map(([site, count]) => `Site${site}(${count})`).join(', ')}`);
                analysis.recommendations.push('Check test equipment calibration and site-specific conditions');
            }
        } else {
            // Fallback analysis for tests without detailed results
            tests.forEach(test => {
                if (test.yield < 80) {
                    if (test.testType === 'P1') {
                        analysis.potentialCauses.push('Initial process issues');
                        analysis.recommendations.push('Review initial process parameters');
                    } else if (test.testType === 'R1') {
                        analysis.potentialCauses.push('First retest failures');
                        analysis.recommendations.push('Investigate retest conditions');
                    } else if (test.testType === 'R2') {
                        analysis.potentialCauses.push('Multiple retest failures');
                        analysis.recommendations.push('Consider process optimization');
                    }
                }
            });
            
            analysis.categories = {
                'Process Issues': tests.filter(t => t.yield < 80).length,
                'Test Equipment': 0,
                'Environmental': 0,
                'Material Issues': 0
            };
        }
        
        // Add default recommendations if none found
        if (analysis.recommendations.length === 0) {
            analysis.recommendations.push('Review test conditions and parameters');
            analysis.recommendations.push('Check equipment calibration');
            analysis.recommendations.push('Verify environmental conditions');
        }
        
        return analysis;
    }

    /**
     * Inverse normal CDF approximation
     */
    inverseNormalCDF(p) {
        // Simplified approximation for normal CDF inverse
        if (p <= 0 || p >= 1) return 0;
        if (p < 0.5) return -this.inverseNormalCDF(1 - p);
        
        const t = Math.sqrt(-2 * Math.log(1 - p));
        const c0 = 2.515517;
        const c1 = 0.802853;
        const c2 = 0.010328;
        const d1 = 1.432788;
        const d2 = 0.189269;
        const d3 = 0.001308;
        
        return t - (c0 + c1 * t + c2 * t * t) / (1 + d1 * t + d2 * t * t + d3 * t * t * t);
    }

    /**
     * Display test results table with detailed analysis
     * @param {Object} sequence - Test sequence object
     * @param {Object} analytics - Analytics data
     */
    displayTestResultsTable(sequence, analytics) {
        const tabsContainer = document.getElementById('test-stage-tabs');
        const resultsContainer = document.getElementById('test-results-container');
        if (!tabsContainer || !resultsContainer) return;

        // Get test results from all tests in the sequence
        const tests = sequence.tests || [];
        console.log(`Displaying test results for ${sequence.lotNumber}:`, tests);
        console.log('Sequence object:', sequence);
        console.log('Tests array:', tests);
        
        if (tests.length > 0) {
            // Clear previous content
            tabsContainer.innerHTML = '';
            resultsContainer.innerHTML = '';
            
            // Create tabs and tables for each test stage
            tests.forEach((test, index) => {
                console.log(`Processing test ${index}:`, test);
                const testResults = test.data?.testResults || [];
                const stageName = test.testType || `Stage ${index + 1}`;
                const stageId = `stage-${index}`;
                const stageColor = test.testType === 'P1' ? 'border-blue-500 text-blue-600' : 
                                  test.testType === 'R1' ? 'border-green-500 text-green-600' : 
                                  test.testType === 'R2' ? 'border-purple-500 text-purple-600' : 
                                  'border-gray-500 text-gray-600';
                
                console.log(`Creating tab for ${stageName} with color ${stageColor}`);
                
                // Create tab
                const tab = document.createElement('button');
                tab.className = `py-2 px-1 border-b-2 font-medium text-sm ${index === 0 ? stageColor : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`;
                tab.textContent = `${stageName} (${test.inputCount?.toLocaleString() || 0} → ${test.passCount?.toLocaleString() || 0}P/${test.failCount?.toLocaleString() || 0}F)`;
                tab.onclick = () => this.switchTestStage(index);
                tabsContainer.appendChild(tab);
                
                console.log(`Tab created: ${tab.textContent}`);
                
                // Create table container
                const tableContainer = document.createElement('div');
                tableContainer.id = `table-${stageId}`;
                tableContainer.className = `test-stage-table ${index === 0 ? '' : 'hidden'}`;
                
                // Create table
                const table = document.createElement('table');
                table.className = 'w-full text-sm text-left';
                
                // Create table header
                const thead = document.createElement('thead');
                thead.className = 'bg-slate-100 text-xs uppercase sticky top-0';
                thead.innerHTML = `
                    <tr>
                        <th class="px-2 py-2">Test</th>
                        <th class="px-2 py-2">Result</th>
                        <th class="px-2 py-2">Total</th>
                        <th class="px-2 py-2">Site1</th>
                        <th class="px-2 py-2">Site2</th>
                        <th class="px-2 py-2">Site3</th>
                        <th class="px-2 py-2">Site4</th>
                    </tr>
                `;
                table.appendChild(thead);
                
                // Create table body
                const tbody = document.createElement('tbody');
                
                if (testResults.length > 0) {
                    // Add stage header
                    const stageHeader = document.createElement('tr');
                    stageHeader.className = 'border-t-2 border-gray-300 bg-blue-50';
                    stageHeader.innerHTML = `
                        <td class="p-2 text-xs font-bold text-center" colspan="7">
                            📋 ${stageName} - Input: ${test.inputCount?.toLocaleString() || 0}, 
                            Pass: ${test.passCount?.toLocaleString() || 0}, 
                            Fail: ${test.failCount?.toLocaleString() || 0}, 
                            Yield: ${test.yield?.toFixed(1) || 0}%
                        </td>
                    `;
                    tbody.appendChild(stageHeader);
                    
                    // Show FAIL results first
                    const failResults = testResults.filter(test => {
                        // Soft Bin 1은 PASS, 나머지는 모두 FAIL
                        const isSoftBin1 = test.softBin === 1 || test.description === 'PASS' || test.description === '1';
                        // 실제 FAIL 카운트가 0보다 큰 테스트만 표시
                        return !isSoftBin1 && test.result === 'FAIL' && (test.total || 0) > 0;
                    });
                    
                    if (failResults.length > 0) {
                        const failHeader = document.createElement('tr');
                        failHeader.className = 'border-t border-red-200 bg-red-50';
                        failHeader.innerHTML = `
                            <td class="p-2 text-xs font-medium text-red-700" colspan="7">
                                ❌ FAIL Results (${failResults.length} tests)
                            </td>
                        `;
                        tbody.appendChild(failHeader);
                        
                        failResults.forEach(test => {
                            const row = document.createElement('tr');
                            row.className = 'border-t hover:bg-gray-50';
                            
                            // 테스트 이름과 Soft Bin/Hard Bin 정보 구성
                            let displayName = test.description;
                            let binInfo = '';
                            
                            // Soft Bin과 Hard Bin 정보 추가
                            if (test.softBin && test.hardBin) {
                                binInfo = `Soft Bin=${test.softBin}, Hard bin=${test.hardBin}`;
                            } else if (test.softBin) {
                                binInfo = `Soft Bin=${test.softBin}`;
                            }
                            
                            // 테스트 이름이 숫자인 경우 (Soft Bin 번호) 실제 테스트 이름으로 매핑
                            if (/^\d+$/.test(test.description)) {
                                const testName = this.getTestNameFromSoftBin(parseInt(test.description, 10));
                                displayName = testName || `Soft Bin ${test.description}`;
                            }
                            
                            // 최종 표시 이름 구성
                            const finalDisplayName = binInfo ? `${displayName}: ${binInfo}` : displayName;
                            
                            row.innerHTML = `
                                <td class="p-2 text-xs font-medium">${finalDisplayName}</td>
                                <td class="p-2 text-center">
                                    <span class="px-2 py-1 rounded text-xs font-medium text-red-600 bg-red-50">FAIL</span>
                                </td>
                                <td class="p-2 text-center font-medium">${test.total}</td>
                                ${[1, 2, 3, 4].map(siteNum => {
                                    const siteValue = test.sites[siteNum] || 0;
                                    const siteColor = siteValue > 0 ? 'text-blue-600' : 'text-gray-400';
                                    return `<td class="p-2 text-center text-xs ${siteColor}">${siteValue}</td>`;
                                }).join('')}
                            `;
                            tbody.appendChild(row);
                        });
                    }
                    
                    // Show PASS results (only Soft Bin 1)
                    const passResults = testResults.filter(test => {
                        // Soft Bin 1만 PASS로 표시
                        const isSoftBin1 = test.softBin === 1 || test.description === 'PASS' || test.description === '1';
                        return isSoftBin1 && test.result === 'PASS';
                    });
                    
                    if (passResults.length > 0) {
                        const passHeader = document.createElement('tr');
                        passHeader.className = 'border-t border-green-200 bg-green-50';
                        passHeader.innerHTML = `
                            <td class="p-2 text-xs font-medium text-green-700" colspan="7">
                                ✅ PASS Results (Soft Bin 1 - 1 test)
                            </td>
                        `;
                        tbody.appendChild(passHeader);
                        
                        // Use actual pass count from test data if available
                        const actualPassCount = test.passCount || passResults.reduce((sum, result) => sum + (result.total || 0), 0);
                        const actualPassSite1 = Math.floor(actualPassCount / 4);
                        const actualPassSite2 = Math.floor(actualPassCount / 4);
                        const actualPassSite3 = Math.floor(actualPassCount / 4);
                        const actualPassSite4 = actualPassCount - (actualPassSite1 + actualPassSite2 + actualPassSite3);
                        
                        // 첫 번째 PASS 결과를 기준으로 표시
                        const firstPassResult = passResults[0];
                        
                        const row = document.createElement('tr');
                        row.className = 'border-t hover:bg-gray-50';
                        
                        // Soft Bin과 Hard Bin 정보 추가
                        let binInfo = '';
                        if (firstPassResult.softBin && firstPassResult.hardBin) {
                            binInfo = `Soft Bin=${firstPassResult.softBin}, Hard bin=${firstPassResult.hardBin}`;
                        } else if (firstPassResult.softBin) {
                            binInfo = `Soft Bin=${firstPassResult.softBin}`;
                        }
                        
                        const displayName = binInfo ? `Soft Bin 1 (PASS): ${binInfo}` : 'Soft Bin 1 (PASS)';
                        
                        row.innerHTML = `
                            <td class="p-2 text-xs font-medium">${displayName}</td>
                            <td class="p-2 text-center">
                                <span class="px-2 py-1 rounded text-xs font-medium text-green-600 bg-green-50">PASS</span>
                            </td>
                            <td class="p-2 text-center font-medium">${actualPassCount}</td>
                            <td class="p-2 text-center text-xs text-blue-600">${actualPassSite1}</td>
                            <td class="p-2 text-center text-xs text-blue-600">${actualPassSite2}</td>
                            <td class="p-2 text-center text-xs text-blue-600">${actualPassSite3}</td>
                            <td class="p-2 text-center text-xs text-blue-600">${actualPassSite4}</td>
                        `;
                        tbody.appendChild(row);
                    }
                    
                    // Add stage summary
                    const maxSoftBin = test.data?.metadata?.maxSoftBin || Math.max(...testResults.map(t => t.softBin || 1), 1);
                    const totalTests = maxSoftBin; // Total Soft Bins (1 to maxSoftBin)
                    const totalFail = failResults.length;
                    const totalPass = 1; // Always 1 for Soft Bin 1
                    const totalFailCount = failResults.reduce((sum, test) => sum + (test.total || 0), 0);
                    
                    // Calculate total devices (should match lot size)
                    const actualPassCount = test.passCount || passResults.reduce((sum, result) => sum + (result.total || 0), 0);
                    const totalDevices = actualPassCount + totalFailCount;
                    
                    // Use actual lot size if available
                    const actualLotSize = test.inputCount || totalDevices;
                    
                    // Calculate actual fail count from test data
                    const actualFailCount = test.failCount || totalFailCount;
                    
                    const summaryRow = document.createElement('tr');
                    summaryRow.className = 'border-t bg-gray-50 font-medium';
                    summaryRow.innerHTML = `
                        <td class="p-2 text-xs">${stageName} SUMMARY</td>
                        <td class="p-2 text-center">
                            <span class="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">${totalTests} Soft Bins</span>
                        </td>
                        <td class="p-2 text-center">${actualLotSize.toLocaleString()}</td>
                        <td class="p-2 text-center text-xs text-gray-600" colspan="4">
                            PASS: ${totalPass} Soft Bin (${actualPassCount.toLocaleString()}) | 
                            FAIL: ${totalFail} Soft Bins (${actualFailCount.toLocaleString()})
                        </td>
                    `;
                    tbody.appendChild(summaryRow);
                    
                    // Add Pareto Analysis section
                    if (failResults.length > 0) {
                        this.addParetoAnalysisSection(tbody, failResults, stageName, actualFailCount);
                    }
                } else {
                    const noDataRow = document.createElement('tr');
                    noDataRow.innerHTML = `
                        <td colspan="7" class="p-4 text-center text-gray-500">No test data available for this stage.</td>
                    `;
                    tbody.appendChild(noDataRow);
                }
                
                table.appendChild(tbody);
                
                // Create scrollable container
                const scrollContainer = document.createElement('div');
                scrollContainer.className = 'border rounded';
                scrollContainer.appendChild(table);
                
                tableContainer.appendChild(scrollContainer);
                resultsContainer.appendChild(tableContainer);
            });
            
            // Add overall summary
            const overallPass = tests.reduce((sum, test) => sum + (test.passCount || 0), 0);
            const overallFail = tests.reduce((sum, test) => sum + (test.failCount || 0), 0);
            const overallTotal = overallPass + overallFail;
            
            // Calculate total stages and devices
            const totalStages = tests.length;
            const totalDevices = tests.reduce((sum, test) => sum + (test.inputCount || 0), 0);
            
            const overallSummary = document.createElement('div');
            overallSummary.className = 'mt-4 p-3 bg-gray-100 rounded border-t-2 border-gray-400';
            overallSummary.innerHTML = `
                <div class="text-sm font-bold text-gray-700">
                    📊 OVERALL SUMMARY: ${totalStages} Stages | Total Devices: ${totalDevices.toLocaleString()} | 
                    Final PASS: ${overallPass.toLocaleString()} | Final FAIL: ${overallFail.toLocaleString()} | 
                    Final Yield: ${((overallPass / (overallPass + overallFail)) * 100).toFixed(1)}%
                </div>
            `;
            resultsContainer.appendChild(overallSummary);
            
        } else {
            resultsContainer.innerHTML = `<div class="p-4 text-center text-gray-500">No detailed test data available for this lot.</div>`;
        }
    }

    /**
     * Switch between test stages
     * @param {number} stageIndex - Index of the stage to show
     */
    switchTestStage(stageIndex) {
        // Update tab styles
        const tabs = document.querySelectorAll('#test-stage-tabs button');
        const tables = document.querySelectorAll('.test-stage-table');
        
        tabs.forEach((tab, index) => {
            if (index === stageIndex) {
                tab.classList.remove('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
                tab.classList.add('border-blue-500', 'text-blue-600');
            } else {
                tab.classList.remove('border-blue-500', 'text-blue-600');
                tab.classList.add('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
            }
        });
        
        // Show/hide tables
        tables.forEach((table, index) => {
            if (index === stageIndex) {
                table.classList.remove('hidden');
            } else {
                table.classList.add('hidden');
            }
        });
    }

    /**
     * Display enhanced analytics
     * @param {Object} analytics - Analytics data
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

        // Access enhanced analytics data from the correct location
        const enhancedData = analytics.enhancedAnalytics || analytics;
        
        if (hasMultipleLots && enhancedData.yieldTrend && enhancedData.yieldTrend.average > 0) {
            const trend = enhancedData.yieldTrend;
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

        // Access enhanced analytics data from the correct location
        const enhancedData = analytics.enhancedAnalytics || analytics;
        
        if (hasTestResults && enhancedData.failurePatterns && enhancedData.failurePatterns.topPatterns && enhancedData.failurePatterns.topPatterns.length > 0) {
            const patterns = enhancedData.failurePatterns.topPatterns;
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

        // Access enhanced analytics data from the correct location
        const enhancedData = analytics.enhancedAnalytics || analytics;
        
        if (hasTestResults && enhancedData.sitePerformance && enhancedData.sitePerformance.distribution && Object.keys(enhancedData.sitePerformance.distribution).length > 0) {
            const distribution = enhancedData.sitePerformance.distribution;
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

        // Access enhanced analytics data from the correct location
        const enhancedData = analytics.enhancedAnalytics || analytics;
        
        if (hasTestResults && enhancedData.failureCorrelations && enhancedData.failureCorrelations.correlations && enhancedData.failureCorrelations.correlations.length > 0) {
            const correlations = enhancedData.failureCorrelations.correlations;
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

    /**
     * Get Soft Bin number for test description
     * @param {string} testDescription - Test description
     * @returns {string} Soft Bin number
     */
    getSoftBinNumber(testDescription) {
        const softBinMapping = {
            'OSN_TEST': 'Soft Bin 2',
            'OSP_TEST': 'Soft Bin 2', 
            'PWR_SHORT_TEST': 'Soft Bin 2',
            'FUNCTION_VIL_MIN': 'Soft Bin 3',
            'FUNCTION_VIL_MAX': 'Soft Bin 3',
            'FUNCTION_VIH_MIN': 'Soft Bin 3',
            'FUNCTION_VIH_MAX': 'Soft Bin 3',
            'FUNCTION_VOH1_1_MIN': 'Soft Bin 3',
            'FUNCTION_VOH1_1_MAX': 'Soft Bin 3',
            'FUNCTION_VOH1_2_MIN': 'Soft Bin 3',
            'FUNCTION_VOH1_2_MAX': 'Soft Bin 3',
            'FUNCTION_VOH2_1_MIN': 'Soft Bin 3',
            'FUNCTION_VOH2_1_MAX': 'Soft Bin 3',
            'FUNCTION_VOH2_2_MIN': 'Soft Bin 3',
            'FUNCTION_VOH2_2_MAX': 'Soft Bin 3',
            'FUNCTION_VOH3_MIN': 'Soft Bin 3',
            'FUNCTION_VOH3_MAX': 'Soft Bin 3',
            'FUNCTION_VOH4_MIN': 'Soft Bin 3',
            'FUNCTION_VOH4_MAX': 'Soft Bin 3',
            'FUNCTION_VOH5_MIN': 'Soft Bin 3',
            'FUNCTION_VOH5_MAX': 'Soft Bin 3',
            'FUNCTION_VOL1_1_MIN': 'Soft Bin 3',
            'FUNCTION_VOL1_1_MAX': 'Soft Bin 3',
            'FUNCTION_VOL1_2_MIN': 'Soft Bin 3',
            'FUNCTION_VOL1_2_MAX': 'Soft Bin 3',
            'FUNCTION_VOL2_1_MIN': 'Soft Bin 3',
            'FUNCTION_VOL2_1_MAX': 'Soft Bin 3',
            'FUNCTION_VOL2_2_MIN': 'Soft Bin 3',
            'FUNCTION_VOL2_2_MAX': 'Soft Bin 3',
            'FUNCTION_VOL3_MIN': 'Soft Bin 3',
            'FUNCTION_VOL3_MAX': 'Soft Bin 3',
            'FUNCTION_VOL4_MIN': 'Soft Bin 3',
            'FUNCTION_VOL4_MAX': 'Soft Bin 3',
            'FUNCTION_VOL5_MIN': 'Soft Bin 3',
            'FUNCTION_VOL5_MAX': 'Soft Bin 3',
            'FT_M5_SSA_MIN': 'Soft Bin 5',
            'FT_M5_OCC_MIN': 'Soft Bin 5',
            'FT_M5_SSA_MAX': 'Soft Bin 5',
            'FT_M5_OCC_MAX': 'Soft Bin 5',
            'FT_USB_SSA_MIN': 'Soft Bin 4',
            'FT_USB_SSA_MAX': 'Soft Bin 4',
            'FT_USB_FS_BIST_MIN': 'Soft Bin 4',
            'FT_USB_FS_BIST_MAX': 'Soft Bin 4',
            'FT_USB_HS_BIST_MIN': 'Soft Bin 4',
            'FT_USB_HS_BIST_MAX': 'Soft Bin 4',
            'FT_USB_LS_BIST_MIN': 'Soft Bin 4',
            'FT_USB_LS_BIST_MAX': 'Soft Bin 4',
            'FT_USB_HSBIST_LOWSWING_MIN': 'Soft Bin 4',
            'FT_USB_HSBIST_LOWSWING_MAX': 'Soft Bin 4',
            'FT_ADC150_MIN_INL_DLE': 'Soft Bin 4',
            'FT_ADC150_MAX_INL_DLE': 'Soft Bin 4',
            'FT_ADC150_MIN_AC': 'Soft Bin 4',
            'FT_ADC150_MAX_AC': 'Soft Bin 4',
            'FT_ADC150_MIN_SNDR_1': 'Soft Bin 4',
            'FT_ADC150_MIN_SNDR_2': 'Soft Bin 4',
            'FT_ADC150_MIN_SNDR_3': 'Soft Bin 4',
            'FT_ADC150_MIN_SNDR_4': 'Soft Bin 4',
            'FT_ADC150_MIN_SNDR_5': 'Soft Bin 4',
            'FT_ADC150_MIN_SNDR_6': 'Soft Bin 4',
            'FT_ADC150_MIN_SNDR_7': 'Soft Bin 4',
            'FT_SOC_STBY_TEST': 'Soft Bin 6',
            'FT_DEVICE_ID_TEST': 'Soft Bin 5',
            'OVERRIDE_CHECK': 'Soft Bin 6'
        };
        
        return softBinMapping[testDescription] || '';
    }

    /**
     * Get test name from Soft Bin number
     * @param {number} softBinNumber - Soft Bin number
     * @returns {string} Test name
     */
    getTestNameFromSoftBin(softBinNumber) {
        const testNameMapping = {
            2: 'OSN_TEST, OSP_TEST, PWR_SHORT_TEST',
            3: 'FUNCTION_VIL_MIN, FUNCTION_VIL_MAX, FUNCTION_VIH_MIN, FUNCTION_VIH_MAX, FUNCTION_VOH1_1_MIN, FUNCTION_VOH1_1_MAX, FUNCTION_VOH1_2_MIN, FUNCTION_VOH1_2_MAX, FUNCTION_VOH2_1_MIN, FUNCTION_VOH2_1_MAX, FUNCTION_VOH2_2_MIN, FUNCTION_VOH2_2_MAX, FUNCTION_VOH3_MIN, FUNCTION_VOH3_MAX, FUNCTION_VOH4_MIN, FUNCTION_VOH4_MAX, FUNCTION_VOH5_MIN, FUNCTION_VOH5_MAX, FUNCTION_VOL1_1_MIN, FUNCTION_VOL1_1_MAX, FUNCTION_VOL1_2_MIN, FUNCTION_VOL1_2_MAX, FUNCTION_VOL2_1_MIN, FUNCTION_VOL2_1_MAX, FUNCTION_VOL2_2_MIN, FUNCTION_VOL2_2_MAX, FUNCTION_VOL3_MIN, FUNCTION_VOL3_MAX, FUNCTION_VOL4_MIN, FUNCTION_VOL4_MAX, FUNCTION_VOL5_MIN, FUNCTION_VOL5_MAX',
            4: 'FT_USB_SSA_MIN, FT_USB_SSA_MAX, FT_USB_FS_BIST_MIN, FT_USB_FS_BIST_MAX, FT_USB_HS_BIST_MIN, FT_USB_HS_BIST_MAX, FT_USB_LS_BIST_MIN, FT_USB_LS_BIST_MAX, FT_USB_HSBIST_LOWSWING_MIN, FT_USB_HSBIST_LOWSWING_MAX, FT_ADC150_MIN_INL_DLE, FT_ADC150_MAX_INL_DLE, FT_ADC150_MIN_AC, FT_ADC150_MAX_AC, FT_ADC150_MIN_SNDR_1, FT_ADC150_MIN_SNDR_2, FT_ADC150_MIN_SNDR_3, FT_ADC150_MIN_SNDR_4, FT_ADC150_MIN_SNDR_5, FT_ADC150_MIN_SNDR_6, FT_ADC150_MIN_SNDR_7',
            5: 'FT_M5_SSA_MIN, FT_M5_OCC_MIN, FT_M5_SSA_MAX, FT_M5_OCC_MAX, FT_DEVICE_ID_TEST',
            6: 'FT_SOC_STBY_TEST, OVERRIDE_CHECK'
        };
        
        return testNameMapping[softBinNumber] || '';
    }

    /**
     * Add Pareto Analysis section
     * @param {HTMLElement} tbody - Table body element
     * @param {Array} failResults - Array of FAIL results
     * @param {string} stageName - Stage name
     * @param {number} totalFail - Total FAIL count
     */
    addParetoAnalysisSection(tbody, failResults, stageName, totalFail) {
        console.log(`[Debug] addParetoAnalysisSection called for stage: ${stageName}`);
        console.log(`[Debug] Fail results count: ${failResults.length}, Total Fail: ${totalFail}`);

        // Import Analytics for Pareto analysis
        import('./Analytics.js').then(({ Analytics }) => {
            // Perform Pareto analysis
            const paretoData = Analytics.performParetoAnalysis(failResults, stageName);
            
            console.log('[Debug] Pareto data generated:', paretoData);

            // Add Pareto Analysis header
            const paretoHeader = document.createElement('tr');
            paretoHeader.className = 'border-t-2 border-blue-300 bg-blue-50';
            paretoHeader.innerHTML = `
                <td class="p-2 text-xs font-bold text-center text-blue-700" colspan="7">
                    📊 ${stageName} PARETO ANALYSIS (${paretoData.totalFailures} Total Failures)
                </td>
            `;
            tbody.appendChild(paretoHeader);
            
            // Add Pareto chart visualization
            const paretoChartRow = document.createElement('tr');
            paretoChartRow.className = 'border-t bg-gray-50';
            paretoChartRow.innerHTML = `
                <td class="p-2 text-xs font-medium" colspan="7">
                    <div class="mb-2">📈 Interactive Pareto Chart (80/20 Rule):</div>
                    <div class="relative h-[500px] bg-white border rounded p-4 max-w-4xl mx-auto">
                        <canvas id="paretoChart-${stageName}"></canvas>
                    </div>
                    <div class="mt-2 text-xs text-gray-600">
                        <span class="inline-block w-3 h-3 bg-red-500 mr-1"></span>Failure Count (Bars)
                        <span class="inline-block w-3 h-3 bg-blue-500 ml-4 mr-1"></span>Cumulative % (Line)
                        <span class="inline-block w-3 h-3 bg-yellow-400 ml-4 mr-1"></span>80% Threshold
                    </div>
                </td>
            `;
            tbody.appendChild(paretoChartRow);
            
            // Create interactive Pareto chart
            this.createParetoChart(paretoData, stageName);
            
            // Add Top Failures section
            if (paretoData.topFailures.length > 0) {
                const topFailuresHeader = document.createElement('tr');
                topFailuresHeader.className = 'border-t border-orange-200 bg-orange-50';
                topFailuresHeader.innerHTML = `
                    <td class="p-2 text-xs font-medium text-orange-700" colspan="7">
                        🎯 TOP FAILURES (80/20 Rule - ${paretoData.topFailures.length} types, ${paretoData.topFailures[0].cumulativePercentage.toFixed(1)}% of total)
                    </td>
                `;
                tbody.appendChild(topFailuresHeader);
                
                paretoData.topFailures.forEach((item, index) => {
                    const row = document.createElement('tr');
                    row.className = 'border-t hover:bg-orange-50';
                    row.innerHTML = `
                        <td class="p-2 text-xs font-medium">
                            ${index + 1}. ${item.description} (Soft Bin ${item.softBin})
                        </td>
                        <td class="p-2 text-center">
                            <span class="px-2 py-1 rounded text-xs font-medium text-red-600 bg-red-50">${item.failureCount}</span>
                        </td>
                        <td class="p-2 text-center font-medium">${item.percentage.toFixed(1)}%</td>
                        <td class="p-2 text-center text-xs text-blue-600" colspan="4">
                            Cumulative: ${item.cumulativePercentage.toFixed(1)}%
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            }
            
            // Add Failure Categories section
            const categoriesHeader = document.createElement('tr');
            categoriesHeader.className = 'border-t border-purple-200 bg-purple-50';
            categoriesHeader.innerHTML = `
                <td class="p-2 text-xs font-medium text-purple-700" colspan="7">
                    📋 FAILURE CATEGORIES
                </td>
            `;
            tbody.appendChild(categoriesHeader);
            
            Object.entries(paretoData.failureCategories).forEach(([category, data]) => {
                if (data.totalFailures > 0) {
                    const row = document.createElement('tr');
                    row.className = 'border-t hover:bg-purple-50';
                    row.innerHTML = `
                        <td class="p-2 text-xs font-medium">${category}</td>
                        <td class="p-2 text-center">
                            <span class="px-2 py-1 rounded text-xs font-medium text-purple-600 bg-purple-50">${data.totalFailures}</span>
                        </td>
                        <td class="p-2 text-center font-medium">${data.percentage.toFixed(1)}%</td>
                        <td class="p-2 text-center text-xs text-gray-600" colspan="4">
                            ${data.items.map(item => `${item.description}(${item.failureCount})`).join(', ')}
                        </td>
                    `;
                    tbody.appendChild(row);
                }
            });
            
            // Add Recommendations section
            if (paretoData.recommendations.length > 0) {
                const recommendationsHeader = document.createElement('tr');
                recommendationsHeader.className = 'border-t border-green-200 bg-green-50';
                recommendationsHeader.innerHTML = `
                    <td class="p-2 text-xs font-medium text-green-700" colspan="7">
                        💡 RECOMMENDATIONS
                    </td>
                `;
                tbody.appendChild(recommendationsHeader);
                
                paretoData.recommendations.forEach((rec, index) => {
                    const priorityColor = rec.priority === 'High' ? 'text-red-600' : rec.priority === 'Medium' ? 'text-orange-600' : 'text-blue-600';
                    const row = document.createElement('tr');
                    row.className = 'border-t hover:bg-green-50';
                    row.innerHTML = `
                        <td class="p-2 text-xs font-medium">
                            ${index + 1}. <span class="${priorityColor}">[${rec.priority}]</span> ${rec.category}
                        </td>
                        <td class="p-2 text-center">
                            <span class="px-2 py-1 rounded text-xs font-medium text-green-600 bg-green-50">Action</span>
                        </td>
                        <td class="p-2 text-center text-xs text-gray-600" colspan="5">
                            ${rec.description}: ${rec.action}
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            }
        });
    }

    /**
     * Create interactive Pareto chart using Chart.js
     * @param {Array} paretoData - Pareto analysis data
     * @param {string} stageName - Stage name for chart ID
     */
    createParetoChart(paretoData, stageName) {
        console.log(`[Debug] createParetoChart called for stage: ${stageName}`);
        console.log('[Debug] Pareto data received by chart function:', paretoData);

        const canvas = document.getElementById(`paretoChart-${stageName}`);
        if (!canvas) {
            console.error(`[Debug] Canvas element with ID 'paretoChart-${stageName}' not found!`);
            return;
        }
        if (!paretoData || !paretoData.paretoData || paretoData.paretoData.length === 0) {
            console.warn('[Debug] No data provided to createParetoChart.');
            return;
        }

        // Destroy existing chart if it exists
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            console.log('[Debug] Destroying existing chart.');
            existingChart.destroy();
        }

        const ctx = canvas.getContext('2d');
        
        // Prepare data for chart
        const chartData = paretoData.paretoData;
        const labels = chartData.map(item => {
            const shortName = item.description.length > 15 ? 
                item.description.substring(0, 12) + '...' : item.description;
            return [shortName, `(${item.failureCount})`];
        });
        
        const failureCounts = chartData.map(item => item.failureCount);
        const cumulativePercentages = chartData.map(item => item.cumulativePercentage);
        
        // Create 80% threshold line
        const thresholdLine = new Array(chartData.length).fill(80);
        
        // Color bars based on 80/20 rule
        const barColors = chartData.map(item => 
            item.cumulativePercentage <= 80 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(156, 163, 175, 0.6)'
        );
        
        const borderColors = chartData.map(item => 
            item.cumulativePercentage <= 80 ? 'rgba(239, 68, 68, 1)' : 'rgba(156, 163, 175, 1)'
        );

        const chartConfig = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Failure Count',
                        data: failureCounts,
                        backgroundColor: barColors,
                        borderColor: borderColors,
                        borderWidth: 1,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Cumulative %',
                        data: cumulativePercentages,
                        type: 'line',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 3,
                        fill: false,
                        yAxisID: 'y1',
                        tension: 0.1
                    },
                    {
                        label: '80% Threshold',
                        data: thresholdLine,
                        type: 'line',
                        borderColor: 'rgba(251, 191, 36, 0.8)',
                        backgroundColor: 'rgba(251, 191, 36, 0.1)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    title: {
                        display: true,
                        text: `${stageName} Pareto Analysis - 80/20 Rule`,
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            afterLabel: function(context) {
                                const index = context.dataIndex;
                                const item = chartData[index];
                                return [
                                    `Soft Bin: ${item.softBin}`,
                                    `Hard Bin: ${item.hardBin}`,
                                    `Percentage: ${item.percentage.toFixed(1)}%`,
                                    `Cumulative: ${item.cumulativePercentage.toFixed(1)}%`
                                ];
                            }
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    annotation: {
                        annotations: {
                            line1: {
                                type: 'line',
                                yMin: 80,
                                yMax: 80,
                                borderColor: 'rgb(255, 99, 132)',
                                borderWidth: 2,
                                label: {
                                    content: '80% Threshold',
                                    enabled: true,
                                    position: 'end'
                                }
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Failure Types'
                        },
                        ticks: {
                            maxRotation: 90,
                            minRotation: 45
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Failure Count'
                        },
                        beginAtZero: true
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Cumulative Percentage (%)'
                        },
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                }
            }
        };

        console.log('[Debug] Chart config object:', chartConfig);

        // Create chart
        new Chart(ctx, chartConfig);
    }

    /**
     * Display hard bin sorting table
     * @param {Object} sequence - Sequence data
     */
    displayHardBinTable(sequence) {
        console.log('[Debug] displayHardBinTable called. Sequence data:', sequence);
        const container = document.getElementById('hard-bin-table-container');
        if (!container) {
            console.error('[Debug] Hard bin container not found!');
            return;
        }

        const hardBins = sequence.aggregatedHardBins;
        if (!hardBins || Object.keys(hardBins).length === 0) {
            console.warn('[Debug] No aggregated hard bin data found in sequence. Clearing container.');
            const tbody = container.querySelector('#hard-bin-tbody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No hard bin data available</td></tr>';
            }
            return;
        }

        console.log('[Debug] Aggregated hard bins:', hardBins);

        const sortedBins = Object.entries(hardBins).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
        const totalDevices = sortedBins.reduce((sum, [, count]) => sum + count, 0);

        // Find the table body to update content
        const tbody = container.querySelector('#hard-bin-tbody');
        if (!tbody) {
            console.error('[Debug] Hard bin table body not found!');
            return;
        }

        // Create matrix-style table content
        const binHeaders = sortedBins.map(([bin]) => `<th class="px-3 py-2 text-center">${bin.padStart(2, '0')}</th>`).join('');
        const binCounts = sortedBins.map(([, count]) => `<td class="px-3 py-2 text-center font-medium">${count.toLocaleString()}</td>`).join('');
        const binPercentages = sortedBins.map(([, count]) => {
            const percentage = totalDevices > 0 ? ((count / totalDevices) * 100).toFixed(2) : 0;
            return `<td class="px-3 py-2 text-center text-xs text-gray-500">(${percentage}%)</td>`;
        }).join('');

        // Clear existing content and create new table structure
        tbody.innerHTML = `
            <tr>
                <td class="px-3 py-2 font-semibold">Count</td>
                ${binCounts}
                <td class="px-3 py-2 text-center font-bold">${totalDevices.toLocaleString()}</td>
            </tr>
            <tr class="border-t bg-slate-50">
                <td class="px-3 py-2 font-semibold">Percent</td>
                ${binPercentages}
                <td class="px-3 py-2 text-center font-bold">(100.00%)</td>
            </tr>
        `;

        // Update the table header to show bin numbers
        const thead = container.querySelector('#hard-bin-table thead tr');
        if (thead) {
            thead.innerHTML = `
                <th class="px-3 py-2 text-left">Bin #</th>
                ${binHeaders}
                <th class="px-3 py-2 text-center">Total</th>
            `;
        }
    }
} 

if (typeof window !== 'undefined') window.UI = UI; 