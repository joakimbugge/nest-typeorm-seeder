import { DataSource } from 'typeorm';
import { Migrator, MigratorTableColumn } from '../src/Migrator';
import { PostSeederMock } from './seeders/PostSeederMock';
import { UserSeederMock } from './seeders/UserSeedMock';
import { getInMemoryDatabaseOptions } from './utils/database';

describe(Migrator.name, () => {
  let dataSource: DataSource;

  beforeEach(async () => {
    dataSource = await new DataSource(getInMemoryDatabaseOptions([])).initialize();
  });

  afterEach(() => {
    jest.useRealTimers();
    dataSource.destroy();
  });

  describe(Migrator.prototype.start, () => {
    it('creates database table', async () => {
      const migrator = new Migrator(dataSource);
      await migrator.start();

      const query = 'SELECT * FROM nest_typeorm_seeder';
      const result = await dataSource.query(query);

      expect(result).toEqual([]);

      await migrator.stop();
    });

    it('uses provided table name', async () => {
      const migrator = new Migrator(dataSource, { tableName: 'foo' });
      await migrator.start();

      const query = 'SELECT * FROM foo';
      const result = await dataSource.query(query);

      expect(result).toEqual([]);

      await migrator.stop();
    });
  });

  describe(Migrator.prototype.upsert, () => {
    it('inserts new migration', async () => {
      const migrator = new Migrator(dataSource);
      await migrator.start();

      await migrator.upsert(UserSeederMock);

      const query = 'SELECT * FROM nest_typeorm_seeder';
      const [result]: MigratorTableColumn[] = await dataSource.query(query);

      expect(result).toEqual<MigratorTableColumn>({
        id: 1,
        seeder: UserSeederMock.name,
        updated: expect.any(Number),
      });

      await migrator.stop();
    });

    it('updates existing migration', async () => {
      jest.useFakeTimers();

      const DURATION = 1000;
      const QUERY = 'SELECT * FROM nest_typeorm_seeder';

      const migrator = new Migrator(dataSource);
      await migrator.start();

      // Insert for the first time
      await migrator.upsert(UserSeederMock);
      const [inserted]: MigratorTableColumn[] = await dataSource.query(QUERY);

      // Update later
      jest.advanceTimersByTime(DURATION);
      await migrator.upsert(UserSeederMock);
      const [updated]: MigratorTableColumn[] = await dataSource.query(QUERY);

      expect(updated).toEqual({
        id: 1,
        seeder: UserSeederMock.name,
        updated: inserted.updated + DURATION,
      });

      await migrator.stop();
    });
  });

  describe(Migrator.prototype.filter, () => {
    it('returns empty on start', async () => {
      const migrator = new Migrator(dataSource);
      await migrator.start();

      const seeders = await migrator.filter([UserSeederMock]);

      expect(seeders).toEqual([UserSeederMock]);
    });

    it('removed migrated seeders', async () => {
      const migrator = new Migrator(dataSource);
      await migrator.start();
      await migrator.upsert(UserSeederMock);

      const seeders = await migrator.filter([UserSeederMock, PostSeederMock]);

      expect(seeders).toEqual([PostSeederMock]);
    });
  });
});
