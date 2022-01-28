import { SeederConstructor } from '@airhead/typeorm-seeder';
import { INestApplicationContext, ModuleMetadata } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { merge } from 'lodash';
import { MigratorOptions } from './Migrator';
import { TypeOrmSeederModule } from './TypeOrmSeederModule';

interface ApplicationOptions extends ModuleMetadata {
  seeders: SeederConstructor[];
  close?: boolean;
  connectionName?: string;
  migrator?: MigratorOptions;
}

export class TypeOrmSeeder {
  public static async run(options: ApplicationOptions): Promise<INestApplicationContext> {
    const opts = merge<ApplicationOptions, ApplicationOptions>(
      { seeders: [], close: true },
      options,
    );

    const mod = TypeOrmSeederModule.forRoot(opts);
    const app = await NestFactory.createApplicationContext(mod);

    if (opts.close) {
      await app.close();
    }

    return app;
  }
}
