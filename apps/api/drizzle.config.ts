import type { Config } from 'drizzle-kit';

export default {
  schema: './src/database/schema/*.ts',
  out: './src/database/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ielts_prep',
  },
} satisfies Config;
