# Fitness & Health Dashboard

A complete, production-ready Fitness & Health Dashboard web application built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

- **User Authentication**: Secure JWT-based authentication with HTTP-only cookies
- **Dashboard Overview**: Key health metrics and statistics
- **Activity Tracking**: Log and track workouts with exercise details
- **Nutrition Logging**: Comprehensive meal and nutrition tracking
- **Water Intake Tracker**: Daily water consumption monitoring
- **Progress Analytics**: Visual charts for progress tracking
- **Profile Management**: User settings and fitness goals
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark Mode**: Toggle between light and dark themes

## Tech Stack

### Frontend
- React.js 18
- Tailwind CSS
- Recharts (data visualization)
- React Hook Form (form validation)
- React Router (navigation)
- Axios (API calls)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcrypt (password hashing)
- express-validator (input validation)

## Project Structure

```
fitness-health-dashboard/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── context/       # React context providers
│   │   ├── utils/         # Utility functions
│   │   └── App.js
├── server/                 # Node.js backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Utility functions
│   └── server.js
└── README.md
```

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

## Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/TestGithubByHusnain/Fitness-Health-Dashboard-MERN-.git
cd fitness-health-dashboard
```

### 2. Install dependencies

#### Backend
```bash
cd server
npm install
```

#### Frontend
```bash
cd client
npm install
```

### 3. Environment Configuration

#### Backend (.env)
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fitness-dashboard
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
```

#### Frontend (.env)
Create a `.env` file in the `client` directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Database Setup

Make sure MongoDB is running on your system, or update the `MONGODB_URI` in the backend `.env` file to point to your MongoDB Atlas cluster.

### 5. Seed Data (Optional)

The application includes sample data. To populate the database with sample data:

```bash
cd server
npm run seed
```

## Running the Application

### Development Mode

#### Start the backend server
```bash
cd server
npm run dev
```

#### Start the frontend development server
```bash
cd client
npm start
```


### Production Build

#### Build the frontend
```bash
cd client
npm run build
```

#### Start production server
```bash
cd server
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Workouts
- `GET /api/workouts` - Get user workouts
- `POST /api/workouts` - Create new workout
- `PUT /api/workouts/:id` - Update workout
- `DELETE /api/workouts/:id` - Delete workout

### Nutrition
- `GET /api/nutrition` - Get nutrition logs
- `POST /api/nutrition` - Create nutrition log
- `PUT /api/nutrition/:id` - Update nutrition log
- `DELETE /api/nutrition/:id` - Delete nutrition log

### Water Intake
- `GET /api/water` - Get water intake logs
- `POST /api/water` - Create water intake log
- `PUT /api/water/:id` - Update water intake log
- `DELETE /api/water/:id` - Delete water intake log

### Profile
- `PUT /api/profile` - Update user profile

## Features in Detail

### Dashboard Overview
- Daily step count
- Calories burned today
- Water intake progress
- Workouts completed
- BMI calculation

### Activity Tracker
- Log workout sessions
- Track exercise type, duration, and calories
- View workout history
- Edit and delete workouts

### Nutrition Log
- Add daily meals and snacks
- Track macronutrients (protein, carbs, fats)
- Search food items
- View nutrition history

### Water Intake Tracker
- Log daily water consumption
- Track glasses of water
- View daily and weekly progress

### Progress & Analytics
- Visual charts for progress tracking
- 7-day and 30-day views
- Steps, calories, and weight trends
- Macronutrient breakdown

### Profile & Settings
- Update personal information
- Set fitness goals
- Change profile picture
- Update password

## Security Features

- JWT authentication with HTTP-only cookies
- Password hashing with bcrypt
- Input validation and sanitization
- Protected routes
- CORS configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository. 
