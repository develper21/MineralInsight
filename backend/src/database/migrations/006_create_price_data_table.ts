import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('price_data', (table) => {
    table.increments('id').primary();
    table.integer('mineral_id').unsigned().notNullable();
    table.decimal('price', 12, 2).notNullable(); // Price in USD
    table.string('price_unit').defaultTo('USD/ton');
    table.date('price_date').notNullable();
    table.string('source').nullable(); // Data source
    table.string('market').nullable(); // 'LME', 'COMEX', 'Spot', etc.
    table.decimal('volume', 15, 2).nullable(); // Trading volume
    table.string('volume_unit').defaultTo('metric_tons');
    table.decimal('change_percent', 8, 4).nullable(); // Daily change percentage
    table.json('metadata').nullable(); // Additional metadata
    table.timestamps(true, true);
    
    // Foreign key
    table.foreign('mineral_id').references('id').inTable('minerals').onDelete('CASCADE');
    
    // Indexes
    table.index(['mineral_id']);
    table.index(['price_date']);
    table.index(['source']);
    table.index(['market']);
    
    // Composite index for time series queries
    table.index(['mineral_id', 'price_date']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('price_data');
}
