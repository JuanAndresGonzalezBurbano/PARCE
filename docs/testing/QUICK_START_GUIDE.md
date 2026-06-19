# P.A.R.C.E Backend Quick Start Guide

## Prerequisites
- ✅ XAMPP installed with MySQL/MariaDB
- ✅ PHP 8.2+ with Argon2id support
- ✅ Composer dependencies installed

---

## 1. Database Setup

### Start MySQL Server
1. Open XAMPP Control Panel
2. Start MySQL service

### Run Migrations
```bash
php migrate.php migrate
```

### Seed Database
```bash
php database/seed.php
```

---

## 2. Start Development Server

```bash
php -S localhost:8000 -t public public/router.php
```

Server will be available at: `http://localhost:8000`

---

## 3. Test Credentials

### Admin Users
| Email | Password | Role |
|-------|----------|------|
| superadmin@parce.local | SuperAdmin123! | Super Administrator |
| admin@parce.local | Admin123! | Administrator |

### Demo Users
| Email | Password | Role |
|-------|----------|------|
| customer@parce.local | Customer123! | Customer |
| mechanic@parce.local | Mechanic123! | Mechanic |

---

## 4. API Endpoints

### Public Endpoints
```bash
# Health Check
GET http://localhost:8000/api/health

# Register
POST http://localhost:8000/api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!",
  "password_confirmation": "Password123!",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890"
}

# Login
POST http://localhost:8000/api/auth/login
Content-Type: application/json

{
  "email": "customer@parce.local",
  "password": "Customer123!"
}
```

### Protected Endpoints (Require Authentication)
```bash
# Get Current User
GET http://localhost:8000/api/auth/me
Cookie: parce_session=<session_id>

# Logout
POST http://localhost:8000/api/auth/logout
Cookie: parce_session=<session_id>
```

---

## 5. Run Tests

### Integration Tests
```bash
php test_auth_integration.php
```
**Expected:** 32/32 tests passing

### Database Integrity Tests
```bash
php test_database_integrity.php
```
**Expected:** All integrity checks passing

---

## 6. Database Management

### Check Migration Status
```bash
php migrate.php status
```

### Rollback Last Migration
```bash
php migrate.php rollback
```

### Reset Database (⚠️ Deletes all data)
```bash
php migrate.php reset
```

---

## 7. Common Tasks

### View Database Tables
```bash
c:\xampp\mysql\bin\mysql.exe -u root parce -e "SHOW TABLES;"
```

### View Users
```bash
c:\xampp\mysql\bin\mysql.exe -u root parce -e "SELECT id, email, account_status FROM users;"
```

### View User Roles
```bash
c:\xampp\mysql\bin\mysql.exe -u root parce -e "
SELECT u.email, r.name as role 
FROM users u 
JOIN user_roles ur ON u.id = ur.user_id 
JOIN roles r ON ur.role_id = r.id 
WHERE ur.is_active = TRUE;"
```

### View Active Sessions
```bash
c:\xampp\mysql\bin\mysql.exe -u root parce -e "
SELECT s.id, u.email, s.ip_address, FROM_UNIXTIME(s.last_activity) as last_activity 
FROM sessions s 
JOIN users u ON s.user_id = u.id;"
```

---

## 8. Troubleshooting

### Database Connection Failed
1. Verify MySQL is running in XAMPP
2. Check `.env` file database credentials
3. Verify database exists: `SHOW DATABASES LIKE 'parce';`

### Session Not Persisting
1. Check cookie is being set in response headers
2. Verify session exists in database
3. Check cookie name is `parce_session`

### 401 Unauthorized on Protected Routes
1. Verify you're sending the session cookie
2. Check session hasn't expired (2 hour lifetime)
3. Verify user hasn't been deleted

### Tests Failing
1. Ensure development server is running
2. Check database is seeded
3. Verify no port conflicts on 8000

---

## 9. Project Structure

```
PARCE/
├── app/
│   ├── Controllers/Auth/
│   │   └── AuthController.php          # Authentication endpoints
│   ├── Core/
│   │   ├── Database.php                # Database connection
│   │   ├── Migration.php               # Migration base class
│   │   ├── Seeder.php                  # Seeder base class
│   │   └── ...
│   ├── Infrastructure/
│   │   ├── Auth/Services/
│   │   │   ├── AuthService.php         # Authentication logic
│   │   │   ├── PasswordHasher.php      # Password hashing
│   │   │   ├── SessionManager.php      # Session management
│   │   │   └── RoleValidator.php       # RBAC validation
│   │   └── Http/
│   │       ├── RequestValidator.php    # Input validation
│   │       ├── ResponseFormatter.php   # Response formatting
│   │       ├── RateLimiter.php         # Rate limiting
│   │       └── ErrorHandler.php        # Error handling
│   └── Middleware/
│       ├── AuthMiddleware.php          # Authentication middleware
│       ├── RBACMiddleware.php          # Authorization middleware
│       └── RequestLoggerMiddleware.php # Request logging
├── database/
│   ├── migrations/                     # Database migrations
│   └── seeders/                        # Database seeders
├── config/
│   └── routes.php                      # Route definitions
├── public/
│   ├── index.php                       # Application entry point
│   └── router.php                      # Development router
├── .env                                # Environment configuration
├── migrate.php                         # Migration CLI
├── test_auth_integration.php           # Integration tests
└── test_database_integrity.php         # Database tests
```

---

## 10. Configuration

### Environment Variables (.env)
```env
# Application
APP_NAME="P.A.R.C.E"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=parce
DB_USERNAME=root
DB_PASSWORD=

# Session
SESSION_LIFETIME=120
SESSION_DRIVER=database
```

### Production Configuration
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com
DB_PASSWORD=<strong-password>
```

---

## 11. Next Steps

### For Development
1. ✅ Backend is ready
2. ⏭️ Implement CORS middleware
3. ⏭️ Start frontend development
4. ⏭️ Integrate frontend with API

### For Production
1. ⏭️ Set production environment variables
2. ⏭️ Configure HTTPS
3. ⏭️ Set strong database password
4. ⏭️ Implement CORS with allowed origins
5. ⏭️ Add monitoring and logging
6. ⏭️ Set up CI/CD pipeline

---

## 12. Support

### Documentation
- See `BACKEND_VALIDATION_REPORT.md` for detailed validation results
- Check inline code comments for implementation details

### Common Issues
- **Port 8000 in use:** Change port in server command
- **Database errors:** Check MySQL is running and credentials are correct
- **Session issues:** Clear browser cookies and try again

---

**Last Updated:** 2026-05-30  
**Version:** 1.0.0  
**Status:** Production Ready (with minor configuration needed)
