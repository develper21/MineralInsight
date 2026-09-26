import dotenv from 'dotenv';

/**
 * Centralized environment loading. dotenv does NOT override variables that
 * are already set in the real environment — so platform-injected vars
 * (Render dashboard, CI, etc.) always win over file values.
 *
 *  - NODE_ENV=production : .env.production, then .env as fallback
 *  - otherwise           : .env.local, then .env as fallback
 */
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
  dotenv.config();
} else {
  dotenv.config({ path: '.env.local' });
  dotenv.config();
}
