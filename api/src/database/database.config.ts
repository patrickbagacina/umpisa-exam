import { join } from 'node:path';
import type { DataSourceOptions } from 'typeorm';
import type { AppConfig } from '../config/configuration';

// Shared by the Nest TypeORM module and the TypeORM CLI data source.
export function databaseOptions(db: AppConfig['db']): DataSourceOptions {
  return {
    type: 'mysql',
    ...db,
    entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
    migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
    migrationsRun: true,
    synchronize: false,
    timezone: 'Z',
  };
}
