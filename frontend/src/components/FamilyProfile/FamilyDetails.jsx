import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Users,
    DollarSign,
    MapPin,
    Shield,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import axios from 'axios';

const FamilyDetails = () => {
    const navigate = useNavigate();

    // State variables (removed children state)
    const [familySize, setFamilySize] = useState('');
    const [monthlyIncome, setMonthlyIncome] = useState('');
    const [monthlyExpenses, setMonthlyExpenses] = useState('');
    const [location, setLocation] = useState('');
    const [riskTolerance, setRiskTolerance] = useState('moderate');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [errors, setErrors] = useState({});

    // Risk tolerance mapping for backend
    const getRiskToleranceForDb = (riskTolerance) => {
        switch (riskTolerance) {
            case 'conservative': return 'LOW';
            case 'moderate': return 'MEDIUM';
            case 'aggressive': return 'HIGH';
            default: return 'MEDIUM';
        }
    };

    // Form validation (removed children validation)
    const validateForm = () => {
        const newErrors = {};

        if (!familySize || parseInt(familySize) <= 0) {
            newErrors.familySize = 'Family size must be at least 1';
        }

        if (!location.trim()) {
            newErrors.location = 'Location is required';
        }

        if (!monthlyIncome || parseFloat(monthlyIncome) <= 0) {
            newErrors.monthlyIncome = 'Monthly income must be greater than 0';
        }

        if (!monthlyExpenses || parseFloat(monthlyExpenses) < 0) {
            newErrors.monthlyExpenses = 'Monthly expenses cannot be negative';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitStatus(null);
        setErrors({});

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        // Create familyData object matching backend DTO (removed children)
        const familyData = {
            familySize: parseInt(familySize),
            monthlyIncome: parseFloat(monthlyIncome),
            monthlyExpenses: parseFloat(monthlyExpenses),
            location: location.trim(),
            riskTolerance: getRiskToleranceForDb(riskTolerance)
        };

        try {
            // Save family profile
            const response = await axios.post('https://finwise-backend-latest2.onrender.com/api/familyProfile', familyData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Family profile created successfully:', response.data);

            // Update user status to mark as not new user

            setSubmitStatus('success');

            // Redirect to dashboard after success
            setTimeout(() => {
                navigate('/auth/callback');
            }, 2000);

        } catch (error) {
            console.error('Error saving family details:', error);
            setSubmitStatus('error');

            if (error.response) {
                const status = error.response.status;
                const errorData = error.response.data;

                if (status === 401 || status === 403) {
                    setErrors({ submit: 'Session expired. Please log in again.' });
                    setTimeout(() => {
                        navigate('/login');
                    }, 2000);
                } else if (status === 400) {
                    setErrors({ submit: errorData.message || 'Invalid data provided. Please check your inputs.' });
                } else if (status === 500) {
                    setErrors({ submit: 'Server error. Please try again later.' });
                } else {
                    setErrors({ submit: `Error: ${errorData.message || 'Failed to save family details'}` });
                }
            } else if (error.request) {
                setErrors({ submit: 'Network error. Please check your connection.' });
            } else {
                setErrors({ submit: 'An unexpected error occurred. Please try again.' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-950 text-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Family Financial Profile</h1>
                        <p className="text-gray-300">Help us understand your family's financial situation to provide personalized recommendations</p>
                    </div>

                    {/* Success/Error Status */}
                    {submitStatus === 'success' && (
                        <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex items-center">
                            <CheckCircle className="text-emerald-400 mr-2" size={20} />
                            <span className="text-emerald-300">Family profile saved successfully! Redirecting to dashboard...</span>
                        </div>
                    )}

                    {errors.submit && (
                        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center">
                            <AlertCircle className="text-red-400 mr-2" size={20} />
                            <span className="text-red-300">{errors.submit}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Family Information */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                                <Users className="mr-2 text-emerald-400" size={24} />
                                Basic Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Family Size *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={familySize}
                                        onChange={(e) => setFamilySize(e.target.value)}
                                        className={`w-full px-3 py-2 bg-white/10 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-gray-400 ${
                                            errors.familySize ? 'border-red-500' : 'border-white/20'
                                        }`}
                                        placeholder="Number of family members"
                                        required
                                    />
                                    {errors.familySize && (
                                        <p className="mt-1 text-sm text-red-400">{errors.familySize}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        <MapPin className="inline mr-1" size={16} />
                                        Location *
                                    </label>
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className={`w-full px-3 py-2 bg-white/10 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-gray-400 ${
                                            errors.location ? 'border-red-500' : 'border-white/20'
                                        }`}
                                        placeholder="City, State"
                                        required
                                    />
                                    {errors.location && (
                                        <p className="mt-1 text-sm text-red-400">{errors.location}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Financial Information */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                                <DollarSign className="mr-2 text-emerald-400" size={24} />
                                Financial Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Monthly Income (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={monthlyIncome}
                                        onChange={(e) => setMonthlyIncome(e.target.value)}
                                        className={`w-full px-3 py-2 bg-white/10 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-gray-400 ${
                                            errors.monthlyIncome ? 'border-red-500' : 'border-white/20'
                                        }`}
                                        placeholder="Total monthly income"
                                        required
                                    />
                                    {errors.monthlyIncome && (
                                        <p className="mt-1 text-sm text-red-400">{errors.monthlyIncome}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Monthly Expenses (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={monthlyExpenses}
                                        onChange={(e) => setMonthlyExpenses(e.target.value)}
                                        className={`w-full px-3 py-2 bg-white/10 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-gray-400 ${
                                            errors.monthlyExpenses ? 'border-red-500' : 'border-white/20'
                                        }`}
                                        placeholder="Total monthly expenses"
                                        required
                                    />
                                    {errors.monthlyExpenses && (
                                        <p className="mt-1 text-sm text-red-400">{errors.monthlyExpenses}</p>
                                    )}
                                </div>
                            </div>

                            {/* Savings Summary */}
                            {monthlyIncome && monthlyExpenses && !errors.monthlyIncome && !errors.monthlyExpenses && (
                                <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-md">
                                    <p className="text-sm text-emerald-300">
                                        <strong>Monthly Savings: ₹{(parseFloat(monthlyIncome) - parseFloat(monthlyExpenses)).toLocaleString()}</strong>
                                        {parseFloat(monthlyExpenses) > parseFloat(monthlyIncome) && (
                                            <span className="text-red-400 ml-2">(Deficit)</span>
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Risk Tolerance */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                                <Shield className="mr-2 text-emerald-400" size={24} />
                                Investment Risk Tolerance
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { value: 'conservative', label: 'Conservative', desc: 'Low risk, stable returns' },
                                    { value: 'moderate', label: 'Moderate', desc: 'Balanced risk and returns' },
                                    { value: 'aggressive', label: 'Aggressive', desc: 'High risk, high potential returns' }
                                ].map((option) => (
                                    <label key={option.value} className="cursor-pointer">
                                        <input
                                            type="radio"
                                            name="riskTolerance"
                                            value={option.value}
                                            checked={riskTolerance === option.value}
                                            onChange={(e) => setRiskTolerance(e.target.value)}
                                            className="sr-only"
                                        />
                                        <div className={`p-4 border-2 rounded-lg transition-all ${
                                            riskTolerance === option.value
                                                ? 'border-emerald-500 bg-emerald-500/20'
                                                : 'border-white/20 hover:border-white/40 bg-white/5'
                                        }`}>
                                            <div className="font-medium text-white">{option.label}</div>
                                            <div className="text-sm text-gray-300">{option.desc}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="text-center">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`px-8 py-3 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-transparent ${
                                    isSubmitting
                                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                        : 'bg-emerald-500 text-white hover:bg-emerald-600'
                                }`}
                            >
                                {isSubmitting ? 'Saving...' : 'Save Family Profile'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FamilyDetails;
