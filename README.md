# Northwestern Campus Laundry Hub (PurpleWash)

A full-stack web application for managing laundry reservations and lost & found items at Northwestern University. The system provides students with an easy way to reserve washing machines across different campus locations and report or recover lost items.

![Project Status: Active](https://img.shields.io/badge/Status-Active-green)
![Last Updated: August 21, 2025](https://img.shields.io/badge/Last%20Updated-August%2021%2C%202025-blue)
![Version: 1.2.0](https://img.shields.io/badge/Version-1.2.0-purple)

<div align="center">
  <img src="https://via.placeholder.com/800x200/4E2A84/FFFFFF?text=PurpleWash" alt="PurpleWash Banner" width="600"/>
</div>

## Project Structure

```
laundry_reservation_system/
├── laundry-backend/          # Node.js/Express backend API
│   ├── src/
│   │   ├── routes/           # API routes
│   │   ├── config/           # Database configuration
│   │   └── app.js           # Express app setup
│   ├── database/            # Database schema and setup files
│   │   ├── schema.sql       # Database tables definition
│   │   └── add_users.sql    # Add users script
│   ├── .env                 # Environment variables (not in repo)
│   └── server.js           # Server entry point
└── laundry-frontend/        # React frontend
    ├── src/
    │   ├── components/      # React components
    │   └── data/           # Static data
    ├── .env.development     # Development environment variables
    ├── .env.production      # Production environment variables
    └── public/             # Static assets
```

## Features

- **User Authentication**: Student login and registration system with secure credential storage and JWT token-based sessions
- **Machine Management**: View available washing machines across multiple campus locations (Basement, Dorm A, Dorm B, Community Center)
- **Reservation System**: Book time slots for laundry with real-time availability updates and confirmation
- **Lost & Found**: Report and find lost items with detailed tracking, search, and location filtering
- **FAQ System**: Comprehensive help section for common questions and issues
- **Responsive Design**: Mobile-friendly interface for on-the-go access across devices
- **Modern UI**: Intuitive and clean Northwestern-themed interface with official purple accent colors
- **Real-time Status Updates**: Live updates of machine availability and reservation status
- **Data Security**: Encrypted credentials and secure API endpoints
- **Search & Filter**: Advanced search capabilities for lost & found items

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm package manager

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd laundry-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file with the following variables:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=postgres      # or your database name
   DB_USER=youxinying    # your database username
   DB_PASSWORD=          # your database password

   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

   PORT=3000
   NODE_ENV=development
   ```

4. Initialize the database:
   ```bash
   psql -d postgres -f database/schema.sql
   ```

5. Start the server:
   ```bash
   npm start
   ```

The backend will run on `http://localhost:3000`

You can also use the provided start script:
   ```bash
   ./start.sh
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd laundry-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create or verify `.env.development` with:
   ```
   REACT_APP_API_URL=http://localhost:3000
   PORT=3005
   ```

4. Start the React development server:
   ```bash
   npm start
   ```

The frontend will run on `http://localhost:3005`

## Quick Start with Scripts

For convenience, we've added start and stop scripts that launch both backend and frontend:

```bash
# Start both backend and frontend servers
./start.sh

# Stop all running servers
./stop.sh
```

## Documentation

- [API Documentation](./API.md) - Complete API reference
- [Setup Guide](./SETUP.md) - Instructions for setting up the development environment
- [Deployment Guide](./DEPLOYMENT.md) - Guide to deploy the application to Azure

### Main API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

#### Machines
- `GET /api/machines` - Get all machines
- `GET /api/machines/:id/availability` - Get machine availability

#### Reservations
- `GET /api/reservations` - Get all reservations
- `POST /api/reservations` - Create new reservation
- `PUT /api/reservations/:id` - Update reservation
- `DELETE /api/reservations/:id` - Cancel reservation

#### Lost & Found
- `GET /api/lostandfound` - Get all items
- `POST /api/lostandfound` - Report new item

## Demo Accounts

For testing purposes, you can use these demo accounts:

- Student ID: `demo`, Password: `demo`
- Student ID: `123123`, Password: `password`

## Recent Updates (August 2025)

### August 21, 2025
- Added search and filter functionality to Lost & Found section
- Removed claim buttons from Lost & Found items list
- Enhanced UI with better logo display and navigation layout
- Updated all dependencies to latest versions
- Optimized mobile responsiveness
- Improved database query performance

### August 16, 2025
- Fixed Lost & Found component rendering issues
- Added FAQ component with comprehensive help sections
- Enabled reservation functionality for all machine locations
- Improved UI styling with Northwestern brand colors
- Added database initialization scripts
- Created convenient start/stop scripts for development
- Updated API documentation
- Added test student account: Student ID: `456789`, Password: `student123`

**Creating Your Account:**
- Click "Sign up here" on the login page
- Fill in your student information (Student ID, name, email, password)
- Phone number is optional
- After successful registration, you can log in with your new credentials

## Technology Stack

### Backend
- **Node.js**: JavaScript runtime environment (v16+)
- **Express.js**: Web application framework for building APIs
- **PostgreSQL**: Relational database for data storage
- **JSON Web Tokens (JWT)**: Secure authentication system
- **Dotenv**: Environment variable management
- **Helmet**: Security middleware for HTTP headers
- **Morgan**: HTTP request logger
- **CORS**: Cross-Origin Resource Sharing support
- **Bcrypt.js**: Password hashing and security

### Frontend
- **React 19.1.0**: Modern JavaScript library for user interfaces
- **React Router v6.22.3**: Client-side routing and navigation
- **Axios**: Promise-based HTTP client for API requests
- **Bootstrap 5.3.7**: Responsive UI components and grid system
- **CSS3**: Custom styling with Northwestern brand guidelines
- **Jest & React Testing Library**: Testing framework

## Deployment

### Azure Deployment Information
This project is deployed to Azure cloud platform with the following configuration:

- **Backend API**: Azure App Service
  - URL: https://jasmineweb123-a2bfaudwhwa7fgfm.centralus-01.azurewebsites.net
  - Region: Central US
  - Runtime: Node.js 16 LTS

- **Database**: Azure Database for PostgreSQL - Flexible Server
  - Server: laundry-db
  - Database: postgres
  - Region: Central US
  - Configuration: 2 vCores, 4GB RAM, 32GB storage

- **Resource Group**: jasmine_capstoneproject
- **Deployment Method**: GitHub Actions CI/CD

### Database Migration
To migrate your local database to Azure:
1. Export your local database schema:
   ```bash
   pg_dump -s postgres > schema.sql
   ```

2. Update your backend `.env` file for production:
   ```
   DB_HOST=your-azure-postgresql-server.postgres.database.azure.com
   DB_PORT=5432
   DB_NAME=your-db-name
   DB_USER=your-azure-user
   DB_PASSWORD=your-password
   DB_SSL=true  # Required for Azure PostgreSQL

   JWT_SECRET=your-production-secret

   PORT=3000
   NODE_ENV=production
   ```

3. Update frontend `.env.production` for deployment:
   ```
   REACT_APP_API_URL=https://your-backend-app-service.azurewebsites.net
   ```

## Common Issues and Troubleshooting

### Database Connection Issues
- **SSL Connection Error**: When deploying to Azure, make sure `ssl` is set to `true` in your database configuration.
- **Role Does Not Exist**: Ensure your database user has proper permissions.
- **Relation Does Not Exist**: Make sure to run the schema.sql script to create all necessary tables.

### Authentication Issues
- If login fails, verify that your `.env` file has the correct `JWT_SECRET` set.
- Default demo users are available for testing (see Demo Accounts section).

### Frontend Routing Issues
- This project uses React Router v6.22.3. Make sure all route paths match this version's syntax.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Screenshots

<div align="center">
  <img src="https://via.placeholder.com/300x200/4E2A84/FFFFFF?text=Login+Screen" alt="Login Screen" width="300"/>
  <img src="https://via.placeholder.com/300x200/4E2A84/FFFFFF?text=Machine+Status" alt="Machine Status" width="300"/>
  <img src="https://via.placeholder.com/300x200/4E2A84/FFFFFF?text=Lost+and+Found" alt="Lost and Found" width="300"/>
</div>

## Future Enhancements

- **Mobile App**: Native mobile application for iOS and Android
- **SMS Notifications**: Text alerts for reservation reminders and completion
- **Machine Learning**: Predictive analytics for machine usage patterns
- **Integration with University Systems**: Single sign-on with university credentials
- **QR Code System**: Scan to reserve and confirm machine usage
- **Feedback System**: User reviews and reporting for broken machines

## Team Members

- **Xinying**: Lead Developer & Project Manager

## License

This project is developed as a capstone project for Northwestern University. All rights reserved © 2025.
