import * as typeormSeeder from '@airhead/typeorm-seeder';
import { SeederConstructor } from '@airhead/typeorm-seeder';
import { TestingModule } from '@nestjs/testing';
import crypto from 'crypto';
import fs from 'fs';
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
    const moduleRef = await createTestingModule([UserSeederMock]);
    expect(moduleRef.get(UserSeederMock)).toBeInstanceOf(UserSeederMock);

    await moduleRef.close();
  });

  it('runs seeders once', async () => {
    const forSeedersSpy = jest.spyOn(typeormSeeder, 'forSeeders');
    const moduleRef = await createTestingModule([UserSeederMock]);

    expect(forSeedersSpy).toHaveBeenCalledTimes(1);

    await moduleRef.close();
  });

  it('runs provided seeders', async () => {
    const forSeedersSpy = jest.spyOn(typeormSeeder, 'forSeeders');

    const seeders = [UserSeederMock, PostSeederMock];
    const moduleRef = await createTestingModule(seeders);

    expect(forSeedersSpy.mock.calls[0][0]).toEqual(seeders);

    await moduleRef.close();
  });

  it('filter migrated seeders', async () => {
    const forSeedersSpy = jest.spyOn(typeormSeeder, 'forSeeders');
    const databasePath = `./test/databases/${crypto.randomUUID()}.sqlite`;
    const options: NestTestingModuleOptions = {
      connection: {
        database: databasePath,
        dropSchema: false,
      },
    };

    const firstModuleRef = await createTestingModule([UserSeederMock], options);
    await firstModuleRef.close();

    const secondModuleRef = await createTestingModule([UserSeederMock, PostSeederMock], options);
    await secondModuleRef.close();

    await fs.rmSync(databasePath, { recursive: true, force: true });

    expect(forSeedersSpy.mock.calls[1][0]).toEqual([PostSeederMock]);
  });
});

async function createTestingModule(
  seeders: SeederConstructor[],
  options?: NestTestingModuleOptions,
): Promise<TestingModule> {
  const moduleRef = await createNestTestingModule([], seeders, options);

  // TestingModule does not run lifecycle events automatically
  await moduleRef.get(TypeOrmSeederModule).onModuleInit();

  return moduleRef;
}
