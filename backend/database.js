//dotenv is a package to use  env file to get key-value pairs
require('dotenv').config();
//pg is a package to connect to postgresql
const pg = require('pg'); //library
//creates the connection pool
const Pool = pg.Pool;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function initializeDatabase() {

  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      user_id  SERIAL PRIMARY KEY,
      email    VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL
    );
  `;

  const createProductsTable = `
    CREATE TABLE IF NOT EXISTS products (
      product_id    SERIAL PRIMARY KEY,
      title         VARCHAR(255) NOT NULL,
      price         DECIMAL(10, 2) NOT NULL DEFAULT 0,
      pricing_model VARCHAR(50) NOT NULL CHECK (pricing_model IN ('PAID', 'FREE', 'CHAI')),
      contact       VARCHAR(255),
      user_id       INTEGER NOT NULL REFERENCES users(user_id)
    );
  `;

  const createServicesTable = `
    CREATE TABLE IF NOT EXISTS services (
      service_id    SERIAL PRIMARY KEY,
      title         VARCHAR(255) NOT NULL,
      price         DECIMAL(10, 2) NOT NULL DEFAULT 0,
      pricing_model VARCHAR(50) NOT NULL CHECK (pricing_model IN ('PAID', 'FREE', 'CHAI')),
      contact       VARCHAR(255),
      user_id       INTEGER NOT NULL REFERENCES users(user_id)
    );
  `;

  const insertDummyUser = `
    INSERT INTO users (email, password)
    VALUES ('admin@skillnet.com', 'password123')
    ON CONFLICT DO NOTHING; 
    -- ON CONFLICT DO NOTHING; means if the user already exists, do nothing
  `;


  //Here we just need the query to execute and finish thats why we aint assigning the result to a variable

  console.log('EXECUTING DB COMMAND: ', createUsersTable);
  await pool.query(createUsersTable);

  console.log('EXECUTING DB COMMAND: ', createProductsTable);
  await pool.query(createProductsTable);

  console.log('EXECUTING DB COMMAND: ', createServicesTable);
  await pool.query(createServicesTable);

  console.log('EXECUTING DB COMMAND: ', insertDummyUser);
  await pool.query(insertDummyUser);

  console.log('Database initialized successfully.');
}

module.exports = { pool, initializeDatabase };
