import { BaseSeeder, Seeder } from '@airhead/typeorm-seeder';

@Seeder()
export class PostSeederMock implements BaseSeeder {
  public seed(): Promise<void> {
    return Promise.resolve();
  }
}
