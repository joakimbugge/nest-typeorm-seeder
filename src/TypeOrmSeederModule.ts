import { forSeeders, SeederConstructor } from '@airhead/typeorm-seeder';
import {
  DynamicModule,
  Inject,
  Logger,
  Module,
  ModuleMetadata,
  OnModuleInit,
  Type,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { merge } from 'lodash';
import { Connection, getConnectionManager } from 'typeorm';
import { Migrator, MigratorOptions } from './Migrator';

export interface TypeOrmSeederModuleOptions extends ModuleMetadata {
  seeders: SeederConstructor[];
  once?: boolean;
  migrator?: MigratorOptions;
  connectionName?: string;
}

const SEEDER_OPTIONS = 'SEEDERS_OPTIONS';

@Module({})
export class TypeOrmSeederModule implements OnModuleInit {
  private readonly logger = new Logger(TypeOrmSeederModule.name, { timestamp: true });
  private readonly connection: Connection;
  private readonly migrator: Migrator;

  constructor(
    @Inject(SEEDER_OPTIONS) private readonly options: Required<TypeOrmSeederModuleOptions>,
    private readonly moduleRef: ModuleRef,
  ) {
    this.connection = getConnectionManager().get(options.connectionName);
    this.migrator = new Migrator(this.connection, this.options.migrator);
  }

  public static forRoot(options: TypeOrmSeederModuleOptions): DynamicModule {
    const opts = merge<TypeOrmSeederModuleOptions, TypeOrmSeederModuleOptions>(
      { seeders: [], once: true, connectionName: 'default' },
      options,
    );

    return {
      module: TypeOrmSeederModule,
      imports: opts.imports,
      exports: opts.exports,
      providers: [
        {
          provide: SEEDER_OPTIONS,
          useValue: opts,
        },
        ...opts.seeders,
        ...(opts.providers || []),
      ],
    };
  }

  public async onModuleInit(): Promise<void> {
    await this.migrator.start();

    const seeders = await this.getSeeders();
    const resolver = this.getProvider.bind(this);

    if (seeders.length === 0) {
      this.logger.log('No seeding necessary');
      return;
    }

    await forSeeders(seeders).run({
      resolver,
      onEachComplete: async (Seeder) => {
        await this.migrator.upsert(Seeder);
        this.logger.log(`${Seeder.name} completed`);
      },
    });

    this.logger.log('Seeding completed');

    await this.migrator.stop();
  }

  private getProvider<T>(token: string | symbol | Type<T>): T {
    return this.moduleRef.get<T>(token, { strict: false });
  }

  private async getSeeders(): Promise<SeederConstructor[]> {
    const { seeders, once } = this.options;

    if (!once) {
      return seeders;
    }

    return this.migrator.filter(seeders);
  }
}
