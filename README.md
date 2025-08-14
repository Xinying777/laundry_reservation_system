# Northwestern Campus Laundry Hub

A full-stack web application for managing laundry reservations and lost & found items at Northwestern University.

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

- **User Authentication**: Student login system
- **Machine Management**: View available washing machines
- **Reservation System**: Book time slots for laundry
- **Lost & Found**: Report and find lost items
- **Responsive Design**: Mobile-friendly interface

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

## API Documentation

For detailed API documentation, please refer to the [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) file.

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
- Student ID: `456789`, Password: `student123`

**Or create your own account:**
- Click "Sign up here" on the login page
- Fill in your student information (Student ID, name, email, password)
- Phone number is optional
- After successful registration, you can log in with your new credentials

## Technology Stack

### Backend
- Node.js
- Express.js
- PostgreSQL
- JSON Web Tokens (JWT) for authentication
- dotenv for environment management

### Frontend
- React 19.1.0
- React Router v6.22.3 for navigation
- CSS3 for styling

## Deployment

### Azure Deployment Information
This project is configured for deployment to Azure with:
- Azure Database for PostgreSQL - Flexible Server (laundry-db)
- Resource Group: jasmine_capstoneproject

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

## License

This project is developed for Northwestern University.
