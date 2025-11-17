# Database Setup Guide

## How to Get DATABASE_URL

### Option 1: Vercel Postgres (Recommended for Vercel Deployments)

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Select your project

2. **Navigate to Storage**
   - Click on the **Storage** tab in your project
   - Or go to: https://vercel.com/dashboard/stores

3. **Create/Select Postgres Database**
   - Click **Create Database** → Select **Postgres**
   - Or select an existing Postgres database

4. **Get Connection String**
   - Click on your Postgres database
   - Go to the **.env.local** tab or **Connection String** section
   - Copy the `POSTGRES_URL` or `DATABASE_URL` value
   - It will look like: `postgres://default:password@host.vercel-storage.com:5432/verceldb`

5. **Add to Environment Variables**
   - In Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add `DATABASE_URL` with the copied value
   - Make sure to add it for **Production**, **Preview**, and **Development** environments

### Option 2: Supabase (Free Tier Available)

1. **Create Supabase Account**
   - Visit https://supabase.com
   - Sign up and create a new project

2. **Get Connection String**
   - Go to Project Settings → Database
   - Find **Connection string** section
   - Copy the **URI** (it includes password)
   - Format: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

3. **Replace Password**
   - Replace `[YOUR-PASSWORD]` with your actual database password
   - You can find/reset password in Project Settings → Database

### Option 3: Railway

1. **Create Railway Account**
   - Visit https://railway.app
   - Sign up and create a new project

2. **Add PostgreSQL**
   - Click **New** → **Database** → **PostgreSQL**
   - Railway will create a PostgreSQL instance

3. **Get Connection String**
   - Click on the PostgreSQL service
   - Go to **Variables** tab
   - Copy the `DATABASE_URL` value

### Option 4: AWS RDS, DigitalOcean, or Other Providers

1. **Create PostgreSQL Database**
   - Follow your provider's documentation to create a PostgreSQL instance

2. **Get Connection String**
   - Format: `postgresql://[USERNAME]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]`
   - Example: `postgresql://myuser:mypassword@db.example.com:5432/mydb`

## Setting Up the Database Schema

After you have the `DATABASE_URL`, you need to create the database tables:

### Method 1: Using SQL File (Recommended)

1. **Connect to your database** using a PostgreSQL client:
   - **pgAdmin** (GUI tool)
   - **psql** (command line)
   - **DBeaver** (free database tool)
   - **Vercel Dashboard** → Storage → Postgres → Query Editor

2. **Run the schema file**:
   - Open `lib/db-schema.sql` in your project
   - Copy all the SQL commands
   - Execute them in your database client

### Method 2: Using Vercel Dashboard

1. Go to Vercel Dashboard → Storage → Your Postgres Database
2. Click on **Query Editor** or **SQL Editor**
3. Copy and paste the contents of `lib/db-schema.sql`
4. Click **Run** or **Execute**

### Method 3: Using psql Command Line

```bash
# Connect to your database
psql "your-database-url-here"

# Or run the schema file directly
psql "your-database-url-here" < lib/db-schema.sql
```

## Local Development Setup

1. **Add to `.env.local` file** (create if it doesn't exist):
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/astro_talks
   ```

2. **For local PostgreSQL**:
   - Install PostgreSQL: https://www.postgresql.org/download/
   - Create a database: `createdb astro_talks`
   - Update `.env.local` with your local connection string

## Verifying the Connection

After setting up:

1. **Check environment variable is set**:
   ```bash
   # In your terminal
   echo $DATABASE_URL
   ```

2. **Test the connection** (optional):
   - The app will automatically try to connect when you use database features
   - Check browser console and server logs for any connection errors

## Troubleshooting

### Error: "DATABASE_URL environment variable is not set"
- Make sure `DATABASE_URL` is added to your `.env.local` (local) or Vercel environment variables (production)
- Restart your development server after adding to `.env.local`

### Error: "Connection refused" or "Cannot connect"
- Verify your database is running and accessible
- Check firewall settings if using cloud database
- Verify the connection string format is correct

### Error: "relation does not exist" or "table does not exist"
- You need to run the schema SQL file to create tables
- See "Setting Up the Database Schema" section above

## Security Notes

- **Never commit** `.env.local` or `.env` files to git
- Keep your `DATABASE_URL` secret
- Use different databases for development and production
- Regularly rotate database passwords

