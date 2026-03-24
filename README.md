# EDVO - World-Class Learning Platform

A modern, feature-rich educational platform inspired by Codebasics.io, PhysicsWallah, and TutDude.com, built with Next.js 14, TypeScript, Tailwind CSS, and Framer Motion.

This repository contains the current EDVO web application and its supporting services.

![EDVO Platform](https://img.shields.io/badge/EDVO-Learning%20Platform-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-cyan?style=for-the-badge&logo=tailwind-css)

## 🚀 Features

### For Students
- **Browse Courses**: Explore thousands of courses across multiple categories
- **Advanced Search & Filters**: Find the perfect course with powerful filtering options
- **Student Dashboard**: Track progress, manage enrollments, and view achievements
- **Video Player**: World-class video player with speed control, quality selection, and more
- **Course Progress Tracking**: Visual progress bars and completion tracking
- **Certificates**: Earn certificates upon course completion
- **Job Board**: Discover job opportunities and apply directly

### For Instructors
- **Instructor Dashboard**: Comprehensive dashboard to manage courses and students
- **Course Management**: Create, edit, and publish courses
- **Analytics**: Track student engagement and revenue
- **Reviews Management**: Respond to student reviews
- **Earnings Tracker**: Monitor revenue and payouts

### Platform Features
- **Authentication**: Secure login/signup with JWT tokens
- **Responsive Design**: Beautiful on all devices
- **World-Class Animations**: Smooth transitions using Framer Motion
- **Dark Mode Support**: Eye-friendly dark theme
- **Real-time Updates**: Live progress tracking
- **Payment Integration Ready**: Prepared for payment gateway integration

## 📁 Project Structure

```
EDVO/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── courses/      # Course endpoints
│   │   │   └── jobs/         # Job endpoints
│   │   ├── auth/             # Auth pages (login, register)
│   │   ├── courses/          # Course pages
│   │   ├── jobs/             # Job board pages
│   │   ├── dashboard/        # User dashboards
│   │   │   ├── student/     # Student dashboard
│   │   │   └── instructor/  # Instructor dashboard
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Homepage
│   │   └── globals.css      # Global styles
│   ├── components/
│   │   ├── animations/      # Animation components
│   │   ├── layout/          # Layout components (Navbar, Footer)
│   │   └── ui/              # Reusable UI components
│   ├── lib/                 # Utility functions
│   ├── store/               # State management (Zustand)
│   └── types/               # TypeScript types
├── public/                  # Static assets
├── tailwind.config.js      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Icons**: Lucide React
- **UI Components**: Radix UI primitives
- **Authentication**: JWT tokens
- **API**: Next.js API Routes

## 🎨 Design Features

### Animations
- Page transitions with Framer Motion
- Stagger animations for lists
- Parallax scrolling effects
- Hover animations on cards and buttons
- Loading skeletons and spinners
- Particle background effects

### UI Components
- Responsive navigation with mobile menu
- Glass morphism effects
- Gradient text and borders
- Custom video player
- Interactive cards with hover effects
- Badge system
- Skeleton loading states

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Navigate to project directory**
   ```bash
   cd "c:\Users\ARNAV PAL\Desktop\EDVO"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

## 📱 Pages & Routes

### Public Routes
- `/` - Homepage with hero section, features, and testimonials
- `/courses` - Course listing with search and filters
- `/courses/[id]` - Individual course detail page
- `/jobs` - Job board with filtering
- `/auth/login` - Login page
- `/auth/register` - Registration page

### Protected Routes (Demo - no auth required currently)
- `/dashboard/student` - Student dashboard
- `/dashboard/instructor` - Instructor dashboard

## 🎯 Key Components

### Video Player
- Play/Pause with animation
- Seek functionality
- Volume control
- Playback speed adjustment (0.5x - 2x)
- Quality selection
- Fullscreen mode
- Picture-in-picture support
- Keyboard shortcuts ready

### Course Card
- Thumbnail with hover overlay
- Rating and review count
- Instructor name
- Price with discount
- Enrollment count
- Preview button

### Navigation
- Sticky header with scroll effect
- Mobile-responsive menu
- Animated active indicator
- Smooth transitions

## 🔐 Authentication

Currently using mock authentication. To implement real authentication:

1. Set up database (PostgreSQL/MongoDB)
2. Update API routes with real database queries
3. Add environment variables for JWT secret
4. Implement refresh token logic
5. Add OAuth providers (Google, GitHub)

## 💳 Payment Integration

The platform is ready for payment integration. To add payments:

1. Choose payment provider (Razorpay, Stripe, Paytm)
2. Install SDK
3. Create payment API routes
4. Add webhook handlers
5. Update enrollment logic

## 🎨 Customization

### Change Colors
Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: { /* your colors */ },
      secondary: { /* your colors */ },
    }
  }
}
```

### Add Logo
Replace logo in `src/components/layout/Navbar.tsx`:
```tsx
<div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600">
  {/* Your logo here */}
</div>
```

### Update Branding
Change metadata in `src/app/layout.tsx`:
```typescript
export const metadata: Metadata = {
  title: "Your Platform Name",
  description: "Your description",
}
```

## 📊 Database Schema (Recommended)

### Users
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  password: string; // hashed
  role: 'student' | 'instructor' | 'admin';
  avatar?: string;
  createdAt: Date;
}
```

### Courses
```typescript
interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  price: number;
  thumbnail: string;
  curriculum: Module[];
  published: boolean;
}
```

### Enrollments
```typescript
interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  completedLectures: string[];
}
```

## 🚧 Future Enhancements

- [ ] Real-time chat for courses
- [ ] Live classes integration
- [ ] Quiz and assessment system
- [ ] Discussion forums
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Gamification (badges, leaderboards)
- [ ] Social learning features
- [ ] Offline video download
- [ ] Subtitle/caption support
- [ ] Course recommendations (AI)
- [ ] Multi-language support

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

Created with ❤️ for learners worldwide.

## 🙏 Acknowledgments

Inspired by:
- Codebasics.io
- PhysicsWallah
- TutDude.com
- Udemy
- Coursera

---

**Happy Learning! 🎓**
