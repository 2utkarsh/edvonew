# 🎨 EDVO Admin Panel - Fresh Design

A beautifully redesigned admin dashboard built from scratch with pure HTML, CSS, and JavaScript.

## ✨ Features

### Modern Design
- **Gradient backgrounds** with purple/blue theme
- **Clean sidebar navigation** with smooth hover effects
- **Responsive layout** that works on all devices
- **Card-based statistics** with icons
- **Professional data tables** with action buttons

### Pages Created

#### 1. Admin Login (`/admin`)
- Beautiful split-screen design
- Left panel with feature highlights
- Right panel with login form
- Demo credentials displayed
- JWT authentication

#### 2. Dashboard (`/admin/dashboard`)
- 4 stat cards (Users, Courses, Enrollments, Revenue)
- Growth indicators with percentages
- Recent courses table
- Real-time data from API

#### 3. Courses Management (`/admin/courses`)
- Full courses table with thumbnails
- Search and filter functionality
- Category and status filters
- Add/Edit/Delete actions
- Modal for course creation

## 🎯 Access the Admin Panel

### 1. Start the Server
```bash
cd backend-nextjs
npm run dev
```

### 2. Open in Browser
```
http://localhost:3001/admin
```

### 3. Login
- **Email:** `admin@edvo.com`
- **Password:** `admin123`

## 📁 File Structure

```
backend-nextjs/src/app/admin/
├── page.html              # Login page
├── route.ts               # Route handler for login
├── dashboard/
│   ├── page.html          # Dashboard page
│   └── route.ts           # Route handler
├── courses/
│   ├── page.html          # Courses management
│   └── route.ts           # Route handler
├── styles.css             # Shared styles
├── admin.js               # Shared JavaScript
└── public/admin/
    ├── styles.css         # Public CSS
    └── admin.js           # Public JS
```

## 🎨 Design Highlights

### Color Scheme
- **Primary:** Purple-Blue gradient (#667eea to #764ba2)
- **Success:** Green (#48bb78)
- **Warning:** Orange (#ed8936)
- **Danger:** Red (#f56565)
- **Dark:** #1a202c

### UI Components
- **Sidebar:** Fixed navigation with gradient background
- **Stat Cards:** White cards with colored icon backgrounds
- **Tables:** Clean design with hover effects
- **Badges:** Colored pills for status indicators
- **Buttons:** Gradient primary buttons with hover lift
- **Modals:** Centered overlays for forms

### Responsive Features
- Mobile-friendly sidebar (collapses on small screens)
- Responsive stat grid (auto-fit columns)
- Touch-friendly buttons and actions

## 🔧 Customization

### Change Colors
Edit `src/app/admin/styles.css`:
```css
:root {
  --primary: #667eea;
  --secondary: #764ba2;
  /* ... other colors */
}
```

### Add New Pages
1. Create `page.html` in new folder
2. Create `route.ts` handler
3. Add navigation item in sidebar

### Add New Features
- Edit `src/app/admin/admin.js` for shared functions
- Add page-specific scripts in individual pages

## 📊 API Integration

The admin panel connects to these backend endpoints:

| Endpoint | Purpose |
|----------|---------|
| `POST /api/v1/auth/login` | Admin authentication |
| `GET /api/v1/dashboard/admin` | Dashboard statistics |
| `GET /api/v1/courses` | Fetch courses list |
| `GET /api/v1/users` | Fetch users list |

## 🚀 Next Steps

To complete the admin panel:

1. **Users Page** - Create `/admin/users/page.html`
2. **Exams Page** - Create `/admin/exams/page.html`
3. **Jobs Page** - Create `/admin/jobs/page.html`
4. **Course Form** - Implement full add/edit form
5. **Charts** - Add analytics charts (Chart.js)
6. **Notifications** - Add toast notification system
7. **Settings** - Create settings page

## 💡 Tips

- All CSS is in `public/admin/styles.css` for easy editing
- JavaScript utilities in `public/admin/admin.js`
- Each page is a standalone HTML file
- No React/Next.js components needed for admin
- Pure HTML/CSS/JS = Fast loading

---

**Built with ❤️ using pure HTML, CSS, and JavaScript**
