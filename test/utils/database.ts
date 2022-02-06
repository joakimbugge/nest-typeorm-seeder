import { Entity } from '@airhead/typeorm-seeder';
import { BetterSqlite3ConnectionOptions } from 'typeorm/driver/better-sqlite3/BetterSqlite3ConnectionOptions';

export function getInMemoryDatabaseOptions(entities: Entity[]): BetterSqlite3ConnectionOptions {
  return {
    type: 'better-sqlite3',
    database: ':memory:',
    entities,
    dropSchema: true,
    synchronize: true,
  };
}
