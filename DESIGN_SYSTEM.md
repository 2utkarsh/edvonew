# EDVO Design System - EdTech Platform

## 🎨 Design Philosophy

**Core Principle:** "Learn → Build Projects → Get Hired"

**Design Values:**
- Clarity over complexity
- Data-driven decisions
- Minimal cognitive load
- Scalable modular architecture
- Industry-integrated employability focus

---

## 🎨 Color System

### Primary Colors
```css
--primary-50: #eef2ff;    /* Lightest */
--primary-100: #e0e7ff;
--primary-200: #c7d2fe;
--primary-300: #a5b4fc;
--primary-400: #818cf8;
--primary-500: #6366f1;   /* Primary Indigo */
--primary-600: #4f46e5;   /* Default */
--primary-700: #4338ca;
--primary-800: #3730a3;
--primary-900: #312e81;   /* Darkest */
```

### Secondary Colors (Purple/Electric Blue)
```css
--secondary-50: #faf5ff;
--secondary-100: #f3e8ff;
--secondary-200: #e9d5ff;
--secondary-300: #d8b4fe;
--secondary-400: #c084fc;
--secondary-500: #a855f7;   /* Purple */
--secondary-600: #9333ea;
--secondary-700: #7e22ce;
--secondary-800: #6b21a8;
--secondary-900: #581c87;
```

### Semantic Colors
```css
/* Success */
--success-50: #f0fdf4;
--success-500: #22c55e;
--success-600: #16a34a;

/* Warning */
--warning-50: #fffbeb;
--warning-500: #f59e0b;
--warning-600: #d97706;

/* Error */
--error-50: #fef2f2;
--error-500: #ef4444;
--error-600: #dc2626;

/* Info */
--info-50: #eff6ff;
--info-500: #3b82f6;
--info-600: #2563eb;
```

### Neutral Colors
```css
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
```

---

## 📐 Spacing System

**Base Unit:** 4px

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
```

**Section Spacing Rule:**
- Between sections: 80px (desktop), 48px (mobile)
- Between cards: 24px
- Internal card padding: 24px
- Widget padding: 20px

---

## 📝 Typography System

### Font Families
```css
--font-heading: 'Inter', -apple-system, sans-serif;
--font-body: 'Inter', -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Use Case |
|---------|------|--------|-------------|----------|
| Display | 48px | 700 | 1.2 | Hero headlines |
| H1 | 36px | 700 | 1.3 | Page titles |
| H2 | 28px | 600 | 1.4 | Section titles |
| H3 | 22px | 600 | 1.4 | Card titles |
| H4 | 18px | 600 | 1.5 | Subsections |
| Body Large | 16px | 400 | 1.6 | Important text |
| Body | 14px | 400 | 1.6 | Default text |
| Body Small | 13px | 400 | 1.5 | Secondary text |
| Caption | 12px | 500 | 1.4 | Labels, badges |
| Overline | 11px | 600 | 1.4 | Section labels |

---

## 🔲 Component Specifications

### Cards

**Standard Card:**
```css
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05),
              0 1px 2px rgba(0, 0, 0, 0.1);
  padding: 24px;
  border: 1px solid #f3f4f6;
}
```

**Elevated Card:**
```css
.card-elevated {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05),
              0 10px 20px rgba(0, 0, 0, 0.1);
  padding: 32px;
}
```

**Glass Card:**
```css
.card-glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
}
```

### Buttons

**Primary Button:**
```css
.btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}
```

**Secondary Button:**
```css
.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 500;
}

.btn-secondary:hover {
  background: #e5e7eb;
}
```

**Ghost Button:**
```css
.btn-ghost {
  background: transparent;
  color: #6366f1;
  padding: 12px 24px;
  border-radius: 10px;
}

.btn-ghost:hover {
  background: #eef2ff;
}
```

### Inputs

**Text Input:**
```css
.input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
```

### Badges

**Status Badges:**
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
}

.badge-success {
  background: #dcfce7;
  color: #16a34a;
}

.badge-warning {
  background: #fef3c7;
  color: #d97706;
}

.badge-error {
  background: #fee2e2;
  color: #dc2626;
}

.badge-info {
  background: #dbeafe;
  color: #2563eb;
}
```

---

## 📊 Dashboard Layout Structure

### Grid System
- **Desktop:** 12-column grid
- **Tablet:** 8-column grid
- **Mobile:** 4-column grid

### Dashboard Zones

```
┌─────────────────────────────────────────────────┐
│  TOP BAR (Navigation + User Menu)               │
├──────────┬──────────────────────────────────────┤
│          │  HEADER (Page Title + Actions)       │
│  SIDE    ├──────────────────────────────────────┤
│  NAV     │  KEY METRICS ROW (4-6 cards)         │
│          ├──────────────────────────────────────┤
│          │  MAIN CONTENT AREA                   │
│          │  (Cards, Tables, Graphs)             │
│          │                                       │
│          │                                       │
└──────────┴──────────────────────────────────────┘
```

### Standard Page Layout

```css
.page-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 32px;
}

