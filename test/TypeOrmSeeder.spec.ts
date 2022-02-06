import * as typeormSeeder from '@airhead/typeorm-seeder';
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
    });

    expect(forSeedersSpy).toHaveBeenCalledTimes(1);
  });

  it('runs provided seeders', async () => {
    const forSeedersSpy = jest.spyOn(typeormSeeder, 'forSeeders');
    const seeders = [UserSeederMock, PostSeederMock];

    await TypeOrmSeeder.run({
      imports: [createTypeOrmTestingModule([])],
      seeders,
    });

    expect(forSeedersSpy.mock.calls[0][0]).toEqual(seeders);
  });
});
