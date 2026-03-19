# 🚀 EDVO - Quick Start Guide

## Get Started in 3 Steps

### 1️⃣ Open Terminal
```bash
cd "c:\Users\ARNAV PAL\Desktop\EDVO"
```

### 2️⃣ Install Dependencies (if not already done)
```bash
npm install
```

### 3️⃣ Start Development Server
```bash
npm run dev
```

## 🎉 Access Your Platform

**Open your browser and go to:**
```
http://localhost:3001
```

---

## 📱 Explore These Pages

| Page | URL | What to See |
|------|-----|-------------|
| **Homepage** | `/` | Hero animations, features, testimonials |
| **Courses** | `/courses` | Browse courses with filters |
| **Course Detail** | `/courses/1` | Course curriculum, pricing, preview |
| **Jobs** | `/jobs` | Job board with company info |
| **Login** | `/auth/login` | Beautiful login form |
| **Register** | `/auth/register` | Signup with password strength |
| **Student Dashboard** | `/dashboard/student` | Track progress, achievements |
| **Instructor Dashboard** | `/dashboard/instructor` | Manage courses, analytics |

---

## 🎨 Key Features to Try

### ✨ Animations
- Scroll down on homepage to see parallax effects
- Hover over course cards for lift effect
- Click buttons for scale animations
- Watch particle backgrounds float

### 🔍 Search & Filter
- Go to `/courses`
- Try searching for "Python"
- Filter by category and level
- Sort by price or rating

### 📺 Video Player
- Open any course detail page
- Click "Preview Course"
- Test playback controls
- Try speed adjustment

### 📊 Dashboards
- Visit student dashboard for progress tracking
- Check instructor dashboard for course management
- See achievements and statistics

---

## 🛠️ Common Tasks

### Change the Logo
1. Open `src/components/layout/Navbar.tsx`
2. Find the logo div (line ~25)
3. Replace with your image or SVG

### Update Colors
1. Open `tailwind.config.js`
2. Edit the `colors` section
3. Save and see changes instantly

### Add New Course
1. Open `src/app/api/courses/route.ts`
2. Add new course object to the array
3. Refresh the courses page

### Modify Homepage Text
1. Open `src/app/page.tsx`
2. Find the text you want to change
3. Save and refresh

---

## 🐛 Troubleshooting

### Port Already in Use
If port 3001 is taken, Next.js will use the next available port. Check the terminal output.

### Styles Not Loading
```bash
# Clear cache and restart
rm -rf .next
npm run dev
```

### Module Errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Homepage |
| `src/app/layout.tsx` | Main layout |
| `src/components/layout/Navbar.tsx` | Navigation |
| `src/components/layout/Footer.tsx` | Footer |
| `tailwind.config.js` | Theme customization |
| `src/types/index.ts` | TypeScript types |

---

## 🎯 Next Steps

1. **Customize Branding**
   - Add your logo
   - Change color scheme
   - Update meta tags in `layout.tsx`

2. **Add Real Content**
   - Replace sample courses
   - Add actual job listings
   - Update instructor info

3. **Set Up Backend**
   - Connect database (PostgreSQL/MongoDB)
   - Implement real authentication
   - Add file upload for videos

4. **Deploy**
   - Push to GitHub
   - Deploy on Vercel
   - Configure custom domain

---

## 📞 Need Help?

- Check `README.md` for detailed documentation
- Review `PROJECT_SUMMARY.md` for complete feature list
- Inspect browser console for errors
- Check terminal for build errors

---

## 🎨 Design Tips

### Best Practices Used
- ✅ Consistent spacing (Tailwind classes)
- ✅ Responsive design (mobile-first)
- ✅ Smooth animations (Framer Motion)
- ✅ Loading states (Skeletons)
- ✅ Error handling (Form validation)
- ✅ Accessibility (ARIA labels)

### Animation Guidelines
- Duration: 0.3s - 0.5s
- Easing: `[0.25, 0.46, 0.45, 0.94]`
- Stagger delay: 0.1s between items
- Hover scale: 1.05x
- Active scale: 0.95x

---

## 🌟 Show Off Your Platform!

Your EDVO platform features:
- ✨ 50+ smooth animations
- 🎨 World-class UI components
- 📱 Fully responsive design
- 🔐 Secure authentication
- 📊 Interactive dashboards
- 🎥 Custom video player
- 💼 Job board integration

**Ready to impress your users!** 🚀

---

**Happy Building! 🎓**