.page-header {
  margin-bottom: 32px;
}

.metrics-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
}
```

---

## 🎯 User Role Color Coding

| Role | Primary Color | Badge |
|------|--------------|-------|
| Super Admin | #4f46e5 (Indigo) | 🟣 |
| Center Admin | #7c3aed (Purple) | 🟪 |
| Instructor | #0891b2 (Cyan) | 🔵 |
| Student | #059669 (Emerald) | 🟢 |
| Counselor | #d97706 (Amber) | 🟡 |
| Recruiter | #dc2626 (Red) | 🔴 |

---

## 📱 Responsive Breakpoints

```css
/* Mobile First */
--breakpoint-sm: 640px;   /* Small devices */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Laptops */
--breakpoint-xl: 1280px;  /* Desktops */
--breakpoint-2xl: 1536px; /* Large screens */
```

### Sidebar Behavior
- **Desktop (≥1024px):** Fixed sidebar (280px)
- **Tablet (768-1023px):** Collapsible sidebar
- **Mobile (<768px):** Hidden sidebar, hamburger menu

---

## 🎨 Shadow System

```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.25);

/* Glow shadows */
--shadow-primary: 0 4px 14px rgba(99, 102, 241, 0.3);
--shadow-success: 0 4px 14px rgba(34, 197, 94, 0.3);
```

---

## 🔄 Animation Guidelines

### Transitions
```css
--transition-fast: 150ms ease;
--transition-base: 200ms ease;
--transition-slow: 300ms ease;
--transition-slower: 500ms ease;
```

### Easing Functions
```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Animation Patterns
- **Hover:** Scale 1.02, lift shadow
- **Click:** Scale 0.98
- **Page Enter:** Fade in + slide up (20px)
- **Card Enter:** Fade in + scale (0.95 → 1)
- **List Items:** Stagger delay 50ms

---

## 📐 Icon System

**Icon Library:** Lucide React

**Sizes:**
- Small: 16px
- Default: 20px
- Large: 24px
- XL: 32px

**Usage Guidelines:**
- Always paired with text labels in navigation
- Use consistent stroke width (2px)
- Apply appropriate color based on context

---

## 🎯 Data Visualization Colors

### Chart Color Palette
```css
--chart-1: #6366f1;  /* Indigo */
--chart-2: #8b5cf6;  /* Purple */
--chart-3: #06b6d4;  /* Cyan */
--chart-4: #10b981;  /* Emerald */
--chart-5: #f59e0b;  /* Amber */
--chart-6: #ef4444;  /* Red */
--chart-7: #ec4899;  /* Pink */
--chart-8: #64748b;  /* Slate */
```

### Graph Styles
- **Line Charts:** 2px stroke, smooth curves
- **Bar Charts:** 8px border radius
- **Pie Charts:** 2px gap between segments
- **Area Charts:** 40% opacity fill

---

## 📋 Table Design

```css
.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.table-header {
  background: #f9fafb;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
}

.table-row {
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s ease;
}

.table-row:hover {
  background: #f9fafb;
}

.table-cell {
  padding: 16px;
  font-size: 14px;
}
```

---

## 🎨 Empty States

**Illustration Style:**
- Minimal line drawings
- Primary color accent
- Friendly, encouraging tone

**Structure:**
1. Illustration (120x120px)
2. Title (H3)
3. Description (Body)
4. Action Button (if applicable)

---

## 📱 Mobile-Specific Patterns

### Touch Targets
- Minimum 44x44px for interactive elements
- 8px minimum spacing between targets

### Mobile Cards
- Full-width cards
- Swipe actions for common operations
- Bottom sheet for detailed views

### Mobile Navigation
- Bottom tab bar for main sections
- Floating action button for primary action
- Pull-to-refresh on list views

---

## ✅ Accessibility Guidelines

### Color Contrast
- Text: Minimum 4.5:1 ratio
- Large text: Minimum 3:1 ratio
- Interactive elements: Minimum 3:1 ratio

### Focus States
```css
:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}
```

### ARIA Labels
- All interactive elements must have accessible names
- Icons must have aria-label or aria-hidden
- Form fields must have associated labels

---

## 🚀 Performance Guidelines

### Image Optimization
- Use WebP format with fallbacks
- Lazy load images below fold
- Maximum file size: 200KB for hero images

### Component Loading
- Lazy load heavy components (charts, editors)
- Skeleton screens during data fetching
- Virtual scrolling for long lists

---

This design system ensures consistency across all platform modules while maintaining flexibility for future expansion.
