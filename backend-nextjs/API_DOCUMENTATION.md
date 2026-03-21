# EDVO Backend API Documentation

Comprehensive API documentation for the EDVO Learning Platform backend.

## Base URL

```
Development: http://localhost:3001/api/v1
Production: https://api.edvo.com/api/v1
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "student",
  "mobile": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "64abc123...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

### Refresh Token
```http
POST /api/v1/auth/refresh
Authorization: Bearer <token>
```

---

## 📚 Courses Endpoints

### Get All Courses
```http
GET /api/v1/courses?page=1&limit=10&category=Programming&level=beginner&search=python
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10, max: 100) |
| category | string | Filter by category |
| level | string | Filter by level (beginner/intermediate/advanced) |
| minPrice | number | Minimum price filter |
| maxPrice | number | Maximum price filter |
| minRating | number | Minimum rating filter |
| search | string | Search in title, description, tags |
| sort | string | Sort field (default: createdAt) |
| order | string | Sort order (asc/desc) |

### Get Course by ID
```http
GET /api/v1/courses/:id
```

### Create Course (Instructor/Admin)
```http
POST /api/v1/courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Complete Python Bootcamp",
  "description": "Learn Python from scratch...",
  "category": "Programming",
  "level": "beginner",
  "price": 4999,
  "tags": ["python", "programming"],
  "requirements": ["No experience needed"],
  "whatYouWillLearn": ["Python fundamentals", ...]
}
```

### Update Course (Instructor/Admin)
```http
PUT /api/v1/courses/:id
Authorization: Bearer <token>
```

### Delete Course (Instructor/Admin)
```http
DELETE /api/v1/courses/:id
Authorization: Bearer <token>
```

### Search Courses
```http
GET /api/v1/courses/search?q=python&page=1&limit=10
```

### Get Popular Courses
```http
GET /api/v1/courses/popular?limit=10
```

### Get Courses by Category
```http
GET /api/v1/courses/category/:category
```

### Enroll in Course
```http
POST /api/v1/courses/:id/enroll
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentMethod": "card"
}
```

### Add Course Review
```http
POST /api/v1/courses/:id/review
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "comment": "Excellent course!"
}
```

### Get/Update Course Progress
```http
GET /api/v1/courses/:id/progress
Authorization: Bearer <token>

PUT /api/v1/courses/:id/progress
Authorization: Bearer <token>
Content-Type: application/json

{
  "lectureId": "lecture123",
  "completed": true,
  "progress": 45
}
```

---

## 👥 Users Endpoints

### Get Current User
```http
GET /api/v1/users/me
Authorization: Bearer <token>
```

### Get User by ID
```http
GET /api/v1/users/:id
Authorization: Bearer <token>
```

### Update User Profile
```http
PUT /api/v1/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "bio": "Software developer",
  "headline": "Full Stack Developer",
  "skills": ["JavaScript", "Python", "React"]
}
```

### Get All Users (Admin)
```http
GET /api/v1/users?page=1&limit=10&search=john
Authorization: Bearer <token>
```

---

## 📝 Exams Endpoints

### Get All Exams
```http
GET /api/v1/exams?page=1&limit=10&category=Programming
```

### Get Exam by ID
```http
GET /api/v1/exams/:id
```

### Create Exam (Instructor/Admin)
```http
POST /api/v1/exams
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Python Certification Exam",
  "description": "Test your Python knowledge",
  "category": "Programming",
  "duration": 90,
  "totalMarks": 100,
  "passingMarks": 70,
  "questions": [
    {
      "question": "What is Python?",
      "type": "multiple-choice",
      "options": ["Snake", "Programming Language", "Both"],
      "correctAnswer": "Programming Language",
      "marks": 5
    }
  ],
  "attempts": 3,
  "price": 999
}
```

### Submit Exam Attempt
```http
POST /api/v1/exams/:id/attempt
Authorization: Bearer <token>
Content-Type: application/json

{
  "answers": [
    {
      "questionId": "q1",
      "answer": "Programming Language"
    }
  ]
}
```

### Get Exam Results
```http
GET /api/v1/exams/:id/results?attemptId=attempt123
Authorization: Bearer <token>
```

---

## 💼 Jobs Endpoints

### Get All Jobs
```http
GET /api/v1/jobs?page=1&limit=10&type=full-time&mode=remote
```

### Get Job by ID
```http
GET /api/v1/jobs/:id
```

