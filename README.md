<div align="center">

<img src="https://img.shields.io/badge/MERN-Stack-00d4aa?style=for-the-badge&logo=mongodb&logoColor=white" />
<img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" />
<img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" />
<img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />

# 🏨 NomadNest — Hotel Management & Booking System

**A production-ready, full-stack MERN hotel booking platform.**
Real-time bed availability · Atomic double-booking prevention · Admin dashboard · Dark/Light mode

[Live Demo](https://book-stay-ai-y8oo.vercel.app/) · [Report Bug](#) · [Request Feature](#)

</div>

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
6. [Environment Variables](#environment-variables)
7. [API Reference](#api-reference)
8. [Database Schema](#database-schema)
9. [User Roles](#user-roles)
10. [Screenshots](#screenshots)
11. [Deployment](#deployment)
12. [Contributing](#contributing)

---

## 🌟 Overview

NomadNest is a **production-grade hostel management and booking system** built for modern backpackers and hostel operators. Guests can search availability, book individual beds in shared dorms or private rooms, and manage their stays — all from a beautiful, mobile-first interface. Staff and Admins get a powerful dashboard with live occupancy tracking and financial analytics.

---

## ✨ Features

### 🎒 For Guests
- **Smart Room Search** — Filter by check-in/check-out dates, guest count, and room type (Dorm vs Private)
- **Real-Time Availability** — Only shows rooms with enough free beds for your dates
- **Bed-Level Booking** — Books specific beds, not just rooms — prevents double-booking
- **Price Breakdown** — Transparent cost with GST calculation before checkout
- **Razorpay Integration Mockup** — Clean, realistic payment screen
- **Booking Management** — View upcoming/past bookings, cancel confirmed stays
- **Booking Confirmation** — Animated success screen with QR code and receipt download

### 🛎️ For Staff & Admin
- **Live Occupancy Grid** — Color-coded bed status (Vacant 🟢, Occupied 🔴, Dirty 🟡, Maintenance ⚫)
- **One-Click Check-in/Out** — Quick guest management from any device
- **Financial Analytics** — Revenue bar chart (6-month), daily revenue, occupancy rate
- **Bookings Table** — Full sortable list of all reservations

### 🎨 Design & UX
- **Dark / Light Mode** — System-aware with localStorage persistence
- **Framer Motion** — Buttery smooth page transitions and micro-animations
- **Mobile-First** — Optimized for backpackers booking on smartphones
- **Inter + Outfit** fonts, warm brand palette, glassmorphism cards

---

## 🛠️ Tech Stack

| Layer         | Technology                                                                                   |
|---------------|----------------------------------------------------------------------------------------------|
| **Frontend**  | React 18 · Vite · Tailwind CSS 3 · Framer Motion · React Router v6 · Recharts              |
| **Backend**   | Node.js 18+ · Express.js 4 · express-async-handler · Helmet · Rate Limiting · Morgan        |
| **Database**  | MongoDB (Mongoose 8) · MongoDB Transactions for atomic bed allocation                        |
| **Auth**      | JWT (jsonwebtoken) · bcryptjs · Role-based access (Guest / Staff / Admin)                   |
| **Security**  | CORS · Helmet.js · express-mongo-sanitize · express-rate-limit                               |
| **Icons**     | Lucide React                                                                                  |
| **State**     | React Context API (AuthContext · ThemeContext · BookingContext)                               |

---

## 📁 Project Structure

```
Hostel/
├── client/                         # ⚛️  React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/             # Navbar, Footer, Loader, Modal
│   │   │   ├── booking/            # RoomCard, SearchBar, BookingCard
│   │   │   └── admin/              # MetricCard, OccupancyGrid, StaffActions
│   │   ├── context/                # AuthContext, ThemeContext, BookingContext
│   │   ├── pages/                  # All route-level page components
│   │   ├── services/               # Axios API service modules
│   │   └── utils/                  # dateUtils, priceCalc
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                         # 🖥️  Node.js + Express Backend
│   ├── config/db.js                # MongoDB connection
│   ├── controllers/                # Business logic (auth, rooms, beds, bookings)
│   ├── middleware/                 # JWT auth guard, error handler
│   ├── models/                     # Mongoose schemas (User, Room, Bed, Booking)
│   ├── routes/                     # Express routers
│   ├── seed/seedData.js            # Database seeder
│   ├── utils/generateToken.js
│   └── server.js                   # Express app entry point
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

```bash
node --version    # >= 18.0.0
npm --version     # >= 9.0.0
mongod --version  # MongoDB >= 6.0 (or use Atlas URI)
```

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-username/nomadnest.git
cd nomadnest
```

---

### Step 2 — Set Up the Backend

```bash
cd server
npm install
```

Copy the environment template and fill in your values:

```bash
cp .env.example .env
```

Open `server/.env` and set at minimum:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/nomadnest
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars
CLIENT_URL=http://localhost:5173
```

> 💡 **Using MongoDB Atlas?** Replace `MONGO_URI` with your Atlas connection string.
> Make sure to whitelist your IP in Atlas Network Access.

---

### Step 3 — Seed the Database

```bash
# Still inside /server
npm run seed
```

This will create:
- 6 sample rooms (dorms + private)
- 28 beds across all rooms
- 3 users (Admin, Staff, Guest)
- 1 sample booking

You'll see credentials printed in the terminal:
```
  Admin:  admin@nomadnest.com  / Admin@1234
  Staff:  staff@nomadnest.com  / Admin@1234
  Guest:  guest@example.com    / Admin@1234
```

---

### Step 4 — Start the Backend Server

```bash
npm run dev
```

The API will be available at `http://localhost:5000`

Verify it's running:
```
GET http://localhost:5000/api/health
→ { "success": true, "message": "NomadNest API is running 🏨" }
```

---

### Step 5 — Set Up the Frontend

Open a **new terminal**:

```bash
cd client
npm install
npm run dev
```

The app will open at `http://localhost:5173`

> The Vite dev server proxies all `/api` requests to `http://localhost:5000` automatically — no CORS configuration needed in development.

---

### Step 6 — Explore the App

| URL                          | Description                         |
|------------------------------|-------------------------------------|
| `http://localhost:5173/`     | Landing page with search            |
| `http://localhost:5173/rooms`| Room listing & availability         |
| `http://localhost:5173/login`| Login page (see demo credentials)   |
| `http://localhost:5173/admin`| Admin dashboard (Admin/Staff only)  |
| `http://localhost:5173/dashboard` | Guest booking history         |

---

## 🔐 Environment Variables

### Server (`server/.env`)

| Variable             | Required | Description                                          |
|----------------------|----------|------------------------------------------------------|
| `NODE_ENV`           | ✅       | `development` or `production`                        |
| `PORT`               | ✅       | Server port (default: 5000)                          |
| `MONGO_URI`          | ✅       | MongoDB connection string                            |
| `JWT_SECRET`         | ✅       | Secret key for JWT signing (min 32 characters)       |
| `JWT_EXPIRE`         | ❌       | Token expiry (default: `7d`)                         |
| `CLIENT_URL`         | ✅       | Frontend URL for CORS (e.g. `http://localhost:5173`) |
| `EMAIL_HOST`         | ❌       | SMTP host for email confirmations                    |
| `EMAIL_PORT`         | ❌       | SMTP port                                            |
| `EMAIL_USER`         | ❌       | SMTP email address                                   |
| `EMAIL_PASS`         | ❌       | SMTP app password                                    |
| `RAZORPAY_KEY_ID`    | ❌       | Razorpay API key (for real payments)                 |
| `RAZORPAY_KEY_SECRET`| ❌       | Razorpay secret                                      |

---

## 📡 API Reference

### Authentication

| Method | Endpoint              | Auth  | Description                  |
|--------|-----------------------|-------|------------------------------|
| POST   | `/api/auth/register`  | None  | Register new guest           |
| POST   | `/api/auth/login`     | None  | Login and get JWT            |
| GET    | `/api/auth/me`        | 🔒    | Get current user profile     |
| PUT    | `/api/auth/me`        | 🔒    | Update profile               |

### Rooms

| Method | Endpoint                    | Auth        | Description                        |
|--------|-----------------------------|-------------|------------------------------------|
| GET    | `/api/rooms`                | None        | Get all rooms (with filters)       |
| GET    | `/api/rooms/availability`   | None        | Check availability for date range  |
| GET    | `/api/rooms/:id`            | None        | Get room + beds by ID              |
| GET    | `/api/rooms/admin/grid`     | 🔒 Staff+   | Get all rooms for admin grid       |
| POST   | `/api/rooms`                | 🔒 Admin    | Create a new room                  |
| PUT    | `/api/rooms/:id`            | 🔒 Admin    | Update room details                |
| DELETE | `/api/rooms/:id`            | 🔒 Admin    | Delete room and its beds           |

### Bookings

| Method | Endpoint                           | Auth        | Description                    |
|--------|------------------------------------|-------------|--------------------------------|
| POST   | `/api/bookings`                    | 🔒 Guest+   | Create booking (atomic)        |
| GET    | `/api/bookings/my`                 | 🔒          | Get own bookings               |
| GET    | `/api/bookings`                    | 🔒 Staff+   | Get all bookings               |
| GET    | `/api/bookings/:id`                | 🔒          | Get single booking             |
| PUT    | `/api/bookings/:id/checkin`        | 🔒 Staff+   | Check guest in                 |
| PUT    | `/api/bookings/:id/checkout`       | 🔒 Staff+   | Check guest out + free beds    |
| PUT    | `/api/bookings/:id/cancel`         | 🔒          | Cancel booking                 |
| PUT    | `/api/bookings/:id/payment`        | 🔒          | Update payment status          |
| GET    | `/api/bookings/admin/analytics`    | 🔒 Staff+   | Revenue and occupancy metrics  |

> **Date overlap query used for availability:**
> `checkInDate < requestedCheckOut AND checkOutDate > requestedCheckIn`

---

## 🗄️ Database Schema

### User
```js
{ name, email, passwordHash, role: ['Guest','Staff','Admin'], phone, avatar, isActive, timestamps }
```

### Room
```js
{ roomNumber, roomType: ['Dorm','Private'], label, totalBeds, pricePerNight,
  amenities[], images[], status: ['Available','Cleaning','Maintenance'], floor, maxGuests, rating }
```

### Bed
```js
{ roomId (ref Room), bedNumber, isOccupied, currentBookingId (ref Booking),
  bedType: ['Bunk-Top','Bunk-Bottom','Single','Double'],
  cleaningStatus: ['Clean','Dirty','In-Progress'] }
// Compound unique index: { roomId, bedNumber }
```

### Booking
```js
{ guestId (ref User), roomId (ref Room), assignedBeds[] (ref Bed),
  checkInDate, checkOutDate, numberOfNights, guestCount, totalPrice,
  paymentStatus: ['Pending','Paid','Refunded','Failed'],
  bookingStatus: ['Confirmed','CheckedIn','CheckedOut','Cancelled','NoShow'],
  bookingReference, paymentId, specialRequests, checkedInAt, checkedOutAt }
```

---

## 👥 User Roles

| Role      | Capabilities                                                             |
|-----------|--------------------------------------------------------------------------|
| **Guest** | Search rooms, create bookings, view own bookings, cancel own bookings    |
| **Staff** | Everything above + check guests in/out, view all bookings, update beds, view dashboard analytics |
| **Admin** | Everything above + create/update/delete rooms, view analytics            |

---

## 🚢 Deployment

### Backend (Railway / Render / EC2)

```bash
# Build is not required for Node.js
# Set environment variables on your platform
# Start command:
node server.js
```

### Frontend (Vercel / Netlify)

```bash
cd client
npm run build
# Upload the /dist folder, or connect your Git repo
```

**Vercel** — In Project Settings → Build & Output:
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variable: `VITE_API_URL=https://your-api.railway.app`

Then update `vite.config.js` proxy target to match your deployed backend URL.

### MongoDB Atlas

1. Create a free M0 cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user
3. Whitelist your server IP
4. Copy the connection string to `MONGO_URI`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

Built with ❤️ for backpackers everywhere

**NomadNest** — Where Every Nomad Finds Home 🏠

</div>
