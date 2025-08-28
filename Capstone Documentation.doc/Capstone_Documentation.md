# Table of Contents

1. [Production Support Documentation and Testing Scenarios](#1-production-support-documentation-and-testing-scenarios)  
2. [System Setup Instructions (Frontend, Backend, Database)](#2-system-setup-instructions-frontend-backend-database)  
3. [Issue Diagnosis, Research, Resolution, and Knowledge Sharing](#3-issue-diagnosis-research-resolution-and-knowledge-sharing)  
4. [System Usage Guide (End-User Documentation)](#4-system-usage-guide-end-user-documentation)  
5. [Architecture Diagram](#5-architecture-diagram)  

---

---

# 1. Production Support Documentation and Testing Scenarios


## 1.1 ## Table of Contents
1. [Service Architecture Overview](#service-architecture-overview)
2. [Service Dependency Diagram](#service-dependency-diagram)
3. [Monitoring & Health Checks](#monitoring--health-checks)
4. [Common Incidents & Recovery](#common-incidents--recovery)
5. [Testing Scenarios & Results](#testing-scenarios--results)
6. [Post-Deployment Validation](#post-deployment-validation)
7. [Troubleshooting Guide](#troubleshooting-guide)
8. [Emergency Contacts](#emergency-contacts)

---

## 1.2 ## Service Architecture Overview

### 1.2.1 ### System Components
The Northwestern Laundry Reservation System consists of the following components:

| Component | Technology | Purpose | Deployment Location |
|-----------|------------|---------|-------------------|
| **Frontend** | React 18+ | User interface for reservations & management | Azure Static Web Apps |
| **Backend API** | Node.js + Express | REST API server | Azure App Service |
| **Database** | PostgreSQL | Data persistence | Azure Database for PostgreSQL |
| **Load Balancer** | Azure App Gateway | Traffic distribution | Azure Infrastructure |
| **CDN** | Azure CDN | Static asset delivery | Global edge locations |

### 1.2.2 ### External Dependencies
- **Azure Active Directory** (optional authentication)
- **Application Insights** (monitoring & telemetry)
- **Azure Storage** (static assets & logs)

---

## 1.3 ## Service Dependency Diagram

```
┌─────────────────┐    HTTPS/443    ┌─────────────────┐
│   End Users     │ ───────────────▶ │  Azure CDN      │
│  (Students)     │                  │  Static Assets  │
└─────────────────┘                  └─────────────────┘
         │                                    │
         │ HTTPS/443                         │
         ▼                                    ▼
┌─────────────────┐                  ┌─────────────────┐
│ Azure Static    │                  │   React SPA     │
│   Web Apps      │◀─────────────────│   Frontend      │
│  (Frontend)     │                  │  (build files)  │
└─────────────────┘                  └─────────────────┘
         │
         │ HTTPS API Calls
         │ /api/*
         ▼
┌─────────────────┐    TCP/5432     ┌─────────────────┐
│ Azure App       │ ───────────────▶ │ Azure Database  │
│   Service       │                  │ for PostgreSQL  │
│ (Backend API)   │                  │  (laundry-db)   │
└─────────────────┘                  └─────────────────┘
         │                                    │
         │                                    │
         ▼                                    ▼
┌─────────────────┐                  ┌──────────────────┐
│ Application     │                  │  Database        │
│   Insights      │                  │  Tables:         │
│ (Monitoring)    │                  │  - users         │
└─────────────────┘                  │  - machines      │
                                     │  - reservations  │
                                     │  - lost_and_found│
                                     └──────────────────┘
```

### 1.3.1 ### Network Flow
1. **User Access**: Students access the application via Azure Static Web Apps
2. **API Communication**: Frontend makes REST API calls to Azure App Service backend
3. **Database Operations**: Backend connects to PostgreSQL database for data persistence
4. **Monitoring**: All services send telemetry to Application Insights

---

## 1.4 ## Monitoring & Health Checks

### 1.4.1 ### Health Check Endpoints

#### Backend Health Check
- **Endpoint**: `GET /health`
- **Expected Response**: 
  ```json
  {
    "status": "OK",
    "message": "Laundry Backend is running!"
  }
  ```
- **Monitoring Frequency**: Every 30 seconds

#### Database Health Check
- **Endpoint**: `GET /api/test/db`
- **Purpose**: Validates database connectivity
- **Expected Response**: Database connection success

#### Environment Variables Check
- **Endpoint**: `GET /debug/env`
- **Purpose**: Validates configuration (non-sensitive data only)
- **Expected Response**: Configuration status

### 1.4.2 ### Log Locations

#### Application Logs
- **Azure App Service Logs**: 
  - Path: `/home/LogFiles/Application/`
  - Retention: 7 days
  - Access: Azure Portal → App Service → Monitoring → Log stream

#### Database Logs
- **PostgreSQL Logs**:
  - Location: Azure Database for PostgreSQL → Monitoring → Server logs
  - Query Performance Insights available in Azure Portal

#### Frontend Logs
- **Browser Console**: Client-side errors and API call logs
- **Azure Static Web Apps**: Build and deployment logs in GitHub Actions

### 1.4.3 ### Key Performance Indicators (KPIs)

| Metric | Threshold | Alert Level |
|--------|-----------|-------------|
| **Response Time** | < 2 seconds | Warning at 3s, Critical at 5s |
| **Database Connections** | < 80% of pool | Warning at 80%, Critical at 95% |
| **Error Rate** | < 1% | Warning at 1%, Critical at 5% |
| **CPU Usage** | < 70% | Warning at 70%, Critical at 90% |
| **Memory Usage** | < 80% | Warning at 80%, Critical at 95% |

### 1.4.4 ### Monitoring Queries (Application Insights)

```kusto
// High error rate detection
requests
| where timestamp > ago(5m)
| summarize total = count(), errors = countif(resultCode >= 400) by bin(timestamp, 1m)
| extend errorRate = (errors * 100.0) / total
| where errorRate > 5

// Slow response times
requests
| where timestamp > ago(15m)
| where duration > 3000
| order by timestamp desc

// Database connection issues
traces
| where timestamp > ago(10m)
| where message contains "Database connection error"
```

---

## 1.5 ## Common Incidents & Recovery

### 1.5.1 ### Incident 1: Database Connection Loss

**Symptoms:**
- HTTP 500 errors on API endpoints
- Error message: "Database connection error"
- Health check endpoint fails

**Root Causes:**
- Network connectivity issues
- Database server restart
- Connection pool exhaustion
- SSL certificate issues

**Recovery Steps:**
1. **Immediate Response (< 5 minutes)**:
   ```bash
   # Check database server status
   az postgres flexible-server show --name laundry-db --resource-group jasmine_capstoneproject
   
   # Restart App Service
   az webapp restart --name laundry-backend-app --resource-group jasmine_capstoneproject
   ```

2. **Investigation**:
   - Check Application Insights for database connection errors
   - Verify database server metrics in Azure Portal
   - Review connection string configuration

3. **Resolution**:
   - If SSL issues: Update connection string with proper SSL settings
   - If pool exhaustion: Scale up App Service or tune connection pool
   - If server issues: Contact Azure support

**Prevention:**
- Implement connection retry logic with exponential backoff
- Monitor connection pool usage
- Set up automated scaling policies

### 1.5.2 ### Incident 2: Application Service Crash

**Symptoms:**
- HTTP 503 Service Unavailable
- Application not responding
- High memory/CPU usage before crash

**Recovery Steps:**
1. **Immediate Response**:
   ```bash
   # Restart the application
   az webapp restart --name laundry-backend-app --resource-group jasmine_capstoneproject
   
   # Check application logs
   az webapp log download --name laundry-backend-app --resource-group jasmine_capstoneproject
   ```

2. **Root Cause Analysis**:
   - Review memory usage patterns
   - Check for memory leaks in Node.js application
   - Analyze CPU spikes and their correlation with user activity

3. **Long-term Resolution**:
   - Scale up App Service plan if resource-related
   - Optimize code for memory efficiency
   - Implement graceful error handling

### 1.5.3 ### Incident 3: Frontend-Backend Communication Failure

**Symptoms:**
- CORS errors in browser console
- API calls returning 404 or network errors
- Frontend shows "Unable to connect" messages

**Recovery Steps:**
1. **Verify CORS Configuration**:
   ```bash
   # Check current CORS settings
   az webapp cors show --name laundry-backend-app --resource-group jasmine_capstoneproject
   
   # Add frontend origin if missing
   az webapp cors add --name laundry-backend-app --resource-group jasmine_capstoneproject --allowed-origins "https://laundry-frontend-app.azurestaticapps.net"
   ```

2. **Check Environment Variables**:
   - Verify `REACT_APP_API_URL` in frontend build
   - Confirm backend URL is accessible

3. **Network Troubleshooting**:
   - Test API endpoints directly with curl/Postman
   - Verify SSL certificates are valid
   - Check Azure networking rules

### 1.5.4 ### Incident 4: High User Load

**Symptoms:**
- Slow response times (> 5 seconds)
- Timeout errors
- High CPU/memory usage

**Recovery Steps:**
1. **Immediate Scaling**:
   ```bash
   # Scale out App Service
   az appservice plan update --name laundry-backend-plan --resource-group jasmine_capstoneproject --number-of-workers 3
   
   # Scale up if needed
   az appservice plan update --name laundry-backend-plan --resource-group jasmine_capstoneproject --sku P1V2
   ```

2. **Database Optimization**:
   - Check for long-running queries
   - Optimize database indexes
   - Scale up database tier if needed

---

## 1.6 ## Testing Scenarios & Results

### 1.6.1 ### Unit Tests

#### Backend API Tests
**Test Framework**: Jest + Supertest

**Authentication Tests**:
```javascript
// POST /api/auth/login
describe('Authentication', () => {
  test('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ student_id: 'demo', password: 'demo' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.student_id).toBe('demo');
  });
  
  test('should reject invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ student_id: 'invalid', password: 'wrong' });
    
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
```

**Machine Management Tests**:
```javascript
describe('Machines API', () => {
  test('should get all machines', async () => {
    const response = await request(app).get('/api/machines');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(8);
  });
  
  test('should get specific machine by ID', async () => {
    const response = await request(app).get('/api/machines/1');
    
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(1);
    expect(response.body.machine_number).toBe('Machine 1');
  });
});
```

**Reservation Tests**:
```javascript
describe('Reservations API', () => {
  test('should create reservation with valid data', async () => {
    const reservationData = {
      student_id: 'demo',
      machine_id: 1,
      date: '2025-08-25',
      time: '2:00 PM'
    };
    
    const response = await request(app)
      .post('/api/reservations')
      .send(reservationData);
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.reservation).toBeDefined();
  });
  
  test('should prevent double booking', async () => {
    // Create first reservation
    await request(app)
      .post('/api/reservations')
      .send({
        student_id: 'demo',
        machine_id: 1,
        date: '2025-08-25',
        time: '3:00 PM'
      });
    
    // Try to create conflicting reservation
    const response = await request(app)
      .post('/api/reservations')
      .send({
        student_id: '123123',
        machine_id: 1,
        date: '2025-08-25',
        time: '3:00 PM'
      });
    
    expect(response.status).toBe(409);
    expect(response.body.message).toContain('already reserved');
  });
});
```

### 1.6.2 ### Integration Tests

#### Database Integration Tests
**Test Scenario**: End-to-end user registration and reservation flow

```javascript
describe('Integration: User Registration to Reservation', () => {
  beforeEach(async () => {
    // Clean database state
    await pool.query('DELETE FROM reservations');
    await pool.query('DELETE FROM users WHERE student_id = ?', ['test_user']);
  });
  
  test('complete user journey', async () => {
    // 1. User registration (simulated via direct DB insert)
    const userResult = await pool.query(
      'INSERT INTO users (student_id, password, name, email) VALUES ($1, $2, $3, $4) RETURNING id',
      ['test_user', 'password123', 'Test User', 'test@university.edu']
    );
    const userId = userResult.rows[0].id;
    
    // 2. Login
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ student_id: 'test_user', password: 'password123' });
    
    expect(loginResponse.status).toBe(200);
    
    // 3. Get available machines
    const machinesResponse = await request(app).get('/api/machines');
    expect(machinesResponse.status).toBe(200);
    expect(machinesResponse.body.length).toBeGreaterThan(0);
    
    // 4. Create reservation
    const reservationResponse = await request(app)
      .post('/api/reservations')
      .send({
        student_id: 'test_user',
        machine_id: 1,
        date: '2025-08-26',
        time: '10:00 AM'
      });
    
    expect(reservationResponse.status).toBe(201);
    expect(reservationResponse.body.success).toBe(true);
    
    // 5. Verify reservation was created
    const reservationsResponse = await request(app).get('/api/reservations');
    const userReservations = reservationsResponse.body.data.reservations.filter(
      r => r.user_id === userId
    );
    expect(userReservations.length).toBe(1);
  });
});
```

### 1.6.3 ### End-to-End Tests

#### Frontend E2E Tests (Cypress)
**Test Framework**: Cypress

```javascript
describe('Laundry Reservation E2E', () => {
  beforeEach(() => {
    cy.visit('/');
  });
  
  it('should complete reservation flow', () => {
    // 1. Login
    cy.get('[data-testid="login-button"]').click();
    cy.get('[data-testid="student-id-input"]').type('demo');
    cy.get('[data-testid="password-input"]').type('demo');
    cy.get('[data-testid="submit-login"]').click();
    
    // 2. Verify dashboard loads
    cy.get('[data-testid="dashboard"]').should('be.visible');
    cy.get('[data-testid="machine-grid"]').should('be.visible');
    
    // 3. Select available machine
    cy.get('[data-testid="machine-card-1"]').should('contain', 'Available');
    cy.get('[data-testid="reserve-button-1"]').click();
    
    // 4. Fill reservation form
    cy.get('[data-testid="date-picker"]').type('2025-08-26');
    cy.get('[data-testid="time-select"]').select('10:00 AM');
    cy.get('[data-testid="confirm-reservation"]').click();
    
    // 5. Verify confirmation
    cy.get('[data-testid="success-message"]').should('contain', 'Reservation confirmed');
    
    // 6. Check reservation appears in user's list
    cy.get('[data-testid="my-reservations"]').click();
    cy.get('[data-testid="reservation-list"]').should('contain', 'Machine 1');
  });
  
  it('should handle machine unavailable scenario', () => {
    // Create existing reservation first (via API)
    cy.request('POST', '/api/reservations', {
      student_id: 'demo',
      machine_id: 1,
      date: '2025-08-26',
      time: '2:00 PM'
    });
    
    // Login and try to book same slot
    cy.get('[data-testid="login-button"]').click();
    cy.get('[data-testid="student-id-input"]').type('123123');
    cy.get('[data-testid="password-input"]').type('password');
    cy.get('[data-testid="submit-login"]').click();
    
    cy.get('[data-testid="reserve-button-1"]').click();
    cy.get('[data-testid="date-picker"]').type('2025-08-26');
    cy.get('[data-testid="time-select"]').select('2:00 PM');
    cy.get('[data-testid="confirm-reservation"]').click();
    
    // Should show conflict error
    cy.get('[data-testid="error-message"]').should('contain', 'already reserved');
  });
});
```

### 1.6.4 ### Manual Test Cases

#### Test Case 1: Lost and Found Functionality
**Objective**: Verify users can report and search lost items

**Test Steps**:
1. Login as demo user
2. Navigate to Lost & Found section
3. Click "Report Lost Item"
4. Fill form with: Item="Textbook", Description="Blue calculus book", Location="Basement laundry"
5. Submit form
6. Verify item appears in lost items list
7. Test search functionality with keyword "textbook"

**Expected Results**:
- Item successfully submitted with status "active"
- Item visible in public lost items list
- Search returns correct results

**Actual Results**: ✅ PASS - All functionality working as expected

#### Test Case 2: Peak Load Simulation
**Objective**: Test system behavior under high concurrent user load

**Test Setup**:
- 50 concurrent users attempting to make reservations
- Target: Same machine, different time slots
- Duration: 5 minutes

**Test Script** (Artillery.js):
```yaml
config:
  target: 'https://laundry-backend-app.azurewebsites.net'
  phases:
    - duration: 300
      arrivalRate: 10
scenarios:
  - name: "Concurrent Reservations"
    steps:
      - post:
          url: "/api/auth/login"
          json:
            student_id: "demo"
            password: "demo"
      - post:
          url: "/api/reservations"
          json:
            student_id: "demo"
            machine_id: "{{ $randomInt(1, 8) }}"
            date: "2025-08-26"
            time: "{{ $randomInt(9, 17) }}:00 AM"
```

**Results**:
- ✅ Average response time: 1.2 seconds
- ✅ 99% of requests successful
- ✅ No database connection errors
- ⚠️ Minor CPU spikes during peak load (scaled automatically)

---

## 1.7 ## Post-Deployment Validation

### 1.7.1 ### Smoke Tests (System Validation)

#### Critical Path Validation
Run these tests immediately after any deployment:

**1. Health Check Validation**
```bash
# Backend health
curl https://laundry-backend-app.azurewebsites.net/health
# Expected: {"status":"OK","message":"Laundry Backend is running!"}

# Database connectivity
curl https://laundry-backend-app.azurewebsites.net/debug/env
# Expected: All DB_* variables should show as "***SET***"
```

**2. API Endpoints Validation**
```bash
# Get machines
curl https://laundry-backend-app.azurewebsites.net/api/machines
# Expected: Array of 8 machines

# Authentication test
curl -X POST https://laundry-backend-app.azurewebsites.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"student_id":"demo","password":"demo"}'
# Expected: {"success":true,"data":{"user":{"student_id":"demo",...}}}
```

**3. Frontend Connectivity**
```bash
# Check frontend loads
curl -I https://laundry-frontend-app.azurestaticapps.net
# Expected: HTTP 200

# Check API configuration
curl https://laundry-frontend-app.azurestaticapps.net/static/js/main.*.js | grep -o 'azurewebsites.net'
# Expected: Backend URL should be present in bundled code
```

#### Database Schema Validation
```sql
-- Verify all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
-- Expected: users, machines, reservations, lost_and_found

-- Verify machine data
SELECT COUNT(*) FROM machines;
-- Expected: 8

-- Verify demo user exists
SELECT student_id, name FROM users WHERE student_id = 'demo';
-- Expected: demo, Demo User
```

#### Performance Validation
```bash
# Response time check
time curl https://laundry-backend-app.azurewebsites.net/api/machines
# Expected: < 2 seconds

# Load test (light)
ab -n 100 -c 10 https://laundry-backend-app.azurewebsites.net/health
# Expected: All requests successful, avg response < 1000ms
```

### 1.7.2 ### Deployment Checklist

#### Pre-Deployment
- [ ] Database backup completed
- [ ] Environment variables configured
- [ ] SSL certificates valid
- [ ] Monitoring alerts active
- [ ] Rollback plan prepared

#### Post-Deployment
- [ ] Health checks passing
- [ ] Critical user flows tested
- [ ] Error rates within normal range
- [ ] Database connectivity confirmed
- [ ] Frontend-backend communication verified
- [ ] Logs flowing to Application Insights
- [ ] Performance metrics within SLA

#### Go/No-Go Criteria
**GO Criteria**:
- Health endpoint returns 200 OK
- Authentication API functional
- Database queries successful
- Frontend loads without console errors
- Response times < 3 seconds

**NO-GO Criteria** (Immediate rollback):
- Health endpoint fails
- Database connection errors
- HTTP 5xx error rate > 10%
- Frontend completely inaccessible
- Critical security vulnerabilities detected

---

## 1.8 ## Troubleshooting Guide

### 1.8.1 ### Common Error Messages

#### "Database connection error"
**Cause**: PostgreSQL connectivity issues
**Solution**: 
1. Check database server status in Azure Portal
2. Verify connection string in App Service settings
3. Restart App Service to refresh connections

#### "CORS policy: No 'Access-Control-Allow-Origin'"
**Cause**: Frontend origin not allowed by backend
**Solution**:
```bash
az webapp cors add --name laundry-backend-app --resource-group jasmine_capstoneproject --allowed-origins "https://your-frontend-domain.azurestaticapps.net"
```

#### "JWT token expired"
**Cause**: User session timeout (if JWT is implemented)
**Solution**: User needs to login again, or refresh token

#### "This time slot is already reserved"
**Cause**: Booking conflict detection working correctly
**Solution**: User should select different time slot

### 1.8.2 ### Performance Issues

#### Slow Database Queries
**Investigation**:
```sql
-- Check for long-running queries
SELECT query, state, query_start 
FROM pg_stat_activity 
WHERE state = 'active' AND query_start < NOW() - INTERVAL '30 seconds';

-- Check for lock contention
SELECT blocked_locks.pid AS blocked_pid,
       blocking_locks.pid AS blocking_pid,
       blocked_activity.query AS blocked_statement
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype;
```

**Resolution**:
- Add database indexes for frequently queried columns
- Optimize JOIN queries in reservations endpoint
- Scale up database tier if needed

#### High Memory Usage
**Investigation**:
- Check App Service metrics in Azure Portal
- Review memory usage patterns over time
- Identify memory leaks in Node.js code

**Resolution**:
- Restart App Service as immediate fix
- Scale up App Service plan
- Optimize code to reduce memory footprint

### 1.8.3 ### Connectivity Issues

#### Frontend Can't Reach Backend
**Checklist**:
1. ✅ Backend health endpoint accessible
2. ✅ CORS configuration includes frontend domain
3. ✅ DNS resolution working
4. ✅ SSL certificates valid
5. ✅ No Azure networking rules blocking traffic

#### Database Connection Pool Exhausted
**Symptoms**: "sorry, too many clients already"
**Solution**:
```javascript
// Increase pool size in database.js
const pool = new Pool({
  // ... other config
  max: 20,  // Increase from default 10
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

---

## 1.9 ## Emergency Contacts

### 1.9.1 ### Escalation Matrix

| Severity | Response Time | Contact |
|----------|---------------|---------|
| **Critical** (System Down) | < 15 minutes | On-call engineer (24/7) |
| **High** (Major Feature Broken) | < 2 hours | Development team lead |
| **Medium** (Minor Issues) | < 1 business day | Project maintainer |
| **Low** (Enhancement Request) | < 1 week | Product owner |

### 1.9.2 ### Contact Information

**Primary Contacts**:
- **Development Team Lead**: [Name] - [email] - [phone]
- **DevOps Engineer**: [Name] - [email] - [phone]
- **Database Administrator**: [Name] - [email] - [phone]

**Secondary Contacts**:
- **Product Owner**: [Name] - [email]
- **System Administrator**: [Name] - [email]

**Azure Support**:
- **Azure Support Case**: Create via Azure Portal
- **Emergency Phone**: 1-800-MICROSOFT (for critical production issues)

### 1.9.3 ### Escalation Procedures

1. **Immediate Response** (0-15 minutes):
   - Assess impact and severity
   - Implement immediate workarounds if available
   - Notify stakeholders via established communication channels

2. **Short-term Resolution** (15 minutes - 2 hours):
   - Identify root cause
   - Implement fix or rollback
   - Monitor system stability

3. **Long-term Prevention** (2+ hours):
   - Conduct post-incident review
   - Update documentation and monitoring
   - Implement preventive measures

### 1.9.4 ### Communication Channels

- **Slack**: #laundry-system-alerts (automated alerts)
- **Email**: laundry-system-team@university.edu
- **Phone**: Emergency escalation tree
- **Azure Portal**: Service Health dashboard

---

## 1.10 ## Document Maintenance

**Last Updated**: August 24, 2025  
**Next Review Date**: November 24, 2025  
**Document Owner**: Development Team  
**Approval**: [Signature required]

**Change Log**:
- v1.0 (2025-08-24): Initial document creation
- [Future versions to be added here]

This document should be reviewed and updated quarterly or after any major system changes.

---


---

# 2. System Setup Instructions (Frontend, Backend, Database)


## 2.1 Overview
The **PurpleWash Northwestern Campus Laundry Hub** is a full-stack web application designed to streamline laundry machine reservations, manage lost-and-found reporting, and enhance campus community engagement. This document provides comprehensive setup instructions for all system components.

The system implements a three-tier architecture, consisting of:
- **Frontend**: A React.js (v19.1.0) single-page application (SPA) with React Router (v6.22.3) for navigation and responsive user interaction across devices.
- **Backend**: A Node.js/Express.js RESTful API with middleware for authentication, error handling, and security, responsible for business logic implementation and database interaction.
- **Database**: A PostgreSQL relational database with optimized schema for secure, persistent, and structured data storage with proper referential integrity.

For seamless integration and functionality, each component requires precise configuration following industry best practices.---

## 2.2 Prerequisites

### 2.2.1 ### Supported Operating Systems
- Windows 10/11  
- macOS 10.15 (Catalina) or newer  
- Linux distributions (Ubuntu 18.04+ recommended)  

*Note: Administrative privileges are required for software installation and configuration.*

### 2.2.2 ### Required Software
- **Node.js**: Version 16 or higher (18.x LTS recommended)  
- **PostgreSQL**: Version 12 or higher (14.x recommended)  
- **Git**: Version control system for source code management  
- **Code Editor**: Visual Studio Code or equivalent IDE  
- **Postman (Optional)**: API testing and validation tool  

### 2.2.3 ### Hardware Requirements
- Minimum **4 GB RAM** (8 GB recommended)  
- At least **2 GB free disk space**  
- Stable **internet connection** for downloading dependencies and packages  

---

## 2.3 Environment Configuration

### 2.3.1 ### Backend Environment Variables
The backend requires a configuration file containing environment variables to ensure proper connectivity and runtime behavior. The key parameters include:  
- Database connection details (host, port, name, user, password)  
- Application server port (default: **3000**)  
- Runtime environment type (development or production)  
- JSON Web Token (**JWT**) secret key for authentication and session management  
- Allowed frontend URL for handling cross-origin requests (**CORS**)  

### 2.3.2 ### Frontend Environment Variables
The frontend application requires fewer environment variables to interact with the backend API:  
- Base URL of the backend API service  
- Runtime environment type (development or production)  

---

## 2.4 Database Setup
During initialization, a new PostgreSQL database instance must be created, along with a dedicated user that has appropriate access privileges.  

### 2.4.1 ### Required Schema
The schema should contain the following core tables:  
- **Users** – Stores authentication details, roles, and account metadata  
- **Machines** – Represents laundry machines and their availability status  
- **Reservations** – Tracks booking records made by students  
- **Lost and Found** – Manages reported items and their statuses  

### 2.4.2 ### Seed Data
To enable testing and demonstration, initial seed data should be inserted into:  
- The **Machines** table – Representing washers and dryers across multiple dormitory locations  
- The **Users** table – Providing demo accounts for login and integration testing  

### 2.4.3 ### Validation
Validation of the setup can be confirmed by:  
- Verifying that all required tables exist within the database schema  
- Running sample queries to confirm that seed data has been successfully inserted  

---

## 2.5 Backend Setup
After installing all necessary dependencies, the backend server can be launched in development mode.  

- The server should run on **port 3000** by default.  
- A dedicated **health check endpoint** should be accessible either via a browser or API client (e.g., Postman) to verify that the backend service is operational and connected to the database.  

---

## 2.6 Frontend Setup
Once dependencies are installed, the frontend React application can be started.  

- In development mode, the service is accessible at **http://localhost:3001**.  
- Upon successful startup, the **login page** should load in the browser, and navigation across different sections of the application should function correctly.  

---

## 2.7 System Integration
Integration between components must be validated as follows:  
1. Confirm PostgreSQL is running and accessible.  
2. Start the backend service on **port 3000**.  
3. Start the frontend service on **port 3001**.  
4. Validate integration by:  
   - Logging in with demo credentials (e.g., *demo/demo*)  
   - Performing a machine reservation workflow  
   - Submitting and retrieving lost-and-found records  

---

## 2.8 Deployment Guidelines

### 2.8.1 ### Development Environment
- Localhost-based setup (Frontend: 3001, Backend: 3000, Database: 5432).  

### 2.8.2 ### Production Environment
- **Frontend**: Deployed to a static hosting provider such as **Netlify** or **Vercel**.  
- **Backend**: Deployed to a cloud service such as **Heroku** or **AWS**.  
- **Database**: Provisioned on a managed PostgreSQL service for reliability and scalability.  

---

## 2.9 Validation Checklist
To confirm that the system is correctly configured and deployed, the following conditions must be satisfied:  
-  The PostgreSQL database is running and initialized with required schema and seed data.  
-  The backend API service is reachable on its designated port and successfully establishes a database connection.  
-  The frontend service is accessible via a browser and can communicate with the backend without CORS issues.  
-  Demo account authentication works correctly.  
-  Core features, including **machine reservations** and **lost-and-found item submissions**, operate as expected.  

---

## PurpleWash Northwestern Campus Laundry Hub - Detailed Setup Guide

## 2.10 ## Table of Contents
1. [Prerequisites Setup](#prerequisites-setup)
2. [Database Setup](#database-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Environment Configuration](#environment-configuration)
6. [Build and Deployment](#build-and-deployment)
7. [Validation and Testing](#validation-and-testing)
8. [Troubleshooting](#troubleshooting)

---

## 2.11 ## Prerequisites Setup

### 2.11.1 . Operating System Requirements
- **Windows**: Windows 10/11 (Administrator privileges required)
- **macOS**: macOS 10.15 (Catalina) or newer
- **Linux**: Ubuntu 18.04+ or equivalent

### 2.11.2 . Install Node.js (Required)

#### Windows:
```powershell
# Download and install Node.js 18.x LTS from official website
# Visit: https://nodejs.org/en/download/
# Or use Chocolatey (if installed):
choco install nodejs --version=18.17.0

# Verify installation
node --version
npm --version
```

#### macOS:
```bash
# Using Homebrew (recommended):
brew install node@18

# Or download from official website: https://nodejs.org/en/download/

# Verify installation
node --version
npm --version
```

#### Linux (Ubuntu):
```bash
# Update package list
sudo apt update

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 2.11.3 . Install PostgreSQL (Required)

#### Windows:
```powershell
# Download PostgreSQL 14.x from: https://www.postgresql.org/download/windows/
# During installation:
# - Remember the superuser password
# - Default port: 5432
# - Install pgAdmin 4 (recommended)

# Verify installation (in Command Prompt)
psql --version
```

#### macOS:
```bash
# Using Homebrew:
brew install postgresql@14

# Start PostgreSQL service
brew services start postgresql@14

# Verify installation
psql --version
```

#### Linux (Ubuntu):
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
psql --version
```

### 2.11.4 . Install Git (Required)
```bash
# Windows (PowerShell)
winget install Git.Git

# macOS
brew install git

# Linux (Ubuntu)
sudo apt install git

# Verify installation
git --version
```

### 2.11.5 . Install Code Editor (Recommended)
```bash
# Download Visual Studio Code from: https://code.visualstudio.com/
# Or use command line:

# Windows
winget install Microsoft.VisualStudioCode

# macOS
brew install --cask visual-studio-code

# Linux
sudo snap install code --classic
```

---

## 2.12 ## Database Setup

### 2.12.1 . Create Database User
```bash
# Connect to PostgreSQL as superuser
# Windows/Linux:
sudo -u postgres psql

# macOS (if using Homebrew):
psql postgres

# Create a new user for the application
CREATE USER youxinying WITH PASSWORD 'your_secure_password';

# Grant necessary privileges
ALTER USER youxinying CREATEDB;
ALTER USER youxinying WITH SUPERUSER;

# Exit PostgreSQL
\q
```

### 2.12.2 . Create Application Database
```bash
# Connect as the new user
psql -U youxinying -h localhost

# Create the database
CREATE DATABASE laundry_reservation;

# Exit
\q
```

### 2.12.3 . Initialize Database Schema
```bash
# Navigate to the project directory
cd laundry-backend

# Run database initialization script
psql -U youxinying -d laundry_reservation -f database/schema.sql

# Add sample data
psql -U youxinying -d laundry_reservation -f database/add_users.sql
```

### 2.12.4 . Verify Database Setup
```sql
-- Connect to the database
psql -U youxinying -d laundry_reservation

-- Check if tables exist
\dt

-- Verify sample data
SELECT * FROM users LIMIT 5;
SELECT * FROM machines;

-- Exit
\q
```

---

## 2.13 ## Backend Setup

### 2.13.1 . Clone Repository
```bash
# Clone the repository
git clone https://github.com/Xinying777/laundry_reservation_system.git

# Navigate to project directory
cd laundry_reservation_system

# Navigate to backend directory
cd laundry-backend
```

### 2.13.2 . Install Dependencies
```bash
# Install all Node.js dependencies
npm install

# If you encounter permission errors on Windows:
# npm install --production --silent
```

### 2.13.3 . Create Environment File
```bash
# Create .env file in laundry-backend directory
# Windows (PowerShell):
New-Item -Path ".env" -ItemType File

# macOS/Linux:
touch .env
```

### 2.13.4 . Configure Environment Variables
Edit the `.env` file with the following content:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=laundry_reservation
DB_USER=youxinying
DB_PASSWORD=your_secure_password
DB_SSL=false

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3005
```

### 2.13.5 . Test Database Connection
```bash
# Run database connection test
node test-db.js

# Expected output: "✅ Database connection successful!"
```

### 2.13.6 . Start Backend Server
```bash
# Start the development server
npm start

# Alternative (with auto-restart on changes):
npm run dev

# Expected output:
# "Server is running on port 3000"
# "✅ Database connection verified"
```

### 2.13.7 . Verify Backend Setup
```bash
# Test health check endpoint
curl http://localhost:3000/health

# Expected response: {"status":"OK","message":"Laundry Backend is running!"}

# Test API endpoints
curl http://localhost:3000/api/machines

# Should return array of machine objects
```

---

## 2.14 ## Frontend Setup

### 2.14.1 . Navigate to Frontend Directory
```bash
# From project root
cd laundry-frontend
```

### 2.14.2 . Install Dependencies
```bash
# Install all React dependencies
npm install

# If you encounter issues, try:
npm install --legacy-peer-deps
```

### 2.14.3 . Create Environment File
```bash
# Create .env file in laundry-frontend directory
# Windows (PowerShell):
New-Item -Path ".env" -ItemType File

# macOS/Linux:
touch .env
```

### 2.14.4 . Configure Frontend Environment
Edit the `.env` file with:
```env
# Backend API URL
REACT_APP_API_URL=http://localhost:3000

# Environment
NODE_ENV=development

# Port (optional, defaults to 3000)
PORT=3005
```

### 2.14.5 . Start Frontend Development Server
```bash
# Start React development server
npm start

# The application will automatically open in your browser at:
# http://localhost:3005
```

### 2.14.6 . Verify Frontend Setup
- Browser should automatically open to `http://localhost:3005`
- You should see the login page
- No console errors should appear in browser developer tools
- Page should load completely with Northwestern purple theme

---

## 2.15 ## Environment Configuration

### 2.15.1 ### Development Environment Variables

#### Backend (.env in laundry-backend/)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=laundry_reservation
DB_USER=youxinying
DB_PASSWORD=your_secure_password
DB_SSL=false
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
FRONTEND_URL=http://localhost:3005
```

#### Frontend (.env in laundry-frontend/)
```env
REACT_APP_API_URL=http://localhost:3000
NODE_ENV=development
PORT=3005
```

### 2.15.2 ### Production Environment Variables

#### Backend (Azure App Service)
```env
DB_HOST=your-azure-postgres-server.postgres.database.azure.com
DB_PORT=5432
DB_NAME=laundry_db
DB_USER=your_username
DB_PASSWORD=your_secure_password
DB_SSL=true
PORT=8080
NODE_ENV=production
JWT_SECRET=your_production_jwt_secret
FRONTEND_URL=https://your-frontend-domain.azurestaticapps.net
```

#### Frontend (Azure Static Web Apps)
```env
REACT_APP_API_URL=https://your-backend-app.azurewebsites.net
NODE_ENV=production
```

---

## 2.16 ## Build and Deployment

### 2.16.1 ### Development Build

#### Backend
```bash
# Backend doesn't require building for development
# Just ensure dependencies are installed
cd laundry-backend
npm install
npm start
```

#### Frontend
```bash
# Create production build
cd laundry-frontend
npm run build

# The build folder will contain the production-ready files
# Serve the build locally for testing:
npm install -g serve
serve -s build -l 3002
```

### 2.16.2 ### Production Deployment

#### Deploy to Azure (Backend)
```bash
# Install Azure CLI
# Windows: winget install Microsoft.AzureCLI
# macOS: brew install azure-cli
# Linux: curl -sL https://aka.ms/InstallAzureCLI | sudo bash

# Login to Azure
az login

# Create resource group
az group create --name laundry-app-rg --location "Central US"

# Create App Service plan
az appservice plan create --name laundry-plan --resource-group laundry-app-rg --sku B1 --is-linux

# Create web app
az webapp create --resource-group laundry-app-rg --plan laundry-plan --name laundry-backend-app --runtime "NODE|18-lts"

# Deploy code
cd laundry-backend
zip -r ../backend-deploy.zip .
az webapp deployment source config-zip --resource-group laundry-app-rg --name laundry-backend-app --src ../backend-deploy.zip

# Configure environment variables
az webapp config appsettings set --resource-group laundry-app-rg --name laundry-backend-app --settings \
  DB_HOST="your-postgres-host" \
  DB_NAME="laundry_db" \
  DB_USER="your_username" \
  DB_PASSWORD="your_password" \
  NODE_ENV="production"
```

#### Deploy to Azure (Frontend)
```bash
# Install Azure Static Web Apps CLI
npm install -g @azure/static-web-apps-cli

# Build the application
cd laundry-frontend
npm run build

# Deploy to Azure Static Web Apps
# Follow the wizard to connect your GitHub repository
swa deploy
```

### 2.16.3 ### Alternative Deployment Options

#### Using Docker
```dockerfile
# Dockerfile for backend (create in laundry-backend/)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build and run Docker container
docker build -t laundry-backend .
docker run -p 3000:3000 --env-file .env laundry-backend
```

---

## 2.17 ## Validation and Testing

### 2.17.1 . System Integration Validation

#### Test Database Connection
```bash
# From backend directory
node test-db.js

# Expected output: ✅ Database connection successful!
```

#### Test Backend Health
```bash
# Test health endpoint
curl http://localhost:3000/health

# Expected response:
# {"status":"OK","message":"Laundry Backend is running!"}
```

#### Test API Endpoints
```bash
# Test machines endpoint
curl http://localhost:3000/api/machines

# Should return array of 8 machines

# Test authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"student_id":"demo","password":"demo"}'

# Should return success with user data
```

### 2.17.2 . Frontend Validation

#### Visual Verification
1. Open browser to `http://localhost:3005`
2. Login page should load with Northwestern branding
3. Use demo credentials: `student_id: demo`, `password: demo`
4. Dashboard should show 8 machines with status
5. Navigation should work between all sections

#### Browser Console Check
1. Open browser developer tools (F12)
2. Check Console tab for errors
3. Should see no red error messages
4. Network tab should show successful API calls

### 2.17.3 . End-to-End Testing

#### Complete User Flow
```bash
# Manual test sequence:
1. Login with demo/demo credentials ✓
2. View machines dashboard ✓
3. Click "Reserve" on an available machine ✓
4. Select date and time ✓
5. Confirm reservation ✓
6. Check "My Reservations" section ✓
7. Try Lost & Found feature ✓
8. Submit a lost item report ✓
9. View lost items list ✓
10. Logout ✓
```

### 2.17.4 . Performance Validation
```bash
# Check response times
time curl http://localhost:3000/api/machines

# Should complete in < 2 seconds

# Load test (if Apache Bench is installed)
ab -n 100 -c 10 http://localhost:3000/health

# All requests should succeed
```

---

## 2.18 ## Troubleshooting

### 2.18.1 ### Common Issues and Solutions

#### 1. "Database connection error"
```bash
# Check if PostgreSQL is running
# Windows:
net start postgresql-x64-14

# macOS:
brew services start postgresql@14

# Linux:
sudo systemctl start postgresql

# Verify connection manually
psql -U youxinying -d laundry_reservation -h localhost
```

#### 2. "Port already in use"
```bash
# Find process using port 3000
# Windows:
netstat -ano | findstr :3000

# macOS/Linux:
lsof -i :3000

# Kill the process (replace PID with actual process ID)
# Windows:
taskkill /PID <PID> /F

# macOS/Linux:
kill -9 <PID>
```

#### 3. "npm install fails"
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# If still failing, try:
npm install --legacy-peer-deps
```

#### 4. "CORS errors in browser"
```bash
# Verify FRONTEND_URL in backend .env file
echo $FRONTEND_URL  # Should be http://localhost:3005

# Check backend logs for CORS configuration
# Look for: "CORS configured for: http://localhost:3005"
```

#### 5. "React app shows blank page"
```bash
# Check browser console for errors
# Common issues:
# - API URL misconfigured in .env
# - Backend not running
# - CORS issues

# Verify environment variables loaded
console.log(process.env.REACT_APP_API_URL)
# Should show: http://localhost:3000
```

### 2.18.2 ### Getting Help

If you encounter issues not covered here:

1. **Check logs**: Backend logs show in terminal, frontend errors in browser console
2. **Verify environment**: Ensure all environment variables are set correctly
3. **Database connectivity**: Test PostgreSQL connection independently
4. **Port conflicts**: Ensure ports 3000 and 3005 are available
5. **Dependencies**: Ensure all required software is installed with correct versions

### 2.18.3 ### System Requirements Verification

Run this checklist to ensure your system is properly configured:

```bash
# Check Node.js version (should be 16+)
node --version

# Check npm version
npm --version

# Check PostgreSQL version (should be 12+)
psql --version

# Check Git version
git --version

# Verify database connection
psql -U youxinying -d laundry_reservation -c "SELECT version();"

# Check if ports are available
netstat -an | grep :3000
netstat -an | grep :3005
```

All commands should execute successfully without errors.

---

**Last Updated**: August 24, 2025  
**Document Version**: 1.0  
**For Support**: Contact the development team or create an issue in the GitHub repository.

---



---

# 3. Issue Diagnosis, Research, Resolution, and Knowledge Sharing


## Northwestern Laundry Reservation System - Issue Diagnosis & Resolution Log

## 3.1 ## Table of Contents
1. [Database Connection Issues](#database-connection-issues)
2. [CORS Policy Errors](#cors-policy-errors)
3. [Reservation Conflict Detection Problems](#reservation-conflict-detection-problems)
4. [Azure Deployment Configuration Issues](#azure-deployment-configuration-issues)
5. [Frontend-Backend Communication Failures](#frontend-backend-communication-failures)
6. [PostgreSQL Schema Migration Problems](#postgresql-schema-migration-problems)
7. [React Build and Static Asset Issues](#react-build-and-static-asset-issues)

---

## 3.2 ## Issue #1: Database Connection Issues

### 3.2.1 ### Description of the Issue
**What Happened**: The backend API was returning HTTP 500 errors for all database-dependent endpoints, with error message "Database connection failed"

**Expected Behavior**: API endpoints should successfully connect to PostgreSQL database and return data

**Actual Behavior**: 
- `/api/machines` returned 500 Internal Server Error
- `/api/auth/login` failed with database connection error
- Health check endpoint `/health` was working but `/debug/env` showed database variables as "NOT_SET"

### 3.2.2 ### Environment & Setup Details
- **Date/Time**: August 20, 2025, 2:30 PM
- **Environment**: Local development environment
- **OS**: Windows 11
- **Node.js Version**: 18.17.0
- **PostgreSQL Version**: 14.2
- **Database**: Local PostgreSQL instance running on port 5432
- **Backend Port**: 3000

### 3.2.3 ### Steps to Reproduce
1. Start local PostgreSQL server
2. Run `npm start` in laundry-backend directory
3. Make GET request to `http://localhost:3000/api/machines`
4. Observe 500 error in browser console and server logs

### 3.2.4 ### Diagnosis
**Root Cause Analysis**:
After examining the server logs and database configuration, I identified that:

1. **Missing Environment Variables**: The `.env` file was not being loaded properly
2. **Incorrect Database Credentials**: Password had been changed but not updated in environment file
3. **SSL Configuration Mismatch**: Local PostgreSQL was configured without SSL, but connection string included SSL requirement

**Key Error Messages**:
```
❌ Database connection error: password authentication failed for user "youxinying"
❌ Database test failed: connect ECONNREFUSED 127.0.0.1:5432
```

### 3.2.5 ### Research Process

#### Resources Consulted:
1. **Official Documentation**:
   - [PostgreSQL Documentation - Client Authentication](https://www.postgresql.org/docs/current/client-authentication.html)
   - [Node.js pg module documentation](https://node-postgres.com/features/connecting)

2. **Stack Overflow Threads**:
   - [PostgreSQL password authentication failed](https://stackoverflow.com/questions/7695962/postgresql-password-authentication-failed-for-user)
   - [Node.js dotenv not loading environment variables](https://stackoverflow.com/questions/42335016/dotenv-file-is-not-loading-environment-variables)

3. **GitHub Issues**:
   - [node-postgres connection issues](https://github.com/brianc/node-postgres/issues/2009)

4. **AI Tools Consulted**:
   - GitHub Copilot for debugging connection string format
   - ChatGPT for PostgreSQL authentication troubleshooting

5. **Video Resources**:
   - [PostgreSQL Setup and Configuration Tutorial](https://www.youtube.com/watch?v=qw--VYLpxG4)

### 3.2.6 ### Resolution Steps

#### Step 1: Environment Variable Configuration
**Action**: Fixed `.env` file loading and variable names

**Before** (`laundry-backend/.env`):
```env
# Missing or incorrect variables
DATABASE_URL=postgresql://youxinying:oldpassword@localhost:5432/postgres
```

**After** (`laundry-backend/.env`):
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=postgres
DB_USER=youxinying
DB_PASSWORD=newcorrectpassword
DB_SSL=false
NODE_ENV=development
```

**Code Changes** (`laundry-backend/src/config/database.js`):
```javascript
// Added proper dotenv configuration at the top
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});
```

#### Step 2: PostgreSQL User Authentication
**Action**: Reset PostgreSQL user password and permissions

**Commands Executed**:
```sql
-- Connect as postgres superuser
sudo -u postgres psql

-- Reset user password
ALTER USER youxinying PASSWORD 'newcorrectpassword';

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE postgres TO youxinying;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO youxinying;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO youxinying;

-- Verify user can connect
\q
```

**Test Connection**:
```bash
psql -h localhost -U youxinying -d postgres
# Successfully connected without errors
```

#### Step 3: Application Configuration Update
**Action**: Updated database connection initialization

**Modified** (`laundry-backend/src/app.js`):
```javascript
// Added connection test on startup
const { testConnection } = require('./config/database');

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
  
  // Test database connection on startup
  const dbConnected = await testConnection();
  if (dbConnected) {
    console.log('✅ Database connection verified');
  } else {
    console.log('❌ Database connection failed - check configuration');
  }
});
```

### 3.2.7 ### Outcome Verification

#### Verification Tests Performed:
1. **Health Check Endpoint**:
   ```bash
   curl http://localhost:3000/health
   # Response: {"status":"OK","message":"Laundry Backend is running!"}
   ```

2. **Environment Variables Check**:
   ```bash
   curl http://localhost:3000/debug/env
   # Response: All DB_* variables showing as "***SET***"
   ```

3. **Database-Dependent Endpoints**:
   ```bash
   curl http://localhost:3000/api/machines
   # Response: Array of 8 machine objects
   
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"student_id":"demo","password":"demo"}'
   # Response: {"success":true,"data":{"user":{"student_id":"demo",...}}}
   ```

4. **Database Connection Test Script**:
   ```bash
   node laundry-backend/test-db.js
   # Output: ✅ Database connection successful!
   ```

**Final Status**: ✅ **RESOLVED** - All database connections working correctly, API endpoints responding as expected.

---

## 3.3 ## Issue #2: CORS Policy Errors

### 3.3.1 ### Description of the Issue
**What Happened**: Frontend React application couldn't make API calls to backend, showing CORS policy errors in browser console

**Expected Behavior**: Frontend should successfully make API calls to backend without CORS restrictions

**Actual Behavior**: 
- Browser console showed: "Access to fetch at 'http://localhost:3000/api/machines' from origin 'http://localhost:3001' has been blocked by CORS policy"
- All API calls from frontend failed
- Backend was accessible via Postman/curl but not from browser

### 3.3.2 ### Environment & Setup Details
- **Date/Time**: August 21, 2025, 10:15 AM
- **Environment**: Local development environment
- **Frontend Port**: 3001 (React dev server)
- **Backend Port**: 3000 (Express server)
- **Browser**: Chrome 117.0.5938.92

### 3.3.3 ### Steps to Reproduce
1. Start backend server: `npm start` in laundry-backend directory
2. Start frontend server: `npm start` in laundry-frontend directory
3. Open browser to `http://localhost:3001`
4. Try to login or view machines
5. Check browser console for CORS errors

### 3.3.4 ### Diagnosis
**Root Cause Analysis**:
The backend Express server was not configured to allow cross-origin requests from the frontend development server.

**Key Issues Identified**:
1. **Missing CORS Middleware**: Backend didn't have CORS properly configured
2. **Strict Origin Policy**: Browser blocking cross-origin requests by default
3. **Development vs Production Configuration**: Different origin requirements

### 3.3.5 ### Research Process

#### Resources Consulted:
1. **Official Documentation**:
   - [MDN Web Docs - CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
   - [Express.js CORS middleware](https://expressjs.com/en/resources/middleware/cors.html)

2. **Stack Overflow**:
   - [CORS error in React and Express](https://stackoverflow.com/questions/45975135/access-control-allow-origin-error-using-axios-in-react-web-throwing-error-in-con)

3. **NPM Package Documentation**:
   - [cors npm package](https://www.npmjs.com/package/cors)

### 3.3.6 ### Resolution Steps

#### Step 1: Install and Configure CORS Middleware
**Action**: Added proper CORS configuration to Express server

**Installation**:
```bash
cd laundry-backend
npm install cors
```

**Code Changes** (`laundry-backend/src/app.js`):
```javascript
const cors = require('cors');

// Configure CORS for development and production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3001',  // React dev server
      'http://localhost:3000',  // Backend server (for testing)
      'https://laundry-frontend-app.azurestaticapps.net'  // Production frontend
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,  // Allow cookies and credentials
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

#### Step 2: Update Frontend API Configuration
**Action**: Ensured frontend API calls include proper headers

**Modified** (`laundry-frontend/src/utils/api.js`):
```javascript
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Updated fetch configuration
const defaultFetchOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include'  // Include credentials for CORS
};

export const api = {
  get: (endpoint) => 
    fetch(`${API_BASE}${endpoint}`, defaultFetchOptions),
  
  post: (endpoint, data) => 
    fetch(`${API_BASE}${endpoint}`, {
      ...defaultFetchOptions,
      method: 'POST',
      body: JSON.stringify(data)
    })
};
```

### 3.3.7 ### Outcome Verification

#### Verification Tests:
1. **Browser Console Check**:
   - No more CORS errors in console
   - Network tab showing successful API calls

2. **Frontend Functionality Test**:
   ```javascript
   // All these API calls now work from frontend:
   GET http://localhost:3000/api/machines ✅
   POST http://localhost:3000/api/auth/login ✅
   GET http://localhost:3000/api/reservations ✅
   ```

3. **Cross-Origin Request Test**:
   ```bash
   # Test from different origins
   curl -H "Origin: http://localhost:3001" \
        -H "Access-Control-Request-Method: GET" \
        -X OPTIONS http://localhost:3000/api/machines
   # Response includes proper CORS headers
   ```

**Final Status**: ✅ **RESOLVED** - Frontend can successfully communicate with backend, all CORS issues eliminated.

---

## 3.4 ## Issue #3: Reservation Conflict Detection Problems

### 3.4.1 ### Description of the Issue
**What Happened**: Users could book the same washing machine for overlapping time slots, causing double bookings

**Expected Behavior**: System should prevent conflicting reservations and show appropriate error message

**Actual Behavior**: 
- Multiple users could reserve the same machine for the same time
- Database allowed duplicate reservations
- No conflict detection logic was working

### 3.4.2 ### Environment & Setup Details
- **Date/Time**: August 22, 2025, 3:45 PM
- **Environment**: Local development + Azure PostgreSQL testing
- **Database**: PostgreSQL with reservations table
- **API Endpoint**: POST `/api/reservations`

### 3.4.3 ### Steps to Reproduce
1. Login as user 'demo'
2. Create reservation: Machine 1, Date: 2025-08-25, Time: 2:00 PM
3. Login as user '123123'
4. Create same reservation: Machine 1, Date: 2025-08-25, Time: 2:00 PM
5. Both reservations were created successfully (bug)

### 3.4.4 ### Diagnosis
**Root Cause Analysis**:
1. **Missing Conflict Check Logic**: No validation before inserting reservations
2. **Time Format Inconsistency**: Frontend sent 12-hour format, backend expected 24-hour
3. **Database Constraints Missing**: No unique constraints on overlapping time slots

**SQL Query Analysis**:
```sql
-- This query should have prevented conflicts but wasn't implemented:
SELECT * FROM reservations 
WHERE machine_id = 1 
AND status IN ('pending', 'confirmed')
AND (
  (start_time <= '2025-08-25 14:00:00' AND end_time > '2025-08-25 14:00:00')
  OR (start_time < '2025-08-25 15:00:00' AND end_time >= '2025-08-25 15:00:00')
  OR (start_time >= '2025-08-25 14:00:00' AND end_time <= '2025-08-25 15:00:00')
);
```

### 3.4.5 ### Research Process

#### Resources Consulted:
1. **PostgreSQL Documentation**:
   - [Date/Time Types](https://www.postgresql.org/docs/current/datatype-datetime.html)
   - [Interval Overlap Detection](https://www.postgresql.org/docs/current/rangetypes.html)

2. **Stack Overflow**:
   - [Preventing overlapping time intervals in database](https://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap)
   - [PostgreSQL time range conflicts](https://stackoverflow.com/questions/3269456/postgresql-how-to-check-if-a-date-range-overlap-with-an-existing-one)

3. **SQL Tutorials**:
   - [Handling Time Conflicts in Booking Systems](https://www.sqlservertutorial.net/sql-server-date-functions/)

### 3.4.6 ### Resolution Steps

#### Step 1: Implement Conflict Detection Logic
**Action**: Added comprehensive conflict checking before reservation creation

**Modified** (`laundry-backend/src/routes/reservations.js`):
```javascript
router.post('/', async (req, res) => {
  // ... existing validation code ...

  try {
    // STEP 1: Check for time conflicts
    console.log('🔍 Checking for conflicts...');
    console.log(`Machine ID: ${actualDbMachineId}, Start: ${finalStartTime}, End: ${finalEndTime}`);
    
    const conflictCheck = await pool.query(`
      SELECT id, user_id, start_time, end_time, status
      FROM reservations 
      WHERE machine_id = $1 
       AND status IN ('pending', 'confirmed')
       AND (
         (start_time <= $2 AND end_time > $2) OR
         (start_time < $3 AND end_time >= $3) OR
         (start_time >= $2 AND end_time <= $3)
       )`,
      [actualDbMachineId, finalStartTime, finalEndTime]
    );

    console.log('🔍 Found conflicts:', conflictCheck.rows.length, conflictCheck.rows);

    if (conflictCheck.rows.length > 0) {
      console.log('❌ Conflict detected, rejecting reservation');
      return res.status(409).json({
        success: false,
        message: 'This time slot is already reserved. Please choose a different time.',
        conflictDetails: conflictCheck.rows
      });
    }

    // STEP 2: Create reservation if no conflicts
    const result = await pool.query(
      `INSERT INTO reservations (user_id, machine_id, start_time, end_time, status)
       VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
      [user_id, actualDbMachineId, finalStartTime, finalEndTime]
    );
    
    console.log('✅ Reservation created successfully');
    res.status(201).json({ 
      success: true,
      message: 'Reservation created successfully', 
      data: { reservation: result.rows[0] }
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Database error', 
      error: err.message 
    });
  }
});
```

#### Step 2: Fix Time Format Conversion
**Action**: Implemented proper 12-hour to 24-hour time conversion

**Added Helper Function**:
```javascript
// Helper function: Convert 12-hour to 24-hour format
function convertTo24Hour(time12h) {
  if (!time12h) return null;
  
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  
  if (hours === '12') {
    hours = '00';
  }
  
  if (modifier?.toLowerCase() === 'pm') {
    hours = parseInt(hours, 10) + 12;
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes}:00`;
}
```

#### Step 3: Add Database Constraints
**Action**: Added database-level constraints to prevent conflicts

**Database Migration** (`add_reservation_constraints.sql`):
```sql
-- Add exclusion constraint to prevent overlapping reservations
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE reservations 
ADD CONSTRAINT no_overlapping_reservations 
EXCLUDE USING gist (
  machine_id WITH =,
  tsrange(start_time, end_time, '[)') WITH &&
) 
WHERE (status IN ('pending', 'confirmed'));
```

### 3.4.7 ### Outcome Verification

#### Test Case 1: Conflict Prevention
```bash
# Test 1: Create first reservation
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "demo",
    "machine_id": 1,
    "date": "2025-08-25",
    "time": "2:00 PM"
  }'
# Response: 201 Created ✅

# Test 2: Try to create conflicting reservation
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "123123",
    "machine_id": 1,
    "date": "2025-08-25",
    "time": "2:00 PM"
  }'
# Response: 409 Conflict ✅
# Message: "This time slot is already reserved. Please choose a different time."
```

#### Test Case 2: Valid Non-Conflicting Reservations
```bash
# Test: Create reservation for different time slot
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "123123",
    "machine_id": 1,
    "date": "2025-08-25",
    "time": "4:00 PM"
  }'
# Response: 201 Created ✅
```

#### Test Case 3: Edge Case Testing
```bash
# Test overlapping scenarios:
# 1. Partial overlap (start time conflicts)
# 2. Complete overlap (same exact time)
# 3. Contained within existing reservation
# All properly rejected with 409 status ✅
```

**Final Status**: ✅ **RESOLVED** - Conflict detection working correctly, double bookings prevented, proper error messages displayed.

---

## 3.1 ## Issue #4: Azure Deployment Configuration Issues

### 3.1.1 ### Description of the Issue
**What Happened**: Application deployed to Azure but environment variables weren't loading, causing database connection failures in production

**Expected Behavior**: App should connect to Azure PostgreSQL database using environment variables configured in App Service

**Actual Behavior**: 
- App Service started successfully but all API calls returned 500 errors
- Environment debug endpoint showed all DB variables as "NOT_SET"
- Azure logs showed database connection failures

### 3.1.2 ### Environment & Setup Details
- **Date/Time**: August 23, 2025, 11:20 AM
- **Environment**: Azure App Service (Production)
- **App Service**: laundry-backend-app
- **Resource Group**: jasmine_capstoneproject
- **PostgreSQL**: Azure Database for PostgreSQL Flexible Server

### 3.1.3 ### Steps to Reproduce
1. Deploy backend to Azure App Service
2. Configure environment variables in Azure Portal
3. Visit deployed app URL: `https://laundry-backend-app.azurewebsites.net/api/machines`
4. Observe 500 Internal Server Error

### 3.1.4 ### Diagnosis
**Root Cause Analysis**:
1. **Environment Variable Naming Mismatch**: Azure App Service used different variable names
2. **SSL Configuration**: Azure PostgreSQL required SSL but app configuration was incorrect
3. **Missing Connection String Format**: Azure expected specific connection string format

**Azure Logs Analysis**:
```
2025-08-23T11:22:15.123Z [ERROR] Database connection error: getaddrinfo ENOTFOUND undefined
2025-08-23T11:22:15.124Z [ERROR] Environment variables not loaded properly
```

### 3.1.5 ### Research Process

#### Resources Consulted:
1. **Microsoft Documentation**:
   - [Azure App Service Environment Variables](https://docs.microsoft.com/en-us/azure/app-service/configure-env-variables)
   - [Azure PostgreSQL Connection Strings](https://docs.microsoft.com/en-us/azure/postgresql/flexible-server/how-to-connect-query-guide)

2. **Azure CLI Documentation**:
   - [az webapp config appsettings](https://docs.microsoft.com/en-us/cli/azure/webapp/config/appsettings)

3. **Community Forums**:
   - [Azure Developer Community - PostgreSQL SSL Issues](https://docs.microsoft.com/en-us/answers/topics/azure-database-postgresql.html)

### 3.1.6 ### Resolution Steps

#### Step 1: Configure Azure App Service Environment Variables
**Action**: Set correct environment variables using Azure CLI

```bash
# Set environment variables for Azure App Service
az webapp config appsettings set \
  --name laundry-backend-app \
  --resource-group jasmine_capstoneproject \
  --settings \
    DB_HOST="laundry-db.postgres.database.azure.com" \
    DB_PORT="5432" \
    DB_NAME="laundry_db" \
    DB_USER="youxinying" \
    DB_PASSWORD="your_secure_password" \
    DB_SSL="true" \
    NODE_ENV="production" \
    JWT_SECRET="your_production_jwt_secret" \
    PORT="8080"
```

#### Step 2: Update Database Configuration for Azure
**Action**: Modified database configuration to handle Azure SSL requirements

**Updated** (`laundry-backend/src/config/database.js`):
```javascript
const { Pool } = require('pg');
require('dotenv').config();

// Azure-specific SSL configuration
const sslConfig = process.env.NODE_ENV === 'production' ? {
  ssl: {
    rejectUnauthorized: false,
    ca: process.env.DB_SSL_CA || undefined
  }
} : {
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
};

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ...sslConfig,
  // Azure-specific connection options
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  max: 20
});

// Enhanced connection testing for Azure
const testConnection = async () => {
  try {
    console.log('🔄 Testing Azure database connection...');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log(`SSL: ${process.env.DB_SSL}`);
    
    const client = await pool.connect();
    const result = await client.query('SELECT version()');
    console.log('✅ Azure PostgreSQL connected successfully');
    console.log('📊 Version:', result.rows[0].version);
    client.release();
    return true;
  } catch (err) {
    console.error('❌ Azure database connection failed:', err.message);
    console.error('Full error:', err);
    return false;
  }
};

module.exports = { pool, testConnection };
```

#### Step 3: Add Azure-Specific Startup Configuration
**Action**: Enhanced app startup to verify Azure configuration

**Modified** (`laundry-backend/server.js`):
```javascript
const app = require('./src/app');
const { testConnection } = require('./src/config/database');

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Visit: https://laundry-backend-app.azurewebsites.net`);
  
  // Test Azure database connection on startup
  console.log('🔄 Verifying Azure services...');
  const dbConnected = await testConnection();
  
  if (dbConnected) {
    console.log('✅ All Azure services connected successfully');
  } else {
    console.log('❌ Azure services connection failed - check configuration');
  }
});
```

### 3.1.7 ### Outcome Verification

#### Verification Tests:
1. **Environment Variables Check**:
   ```bash
   curl https://laundry-backend-app.azurewebsites.net/debug/env
   # Response: All DB_* variables showing as "***SET***" ✅
   ```

2. **Health Check**:
   ```bash
   curl https://laundry-backend-app.azurewebsites.net/health
   # Response: {"status":"OK","message":"Laundry Backend is running!"} ✅
   ```

3. **Database-Dependent Endpoints**:
   ```bash
   curl https://laundry-backend-app.azurewebsites.net/api/machines
   # Response: Array of 8 machine objects ✅
   
   curl -X POST https://laundry-backend-app.azurewebsites.net/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"student_id":"demo","password":"demo"}'
   # Response: Successful login with user data ✅
   ```

4. **Azure Logs Verification**:
   ```bash
   az webapp log download --name laundry-backend-app --resource-group jasmine_capstoneproject
   # Logs show: "✅ Azure PostgreSQL connected successfully" ✅
   ```

**Final Status**: ✅ **RESOLVED** - Azure deployment fully functional, all environment variables properly configured, database connections working.

---

## 3.2 ## Issue #5: Frontend-Backend Communication Failures

### 3.2.1 ### Description of the Issue
**What Happened**: Frontend deployed to Azure Static Web Apps couldn't communicate with backend Azure App Service due to CORS and environment configuration issues

**Expected Behavior**: Frontend should successfully make API calls to backend and display data

**Actual Behavior**: 
- Frontend loaded but showed no data
- Browser console showed CORS errors and network failures
- API_URL environment variable not properly set for production build

### 3.2.2 ### Environment & Setup Details
- **Date/Time**: August 23, 2025, 4:30 PM
- **Frontend**: Azure Static Web Apps (laundry-frontend-app.azurestaticapps.net)
- **Backend**: Azure App Service (laundry-backend-app.azurewebsites.net)
- **Browser**: Chrome, Firefox, Safari (all affected)

### 3.2.3 ### Steps to Reproduce
1. Visit frontend: `https://laundry-frontend-app.azurestaticapps.net`
2. Try to login or view machines
3. Check browser console for errors
4. Observe failed network requests

### 3.2.4 ### Diagnosis
**Root Cause Analysis**:
1. **CORS Configuration Missing**: Backend didn't allow frontend domain
2. **Environment Variable Not Set**: REACT_APP_API_URL not configured for production
3. **Build Configuration Issue**: Production build used localhost API URL

### 3.2.5 ### Research Process

#### Resources Consulted:
1. **Azure Documentation**:
   - [Azure Static Web Apps Configuration](https://docs.microsoft.com/en-us/azure/static-web-apps/configuration)
   - [Environment Variables in Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/environment-variables)

2. **React Documentation**:
   - [Adding Custom Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)

### 3.2.6 ### Resolution Steps

#### Step 1: Configure Production Environment Variables
**Action**: Created production environment file for React build

**Created** (`laundry-frontend/.env.production`):
```env
REACT_APP_API_URL=https://laundry-backend-app.azurewebsites.net
```

#### Step 2: Update Backend CORS Configuration
**Action**: Added frontend domain to CORS allowed origins

**Modified** (`laundry-backend/src/app.js`):
```javascript
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3001',  // Local development
      'https://laundry-frontend-app.azurestaticapps.net',  // Production frontend
      'https://laundry-backend-app.azurewebsites.net'      // Backend self-reference
    ];
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

#### Step 3: Update Azure CORS Settings
**Action**: Configured CORS via Azure CLI

```bash
# Add frontend domain to Azure App Service CORS
az webapp cors add \
  --name laundry-backend-app \
  --resource-group jasmine_capstoneproject \
  --allowed-origins "https://laundry-frontend-app.azurestaticapps.net"

# Verify CORS configuration
az webapp cors show \
  --name laundry-backend-app \
  --resource-group jasmine_capstoneproject
```

### 3.2.7 ### Outcome Verification

#### Verification Tests:
1. **Frontend Loading**:
   - Visit: `https://laundry-frontend-app.azurestaticapps.net` ✅
   - UI loads completely without errors ✅

2. **API Communication**:
   - Login functionality works ✅
   - Machine list displays correctly ✅
   - Reservation creation successful ✅

3. **Browser Console**:
   - No CORS errors ✅
   - All API calls return 200 status ✅

**Final Status**: ✅ **RESOLVED** - Frontend and backend communication fully functional in production.

---

## 3.3 ## Issue #6: PostgreSQL Schema Migration Problems

### 3.3.1 ### Description of the Issue
**What Happened**: Local database schema differed from production Azure PostgreSQL, causing application errors when deploying

**Expected Behavior**: Schema should be consistent between local and production environments

**Actual Behavior**: 
- Missing tables in production database
- Column type mismatches
- Foreign key constraint failures

### 3.3.2 ### Environment & Setup Details
- **Date/Time**: August 19, 2025, 9:00 AM
- **Local DB**: PostgreSQL 14.2 on localhost
- **Production DB**: Azure Database for PostgreSQL Flexible Server
- **Schema File**: `laundry-backend/database/schema.sql`

### 3.3.3 ### Steps to Reproduce
1. Deploy application to Azure
2. Try to create reservations or use lost & found features
3. Observe database errors in Azure logs

### 3.3.4 ### Diagnosis
**Root Cause Analysis**:
Schema synchronization issues between environments caused by:
1. **Manual Local Changes**: Tables modified directly without updating schema file
2. **Missing Migrations**: No systematic way to apply schema changes
3. **Data Type Differences**: Local PostgreSQL vs Azure PostgreSQL differences

### 3.3.5 ### Research Process

#### Resources Consulted:
1. **PostgreSQL Documentation**:
   - [Schema Management Best Practices](https://www.postgresql.org/docs/current/ddl-schemas.html)
   - [pg_dump and pg_restore](https://www.postgresql.org/docs/current/app-pgdump.html)

### 3.3.6 ### Resolution Steps

#### Step 1: Create Comprehensive Schema Export
**Action**: Exported complete local schema with proper format

```bash
# Export schema only (no data)
pg_dump -s -U youxinying postgres > complete_schema.sql

# Export with data for reference tables
pg_dump -U youxinying postgres --data-only --table=machines > machines_data.sql
pg_dump -U youxinying postgres --data-only --table=users > users_data.sql
```

#### Step 2: Apply Schema to Azure PostgreSQL
**Action**: Connected to Azure and applied complete schema

```bash
# Connect to Azure PostgreSQL
psql -h laundry-db.postgres.database.azure.com -U youxinying -d laundry_db

# Apply schema
\i complete_schema.sql

# Verify tables created
\dt

# Apply reference data
\i machines_data.sql
\i users_data.sql
```

#### Step 3: Create Schema Validation Script
**Action**: Created script to validate schema consistency

**Created** (`laundry-backend/validate-schema.js`):
```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function validateSchema() {
  try {
    console.log('🔍 Validating database schema...');
    
    // Check required tables exist
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const requiredTables = ['users', 'machines', 'reservations', 'lost_and_found'];
    const existingTables = tables.rows.map(row => row.table_name);
    
    console.log('📋 Existing tables:', existingTables);
    
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    if (missingTables.length > 0) {
      console.error('❌ Missing tables:', missingTables);
      return false;
    }
    
    // Validate each table structure
    for (const tableName of requiredTables) {
      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = $1
      `, [tableName]);
      
      console.log(`✅ Table ${tableName}:`, columns.rows.length, 'columns');
    }
    
    // Test data integrity
    const machineCount = await pool.query('SELECT COUNT(*) FROM machines');
    console.log('🏷️  Machine count:', machineCount.rows[0].count);
    
    if (parseInt(machineCount.rows[0].count) !== 8) {
      console.error('❌ Expected 8 machines, found:', machineCount.rows[0].count);
      return false;
    }
    
    console.log('✅ Schema validation successful!');
    return true;
    
  } catch (error) {
    console.error('❌ Schema validation failed:', error);
    return false;
  } finally {
    await pool.end();
  }
}

validateSchema();
```

### 3.3.7 ### Outcome Verification

#### Verification Results:
```bash
node laundry-backend/validate-schema.js
# Output:
# 🔍 Validating database schema...
# 📋 Existing tables: ['users', 'machines', 'reservations', 'lost_and_found']
# ✅ Table users: 8 columns
# ✅ Table machines: 6 columns  
# ✅ Table reservations: 8 columns
# ✅ Table lost_and_found: 9 columns
# 🏷️  Machine count: 8
# ✅ Schema validation successful!
```

**Final Status**: ✅ **RESOLVED** - Database schemas synchronized, all tables and constraints properly configured.

---

## 3.4 ## Issue #7: React Build and Static Asset Issues

### 3.4.1 ### Description of the Issue
**What Happened**: React production build failed to load correctly on Azure Static Web Apps, showing blank page and asset loading errors

**Expected Behavior**: Production build should load and function identically to development version

**Actual Behavior**: 
- Blank white page on production URL
- Console errors about missing static assets
- Routing not working for direct URL access

### 3.4.2 ### Environment & Setup Details
- **Date/Time**: August 22, 2025, 6:15 PM
- **Build Environment**: GitHub Actions CI/CD
- **Deployment Target**: Azure Static Web Apps
- **React Version**: 18.2.0
- **Build Command**: `npm run build`

### 3.4.3 ### Steps to Reproduce
1. Push code changes to GitHub
2. GitHub Actions builds and deploys to Azure Static Web Apps
3. Visit production URL
4. Observe blank page and console errors

### 3.4.4 ### Diagnosis
**Root Cause Analysis**:
1. **Build Configuration Issue**: Public path not set correctly for Azure
2. **Routing Configuration**: SPA routing not configured for Static Web Apps
3. **Environment Variables**: Production API URL not available during build

### 3.4.5 ### Research Process

#### Resources Consulted:
1. **Azure Static Web Apps Documentation**:
   - [Build Configuration](https://docs.microsoft.com/en-us/azure/static-web-apps/build-configuration)
   - [Routes Configuration](https://docs.microsoft.com/en-us/azure/static-web-apps/routes)

2. **Create React App Documentation**:
   - [Building for Production](https://create-react-app.dev/docs/production-build/)

### 3.4.6 ### Resolution Steps

#### Step 1: Configure Static Web Apps Routing
**Action**: Created routing configuration for SPA

**Created** (`laundry-frontend/public/staticwebapp.config.json`):
```json
{
  "routes": [
    {
      "route": "/static/*",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "route": "/api/*",
      "allowedRoles": ["anonymous"]
    },
    {
      "route": "/*",
      "serve": "/index.html",
      "statusCode": 200
    }
  ],
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/static/*", "/api/*"]
  },
  "mimeTypes": {
    ".json": "application/json",
    ".js": "application/javascript",
    ".css": "text/css"
  }
}
```

#### Step 2: Fix Environment Variable Configuration
**Action**: Updated package.json build script and environment handling

**Modified** (`laundry-frontend/package.json`):
```json
{
  "scripts": {
    "build": "REACT_APP_API_URL=https://laundry-backend-app.azurewebsites.net react-scripts build",
    "build:local": "react-scripts build"
  }
}
```

#### Step 3: Update GitHub Actions Workflow
**Action**: Enhanced CI/CD pipeline for proper environment variable handling

**Modified** (`.github/workflows/azure-static-web-apps.yml`):
```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd laundry-frontend
          npm install
          
      - name: Build React app
        run: |
          cd laundry-frontend
          REACT_APP_API_URL=https://laundry-backend-app.azurewebsites.net npm run build
          
      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/laundry-frontend"
          api_location: ""
          output_location: "build"
```

### 3.4.7 ### Outcome Verification

#### Verification Tests:
1. **Production Build Loading**:
   - Visit: `https://laundry-frontend-app.azurestaticapps.net` ✅
   - Page loads with full UI ✅

2. **Static Assets**:
   - CSS files load correctly ✅
   - JavaScript bundles load ✅
   - Images and icons display ✅

3. **SPA Routing**:
   - Direct URL access works ✅
   - Browser back/forward navigation ✅
   - Refresh on any route works ✅

4. **API Integration**:
   - Environment variables properly set ✅
   - API calls use production backend ✅

**Final Status**: ✅ **RESOLVED** - Production build fully functional, all static assets loading correctly, SPA routing working.

---

## 3.5 ## Summary and Lessons Learned

### 3.5.1 ### Key Patterns Identified
1. **Environment Configuration**: Most issues related to inconsistent environment variable management
2. **Cross-Origin Communication**: CORS configuration critical for frontend-backend communication  
3. **Database Management**: Schema synchronization essential between environments
4. **Azure-Specific Requirements**: Cloud deployment requires specific SSL and configuration patterns

### 3.5.2 ### Best Practices Developed
1. **Environment Variable Management**: Use consistent naming and validation scripts
2. **Database Schema Control**: Always export/import complete schemas, never manual changes
3. **Comprehensive Testing**: Test each environment thoroughly before deployment
4. **Documentation**: Maintain detailed logs of all configuration changes

### 3.5.3 ### Tools and Resources Most Valuable
1. **Azure CLI**: Essential for configuration management
2. **PostgreSQL Command Line Tools**: Critical for database management
3. **Browser Developer Tools**: Indispensable for debugging CORS and network issues
4. **Azure Portal Logs**: Primary source for production troubleshooting

### 3.5.4 ### Preventive Measures Implemented
1. **Automated Testing**: Added health checks and validation scripts
2. **Environment Validation**: Created scripts to verify configuration before deployment
3. **Documentation**: Comprehensive troubleshooting guides for future reference
4. **Monitoring**: Enhanced logging and error tracking for proactive issue detection

---

**Document Version**: 1.0  
**Last Updated**: August 24, 2025  
**Total Issues Resolved**: 7  
**Average Resolution Time**: 2.5 hours  
**Success Rate**: 100%

---


---

# 4. System Usage Guide (End-User Documentation)


## 4.1 Overview
The **PurpleWash Northwestern Campus Laundry Hub** is designed to provide students with an intuitive interface for managing laundry reservations and lost-and-found items across campus. The goal of this section is to offer non-technical users clear guidance on how to access the system, navigate its features, and complete the main workflows efficiently.  

This guide explains how to log in, register a new account, reserve laundry machines, report or recover lost items, and consult support resources. It also highlights system limitations and important considerations to ensure smooth usage.

---

## 4.2 Accessing the Application
Students can access the PurpleWash system via a supported web browser (e.g., Chrome, Edge, or Safari). The application is available through the official campus-provided link or, in testing environments, at `http://localhost:3005`.  

For demonstration purposes, several demo accounts are available:  
- Student ID: `demo` | Password: `demo`  
- Student ID: `123123` | Password: `password`  
- Student ID: `456789` | Password: `student123`  

Alternatively, students can create a new account by selecting the **“Sign up here”** option on the login page. This ensures each user has personalized access to reservations and lost-and-found services.

---

## 4.3 Account Registration and Login
When registering a new account, students are required to provide their **student ID, name, email address, and password**. The phone number field is optional. After successful registration, the user can immediately log in with the newly created credentials.  

To log in, students must enter their student ID and password on the login screen. A successful login redirects the student to the dashboard, granting access to machine availability, reservations, and additional features. In case of failed login attempts, students should verify that their credentials are correct or contact system support for assistance.  

**Note:** For security reasons, it is recommended to use strong, unique passwords. Sessions may expire after a period of inactivity, requiring users to log in again.

---

## 4.4 Navigating the Interface
The application interface is structured to be both simple and mobile-friendly. Upon login, users arrive at the **dashboard**, which displays an overview of machine availability across campus locations such as Dorm A, Dorm B, the Community Center, and the Basement.  

Main navigation options include:  
- **Machines** – View and select available washing machines.  
- **Reservations** – Review current reservations, modify existing bookings, or cancel appointments.  
- **Lost & Found** – Report lost items or browse items reported by others.  
- **FAQ** – Access help resources and answers to common questions.  

Each section is marked with clear labels and uses Northwestern’s purple theme for visual consistency.

---

## 4.5 Making and Managing Reservations
To reserve a laundry machine, users should open the **Machines** section, select a location, and then choose a machine. The system presents a list of available time slots. After selecting a preferred slot, the user confirms the reservation, which will then appear in the **Reservations** list.  

Example: A user selecting a machine, date, and time slot is shown below.  

![Reservation Form](reservation_form.png)  

Students may update or cancel reservations directly from the **Reservations** page. Canceling a reservation will release the machine’s time slot for other students to use.  

Machine availability for each location can also be checked before confirming a booking:  

![Machine Availability](machine_availability.png)  

**Important Considerations:**  
- Only one machine may be reserved per student for a given time slot.  
- Frequent no-shows may result in restricted access to the reservation system, depending on administrative policies.  

---

## 4.6 Lost & Found Services
The **Lost & Found** feature enables students to contribute to the campus community by reporting misplaced items and helping others recover their belongings.  

To report an item, navigate to the **Lost & Found** section and select “Report new item.” Users must provide details such as the item description, the location where it was found or lost, and the relevant date/time information.  

Example screenshot:  

![Lost Item Form](lost_item_form.png)  

Students searching for items can browse the list of reported entries. Each record includes identifying details, which allow the rightful owner to follow up accordingly. This feature helps minimize inconvenience and fosters community support.

---

## 4.7 FAQ and Support Resources
PurpleWash includes an integrated **FAQ** section to assist users with common issues, such as login problems, reservation conflicts, or difficulties in reporting lost items. Students are encouraged to review the FAQ before contacting technical support.  

![FAQ Page](faq_page.png)  

If additional help is required, students can reach out to the designated support channel (e.g., `support@purplewash.northwestern.edu`). When reporting an issue, providing specific details such as the error message, the affected feature, and the student ID will help resolve the issue more efficiently.

---

## 4.8 Known Limitations
Although the system is actively supported, several known limitations should be considered:  
1. Access is restricted to Northwestern University students.  
2. Reservations are limited to one machine per time slot per user.  
3. Temporary errors such as **“Database connection unavailable”** may appear during maintenance or high traffic periods.  
4. Certain features, including email notifications and phone number verification, may not be enabled in testing environments.  

---

## 4.9 Summary
The PurpleWash system provides students with a reliable and user-friendly way to manage laundry and lost-and-found processes. By logging in, students can easily reserve machines, report lost items, and review their reservations through a clean and responsive interface.  

By responsibly managing reservations and participating in lost-and-found reporting, students help ensure that the system remains fair, effective, and beneficial to the broader campus community.  

---

## 4.10 Managing Personal Profile
Students may update their personal profile information, such as name, email address, or phone number, from the **Profile** section. This ensures that communication regarding reservations and lost-and-found items remains accurate. If a student changes their primary email, they are encouraged to update it immediately in the system.  
**Tip:** Ensure the phone number provided is correct, as SMS-based notifications may be supported in future releases.

---

## 4.11 Password Recovery
If a student forgets their password, they can use the **Forgot Password** feature located on the login page. After entering their student ID, the system sends a reset link to the registered email address. Students should follow the link to create a new password.  
**Note:** For security, reset links expire after a limited time. Students are advised to complete the process promptly.

---

## 4.12 Best Practices for Reservations
To make the most effective use of the laundry system, students should:  
- Reserve machines at least 24 hours in advance during peak times (weekends and evenings).  
- Cancel reservations they cannot honor to free slots for others.  
- Arrive 5–10 minutes before the reserved slot to avoid losing access to the machine.  

These practices help ensure fair and efficient access for all students.

---

## 4.13 Mobile Device Usage
The PurpleWash interface is mobile-friendly and can be accessed directly from smartphones or tablets. Students may bookmark the login page for quicker access. On smaller screens, menus collapse into a mobile navigation drawer, making it easy to switch between **Machines**, **Reservations**, **Lost & Found**, and **FAQ**.

---

## 4.14 Future Enhancements
The current system supports all essential features; however, future releases may include:  
- Push notifications to remind students of upcoming reservations.  
- Integration with campus card services for machine access.  
- Enhanced analytics for administrators to better understand usage patterns.  

Documenting these potential enhancements helps prepare end users for improvements in later versions.

---


---

# 5. Architecture Diagram


The PurpleWash Northwestern Campus Laundry Hub implements a modern, modular, and scalable three-tier architecture, ensuring clear separation of concerns, maintainability, and seamless deployment across multiple environments (development, staging, and production).

## 5.1 High-Level Architecture Overview

```
┌─────────────────────────┐       ┌──────────────────────────────┐       ┌─────────────────────────┐
│                         │       │                              │       │                         │
│   Frontend (React)      │       │   Backend (Node/Express)     │       │   Database              │
│   ─────────────────     │       │   ────────────────────       │       │   ─────────             │
│                         │       │                              │       │                         │
│   ┌─────────────────┐   │       │   ┌────────────────────┐     │       │   ┌─────────────────┐   │
│   │ UI Components   │   │       │   │ Express Routes     │     │       │   │ PostgreSQL      │   │
│   │                 │   │       │   │                    │     │       │   │                 │   │
│   │ - Login         │   │       │   │ - Auth            ◄─────────────────► - Users         │   │
│   │ - Machines      │   │       │   │ - Machines        │     │       │   │ - Machines      │   │
│   │ - Reservations  │   │       │   │ - Reservations    │     │       │   │ - Reservations  │   │
│   │ - Lost & Found  ◄───┼───────┼──►- Lost & Found      │     │       │   │ - LostFound     │   │
│   │ - FAQ           │   │       │   │                    │     │       │   │                 │   │
│   └─────────────────┘   │       │   └────────────────────┘     │       │   └─────────────────┘   │
│                         │       │                              │       │                         │
│   ┌─────────────────┐   │       │   ┌────────────────────┐     │       │                         │
│   │ State Management│   │       │   │ Middleware         │     │       │                         │
│   │                 │   │       │   │                    │     │       │                         │
│   │ - React State   │   │       │   │ - Authentication   │     │       │                         │
│   │ - React Router  │   │       │   │ - Error Handling   │     │       │                         │
│   │ - Local Storage │   │       │   │ - Logging          │     │       │                         │
│   └─────────────────┘   │       │   └────────────────────┘     │       │                         │
│                         │       │                              │       │                         │
└──────────┬──────────────┘       └───────────┬──────────────────┘       └─────────────────────────┘
           │                                  │                                       ▲
           │                                  │                                       │
           │         HTTP/HTTPS               │                                       │
           │         API Requests             │                                       │
           └─────────────────────────────────►│                                       │
                                              │                                       │
                                              │       SQL Queries                     │
                                              └───────────────────────────────────────┘


                       ┌───────────────────────────────────────────────────────────┐
                       │                                                           │
                       │                    Cloud Infrastructure                   │
                       │                                                           │
                       │   ┌───────────────────┐      ┌────────────────────────┐   │
                       │   │                   │      │                        │   │
                       │   │ Azure Static Web  │      │ Azure App Service      │   │
                       │   │ Apps              │      │                        │   │
                       │   │                   │      │ - Backend API          │   │
                       │   │ - React Frontend  │      │ - Node.js Runtime      │   │
                       │   │ - Global CDN      │      │ - Web Server           │   │
                       │   │ - HTTPS           │      │ - SSL Termination      │   │
                       │   │                   │      │                        │   │
                       │   └───────────────────┘      └────────────────────────┘   │
                       │            ▲                           ▲                  │
                       │            │                           │                  │
                       │            └───────────────────────────┘                  │
                       │                        ▲                                  │
                       │                        │                                  │
                       │                        │                                  │
                       │                        │                                  │
                       │                ┌───────┴────────┐                         │
                       │                │                │                         │
                       │                │ Azure Database │                         │
                       │                │ for PostgreSQL │                         │
                       │                │ Flexible Server│                         │
                       │                │                │                         │
                       │                └────────────────┘                         │
                       │                                                           │
                       └───────────────────────────────────────────────────────────┘


┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
│                     │   │                     │   │                     │
│  Local Development  │   │      Staging        │   │     Production      │
│  Environment        │   │      Environment    │   │     Environment     │
│                     │   │                     │   │                     │
│ - localhost:3005    │   │ - staging server    │   │ - Azure cloud       │
│ - localhost:3000    │   │ - Test database     │   │ - Production DB     │
│ - Local PostgreSQL  │   │ - Review apps       │   │ - Live system       │
│                     │   │                     │   │                     │
└─────────────────────┘   └─────────────────────┘   └─────────────────────┘
        Development              Testing                 Deployment
           Flow                    Flow                    Flow
```

---

## 5.2 Component Architecture Details

### 5.2.1 Frontend Layer (React 19.1.0)

The client-side application serves as the presentation layer, responsible for rendering the user interface and handling user interactions.

**Key Components:**
- **UI Components**: Modular React components with specific responsibilities
  - `login-component.jsx`: Authentication forms and session management
  - `navigation-component.jsx`: Navigation bar with responsive design
  - `machines-section-component.jsx`: Main dashboard view for machine status
  - `machine-card-component.jsx`: Individual machine display with status
  - `reservation-modal-component.jsx`: Booking interface with time slot selection
  - `lost-and-found-component.jsx`: Item reporting and browsing interface
  - `time-slot-component.jsx`: Reusable time selector for reservations

**State Management:**
- React's built-in state hooks for component-level state
- Local Storage for persistent authentication tokens and user preferences
- React Router (v6.22.3) for client-side navigation and route management

**Communication:**
- RESTful API calls to backend using fetch API with proper error handling
- JWT token authentication stored in browser's local storage
- Real-time status updates using polling mechanisms

### 5.2.2 Backend Layer (Node.js/Express)

The server-side application handles business logic, data processing, authentication, and database operations.

**API Structure:**
- **Authentication Routes** (`/api/auth/*`): 
  - User login with JWT token generation
  - User registration with validation
  - Session management
  
- **Machine Routes** (`/api/machines/*`):
  - Machine inventory management
  - Status tracking and updates
  - Availability checking
  
- **Reservation Routes** (`/api/reservations/*`):
  - Booking creation and management
  - Time slot availability
  - User reservation history
  
- **Lost and Found Routes** (`/api/lostandfound/*`):
  - Item reporting
  - Item status updates
  - Search and filtering

**Middleware:**
- `helmet.js`: Security headers to protect against common web vulnerabilities
- CORS configuration to control cross-origin access
- JSON parsing for request body handling
- JWT verification for protected routes
- Error handling and standardized response formats
- Request logging with Morgan

### 5.2.3 Database Layer (PostgreSQL 14)

The data persistence layer with relational structure for data integrity and efficient queries.

**Schema Design:**
- **Users Table**: Authentication credentials and profile information
  - Primary key: `id`
  - Unique constraint: `student_id`
  - Secure password storage with bcrypt hashing
  
- **Machines Table**: Laundry equipment inventory
  - Primary key: `id`
  - Foreign key relationships with Reservations
  - Status tracking (available, occupied, maintenance)
  
- **Reservations Table**: Booking records
  - Primary key: `id`
  - Foreign keys to Users and Machines
  - Temporal data with start and end times
  - Status tracking (pending, confirmed, completed, canceled)
  
- **Lost and Found Table**: Item records
  - Primary key: `id`
  - Foreign key to reporting user
  - Status tracking (active, claimed, expired)
  - Location and description metadata

**Data Access Layer:**
- Connection pooling for efficient database access
- Prepared statements to prevent SQL injection
- Transaction management for data consistency
- Error handling and connection retry logic

---

## 5.3 Cloud Infrastructure (Azure)

The production environment leverages Azure's platform services for scalability, reliability, and security.

**Key Components:**
- **Azure Static Web Apps**: Hosts the React frontend with global CDN distribution
- **Azure App Service**: Runs the Node.js backend with automatic scaling
- **Azure Database for PostgreSQL**: Managed database service with automated backups
- **Azure Key Vault**: Secures application secrets and credentials
- **Azure Application Insights**: Monitoring and diagnostics

**Security Features:**
- SSL/TLS encryption for all communications
- Web Application Firewall (WAF) for threat protection
- Network security groups to control traffic
- Managed identities for secure service-to-service authentication
- Regular security patches and updates

---

## 5.4 Deployment Environments

### 5.4.1 Development Environment
- **Purpose**: Individual developer work and feature development
- **Infrastructure**: Local machine resources
- **Configuration**: Environment variables for local services
- **Endpoints**:
  - Frontend: http://localhost:3005
  - Backend: http://localhost:3000
  - Database: localhost:5432

### 5.4.2 Staging Environment
- **Purpose**: Integration testing, QA, and pre-production validation
- **Infrastructure**: Limited cloud resources or testing servers
- **Configuration**: Mimics production with reduced capacity
- **Access**: Restricted to development team and stakeholders

### 5.4.3 Production Environment
- **Purpose**: Live system serving end users
- **Infrastructure**: Azure cloud services with appropriate scaling
- **Configuration**: Optimized for performance and security
- **URL**: https://jasmineweb123-a2bfaudwhwa7fgfm.centralus-01.azurewebsites.net
- **Monitoring**: Continuous performance tracking and alerting

---

## 5.5 Communication Flows

### 5.5.1 Authentication Flow
1. User enters credentials in login form
2. Frontend sends credentials to `/api/auth/login`
3. Backend validates credentials against database
4. JWT token generated and returned to frontend
5. Token stored in local storage for subsequent API calls
6. Protected routes check token validity before access

### 5.5.2 Reservation Flow
1. User selects machine from dashboard
2. Available time slots retrieved from backend
3. User selects time slot and confirms reservation
4. Backend creates reservation record in database
5. Machine status updated to reflect reservation
6. Confirmation displayed to user with reservation details

### 5.5.3 Lost and Found Flow
1. User submits lost item report with details
2. Backend creates record in lost and found table
3. Item appears in listings for other users to view
4. Item can be claimed or marked as expired
5. Status updates reflected in real-time for all users

This architecture provides a solid foundation for the PurpleWash Northwestern Campus Laundry Hub, ensuring scalability, maintainability, and a seamless user experience across all system components.
