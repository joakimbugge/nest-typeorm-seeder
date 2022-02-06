import { Entity, SeederConstructor } from '@airhead/typeorm-seeder';
import { DynamicModule } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BetterSqlite3ConnectionOptions } from 'typeorm/driver/better-sqlite3/BetterSqlite3ConnectionOptions';
import { TypeOrmSeederModule, TypeOrmSeederModuleOptions } from '../../src';
import { getInMemoryDatabaseOptions } from './database';

export interface NestTestingModuleOptions {
  module?: Partial<TypeOrmSeederModuleOptions>;
  connection?: Partial<BetterSqlite3ConnectionOptions>;
}

export function createNestTestingModule(
  entities: Entity[],
  seeders: SeederConstructor[],
  options?: NestTestingModuleOptions,
): Promise<TestingModule> {
  return Test.createTestingModule({
    imports: [
      createTypeOrmTestingModule(entities, options?.connection),
      TypeOrmSeederModule.forRoot({ ...options?.module, seeders }),
    ],
  }).compile();
}

export function createTypeOrmTestingModule(
  entities: Entity[],
  options?: NestTestingModuleOptions['connection'],
): DynamicModule {
  return TypeOrmModule.forRoot({
    ...getInMemoryDatabaseOptions(entities),
    ...(options || {}),
  });
}
