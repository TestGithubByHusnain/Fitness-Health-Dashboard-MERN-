import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  BarChart3,
  Activity,
  Flame,
  Droplets,
  Target
} from 'lucide-react';
import { workoutAPI, nutritionAPI, waterAPI } from '../utils/api';
import { formatNumber, formatCalories, getDateRange } from '../utils/helpers';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const ProgressAnalytics = () => {
  const [timeRange, setTimeRange] = useState('7');
  const [workoutStats, setWorkoutStats] = useState({});
  const [nutritionStats, setNutritionStats] = useState({});
  const [waterStats, setWaterStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      const [workoutsRes, nutritionRes, waterRes] = await Promise.all([
        workoutAPI.getStats({ period: timeRange }),
        nutritionAPI.getStats({ period: timeRange }),
        waterAPI.getStats({ period: timeRange })
      ]);

      setWorkoutStats(workoutsRes.data.data);
      setNutritionStats(nutritionRes.data.data);
      setWaterStats(waterRes.data.data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sample data for charts (in a real app, this would come from the API)
  const stepsData = [
    { day: 'Mon', steps: 8500, goal: 10000 },
    { day: 'Tue', steps: 10200, goal: 10000 },
    { day: 'Wed', steps: 7800, goal: 10000 },
    { day: 'Thu', steps: 11500, goal: 10000 },
    { day: 'Fri', steps: 9200, goal: 10000 },
    { day: 'Sat', steps: 6800, goal: 10000 },
    { day: 'Sun', steps: 8432, goal: 10000 }
  ];

  const caloriesData = [
    { day: 'Mon', burned: 1200, consumed: 2100, net: 900 },
    { day: 'Tue', burned: 1450, consumed: 1950, net: 500 },
    { day: 'Wed', burned: 980, consumed: 2200, net: 1220 },
    { day: 'Thu', burned: 1650, consumed: 1850, net: 200 },
    { day: 'Fri', burned: 1320, consumed: 2000, net: 680 },
    { day: 'Sat', burned: 890, consumed: 2300, net: 1410 },
    { day: 'Sun', burned: 1250, consumed: 2150, net: 900 }
  ];

  const waterData = [
    { day: 'Mon', glasses: 8, goal: 8 },
    { day: 'Tue', glasses: 6, goal: 8 },
    { day: 'Wed', glasses: 7, goal: 8 },
    { day: 'Thu', glasses: 9, goal: 8 },
    { day: 'Fri', glasses: 5, goal: 8 },
    { day: 'Sat', glasses: 8, goal: 8 },
    { day: 'Sun', glasses: 7, goal: 8 }
  ];

  const macroData = [
    { name: 'Protein', value: nutritionStats?.summary?.totalProtein || 0, color: '#3b82f6' },
    { name: 'Carbohydrates', value: nutritionStats?.summary?.totalCarbs || 0, color: '#22c55e' },
    { name: 'Fats', value: nutritionStats?.summary?.totalFats || 0, color: '#f59e0b' }
  ];

  const workoutTypeData = workoutStats?.byType?.map((type, index) => ({
    name: type._id.replace('_', ' ').toUpperCase(),
    value: type.count,
    color: ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][index % 6]
  })) || [];

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
            Progress & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your fitness progress over time
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input w-auto"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Workouts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {workoutStats?.summary?.totalWorkouts || 0}
              </p>
              <p className="text-sm text-success-600">
                {workoutStats?.summary?.avgDuration?.toFixed(0) || 0} min avg
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Flame className="h-8 w-8 text-danger-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Calories Burned</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(workoutStats?.summary?.totalCalories || 0)}
              </p>
              <p className="text-sm text-success-600">
                {workoutStats?.summary?.avgCalories?.toFixed(0) || 0} avg per workout
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Droplets className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Water Intake</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {waterStats?.summary?.avgGlasses?.toFixed(1) || 0}/8
              </p>
              <p className="text-sm text-success-600">
                {waterStats?.summary?.daysTracked || 0} days tracked
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Goal Achievement</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {((workoutStats?.summary?.totalWorkouts || 0) / 21 * 100).toFixed(0)}%
              </p>
              <p className="text-sm text-success-600">
                Weekly workout goal
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Steps Progress */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Daily Steps Progress
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stepsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="steps" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.3}
              />
              <Line 
                type="monotone" 
                dataKey="goal" 
                stroke="#ef4444" 
                strokeDasharray="5 5"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Calories Balance */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Calories Balance
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

        {/* Water Intake */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Water Intake Progress
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={waterData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="glasses" fill="#3b82f6" name="Glasses" />
              <Bar dataKey="goal" fill="#ef4444" name="Goal" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Macronutrient Breakdown */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Macronutrient Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={macroData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {macroData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Workout Type Distribution */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Workout Type Distribution
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={workoutTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {workoutTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="space-y-3">
            {workoutTypeData.map((type, index) => (
              <div key={type.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded mr-3"
                    style={{ backgroundColor: type.color }}
                  ></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {type.name}
                  </span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {type.value} workouts
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trends Analysis */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Trends Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-medium text-green-900 dark:text-green-100">Improving</h4>
            <p className="text-sm text-green-600 dark:text-green-400">
              Your workout frequency has increased by 15% this week
            </p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-medium text-blue-900 dark:text-blue-100">Consistent</h4>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Water intake has been consistent for the past 5 days
            </p>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <Target className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <h4 className="font-medium text-yellow-900 dark:text-yellow-100">Goal Focus</h4>
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              You're 80% towards your weekly calorie burn goal
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressAnalytics; 