import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    DollarSign,
    Target,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Users,
    MapPin,
    RefreshCw,
    AlertCircle,
    GraduationCap,
    Heart,
    Briefcase
} from 'lucide-react';
import axios from 'axios';
import DynamicNavbar from './DynamicNavbar';

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState({
        totalSavings: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        totalInvestments: 0,
        educationPlanSummary: {
            totalPlans: 0,
            totalEducationCost: 0,
            totalEducationSavings: 0,
            monthlyEducationContribution: 0,
            educationGoalsProgress: 0,
            activePlans: 0,
            nextMilestone: 'No education plans'
        },
        marriagePlanSummary: {
            totalPlans: 0,
            totalMarriageCost: 0,
            totalMarriageSavings: 0,
            monthlyMarriageContribution: 0,
            marriageGoalsProgress: 0,
            activePlans: 0,
            nextMilestone: 'No marriage plans'
        },
        investmentPortfolioSummary: {
            totalPlans: 0,
            totalPortfolioValue: 0,
            totalGains: 0,
            monthlyInvestmentContribution: 0,
            portfolioGrowthPercentage: 0,
            bestPerformingPlan: 'None',
            bestPerformingGrowth: 0
        },
        recentTransactions: [],
        savingsGrowthPercentage: 0,
        investmentGrowthPercentage: 0,
        totalGoalsProgress: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [familyProfileId, setFamilyProfileId] = useState(localStorage.getItem('familyProfileId') || 1);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Create axios instance with default config
            const apiClient = axios.create({
                baseURL: 'https://finwise-backend-latest2.onrender.com/api',
                timeout: 10000,
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            // Add request interceptor for authentication
            apiClient.interceptors.request.use(
                (config) => {
                    const token = localStorage.getItem('authToken');
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                    return config;
                },
                (error) => Promise.reject(error)
            );

            // Add response interceptor for error handling
            apiClient.interceptors.response.use(
                (response) => response,
                (error) => {
                    if (error.response?.status === 401) {
                        localStorage.removeItem('authToken');
                        window.location.href = '/login';
                    }
                    return Promise.reject(error);
                }
            );

            // Fetch dashboard summary from your new endpoint
            const dashboardResponse = await apiClient.get(`/dashboard/summary/${familyProfileId}`);

            if (dashboardResponse.data) {
                setDashboardData(dashboardResponse.data);
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError(error.response?.data?.message || error.message || 'Failed to load dashboard data');

            // Fallback to mock data if API fails
            setDashboardData(prev => ({
                ...prev,
                monthlyIncome: 75000,
                monthlyExpenses: 45000,
                totalSavings: 30000,
                totalInvestments: 150000
            }));
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchDashboardData();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(Math.abs(amount));
    };

    const getTransactionIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'income': return DollarSign;
            case 'expense': return ArrowDownRight;
            case 'investment': return PieChart;
            case 'education': return GraduationCap;
            case 'marriage': return Heart;
            default: return DollarSign;
        }
    };

    const getTransactionColor = (type) => {
        switch (type?.toLowerCase()) {
            case 'income': return 'emerald';
            case 'expense': return 'red';
            case 'investment': return 'blue';
            case 'education': return 'purple';
            case 'marriage': return 'pink';
            default: return 'gray';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-950">
                <DynamicNavbar />
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
                        <p className="text-white">Loading dashboard data...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-950 text-white">
            <DynamicNavbar />

            <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24 py-8">
                {/* Dashboard Header with Refresh Button */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Financial Planning Dashboard</h1>
                        <p className="text-gray-300">Track your education, marriage, and investment goals</p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-center space-x-3">
                        <AlertCircle className="text-red-400 w-5 h-5" />
                        <div>
                            <p className="text-red-300 font-medium">Error loading data</p>
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {/* Financial Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Savings Card */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-emerald-500/20 rounded-lg">
                                <DollarSign className="text-emerald-400" size={24} />
                            </div>
                            <ArrowUpRight className="text-emerald-400" size={20} />
                        </div>
                        <h3 className="text-gray-300 text-sm font-medium">Total Savings</h3>
                        <p className="text-2xl font-bold text-white">
                            {formatCurrency(dashboardData.totalSavings)}
                        </p>
                        <p className="text-emerald-400 text-sm mt-1">
                            +{dashboardData.savingsGrowthPercentage}% from last month
                        </p>
                    </div>

                    {/* Monthly Income Card */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <TrendingUp className="text-blue-400" size={24} />
                            </div>
                            <ArrowUpRight className="text-blue-400" size={20} />
                        </div>
                        <h3 className="text-gray-300 text-sm font-medium">Monthly Income</h3>
                        <p className="text-2xl font-bold text-white">
                            {formatCurrency(dashboardData.monthlyIncome)}
                        </p>
                        <p className="text-blue-400 text-sm mt-1">
                            Stable income
                        </p>
                    </div>

                    {/* Monthly Expenses Card */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-red-500/20 rounded-lg">
                                <ArrowDownRight className="text-red-400" size={24} />
                            </div>
                            <ArrowDownRight className="text-red-400" size={20} />
                        </div>
                        <h3 className="text-gray-300 text-sm font-medium">Monthly Expenses</h3>
                        <p className="text-2xl font-bold text-white">
                            {formatCurrency(dashboardData.monthlyExpenses)}
                        </p>
                        <p className="text-red-400 text-sm mt-1">
                            Well managed
                        </p>
                    </div>

                    {/* Investment Portfolio Card */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <PieChart className="text-purple-400" size={24} />
                            </div>
                            <ArrowUpRight className="text-purple-400" size={20} />
                        </div>
                        <h3 className="text-gray-300 text-sm font-medium">Total Investments</h3>
                        <p className="text-2xl font-bold text-white">
                            {formatCurrency(dashboardData.totalInvestments)}
                        </p>
                        <p className="text-purple-400 text-sm mt-1">
                            +{dashboardData.investmentGrowthPercentage}% portfolio growth
                        </p>
                    </div>
                </div>

                {/* Planning Goals Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Education Planning */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-white flex items-center">
                                <GraduationCap className="text-purple-400 mr-2" size={24} />
                                Education Planning
                            </h3>
                            <span className="text-purple-400 text-sm">{dashboardData.educationPlanSummary.activePlans} Active</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-300">Total Cost:</span>
                                <span className="text-white font-medium">{formatCurrency(dashboardData.educationPlanSummary.totalEducationCost)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-300">Saved:</span>
                                <span className="text-emerald-400 font-medium">{formatCurrency(dashboardData.educationPlanSummary.totalEducationSavings)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-300">Monthly:</span>
                                <span className="text-blue-400 font-medium">{formatCurrency(dashboardData.educationPlanSummary.monthlyEducationContribution)}</span>
                            </div>
                            <div className="mt-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-300">Progress</span>
                                    <span className="text-purple-400">{dashboardData.educationPlanSummary.educationGoalsProgress.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-purple-400 h-2 rounded-full"
                                        style={{ width: `${Math.min(dashboardData.educationPlanSummary.educationGoalsProgress, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm mt-2">{dashboardData.educationPlanSummary.nextMilestone}</p>
                        </div>
                    </div>

                    {/* Marriage Planning */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-white flex items-center">
                                <Heart className="text-pink-400 mr-2" size={24} />
                                Marriage Planning
                            </h3>
                            <span className="text-pink-400 text-sm">{dashboardData.marriagePlanSummary.activePlans} Active</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-300">Total Cost:</span>
                                <span className="text-white font-medium">{formatCurrency(dashboardData.marriagePlanSummary.totalMarriageCost)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-300">Saved:</span>
                                <span className="text-emerald-400 font-medium">{formatCurrency(dashboardData.marriagePlanSummary.totalMarriageSavings)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-300">Monthly:</span>
                                <span className="text-blue-400 font-medium">{formatCurrency(dashboardData.marriagePlanSummary.monthlyMarriageContribution)}</span>
                            </div>
                            <div className="mt-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-300">Progress</span>
                                    <span className="text-pink-400">{dashboardData.marriagePlanSummary.marriageGoalsProgress.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-pink-400 h-2 rounded-full"
                                        style={{ width: `${Math.min(dashboardData.marriagePlanSummary.marriageGoalsProgress, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm mt-2">{dashboardData.marriagePlanSummary.nextMilestone}</p>
                        </div>
                    </div>

                    {/* Investment Portfolio */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-white flex items-center">
                                <Briefcase className="text-blue-400 mr-2" size={24} />
                                Investment Portfolio
                            </h3>
                            <span className="text-blue-400 text-sm">{dashboardData.investmentPortfolioSummary.totalPlans} Plans</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-300">Portfolio Value:</span>
                                <span className="text-white font-medium">{formatCurrency(dashboardData.investmentPortfolioSummary.totalPortfolioValue)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-300">Total Gains:</span>
                                <span className="text-emerald-400 font-medium">{formatCurrency(dashboardData.investmentPortfolioSummary.totalGains)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-300">Monthly SIP:</span>
                                <span className="text-blue-400 font-medium">{formatCurrency(dashboardData.investmentPortfolioSummary.monthlyInvestmentContribution)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-300">Growth:</span>
                                <span className="text-emerald-400 font-medium">+{dashboardData.investmentPortfolioSummary.portfolioGrowthPercentage.toFixed(1)}%</span>
                            </div>
                            <div className="mt-4 p-3 bg-white/5 rounded-lg">
                                <p className="text-gray-300 text-sm">Best Performer:</p>
                                <p className="text-white font-medium">{dashboardData.investmentPortfolioSummary.bestPerformingPlan}</p>
                                <p className="text-emerald-400 text-sm">+{dashboardData.investmentPortfolioSummary.bestPerformingGrowth.toFixed(1)}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                    <h3 className="text-xl font-semibold text-white mb-4">Recent Transactions</h3>
                    <div className="space-y-3">
                        {dashboardData.recentTransactions.length > 0 ? (
                            dashboardData.recentTransactions.map((transaction) => {
                                const IconComponent = getTransactionIcon(transaction.planType);
                                const colorClass = getTransactionColor(transaction.planType);

                                return (
                                    <div key={transaction.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 bg-${colorClass}-500/20 rounded-lg`}>
                                                <IconComponent className={`text-${colorClass}-400`} size={16} />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{transaction.description}</p>
                                                <p className="text-gray-400 text-sm">{transaction.planName} • {transaction.date}</p>
                                            </div>
                                        </div>
                                        <div className={`text-${colorClass}-400 font-semibold`}>
                                            {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-400">No recent transactions</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
