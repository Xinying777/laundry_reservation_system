# Northwestern Campus Laundry Hub - API Documentation

This document provides comprehensive information about the available API endpoints in the Northwestern Campus Laundry Hub application.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://your-azure-app-service.azurewebsites.net`

## Authentication

Most endpoints require authentication. To authenticate, you need to include a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

The token is obtained by logging in through the `/api/auth/login` endpoint.

## Response Format

All responses follow a consistent JSON format:

**Success Response**:
```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Operation successful" // Optional
}
```

**Error Response**:
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 1. User Authentication API

### Login

Authenticates a user and returns a JWT token.

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Authentication Required**: No

**Request Body**:
```json
{
  "student_id": "demo",
  "password": "demo"
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "student_id": "demo",
      "name": "Test User",
      "email": "test@university.edu"
    }
  },
  "message": "Login successful"
}
```

**Error Response (401 Unauthorized)**:
```json
{
  "success": false,
  "message": "Invalid student ID or password"
}
```

### Register (Sign Up)

Creates a new user account.

- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Authentication Required**: No

**Request Body**:
```json
{
  "student_id": "123456",
  "password": "securepassword",
  "name": "Jane Doe",
  "email": "jane.doe@northwestern.edu",
  "phone": "312-555-1234" // Optional
}
```

**Success Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": 2,
    "student_id": "123456",
    "name": "Jane Doe",
    "email": "jane.doe@northwestern.edu"
  },
  "message": "User registered successfully"
}
```

**Error Response (400 Bad Request)**:
```json
{
  "success": false,
  "message": "Student ID already exists"
}
```

---

## 2. Laundry Machine API

### Get All Machines

Retrieves a list of all laundry machines.

- **URL**: `/api/machines`
- **Method**: `GET`
- **Authentication Required**: Yes

**Query Parameters**:
- `location` (optional): Filter machines by location
- `status` (optional): Filter machines by status (available, occupied, maintenance)

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "machine_number": "Machine 1",
      "status": "available",
      "location": "Laundry Room A",
      "created_at": "2025-08-10T12:00:00Z",
      "updated_at": "2025-08-10T12:00:00Z"
    },
    {
      "id": 2,
      "machine_number": "Machine 2",
      "status": "occupied",
      "location": "Laundry Room A",
      "created_at": "2025-08-10T12:00:00Z",
      "updated_at": "2025-08-10T12:30:00Z"
    }
  ]
}
```

### Get Machine Availability

Retrieves the availability status for a specific machine.

- **URL**: `/api/machines/:id/availability`
- **Method**: `GET`
- **Authentication Required**: Yes
- **URL Parameters**: 
  - `id`: Machine ID

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "machine_id": 1,
    "machine_number": "Machine 1",
    "status": "available",
    "current_reservation": null,
    "next_available": "2025-08-14T10:00:00Z",
    "upcoming_reservations": [
      {
        "start_time": "2025-08-14T14:00:00Z",
        "end_time": "2025-08-14T15:00:00Z"
      },
      {
        "start_time": "2025-08-14T17:00:00Z",
        "end_time": "2025-08-14T18:00:00Z"
      }
    ]
  }
}
```

### Get All Machine Availability

Retrieves availability for all machines.

- **URL**: `/api/machines/availability/all`
- **Method**: `GET`
- **Authentication Required**: Yes

**Query Parameters**:
- `date` (optional): Date for which to check availability (YYYY-MM-DD)

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "machine_id": 1,
      "machine_number": "Machine 1",
      "status": "available",
      "location": "Laundry Room A",
      "available_slots": [
        {
          "start_time": "2025-08-14T10:00:00Z",
          "end_time": "2025-08-14T11:00:00Z"
        },
        {
          "start_time": "2025-08-14T11:00:00Z",
          "end_time": "2025-08-14T12:00:00Z"
        }
      ]
    },
    // More machines...
  ]
}
```

---

## 3. Reservation API

### Get All Reservations

Retrieves a list of all reservations (admin only).

- **URL**: `/api/reservations`
- **Method**: `GET`
- **Authentication Required**: Yes (Admin)

**Query Parameters**:
- `date` (optional): Filter by date (YYYY-MM-DD)
- `status` (optional): Filter by status (pending, confirmed, completed, canceled)

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 2,
      "machine_id": 1,
      "start_time": "2025-08-14T10:00:00Z",
      "end_time": "2025-08-14T11:00:00Z",
      "status": "confirmed",
      "user_name": "Jane Doe",
      "machine_number": "Machine 1",
      "created_at": "2025-08-13T14:00:00Z",
      "updated_at": "2025-08-13T14:05:00Z"
    },
    // More reservations...
  ]
}
```

### Get User Reservations

Retrieves reservations for the authenticated user.

- **URL**: `/api/reservations/my`
- **Method**: `GET`
- **Authentication Required**: Yes

**Query Parameters**:
- `status` (optional): Filter by status (pending, confirmed, completed, canceled)

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "machine_id": 1,
      "machine_number": "Machine 1",
      "location": "Laundry Room A",
      "start_time": "2025-08-14T10:00:00Z",
      "end_time": "2025-08-14T11:00:00Z",
      "status": "confirmed",
      "created_at": "2025-08-13T14:00:00Z",
      "updated_at": "2025-08-13T14:05:00Z"
    },
    // More reservations...
  ]
}
```

### Create Reservation

Creates a new reservation.

- **URL**: `/api/reservations`
- **Method**: `POST`
- **Authentication Required**: Yes

**Request Body**:
```json
{
  "machine_id": 1,
  "start_time": "2025-08-14T14:00:00Z",
  "end_time": "2025-08-14T15:00:00Z"
}
```

