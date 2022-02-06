import { SeederConstructor } from '@airhead/typeorm-seeder';
import { merge } from 'lodash';
import {
  Connection,
  InsertResult,
  QueryRunner,
  Table,
  TableColumnOptions,
  UpdateResult,
} from 'typeorm';
import { AbstractSqliteDriver } from 'typeorm/driver/sqlite-abstract/AbstractSqliteDriver';

export interface MigratorOptions {
  tableName?: string;
}

export interface MigratorTableColumn {
  id: number;
  seeder: string;
  updated: number;
}

export class Migrator {
  private readonly options: Required<MigratorOptions>;
  private readonly queryRunner: QueryRunner;

  constructor(private readonly connection: Connection, options?: MigratorOptions) {
    this.queryRunner = this.connection.createQueryRunner();

    this.options = merge<Required<MigratorOptions>, MigratorOptions>(
      { tableName: 'nest_typeorm_seeder' },
      options || {},
    );
  }

  public async start(): Promise<void> {
    const table = new Table({
      name: this.options.tableName,
      columns: getTableColumns(this.connection),
    });

    await this.queryRunner.createTable(table, true);
  }

  public async stop(): Promise<void> {
    await this.queryRunner.release();
  }

  public async upsert(Seeder: SeederConstructor): Promise<InsertResult | UpdateResult> {
    if (await this.get(Seeder)) {
      return this.connection
        .createQueryBuilder()
        .update(this.options.tableName)
        .set(getTableColumnForSeeder(Seeder))
        .where('seeder = :name', { name: Seeder.name })
        .execute();
    }

    return this.insert(Seeder);
  }

  public async filter(seeders: SeederConstructor[]): Promise<SeederConstructor[]> {
    const migratedSeeders = await this.getAll();
    const migratedSeederNames = migratedSeeders.map(({ seeder }) => seeder);

    return seeders.filter((seeder) => !migratedSeederNames.includes(seeder.name));
  }

  private insert(Seeder: SeederConstructor): Promise<InsertResult> {
    return this.connection
      .createQueryBuilder()
      .insert()
      .into(this.options.tableName)
      .values([getTableColumnForSeeder(Seeder)])
      .execute();
  }

  private async get(Seeder: SeederConstructor): Promise<MigratorTableColumn | undefined> {
    return this.connection
      .createQueryBuilder()
      .select('*')
      .from(this.options.tableName, 'migrations')
      .where('migrations.seeder = :name', { name: Seeder.name })
      .getRawOne();
  }

  private getAll(): Promise<MigratorTableColumn[]> {
    return this.connection
      .createQueryBuilder()
      .select('*')
      .from(this.options.tableName, 'migrations')
      .getRawMany();
  }
}

function getTableColumnForSeeder(Seeder: SeederConstructor): Omit<MigratorTableColumn, 'id'> {
  return { seeder: Seeder.name, updated: Date.now() };
}

function getIntegerColumnType(connection: Connection): 'integer' | 'int' {
  return connection.driver instanceof AbstractSqliteDriver ? 'integer' : 'int';
}

function getTableColumns(connection: Connection): TableColumnOptions[] {
  const idColumn: TableColumnOptions = {
    name: 'id',
    type: getIntegerColumnType(connection),
    isPrimary: true,
    generationStrategy: 'increment',
  };

  const seederColumn: TableColumnOptions = {
    name: 'seeder',
    type: 'varchar',
    isNullable: false,
  };

  const updatedColumn: TableColumnOptions = {
    name: 'updated',
    type: 'datetime',
    isNullable: false,
  };

  return [idColumn, seederColumn, updatedColumn];
}
