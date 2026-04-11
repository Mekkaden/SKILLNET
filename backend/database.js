//dotenv is a package to use  env file to get key-value pairs
require('dotenv').config();
//pg is a package to connect to postgresql
const pg = require('pg'); //library
//creates the connection pool
const Pool = pg.Pool;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initializeDatabase() {

  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      user_id  SERIAL PRIMARY KEY,
      name     VARCHAR(255),
      email    VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL
    );
  `;

  const addNameColumnIfMissing = `
    ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
  `;

  const addImageUrlToProducts = `
    ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;
  `;

  const addImageUrlToServices = `
    ALTER TABLE services ADD COLUMN IF NOT EXISTS image_url TEXT;
  `;

  const addDescriptionToProducts = `
    ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;
  `;

  const addDescriptionToServices = `
    ALTER TABLE services ADD COLUMN IF NOT EXISTS description TEXT;
  `;

  const createProductsTable = `
    CREATE TABLE IF NOT EXISTS products (
      product_id    SERIAL PRIMARY KEY,
      title         VARCHAR(255) NOT NULL,
      description   TEXT,
      price         DECIMAL(10, 2) NOT NULL DEFAULT 0,
      pricing_model VARCHAR(50) NOT NULL CHECK (pricing_model IN ('PAID', 'FREE', 'CHAI')),
      contact       VARCHAR(255),
      image_url     TEXT,
      user_id       INTEGER NOT NULL REFERENCES users(user_id)
    );
  `;

  const createServicesTable = `
    CREATE TABLE IF NOT EXISTS services (
      service_id    SERIAL PRIMARY KEY,
      title         VARCHAR(255) NOT NULL,
      description   TEXT,
      price         DECIMAL(10, 2) NOT NULL DEFAULT 0,
      pricing_model VARCHAR(50) NOT NULL CHECK (pricing_model IN ('PAID', 'FREE', 'CHAI')),
      contact       VARCHAR(255),
      image_url     TEXT,
      user_id       INTEGER NOT NULL REFERENCES users(user_id)
    );
  `;

  const insertDummyUser = `
    INSERT INTO users (email, password)
    VALUES ('admin@skillsphere.com', 'password123')
    ON CONFLICT DO NOTHING;
  `;


  //Here we just need the query to execute and finish thats why we aint assigning the result to a variable

  console.log('EXECUTING DB COMMAND: ', createUsersTable);
  await pool.query(createUsersTable);

  console.log('EXECUTING DB COMMAND: ', addNameColumnIfMissing);
  await pool.query(addNameColumnIfMissing);

  console.log('EXECUTING DB COMMAND: ', createProductsTable);
  await pool.query(createProductsTable);

  console.log('EXECUTING DB COMMAND: ', createServicesTable);
  await pool.query(createServicesTable);

  console.log('EXECUTING DB COMMAND: addImageUrlToProducts');
  await pool.query(addImageUrlToProducts);

  console.log('EXECUTING DB COMMAND: addImageUrlToServices');
  await pool.query(addImageUrlToServices);

  console.log('EXECUTING DB COMMAND: addDescriptionToProducts');
  await pool.query(addDescriptionToProducts);

  console.log('EXECUTING DB COMMAND: addDescriptionToServices');
  await pool.query(addDescriptionToServices);

  console.log('EXECUTING DB COMMAND: ', insertDummyUser);
  await pool.query(insertDummyUser);

  console.log('Database initialized successfully.');
}

module.exports = { pool, initializeDatabase };
