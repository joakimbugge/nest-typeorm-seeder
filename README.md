<br />
<br />

<div align='center'>
    <img src='https://github.com/joakimbugge/nest-typeorm-seeder/raw/main/assets/logo.png' alt='Logo' />
    <br /><br /><br />
    <a href='https://www.npmjs.com/package/@airhead/nest-typeorm-seeder'>
        <img src='https://img.shields.io/github/v/release/joakimbugge/nest-typeorm-seeder?include_prereleases' alt='Latest release' />
    </a>
    <a href='https://github.com/joakimbugge/nest-typeorm-seeder/blob/main/LICENSE'>
        <img src='https://img.shields.io/github/license/joakimbugge/nest-typeorm-seeder' alt='License' />
    </a>
    <img src="https://img.shields.io/librariesio/release/npm/@airhead/nest-typeorm-seeder" alt='Dependencies'>
</div>

<br />

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

---

<a href="https://www.flaticon.com/free-icons/grow" title="grow icons">Grow icons created by Freepik - Flaticon</a>