**Success Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": 3,
    "user_id": 2,
    "machine_id": 1,
    "start_time": "2025-08-14T14:00:00Z",
    "end_time": "2025-08-14T15:00:00Z",
    "status": "pending",
    "created_at": "2025-08-14T08:30:00Z"
  },
  "message": "Reservation created successfully"
}
```

**Error Response (400 Bad Request)**:
```json
{
  "success": false,
  "message": "Machine is not available for the selected time slot"
}
```

### Confirm Reservation

Confirms a pending reservation.

- **URL**: `/api/reservations/confirm`
- **Method**: `POST`
- **Authentication Required**: Yes

**Request Body**:
```json
{
  "reservation_id": 3
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": 3,
    "status": "confirmed",
    "updated_at": "2025-08-14T08:35:00Z"
  },
  "message": "Reservation confirmed successfully"
}
```

### Cancel Reservation

Cancels an existing reservation.

- **URL**: `/api/reservations/:id`
- **Method**: `DELETE`
- **Authentication Required**: Yes
- **URL Parameters**: 
  - `id`: Reservation ID

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Reservation canceled successfully"
}
```

**Error Response (403 Forbidden)**:
```json
{
  "success": false,
  "message": "You can only cancel your own reservations"
}
```

---

## 4. Lost and Found API

### Get All Lost and Found Items

Retrieves a list of all lost and found items.

- **URL**: `/api/lostandfound`
- **Method**: `GET`
- **Authentication Required**: Yes

**Query Parameters**:
- `status` (optional): Filter by status (active, claimed, expired)
- `date_found` (optional): Filter by date found (YYYY-MM-DD)

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "reporter_id": 2,
      "reporter_name": "Jane Doe",
      "item_name": "Blue Notebook",
      "description": "Blue spiral notebook with Northwestern logo",
      "location_found": "Laundry Room A",
      "date_found": "2025-08-12",
      "status": "active",
      "contact_info": "jane.doe@northwestern.edu",
      "created_at": "2025-08-12T15:30:00Z",
      "updated_at": "2025-08-12T15:30:00Z"
    },
    // More items...
  ]
}
```

### Get Lost and Found Item

Retrieves details for a specific lost and found item.

- **URL**: `/api/lostandfound/:id`
- **Method**: `GET`
- **Authentication Required**: Yes
- **URL Parameters**: 
  - `id`: Item ID

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "reporter_id": 2,
    "reporter_name": "Jane Doe",
    "item_name": "Blue Notebook",
    "description": "Blue spiral notebook with Northwestern logo",
    "location_found": "Laundry Room A",
    "date_found": "2025-08-12",
    "status": "active",
    "contact_info": "jane.doe@northwestern.edu",
    "created_at": "2025-08-12T15:30:00Z",
    "updated_at": "2025-08-12T15:30:00Z"
  }
}
```

### Report Lost and Found Item

Reports a new lost and found item.

- **URL**: `/api/lostandfound/report`
- **Method**: `POST`
- **Authentication Required**: Yes

**Request Body**:
```json
{
  "item_name": "Water Bottle",
  "description": "Metal water bottle, purple color with stickers",
  "location_found": "Laundry Room B",
  "date_found": "2025-08-14",
  "contact_info": "312-555-1234"
}
```

**Success Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": 2,
    "reporter_id": 2,
    "item_name": "Water Bottle",
    "description": "Metal water bottle, purple color with stickers",
    "location_found": "Laundry Room B",
    "date_found": "2025-08-14",
    "status": "active",
    "contact_info": "312-555-1234",
    "created_at": "2025-08-14T09:45:00Z"
  },
  "message": "Item reported successfully"
}
```

### Update Lost and Found Item Status

Updates the status of a lost and found item.

- **URL**: `/api/lostandfound/:id/status`
- **Method**: `PUT`
- **Authentication Required**: Yes
- **URL Parameters**: 
  - `id`: Item ID

**Request Body**:
```json
{
  "status": "claimed"
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "claimed",
    "updated_at": "2025-08-14T10:15:00Z"
  },
  "message": "Item status updated successfully"
}
```

**Error Response (403 Forbidden)**:
```json
{
  "success": false,
  "message": "Only the reporter or an admin can update item status"
}
```

### Delete Lost and Found Item

Deletes a lost and found item (only for admin or the reporter).

- **URL**: `/api/lostandfound/:id`
- **Method**: `DELETE`
- **Authentication Required**: Yes
- **URL Parameters**: 
  - `id`: Item ID

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Item deleted successfully"
}
```

**Error Response (403 Forbidden)**:
```json
{
  "success": false,
  "message": "Only the reporter or an admin can delete this item"
}
```

---

## Health Check and Debug Endpoints

### Health Check

- **URL**: `/health`
- **Method**: `GET`
- **Authentication Required**: No

**Success Response (200 OK)**:
```json
{
  "status": "OK",
  "message": "Laundry Backend is running!"
}
```

### Environment Debug (Development Only)

- **URL**: `/debug/env`
- **Method**: `GET`
- **Authentication Required**: No
- **Note**: This endpoint should be disabled in production

**Success Response (200 OK)**:
```json
{
  "DB_HOST": "localhost",
  "DB_PORT": "5432",
  "DB_NAME": "postgres",
  "DB_USER": "youxinying",
  "DB_PASSWORD": "***SET***",
  "NODE_ENV": "development"
}
```

### API Information

- **URL**: `/api`
- **Method**: `GET`
- **Authentication Required**: No

**Success Response (200 OK)**:
```json
{
  "message": "Laundry Reservation System API",
  "version": "1.0.0",
  "status": "All routes active",
  "endpoints": {
    // List of all available endpoints
  }
}
```
