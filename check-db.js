const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

function loadEnv() {
    try {
        const envPath = path.resolve('.env.local');
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, 'utf8');
            envConfig.split('\n').forEach(line => {
                const parts = line.split('=');
                if (parts.length >= 2) {
                    const key = parts[0].trim();
                    const value = parts.slice(1).join('=').trim();
                    if (key && value) {
                        process.env[key] = value;
                    }
                }
            });
        }
    } catch (e) {
        console.error('Error loading .env.local', e);
    }
}

loadEnv();

async function checkDb() {
    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL is not set');
        process.exit(1);
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL.includes('neon') ? { rejectUnauthorized: false } : false,
    });

    try {
        const res = await pool.query('SELECT NOW()');
        console.log('Database connected:', res.rows[0]);

        const tableRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
        console.log('Tables:', tableRes.rows.map(r => r.table_name));

        const usersRes = await pool.query('SELECT count(*) FROM users');
        console.log('User count:', usersRes.rows[0].count);

    } catch (err) {
        console.error('Database error:', err);
    } finally {
        await pool.end();
    }
}

checkDb();
