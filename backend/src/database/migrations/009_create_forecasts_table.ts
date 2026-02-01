import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('forecasts', (table) => {
    table.increments('id').primary();
    table.integer('mineral_id').unsigned().notNullable();
    table.integer('country_id').unsigned().nullable(); // Country-specific forecast
    table.string('forecast_type').notNullable(); // 'price', 'demand', 'supply', 'trade'
    table.string('model_type').notNullable(); // 'linear', 'arima', 'lstm', 'ensemble'
    table.date('forecast_date').notNullable(); // Date for which forecast is made
    table.decimal('forecast_value', 15, 2).notNullable(); // Forecasted value
    table.string('value_unit').nullable(); // Unit of forecasted value
    table.decimal('confidence_lower', 15, 2).nullable(); // Lower bound of confidence interval
    table.decimal('confidence_upper', 15, 2).nullable(); // Upper bound of confidence interval
    table.integer('confidence_level').defaultTo(95); // Confidence level (80, 90, 95)
    table.decimal('accuracy_score', 5, 2).nullable(); // Historical accuracy score
    table.date('created_date').notNullable(); // When forecast was generated
    table.string('created_by').nullable(); // Who created the forecast
    table.json('model_parameters').nullable(); // Model parameters used
    table.json('metadata').nullable(); // Additional metadata
    table.timestamps(true, true);
    
    // Foreign keys
    table.foreign('mineral_id').references('id').inTable('minerals').onDelete('CASCADE');
    table.foreign('country_id').references('id').inTable('countries').onDelete('CASCADE');
    
    // Indexes
    table.index(['mineral_id']);
    table.index(['country_id']);
    table.index(['forecast_type']);
    table.index(['model_type']);
    table.index(['forecast_date']);
    table.index(['created_date']);
    
    // Composite indexes for forecast queries
    table.index(['mineral_id', 'forecast_type', 'forecast_date']);
    table.index(['mineral_id', 'country_id', 'forecast_type', 'forecast_date']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('forecasts');
}
