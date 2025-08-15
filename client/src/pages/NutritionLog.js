import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Utensils, Edit, Trash2 } from 'lucide-react';
import { nutritionAPI } from '../utils/api';
import { mealTypes, formatCalories, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const NutritionLog = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [filter, setFilter] = useState('all');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await nutritionAPI.getAll();
      setEntries(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch nutrition logs');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingEntry) {
        await nutritionAPI.update(editingEntry._id, data);
        toast.success('Meal updated successfully');
      } else {
        await nutritionAPI.create(data);
        toast.success('Meal logged successfully');
      }
      fetchEntries();
      reset();
      setShowForm(false);
      setEditingEntry(null);
    } catch (error) {
      toast.error('Failed to save meal');
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    reset(entry);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      try {
        await nutritionAPI.delete(id);
        toast.success('Meal deleted successfully');
        fetchEntries();
      } catch (error) {
        toast.error('Failed to delete meal');
      }
    }
  };

  const filteredEntries = entries.filter((e) => {
    if (filter === 'all') return true;
    return e.mealType === filter;
  });

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nutrition Log</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your daily meals and calories</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Utensils className="h-5 w-5 mr-2" />
          Log Meal
        </button>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          All
        </button>
        {Object.entries(mealTypes).map(([key, value]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filter === key
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingEntry ? 'Edit Meal' : 'Log New Meal'}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Meal Type
                </label>
                <select
                  {...register('mealType', { required: 'Meal type is required' })}
                  className="input"
                >
                  <option value="">Select meal type</option>
                  {Object.entries(mealTypes).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
                {errors.mealType && (
                  <p className="mt-1 text-sm text-danger-600">{errors.mealType.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Food Item
                </label>
                <input
                  type="text"
                  {...register('foodItem', {
                    required: 'Food item is required',
                    minLength: { value: 2, message: 'Must be at least 2 characters' },
                    maxLength: { value: 100, message: 'Cannot exceed 100 characters' }
                  })}
                  className="input"
                  placeholder="e.g., Grilled Chicken Salad"
                />
                {errors.foodItem && (
                  <p className="mt-1 text-sm text-danger-600">{errors.foodItem.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Calories
                </label>
                <input
                  type="number"
                  {...register('calories', {
                    required: 'Calories are required',
                    min: { value: 0, message: 'Calories cannot be negative' },
                    max: { value: 5000, message: 'Calories look too high' }
                  })}
                  className="input"
                  placeholder="450"
                />
                {errors.calories && (
                  <p className="mt-1 text-sm text-danger-600">{errors.calories.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Protein (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  {...register('protein')}
                  className="input"
                  placeholder="30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  {...register('carbs')}
                  className="input"
                  placeholder="40"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fats (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  {...register('fats')}
                  className="input"
                  placeholder="15"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingEntry(null);
                  reset();
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingEntry ? 'Update Meal' : 'Log Meal'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Entries List */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <Utensils className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No meals found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by logging your first meal.
            </p>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div key={entry._id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                      <Utensils className="h-6 w-6 text-primary-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {entry.foodItem}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="capitalize">{mealTypes[entry.mealType] || entry.mealType}</span>
                      <span>{formatCalories(entry.calories)}</span>
                      {typeof entry.protein !== 'undefined' && (
                        <span>Protein: {entry.protein}g</span>
                      )}
                      {typeof entry.carbs !== 'undefined' && (
                        <span>Carbs: {entry.carbs}g</span>
                      )}
                      {typeof entry.fats !== 'undefined' && (
                        <span>Fats: {entry.fats}g</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {formatDate(entry.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(entry)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(entry._id)}
                    className="p-2 text-gray-400 hover:text-danger-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NutritionLog; 