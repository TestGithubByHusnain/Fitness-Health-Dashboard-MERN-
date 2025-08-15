import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Activity, 
  Droplets, 
  Target,
  Calendar,
  Clock,
  Flame,
  Footprints
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { workoutAPI, nutritionAPI, waterAPI, profileAPI } from '../utils/api';
import { formatNumber, formatCalories, calculateBMI, getBMICategory } from '../utils/helpers';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    workouts: {},
    nutrition: {},
    water: {},
    profile: {}
  });
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [recentNutrition, setRecentNutrition] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [workoutsRes, nutritionRes, waterRes, profileRes, recentWorkoutsRes, recentNutritionRes] = await Promise.all([
        workoutAPI.getStats({ period: 7 }),
        nutritionAPI.getStats({ period: 7 }),
        waterAPI.getStats({ period: 7 }),
        profileAPI.getStats(),
        workoutAPI.getAll({ limit: 5 }),
        nutritionAPI.getAll({ limit: 5 })
      ]);

      setStats({
        workouts: workoutsRes.data.data,
        nutrition: nutritionRes.data.data,
        water: waterRes.data.data,
        profile: profileRes.data.data
      });
      setRecentWorkouts(recentWorkoutsRes.data.data);
      setRecentNutrition(recentNutritionRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const bmi = calculateBMI(user?.weight, user?.height);
  const bmiCategory = getBMICategory(bmi);

  const chartColors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

  const stepsData = [
    { day: 'Mon', steps: 8500 },
    { day: 'Tue', steps: 10200 },
    { day: 'Wed', steps: 7800 },
    { day: 'Thu', steps: 11500 },
    { day: 'Fri', steps: 9200 },
    { day: 'Sat', steps: 6800 },
    { day: 'Sun', steps: 8432 }
  ];

  const caloriesData = [
    { day: 'Mon', burned: 1200, consumed: 2100 },
    { day: 'Tue', burned: 1450, consumed: 1950 },
    { day: 'Wed', burned: 980, consumed: 2200 },
    { day: 'Thu', burned: 1650, consumed: 1850 },
    { day: 'Fri', burned: 1320, consumed: 2000 },
    { day: 'Sat', burned: 890, consumed: 2300 },
    { day: 'Sun', burned: 1250, consumed: 2150 }
  ];

  const macroData = [
    { name: 'Protein', value: stats.nutrition?.summary?.totalProtein || 0, color: '#3b82f6' },
    { name: 'Carbs', value: stats.nutrition?.summary?.totalCarbs || 0, color: '#22c55e' },
    { name: 'Fats', value: stats.nutrition?.summary?.totalFats || 0, color: '#f59e0b' }
  ];

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's your fitness overview for today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Steps Today */}
        <div className="stat-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Footprints className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Steps Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(8432)}
              </p>
              <p className="text-sm text-success-600">
                +12% from yesterday
              </p>
            </div>
          </div>
        </div>

        {/* Calories Burned */}
        <div className="stat-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Flame className="h-8 w-8 text-danger-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Calories Burned</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCalories(1250)}
              </p>
              <p className="text-sm text-success-600">
                +8% from yesterday
              </p>
            </div>
          </div>
        </div>

        {/* Water Intake */}
        <div className="stat-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Droplets className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Water Intake</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.water?.summary?.avgGlasses?.toFixed(1) || 0}/8
              </p>
              <p className="text-sm text-warning-600">
                {((stats.water?.summary?.avgGlasses || 0) / 8 * 100).toFixed(0)}% of goal
              </p>
            </div>
          </div>
        </div>

        {/* BMI */}
        <div className="stat-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">BMI</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {bmi || 'N/A'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {bmiCategory || 'Not set'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Steps Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Steps This Week
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stepsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="steps" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Calories Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Calories This Week
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={caloriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="burned" fill="#ef4444" name="Burned" />
              <Bar dataKey="consumed" fill="#22c55e" name="Consumed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Workouts */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Workouts
            </h3>
            <a href="/activity" className="text-sm text-primary-600 hover:text-primary-500">
              View all
            </a>
          </div>
          <div className="space-y-3">
            {recentWorkouts.slice(0, 3).map((workout) => (
              <div key={workout._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <Activity className="h-5 w-5 text-primary-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {workout.type.replace('_', ' ').toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {workout.duration} min • {formatCalories(workout.caloriesBurned)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(workout.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Nutrition */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Meals
            </h3>
            <a href="/nutrition" className="text-sm text-primary-600 hover:text-primary-500">
              View all
            </a>
          </div>
          <div className="space-y-3">
            {recentNutrition.slice(0, 3).map((meal) => (
              <div key={meal._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <div className="h-5 w-5 bg-primary-600 rounded mr-3"></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {meal.foodItem}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {meal.mealType} • {formatCalories(meal.calories)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(meal.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 