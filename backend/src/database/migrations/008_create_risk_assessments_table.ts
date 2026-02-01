import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('risk_assessments', (table) => {
    table.increments('id').primary();
    table.integer('mineral_id').unsigned().notNullable();
    table.integer('country_id').unsigned().nullable(); // Country-specific risk
    table.string('risk_type').notNullable(); // 'supply', 'price', 'geopolitical', 'environmental'
    table.decimal('risk_score', 5, 2).notNullable(); // Risk score (0-100)
    table.string('risk_level').notNullable(); // 'low', 'medium', 'high', 'critical'
    table.text('risk_description').nullable();
    table.json('risk_factors').nullable(); // Array of risk factors
    table.json('mitigation_strategies').nullable(); // Array of mitigation strategies
    table.date('assessment_date').notNullable();
    table.string('assessed_by').nullable(); // Who assessed the risk
    table.string('source').nullable(); // Data source
    table.json('metadata').nullable(); // Additional metadata
    table.timestamps(true, true);
    
    // Foreign keys
    table.foreign('mineral_id').references('id').inTable('minerals').onDelete('CASCADE');
    table.foreign('country_id').references('id').inTable('countries').onDelete('CASCADE');
    
    // Indexes
    table.index(['mineral_id']);
    table.index(['country_id']);
    table.index(['risk_type']);
    table.index(['risk_level']);
    table.index(['assessment_date']);
    table.index(['source']);
    
    // Composite index for risk queries
    table.index(['mineral_id', 'country_id', 'risk_type', 'assessment_date']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('risk_assessments');
}
