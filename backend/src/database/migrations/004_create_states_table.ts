import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('states', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('code').nullable(); // State code
    table.integer('country_id').unsigned().notNullable();
    table.decimal('latitude', 10, 8).nullable();
    table.decimal('longitude', 11, 8).nullable();
    table.decimal('area_sq_km', 12, 2).nullable(); // Area in square kilometers
    table.integer('population').nullable();
    table.string('capital').nullable();
    table.json('mineral_resources').nullable(); // Available mineral resources
    table.json('mining_companies').nullable(); // Major mining companies
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    // Foreign key
    table.foreign('country_id').references('id').inTable('countries').onDelete('CASCADE');
    
    // Indexes
    table.index(['name']);
    table.index(['country_id']);
    table.index(['is_active']);
    
    // Unique constraint for state name within country
    table.unique(['name', 'country_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('states');
}
