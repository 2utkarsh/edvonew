# EDVO Admin Panel

A complete admin dashboard for managing the EDVO learning platform.

## 🎨 Features

### Admin Login
- Secure authentication with JWT tokens
- Demo credentials: `admin@edvo.com` / `admin123`

### Dashboard Overview
- Real-time statistics (users, courses, enrollments, revenue)
- Recent courses table
- Quick access to all management sections

### Courses Management
- View all courses with detailed information
- Search and filter by category
- Course status badges (Published/Draft/Archived)
- Add/Edit/Delete course functionality (UI ready)

### Users Management
- View all registered users
- Filter by role (Student/Instructor/Admin)
- User status management (Active/Inactive)
- User details with avatars

### Exams Management
- View and manage exams
- Filter by category
- Exam duration and pricing display
- Status management

### Jobs Management
- Job postings management
- Filter by type and mode
- Salary range display
- Company information

## 🚀 Access the Admin Panel

1. **Start the backend server:**
   ```bash
   cd backend-nextjs
   npm run dev
   ```

2. **Open in browser:**
   ```
   http://localhost:3001/admin/login
   ```

3. **Login with demo credentials:**
   - Email: `admin@edvo.com`
   - Password: `admin123`

## 📁 Admin Routes

| Route | Description |
|-------|-------------|
| `/admin/login` | Admin login page |
| `/admin/dashboard` | Dashboard overview |
| `/admin/courses` | Courses management |
| `/admin/users` | Users management |
| `/admin/exams` | Exams management |
| `/admin/jobs` | Jobs management |

## 🎨 UI Components

The admin panel includes reusable components:

- **AdminLayout** - Main layout with sidebar and header
- **AdminSidebar** - Navigation sidebar with menu items
- **StatCard** - Statistics display cards
- **DataTable** - Responsive data tables
- **Button** - Styled button component
- **Badge** - Status badge component

## 🎯 Next Steps (To Implement)

1. Connect all CRUD operations to API endpoints
2. Add course creation/edit form
3. Add user role management
4. Add bulk actions
5. Add export functionality (CSV/PDF)
6. Add analytics charts
7. Add notification system
8. Add settings page

## 📸 Screenshots

The admin panel features:
- Modern, clean design
- Responsive layout (mobile-friendly)
- Dark sidebar with blue accents
- Card-based statistics
- Interactive data tables

---

**Built with Next.js 16, React 19, and Tailwind CSS**
