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

async function runMigration() {
    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL is not set');
        process.exit(1);
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL.includes('neon') ? { rejectUnauthorized: false } : false,
    });

    try {
        console.log('Running migration...');

        // Read the SQL file
        const sqlPath = path.join(__dirname, 'migrations', '001_create_astrologers_table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await pool.query(sql);
        console.log('Migration successful: astrologers table created and seeded.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

runMigration();
