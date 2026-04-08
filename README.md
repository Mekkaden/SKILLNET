# SKILLNET 🎓


A campus marketplace built for **Muthoot Institute of Technology and Science**.  
Students can buy/sell products and offer services to each other  all within the college community.

---

## What is Skillnet?

Skillnet is a peer to peer campus marketplace where students can:

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
| Database | PostgreSQL |

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


