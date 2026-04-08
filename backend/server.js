require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./database');
const { requireAuth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

// Manual CORS middleware — works in all environments
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    return next();
});
app.use(express.json());

// ─── AUTH ────────────────────────────────────────────────────────────────────

async function login(request, response) {
    const email = request.body.email;
    const password = request.body.password;

    if (!email || !password) {
        return response.status(400).json({ error: 'Email and password are required.' });
    }

    const sqlQuery = 'SELECT user_id, password FROM users WHERE email = $1;';
    console.log('EXECUTING DB COMMAND: ', sqlQuery);

    try {
        const result = await db.pool.query(sqlQuery, [email]);

        if (result.rows.length === 0) {
            return response.status(401).json({ error: 'Invalid email or password.' });
        }

        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return response.status(401).json({ error: 'Invalid email or password.' });
        }

        const token = jwt.sign(
            { userId: user.user_id },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return response.status(200).json({ token: token });
    } catch (error) {
        console.error('Login error:', error);
        return response.status(500).json({ error: 'Internal server error.' });
    }
}

async function register(request, response) {
    const email = request.body.email;
    const password = request.body.password;
    const name = request.body.name;

    if (!email || !password || !name) {
        return response.status(400).json({ error: 'name, email, and password are required.' });
    }

    const checkQuery = 'SELECT user_id FROM users WHERE email = $1;';
    console.log('EXECUTING DB COMMAND: ', checkQuery);

    try {
        const existing = await db.pool.query(checkQuery, [email]);
        if (existing.rows.length > 0) {
            return response.status(409).json({ error: 'An account with this email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const insertQuery = 'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING user_id;';
        console.log('EXECUTING DB COMMAND: ', insertQuery);

        const result = await db.pool.query(insertQuery, [name, email, hashedPassword]);
        const userId = result.rows[0].user_id;

        const token = jwt.sign(
            { userId: userId },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return response.status(201).json({ token: token });
    } catch (error) {
        console.error('Register error:', error);
        return response.status(500).json({ error: 'Internal server error.' });
    }
}

// ─── FEED (public) ──────────────────────────────────────────────────────────

async function getFeed(request, response) {
    const sqlQuery = `
    SELECT product_id AS id, title, description, price, pricing_model, contact, image_url, 'PRODUCT' AS type
    FROM products
    UNION
    SELECT service_id AS id, title, description, price, pricing_model, contact, image_url, 'SERVICE' AS type
    FROM services
    ORDER BY id DESC;
  `;
    console.log('EXECUTING DB COMMAND: ', sqlQuery);

    try {
        const result = await db.pool.query(sqlQuery);
        return response.status(200).json(result.rows);
    } catch (error) {
        console.error('Feed error:', error);
        return response.status(500).json({ error: 'Internal server error.' });
    }
}

// ─── MY LISTINGS (protected) ─────────────────────────────────────────────────

async function getMyListings(request, response) {
    const userId = request.userId;

    const sqlQuery = `
    SELECT product_id AS id, title, description, price, pricing_model, contact, image_url, 'PRODUCT' AS type
    FROM products
    WHERE user_id = $1
    UNION
    SELECT service_id AS id, title, description, price, pricing_model, contact, image_url, 'SERVICE' AS type
    FROM services
    WHERE user_id = $1
    ORDER BY id DESC;
  `;
    console.log('EXECUTING DB COMMAND: ', sqlQuery);

    try {
        const result = await db.pool.query(sqlQuery, [userId]);
        return response.status(200).json(result.rows);
    } catch (error) {
        console.error('My listings error:', error);
        return response.status(500).json({ error: 'Internal server error.' });
    }
}

// ─── CREATE PRODUCT (protected) ──────────────────────────────────────────────

async function createProduct(request, response) {
    const userId = request.userId;
    const title = request.body.title;
    const pricingModel = request.body.pricing_model;
    const contact = request.body.contact;
    const description = request.body.description || null;
    const imageUrl = request.body.image_url || null;

    let price = request.body.price;
    if (pricingModel !== 'PAID') {
        price = 0;
    }

    if (!title || !pricingModel) {
        return response.status(400).json({ error: 'title and pricing_model are required.' });
    }

    const sqlQuery = 'INSERT INTO products (title, description, price, pricing_model, contact, image_url, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;';
    console.log('EXECUTING DB COMMAND: ', sqlQuery);

    try {
        const result = await db.pool.query(sqlQuery, [title, description, price, pricingModel, contact, imageUrl, userId]);
        return response.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create product error:', error);
        return response.status(500).json({ error: 'Internal server error.' });
    }
}

// ─── CREATE SERVICE (protected) ──────────────────────────────────────────────

async function createService(request, response) {
    const userId = request.userId;
    const title = request.body.title;
    const pricingModel = request.body.pricing_model;
    const contact = request.body.contact;
    const description = request.body.description || null;
    const imageUrl = request.body.image_url || null;

    let price = request.body.price;
    if (pricingModel !== 'PAID') {
        price = 0;
    }

    if (!title || !pricingModel) {
        return response.status(400).json({ error: 'title and pricing_model are required.' });
    }

    const sqlQuery = 'INSERT INTO services (title, description, price, pricing_model, contact, image_url, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;';
    console.log('EXECUTING DB COMMAND: ', sqlQuery);

    try {
        const result = await db.pool.query(sqlQuery, [title, description, price, pricingModel, contact, imageUrl, userId]);
        return response.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create service error:', error);
        return response.status(500).json({ error: 'Internal server error.' });
    }
}

// ─── DELETE LISTING (protected) ───────────────────────────────────────────────

async function deleteListing(request, response) {
    const userId = request.userId; // set by requireAuth middleware
    const id = request.params.id;
    const type = request.params.type;

    let sqlQuery = '';

    if (type === 'PRODUCT') {
        sqlQuery = 'DELETE FROM products WHERE product_id = $1 AND user_id = $2;';
    } else if (type === 'SERVICE') {
        sqlQuery = 'DELETE FROM services WHERE service_id = $1 AND user_id = $2;';
    } else {
        return response.status(400).json({ error: 'Invalid type. Must be PRODUCT or SERVICE.' });
    }

    console.log('EXECUTING DB COMMAND: ', sqlQuery);
    console.log('With values: ', [id, userId]);

    try {
        const result = await db.pool.query(sqlQuery, [id, userId]);
        if (result.rowCount === 0) {
            return response.status(404).json({ error: 'Listing not found or not owned by user.' });
        }
        return response.status(200).json({ message: 'Listing deleted successfully.' });
    } catch (error) {
        console.error('Delete listing error:', error);
        return response.status(500).json({ error: 'Internal server error.' });
    }
}

// ─── UPDATE LISTING (protected) ───────────────────────────────────────────────

async function updateListing(request, response) {
    const userId = request.userId; // set by requireAuth middleware
    const id = request.params.id;
    const type = request.params.type;

    const title = request.body.title;
    const pricingModel = request.body.pricing_model;
    const contact = request.body.contact;

    let price = request.body.price;
    if (pricingModel !== 'PAID') {
        price = 0;
    }

    if (!title || !pricingModel) {
        return response.status(400).json({ error: 'title and pricing_model are required.' });
    }

    let sqlQuery = '';

    if (type === 'PRODUCT') {
        sqlQuery = 'UPDATE products SET title = $1, price = $2, pricing_model = $3, contact = $4 WHERE product_id = $5 AND user_id = $6 RETURNING *;';
    } else if (type === 'SERVICE') {
        sqlQuery = 'UPDATE services SET title = $1, price = $2, pricing_model = $3, contact = $4 WHERE service_id = $5 AND user_id = $6 RETURNING *;';
    } else {
        return response.status(400).json({ error: 'Invalid type. Must be PRODUCT or SERVICE.' });
    }

    console.log('EXECUTING DB COMMAND: ', sqlQuery);
    console.log('With values: ', [title, price, pricingModel, contact, id, userId]);

    try {
        const result = await db.pool.query(sqlQuery, [title, price, pricingModel, contact, id, userId]);
        if (result.rowCount === 0) {
            return response.status(404).json({ error: 'Listing not found or not owned by user.' });
        }
        return response.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Update listing error:', error);
        return response.status(500).json({ error: 'Internal server error.' });
    }
}

// ─── ROUTES ───────────────────────────────────────────────────────────────────

app.post('/api/register', register);
app.post('/api/login', login);
app.get('/api/feed', getFeed);
app.get('/api/my-listings', requireAuth, getMyListings);
app.post('/api/products', requireAuth, createProduct);
app.post('/api/services', requireAuth, createService);
app.delete('/api/listings/:type/:id', requireAuth, deleteListing);
app.put('/api/listings/:type/:id', requireAuth, updateListing);

// ─── START ────────────────────────────────────────────────────────────────────

async function startServer() {
    try {
        await db.initializeDatabase();
    } catch (err) {
        console.error('ERROR: Database initialization failed:', err.message);
        console.error('Server will still start, but DB calls will fail.');
    }
    const server = app.listen(PORT, function () {
        console.log('Skillnet server running on port ' + PORT);
    });
    server.on('error', function (err) {
        if (err.code === 'EADDRINUSE') {
            console.error('ERROR: Port ' + PORT + ' is already in use. Kill the old process and restart.');
        } else {
            console.error('Server error:', err);
        }
        process.exit(1);
    });
}

process.on('uncaughtException', function (err) {
    console.error('Uncaught exception (server kept alive):', err);
});

startServer();
