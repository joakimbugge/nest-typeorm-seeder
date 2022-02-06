import { INestApplicationContext, ModuleMetadata } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { merge } from 'lodash';
import { TypeOrmSeederModule, TypeOrmSeederModuleOptions } from './TypeOrmSeederModule';

interface ApplicationOptions extends ModuleMetadata {
  seeders: TypeOrmSeederModuleOptions['seeders'];
  close?: boolean;
  connectionName?: TypeOrmSeederModuleOptions['connectionName'];
  migrator?: TypeOrmSeederModuleOptions['migrator'];
  logger?: TypeOrmSeederModuleOptions['logger'];
}

export class TypeOrmSeeder {
  public static async run(options: ApplicationOptions): Promise<INestApplicationContext> {
    const opts = merge<ApplicationOptions, ApplicationOptions>(
      { seeders: [], close: true },
      options,
    );

    const mod = TypeOrmSeederModule.forRoot(opts);
    const app = await NestFactory.createApplicationContext(mod, { logger: opts.logger });

    if (opts.close) {
      await app.close();
    }

    return app;
  }
}
