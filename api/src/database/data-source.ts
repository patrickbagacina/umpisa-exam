import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { loadConfig } from '../config/configuration';
import { databaseOptions } from './database.config';

// Used by the TypeORM CLI (npm run typeorm -w api -- <command>).
export default new DataSource(databaseOptions(loadConfig().db));
