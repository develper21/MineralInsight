import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('countries', (table) => {
    table.increments('id').primary();
    table.string('name').unique().notNullable();
    table.string('code_2', 2).unique().notNullable(); // ISO 3166-1 alpha-2
    table.string('code_3', 3).unique().notNullable(); // ISO 3166-1 alpha-3
    table.string('region').nullable(); // 'Asia', 'Europe', 'Africa', etc.
    table.string('subregion').nullable(); // 'South Asia', 'Western Europe', etc.
    table.decimal('latitude', 10, 8).nullable();
    table.decimal('longitude', 11, 8).nullable();
    table.json('trade_partners').nullable(); // Array of major trade partners
    table.json('mineral_resources').nullable(); // Available mineral resources
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    // Indexes
    table.index(['name']);
    table.index(['code_2']);
    table.index(['code_3']);
    table.index(['region']);
    table.index(['is_active']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('countries');
}
