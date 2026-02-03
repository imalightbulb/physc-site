# Deployment Guide

## Prerequisites
1. **GitHub Account**: To host the code.
2. **Vercel Account**: For frontend hosting.
3. **Supabase Account**: For backend/database.

## Step 1: Database Setup (Supabase)
1. Create a new project on Supabase.
2. Go to **SQL Editor** -> **New Query**.
3. Copy the contents of `supabase/schema.sql` from this codebase and run it.
4. Go to **Project Settings** -> **API**.
5. Copy `URL` and `anon` public key to a safe place.

## Step 2: Environment Variables
Create a file named `.env.local` in your root directory (if not exists) and add:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
*Note: In Vercel, `NEXT_PUBLIC_SITE_URL` should automatically be set or you can hardcode your production domain.*

## Step 3: Deploy to Vercel
1. Push code to GitHub.
2. Import project in Vercel.
3. In **Environment Variables** section, add the Supabase keys from Step 1.
4. Click **Deploy**.

## Step 4: Auth Configuration
1. In Supabase Dashboard -> **Authentication** -> **URL Configuration**.
2. Add your Vercel production URL (e.g., `https://physc-site.vercel.app`) to "ISite URL" and "Redirect URLs".
