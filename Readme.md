# 🌟 Atharv Preschool & Daycare — Management System

A full-stack web application for managing a preschool — admissions, fees, receipts, and a parent portal.

---

## Tech Stack

| Layer    | Technology |
|----------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend  | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth     | JWT |
| Payments | Razorpay |
| PDFs     | PDFKit |
| Email    | Nodemailer |
| SMS      | Fast2SMS |

---

## Features

- **Admin Panel** — manage students, fees, payments, receipts, reports, backups
- **Parent Portal** — view children, fee status, pay online, download receipts
- **Public Website** — home, about, programs, gallery, admission, contact
- **Auto Backups** — daily scheduled DB backup with email notification
- **Fee Alerts** — automated due-fee reminders via email & SMS

---

## Getting Started

### 1. Clone & Install

```bash
git clone <repo-url>
cd atharv-preschool

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Configure Environment

Create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/atharv-preschool
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=xxxx

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password

SCHOOL_NAME=Atharv Preschool & Daycare
SCHOOL_PHONE=+91 98765 43210
FRONTEND_URL=http://localhost:5173
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY=rzp_test_xxxx
```

### 3. Seed Admin User

```bash
cd server
node scripts/seedAdmin.js
```

### 4. Run

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

Open **http://localhost:5173**

---

## Default Login

| Role   | Email                          | Password   |
|--------|-------------------------------|------------|
| Admin  | admin@atharvpreschool.in      | Admin@123  |
| Parent | parent@atharvpreschool.in     | Parent@123 |

> ⚠️ Change passwords after first login.

---

## Project Structure

```
atharv-preschool/
├── client/          # React frontend
│   └── src/
│       ├── pages/   # Admin, Parent, Public pages
│       ├── api/     # Axios API calls
│       └── context/ # Auth context
└── server/          # Express backend
    ├── models/      # Mongoose schemas
    ├── controllers/ # Route handlers
    ├── routes/      # API routes
    ├── services/    # Email, SMS, PDF, Backup
    └── scripts/     # Seed & utility scripts
```

---

## Scripts

```bash
node scripts/seedAdmin.js           # Create admin user
node scripts/seedParent.js          # Create demo parent
node scripts/linkParentToStudents.js # Link parent to students
node scripts/resetAdminPassword.js  # Reset admin password
node scripts/listUsers.js           # List all users
```

---

Built with ❤️ for Atharv Preschool, Pune.