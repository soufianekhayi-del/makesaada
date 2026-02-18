# Deployment Guide for Tadamon

This guide explains how to deploy your serverless application.

**Architecture:**
*   **Frontend**: React (Vite) → Deployed on **Vercel**
*   **Backend Logic**: Vercel Serverless Functions (for API) & Supabase SDK (in Frontend)
*   **Database**: Postgres → Hosted on **Supabase**

---

## 1. Database & Auth (Supabase)

1.  **Create Project**: Go to [supabase.com](https://supabase.com) and create a new project.
2.  **Run Schema**:
    *   Go to **SQL Editor** in the Supabase Dashboard.
    *   Open `supabase_schema.sql` from this project.
    *   Copy/Paste the content and run it. This creates your tables and security policies.
3.  **Get Credentials**:
    *   Go to **Project Settings** → **API**.
    *   Copy the **Project URL** and **anon public key**.

---

## 2. Frontend & API (Vercel)

1.  **Push to GitHub**: Commit your code and push to a repository.
2.  **Deploy on Vercel**:
    *   Go to [vercel.com](https://vercel.com) and **Add New Project**.
    *   Import your GitHub repository.
3.  **Project Settings**:
    *   **Framework Preset**: Vite
    *   **Root Directory**: `./` (Default)
4.  **Environment Variables**:
    You need to add these in Vercel Project Settings:

    | Variable Name | Value Description |
    | :--- | :--- |
    | `VITE_SUPABASE_URL` | Your Supabase Project URL |
    | `VITE_SUPABASE_ANON_KEY` | Your Supabase `anon` public key |
    | `GEMINI_API_KEY` | (Optional) If you use AI features |

5.  Click **Deploy**.

---

## 3. Verification
Once deployed:
1.  Open your Vercel URL.
2.  Try to **Sign Up** (this tests Supabase Auth).
3.  Try to **Create an Item** (this tests Database RLS).
