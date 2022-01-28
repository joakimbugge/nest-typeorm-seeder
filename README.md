<br>
<br>

<h1 align='center'>
    @airhead/nest-typeorm-seeder
</h1>

<p align='center'>
<img src='https://img.shields.io/github/v/release/joakimbugge/nest-typeorm-seeder?include_prereleases' alt='Latest release' />
<img src='https://img.shields.io/github/license/joakimbugge/nest-typeorm-seeder' alt='License' />
<img src='https://img.shields.io/github/workflow/status/joakimbugge/nest-typeorm-seeder/Verify' alt='Build status' />
</p>

<p align='center'>Seed your <a href='https://nestjs.com/'>Nest</a> with <a href='https://github.com/typeorm/typeorm'>TypeORM</a> application decoratively</p>

<br>
<br>

## Introduction

Seed the database in your Nest application automatically.

Be aware that this package is only the Nest integration. To learn about seeding with TypeORM, check
out [@airhead/typeorm-seeder](https://github.com/joakimbugge/typeorm-seeder).

## Installation

```bash
npm install @airhead/nest-typeorm-seeder
```

## Documentation

Coming soon! In the meantime, submit an [issue](https://github.com/joakimbugge/nest-typeorm-seeder/issues).

## Quick start

### Module

Import `TypeOrmSeederModule` alongside `TypeOrmModule` and provide the seeders.

```ts
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmSeederModule } from '@airhead/nest-typeorm-seeder';

@Module({
  imports: [
    TypeOrmModule.forRoot({ ... }),
    TypeOrmSeederModule.forRoot({
      seeders: [UserSeeder, PostSeeder, CategorySeeder],
    }),
  ],
})
export class AppModule {}
```

### Standalone

Handy to manually trigger seeding. Use `TypeOrmSeeder` instead of `TypeOrmSeederModule`. Import `TypeOrmModule` just
like in your normal Nest application and provide the seeders.

```ts
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmSeeder } from '@airhead/nest-typeorm-seeder';

TypeOrmSeeder.run({
  imports: [TypeOrmModule.forRoot({ ... })],
  seeders: [UserSeeder, PostSeeder, CategorySeeder],
});
```
