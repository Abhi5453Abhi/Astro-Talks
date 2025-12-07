import { Pool } from 'pg'

// Create a connection pool for efficient database connections
// This works with any PostgreSQL database (Vercel Postgres, Supabase, AWS RDS, etc.)
// Just change DATABASE_URL to migrate to a different host
let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set')
    }

    pool = new Pool({
      connectionString,
      // Connection pool settings
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection cannot be established
      // Neon and most cloud PostgreSQL providers require SSL
      ssl: connectionString.includes('neon.tech') || connectionString.includes('neon') || process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false } 
        : false,
    })

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err)
    })
  }

  return pool
}

// Helper function to execute queries
export async function query(text: string, params?: any[]) {
  const pool = getPool()
  try {
    const res = await pool.query(text, params)
    // Only log queries in development
    if (process.env.NODE_ENV === 'development') {
      const start = Date.now()
      const duration = Date.now() - start
      console.log('Executed query', { text, duration, rows: res.rowCount })
    }
    return res
  } catch (error) {
    console.error('Database query error', { text, error })
    throw error
  }
}

// Helper function to initialize database schema
// Run this once when setting up the database
export async function initializeDatabase() {
  try {
    const fs = require('fs')
    const path = require('path')
    const schemaPath = path.join(process.cwd(), 'lib', 'db-schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    // Execute schema SQL
    await query(schema)
    console.log('Database schema initialized successfully')
  } catch (error) {
    console.error('Error initializing database schema:', error)
    throw error
  }
}

