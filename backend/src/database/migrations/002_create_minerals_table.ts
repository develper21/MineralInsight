import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('minerals', (table) => {
    table.increments('id').primary();
    table.string('name').unique().notNullable();
    table.string('symbol').unique().notNullable();
    table.string('category').notNullable(); // 'critical', 'strategic', 'industrial'
    table.text('description').nullable();
    table.string('color_code').nullable(); // For UI display
    table.decimal('current_price', 12, 2).nullable(); // Current market price
    table.string('price_unit').defaultTo('USD/ton'); // Price unit
    table.decimal('market_cap', 15, 2).nullable(); // Market capitalization
    table.string('primary_use').nullable(); // Primary industrial use
    table.json('applications').nullable(); // Array of applications
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    // Indexes
    table.index(['name']);
    table.index(['symbol']);
    table.index(['category']);
    table.index(['is_active']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('minerals');
}
