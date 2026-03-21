# EDVO Backend Architecture

A comprehensive Next.js-based backend API for the EDVO learning platform, built with modern best practices.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (Frontend)                       │
│                    Next.js 16 + React 19                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                         │
│              (Next.js API Routes + Middleware)               │
│  • Authentication Middleware  • Rate Limiting               │
│  • Request Validation         • Error Handling              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Route Handlers Layer                      │
│  /api/auth  /api/courses  /api/users  /api/exams  /api/jobs  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Controllers/Services Layer                │
│  • Business Logic  • Validation  • Data Transformation      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Access Layer                         │
│  • Mongoose Models  • Query Builders  • Repositories        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                            │
│                    MongoDB Atlas/Local                       │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
backend-nextjs/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── login/route.ts
│   │   │   │   │   ├── register/route.ts
│   │   │   │   │   ├── logout/route.ts
│   │   │   │   │   ├── refresh/route.ts
│   │   │   │   │   ├── forgot-password/route.ts
│   │   │   │   │   ├── reset-password/route.ts
│   │   │   │   │   ├── verify-email/route.ts
│   │   │   │   │   └── social/
│   │   │   │   │       ├── google/route.ts
│   │   │   │   │       └── github/route.ts
│   │   │   │   │
│   │   │   │   ├── courses/
│   │   │   │   │   ├── route.ts                    # GET all, POST create
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   ├── route.ts                # GET, PUT, DELETE
│   │   │   │   │   │   ├── enroll/route.ts
│   │   │   │   │   │   ├── review/route.ts
│   │   │   │   │   │   └── progress/route.ts
│   │   │   │   │   ├── category/
│   │   │   │   │   │   └── [category]/route.ts
│   │   │   │   │   ├── search/route.ts
│   │   │   │   │   ├── popular/route.ts
│   │   │   │   │   └── instructor/
│   │   │   │   │       └── [instructorId]/route.ts
│   │   │   │   │
│   │   │   │   ├── users/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   ├── route.ts
│   │   │   │   │   │   ├── profile/route.ts
│   │   │   │   │   │   ├── avatar/route.ts
│   │   │   │   │   │   └── password/route.ts
│   │   │   │   │   ├── me/route.ts
│   │   │   │   │   └── admin/
│   │   │   │   │       ├── list/route.ts
│   │   │   │   │       └── stats/route.ts
│   │   │   │   │
│   │   │   │   ├── instructors/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   ├── [id]/route.ts
│   │   │   │   │   └── courses/route.ts
│   │   │   │   │
│   │   │   │   ├── enrollments/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   ├── [id]/route.ts
│   │   │   │   │   ├── my-courses/route.ts
│   │   │   │   │   └── progress/route.ts
│   │   │   │   │
│   │   │   │   ├── exams/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   ├── route.ts
│   │   │   │   │   │   ├── attempt/route.ts
│   │   │   │   │   │   └── results/route.ts
│   │   │   │   │   ├── category/route.ts
│   │   │   │   │   └── my-attempts/route.ts
│   │   │   │   │
│   │   │   │   ├── jobs/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   ├── [id]/route.ts
│   │   │   │   │   ├── apply/route.ts
│   │   │   │   │   └── my-applications/route.ts
│   │   │   │   │
│   │   │   │   ├── subscriptions/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   ├── [id]/route.ts
│   │   │   │   │   ├── active/route.ts
│   │   │   │   │   └── payment/
│   │   │   │   │       ├── create-intent/route.ts
│   │   │   │   │       └── webhook/route.ts
│   │   │   │   │
│   │   │   │   ├── payments/
│   │   │   │   │   ├── history/route.ts
│   │   │   │   │   ├── invoices/[id]/route.ts
│   │   │   │   │   └── refund/route.ts
│   │   │   │   │
│   │   │   │   ├── reviews/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── [id]/route.ts
│   │   │   │   │
│   │   │   │   ├── certificates/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   ├── [id]/route.ts
│   │   │   │   │   └── verify/[certificateId]/route.ts
│   │   │   │   │
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── student/route.ts
│   │   │   │   │   ├── instructor/route.ts
│   │   │   │   │   └── admin/route.ts
│   │   │   │   │
│   │   │   │   ├── analytics/
│   │   │   │   │   ├── courses/route.ts
│   │   │   │   │   ├── revenue/route.ts
│   │   │   │   │   └── engagement/route.ts
│   │   │   │   │
│   │   │   │   ├── notifications/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   ├── unread/route.ts
│   │   │   │   │   └── mark-read/route.ts
│   │   │   │   │
│   │   │   │   ├── settings/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── categories/route.ts
│   │   │   │   │
│   │   │   │   └── cms/
│   │   │   │       ├── pages/route.ts
│   │   │   │       ├── blogs/route.ts
│   │   │   │       ├── navbar/route.ts
│   │   │   │       └── footer/route.ts
│   │   │   │
│   │   │   └── health/route.ts                  # Health check
│   │   │
│   │   └── layout.tsx
│   │
│   ├── lib/
│   │   ├── auth.ts                  # Authentication utilities
│   │   ├── db.ts                    # Database connection
│   │   ├── http.ts                  # HTTP helpers (success, error)
│   │   ├── validators.ts            # Zod schemas
│   │   ├── query.ts                 # Query builder utilities
│   │   ├── pagination.ts            # Pagination helpers
│   │   ├── upload.ts                # File upload utilities
│   │   ├── email.ts                 # Email service
│   │   ├── cache.ts                 # Redis/caching utilities
│   │   └── logger.ts                # Logging utilities
│   │
│   ├── models/
│   │   ├── User.ts
│   │   ├── Course.ts
│   │   ├── Enrollment.ts
│   │   ├── Exam.ts
│   │   ├── Job.ts
│   │   ├── Subscription.ts
│   │   ├── Payment.ts
│   │   ├── Review.ts
│   │   ├── Certificate.ts
│   │   ├── Notification.ts
│   │   ├── Instructor.ts
│   │   ├── CourseCategory.ts
│   │   ├── ExamCategory.ts
│   │   ├── Blog.ts
│   │   ├── Page.ts
│   │   ├── Navbar.ts
│   │   ├── Footer.ts
│   │   ├── Newsletter.ts
│   │   ├── ContactMessage.ts
│   │   └── SystemSetting.ts
│   │
│   ├── services/
│   │   ├── AuthService.ts
│   │   ├── CourseService.ts
│   │   ├── UserService.ts
│   │   ├── EnrollmentService.ts
│   │   ├── ExamService.ts
│   │   ├── JobService.ts
│   │   ├── PaymentService.ts
│   │   ├── EmailService.ts
│   │   ├── NotificationService.ts
│   │   ├── CertificateService.ts
│   │   └── AnalyticsService.ts
│   │
│   ├── middleware/
│   │   ├── auth.ts                  # Authentication middleware
│   │   ├── rateLimit.ts             # Rate limiting middleware
│   │   ├── validate.ts              # Request validation middleware
│   │   └── errorHandler.ts          # Global error handler
│   │
│   └── types/
│       ├── api.ts                   # API response types
│       ├── auth.ts                  # Auth-related types
│       ├── models.ts                # Model types
│       └── index.ts                 # Type exports
│
├── scripts/
│   ├── seed-admin.ts                # Seed admin user
│   ├── seed-courses.ts              # Seed sample courses
│   ├── seed-users.ts                # Seed sample users
│   └── migrate.ts                   # Database migrations
│
├── tests/
│   ├── auth.test.ts
│   ├── courses.test.ts
│   └── users.test.ts
│
├── .env.example
├── .env.local
├── package.json
├── tsconfig.json
├── next.config.ts
└── vercel.json
```

## 🔐 Authentication Flow

### JWT Token Structure

```typescript
// Access Token Payload
{
  sub: "user_id",
  email: "user@example.com",
  name: "User Name",
  role: "student" | "instructor" | "admin",
  iat: 1234567890,
  exp: 1234567890
}
```

### Authentication Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/register` | POST | Register new user |
| `/api/v1/auth/login` | POST | Login user |
| `/api/v1/auth/logout` | POST | Logout user |
| `/api/v1/auth/refresh` | POST | Refresh access token |
| `/api/v1/auth/forgot-password` | POST | Request password reset |
| `/api/v1/auth/reset-password` | POST | Reset password with token |
| `/api/v1/auth/verify-email` | POST | Verify email address |
| `/api/v1/auth/social/google` | POST | Google OAuth login |
| `/api/v1/auth/social/github` | POST | GitHub OAuth login |

