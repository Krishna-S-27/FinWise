import React, { useState, useEffect, useRef } from 'react';
import {
    TrendingUp,
    Target,
    DollarSign,
    Calendar,
    Download,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    Clock,
    ArrowUp,
    ArrowDown,
    Users,
    Heart,
    GraduationCap,
    PieChart,
    BarChart3,
    MapPin,
    FileText,
    Shield,
    FileSpreadsheet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import DynamicNavbar from './DynamicNavbar';
import { autoTable } from 'jspdf-autotable';

const ComprehensiveReportsDashboard = () => {
    const navigate = useNavigate();
    const [reportData, setReportData] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isExporting, setIsExporting] = useState(false);
    const reportRef = useRef(null);

    useEffect(() => {
        const userIdFromStorage = localStorage.getItem('userId');
        const familyProfileId = localStorage.getItem('familyProfileId');

        if (userIdFromStorage) {
            setUserId(userIdFromStorage);
            fetchComprehensiveReport(userIdFromStorage);
        } else {
            setError('User ID not found. Please log in again.');
            setLoading(false);
        }
    }, []);

    const fetchComprehensiveReport = async (userIdParam) => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get(`https://fullstack-backend-kosy.onrender.com/api/reports/comprehensive/${userIdParam}`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            setReportData(response.data);
        } catch (error) {
            console.error('Error fetching comprehensive report:', error);
            if (error.response?.status === 401) {
                setError('Session expired. Please log in again.');
            } else if (error.response?.status === 404) {
                setError('No data found. Please complete your family profile first.');
            } else {
                setError('Failed to load comprehensive report');
            }
        } finally {
            setLoading(false);
        }
    };

    // PDF Export Function
    // PDF Export Function - CORRECTED VERSION
    const exportToPDF = async () => {
        setIsExporting(true);
        try {
            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            // Add title
            doc.setFontSize(20);
            doc.setTextColor(40, 40, 40);
            doc.text('Comprehensive Financial Report', pageWidth / 2, 20, { align: 'center' });

            // Add generation date
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });

            let yPosition = 45;

            // Family Profile Summary
            if (reportData?.familyProfile) {
                doc.setFontSize(16);
                doc.setTextColor(0, 0, 0);
                doc.text('Family Profile Summary', 20, yPosition);
                yPosition += 10;

                const familyData = [
                    ['Family Size', reportData.familyProfile.familySize || 'N/A'],
                    ['Location', reportData.familyProfile.location || 'N/A'],
                    ['Monthly Income', formatCurrency(reportData.familyProfile.monthlyIncome)],
                    ['Monthly Expenses', formatCurrency(reportData.familyProfile.monthlyExpenses)],
                    ['Monthly Savings', formatCurrency((reportData.familyProfile.monthlyIncome || 0) - (reportData.familyProfile.monthlyExpenses || 0))],
                    ['Risk Tolerance', reportData.familyProfile.riskTolerance || 'N/A']
                ];

                // Use the new autoTable API
                autoTable(doc, {
                    startY: yPosition,
                    head: [['Attribute', 'Value']],
                    body: familyData,
                    theme: 'grid',
                    headStyles: { fillColor: [41, 128, 185] },
                    margin: { left: 20, right: 20 }
                });

                yPosition = doc.lastAutoTable.finalY + 15;
            }

            // Marriage Plans
            if (reportData?.marriagePlans?.length > 0) {
                if (yPosition > pageHeight - 60) {
                    doc.addPage();
                    yPosition = 20;
                }

                doc.setFontSize(16);
                doc.text('Marriage Plans', 20, yPosition);
                yPosition += 10;

                const marriageData = reportData.marriagePlans.map(plan => [
                    plan.planName || 'N/A',
                    plan.forName || 'N/A',
                    plan.estimatedYear || 'N/A',
                    formatCurrency(plan.estimatedTotalCost),
                    formatCurrency(plan.currentSavings),
                    `${(plan.progressPercentage || 0).toFixed(1)}%`,
                    plan.status || 'N/A'
                ]);

                autoTable(doc, {
                    startY: yPosition,
                    head: [['Plan Name', 'For', 'Year', 'Total Cost', 'Current Savings', 'Progress', 'Status']],
                    body: marriageData,
                    theme: 'grid',
                    headStyles: { fillColor: [231, 76, 60] },
                    margin: { left: 20, right: 20 },
                    styles: { fontSize: 8 }
                });

                yPosition = doc.lastAutoTable.finalY + 15;
            }

            // Education Plans
            if (reportData?.educationPlans?.length > 0) {
                if (yPosition > pageHeight - 60) {
                    doc.addPage();
                    yPosition = 20;
                }

                doc.setFontSize(16);
                doc.text('Education Plans', 20, yPosition);
                yPosition += 10;

                const educationData = reportData.educationPlans.map(plan => [
                    plan.planName || 'N/A',
                    plan.childName || 'N/A',
                    plan.educationLevel || 'N/A',
                    `${plan.estimatedStartYear || 'N/A'} - ${plan.estimatedEndYear || 'N/A'}`,
                    formatCurrency(plan.estimatedTotalCost),
                    formatCurrency(plan.currentSavings),
                    `${(plan.progressPercentage || 0).toFixed(1)}%`,
                    plan.status || 'N/A'
                ]);

                autoTable(doc, {
                    startY: yPosition,
                    head: [['Plan Name', 'Child', 'Level', 'Duration', 'Total Cost', 'Current Savings', 'Progress', 'Status']],
                    body: educationData,
                    theme: 'grid',
                    headStyles: { fillColor: [155, 89, 182] },
                    margin: { left: 20, right: 20 },
                    styles: { fontSize: 8 }
                });

                yPosition = doc.lastAutoTable.finalY + 15;
            }

            // Investment Plans
            if (reportData?.investmentPlans?.length > 0) {
                if (yPosition > pageHeight - 60) {
                    doc.addPage();
                    yPosition = 20;
                }

                doc.setFontSize(16);
                doc.text('Investment Plans', 20, yPosition);
                yPosition += 10;

                const investmentData = reportData.investmentPlans.map(plan => [
                    plan.planName || 'N/A',
                    plan.targetYear || 'N/A',
                    `${plan.expectedReturn || 0}%`,
                    formatCurrency(plan.goalAmount),
                    formatCurrency(plan.currentSavings),
                    formatCurrency(plan.projectedValue),
                    `${(plan.progressPercentage || 0).toFixed(1)}%`,
                    plan.status || 'N/A'
                ]);

                autoTable(doc, {
                    startY: yPosition,
                    head: [['Plan Name', 'Target Year', 'Expected Return', 'Goal Amount', 'Current Savings', 'Projected Value', 'Progress', 'Status']],
                    body: investmentData,
                    theme: 'grid',
                    headStyles: { fillColor: [46, 204, 113] },
                    margin: { left: 20, right: 20 },
                    styles: { fontSize: 8 }
                });
            }

            // Save the PDF
            const fileName = `financial-report-${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF report');
        } finally {
            setIsExporting(false);
        }
    };


    // Excel Export Function
    const exportToExcel = () => {
        setIsExporting(true);
        try {
            const workbook = XLSX.utils.book_new();

            // Family Profile Sheet
            if (reportData?.familyProfile) {
                const familyData = [
                    ['Attribute', 'Value'],
                    ['Family Size', reportData.familyProfile.familySize || 'N/A'],
                    ['Location', reportData.familyProfile.location || 'N/A'],
                    ['Monthly Income', reportData.familyProfile.monthlyIncome || 0],
                    ['Monthly Expenses', reportData.familyProfile.monthlyExpenses || 0],
                    ['Monthly Savings', (reportData.familyProfile.monthlyIncome || 0) - (reportData.familyProfile.monthlyExpenses || 0)],
                    ['Risk Tolerance', reportData.familyProfile.riskTolerance || 'N/A']
                ];

                const familySheet = XLSX.utils.aoa_to_sheet(familyData);
                XLSX.utils.book_append_sheet(workbook, familySheet, 'Family Profile');
            }

            // Marriage Plans Sheet
            if (reportData?.marriagePlans?.length > 0) {
                const marriageData = [
                    ['Plan Name', 'For', 'Relationship', 'Estimated Year', 'Total Cost', 'Current Savings', 'Monthly Contribution', 'Progress %', 'Status', 'Inflation Rate', 'Required Monthly Saving']
                ];

                reportData.marriagePlans.forEach(plan => {
                    marriageData.push([
                        plan.planName || 'N/A',
                        plan.forName || 'N/A',
                        plan.relationship || 'N/A',
                        plan.estimatedYear || 'N/A',
                        plan.estimatedTotalCost || 0,
                        plan.currentSavings || 0,
                        plan.monthlyContribution || 0,
                        (plan.progressPercentage || 0).toFixed(2),
                        plan.status || 'N/A',
                        plan.inflationRate || 0,
                        plan.monthlyRequiredSaving || 0
                    ]);
                });

                const marriageSheet = XLSX.utils.aoa_to_sheet(marriageData);
                XLSX.utils.book_append_sheet(workbook, marriageSheet, 'Marriage Plans');
            }

            // Education Plans Sheet
            if (reportData?.educationPlans?.length > 0) {
                const educationData = [
                    ['Plan Name', 'Child Name', 'Education Level', 'Institution Type', 'Start Year', 'End Year', 'Total Cost', 'Current Savings', 'Monthly Contribution', 'Progress %', 'Status', 'Inflation Rate']
                ];

                reportData.educationPlans.forEach(plan => {
                    educationData.push([
                        plan.planName || 'N/A',
                        plan.childName || 'N/A',
                        plan.educationLevel || 'N/A',
                        plan.institutionType || 'N/A',
                        plan.estimatedStartYear || 'N/A',
                        plan.estimatedEndYear || 'N/A',
                        plan.estimatedTotalCost || 0,
                        plan.currentSavings || 0,
                        plan.monthlyContribution || 0,
                        (plan.progressPercentage || 0).toFixed(2),
                        plan.status || 'N/A',
                        plan.inflationRate || 0
                    ]);
                });

                const educationSheet = XLSX.utils.aoa_to_sheet(educationData);
                XLSX.utils.book_append_sheet(workbook, educationSheet, 'Education Plans');
            }

            // Investment Plans Sheet
            if (reportData?.investmentPlans?.length > 0) {
                const investmentData = [
                    ['Plan Name', 'Goal Amount', 'Current Savings', 'Monthly Contribution', 'Expected Return %', 'Target Year', 'Projected Value', 'Progress %', 'Status', 'Expected Gains', 'Shortfall']
                ];

                reportData.investmentPlans.forEach(plan => {
                    investmentData.push([
                        plan.planName || 'N/A',
                        plan.goalAmount || 0,
                        plan.currentSavings || 0,
                        plan.monthlyContribution || 0,
                        plan.expectedReturn || 0,
                        plan.targetYear || 'N/A',
                        plan.projectedValue || 0,
                        (plan.progressPercentage || 0).toFixed(2),
                        plan.status || 'N/A',
                        plan.expectedGains || 0,
                        plan.shortfall || 0
                    ]);
                });

                const investmentSheet = XLSX.utils.aoa_to_sheet(investmentData);
                XLSX.utils.book_append_sheet(workbook, investmentSheet, 'Investment Plans');
            }

            // Summary Sheet
            const summaryData = [
                ['Summary', 'Count', 'Total Value'],
                ['Marriage Plans', reportData?.marriagePlans?.length || 0, reportData?.overallSummary?.totalMarriageSavings || 0],
                ['Education Plans', reportData?.educationPlans?.length || 0, reportData?.overallSummary?.totalEducationSavings || 0],
                ['Investment Plans', reportData?.investmentPlans?.length || 0, reportData?.overallSummary?.totalInvestmentValue || 0],
                ['Total Portfolio', '', reportData?.overallSummary?.totalPortfolioValue || 0]
            ];

            const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

            // Save the Excel file
            const fileName = `financial-report-${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(workbook, fileName);

        } catch (error) {
            console.error('Error generating Excel:', error);
            alert('Error generating Excel report');
        } finally {
            setIsExporting(false);
        }
    };

    // Screenshot Export Function
    const exportAsImage = async () => {
        setIsExporting(true);
        try {
            const element = reportRef.current;
            const canvas = await html2canvas(element, {
                backgroundColor: '#1e3a8a', // Match your background color
                scale: 2, // Higher quality
                useCORS: true
            });

            canvas.toBlob((blob) => {
                const fileName = `financial-report-${new Date().toISOString().split('T')[0]}.png`;
                saveAs(blob, fileName);
            });

        } catch (error) {
            console.error('Error generating image:', error);
            alert('Error generating image report');
        } finally {
            setIsExporting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED': return 'text-green-400 bg-green-500/20';
            case 'ON_TRACK': return 'text-blue-400 bg-blue-500/20';
            case 'AHEAD': return 'text-emerald-400 bg-emerald-500/20';
            case 'BEHIND': return 'text-red-400 bg-red-500/20';
            case 'ACTIVE': return 'text-blue-400 bg-blue-500/20';
            case 'MATURED': return 'text-green-400 bg-green-500/20';
            case 'OVERDUE': return 'text-red-400 bg-red-500/20';
            default: return 'text-gray-400 bg-gray-500/20';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle size={16} />;
            case 'ON_TRACK': return <Clock size={16} />;
            case 'AHEAD': return <ArrowUp size={16} />;
            case 'BEHIND': return <ArrowDown size={16} />;
            case 'ACTIVE': return <TrendingUp size={16} />;
            case 'MATURED': return <CheckCircle size={16} />;
            case 'OVERDUE': return <AlertCircle size={16} />;
            default: return <AlertCircle size={16} />;
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₹0';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'marriage', label: 'Marriage Plans', icon: Heart },
        { id: 'education', label: 'Education Plans', icon: GraduationCap },
        { id: 'investments', label: 'Investments', icon: TrendingUp }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-950">
                <DynamicNavbar />
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
                        <p className="text-white">Loading comprehensive report...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-950 text-white">
                <DynamicNavbar />
                <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24 py-8">
                    <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-center space-x-3">
                        <AlertCircle className="text-red-400 w-5 h-5" />
                        <div>
                            <p className="text-red-300 font-medium">Error Loading Report</p>
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    </div>
                    <div className="mt-4 text-center">
                        <button
                            onClick={() => fetchComprehensiveReport(userId)}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors mr-4"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => navigate('/family-details')}
                            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                        >
                            Complete Profile
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-950 text-white">
            <DynamicNavbar />

            <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24 py-8" ref={reportRef}>
                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Comprehensive Financial Reports</h1>
                        <p className="text-gray-300">Track all your financial plans and investments in one place</p>
                        <p className="text-gray-400 text-sm mt-1">
                            Generated on {new Date(reportData?.reportGeneratedAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => fetchComprehensiveReport(userId)}
                            className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
                        >
                            <RefreshCw size={16} />
                            <span>Refresh</span>
                        </button>

                        {/* Download Dropdown */}
                        <div className="relative group">
                            <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
                                <Download size={16} />
                                <span>Export</span>
                            </button>

                            {/* Dropdown Menu */}
                            <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <div className="py-2">
                                    <button
                                        onClick={exportToPDF}
                                        disabled={isExporting}
                                        className="w-full text-left px-4 py-2 text-white hover:bg-white/20 transition-colors flex items-center space-x-2 disabled:opacity-50"
                                    >
                                        <FileText size={16} />
                                        <span>Export as PDF</span>
                                        {isExporting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                                    </button>

                                    <button
                                        onClick={exportToExcel}
                                        disabled={isExporting}
                                        className="w-full text-left px-4 py-2 text-white hover:bg-white/20 transition-colors flex items-center space-x-2 disabled:opacity-50"
                                    >
                                        <FileSpreadsheet size={16} />
                                        <span>Export as Excel</span>
                                        {isExporting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                                    </button>

                                    <button
                                        onClick={exportAsImage}
                                        disabled={isExporting}
                                        className="w-full text-left px-4 py-2 text-white hover:bg-white/20 transition-colors flex items-center space-x-2 disabled:opacity-50"
                                    >
                                        <Download size={16} />
                                        <span>Export as Image</span>
                                        {isExporting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-8">
                    <div className="flex space-x-1 bg-white/10 rounded-lg p-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-white/20 text-white'
                                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    <Icon size={16} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-pink-500/20 rounded-lg">
                                        <Heart className="text-pink-400" size={24} />
                                    </div>
                                </div>
                                <h3 className="text-gray-300 text-sm font-medium">Marriage Plans</h3>
                                <p className="text-2xl font-bold text-white">
                                    {reportData?.marriagePlans?.length || 0}
                                </p>
                                <p className="text-pink-400 text-sm mt-1">Active plans</p>
                            </div>

                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                                        <GraduationCap className="text-indigo-400" size={24} />
                                    </div>
                                </div>
                                <h3 className="text-gray-300 text-sm font-medium">Education Plans</h3>
                                <p className="text-2xl font-bold text-white">
                                    {reportData?.educationPlans?.length || 0}
                                </p>
                                <p className="text-indigo-400 text-sm mt-1">Children covered</p>
                            </div>

                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                                        <TrendingUp className="text-emerald-400" size={24} />
                                    </div>
                                </div>
                                <h3 className="text-gray-300 text-sm font-medium">Investments</h3>
                                <p className="text-2xl font-bold text-white">
                                    {reportData?.investmentPlans?.length || 0}
                                </p>
                                <p className="text-emerald-400 text-sm mt-1">Active investments</p>
                            </div>

                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-blue-500/20 rounded-lg">
                                        <DollarSign className="text-blue-400" size={24} />
                                    </div>
                                </div>
                                <h3 className="text-gray-300 text-sm font-medium">Total Portfolio</h3>
                                <p className="text-2xl font-bold text-white">
                                    {formatCurrency(reportData?.overallSummary?.totalPortfolioValue || 0)}
                                </p>
                                <p className="text-blue-400 text-sm mt-1">Current value</p>
                            </div>
                        </div>

                        {/* Family Profile Summary */}
                        {reportData?.familyProfile && (
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                                    <Users className="mr-2 text-purple-400" size={24} />
                                    Family Profile Summary
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                                    <div className="text-center p-4 bg-green-500/20 rounded-lg">
                                        <p className="text-sm text-gray-300 mb-1">Monthly Income</p>
                                        <p className="text-2xl font-bold text-green-400">
                                            {formatCurrency(reportData.familyProfile.monthlyIncome)}
                                        </p>
                                    </div>

                                    <div className="text-center p-4 bg-red-500/20 rounded-lg">
                                        <p className="text-sm text-gray-300 mb-1">Monthly Expenses</p>
                                        <p className="text-2xl font-bold text-red-400">
                                            {formatCurrency(reportData.familyProfile.monthlyExpenses)}
                                        </p>
                                    </div>

                                    <div className="text-center p-4 bg-blue-500/20 rounded-lg">
                                        <p className="text-sm text-gray-300 mb-1">Monthly Savings</p>
                                        <p className="text-2xl font-bold text-blue-400">
                                            {formatCurrency((reportData.familyProfile.monthlyIncome || 0) - (reportData.familyProfile.monthlyExpenses || 0))}
                                        </p>
                                    </div>

                                    <div className="text-center p-4 bg-purple-500/20 rounded-lg">
                                        <p className="text-sm text-gray-300 mb-1">Family Size</p>
                                        <p className="text-2xl font-bold text-purple-400">
                                            {reportData.familyProfile.familySize || 0}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4 text-sm text-gray-300">
                                    <div className="flex items-center space-x-2">
                                        <MapPin size={16} />
                                        <span>{reportData.familyProfile.location || 'Location not set'}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Shield size={16} />
                                        <span>Risk Tolerance: {reportData.familyProfile.riskTolerance || 'Not set'}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Marriage Plans Tab */}
                {activeTab === 'marriage' && (
                    <div className="space-y-6">
                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                                <Heart className="mr-2 text-pink-400" size={24} />
                                Marriage Plans Progress
                            </h2>

                            {reportData?.marriagePlans?.length > 0 ? (
                                <div className="space-y-6">
                                    {reportData.marriagePlans.map((plan, index) => (
                                        <div key={index} className="bg-white/5 rounded-lg p-6 border border-white/10">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="font-medium text-white text-lg">{plan.planName}</h3>
                                                    <p className="text-gray-400 text-sm">For: {plan.forName}</p>
                                                    <p className="text-gray-400 text-sm">Relationship: {plan.relationship}</p>
                                                    <p className="text-gray-400 text-sm">Target Year: {plan.estimatedYear}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(plan.status)}`}>
                                                    {getStatusIcon(plan.status)}
                                                    <span>{plan.status?.replace('_', ' ')}</span>
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                                <div>
                                                    <p className="text-gray-400 text-xs">Estimated Cost</p>
                                                    <p className="text-white font-medium">{formatCurrency(plan.estimatedTotalCost)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400 text-xs">Current Savings</p>
                                                    <p className="text-white font-medium">{formatCurrency(plan.currentSavings)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400 text-xs">Progress</p>
                                                    <p className="text-white font-medium">{plan.progressPercentage?.toFixed(1)}%</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400 text-xs">Monthly Contribution</p>
                                                    <p className="text-white font-medium">{formatCurrency(plan.monthlyContribution)}</p>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="mb-4">
                                                <div className="w-full bg-gray-700 rounded-full h-2">
                                                    <div
                                                        className="bg-pink-400 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${Math.min(plan.progressPercentage || 0, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {plan.inflationAdjustedCost && (
                                                <div className="text-sm text-gray-300 mb-2">
                                                    Inflation Adjusted Cost: {formatCurrency(plan.inflationAdjustedCost)}
                                                </div>
                                            )}

                                            {plan.monthlyRequiredSaving && (
                                                <div className="flex items-center space-x-2 text-sm">
                                                    <DollarSign size={14} className="text-gray-400" />
                                                    <span className="text-gray-300">
                                                        Required monthly saving: {formatCurrency(plan.monthlyRequiredSaving)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Heart className="mx-auto text-gray-400 mb-4" size={48} />
                                    <p className="text-gray-400">No marriage plans found</p>
                                    <p className="text-gray-500 text-sm">Start by creating your first marriage plan</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Education Plans Tab */}
                {activeTab === 'education' && (
                    <div className="space-y-6">
                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                                <GraduationCap className="mr-2 text-indigo-400" size={24} />
                                Education Plans Progress
                            </h2>

                            {reportData?.educationPlans?.length > 0 ? (
                                <div className="space-y-6">
                                    {reportData.educationPlans.map((plan, index) => (
                                        <div key={index} className="bg-white/5 rounded-lg p-6 border border-white/10">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="font-medium text-white text-lg">{plan.planName}</h3>
                                                    <p className="text-gray-400 text-sm">Child: {plan.childName}</p>
                                                    <p className="text-gray-400 text-sm">Education Level: {plan.educationLevel}</p>
                                                    <p className="text-gray-400 text-sm">Institution Type: {plan.institutionType}</p>
                                                    <p className="text-gray-400 text-sm">
                                                        Duration: {plan.estimatedStartYear} - {plan.estimatedEndYear}
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(plan.status)}`}>
                                                    {getStatusIcon(plan.status)}
                                                    <span>{plan.status?.replace('_', ' ')}</span>
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                                <div>
                                                    <p className="text-gray-400 text-xs">Estimated Cost</p>
                                                    <p className="text-white font-medium">{formatCurrency(plan.estimatedTotalCost)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400 text-xs">Current Savings</p>
                                                    <p className="text-white font-medium">{formatCurrency(plan.currentSavings)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400 text-xs">Progress</p>
                                                    <p className="text-white font-medium">{plan.progressPercentage?.toFixed(1)}%</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400 text-xs">Monthly Contribution</p>
                                                    <p className="text-white font-medium">{formatCurrency(plan.monthlyContribution)}</p>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="mb-4">
                                                <div className="w-full bg-gray-700 rounded-full h-2">
                                                    <div
                                                        className="bg-indigo-400 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${Math.min(plan.progressPercentage || 0, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {plan.inflationAdjustedCost && (
                                                <div className="text-sm text-gray-300 mb-2">
                                                    Inflation Adjusted Cost: {formatCurrency(plan.inflationAdjustedCost)}
                                                </div>
                                            )}

                                            {plan.futureValue && (
                                                <div className="text-sm text-gray-300 mb-2">
                                                    Projected Future Value: {formatCurrency(plan.futureValue)}
                                                </div>
                                            )}

                                            {plan.shortfall && plan.shortfall > 0 && (
                                                <div className="text-sm text-red-400 mb-2">
                                                    Shortfall: {formatCurrency(plan.shortfall)}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <GraduationCap className="mx-auto text-gray-400 mb-4" size={48} />
                                    <p className="text-gray-400">No education plans found</p>
                                    <p className="text-gray-500 text-sm">Start by creating education plans for your children</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Investment Plans Tab */}
                {activeTab === 'investments' && (
                    <div className="space-y-6">
                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                                <TrendingUp className="mr-2 text-emerald-400" size={24} />
                                Investment Plans Portfolio
                            </h2>

                            {reportData?.investmentPlans?.length > 0 ? (
                                <div className="space-y-6">
                                    {reportData.investmentPlans.map((plan, index) => (
                                        <div key={index} className="bg-white/5 rounded-lg p-6 border border-white/10">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="font-medium text-white text-lg">{plan.planName}</h3>
                                                    <p className="text-gray-400 text-sm">Target Year: {plan.targetYear}</p>
                                                    <p className="text-gray-400 text-sm">Expected Return: {plan.expectedReturn}% p.a.</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(plan.status)}`}>
                                                    {getStatusIcon(plan.status)}
                                                    <span>{plan.status}</span>
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                                                <div>
                                                    <p className="text-gray-400 text-xs">Goal Amount</p>
                                                    <p className="text-white font-medium">{formatCurrency(plan.goalAmount)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400 text-xs">Current Savings</p>
                                                    <p className="text-white font-medium">{formatCurrency(plan.currentSavings)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400 text-xs">Monthly Contribution</p>
                                                    <p className="text-white font-medium">{formatCurrency(plan.monthlyContribution)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400 text-xs">Projected Value</p>
                                                    <p className="text-emerald-400 font-medium">{formatCurrency(plan.projectedValue)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400 text-xs">Progress</p>
                                                    <p className="text-white font-medium">{plan.progressPercentage?.toFixed(1)}%</p>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="mb-4">
                                                <div className="w-full bg-gray-700 rounded-full h-2">
                                                    <div
                                                        className="bg-emerald-400 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${Math.min(plan.progressPercentage || 0, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {plan.expectedGains && (
                                                <div className="text-sm text-emerald-400 mb-2">
                                                    Expected Gains: {formatCurrency(plan.expectedGains)}
                                                </div>
                                            )}

                                            {plan.shortfall && plan.shortfall > 0 && (
                                                <div className="text-sm text-red-400">
                                                    Shortfall: {formatCurrency(plan.shortfall)}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <TrendingUp className="mx-auto text-gray-400 mb-4" size={48} />
                                    <p className="text-gray-400">No investment plans found</p>
                                    <p className="text-gray-500 text-sm">Start by creating your first investment plan</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComprehensiveReportsDashboard;
