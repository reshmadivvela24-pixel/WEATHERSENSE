# 🌤️ WEATHER SENSE – Live Weather Forecasting Web Application

> **B.Tech 2nd-Year Student Development Council (SDC) Project**  
> Developed using **React 19**, **Vite**, **React Router DOM v7**, **Open-Meteo Weather API**, and **Browser Local Storage**.  
> Ready for local demonstration and **Vercel Cloud Deployment**.

---

## 📌 1. Project Overview & Faculty Review Summary

**WEATHER SENSE** is a modern, responsive single-page web application (SPA) engineered for students, faculty, and campus administrators. The project addresses the need for fast, clean, and distraction-free weather telemetry, accurate multi-day forecasts, and college administrative oversight.

### Key Highlights
- **100% React + Vite**: Fast bundling, hot module replacement (HMR), and clean component architecture.
- **Dual Module Architecture**:
  1. **User Module** (`/dashboard`, `/forecast`, `/favorites`, `/profile`)
  2. **Admin Module** (`/admin`, `/admin/login`)
- **No Paid APIs or Keys**: Powered entirely by the free, real-time **Open-Meteo Weather & Geocoding REST API**.
- **Browser Local Storage**: Client-side persistence for user registrations, session management, favorite cities, recent search telemetry, and campus advisories.
- **Glassmorphism Dark Navy UI**: Responsive CSS Grid and Flexbox layout tailored for laptop, tablet, and mobile screens.

---

## 🎓 2. Core React Concepts Demonstrated in Project

| React Concept | Implementation in WEATHER SENSE | Relevant Files |
|---|---|---|
| **1. Component Rendering** | Reusable atomic UI components for navigation, weather observation cards, forecasts, auth forms, modals, and telemetry stats. | `Navbar.jsx`, `Sidebar.jsx`, `WeatherCard.jsx`, `ForecastCard.jsx`, `DashboardCards.jsx` |
| **2. State (`useState`)** | Dynamic state for login/signup input fields, search query, active city, live weather data, loading spinners, °C/°F unit toggle, user details modal, and announcement publishing. | `UserDashboard.jsx`, `AdminDashboard.jsx`, `WeatherContext.jsx`, `AuthContext.jsx` |
| **3. Props** | Unidirectional data flow passing temperature units, forecast day telemetry objects, user records, and callback triggers from parent pages to child components. | `ForecastCard.jsx`, `WeatherCard.jsx`, `DashboardCards.jsx` |
| **4. React Router DOM** | Client-side declarative routing, `NavLink` active indicators, programmatic redirects (`useNavigate`), and role-based guards (`ProtectedRoute`). | `App.jsx`, `ProtectedRoute.jsx`, `Navbar.jsx`, `Sidebar.jsx` |
| **5. Context API** | Centralized global state management eliminating prop drilling for user authentication and live weather telemetry. | `AuthContext.jsx`, `WeatherContext.jsx` |
| **6. Local Storage** | Persistent user database, active user sessions, search counters, favorite cities, and campus weather advisories. | `storageService.js` |

---

## 🔐 3. Predefined Accounts & Evaluation Credentials

| Role | Email Address | Password | Accessible Routes |
|---|---|---|---|
| **System Administrator** | `admin@gmail.com` | `admin123` | `/admin`, `/dashboard`, `/forecast`, `/favorites`, `/profile` |
| **Backup Admin Alias** | `admin@weatherapp.com` | `Admin@123` | `/admin`, `/dashboard`, `/forecast`, `/favorites`, `/profile` |
| **Pre-seeded Student** | `aarav@college.edu` | `password123` | `/dashboard`, `/forecast`, `/favorites`, `/profile` |
| **New User Registration** | Register on `/signup` | User's chosen password | Automatically assigned `user` role |

> 🛡️ **Role Escalation Protection**: Public signup strictly creates **Student / User** accounts. Normal users can never select or assign themselves the Administrator role. Furthermore, the master administrator account cannot be deleted from the Admin Dashboard.

---

## 🏗️ 4. Project Modules & Feature Breakdown

### A. Administrator Module
- **Admin Authentication**: Dedicated access at `/admin/login` or via the Admin Portal tab on `/login`.
- **System Metrics & Statistics**: Real-time counter cards for Registered Users, Total Weather Queries, Pinned Cities, and Open-Meteo API Health.
- **User Account Management**:
  - View all registered student accounts in a responsive table.
  - Live search filter by student name or email.
  - **View Details Modal**: Inspect full name, email, user ID, phone, bio, and registration timestamp.
  - **Account Deletion**: Delete student accounts with confirmation (protected against deleting master admin).
- **Recent Search Analytics**: Live stream of city queries executed across all user sessions.
- **Campus Weather Advisories**: Publish, display, and delete weather warning bulletins shown on student dashboards.
- **Admin Logout**: Secure session termination.

### B. User / Student Module
- **Registration & Authentication**: Form validation (email regex, password confirmation $\ge$ 6 characters) and persistent login sessions.
- **Real-time Weather Search**: Search any global city by name with geocoding.
- **Device Geolocation (GPS)**: "My Location" button retrieves coordinates and queries live local weather.
- **Meteorological Telemetry**:
  - Current temperature with **°C / °F Unit Switcher**.
  - WMO standard weather conditions and weather icons.
  - Apparent "Feels-like" temperature.
  - Relative humidity percentage.
  - Wind speed in km/h.
  - Surface atmospheric pressure in hPa.
  - Horizontal visibility in kilometers.
  - Precise sunrise and sunset timings.
- **5-Day Meteorological Forecast**: Projections of daily maximum and minimum temperatures with weather condition badges.
- **Favorite Cities Collection**: Pin favorite cities with the star button; view and launch them anytime from `/favorites` or the sidebar.
- **Recent Searches**: Quick-access pill buttons for previously searched cities.
- **Student Profile Management**: View and edit student name, phone number, and academic major / bio on `/profile`.

---

## 📁 5. Directory Structure

```
WEATHERSENSE/
├── dist/                          # Production-ready build generated by Vite
├── public/                        # Public static assets
├── src/
│   ├── admin/                     # Admin module components
│   ├── components/                # Reusable React components
│   │   ├── DashboardCards.jsx     # Statistic metric cards
│   │   ├── ForecastCard.jsx       # 5-day daily forecast card
│   │   ├── LoginForm.jsx          # Reusable login form with User/Admin tabs
│   │   ├── Navbar.jsx             # Top navigation with role badge & unit switch
│   │   ├── ProtectedRoute.jsx     # Role-based route guard
│   │   ├── Sidebar.jsx            # Desktop glassmorphic sidebar
│   │   ├── SignupForm.jsx         # Registration form with validation
│   │   └── WeatherCard.jsx        # Current weather showcase with full metrics
│   ├── context/                   # Global state providers
│   │   ├── AuthContext.jsx        # User session & authentication state
│   │   └── WeatherContext.jsx     # Live weather, unit toggle & favorites state
│   ├── pages/                     # Application pages
│   │   ├── AdminDashboard.jsx     # Admin control center
│   │   ├── AdminLoginPage.jsx     # Dedicated administrator login page
│   │   ├── FavoritesPage.jsx      # Pinned favorite cities collection
│   │   ├── ForecastPage.jsx       # Detailed 5-day forecast view
│   │   ├── HomePage.jsx           # Landing page with feature presentation
│   │   ├── LoginPage.jsx          # Student login page
│   │   ├── NotFoundPage.jsx       # 404 Route Not Found page
│   │   ├── ProfilePage.jsx        # Student profile view and edit
│   │   ├── SignupPage.jsx         # New student registration page
│   │   └── UserDashboard.jsx      # Main student weather forecasting dashboard
│   ├── services/                  # Business logic & API clients
│   │   ├── storageService.js      # Local Storage CRUD, sessions & analytics
│   │   └── weatherService.js      # Open-Meteo Geocoding & Forecast API client
│   ├── App.jsx                    # Root component with React Router configuration
│   ├── main.jsx                   # React 19 entry point with BrowserRouter
│   └── style.css                  # Comprehensive dark navy glassmorphic CSS
├── index.html                     # Vite entry HTML template with Live Server fallback
├── admin.html                     # Legacy HTML view with quick link to React app
├── user.html                      # Legacy HTML view with quick link to React app
├── package.json                   # Project metadata, dependencies & scripts
├── vercel.json                    # Single Page Application rewrite rules for Vercel
├── vite.config.js                 # Vite bundler configuration
└── README.md                      # Complete project documentation
```

---

## ⚡ 6. How to Run Locally

### Option 1: Development Server (Recommended for Development & Grading)

1. Open the project folder in **VS Code**:
   ```powershell
   cd c:\Users\Reshma\Downloads\WEATHERSENSE
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

### Option 2: Production Build & Local Preview

1. Compile the production bundle:
   ```bash
   npm run build
   ```
2. Preview the built production output:
   ```bash
   npm run preview
   ```
3. Open the displayed local preview URL (typically `http://localhost:4173`).

> 💡 **Notice for VS Code Live Server Users**:  
> Vite projects compile JSX and modern ES modules dynamically. If `index.html` is opened directly via the VS Code "Go Live" (Live Server) button on port 5500, a friendly on-screen banner will guide you to run `npm run dev` or open `dist/index.html`.

---

## 🚀 7. Step-by-Step Vercel Deployment Guide

Deploying WEATHER SENSE on **Vercel** is free and takes under 3 minutes:

### Method A: Deploy via GitHub (Recommended for College Submissions)

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete WEATHER SENSE React + Vite dashboard"
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/weathersense.git
   git push -u origin main
   ```
2. **Import into Vercel**:
   - Go to [vercel.com](https://vercel.com/) and sign in with GitHub.
   - Click **"Add New..."** $\rightarrow$ **"Project"**.
   - Select your `weathersense` repository and click **"Import"**.
3. **Configure Project Settings**:
   - **Framework Preset**: `Vite` (automatically detected).
   - **Root Directory**: `./` (default).
   - **Build Command**: `npm run build` (or `vite build`).
   - **Output Directory**: `dist` (default).
4. **Deploy**:
   - Click **"Deploy"**.
   - Within 30–60 seconds, Vercel will output your live public URL (e.g., `https://weathersense.vercel.app`).
   - The included `vercel.json` ensures client-side routing works on refresh without 404 errors.

### Method B: Deploy Directly via Vercel CLI

1. Install Vercel CLI globally (if not already installed):
   ```bash
   npm install -g vercel
   ```
2. Run the deployment command from the project root:
   ```bash
   vercel
   ```
3. Follow the CLI prompts (accept default settings) to receive your live deployment link.

---

## 🎤 8. Faculty Project Demonstration Script

When presenting to your college faculty or project reviewers, follow this recommended walkthrough:

1. **Introduction (1 minute)**:
   - Introduce project name: **WEATHER SENSE**.
   - Explain the tech stack: React 19, Vite, React Router DOM, Open-Meteo API, Local Storage.
   - State the two modules: **Student/User Module** and **Admin Module**.

2. **Student Weather Flow (2 minutes)**:
   - Navigate to `/` and click **"Launch Weather Dashboard"**.
   - Search for a city (e.g., `Mumbai`, `London`, `Tokyo`). Show real-time temperature, condition icon, humidity, wind speed, pressure, visibility, sunrise, and sunset.
   - Click the **°C / °F toggle** in the navbar to demonstrate instantaneous in-place temperature conversion.
   - Click the **"My Location"** button to demonstrate HTML5 Geolocation API integration.
   - Point out the **5-Day Weather Forecast** cards at the bottom.
   - Click the **star icon** to save a city to favorites, then navigate to `/favorites` to demonstrate state persistence.

3. **Authentication & Session Persistence (1.5 minutes)**:
   - Click **"Logout"**.
   - Go to `/signup` and create a new student account (e.g., `student1@college.edu`).
   - Demonstrate client-side validation (invalid email format, mismatched passwords, password $< 6$ characters).
   - Sign in with the newly created account.
   - Refresh the page to prove session persistence using Browser Local Storage.

4. **Admin Module Flow (2 minutes)**:
   - Log out and go to `/admin/login`.
   - Log in with credentials: `admin@gmail.com` / `admin123`.
   - Showcase the **Admin Control Center**:
     - Metric cards for Registered Users, Total Queries, and API Health.
     - The **Registered Students Table** showing all registered accounts.
     - Click **"Details"** on any user to open the student details modal.
     - Delete a test user account and observe immediate table update.
     - Publish a **Campus Weather Advisory** and verify it appears dynamically on the student dashboard banner.
