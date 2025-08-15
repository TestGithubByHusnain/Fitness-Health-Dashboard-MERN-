import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, Droplets, TrendingUp } from 'lucide-react';
import { waterAPI } from '../utils/api';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const WaterTracker = () => {
  const [waterIntake, setWaterIntake] = useState([]);
  const [todayIntake, setTodayIntake] = useState({ glasses: 0, amount: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingIntake, setEditingIntake] = useState(null);
  const [stats, setStats] = useState({});

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    fetchWaterData();
  }, []);

  const fetchWaterData = async () => {
    try {
      const [intakeRes, todayRes, statsRes] = await Promise.all([
        waterAPI.getAll(),
        waterAPI.getToday(),
        waterAPI.getStats({ period: 7 })
      ]);
      
      setWaterIntake(intakeRes.data.data);
      setTodayIntake(todayRes.data.data);
      setStats(statsRes.data.data);
    } catch (error) {
      toast.error('Failed to fetch water intake data');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingIntake) {
        await waterAPI.update(editingIntake._id, data);
        toast.success('Water intake updated successfully');
      } else {
        await waterAPI.create(data);
        toast.success('Water intake logged successfully');
      }
      fetchWaterData();
      reset();
      setShowForm(false);
      setEditingIntake(null);
    } catch (error) {
      toast.error('Failed to save water intake');
    }
  };

  const handleEdit = (intake) => {
    setEditingIntake(intake);
    reset(intake);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this water intake log?')) {
      try {
        await waterAPI.delete(id);
        toast.success('Water intake deleted successfully');
        fetchWaterData();
      } catch (error) {
        toast.error('Failed to delete water intake');
      }
    }
  };

  const quickAdd = async (glasses) => {
    try {
      const amount = glasses * 250; // Assuming 250ml per glass
      await waterAPI.create({ glasses, amount });
      toast.success(`${glasses} glass${glasses > 1 ? 'es' : ''} of water added!`);
      fetchWaterData();
    } catch (error) {
      toast.error('Failed to add water intake');
    }
  };

  // Chart data for the last 7 days
  const chartData = waterIntake
    .slice(-7)
    .map(item => ({
      date: formatDate(item.date),
      glasses: item.glasses,
      amount: item.amount
    }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Water Intake Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your daily water consumption
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          <Plus className="h-5 w-5 mr-2" />
          Log Water
        </button>
      </div>

      {/* Today's Progress */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Today's Progress
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {todayIntake.glasses}/8
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Glasses</div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((todayIntake.glasses / 8) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {todayIntake.amount}ml
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Amount</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {((todayIntake.glasses / 8) * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Goal Progress</div>
          </div>
        </div>

        {/* Quick Add Buttons */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Quick Add
          </h4>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((glasses) => (
              <button
                key={glasses}
                onClick={() => quickAdd(glasses)}
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium transition-colors"
              >
                +{glasses} Glass{glasses > 1 ? 'es' : ''}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Weekly Water Intake
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="glasses" fill="#3b82f6" name="Glasses" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingIntake ? 'Edit Water Intake' : 'Log Water Intake'}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Number of Glasses
                </label>
                <input
                  type="number"
                  {...register('glasses', {
                    required: 'Number of glasses is required',
                    min: { value: 0, message: 'Glasses cannot be negative' },
                    max: { value: 50, message: 'Glasses cannot exceed 50' }
                  })}
                  className="input"
                  placeholder="8"
                />
                {errors.glasses && (
                  <p className="mt-1 text-sm text-danger-600">{errors.glasses.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount (ml)
                </label>
                <input
                  type="number"
                  {...register('amount', {
                    required: 'Amount is required',
                    min: { value: 0, message: 'Amount cannot be negative' },
                    max: { value: 5000, message: 'Amount cannot exceed 5000ml' }
                  })}
                  className="input"
                  placeholder="2000"
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-danger-600">{errors.amount.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingIntake(null);
                  reset();
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingIntake ? 'Update Water Intake' : 'Log Water Intake'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Water Intake History */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Water Intake History
        </h3>
        <div className="space-y-4">
          {waterIntake.length === 0 ? (
            <div className="text-center py-8">
              <Droplets className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No water intake logs found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by logging your first water intake.
              </p>
            </div>
          ) : (
            waterIntake.map((intake) => (
              <div key={intake._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Droplets className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {intake.glasses} Glass{intake.glasses !== 1 ? 'es' : ''} of Water
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {intake.amount}ml • {formatDate(intake.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(intake)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(intake._id)}
                    className="p-2 text-gray-400 hover:text-danger-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default WaterTracker; 