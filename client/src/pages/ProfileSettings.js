import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../utils/api';
import { activityLevels, genders, validateEmail } from '../utils/helpers';
import toast from 'react-hot-toast';
import { User, Lock, Target, Save } from 'lucide-react';

/**
 * Key fixes vs original:
 * 1) Separated forms into 3 isolated react-hook-form instances (profile, goals, password)
 *    so submitting one form no longer validates/blocks the others.
 * 2) Added valueAsNumber to numeric fields to avoid sending strings to the API.
 * 3) Sent only necessary payload portions (e.g., { fitnessGoals } for goals, exclude confirmPassword).
 * 4) Improved error toasts with server message fallback.
 * 5) Safer rendering for stats (show 0 values) and added per-form loading states.
 * 6) Removed unused imports and minor polish.
 */

const ProfileSettings = () => {
  const { user, updateUser } = useAuth();

  // Loading flags per form
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingGoals, setSavingGoals] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [profileStats, setProfileStats] = useState({});

  // ---------------------- PROFILE FORM ----------------------
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      age: undefined,
      gender: '',
      height: undefined,
      weight: undefined,
      activityLevel: '',
    },
  });

  // ---------------------- GOALS FORM ------------------------
  const {
    register: registerGoals,
    handleSubmit: handleGoalsSubmit,
    reset: resetGoals,
    formState: { errors: goalErrors },
  } = useForm({
    defaultValues: {
      fitnessGoals: {
        dailySteps: undefined,
        dailyCalories: undefined,
        dailyWater: undefined,
        weeklyWorkouts: undefined,
      },
    },
  });

  // ---------------------- PASSWORD FORM ---------------------
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    watch,
    formState: { errors: passwordErrors },
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword');

  useEffect(() => {
    if (user) {
      // hydrate profile form
      resetProfile({
        name: user.name || '',
        email: user.email || '',
        age: user.age ?? undefined,
        gender: user.gender || '',
        height: user.height ?? undefined,
        weight: user.weight ?? undefined,
        activityLevel: user.activityLevel || '',
      });

      // hydrate goals form
      resetGoals({
        fitnessGoals: {
          dailySteps: user?.fitnessGoals?.dailySteps ?? undefined,
          dailyCalories: user?.fitnessGoals?.dailyCalories ?? undefined,
          dailyWater: user?.fitnessGoals?.dailyWater ?? undefined,
          weeklyWorkouts: user?.fitnessGoals?.weeklyWorkouts ?? undefined,
        },
      });
    }

    fetchProfileStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchProfileStats = async () => {
    try {
      setStatsLoading(true);
      const response = await profileAPI.getStats();
      setProfileStats(response?.data?.data || {});
    } catch (error) {
      console.error('Error fetching profile stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // ---------------------- SUBMIT HANDLERS -------------------
  const onProfileSubmit = async (data) => {
    setSavingProfile(true);
    try {
      const payload = {
        ...data,
        age: data.age ?? undefined,
        height: data.height ?? undefined,
        weight: data.weight ?? undefined,
      };
      const response = await profileAPI.update(payload);
      updateUser(response?.data?.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to update profile';
      toast.error(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const onGoalsSubmit = async (data) => {
    setSavingGoals(true);
    try {
      const payload = { fitnessGoals: data.fitnessGoals };
      const response = await profileAPI.update(payload);
      updateUser(response?.data?.data);
      toast.success('Goals updated successfully');
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to update goals';
      toast.error(msg);
    } finally {
      setSavingGoals(false);
    }
  };

  const onPasswordSubmit = async ({ currentPassword, newPassword }) => {
    setUpdatingPassword(true);
    try {
      await profileAPI.updatePassword({ currentPassword, newPassword });
      toast.success('Password updated successfully');
      resetPassword();
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to update password';
      toast.error(msg);
    } finally {
      setUpdatingPassword(false);
    }
  };

  const initialLetter = useMemo(() => {
    const source = user?.name || user?.email || '';
    return source ? source.charAt(0).toUpperCase() : '?';
  }, [user]);

  const StatRow = ({ label, value, suffix = '' }) => (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className="font-medium text-gray-900 dark:text-white">{value}{suffix}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile & Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your profile information and fitness goals</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="card">
            <div className="flex items-center mb-6">
              <User className="h-6 w-6 text-primary-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
            </div>

            <form noValidate onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    {...registerProfile('name', {
                      required: 'Name is required',
                      minLength: { value: 2, message: 'Name must be at least 2 characters' },
                      maxLength: { value: 50, message: 'Name cannot exceed 50 characters' },
                    })}
                    className="input"
                    placeholder="Enter your full name"
                  />
                  {profileErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{profileErrors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    {...registerProfile('email', {
                      required: 'Email is required',
                      validate: (value) => validateEmail(value) || 'Please enter a valid email',
                    })}
                    className="input"
                    placeholder="Enter your email"
                  />
                  {profileErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{profileErrors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age</label>
                  <input
                    type="number"
                    {...registerProfile('age', {
                      valueAsNumber: true,
                      min: { value: 13, message: 'Age must be at least 13' },
                      max: { value: 120, message: 'Age cannot exceed 120' },
                    })}
                    className="input"
                    placeholder="Enter your age"
                  />
                  {profileErrors.age && (
                    <p className="mt-1 text-sm text-red-600">{profileErrors.age.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                  <select {...registerProfile('gender')} className="input">
                    <option value="">Select gender</option>
                    {Object.entries(genders).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    {...registerProfile('height', {
                      valueAsNumber: true,
                      min: { value: 100, message: 'Height must be at least 100cm' },
                      max: { value: 250, message: 'Height cannot exceed 250cm' },
                    })}
                    className="input"
                    placeholder="Enter your height in cm"
                  />
                  {profileErrors.height && (
                    <p className="mt-1 text-sm text-red-600">{profileErrors.height.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    {...registerProfile('weight', {
                      valueAsNumber: true,
                      min: { value: 30, message: 'Weight must be at least 30kg' },
                      max: { value: 300, message: 'Weight cannot exceed 300kg' },
                    })}
                    className="input"
                    placeholder="Enter your weight in kg"
                  />
                  {profileErrors.weight && (
                    <p className="mt-1 text-sm text-red-600">{profileErrors.weight.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Activity Level</label>
                <select {...registerProfile('activityLevel')} className="input">
                  <option value="">Select activity level</option>
                  {Object.entries(activityLevels).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={savingProfile} className="btn-primary">
                  <Save className="h-4 w-4 mr-2" />
                  {savingProfile ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Fitness Goals */}
          <div className="card">
            <div className="flex items-center mb-6">
              <Target className="h-6 w-6 text-primary-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fitness Goals</h3>
            </div>

            <form noValidate onSubmit={handleGoalsSubmit(onGoalsSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Daily Steps Goal</label>
                  <input
                    type="number"
                    {...registerGoals('fitnessGoals.dailySteps', {
                      valueAsNumber: true,
                      min: { value: 1000, message: 'Steps goal must be at least 1000' },
                      max: { value: 50000, message: 'Steps goal cannot exceed 50000' },
                    })}
                    className="input"
                    placeholder="10000"
                  />
                  {goalErrors?.fitnessGoals?.dailySteps && (
                    <p className="mt-1 text-sm text-red-600">{goalErrors.fitnessGoals.dailySteps.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Daily Calories Goal</label>
                  <input
                    type="number"
                    {...registerGoals('fitnessGoals.dailyCalories', {
                      valueAsNumber: true,
                      min: { value: 1000, message: 'Calories goal must be at least 1000' },
                      max: { value: 5000, message: 'Calories goal cannot exceed 5000' },
                    })}
                    className="input"
                    placeholder="2000"
                  />
                  {goalErrors?.fitnessGoals?.dailyCalories && (
                    <p className="mt-1 text-sm text-red-600">{goalErrors.fitnessGoals.dailyCalories.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Daily Water Goal (glasses)</label>
                  <input
                    type="number"
                    {...registerGoals('fitnessGoals.dailyWater', {
                      valueAsNumber: true,
                      min: { value: 1, message: 'Water goal must be at least 1 glass' },
                      max: { value: 20, message: 'Water goal cannot exceed 20 glasses' },
                    })}
                    className="input"
                    placeholder="8"
                  />
                  {goalErrors?.fitnessGoals?.dailyWater && (
                    <p className="mt-1 text-sm text-red-600">{goalErrors.fitnessGoals.dailyWater.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weekly Workouts Goal</label>
                  <input
                    type="number"
                    {...registerGoals('fitnessGoals.weeklyWorkouts', {
                      valueAsNumber: true,
                      min: { value: 1, message: 'Workouts goal must be at least 1' },
                      max: { value: 7, message: 'Workouts goal cannot exceed 7' },
                    })}
                    className="input"
                    placeholder="3"
                  />
                  {goalErrors?.fitnessGoals?.weeklyWorkouts && (
                    <p className="mt-1 text-sm text-red-600">{goalErrors.fitnessGoals.weeklyWorkouts.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={savingGoals} className="btn-primary">
                  <Save className="h-4 w-4 mr-2" />
                  {savingGoals ? 'Saving…' : 'Save Goals'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <PasswordCard
            updatingPassword={updatingPassword}
            handlePasswordSubmit={handlePasswordSubmit}
            onPasswordSubmit={onPasswordSubmit}
            registerPassword={registerPassword}
            passwordErrors={passwordErrors}
            newPassword={newPassword}
          />
        </div>

        {/* Right: Profile Stats */}
        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="card text-center">
            <div className="mx-auto h-24 w-24 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-white font-bold text-2xl">{initialLetter}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{user?.name || 'User'}</h3>
            <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
          </div>

          {/* Health Stats */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Health Statistics</h3>
            <div className="space-y-4">
              {statsLoading ? (
                <p className="text-sm text-gray-500">Loading…</p>
              ) : (
                <>
                  {profileStats?.bmi !== undefined && (
                    <StatRow label="BMI" value={profileStats.bmi} />
                  )}
                  {profileStats?.bmiCategory !== undefined && (
                    <StatRow label="BMI Category" value={profileStats.bmiCategory} />
                  )}
                  {profileStats?.bmr !== undefined && (
                    <StatRow label="BMR" value={profileStats.bmr} suffix=" cal/day" />
                  )}
                  {profileStats?.tdee !== undefined && (
                    <StatRow label="TDEE" value={profileStats.tdee} suffix=" cal/day" />
                  )}
                </>
              )}
            </div>
          </div>

          {/* Account Info */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Information</h3>
            <div className="space-y-4">
              <StatRow
                label="Member Since"
                value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              />
              <StatRow
                label="Last Updated"
                value={user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PasswordCard = ({
  updatingPassword,
  handlePasswordSubmit,
  onPasswordSubmit,
  registerPassword,
  passwordErrors,
  newPassword,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Lock className="h-6 w-6 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h3>
        </div>
        <button onClick={() => setOpen((v) => !v)} className="btn-secondary">
          {open ? 'Cancel' : 'Change Password'}
        </button>
      </div>

      {open && (
        <form noValidate onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
            <input
              type="password"
              {...registerPassword('currentPassword', { required: 'Current password is required' })}
              className="input"
              placeholder="Enter current password"
              autoComplete="current-password"
            />
            {passwordErrors.currentPassword && (
              <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
            <input
              type="password"
              {...registerPassword('newPassword', {
                required: 'New password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
              className="input"
              placeholder="Enter new password"
              autoComplete="new-password"
            />
            {passwordErrors.newPassword && (
              <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
            <input
              type="password"
              {...registerPassword('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === newPassword || 'Passwords do not match',
              })}
              className="input"
              placeholder="Confirm new password"
              autoComplete="new-password"
            />
            {passwordErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={updatingPassword} className="btn-primary">
              <Save className="h-4 w-4 mr-2" />
              {updatingPassword ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfileSettings;
