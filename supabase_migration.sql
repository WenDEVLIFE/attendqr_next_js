-- ============================================================
-- AttendQR: Supabase Migration
-- Run this once in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Function: auto-hash the password column using blowfish crypt
CREATE OR REPLACE FUNCTION hash_password_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Only hash if password is provided and not already a bcrypt hash
  IF NEW.password IS NOT NULL
     AND NEW.password <> ''
     AND LEFT(NEW.password, 4) NOT IN ('$2a$', '$2b$', '$2y$') THEN
    NEW.password := crypt(NEW.password, gen_salt('bf', 12));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach trigger to users table (fires BEFORE INSERT or password UPDATE)
DROP TRIGGER IF EXISTS hash_password ON users;
CREATE TRIGGER hash_password
  BEFORE INSERT OR UPDATE OF password ON users
  FOR EACH ROW EXECUTE FUNCTION hash_password_trigger();

-- 4. 🔑 FIX: Row Level Security (RLS)
-- If your login still says "User not found", it's probably because RLS is turned on.
-- Run these to allow the login screen to find the user:

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- This policy allows anyone (even logged out users) to LOOK UP an account by email.
-- Required for the custom login screen to find the password hash.
DROP POLICY IF EXISTS "Allow public email lookup" ON users;
CREATE POLICY "Allow public email lookup" ON users
  FOR SELECT TO anon
  USING (true);

-- ============================================================
-- Verification query (run after seeding a user):
-- SELECT id, username, email, role, LEFT(password, 7) AS hash_prefix FROM users;
-- Expected: hash_prefix should be "$2a$..." (bcrypt format)
-- ============================================================
