# EDVO Backend - Next.js API

A comprehensive RESTful API backend for the EDVO learning platform, built with Next.js 16, TypeScript, MongoDB, and Mongoose.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- MongoDB running locally or MongoDB Atlas account
- npm or yarn package manager

### Installation

1. **Navigate to backend directory**
   ```bash
   cd backend-nextjs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and configure:
   ```env
   MONGODB_URI=mongodb://localhost:27017/edvo
   JWT_SECRET=your-secret-key-change-in-production
   PORT=3001
   ```

4. **Seed initial data**
   ```bash
   # Create admin user
   npm run seed:admin
   
   # Create sample courses (optional)
   npm run seed:courses
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Test the API**
   ```bash
   # Health check
   curl http://localhost:3001/api/health
   
   # Register a user
   curl -X POST http://localhost:3001/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
   ```

## 📁 Project Structure

```
backend-nextjs/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/              # API Version 1
│   │   │   │   ├── auth/        # Authentication routes
│   │   │   │   ├── courses/     # Course routes
│   │   │   │   ├── users/       # User routes
│   │   │   │   ├── exams/       # Exam routes
│   │   │   │   ├── jobs/        # Job routes
│   │   │   │   ├── enrollments/ # Enrollment routes
│   │   │   │   ├── dashboard/   # Dashboard routes
│   │   │   │   └── ...          # Other routes
│   │   │   └── health/          # Health check
│   │   └── layout.tsx
│   ├── lib/
│   │   ├── auth.ts              # Auth utilities
│   │   ├── db.ts                # Database connection
│   │   ├── http.ts              # HTTP helpers
│   │   ├── validators.ts        # Zod schemas
│   │   └── pagination.ts        # Pagination helpers
│   ├── models/
│   │   ├── User.ts
│   │   ├── Course.ts
│   │   ├── Enrollment.ts
│   │   ├── Exam.ts
│   │   ├── Job.ts
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.ts              # Auth middleware
│   │   └── rateLimit.ts         # Rate limiting
│   ├── services/                # Business logic
│   └── types/                   # TypeScript types
├── scripts/
│   ├── seed-admin.ts            # Admin seeder
│   └── seed-courses.ts          # Courses seeder
├── .env.example
├── package.json
└── tsconfig.json
```

## 🔐 Default Credentials

After running seed scripts:

**Admin:**
- Email: `admin@edvo.com`
- Password: `admin123`

**Instructor:**
- Email: `instructor@edvo.com`
- Password: `instructor123`

⚠️ **Change these passwords in production!**

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login user |
| POST | `/api/v1/auth/logout` | Logout user |
| POST | `/api/v1/auth/refresh` | Refresh token |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/courses` | Get all courses |
| GET | `/api/v1/courses/:id` | Get course by ID |
| POST | `/api/v1/courses` | Create course |
| PUT | `/api/v1/courses/:id` | Update course |
| DELETE | `/api/v1/courses/:id` | Delete course |
| GET | `/api/v1/courses/search` | Search courses |
| POST | `/api/v1/courses/:id/enroll` | Enroll in course |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/me` | Get current user |
| GET | `/api/v1/users/:id` | Get user by ID |
| PUT | `/api/v1/users/:id` | Update user |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/dashboard/student` | Student dashboard |
| GET | `/api/v1/dashboard/instructor` | Instructor dashboard |
| GET | `/api/v1/dashboard/admin` | Admin dashboard |

For complete API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server on port 3001

# Production
npm run build        # Build for production
npm start            # Start production server

# Database Seeding
npm run seed:admin   # Seed admin user
npm run seed:courses # Seed sample courses
npm run seed:all     # Seed everything

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Testing with cURL

```bash
# Register
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# Get courses (with token)
curl http://localhost:3001/api/v1/courses \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Testing with Postman/Insomnia

1. Import the API collection (if available)
2. Set base URL: `http://localhost:3001/api/v1`
3. Add authorization header for protected routes:
   - Type: Bearer Token
   - Token: `<your-jwt-token>`

## 🗄️ Database Models

### User
```typescript
{
  name: string
  email: string (unique)
  passwordHash: string
  role: 'student' | 'instructor' | 'admin'
  isActive: boolean
  skills: string[]
  enrolledCourses: ObjectId[]
  createdCourses: ObjectId[]
}
```

### Course
```typescript
{
  title: string
  slug: string (unique)
  description: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  price: number
  instructorId: ObjectId
  curriculum: CurriculumSubject[]
  rating: number
  studentsEnrolled: number
  status: 'draft' | 'published' | 'archived'
}
```

### Enrollment
```typescript
{
  userId: ObjectId
  courseId: ObjectId
  progress: number (0-100)
  completedLectures: string[]
  status: 'active' | 'completed' | 'expired'
}
```

For all models, see the `src/models/` directory.

## 🔒 Security

- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Tokens**: Signed with HS256 algorithm
- **Rate Limiting**: Configurable per endpoint
- **Input Validation**: Zod schemas for all inputs
- **CORS**: Configurable allowed origins

## 🚢 Deployment

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel deploy --prod
```

### Docker

```bash
# Build image
docker build -t edvo-backend .

# Run container
docker run -p 3001:3001 --env-file .env.local edvo-backend
```

### PM2

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start npm --name "edvo-backend" -- start

# Monitor
pm2 monit
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | Token expiration time | `7d` |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

## 🐛 Debugging

Enable debug logging:

```env
# .env.local
DEBUG=true
LOG_LEVEL=debug
```

Check logs in:
- Development: Console output
- Production: Check your hosting provider's logs

## 📚 Additional Resources

- [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md) - Architecture overview
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Complete API docs
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Next.js API Routes](https://nextjs.org/docs/app/api-reference/file-conventions/route)
- [Mongoose Documentation](https://mongoosejs.com/docs/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for EDVO Learning Platform**
