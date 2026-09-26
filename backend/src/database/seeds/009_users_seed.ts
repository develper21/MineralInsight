import { Knex } from 'knex';
import bcrypt from 'bcryptjs';

/**
 * Demo users seed for API testing (bcrypt rounds kept at 10 for speed).
 * Password for all demo users: Demo@1234
 */
export async function seed(knex: Knex): Promise<void> {
  await knex('users').del();

  const passwordHash = await bcrypt.hash('Demo@1234', 10);

  await knex('users').insert([
    {
      email: 'admin@mineralinsight.in',
      password: passwordHash,
      name: 'Admin User',
      role: 'admin',
      is_active: true,
      email_verified: true,
      email_verified_at: new Date(),
      preferences: JSON.stringify({ theme: 'dark', defaultView: 'dashboard' }),
    },
    {
      email: 'analyst@mineralinsight.in',
      password: passwordHash,
      name: 'Data Analyst',
      role: 'user',
      is_active: true,
      email_verified: true,
      email_verified_at: new Date(),
      preferences: JSON.stringify({ theme: 'light', defaultView: 'trends' }),
    },
  ]);
}
