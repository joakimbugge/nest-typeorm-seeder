import { forSeeders, SeederConstructor } from '@airhead/typeorm-seeder';
import {
  DynamicModule,
  Inject,
  Logger,
  LoggerService,
  Module,
  ModuleMetadata,
  OnModuleInit,
  Type,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { merge } from 'lodash';
import { DataSource } from 'typeorm';
import { Migrator, MigratorOptions } from './Migrator';

export interface TypeOrmSeederModuleOptions extends ModuleMetadata {
  seeders: SeederConstructor[];
  once?: boolean;
  migrator?: MigratorOptions;
  logger?: LoggerService | false;
  connectionName?: string;
}

const SEEDERS_OPTIONS = 'SEEDERS_OPTIONS';

@Module({})
export class TypeOrmSeederModule implements OnModuleInit {
  private readonly migrator: Migrator;

  constructor(
    @Inject(SEEDERS_OPTIONS) private readonly options: Required<TypeOrmSeederModuleOptions>,
    private readonly moduleRef: ModuleRef,
    private readonly dataSource: DataSource,
  ) {
    this.migrator = new Migrator(this.dataSource, this.options.migrator);
  }

  public static forRoot(options: TypeOrmSeederModuleOptions): DynamicModule {
    const opts = merge<TypeOrmSeederModuleOptions, TypeOrmSeederModuleOptions>(
      {
        seeders: [],
        once: true,
        connectionName: 'default',
        logger: new Logger(TypeOrmSeederModule.name, { timestamp: true }),
      },
      options,
    );

    return {
      module: TypeOrmSeederModule,
      imports: opts.imports,
      exports: opts.exports,
      providers: [
        {
          provide: SEEDERS_OPTIONS,
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
      this.log('No seeding necessary');
      return;
    }

    await forSeeders(seeders).run({
      resolver,
      onEachComplete: async (Seeder) => {
        await this.migrator.upsert(Seeder);
        this.log(`${Seeder.name} completed`);
      },
    });

    this.log('Seeding completed');

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

  private log(message: string): void {
    if (!this.options.logger) {
      return;
    }

    this.options.logger.log(message);
  }
}