### Middleware Protection

```typescript
// Example: Protected route
export async function GET(request: Request) {
  const authResult = await requireAuth(['student', 'instructor', 'admin']);
  if (authResult.error) return authResult.error;
  
  const userId = authResult.payload.sub;
  // Continue with business logic
}
```

## 📊 Database Models

### Core Models

#### User
```typescript
{
  name: string,
  email: string (unique),
  mobile?: string,
  passwordHash: string,
  role: 'student' | 'instructor' | 'admin',
  status: number,
  isActive: boolean,
  photo?: string,
  avatar?: string,
  googleId?: string,
  socialLinks: Array<Record<string, unknown>>,
  instructorId?: ObjectId,
  bio?: string,
  headline?: string,
  skills: string[],
  enrolledCourses: ObjectId[],
  enrolledExams: ObjectId[],
  createdCourses: ObjectId[],
  createdExams: ObjectId[],
  createdAt: Date,
  updatedAt: Date
}
```

#### Course
```typescript
{
  title: string,
  slug: string (unique),
  shortDescription?: string,
  description: string,
  category: string,
  level: 'beginner' | 'intermediate' | 'advanced',
  status: 'draft' | 'published' | 'archived',
  instructorId?: ObjectId,
  instructorName?: string,
  thumbnail?: string,
  banner?: string,
  price: number,
  originalPrice?: number,
  discount?: number,
  startDate?: string,
  duration?: string,
  delivery?: string,
  language?: string,
  jobAssistance?: boolean,
  bannerTag?: string,
  bannerSubtag?: string,
  bannerExtra?: string,
  stats?: {
    hiringPartners?: string,
    careerTransitions?: string,
    highestPackage?: string
  },
  tags: string[],
  requirements: string[],
  whatYouWillLearn: string[],
  curriculum: CurriculumSubject[],
  mentors: Mentor[],
  plans: Plan[],
  offerings: Offering[],
  faqs: FAQ[],
  testimonials: Testimonial[],
  certifications: Certification[],
  rating: number,
  reviewCount: number,
  studentsEnrolled: number,
  publishedAt?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Enrollment
```typescript
{
  userId: ObjectId,
  courseId: ObjectId,
  status: 'active' | 'completed' | 'expired',
  progress: number,
  completedLectures: LectureProgress[],
  enrolledAt: Date,
  completedAt?: Date,
  expiresAt?: Date,
  certificateId?: ObjectId
}
```

#### Exam
```typescript
{
  title: string,
  slug: string,
  description: string,
  category: string,
  duration: number, // minutes
  totalMarks: number,
  passingMarks: number,
  questions: Question[],
  attempts: number,
  price: number,
  status: 'draft' | 'published' | 'archived',
  instructorId: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

#### Job
```typescript
{
  title: string,
  slug: string,
  company: string,
  location: string,
  type: 'full-time' | 'part-time' | 'contract' | 'internship',
  mode: 'remote' | 'onsite' | 'hybrid',
  description: string,
  requirements: string[],
  responsibilities: string[],
  salary?: {
    min: number,
    max: number,
    currency: string,
    period: 'year' | 'month' | 'hour'
  },
  benefits: string[],
  applicationUrl: string,
  applicationDeadline?: Date,
  postedBy: ObjectId,
  status: 'active' | 'closed',
  createdAt: Date,
  updatedAt: Date
}
```

#### Subscription
```typescript
{
  userId: ObjectId,
  planId: ObjectId,
  status: 'active' | 'cancelled' | 'expired',
  startDate: Date,
  endDate: Date,
  paymentId: ObjectId,
  autoRenew: boolean,
  cancelledAt?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🌐 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  },
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

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST (resource created) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation errors |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

## 🚀 Rate Limiting

```typescript
// Rate limit configuration
const rateLimits = {
  auth: {
    window: 15 * 60 * 1000, // 15 minutes
    max: 5 // 5 requests per window
  },
  api: {
    window: 60 * 1000, // 1 minute
    max: 100 // 100 requests per minute
  },
  upload: {
    window: 60 * 60 * 1000, // 1 hour
    max: 10 // 10 uploads per hour
  }
};
```

## 📧 Email Service

### Email Templates

- Welcome Email (on registration)
- Password Reset Email
- Email Verification Email
- Enrollment Confirmation
- Course Completion Certificate
- Payment Receipt
- Subscription Renewal Reminder
- Exam Result Notification

## 📈 Analytics Events

Tracked events for analytics:

- Course View
- Course Enrollment
- Lecture Completion
- Exam Attempt
- Job Application
- Payment Success
- User Registration
- User Login

## 🔒 Security Best Practices

1. **Password Hashing**: bcrypt with salt rounds = 10
2. **JWT Tokens**: Short-lived access tokens (7 days)
3. **Rate Limiting**: Prevent brute force attacks
4. **Input Validation**: Zod schemas for all inputs
5. **CORS**: Restrict to allowed origins
6. **Helmet**: Security headers
7. **MongoDB Injection Prevention**: Mongoose sanitization
8. **XSS Protection**: Input/output encoding

## 🎯 Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/edvo
MONGODB_DB=edvo

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password

# File Upload
MAX_FILE_SIZE=10485760 # 10MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf

# Payment Gateway (Stripe/Razorpay)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Redis (optional for caching)
REDIS_URL=redis://localhost:6379

# CDN (optional for assets)
CDN_URL=https://cdn.yourdomain.com
```

## 🧪 Testing Strategy

```bash
# Run all tests
npm test

# Run specific test file
npm test -- auth.test.ts

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Test Categories

1. **Unit Tests**: Test individual functions
2. **Integration Tests**: Test API endpoints
3. **E2E Tests**: Test complete user flows

## 📝 API Documentation

Auto-generated API documentation available at:
- Development: `http://localhost:3001/api-docs`
- Production: `https://api.edvo.com/api-docs`

## 🚀 Deployment

### Vercel Deployment

```bash
# Build and deploy
vercel deploy --prod
```

### Docker Deployment

```bash
# Build Docker image
docker build -t edvo-backend .

# Run container
docker run -p 3001:3001 --env-file .env edvo-backend
```

### PM2 Deployment

```bash
# Start with PM2
pm2 start ecosystem.config.cjs

# Monitor
pm2 monit
```

## 🔄 Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Make Changes & Test**
   ```bash
   npm run dev
   npm test
   ```

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

4. **Push & Create PR**
   ```bash
   git push origin feature/new-feature
   ```

## 📚 Additional Resources

- [Next.js API Routes Documentation](https://nextjs.org/docs/app/api-reference/file-conventions/route)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [MongoDB Schema Design](https://www.mongodb.com/docs/manual/data-modeling/)

---

**Version**: 1.0.0  
**Last Updated**: 2026-03-21  
**Maintained By**: EDVO Development Team
