import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('production_data', (table) => {
    table.increments('id').primary();
    table.integer('mineral_id').unsigned().notNullable();
    table.integer('state_id').unsigned().nullable(); // State-level production
    table.integer('country_id').unsigned().notNullable(); // Country-level production
    table.decimal('quantity', 15, 2).notNullable(); // Production quantity
    table.string('quantity_unit').defaultTo('metric_tons');
    table.date('production_date').notNullable();
    table.string('period_type').defaultTo('monthly'); // 'daily', 'monthly', 'quarterly', 'yearly'
    table.decimal('grade', 8, 4).nullable(); // Mineral grade/purity
    table.string('mine_name').nullable(); // Mine name if applicable
    table.string('company').nullable(); // Producing company
    table.string('source').nullable(); // Data source
    table.json('metadata').nullable(); // Additional metadata
    table.timestamps(true, true);
    
    // Foreign keys
    table.foreign('mineral_id').references('id').inTable('minerals').onDelete('CASCADE');
    table.foreign('state_id').references('id').inTable('states').onDelete('CASCADE');
    table.foreign('country_id').references('id').inTable('countries').onDelete('CASCADE');
    
    // Indexes
    table.index(['mineral_id']);
    table.index(['state_id']);
    table.index(['country_id']);
    table.index(['production_date']);
    table.index(['period_type']);
    table.index(['source']);
    
    // Composite indexes for common queries
    table.index(['mineral_id', 'country_id', 'production_date']);
    table.index(['mineral_id', 'state_id', 'production_date']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('production_data');
}
