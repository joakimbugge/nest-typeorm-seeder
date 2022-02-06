import * as typeormSeeder from '@airhead/typeorm-seeder';
import crypto from 'crypto';
import * as fs from 'fs';
import { BetterSqlite3ConnectionOptions } from 'typeorm/driver/better-sqlite3/BetterSqlite3ConnectionOptions';
import { TypeOrmSeeder } from '../src';
import { PostSeederMock } from './seeders/PostSeederMock';
import { UserSeederMock } from './seeders/UserSeedMock';
import { createTypeOrmTestingModule } from './utils/modules';

describe(TypeOrmSeeder.name, () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('runs seeders once', async () => {
    const forSeedersSpy = jest.spyOn(typeormSeeder, 'forSeeders');

    await TypeOrmSeeder.run({
      imports: [createTypeOrmTestingModule([])],
      seeders: [UserSeederMock],
      logger: false,
    });

    expect(forSeedersSpy).toHaveBeenCalledTimes(1);
  });

  it('runs provided seeders', async () => {
    const forSeedersSpy = jest.spyOn(typeormSeeder, 'forSeeders');
    const seeders = [UserSeederMock, PostSeederMock];

    await TypeOrmSeeder.run({
      imports: [createTypeOrmTestingModule([])],
      seeders,
      logger: false,
    });

    expect(forSeedersSpy.mock.calls[0][0]).toEqual(seeders);
  });

  it('filter migrated seeders', async () => {
    const forSeedersSpy = jest.spyOn(typeormSeeder, 'forSeeders');
    const databasePath = `./test/databases/${crypto.randomUUID()}.sqlite`;
    const databaseOptions: Partial<BetterSqlite3ConnectionOptions> = {
      database: databasePath,
      dropSchema: false,
    };

    await TypeOrmSeeder.run({
      imports: [createTypeOrmTestingModule([], databaseOptions)],
      seeders: [UserSeederMock],
      logger: false,
    });

    await TypeOrmSeeder.run({
      imports: [createTypeOrmTestingModule([], databaseOptions)],
      seeders: [UserSeederMock, PostSeederMock],
      logger: false,
    });

    await fs.rmSync(databasePath, { recursive: true, force: true });

    expect(forSeedersSpy.mock.calls[1][0]).toEqual([PostSeederMock]);
  });
});
