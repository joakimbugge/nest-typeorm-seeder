import * as typeormSeeder from '@airhead/typeorm-seeder';
import { Entity, SeederConstructor } from '@airhead/typeorm-seeder';
import { TestingModule } from '@nestjs/testing';
import { TypeOrmSeederModule } from '../src';
import { PostSeederMock } from './seeders/PostSeederMock';
import { UserSeederMock } from './seeders/UserSeedMock';
import { createNestTestingModule, NestTestingModuleOptions } from './utils/modules';

describe(TypeOrmSeederModule.name, () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('sets seeders as providers', async () => {
    const moduleRef = await createTestingModule([], [UserSeederMock]);
    expect(moduleRef.get(UserSeederMock)).toBeInstanceOf(UserSeederMock);

    await moduleRef.close();
  });

  it('runs seeders once', async () => {
    const forSeedersSpy = jest.spyOn(typeormSeeder, 'forSeeders');
    const moduleRef = await createTestingModule([], [UserSeederMock]);

    expect(forSeedersSpy).toHaveBeenCalledTimes(1);

    await moduleRef.close();
  });

  it('runs provided seeders', async () => {
    const forSeedersSpy = jest.spyOn(typeormSeeder, 'forSeeders');

    const seeders = [UserSeederMock, PostSeederMock];
    const moduleRef = await createTestingModule([], seeders);

    expect(forSeedersSpy.mock.calls[0][0]).toEqual(seeders);

    await moduleRef.close();
  });
});

async function createTestingModule(
  entities: Entity[],
  seeders: SeederConstructor[],
  options?: NestTestingModuleOptions,
): Promise<TestingModule> {
  const moduleRef = await createNestTestingModule(entities, seeders, options);

  // TestingModule does not run lifecycle events automatically
  await moduleRef.get(TypeOrmSeederModule).onModuleInit();

  return moduleRef;
}
