# Database Setup

This directory contains the database schema and initialization scripts for the Leaves application.

## Prerequisites

1. PostgreSQL database server running
2. Environment variables configured in `.env` file:
   ```
   PGUSER=your_username
   PGHOST=localhost
   PGDATABASE=leaves_db
   PGPASSWORD=your_password
   PGPORT=5432
   JWT_SECRET=your_jwt_secret
   ```

## Setup Instructions

1. Create a PostgreSQL database named `leaves_db` (or update the PGDATABASE environment variable)

2. Run the database initialization script:
   ```bash
   npm run db:init
   ```

   Or manually run:
   ```bash
   node database/init.js
   ```

This will create the `users` table with all necessary indexes and triggers.

## Database Schema

The `users` table includes:
- `id`: Primary key (auto-incrementing)
- `first_name`: User's first name
- `last_name`: User's last name
- `email`: Unique email address
- `password`: Hashed password
- `department`: User's department
- `position`: User's position
- `employee_id`: Unique employee ID
- `created_at`: Timestamp when record was created
- `updated_at`: Timestamp when record was last updated

## Features

- Automatic `updated_at` timestamp updates via database trigger
- Unique constraints on email and employee_id
- Indexes for fast lookups on email and employee_id
- Password hashing using bcryptjs
