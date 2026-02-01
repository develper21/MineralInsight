import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('trade_data', (table) => {
    table.increments('id').primary();
    table.integer('mineral_id').unsigned().notNullable();
    table.integer('country_id').unsigned().notNullable();
    table.enum('trade_type', ['import', 'export']).notNullable();
    table.decimal('quantity', 15, 2).notNullable(); // Quantity in metric tons
    table.string('quantity_unit').defaultTo('metric_tons');
    table.decimal('value_usd', 15, 2).notNullable(); // Value in USD
    table.decimal('price_per_unit', 12, 2).notNullable(); // Price per unit
    table.date('trade_date').notNullable();
    table.string('source').nullable(); // Data source (DGCI&S, etc.)
    table.json('metadata').nullable(); // Additional metadata
    table.timestamps(true, true);
    
    // Foreign keys
    table.foreign('mineral_id').references('id').inTable('minerals').onDelete('CASCADE');
    table.foreign('country_id').references('id').inTable('countries').onDelete('CASCADE');
    
    // Indexes
    table.index(['mineral_id']);
    table.index(['country_id']);
    table.index(['trade_type']);
    table.index(['trade_date']);
    table.index(['source']);
    
    // Composite index for common queries
    table.index(['mineral_id', 'country_id', 'trade_type', 'trade_date']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('trade_data');
}
