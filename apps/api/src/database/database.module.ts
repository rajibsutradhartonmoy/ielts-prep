import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';
export const DRIZZLE_PROVIDER = 'DRIZZLE_PROVIDER';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const pool = new Pool({
          host: configService.get<string>('DATABASE_HOST', 'localhost'),
          port: configService.get<number>('DATABASE_PORT', 5432),
          user: configService.get<string>('DATABASE_USER', 'postgres'),
          password: configService.get<string>('DATABASE_PASSWORD', 'postgres'),
          database: configService.get<string>('DATABASE_NAME', 'ielts_prep'),
          max: 20,
          idleTimeoutMillis: 20000,
          connectionTimeoutMillis: 10000,
        });
        return drizzle(pool, { schema });
      },
    },
    {
      provide: DRIZZLE_PROVIDER,
      useExisting: DATABASE_CONNECTION,
    },
  ],
  exports: [DATABASE_CONNECTION, DRIZZLE_PROVIDER],
})
export class DatabaseModule {}

export type Database = NodePgDatabase<typeof schema>;