### Create Job (Instructor/Admin)
```http
POST /api/v1/jobs
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Senior Python Developer",
  "company": "Tech Corp",
  "location": "Bangalore",
  "type": "full-time",
  "mode": "hybrid",
  "description": "We are looking for...",
  "requirements": ["5+ years experience", "Python", "Django"],
  "salary": {
    "min": 1500000,
    "max": 2500000,
    "currency": "INR",
    "period": "year"
  },
  "benefits": ["Health insurance", "Remote work"],
  "applicationUrl": "https://techcorp.com/apply"
}
```

### Apply to Job
```http
POST /api/v1/jobs/:id/apply
Authorization: Bearer <token>
Content-Type: application/json

{
  "coverLetter": "I am interested in this position...",
  "resumeUrl": "https://storage.example.com/resume.pdf"
}
```

### Get My Applications
```http
GET /api/v1/jobs/my-applications
Authorization: Bearer <token>
```

---

## 📖 Enrollments Endpoints

### Get My Enrollments
```http
GET /api/v1/enrollments
Authorization: Bearer <token>
```

### Get Enrollment by ID
```http
GET /api/v1/enrollments/:id
Authorization: Bearer <token>
```

### Get My Courses
```http
GET /api/v1/enrollments/my-courses
Authorization: Bearer <token>
```

---

## 🎓 Certificates Endpoints

### Get My Certificates
```http
GET /api/v1/certificates
Authorization: Bearer <token>
```

### Verify Certificate (Public)
```http
GET /api/v1/certificates/verify/:certificateId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "certificate": {
      "certificateNumber": "CERT-2024-ABC123",
      "recipientName": "John Doe",
      "courseName": "Complete Python Bootcamp",
      "issuedAt": "2024-01-15T00:00:00.000Z",
      "grade": "A+",
      "score": 95,
      "verified": true
    },
    "isValid": true
  },
  "message": "Certificate is valid"
}
```

---

## 🔔 Notifications Endpoints

### Get Notifications
```http
GET /api/v1/notifications?page=1&limit=20
Authorization: Bearer <token>
```

### Get Unread Notifications
```http
GET /api/v1/notifications/unread
Authorization: Bearer <token>
```

### Mark Notifications as Read
```http
POST /api/v1/notifications/mark-read
Authorization: Bearer <token>
Content-Type: application/json

{
  "notificationIds": ["notif1", "notif2"]
}
```

---

## 📊 Dashboard Endpoints

### Student Dashboard
```http
GET /api/v1/dashboard/student
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "myCourses": [...],
    "stats": {
      "totalEnrolled": 5,
      "completed": 2,
      "inProgress": 3,
      "averageProgress": 65.5
    }
  }
}
```

### Instructor Dashboard
```http
GET /api/v1/dashboard/instructor
Authorization: Bearer <token>
```

### Admin Dashboard
```http
GET /api/v1/dashboard/admin
Authorization: Bearer <token>
```

---

## ⚙️ Settings & CMS Endpoints

### Get Settings
```http
GET /api/v1/settings?category=general
```

### Get Categories
```http
GET /api/v1/courses/category
```

### Get Pages (CMS)
```http
GET /api/v1/cms/pages?slug=about-us
```

### Get Blogs
```http
GET /api/v1/cms/blogs?category=tech&page=1&limit=10
```

### Get Navbar
```http
GET /api/v1/cms/navbar
```

### Get Footer
```http
GET /api/v1/cms/footer
```

---

## 🔍 Health Check

### API Health
```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "uptime": 3600
  }
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Missing or invalid token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid input data |
| CONFLICT | 409 | Resource already exists |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

---

## Rate Limiting

| Endpoint | Limit |
|----------|-------|
| Auth endpoints | 5 requests per 15 minutes |
| API endpoints | 100 requests per minute |
| Upload endpoints | 10 requests per hour |

---

## Pagination

All list endpoints support pagination:

```
GET /api/v1/courses?page=1&limit=10&sort=createdAt&order=desc
```

**Response includes meta:**
```json
{
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## SDK Examples

### JavaScript/TypeScript
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login
const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

// Get courses
const getCourses = async (params?: any) => {
  const response = await api.get('/courses', { params });
  return response.data;
};
```

### Python
```python
import requests

BASE_URL = "http://localhost:3001/api/v1"

class EDVOClient:
    def __init__(self, token=None):
        self.token = token
        self.session = requests.Session()
        if token:
            self.session.headers.update({
                'Authorization': f'Bearer {token}'
            })
    
    def login(self, email, password):
        response = self.session.post(
            f"{BASE_URL}/auth/login",
            json={"email": email, "password": password}
        )
        return response.json()
    
    def get_courses(self, **params):
        response = self.session.get(f"{BASE_URL}/courses", params=params)
        return response.json()
```

---

**Version**: 1.0.0  
**Last Updated**: 2024-03-21
