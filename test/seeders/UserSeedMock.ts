import { BaseSeeder, Seeder } from '@airhead/typeorm-seeder';

@Seeder()
export class UserSeederMock implements BaseSeeder {
  public seed(): Promise<void> {
    return Promise.resolve();
  }
}
