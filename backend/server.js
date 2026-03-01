require('dotenv').config();
const express = require('express');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

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

//AUTH

async function login(request, response) {
    const email = request.body.email;
    const password = request.body.password;

    if (!email || !password) {
        return response.status(400).json({ error: 'Email and password are required.' });
    }

    const sqlQuery = 'SELECT user_id FROM users WHERE email = $1 AND password = $2;';
    console.log('EXECUTING DB COMMAND: ', sqlQuery);

    try {
        const result = await db.pool.query(sqlQuery, [email, password]);
        if (result.rows.length === 0) {
            return response.status(401).json({ error: 'Invalid email or password.' });
        }
        return response.status(200).json({ userId: result.rows[0].user_id });
    } catch (error) {
        console.error('Login error:', error);
        return response.status(500).json({ error: 'Internal server error.' });
    }
}

//FEED 

async function getFeed(request, response) {
    const sqlQuery = `
    SELECT product_id AS id, title, price, pricing_model, contact, 'PRODUCT' AS type
    FROM products
    UNION
    SELECT service_id AS id, title, price, pricing_model, contact, 'SERVICE' AS type
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

//MY LISTINGS

async function getMyListings(request, response) {
    const userId = request.query.userId;

    if (!userId) {
        return response.status(400).json({ error: 'userId query param is required.' });
    }

    const sqlQuery = `
    SELECT product_id AS id, title, price, pricing_model, contact, 'PRODUCT' AS type
    FROM products
    WHERE user_id = $1
    UNION
    SELECT service_id AS id, title, price, pricing_model, contact, 'SERVICE' AS type
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

//CREATE PRODUCT

async function createProduct(request, response) {
    const title = request.body.title;
    const pricingModel = request.body.pricing_model;
    const contact = request.body.contact;
    const userId = request.body.user_id;

    let price = request.body.price;
    if (pricingModel !== 'PAID') {
        price = 0;
    }

    if (!title || !pricingModel || !userId) {
        return response.status(400).json({ error: 'title, pricing_model, and user_id are required.' });
    }

    const sqlQuery = 'INSERT INTO products (title, price, pricing_model, contact, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *;';
    console.log('EXECUTING DB COMMAND: ', sqlQuery);
    console.log('With values: ', [title, price, pricingModel, contact, userId]);

    try {
        const result = await db.pool.query(sqlQuery, [title, price, pricingModel, contact, userId]);
        return response.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create product error:', error);
        return response.status(500).json({ error: 'Internal server error.' });
    }
}

//CREATE SERVICE
async function createService(request, response) {
    const title = request.body.title;
    const pricingModel = request.body.pricing_model;
    const contact = request.body.contact;
    const userId = request.body.user_id;

    let price = request.body.price;
    if (pricingModel !== 'PAID') {
        price = 0;
    }

    if (!title || !pricingModel || !userId) {
        return response.status(400).json({ error: 'title, pricing_model, and user_id are required.' });
    }

    const sqlQuery = 'INSERT INTO services (title, price, pricing_model, contact, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *;';
    console.log('EXECUTING DB COMMAND: ', sqlQuery);
    console.log('With values: ', [title, price, pricingModel, contact, userId]);

    try {
        const result = await db.pool.query(sqlQuery, [title, price, pricingModel, contact, userId]);
        return response.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create service error:', error);
        return response.status(500).json({ error: 'Internal server error.' });
    }
}

//DELETE LISTING
async function deleteListing(request, response) {
    const id = request.params.id;
    const type = request.params.type;
    const userId = request.query.userId;

    if (!userId) {
        return response.status(400).json({ error: 'userId query param is required.' });
    }

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

//UPDATE LISTING
async function updateListing(request, response) {
    const id = request.params.id;
    const type = request.params.type;

    const title = request.body.title;
    const pricingModel = request.body.pricing_model;
    const contact = request.body.contact;
    const userId = request.body.userId;

    let price = request.body.price;
    if (pricingModel !== 'PAID') {
        price = 0;
    }

    if (!title || !pricingModel || !userId) {
        return response.status(400).json({ error: 'title, pricing_model, and userId are required.' });
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

//ROUTES
app.post('/api/login', login);
app.get('/api/feed', getFeed);
app.get('/api/my-listings', getMyListings);
app.post('/api/products', createProduct);
app.post('/api/services', createService);
app.delete('/api/listings/:type/:id', deleteListing);
app.put('/api/listings/:type/:id', updateListing);

//START
async function startServer() {
    try {
        await db.initializeDatabase();
    } catch (err) {
        console.error('ERROR: Database initialization failed:', err.message);
        console.error('Server will still start, but DB calls will fail.');
    }
    app.listen(PORT, function () {
        console.log('Skillnet server running on port ' + PORT);
    });
}

startServer();
