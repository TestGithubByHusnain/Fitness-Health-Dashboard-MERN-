import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, Activity, Clock, Flame } from 'lucide-react';
import { workoutAPI } from '../utils/api';
import { workoutTypes, workoutIntensities, formatTime, formatCalories, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const ActivityTracker = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [filter, setFilter] = useState('all');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const response = await workoutAPI.getAll();
      setWorkouts(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch workouts');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingWorkout) {
        await workoutAPI.update(editingWorkout._id, data);
        toast.success('Workout updated successfully');
      } else {
        await workoutAPI.create(data);
        toast.success('Workout logged successfully');
      }
      fetchWorkouts();
      reset();
      setShowForm(false);
      setEditingWorkout(null);
    } catch (error) {
      toast.error('Failed to save workout');
    }
  };

  const handleEdit = (workout) => {
    setEditingWorkout(workout);
    reset(workout);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
        await workoutAPI.delete(id);
        toast.success('Workout deleted successfully');
        fetchWorkouts();
      } catch (error) {
        toast.error('Failed to delete workout');
      }
    }
  };

  const filteredWorkouts = workouts.filter(workout => {
    if (filter === 'all') return true;
    return workout.type === filter;
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Activity Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Log and track your workouts
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          <Plus className="h-5 w-5 mr-2" />
          Log Workout
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
        {Object.entries(workoutTypes).map(([key, value]) => (
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
            {editingWorkout ? 'Edit Workout' : 'Log New Workout'}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Workout Type
                </label>
                <select
                  {...register('type', { required: 'Workout type is required' })}
                  className="input"
                >
                  <option value="">Select type</option>
                  {Object.entries(workoutTypes).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-danger-600">{errors.type.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  {...register('duration', {
                    required: 'Duration is required',
                    min: { value: 1, message: 'Duration must be at least 1 minute' },
                    max: { value: 480, message: 'Duration cannot exceed 8 hours' }
                  })}
                  className="input"
                  placeholder="30"
                />
                {errors.duration && (
                  <p className="mt-1 text-sm text-danger-600">{errors.duration.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Calories Burned
                </label>
                <input
                  type="number"
                  {...register('caloriesBurned', {
                    required: 'Calories burned is required',
                    min: { value: 0, message: 'Calories cannot be negative' }
                  })}
                  className="input"
                  placeholder="300"
                />
                {errors.caloriesBurned && (
                  <p className="mt-1 text-sm text-danger-600">{errors.caloriesBurned.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Intensity
                </label>
                <select
                  {...register('intensity')}
                  className="input"
                >
                  {Object.entries(workoutIntensities).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (optional)
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="input"
                placeholder="Describe your workout..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingWorkout(null);
                  reset();
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingWorkout ? 'Update Workout' : 'Log Workout'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Workouts List */}
      <div className="space-y-4">
        {filteredWorkouts.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No workouts found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by logging your first workout.
            </p>
          </div>
        ) : (
          filteredWorkouts.map((workout) => (
            <div key={workout._id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                      <Activity className="h-6 w-6 text-primary-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {workoutTypes[workout.type]}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatTime(workout.duration)}
                      </div>
                      <div className="flex items-center">
                        <Flame className="h-4 w-4 mr-1" />
                        {formatCalories(workout.caloriesBurned)}
                      </div>
                      <span className="capitalize">{workout.intensity}</span>
                    </div>
                    {workout.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {workout.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(workout.date)}
                  </span>
                  <button
                    onClick={() => handleEdit(workout)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(workout._id)}
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

export default ActivityTracker; 