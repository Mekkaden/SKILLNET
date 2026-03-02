// One-time migration: hash all plaintext passwords in the users table
// Run with: node scripts/migrate-passwords.js

require('dotenv').config();
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const SALT_ROUNDS = 10;

async function migratePasswords() {
    console.log('Starting password migration...');

    const selectQuery = 'SELECT user_id, password FROM users;';
    console.log('EXECUTING: ', selectQuery);
    const result = await pool.query(selectQuery);

    if (result.rows.length === 0) {
        console.log('No users found.');
        await pool.end();
        return;
    }

    for (const user of result.rows) {
        const plainPassword = user.password;

        // Skip if already bcrypt-hashed (bcrypt hashes start with $2b$)
        if (plainPassword && plainPassword.startsWith('$2b$')) {
            console.log('User ' + user.user_id + ': already hashed, skipping.');
            continue;
        }

        const hashed = await bcrypt.hash(plainPassword, SALT_ROUNDS);
        const updateQuery = 'UPDATE users SET password = $1 WHERE user_id = $2;';
        console.log('EXECUTING: UPDATE users SET password = [hashed] WHERE user_id = ' + user.user_id);
        await pool.query(updateQuery, [hashed, user.user_id]);
        console.log('User ' + user.user_id + ': password hashed successfully.');
    }

    console.log('Migration complete!');
    await pool.end();
}

migratePasswords().catch(function (err) {
    console.error('Migration failed:', err);
    pool.end();
    process.exit(1);
});
