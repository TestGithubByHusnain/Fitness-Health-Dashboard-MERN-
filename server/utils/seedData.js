import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Workout from '../models/Workout.js';
import Nutrition from '../models/Nutrition.js';
import WaterIntake from '../models/WaterIntake.js';

dotenv.config();

// Sample user data
const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    height: 175,
    weight: 70,
    age: 28,
    gender: 'male',
    activityLevel: 'moderately_active',
    fitnessGoals: {
      dailySteps: 10000,
      dailyCalories: 2200,
      dailyWater: 8,
      weeklyWorkouts: 4
    }
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    height: 165,
    weight: 60,
    age: 25,
    gender: 'female',
    activityLevel: 'lightly_active',
    fitnessGoals: {
      dailySteps: 8000,
      dailyCalories: 1800,
      dailyWater: 6,
      weeklyWorkouts: 3
    }
  }
];

// Sample workout data
const sampleWorkouts = [
  {
    type: 'running',
    duration: 30,
    caloriesBurned: 300,
    description: 'Morning run in the park',
    intensity: 'high',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
  },
  {
    type: 'strength_training',
    duration: 45,
    caloriesBurned: 250,
    description: 'Upper body workout',
    intensity: 'moderate',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  },
  {
    type: 'yoga',
    duration: 60,
    caloriesBurned: 150,
    description: 'Evening yoga session',
    intensity: 'low',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
  },
  {
    type: 'cycling',
    duration: 40,
    caloriesBurned: 280,
    description: 'Bike ride around the city',
    intensity: 'moderate',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
  },
  {
    type: 'hiit',
    duration: 25,
    caloriesBurned: 320,
    description: 'High-intensity interval training',
    intensity: 'high',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
  }
];

// Sample nutrition data
const sampleNutrition = [
  {
    foodItem: 'Oatmeal with berries',
    calories: 250,
    protein: 8,
    carbs: 45,
    fats: 5,
    mealType: 'breakfast',
    servingSize: '1 cup',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    foodItem: 'Grilled chicken salad',
    calories: 350,
    protein: 35,
    carbs: 15,
    fats: 12,
    mealType: 'lunch',
    servingSize: '1 large bowl',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    foodItem: 'Salmon with vegetables',
    calories: 400,
    protein: 30,
    carbs: 20,
    fats: 18,
    mealType: 'dinner',
    servingSize: '1 fillet',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    foodItem: 'Greek yogurt',
    calories: 120,
    protein: 15,
    carbs: 8,
    fats: 2,
    mealType: 'snack',
    servingSize: '1 cup',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    foodItem: 'Banana',
    calories: 105,
    protein: 1,
    carbs: 27,
    fats: 0,
    mealType: 'snack',
    servingSize: '1 medium',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  }
];

// Sample water intake data
const sampleWaterIntake = [
  {
    glasses: 8,
    amount: 2000,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    glasses: 6,
    amount: 1500,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    glasses: 7,
    amount: 1750,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    glasses: 9,
    amount: 2250,
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
  },
  {
    glasses: 5,
    amount: 1250,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Workout.deleteMany({});
    await Nutrition.deleteMany({});
    await WaterIntake.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`Created user: ${user.name}`);
    }

    // Create workouts for each user
    for (const user of createdUsers) {
      for (const workoutData of sampleWorkouts) {
        const workout = new Workout({
          ...workoutData,
          userId: user._id
        });
        await workout.save();
      }
      console.log(`Created workouts for user: ${user.name}`);
    }

    // Create nutrition logs for each user
    for (const user of createdUsers) {
      for (const nutritionData of sampleNutrition) {
        const nutrition = new Nutrition({
          ...nutritionData,
          userId: user._id
        });
        await nutrition.save();
      }
      console.log(`Created nutrition logs for user: ${user.name}`);
    }

    // Create water intake logs for each user
    for (const user of createdUsers) {
      for (const waterData of sampleWaterIntake) {
        const waterIntake = new WaterIntake({
          ...waterData,
          userId: user._id
        });
        await waterIntake.save();
      }
      console.log(`Created water intake logs for user: ${user.name}`);
    }

    console.log('Database seeded successfully!');
    console.log('\nSample login credentials:');
    console.log('Email: john@example.com, Password: password123');
    console.log('Email: jane@example.com, Password: password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export default seedDatabase; 