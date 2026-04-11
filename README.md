# SKILLSPHERE 🎓


A campus marketplace built for **Muthoot Institute of Technology and Science**.  
Students can buy/sell products and offer services to each other  all within the college community.

---

## What is SkillSphere?

Skillnet is a peer-to-peer campus marketplace where students can:

- 📦 **List Products** — Sell physical items like textbooks, electronics, or accessories
- 🛠️ **Offer Services** — Offer skills like Linux setup, graphic design, tutoring, or repairs
- 💸 **Flexible Pricing** — Set listings as **Free**, **Chai ☕** (barter), or **Paid (₹)**
- 🔐 **User Accounts** — Login to manage, edit, and delete your own listings
- 📋 **My Listings** — View and manage only your own posts

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router v6 |
| Backend | Node.js + Express |
| Database | PostgreSQL (hosted on Railway) |
| DB Driver | `pg` (node-postgres) — No ORM |
| Auth | Fake auth via `localStorage` |

---

## Database Schema

```
users
  user_id   SERIAL PRIMARY KEY
  email     VARCHAR UNIQUE
  password  VARCHAR

products
  product_id    SERIAL PRIMARY KEY
  title         VARCHAR
  price         DECIMAL
  pricing_model VARCHAR  -- 'PAID' | 'FREE' | 'CHAI'
  contact       VARCHAR
  user_id       FK → users

services
  service_id    SERIAL PRIMARY KEY
  title         VARCHAR
  price         DECIMAL
  pricing_model VARCHAR  -- 'PAID' | 'FREE' | 'CHAI'
  contact       VARCHAR
  user_id       FK → users
```

---

## API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/api/login` | Authenticate user |
| GET | `/api/feed` | Get all listings (UNION of products + services) |
| GET | `/api/my-listings?userId=` | Get listings by user |
| POST | `/api/products` | Create a product listing |
| POST | `/api/services` | Create a service listing |
| PUT | `/api/listings/:type/:id` | Update a listing |
| DELETE | `/api/listings/:type/:id?userId=` | Delete a listing |

---

## Installation & Setup

### Prerequisites
- Node.js v18+
- A PostgreSQL database (Railway recommended)

### 1. Clone the repository
```bash
git clone https://github.com/Mekkaden/SKILLNET.git
cd SKILLNET
```

### 2. Setup the Backend
```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder:
```
DATABASE_URL=your_postgresql_connection_string_here
```

Start the backend server:
```bash
npm start
```

The server will auto-create all tables and seed a test user on first run.

### 3. Setup the Frontend
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

### 4. Test Login Credentials
```
Email:    admin@skillnet.com
Password: password123
```

---

## Project Structure

```
SKILLNET/
├── backend/
│   ├── database.js   # DB connection pool + schema init
│   ├── server.js     # Express API routes
│   └── .env          # Your DATABASE_URL (not committed)
└── frontend/
    └── src/
        ├── App.jsx   # All React components + routing
        ├── main.jsx  # React entry point
        └── index.css # Tailwind import
```

---

## Project Status

| Feature | Status |
|---|---|
| User Login / Logout | ✅ Done |
| Post Products & Services | ✅ Done |
| Live Feed (UNION Query) | ✅ Done |
| Edit Listings | ✅ Done |
| Delete Listings | ✅ Done |
| Real Authentication (JWT/bcrypt) | 🔄 Planned |
| Search & Filter | 🔄 Planned |
| Image Uploads | 🔄 Planned |
| User Registration | 🔄 Planned |

---

## Built for

> DBMS Mini Project — Muthoot Institute of Technology and Science

---

*Made with ☕ by [Mekkaden](https://github.com/Mekkaden)*
