import React, { useState, useEffect } from 'react';
import { GraduationCap, Calendar, DollarSign, BookOpen, Edit3, Trash2, Target, Plus, X, User, Baby } from 'lucide-react';
import DynamicNavbar from "../DynamicNavbar";
import axios from "axios";

// API Base URL Configuration
const API_BASE_URL = 'https://finwise-backend-latest2.onrender.com';

// Enhanced Prediction API utility
const predictionAPI = {
    async generatePredictions(familyProfileId) {
        try {
            console.log('Generating predictions for familyProfileId:', familyProfileId);
            const response = await axios.get(`${API_BASE_URL}/api/predictions/generate/${familyProfileId}`, {
                withCredentials: true
            });
            console.log('Predictions generated successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error generating predictions:', error);
            throw error;
        }
    }
};

// Complete API service with localhost:8080 endpoints
const familyEducationAPI = {
    // Get family profile and related data
    getFamilyEducationData: async (familyProfileId) => {
        try {
            console.log('Loading family education data for family:', familyProfileId);

            // Get family profile first
            const familyResponse = await fetch(`${API_BASE_URL}/api/familyProfile/${familyProfileId}`, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (!familyResponse.ok) {
                throw new Error(`Failed to fetch family profile: ${familyResponse.status}`);
            }

            const familyProfile = await familyResponse.json();

            // Get all children (filter by familyProfileId on frontend)
            const childrenResponse = await fetch(`${API_BASE_URL}/api/children`, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (!childrenResponse.ok) {
                throw new Error(`Failed to fetch children: ${childrenResponse.status}`);
            }

            const allChildren = await childrenResponse.json();
            const familyChildren = allChildren.filter(child => child.familyProfileId === familyProfileId);

            // Get education plans for each child
            const educationPlans = [];
            for (const child of familyChildren) {
                try {
                    const plansResponse = await fetch(`${API_BASE_URL}/api/education-plans/child/${child.id}`, {
                        headers: { 'Content-Type': 'application/json' }
                    });
                    if (plansResponse.ok) {
                        const childPlans = await plansResponse.json();
                        educationPlans.push(...childPlans);
                    }
                } catch (error) {
                    console.warn(`Failed to load plans for child ${child.id}:`, error);
                }
            }

            return {
                familyId: familyProfileId,
                familyProfile,
                children: familyChildren,
                educationPlans,
                summary: calculateFamilySummary(familyChildren, educationPlans)
            };

        } catch (error) {
            console.error('Error loading family education data:', error);
            throw error;
        }
    },

    // Child management using correct endpoints
    addChildToFamily: async (familyProfileId, childData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/children`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...childData,
                    familyProfileId: familyProfileId
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to add child: ${response.status} - ${errorText}`);
            }

            return response.json();
        } catch (error) {
            console.error('Error adding child to family:', error);
            throw error;
        }
    },

    updateFamilyChild: async (childId, childData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/children/${childId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(childData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to update child: ${response.status} - ${errorText}`);
            }

            return response.json();
        } catch (error) {
            console.error('Error updating family child:', error);
            throw error;
        }
    },

    removeFamilyChild: async (childId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/children/${childId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to remove child: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error('Error removing family child:', error);
            throw error;
        }
    },

    // Education plan management using correct endpoints
    createEducationPlan: async (familyProfileId, planData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/education-plans/${familyProfileId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(planData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to create education plan: ${response.status} - ${errorText}`);
            }

            return response.json();
        } catch (error) {
            console.error('Error creating education plan:', error);
            throw error;
        }
    },

    updateEducationPlan: async (planId, planData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/education-plans/${planId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(planData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to update education plan: ${response.status} - ${errorText}`);
            }

            return response.json();
        } catch (error) {
            console.error('Error updating education plan:', error);
            throw error;
        }
    },

    deleteEducationPlan: async (planId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/education-plans/${planId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to delete education plan: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error('Error deleting education plan:', error);
            throw error;
        }
    }
};

// Helper function to calculate family education summary
const calculateFamilySummary = (children, educationPlans) => {
    return {
        totalChildren: children.length,
        totalPlans: educationPlans.length,
        totalEstimatedCost: educationPlans.reduce((sum, plan) => sum + parseFloat(plan.estimatedTotalCost || 0), 0),
        totalCurrentSavings: educationPlans.reduce((sum, plan) => sum + parseFloat(plan.currentSavings || 0), 0),
        totalMonthlyContribution: educationPlans.reduce((sum, plan) => sum + parseFloat(plan.monthlyContribution || 0), 0),
        childrenByEducationLevel: children.reduce((acc, child) => {
            acc[child.currentEducationLevel] = (acc[child.currentEducationLevel] || 0) + 1;
            return acc;
        }, {})
    };
};

// Dual Progress Bar Component for Education Plans
const DualProgressBar = ({ plan }) => {
    // Calculate years to goal
    const currentYear = new Date().getFullYear();
    const targetYear = parseInt(plan.estimatedStartYear) || currentYear + 1;
    const years = Math.max(0, targetYear - currentYear);

    const currentSavings = parseFloat(plan.currentSavings) || 0;
    const monthlyContrib = parseFloat(plan.monthlyContribution) || 0;
    const inflationRate = 4.00; // Static 4% inflation rate for education
    const estimatedTotal = parseFloat(plan.estimatedTotalCost) || 0;

    // Inflation-adjusted target
    const inflatedCost = estimatedTotal * Math.pow(1 + inflationRate / 100, years);

    // Progress 1: Current Savings Only
    const progressCurrent = inflatedCost > 0 ? Math.min(100, (currentSavings / inflatedCost) * 100) : 0;

    // Progress 2: Projected (Current + Future Contributions)
    let futureValueMonthlyContributions = 0;
    if (monthlyContrib > 0 && inflationRate > 0) {
        const monthlyRate = inflationRate / 100 / 12;
        const totalMonths = years * 12;
        futureValueMonthlyContributions = monthlyContrib *
            ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
    } else if (monthlyContrib > 0) {
        futureValueMonthlyContributions = monthlyContrib * years * 12;
    }
    const futureValueCurrentSavings = currentSavings * Math.pow(1 + inflationRate / 100, years);
    const totalFutureValue = futureValueCurrentSavings + futureValueMonthlyContributions;
    const progressProjected = inflatedCost > 0 ? Math.min(100, (totalFutureValue / inflatedCost) * 100) : 0;

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
                    Saved: ₹{(currentSavings / 100000).toFixed(2)}L / Target: ₹{(inflatedCost / 100000).toFixed(2)}L
                </div>
            </div>

            {/* Projected Progress (Current + Future Contributions) */}
            <div className="bg-white/5 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center space-x-2">
                        <span className="text-lg">{projectedStatus.icon}</span>
                        <span className="text-gray-300 font-medium">Projected Progress (with future savings)</span>
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
                    Projected: ₹{(totalFutureValue / 100000).toFixed(2)}L / Target: ₹{(inflatedCost / 100000).toFixed(2)}L
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

// Family Child Form Component
const FamilyChildForm = ({ child, onSave, onCancel, familyProfileId }) => {
    const [formData, setFormData] = useState({
        name: child?.name || '',
        dateOfBirth: child?.dateOfBirth || '',
        currentEducationLevel: child?.currentEducationLevel || '',
        familyProfileId: familyProfileId
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (child) {
            setFormData({
                name: child.name || '',
                dateOfBirth: child.dateOfBirth || '',
                currentEducationLevel: child.currentEducationLevel || '',
                familyProfileId: child.familyProfileId || familyProfileId
            });
        } else {
            setFormData({
                name: '',
                dateOfBirth: '',
                currentEducationLevel: '',
                familyProfileId: familyProfileId
            });
        }
    }, [child, familyProfileId]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name?.trim()) {
            newErrors.name = 'Child name is required';
        } else if (formData.name.length < 2 || formData.name.length > 100) {
            newErrors.name = 'Name must be between 2 and 100 characters';
        }

        if (!formData.dateOfBirth) {
            newErrors.dateOfBirth = 'Date of birth is required';
        } else if (new Date(formData.dateOfBirth) >= new Date()) {
            newErrors.dateOfBirth = 'Date of birth must be in the past';
        }

        if (!formData.currentEducationLevel?.trim()) {
            newErrors.currentEducationLevel = 'Current education level is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            if (child?.id) {
                await familyEducationAPI.updateFamilyChild(child.id, formData);
            } else {
                await familyEducationAPI.addChildToFamily(familyProfileId, formData);
            }
            onSave();
        } catch (error) {
            console.error('Error saving child:', error);
            alert(`Failed to save child: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 w-full max-w-md border border-white/20">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">
                        {child ? 'Edit Family Member' : 'Add Family Member'}
                    </h2>
                    <button onClick={onCancel} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            Child Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                            placeholder="Enter child's name"
                            required
                        />
                        {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            Date of Birth <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                            max={new Date().toISOString().split('T')[0]}
                            required
                        />
                        {errors.dateOfBirth && <p className="text-red-400 text-sm mt-1">{errors.dateOfBirth}</p>}
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            Current Education Level <span className="text-red-400">*</span>
                        </label>
                        <select
                            value={formData.currentEducationLevel}
                            onChange={(e) => setFormData({...formData, currentEducationLevel: e.target.value})}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                            required
                        >
                            <option value="">Select Education Level</option>
                            <option value="Pre-School" className="bg-gray-800">Pre-School</option>
                            <option value="Primary School" className="bg-gray-800">Primary School</option>
                            <option value="Secondary School" className="bg-gray-800">Secondary School</option>
                            <option value="Higher Secondary" className="bg-gray-800">Higher Secondary</option>
                            <option value="Undergraduate" className="bg-gray-800">Undergraduate</option>
                            <option value="Postgraduate" className="bg-gray-800">Postgraduate</option>
                            <option value="Completed Education" className="bg-gray-800">Completed Education</option>
                        </select>
                        {errors.currentEducationLevel && <p className="text-red-400 text-sm mt-1">{errors.currentEducationLevel}</p>}
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : (child ? 'Update Member' : 'Add Member')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Family Education Plan Form Component
const FamilyEducationPlanForm = ({ plan, onSave, onCancel, familyProfileId, children }) => {
    const [formData, setFormData] = useState({
        planName: plan?.planName || '',
        educationLevel: plan?.educationLevel || '',
        institutionType: plan?.institutionType || '',
        estimatedStartYear: plan?.estimatedStartYear || new Date().getFullYear() + 1,
        estimatedEndYear: plan?.estimatedEndYear || new Date().getFullYear() + 5,
        estimatedTotalCost: plan?.estimatedTotalCost || '',
        currentSavings: plan?.currentSavings || '',
        notes: plan?.notes || '',
        childId: plan?.childId || (children[0]?.id || '')
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (plan) {
            setFormData({
                planName: plan.planName || '',
                educationLevel: plan.educationLevel || '',
                institutionType: plan.institutionType || '',
                estimatedStartYear: plan.estimatedStartYear || new Date().getFullYear() + 1,
                estimatedEndYear: plan.estimatedEndYear || new Date().getFullYear() + 5,
                estimatedTotalCost: plan.estimatedTotalCost || '',
                currentSavings: plan.currentSavings || '',
                notes: plan.notes || '',
                childId: plan.childId || (children[0]?.id || '')
            });
        } else {
            setFormData({
                planName: '',
                educationLevel: '',
                institutionType: '',
                estimatedStartYear: new Date().getFullYear() + 1,
                estimatedEndYear: new Date().getFullYear() + 5,
                estimatedTotalCost: '',
                currentSavings: '',
                notes: '',
                childId: children[0]?.id || ''
            });
        }
    }, [plan, children]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.planName.trim()) newErrors.planName = 'Plan name is required';
        if (!formData.educationLevel.trim()) newErrors.educationLevel = 'Education level is required';
        if (!formData.institutionType.trim()) newErrors.institutionType = 'Institution type is required';
        if (!formData.childId) newErrors.childId = 'Child selection is required';

        if (formData.estimatedStartYear < 1900 || formData.estimatedStartYear > 2100) {
            newErrors.estimatedStartYear = 'Start year must be between 1900 and 2100';
        }
        if (formData.estimatedEndYear < 1900 || formData.estimatedEndYear > 2100) {
            newErrors.estimatedEndYear = 'End year must be between 1900 and 2100';
        }
        if (formData.estimatedEndYear <= formData.estimatedStartYear) {
            newErrors.estimatedEndYear = 'End year must be after start year';
        }

        if (!formData.estimatedTotalCost || parseFloat(formData.estimatedTotalCost) <= 0) {
            newErrors.estimatedTotalCost = 'Total cost must be positive';
        }
        if (parseFloat(formData.currentSavings) < 0) {
            newErrors.currentSavings = 'Current savings cannot be negative';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const planData = {
                ...formData,
                estimatedTotalCost: parseFloat(formData.estimatedTotalCost),
                currentSavings: parseFloat(formData.currentSavings || 0),
                monthlyContribution: parseFloat(formData.monthlyContribution || 0),
                inflationRate: 4.00 // Static 4% inflation rate
            };

            console.log('Sending plan data with static 4% inflation:', planData);

            if (plan?.id) {
                await familyEducationAPI.updateEducationPlan(plan.id, planData);
            } else {
                await familyEducationAPI.createEducationPlan(familyProfileId, planData);
            }
            onSave();
        } catch (error) {
            console.error('Error saving education plan:', error);
            alert(`Failed to save education plan: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/20">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">
                        {plan ? 'Edit Education Plan' : 'Create Education Plan'}
                    </h2>
                    <button onClick={onCancel} className="text-gray-400 hover:text-white">
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
                                onChange={(e) => setFormData({...formData, planName: e.target.value})}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                                placeholder="e.g., John's Engineering Degree"
                                required
                            />
                            {errors.planName && <p className="text-red-400 text-sm mt-1">{errors.planName}</p>}
                        </div>

                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Child *</label>
                            <select
                                value={formData.childId}
                                onChange={(e) => setFormData({...formData, childId: e.target.value})}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                                required
                            >
                                <option value="">Select Child</option>
                                {children.map(child => (
                                    <option key={child.id} value={child.id} className="bg-gray-800">
                                        {child.name}
                                    </option>
                                ))}
                            </select>
                            {errors.childId && <p className="text-red-400 text-sm mt-1">{errors.childId}</p>}
                        </div>

                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Education Level *</label>
                            <select
                                value={formData.educationLevel}
                                onChange={(e) => setFormData({...formData, educationLevel: e.target.value})}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                                required
                            >
                                <option value="">Select Level</option>
                                <option value="Primary School" className="bg-gray-800">Primary School</option>
                                <option value="Secondary School" className="bg-gray-800">Secondary School</option>
                                <option value="Higher Secondary" className="bg-gray-800">Higher Secondary</option>
                                <option value="Undergraduate" className="bg-gray-800">Undergraduate</option>
                                <option value="Postgraduate" className="bg-gray-800">Postgraduate</option>
                                <option value="Professional Course" className="bg-gray-800">Professional Course</option>
                            </select>
                            {errors.educationLevel && <p className="text-red-400 text-sm mt-1">{errors.educationLevel}</p>}
                        </div>

                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Institution Type *</label>
                            <select
                                value={formData.institutionType}
                                onChange={(e) => setFormData({...formData, institutionType: e.target.value})}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                                required
                            >
                                <option value="">Select Type</option>
                                <option value="Government" className="bg-gray-800">Government</option>
                                <option value="Private" className="bg-gray-800">Private</option>
                                <option value="International" className="bg-gray-800">International</option>
                                <option value="Online" className="bg-gray-800">Online</option>
                            </select>
                            {errors.institutionType && <p className="text-red-400 text-sm mt-1">{errors.institutionType}</p>}
                        </div>

                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Start Year *</label>
                            <input
                                type="number"
                                value={formData.estimatedStartYear}
                                onChange={(e) => setFormData({...formData, estimatedStartYear: parseInt(e.target.value)})}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                                min="1900"
                                max="2100"
                                required
                            />
                            {errors.estimatedStartYear && <p className="text-red-400 text-sm mt-1">{errors.estimatedStartYear}</p>}
                        </div>

                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">End Year *</label>
                            <input
                                type="number"
                                value={formData.estimatedEndYear}
                                onChange={(e) => setFormData({...formData, estimatedEndYear: parseInt(e.target.value)})}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                                min="1900"
                                max="2100"
                                required
                            />
                            {errors.estimatedEndYear && <p className="text-red-400 text-sm mt-1">{errors.estimatedEndYear}</p>}
                        </div>

                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Estimated Total Cost (₹) *</label>
                            <input
                                type="number"
                                value={formData.estimatedTotalCost}
                                onChange={(e) => setFormData({...formData, estimatedTotalCost: e.target.value})}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                                min="0"
                                step="1000"
                                required
                            />
                            {errors.estimatedTotalCost && <p className="text-red-400 text-sm mt-1">{errors.estimatedTotalCost}</p>}
                        </div>

                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Current Savings (₹)</label>
                            <input
                                type="number"
                                value={formData.currentSavings}
                                onChange={(e) => setFormData({...formData, currentSavings: e.target.value})}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                                min="0"
                                step="1000"
                            />
                            {errors.currentSavings && <p className="text-red-400 text-sm mt-1">{errors.currentSavings}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                            rows="3"
                            placeholder="Additional notes about this education plan..."
                        />
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : (plan ? 'Update Plan' : 'Create Plan')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Main Family Education Page Component
export default function FamilyEducationPage() {
    const [familyData, setFamilyData] = useState({
        familyId: null,
        familyProfile: null,
        children: [],
        educationPlans: [],
        summary: {}
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showChildForm, setShowChildForm] = useState(false);
    const [showPlanForm, setShowPlanForm] = useState(false);
    const [editingChild, setEditingChild] = useState(null);
    const [editingPlan, setEditingPlan] = useState(null);
    const [familyProfileId, setFamilyProfileId] = useState(null);
    const [predictionsLoading, setPredictionsLoading] = useState(false);

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

    // Enhanced prediction generation function
    const generatePredictions = async (familyId = null) => {
        const targetFamilyId = familyId || familyProfileId;

        if (!targetFamilyId) {
            console.error('Family profile ID not available for predictions');
            return;
        }

        try {
            setPredictionsLoading(true);
            await predictionAPI.generatePredictions(targetFamilyId);
        } catch (error) {
            console.error('Failed to generate predictions:', error);
        } finally {
            setPredictionsLoading(false);
        }
    };

    // Generate predictions on page load
    useEffect(() => {
        if (familyProfileId) {
            generatePredictions(familyProfileId);
        }
    }, [familyProfileId]);

    // Generate predictions whenever education plans change
    useEffect(() => {
        if (familyData.educationPlans.length > 0 && familyProfileId) {
            generatePredictions(familyProfileId);
        }
    }, [familyData.educationPlans, familyProfileId]);

    // Load data when familyProfileId is available
    useEffect(() => {
        if (familyProfileId) {
            loadFamilyEducationData();
        }
    }, [familyProfileId]);

    // Load complete family education data
    const loadFamilyEducationData = async () => {
        if (!familyProfileId) {
            console.warn('No family profile ID available, skipping data load');
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            console.log('Loading family education data for family ID:', familyProfileId);
            const data = await familyEducationAPI.getFamilyEducationData(familyProfileId);
            setFamilyData(data);
            console.log('Family education data loaded:', data);
            setError(null);
        } catch (error) {
            console.error('Error loading family education data:', error);

            // More specific error handling
            if (error.message.includes('404')) {
                setError('Family profile not found. Please complete your family setup first.');
            } else {
                setError(`Failed to load family education data: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle child operations
    const handleChildSave = async () => {
        setShowChildForm(false);
        setEditingChild(null);
        await loadFamilyEducationData();
        // Generate predictions after child operations
        await generatePredictions(familyProfileId);
    };

    const handleChildDelete = async (childId) => {
        if (!window.confirm('Are you sure you want to remove this family member? This will also delete all associated education plans.')) return;

        try {
            await familyEducationAPI.removeFamilyChild(childId);
            await loadFamilyEducationData();
            // Generate predictions after deletion
            await generatePredictions(familyProfileId);
        } catch (error) {
            console.error('Error removing family member:', error);
            setError(`Failed to remove family member: ${error.message}`);
        }
    };

    // Handle education plan operations
    const handlePlanSave = async () => {
        setShowPlanForm(false);
        setEditingPlan(null);
        await loadFamilyEducationData();
        // Generate predictions after plan operations
        await generatePredictions(familyProfileId);
    };

    const handlePlanDelete = async (planId) => {
        if (!window.confirm('Are you sure you want to delete this education plan?')) return;

        try {
            await familyEducationAPI.deleteEducationPlan(planId);
            await loadFamilyEducationData();
            // Generate predictions after deletion
            await generatePredictions(familyProfileId);
        } catch (error) {
            console.error('Error deleting education plan:', error);
            setError(`Failed to delete education plan: ${error.message}`);
        }
    };

    const openChildForm = () => {
        if (!familyProfileId) {
            setError('Family profile ID not available');
            return;
        }
        setEditingChild(null);
        setShowChildForm(true);
    };

    const openPlanForm = () => {
        if (!familyProfileId) {
            setError('Family profile ID not available');
            return;
        }
        if (familyData.children.length === 0) {
            setError('Please add at least one family member before creating education plans');
            return;
        }
        setEditingPlan(null);
        setShowPlanForm(true);
    };

    const openEditChildForm = (child) => {
        setEditingChild(child);
        setShowChildForm(true);
    };

    const openEditPlanForm = (plan) => {
        setEditingPlan(plan);
        setShowPlanForm(true);
    };

    const closeChildForm = () => {
        setShowChildForm(false);
        setEditingChild(null);
    };

    const closePlanForm = () => {
        setShowPlanForm(false);
        setEditingPlan(null);
    };

    // Manual refresh function for predictions
    const refreshPredictions = async () => {
        await generatePredictions(familyProfileId);
    };

    // Progress calculation functions with static 4% inflation
    const getProgress = (plan) => {
        const currentYear = new Date().getFullYear();
        const yearsToStart = plan.estimatedStartYear - currentYear;

        if (yearsToStart <= 0) {
            const inflatedCost = parseFloat(plan.estimatedTotalCost);
            const currentSavings = parseFloat(plan.currentSavings || 0);
            return Math.min(100, (currentSavings / inflatedCost) * 100);
        }

        const currentSavings = parseFloat(plan.currentSavings || 0);
        const monthlyContribution = parseFloat(plan.monthlyContribution || 0);
        const annualInflationRate = 4.00 / 100;
        const monthlyInflationRate = annualInflationRate / 12;
        const monthsToStart = yearsToStart * 12;

        const futureValueCurrentSavings = currentSavings * Math.pow(1 + annualInflationRate, yearsToStart);

        let futureValueContributions = 0;
        if (monthlyContribution > 0 && monthlyInflationRate > 0) {
            futureValueContributions = monthlyContribution *
                ((Math.pow(1 + monthlyInflationRate, monthsToStart) - 1) / monthlyInflationRate);
        } else if (monthlyContribution > 0) {
            futureValueContributions = monthlyContribution * monthsToStart;
        }

        const totalFutureValue = futureValueCurrentSavings + futureValueContributions;
        const inflatedCost = parseFloat(plan.estimatedTotalCost) * Math.pow(1 + annualInflationRate, yearsToStart);
        const progress = (totalFutureValue / inflatedCost) * 100;

        return Math.min(100, Math.max(0, progress));
    };

    const getShortfall = (plan) => {
        const currentYear = new Date().getFullYear();
        const yearsToStart = plan.estimatedStartYear - currentYear;

        if (yearsToStart <= 0) {
            const inflatedCost = parseFloat(plan.estimatedTotalCost);
            const currentSavings = parseFloat(plan.currentSavings || 0);
            return Math.max(0, inflatedCost - currentSavings);
        }

        const currentSavings = parseFloat(plan.currentSavings || 0);
        const monthlyContribution = parseFloat(plan.monthlyContribution || 0);
        const annualInflationRate = 4.00 / 100;
        const monthlyInflationRate = annualInflationRate / 12;
        const monthsToStart = yearsToStart * 12;

        const futureValueCurrentSavings = currentSavings * Math.pow(1 + annualInflationRate, yearsToStart);

        let futureValueContributions = 0;
        if (monthlyContribution > 0 && monthlyInflationRate > 0) {
            futureValueContributions = monthlyContribution *
                ((Math.pow(1 + monthlyInflationRate, monthsToStart) - 1) / monthlyInflationRate);
        } else if (monthlyContribution > 0) {
            futureValueContributions = monthlyContribution * monthsToStart;
        }

        const totalFutureValue = futureValueCurrentSavings + futureValueContributions;
        const inflatedCost = parseFloat(plan.estimatedTotalCost) * Math.pow(1 + annualInflationRate, yearsToStart);

        return Math.max(0, inflatedCost - totalFutureValue);
    };

    const calculateAge = (dateOfBirth) => {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    // Show loading if familyProfileId is not yet loaded
    if (loading || familyProfileId === null) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-950 text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-xl">Loading family education data...</p>
                </div>
            </div>
        );
    }

    // Show initial setup if no children exist
    if (familyData.children.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-950 text-white">
                <DynamicNavbar />

                <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24 py-8">
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

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center">
                            <GraduationCap className="mr-3" size={32} />
                            Family Education Planning
                        </h1>
                        <p className="text-gray-300 text-lg">
                            Let's plan your family's educational future.
                        </p>
                        {predictionsLoading && (
                            <div className="flex items-center justify-center mt-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-400 mr-2"></div>
                                <p className="text-emerald-400 text-sm">Updating predictions...</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 border border-white/10 text-center">
                        <Baby className="mx-auto mb-4 text-gray-400" size={64} />
                        <h3 className="text-2xl font-semibold text-white mb-4">
                            Start Your Family Education Journey
                        </h3>
                        <p className="text-gray-300 mb-8 text-lg">
                            Add your family members to begin planning their educational future together.
                        </p>
                        <button
                            onClick={openChildForm}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors text-lg flex items-center mx-auto"
                        >
                            <User className="mr-2" size={20} />
                            Add First Family Member
                        </button>
                    </div>
                </div>

                {showChildForm && (
                    <FamilyChildForm
                        child={editingChild}
                        onSave={handleChildSave}
                        onCancel={closeChildForm}
                        familyProfileId={familyProfileId}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-950 text-white">
            <DynamicNavbar />

            <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24 py-8">
                {/* Header - Family ID Removed */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                            <GraduationCap className="mr-3" size={32} />
                            Family Education Planning
                        </h1>
                        <p className="text-gray-300 text-lg">
                            Comprehensive education planning for your family.
                        </p>
                        {predictionsLoading && (
                            <div className="flex items-center mt-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-400 mr-2"></div>
                                <p className="text-emerald-400 text-sm">Updating predictions...</p>
                            </div>
                        )}
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={refreshPredictions}
                            disabled={predictionsLoading}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-5 py-3 rounded-lg transition-colors shadow-lg flex items-center disabled:opacity-50"
                        >
                            {predictionsLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                                <Target className="mr-2" size={18} />
                            )}
                            Refresh Predictions
                        </button>
                        <button
                            onClick={openChildForm}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center"
                        >
                            <User className="mr-2" size={20} />
                            Add Family Member
                        </button>
                        <button
                            onClick={openPlanForm}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center"
                        >
                            <Plus className="mr-2" size={20} />
                            Add Education Plan
                        </button>
                    </div>
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

                {/* Family Overview */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Family Members</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {familyData.children.map(child => (
                            <div key={child.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-blue-500/20 rounded-full">
                                            <User className="text-blue-400" size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-semibold">{child.name}</h3>
                                            <p className="text-gray-400 text-sm">Age: {calculateAge(child.dateOfBirth)}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-1">
                                        <button
                                            onClick={() => openEditChildForm(child)}
                                            className="p-1 bg-blue-500/20 hover:bg-blue-500/30 rounded transition-colors"
                                        >
                                            <Edit3 className="text-blue-400" size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleChildDelete(child.id)}
                                            className="p-1 bg-red-500/20 hover:bg-red-500/30 rounded transition-colors"
                                        >
                                            <Trash2 className="text-red-400" size={14} />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-gray-300 text-sm">
                                    Current Level: {child.currentEducationLevel}
                                </p>
                                <p className="text-gray-400 text-xs mt-1">
                                    Plans: {familyData.educationPlans.filter(plan => plan.childId === child.id).length}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Family Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <DollarSign className="text-blue-400" size={24} />
                            </div>
                        </div>
                        <h3 className="text-gray-300 text-sm font-medium">Total Family Savings</h3>
                        <p className="text-2xl font-bold text-white">
                            ₹{(familyData.summary.totalCurrentSavings / 100000).toFixed(1)}L
                        </p>
                        <p className="text-blue-400 text-sm mt-1">
                            Accumulated across all plans
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-emerald-500/20 rounded-lg">
                                <Target className="text-emerald-400" size={24} />
                            </div>
                        </div>
                        <h3 className="text-gray-300 text-sm font-medium">Monthly Family Contribution</h3>
                        <p className="text-2xl font-bold text-white">
                            ₹{familyData.summary.totalMonthlyContribution.toLocaleString()}
                        </p>
                        <p className="text-emerald-400 text-sm mt-1">
                            Total monthly investment
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-orange-500/20 rounded-lg">
                                <Calendar className="text-orange-400" size={24} />
                            </div>
                        </div>
                        <h3 className="text-gray-300 text-sm font-medium">Total Education Investment</h3>
                        <p className="text-2xl font-bold text-white">
                            ₹{(familyData.summary.totalEstimatedCost / 100000).toFixed(1)}L
                        </p>
                        <p className="text-orange-400 text-sm mt-1">
                            Future education costs
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <BookOpen className="text-purple-400" size={24} />
                            </div>
                        </div>
                        <h3 className="text-gray-300 text-sm font-medium">Active Education Plans</h3>
                        <p className="text-2xl font-bold text-white">
                            {familyData.summary.totalPlans}
                        </p>
                        <p className="text-purple-400 text-sm mt-1">
                            For {familyData.summary.totalChildren} family members
                        </p>
                    </div>
                </div>

                {/* Education Plans */}
                <div className="space-y-6">
                    {familyData.educationPlans.length === 0 ? (
                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 border border-white/10 text-center">
                            <GraduationCap className="mx-auto mb-4 text-gray-400" size={48} />
                            <h3 className="text-xl font-semibold text-white mb-2">No Education Plans Yet</h3>
                            <p className="text-gray-300 mb-6">Start planning your family's educational future by creating your first plan.</p>
                            <button
                                onClick={openPlanForm}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                            >
                                Create First Plan
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {familyData.educationPlans.map(plan => {
                                const shortfall = getShortfall(plan);
                                const childName = familyData.children.find(child => child.id === plan.childId)?.name || 'Unknown Child';

                                return (
                                    <div key={plan.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-purple-500/20 rounded-full">
                                        <GraduationCap className="text-purple-400" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{plan.planName}</h3>
                                        <p className="text-gray-300">Family Member: {childName}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => openEditPlanForm(plan)}
                                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                                    >
                                        <Edit3 className="text-blue-400" size={18} />
                                    </button>
                                    <button
                                        onClick={() => handlePlanDelete(plan.id)}
                                        className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="text-red-400" size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <div className="bg-white/5 rounded-lg p-4">
                                    <p className="text-gray-400 text-sm">Education Level</p>
                                    <p className="text-white font-semibold text-lg">{plan.educationLevel}</p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-4">
                                    <p className="text-gray-400 text-sm">Institution Type</p>
                                    <p className="text-white font-semibold text-lg">{plan.institutionType}</p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-4">
                                    <p className="text-gray-400 text-sm">Duration</p>
                                    <p className="text-white font-semibold text-lg">
                                        {plan.estimatedStartYear} - {plan.estimatedEndYear}
                                    </p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-4">
                                    <p className="text-gray-400 text-sm">Estimated Cost</p>
                                    <p className="text-white font-semibold text-lg">
                                        ₹{(parseFloat(plan.estimatedTotalCost) / 100000).toFixed(1)}L
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-white/5 rounded-lg p-4">
                                    <p className="text-gray-400 text-sm">Current Savings</p>
                                    <p className="text-white font-semibold text-lg">
                                        ₹{(parseFloat(plan.currentSavings || 0) / 100000).toFixed(2)}L
                                    </p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-4">
                                    <p className="text-gray-400 text-sm">Monthly Contribution</p>
                                    <p className="text-white font-semibold text-lg">
                                        ₹{parseFloat(plan.monthlyContribution || 0).toLocaleString()}
                                    </p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-4">
                                    <p className="text-gray-400 text-sm">Inflation Rate</p>
                                    <p className="text-white font-semibold text-lg">4.00%</p>
                                </div>
                            </div>

                            {plan.notes && (
                                <div className="bg-white/5 rounded-lg p-4 mb-6">
                                    <p className="text-gray-400 text-sm">Notes</p>
                                    <p className="text-white font-semibold">{plan.notes}</p>
                                </div>
                            )}

                            {/* Dual Progress Bars */}
                            <DualProgressBar plan={plan} />

                            {shortfall > 0 && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mt-6">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Target className="text-red-400" size={20} />
                                        <p className="text-red-400 font-semibold">
                                            Shortfall: ₹{(shortfall / 100000).toFixed(1)}L
                                        </p>
                                    </div>
                                    <p className="text-red-300 text-sm">
                                        Consider increasing monthly contribution by ₹{Math.ceil(shortfall / ((plan.estimatedStartYear - new Date().getFullYear()) * 12) / 1000) * 1000}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                    })}
                </div>
                )}
            </div>
        </div>

    {/* Modals */}
    {showChildForm && (
        <FamilyChildForm
            child={editingChild}
            onSave={handleChildSave}
            onCancel={closeChildForm}
            familyProfileId={familyProfileId}
        />
    )}

    {showPlanForm && (
        <FamilyEducationPlanForm
            plan={editingPlan}
            onSave={handlePlanSave}
            onCancel={closePlanForm}
            familyProfileId={familyProfileId}
            children={familyData.children}
        />
    )}
</div>
);
}

