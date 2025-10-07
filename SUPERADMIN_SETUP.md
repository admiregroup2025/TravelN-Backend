# Superadmin Hierarchy & User Management API Documentation

## Overview
This system implements a comprehensive hierarchical user management system with three roles:
- **USER**: Basic user with limited permissions
- **ADMIN**: Can manage users and content
- **SUPERADMIN**: Complete system control, can manage admins

## Role Hierarchy & Permissions

### Role Hierarchy (Higher number = Higher authority)
1. **USER** (Level 1)
2. **ADMIN** (Level 2) 
3. **SUPERADMIN** (Level 3)

### Permission Matrix
| Permission            | USER | ADMIN | SUPERADMIN |
|------------           |------|-------|------------|
| Read own profile      | ✅ | ✅     | ✅ |
| Update own profile    | ✅ | ✅     | ✅ |
| Change own password   | ✅ | ✅     | ✅ |
| View public content   | ✅ | ✅     | ✅ |
| Manage users          | ❌ | ✅     | ✅ |
| Create users          | ❌ | ✅     | ✅ |
| Update users          | ❌ | ✅     | ✅ |
| Delete users          | ❌ | ✅     | ✅ |
| Toggle user status    | ❌ | ✅     | ✅ |
| Change user passwords | ❌ | ✅     | ✅ |
| Create admins         | ❌ | ❌     | ✅ |
| Manage admins         | ❌ | ❌     | ✅ |
| System settings       | ❌ | ❌     | ✅ |
| Audit logs            | ❌ | ❌     | ✅ |

## API Endpoints

### Authentication Routes (`/api/auth`)

#### 1. Create Initial Superadmin
```http
POST /api/auth/seed-superadmin
```
**Description**: One-time setup to create the first superadmin (only works if no superadmin exists)

**Request Body**:
```json
{
  "name": "Super Admin",
  "email": "admin@example.com",
  "password": "securepassword123"
}
```

**Response**:
```json
{
  "message": "Super Admin created successfully",
  "email": "admin@example.com",
  "token": "jwt_token_here"
}
```

#### 2. Login
```http
POST /api/auth/login
```

#### 3. Register (Admin/Superadmin only)
```http
POST /api/auth/register
Authorization: Bearer <token>
```

### User Management Routes (`/api/users`)

#### 1. Get All Users (Admin/Superadmin only)
```http
GET /api/users?page=1&limit=10&role=admin&search=john
Authorization: Bearer <token>
```

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `role`: Filter by role (user/admin/superadmin)
- `search`: Search by name or email

#### 2. Get User by ID (Admin/Superadmin only)
```http
GET /api/users/:userId
Authorization: Bearer <token>
```

#### 3. Create User (Admin/Superadmin only)
```http
POST /api/users
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone_no": "+1234567890",
  "role": "user"
}
```

**Role Assignment Rules**:
- ADMIN can create: USER
- SUPERADMIN can create: USER, ADMIN

#### 4. Update User (Admin/Superadmin only)
```http
PUT /api/users/:userId
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "name": "Updated Name",
  "phone_no": "+1234567890",
  "role": "admin",
  "isActive": true
}
```

#### 5. Delete User (Admin/Superadmin only)
```http
DELETE /api/users/:userId
Authorization: Bearer <token>
```

**Protection Rules**:
- Cannot delete users with equal or higher role
- Cannot delete self
- Cannot delete last superadmin

#### 6. Change User Password (Admin/Superadmin only)
```http
PATCH /api/users/:userId/password
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "newPassword": "newpassword123"
}
```

#### 7. Toggle User Status (Admin/Superadmin only)
```http
PATCH /api/users/:userId/status
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "isActive": false
}
```

#### 8. Get User Statistics (Admin/Superadmin only)
```http
GET /api/users/stats
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalActive": 145,
    "byRole": {
      "user": {
        "total": 140,
        "active": 135,
        "inactive": 5
      },
      "admin": {
        "total": 9,
        "active": 9,
        "inactive": 0
      },
      "superadmin": {
        "total": 1,
        "active": 1,
        "inactive": 0
      }
    }
  }
}
```

### Superadmin-Only Routes

#### 1. Create Admin User (Superadmin only)
```http
POST /api/users/admin
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "adminpassword123",
  "phone_no": "+1234567890"
}
```

### User Profile Routes

#### 1. Get My Profile
```http
GET /api/users/profile/me
Authorization: Bearer <token>
```

#### 2. Update My Profile
```http
PUT /api/users/profile/me
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "name": "Updated Name",
  "phone_no": "+1234567890"
}
```

#### 3. Change My Password
```http
PATCH /api/users/profile/password
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

## Security Features

### 1. Role-Based Access Control
- Hierarchical permission system
- Users can only manage users with lower roles
- Role assignment restrictions

### 2. Superadmin Protection
- Cannot delete the last superadmin
- Cannot deactivate superadmin accounts
- Superadmin creation is one-time only (if no superadmin exists)

### 3. Self-Protection
- Users cannot delete their own accounts
- Users cannot deactivate their own accounts

### 4. Audit Logging
- Role changes are logged
- All administrative actions are tracked

## Setup Instructions

### 1. Initial Setup
```bash
# Create the first superadmin
curl -X POST http://localhost:3000/api/auth/seed-superadmin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Super Admin",
    "email": "admin@example.com",
    "password": "securepassword123"
  }'
```

### 2. Login as Superadmin
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "securepassword123"
  }'
```

### 3. Create Admin Users
```bash
curl -X POST http://localhost:3000/api/users/admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <superadmin_token>" \
  -d '{
    "name": "Admin User",
    "email": "admin2@example.com",
    "password": "adminpassword123"
  }'
```

### 4. Create Regular Users
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "name": "Regular User",
    "email": "user@example.com",
    "password": "userpassword123",
    "role": "user"
  }'
```

## Error Handling

### Common Error Responses

#### 403 Forbidden
```json
{
  "success": false,
  "message": "Cannot assign SUPERADMIN role"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

#### 400 Bad Request
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

## Best Practices

1. **Always use HTTPS in production**
2. **Implement rate limiting on authentication endpoints**
3. **Use strong password policies**
4. **Regular security audits**
5. **Monitor audit logs**
6. **Implement session management**
7. **Use environment variables for sensitive data**

## Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  passwordHash: String (required),
  role: String (enum: ['user', 'admin', 'superadmin']),
  phone_no: String (optional),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

This comprehensive system provides complete control over user management with proper security measures and hierarchical permissions.

