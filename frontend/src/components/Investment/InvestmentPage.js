import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, DollarSign, Edit3, Trash2, Target, Plus, X, Save } from 'lucide-react';
import DynamicNavbar from "../DynamicNavbar";
import axios from 'axios';

// API endpoint
const API_BASE_URL = 'https://finwise-msj9.onrender.com';

// API service with proper authentication
const investmentAPI = {
    async getAllPlans(familyProfileId) {
        const response = await fetch(`${API_BASE_URL}/api/investment-plans/family/${familyProfileId}`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Failed to fetch plans');
        return response.json();
    },
    async createPlan(familyProfileId, planData) {
        const response = await fetch(`${API_BASE_URL}/api/investment-plans/${familyProfileId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(planData)
        });
        if (!response.ok) throw new Error('Failed to create plan');
        return response.json();
    },
    async updatePlan(id, planData) {
        const response = await fetch(`${API_BASE_URL}/api/investment-plans/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(planData)
        });
        if (!response.ok) throw new Error('Failed to update plan');
        return response.json();
    },
    async deletePlan(id) {
        const response = await fetch(`${API_BASE_URL}/api/investment-plans/${id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Failed to delete plan');
    }
};

// Dual Progress Bar Component
const DualProgressBar = ({ plan }) => {
    // Calculate years to goal
    const currentYear = new Date().getFullYear();
    const targetYear = parseInt(plan.targetYear) || currentYear + 1;
    const years = Math.max(0, targetYear - currentYear);

    const currentSavings = parseFloat(plan.currentSavings) || 0;
    const monthlyContrib = parseFloat(plan.monthlyContribution) || 0;
    const expectedReturn = parseFloat(plan.expectedReturn) || 8;
    const goalAmount = parseFloat(plan.goalAmount) || 0;

    // Progress 1: Current Savings Only
    const progressCurrent = goalAmount > 0 ? Math.min(100, (currentSavings / goalAmount) * 100) : 0;

    // Progress 2: Projected (Current + Future Contributions)
    let futureValueMonthlyContributions = 0;
    if (monthlyContrib > 0 && expectedReturn > 0) {
        const monthlyRate = expectedReturn / 100 / 12;
        const totalMonths = years * 12;
        futureValueMonthlyContributions = monthlyContrib *
            ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
    } else if (monthlyContrib > 0) {
        futureValueMonthlyContributions = monthlyContrib * years * 12;
    }
    const futureValueCurrentSavings = currentSavings * Math.pow(1 + expectedReturn / 100, years);
    const totalFutureValue = futureValueCurrentSavings + futureValueMonthlyContributions;
    const progressProjected = goalAmount > 0 ? Math.min(100, (totalFutureValue / goalAmount) * 100) : 0;

    // Get progress status for current savings
    const getCurrentStatus = (progress) => {
        if (progress >= 80) return { text: 'Excellent', icon: '🎯', color: 'from-emerald-500 to-emerald-400' };
        if (progress >= 60) return { text: 'Good', icon: '📈', color: 'from-blue-500 to-blue-400' };
        if (progress >= 40) return { text: 'Fair', icon: '⚡', color: 'from-yellow-500 to-yellow-400' };
        return { text: 'Needs Attention', icon: '⚠️', color: 'from-red-500 to-red-400' };
    };

    // Get progress status for projected savings
    const getProjectedStatus = (progress) => {
        if (progress >= 100) return { text: 'On Track', icon: '✅', color: 'from-emerald-500 to-emerald-400' };
        if (progress >= 80) return { text: 'Good Pace', icon: '🚀', color: 'from-blue-500 to-blue-400' };
        if (progress >= 60) return { text: 'Moderate', icon: '📊', color: 'from-yellow-500 to-yellow-400' };
        return { text: 'Behind Target', icon: '🔴', color: 'from-red-500 to-red-400' };
    };

    const currentStatus = getCurrentStatus(progressCurrent);
    const projectedStatus = getProjectedStatus(progressProjected);

    return (
        <div className="space-y-6">
            {/* Current Savings Progress */}
            <div className="bg-white/5 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center space-x-2">
                        <span className="text-lg">{currentStatus.icon}</span>
                        <span className="text-gray-300 font-medium">Current Savings Progress</span>
                    </div>
                    <div className="text-right">
                        <p className="text-white font-bold text-lg">{progressCurrent.toFixed(1)}%</p>
                        <p className="text-gray-400 text-xs">{currentStatus.text}</p>
                    </div>
                </div>

                <div className="relative mb-2">
                    <div className="w-full bg-gray-700 rounded-full h-4 shadow-inner">
                        <div
                            className={`bg-gradient-to-r ${currentStatus.color} h-4 rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
                            style={{ width: `${progressCurrent}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                        </div>
                    </div>
                </div>

                <div className="text-xs text-gray-400">
                    Saved: ₹{(currentSavings / 100000).toFixed(2)}L / Target: ₹{(goalAmount / 100000).toFixed(2)}L
                </div>
            </div>

            {/* Projected Progress (Current + Future Contributions) */}
            <div className="bg-white/5 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center space-x-2">
                        <span className="text-lg">{projectedStatus.icon}</span>
                        <span className="text-gray-300 font-medium">Projected Progress (with future investments)</span>
                    </div>
                    <div className="text-right">
                        <p className="text-white font-bold text-lg">{progressProjected.toFixed(1)}%</p>
                        <p className="text-gray-400 text-xs">{projectedStatus.text}</p>
                    </div>
                </div>

                <div className="relative mb-2">
                    <div className="w-full bg-gray-700 rounded-full h-4 shadow-inner">
                        <div
                            className={`bg-gradient-to-r ${projectedStatus.color} h-4 rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
                            style={{ width: `${Math.min(100, progressProjected)}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                        </div>
                    </div>

                    {/* Progress milestones */}
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                    </div>
                </div>

                <div className="text-xs text-gray-400">
                    Projected: ₹{(totalFutureValue / 100000).toFixed(2)}L / Target: ₹{(goalAmount / 100000).toFixed(2)}L
                </div>
            </div>

            {/* Progress Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">Monthly Contribution</p>
                    <p className="text-white font-semibold">
                        ₹{monthlyContrib.toLocaleString()}
                    </p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">Years Remaining</p>
                    <p className="text-white font-semibold">
                        {years} {years === 1 ? 'year' : 'years'}
                    </p>
                </div>
            </div>
        </div>
    );
};

// Modal for Add/Edit Investment Plan
const InvestmentPlanModal = ({ isOpen, onClose, onSave, plan = null, familyProfileId }) => {
    const [formData, setFormData] = useState({
        planName: '',
        goalAmount: '',
        currentSavings: '0',
        monthlyContribution: '0',
        expectedReturn: '8.00',
        targetYear: new Date().getFullYear() + 5,
        notes: '',
        familyProfileId: familyProfileId
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (plan) {
            setFormData({
                planName: plan.planName || '',
                goalAmount: plan.goalAmount || '',
                currentSavings: plan.currentSavings || '0',
                monthlyContribution: plan.monthlyContribution || '0',
                expectedReturn: plan.expectedReturn || '8.00',
                targetYear: plan.targetYear || new Date().getFullYear() + 5,
                notes: plan.notes || '',
                familyProfileId: plan.familyProfileId || familyProfileId
            });
        } else {
            setFormData({
                planName: '',
                goalAmount: '',
                currentSavings: '0',
                monthlyContribution: '0',
                expectedReturn: '8.00',
                targetYear: new Date().getFullYear() + 5,
                notes: '',
                familyProfileId: familyProfileId
            });
        }
        setErrors({});
    }, [plan, familyProfileId, isOpen]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.planName.trim()) newErrors.planName = 'Plan name is required';
        if (!formData.goalAmount || parseFloat(formData.goalAmount) <= 0) newErrors.goalAmount = 'Goal amount must be greater than zero';
        if (formData.targetYear < new Date().getFullYear()) newErrors.targetYear = 'Year must be current year or later';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Error saving plan:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">
                        {plan ? 'Edit Investment Plan' : 'Create Investment Plan'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Plan Name *</label>
                            <input
                                type="text"
                                value={formData.planName}
                                onChange={e => setFormData({ ...formData, planName: e.target.value })}
                                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                                placeholder="e.g., Retirement Fund"
                                required
                            />
                            {errors.planName && <p className="text-red-400 text-sm mt-1">{errors.planName}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Goal Amount (₹) *</label>
                            <input
                                type="number"
                                value={formData.goalAmount}
                                onChange={e => setFormData({ ...formData, goalAmount: e.target.value })}
                                min="1"
                                step="0.01"
                                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                                placeholder="1000000"
                                required
                            />
                            {errors.goalAmount && <p className="text-red-400 text-sm mt-1">{errors.goalAmount}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Current Savings (₹)</label>
                            <input
                                type="number"
                                value={formData.currentSavings}
                                onChange={e => setFormData({ ...formData, currentSavings: e.target.value })}
                                min="0"
                                step="0.01"
                                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Monthly Contribution (₹)</label>
                            <input
                                type="number"
                                value={formData.monthlyContribution}
                                onChange={e => setFormData({ ...formData, monthlyContribution: e.target.value })}
                                min="0"
                                step="0.01"
                                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Expected Return (%)</label>
                            <input
                                type="number"
                                value={formData.expectedReturn}
                                onChange={e => setFormData({ ...formData, expectedReturn: e.target.value })}
                                min="0"
                                step="0.01"
                                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Target Year *</label>
                            <input
                                type="number"
                                value={formData.targetYear}
                                onChange={e => setFormData({ ...formData, targetYear: parseInt(e.target.value) })}
                                min={new Date().getFullYear()}
                                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                                required
                            />
                            {errors.targetYear && <p className="text-red-400 text-sm mt-1">{errors.targetYear}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            rows="3"
                            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                            placeholder="Additional notes about the investment plan..."
                        />
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={16} className="mr-2" />
                                    {plan ? 'Update Plan' : 'Create Plan'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Helper function for shortfall calculation
function getShortfall(plan) {
    const currentYear = new Date().getFullYear();
    const targetYear = parseInt(plan.targetYear) || currentYear + 1;
    const years = Math.max(0, targetYear - currentYear);

    const currentSavings = parseFloat(plan.currentSavings) || 0;
    const monthlyContrib = parseFloat(plan.monthlyContribution) || 0;
    const expectedReturn = parseFloat(plan.expectedReturn) || 8;
    const goalAmount = parseFloat(plan.goalAmount) || 0;

    if (goalAmount <= 0) return 0;

    if (years <= 0) {
        return Math.max(0, goalAmount - currentSavings);
    }

    const futureValueCurrentSavings = currentSavings * Math.pow(1 + expectedReturn / 100, years);

    let futureValueMonthlyContributions = 0;
    if (monthlyContrib > 0 && expectedReturn > 0) {
        const monthlyRate = expectedReturn / 100 / 12;
        const totalMonths = years * 12;
        futureValueMonthlyContributions = monthlyContrib *
            ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
    } else if (monthlyContrib > 0) {
        futureValueMonthlyContributions = monthlyContrib * years * 12;
    }

    const totalFutureValue = futureValueCurrentSavings + futureValueMonthlyContributions;

    return Math.max(0, goalAmount - totalFutureValue);
}

export default function InvestmentPage() {
    const [investmentPlans, setInvestmentPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [familyProfileId, setFamilyProfileId] = useState(null);
    const [error, setError] = useState(null);

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

    useEffect(() => {
        if (familyProfileId) {
            loadPlans();
        }
    }, [familyProfileId]);

    const loadPlans = async () => {
        if (!familyProfileId) {
            console.warn('No family profile ID available, skipping data load');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            console.log('Loading investment plans for family ID:', familyProfileId);
            const plans = await investmentAPI.getAllPlans(familyProfileId);
            setInvestmentPlans(plans || []);
            console.log('Investment plans loaded:', plans);
            setError(null);
        } catch (err) {
            console.error('Error loading plans:', err);
            setInvestmentPlans([]);

            if (err.message.includes('404')) {
                setError('Family profile not found. Please complete your family setup first.');
            } else {
                setError(`Failed to load investment plans: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePlan = async (planData) => {
        if (!familyProfileId) {
            setError('Family profile ID not available');
            return;
        }

        try {
            console.log('Creating plan for family ID:', familyProfileId, 'with data:', planData);
            const newPlan = await investmentAPI.createPlan(familyProfileId, planData);
            setInvestmentPlans(prev => [...prev, newPlan]);
            setError(null);
        } catch (err) {
            console.error('Error creating plan:', err);
            setError(`Failed to create investment plan: ${err.message}`);
        }
    };

    const handleUpdatePlan = async (planData) => {
        try {
            console.log('Updating plan ID:', editingPlan.id, 'with data:', planData);
            const updatedPlan = await investmentAPI.updatePlan(editingPlan.id, planData);
            setInvestmentPlans(prev => prev.map(plan =>
                plan.id === editingPlan.id ? updatedPlan : plan
            ));
            setError(null);
        } catch (err) {
            console.error('Error updating plan:', err);
            setError(`Failed to update investment plan: ${err.message}`);
        }
    };

    const handleDeletePlan = async (planId) => {
        if (!window.confirm('Are you sure you want to delete this investment plan?')) return;
        try {
            await investmentAPI.deletePlan(planId);
            setInvestmentPlans(prev => prev.filter(plan => plan.id !== planId));
            setError(null);
        } catch (err) {
            console.error('Error deleting plan:', err);
            setError(`Failed to delete investment plan: ${err.message}`);
        }
    };

    const openCreateModal = () => {
        if (!familyProfileId) {
            setError('Family profile ID not available');
            return;
        }
        setEditingPlan(null);
        setIsModalOpen(true);
    };

    const openEditModal = (plan) => {
        setEditingPlan(plan);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingPlan(null);
    };

    // Summary calculations
    const totalPlans = investmentPlans.length;
    const totalGoal = investmentPlans.reduce((sum, plan) => sum + parseFloat(plan.goalAmount || 0), 0);
    const totalSavings = investmentPlans.reduce((sum, plan) => sum + parseFloat(plan.currentSavings || 0), 0);
    const totalMonthlyContrib = investmentPlans.reduce((sum, plan) => sum + parseFloat(plan.monthlyContribution || 0), 0);

    // Show loading if familyProfileId is not yet loaded
    if (loading || familyProfileId === null) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-950 text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-xl">Loading investment plans...</p>
                </div>
            </div>
        );
    }

    // Show error if no family profile found
    if (error && !familyProfileId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-950 text-white">
                <DynamicNavbar />
                <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24 py-8">
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center">
                        <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
                        <p className="text-red-300 mb-6">{error}</p>
                        <p className="text-gray-400 text-sm mb-6">
                            Please complete your family profile setup first.
                        </p>
                        <button
                            onClick={() => window.location.href = '/family-profile'}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                        >
                            Go to Family Profile
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-950 text-white">
            <DynamicNavbar />
            <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24 py-8">
                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                        <p className="text-red-300">{error}</p>
                        <button
                            onClick={() => setError(null)}
                            className="text-red-300 hover:text-red-100 text-sm mt-2"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Header - Family ID Removed */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                            <TrendingUp className="mr-3" size={32} />
                            Investment Planning
                        </h1>
                        <p className="text-gray-300 text-lg">
                            Plan and track your family's investments and savings goals
                        </p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        disabled={!familyProfileId}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-lg px-7 py-3 rounded-lg transition-colors shadow-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="mr-2" size={20} />
                        Add Plan
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <DollarSign className="text-blue-400" size={24} />
                            </div>
                        </div>
                        <h3 className="text-gray-300 text-sm font-medium">Total Current Savings</h3>
                        <p className="text-2xl font-bold text-white">
                            ₹{(totalSavings / 100000).toFixed(1)}L
                        </p>
                        <p className="text-blue-400 text-sm mt-1">Accumulated savings</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-emerald-500/20 rounded-lg">
                                <Target className="text-emerald-400" size={24} />
                            </div>
                        </div>
                        <h3 className="text-gray-300 text-sm font-medium">Monthly Contributions</h3>
                        <p className="text-2xl font-bold text-white">
                            ₹{totalMonthlyContrib.toLocaleString()}
                        </p>
                        <p className="text-emerald-400 text-sm mt-1">Total monthly investments</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-orange-500/20 rounded-lg">
                                <Calendar className="text-orange-400" size={24} />
                            </div>
                        </div>
                        <h3 className="text-gray-300 text-sm font-medium">Total Goals</h3>
                        <p className="text-2xl font-bold text-white">
                            ₹{(totalGoal / 100000).toFixed(1)}L
                        </p>
                        <p className="text-orange-400 text-sm mt-1">Planned investment goals</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <TrendingUp className="text-purple-400" size={24} />
                            </div>
                        </div>
                        <h3 className="text-gray-300 text-sm font-medium">Plans Created</h3>
                        <p className="text-2xl font-bold text-white">{totalPlans}</p>
                        <p className="text-purple-400 text-sm mt-1">Active investment plans</p>
                    </div>
                </div>

                {/* Plan Details Cards */}
                {investmentPlans.length === 0 ? (
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 border border-white/10 text-center">
                        <TrendingUp className="mx-auto text-gray-400 mb-4" size={48} />
                        <h3 className="text-xl font-semibold text-white mb-2">No Investment Plans Yet</h3>
                        <p className="text-gray-300 mb-6">Start planning for your family's financial future</p>
                        <button
                            onClick={openCreateModal}
                            disabled={!familyProfileId}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Create Your First Plan
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {investmentPlans.map(plan => {
                            const shortfall = getShortfall(plan);

                            return (
                                <div key={plan.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                                    {/* Plan Header */}
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="p-3 bg-purple-500/20 rounded-full">
                                                <TrendingUp className="text-purple-400" size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white">{plan.planName}</h3>
                                                <p className="text-gray-300">Target: ₹{parseFloat(plan.goalAmount).toLocaleString()}</p>
                                                <p className="text-gray-400 text-sm">By {plan.targetYear}</p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => openEditModal(plan)}
                                                className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                                            >
                                                <Edit3 className="text-blue-400" size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeletePlan(plan.id)}
                                                className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="text-red-400" size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Plan Details Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                        <div className="bg-white/5 rounded-lg p-4">
                                            <p className="text-gray-400 text-sm">Target Year</p>
                                            <p className="text-white font-semibold text-lg">{plan.targetYear}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-4">
                                            <p className="text-gray-400 text-sm">Expected Return</p>
                                            <p className="text-white font-semibold text-lg">{plan.expectedReturn}%</p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-4">
                                            <p className="text-gray-400 text-sm">Current Savings</p>
                                            <p className="text-white font-semibold text-lg">₹{(parseFloat(plan.currentSavings || 0) / 100000).toFixed(2)}L</p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-4">
                                            <p className="text-gray-400 text-sm">Monthly Contribution</p>
                                            <p className="text-white font-semibold text-lg">₹{parseFloat(plan.monthlyContribution || 0).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {/* Dual Progress Bars */}
                                    <DualProgressBar plan={plan} />

                                    {/* Shortfall Alert */}
                                    {shortfall > 0 && (
                                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mt-6">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <Target className="text-red-400" size={20} />
                                                <p className="text-red-400 font-semibold">
                                                    Shortfall: ₹{(shortfall / 100000).toFixed(1)}L
                                                </p>
                                            </div>
                                            <p className="text-red-300 text-sm">
                                                Consider increasing monthly contribution by ₹{Math.ceil(shortfall / ((plan.targetYear - new Date().getFullYear()) * 12) / 1000) * 1000}
                                            </p>
                                        </div>
                                    )}

                                    {plan.notes && (
                                        <div className="bg-white/5 rounded-lg p-4 mt-4">
                                            <p className="text-gray-400 text-sm">Notes</p>
                                            <p className="text-white font-semibold">{plan.notes}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && familyProfileId && (
                <InvestmentPlanModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    onSave={editingPlan ? handleUpdatePlan : handleCreatePlan}
                    plan={editingPlan}
                    familyProfileId={familyProfileId}
                />
            )}
        </div>
    );
}
