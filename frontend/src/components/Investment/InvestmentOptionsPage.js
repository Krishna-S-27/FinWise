import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Shield, AlertTriangle, ExternalLink, Target, Zap, Activity } from 'lucide-react';
import DynamicNavbar from "../DynamicNavbar";

// API Base URL Configuration
const API_BASE_URL = 'https://finwise-backend-latest2.onrender.com';

// Investment Options API
const investmentAPI = {
    async getInvestmentOptions(familyProfileId) {
        try {
            console.log('Loading investment options for family:', familyProfileId);
            const response = await fetch(`${API_BASE_URL}/api/investment-options/${familyProfileId}`, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch investment options: ${response.status}`);
            }

            return response.json();
        } catch (error) {
            console.error('Error loading investment options:', error);
            throw error;
        }
    }
};

// Risk Level Component
const RiskLevel = ({ level }) => {
    const getRiskConfig = (risk) => {
        switch (risk.toLowerCase()) {
            case 'low':
                return {
                    color: 'text-green-400',
                    bg: 'bg-green-500/20',
                    icon: Shield,
                    text: 'Low Risk'
                };
            case 'medium':
                return {
                    color: 'text-yellow-400',
                    bg: 'bg-yellow-500/20',
                    icon: Activity,
                    text: 'Medium Risk'
                };
            case 'high':
                return {
                    color: 'text-red-400',
                    bg: 'bg-red-500/20',
                    icon: AlertTriangle,
                    text: 'High Risk'
                };
            default:
                return {
                    color: 'text-gray-400',
                    bg: 'bg-gray-500/20',
                    icon: Activity,
                    text: 'Unknown Risk'
                };
        }
    };

    const config = getRiskConfig(level);
    const IconComponent = config.icon;

    return (
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${config.bg}`}>
            <IconComponent className={config.color} size={16} />
            <span className={`text-sm font-medium ${config.color}`}>
                {config.text}
            </span>
        </div>
    );
};

// Investment Option Card Component
const InvestmentCard = ({ option }) => {
    const handleInvestClick = () => {
        if (option.invest_link) {
            window.open(option.invest_link, '_blank', 'noopener,noreferrer');
        }
    };

    const formatCurrency = (amount) => {
        if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(1)}L`;
        } else if (amount >= 1000) {
            return `₹${(amount / 1000).toFixed(1)}K`;
        }
        return `₹${amount}`;
    };

    return (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-lg">
            {/* Card Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
                        {option.logo_url ? (
                            <img
                                src={option.logo_url}
                                alt={`${option.name} logo`}
                                className="w-8 h-8 object-contain"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center" style={{display: option.logo_url ? 'none' : 'flex'}}>
                            <TrendingUp className="text-blue-400" size={20} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white line-clamp-2">{option.name}</h3>
                        <p className="text-gray-400 text-sm">{option.type}</p>
                    </div>
                </div>
                <RiskLevel level={option.risk_level} />
            </div>

            {/* Investment Details */}
            <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                            <Target className="text-emerald-400" size={16} />
                            <p className="text-gray-400 text-xs">Expected Return</p>
                        </div>
                        <p className="text-white font-semibold text-sm">{option.expected_annual_return}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                            <DollarSign className="text-blue-400" size={16} />
                            <p className="text-gray-400 text-xs">Min. Investment</p>
                        </div>
                        <p className="text-white font-semibold text-sm">{formatCurrency(option.minimum_investment)}</p>
                    </div>
                </div>
            </div>

            {/* Invest Button */}
            <button
                onClick={handleInvestClick}
                disabled={!option.invest_link}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <span>Invest Now</span>
                <ExternalLink size={16} />
            </button>
        </div>
    );
};

// Main Investment Options Page Component
export default function InvestmentOptionsPage() {
    const [investmentOptions, setInvestmentOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [familyProfileId, setFamilyProfileId] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const [filterRisk, setFilterRisk] = useState('all');

    // Get familyProfileId from localStorage
    useEffect(() => {
        const storedFamilyProfileId = localStorage.getItem('familyProfileId');
        console.log('Retrieved familyProfileId from localStorage:', storedFamilyProfileId);

        if (storedFamilyProfileId) {
            setFamilyProfileId(parseInt(storedFamilyProfileId));
        } else {
            setError('Family profile not found. Please complete your profile first.');
            setLoading(false);
        }
    }, []);

    // Load investment options when familyProfileId is available
    useEffect(() => {
        if (familyProfileId) {
            loadInvestmentOptions();
        }
    }, [familyProfileId]);

    const loadInvestmentOptions = async () => {
        if (!familyProfileId) {
            console.warn('No family profile ID available, skipping data load');
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            console.log('Loading investment options for family ID:', familyProfileId);
            const data = await investmentAPI.getInvestmentOptions(familyProfileId);
            setInvestmentOptions(data.investment_options || []);
            console.log('Investment options loaded:', data);
            setError(null);
        } catch (error) {
            console.error('Error loading investment options:', error);
            setError(`Failed to load investment options: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Filter investment options
    const filteredOptions = investmentOptions.filter(option => {
        const typeMatch = filterType === 'all' || option.type.toLowerCase().includes(filterType.toLowerCase());
        const riskMatch = filterRisk === 'all' || option.risk_level.toLowerCase() === filterRisk.toLowerCase();
        return typeMatch && riskMatch;
    });

    // Get unique types for filter
    const uniqueTypes = [...new Set(investmentOptions.map(option => option.type))];

    // Summary calculations
    const totalOptions = investmentOptions.length;
    const lowRiskCount = investmentOptions.filter(option => option.risk_level.toLowerCase() === 'low').length;
    const mediumRiskCount = investmentOptions.filter(option => option.risk_level.toLowerCase() === 'medium').length;
    const highRiskCount = investmentOptions.filter(option => option.risk_level.toLowerCase() === 'high').length;

    // Show loading if familyProfileId is not yet loaded
    if (loading || familyProfileId === null) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-950 text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-xl">Loading investment options...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-950 text-white">
            <DynamicNavbar />

            <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                            <TrendingUp className="mr-3" size={32} />
                            Investment Options
                        </h1>
                        <p className="text-gray-300 text-lg">
                            Explore personalized investment opportunities for your financial goals
                        </p>
                    </div>
                    <button
                        onClick={loadInvestmentOptions}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-lg flex items-center"
                    >
                        <Activity className="mr-2" size={20} />
                        Refresh Options
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                        <p className="text-red-400">{error}</p>
                        <button
                            onClick={() => setError(null)}
                            className="text-red-300 hover:text-red-100 text-sm mt-2"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <TrendingUp className="text-blue-400" size={24} />
                            </div>
                        </div>
                        <h3 className="text-gray-300 text-sm font-medium">Total Options</h3>
                        <p className="text-2xl font-bold text-white">{totalOptions}</p>
                        <p className="text-blue-400 text-sm mt-1">Available investments</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <Shield className="text-green-400" size={24} />
                            </div>
                        </div>
                        <h3 className="text-gray-300 text-sm font-medium">Low Risk</h3>
                        <p className="text-2xl font-bold text-white">{lowRiskCount}</p>
                        <p className="text-green-400 text-sm mt-1">Conservative options</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-yellow-500/20 rounded-lg">
                                <Activity className="text-yellow-400" size={24} />
                            </div>
                        </div>
                        <h3 className="text-gray-300 text-sm font-medium">Medium Risk</h3>
                        <p className="text-2xl font-bold text-white">{mediumRiskCount}</p>
                        <p className="text-yellow-400 text-sm mt-1">Balanced options</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-red-500/20 rounded-lg">
                                <AlertTriangle className="text-red-400" size={24} />
                            </div>
                        </div>
                        <h3 className="text-gray-300 text-sm font-medium">High Risk</h3>
                        <p className="text-2xl font-bold text-white">{highRiskCount}</p>
                        <p className="text-red-400 text-sm mt-1">Aggressive options</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4">Filter Options</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Investment Type
                            </label>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                            >
                                <option value="all" className="bg-gray-800">All Types</option>
                                {uniqueTypes.map(type => (
                                    <option key={type} value={type} className="bg-gray-800">
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Risk Level
                            </label>
                            <select
                                value={filterRisk}
                                onChange={(e) => setFilterRisk(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                            >
                                <option value="all" className="bg-gray-800">All Risk Levels</option>
                                <option value="low" className="bg-gray-800">Low Risk</option>
                                <option value="medium" className="bg-gray-800">Medium Risk</option>
                                <option value="high" className="bg-gray-800">High Risk</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Investment Options Grid */}
                <div className="space-y-6">
                    {filteredOptions.length === 0 ? (
                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 border border-white/10 text-center">
                            <TrendingUp className="mx-auto mb-4 text-gray-400" size={48} />
                            <h3 className="text-xl font-semibold text-white mb-2">
                                {investmentOptions.length === 0 ? 'No Investment Options Available' : 'No Options Match Your Filters'}
                            </h3>
                            <p className="text-gray-300 mb-6">
                                {investmentOptions.length === 0
                                    ? 'Investment options will be loaded based on your family profile.'
                                    : 'Try adjusting your filters to see more investment options.'
                                }
                            </p>
                            {investmentOptions.length === 0 && (
                                <button
                                    onClick={loadInvestmentOptions}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                                >
                                    Load Investment Options
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredOptions.map((option, index) => (
                                <InvestmentCard key={index} option={option} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Results Summary */}
                {filteredOptions.length > 0 && (
                    <div className="mt-8 text-center">
                        <p className="text-gray-400">
                            Showing {filteredOptions.length} of {totalOptions} investment options
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
