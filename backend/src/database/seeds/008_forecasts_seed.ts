import { Knex } from 'knex';

/**
 * Forecast seed: price/demand/supply forecasts per mineral plus aggregate
 * trade forecasts for FY2024-25 and FY2025-26 used by the frontend chart.
 */
export async function seed(knex: Knex): Promise<void> {
  await knex('forecasts').del();

  const minerals = await knex('minerals').select('id', 'name', 'current_price');
  const india = (await knex('countries').where('name', 'India').first()) as any;

  const rows: any[] = [];
  const now = new Date();
  const createdDate = now.toISOString().split('T')[0];

  // ---- Forward trade forecasts (USD) for the TradeChart ----
  if (india) {
    const copper = minerals.find((m) => m.name === 'Copper');
    const tradeForecast = [
      { date: new Date(Date.UTC(2024, 8, 30)), value: 9_200_000_000 }, // FY2024-25
      { date: new Date(Date.UTC(2025, 8, 30)), value: 10_500_000_000 }, // FY2025-26
    ];
    for (const tf of tradeForecast) {
      rows.push({
        mineral_id: copper ? copper.id : minerals[0].id,
        country_id: india.id,
        forecast_type: 'trade',
        model_type: 'ensemble',
        forecast_date: tf.date.toISOString().split('T')[0],
        forecast_value: tf.value,
        value_unit: 'USD',
        confidence_lower: tf.value * 0.92,
        confidence_upper: tf.value * 1.08,
        confidence_level: 95,
        accuracy_score: 87.5,
        created_date: createdDate,
        created_by: 'MineralInsight Forecast Engine',
        model_parameters: JSON.stringify({ model: 'ensemble-arima-lstm', horizon: '12M' }),
        metadata: JSON.stringify({ scope: 'national-import-total' }),
      });
    }
  }

  // ---- Per-mineral price / demand / supply forecasts (next 12 months) ----
  for (const mineral of minerals) {
    const base = Number(mineral.current_price) || 1000;

    for (let m = 1; m <= 12; m++) {
      const fDate = new Date(now.getFullYear(), now.getMonth() + m, 15);

      // Price forecast: mild upward drift with seasonality
      const priceVal = base * (1 + 0.012 * m + 0.02 * Math.sin(m));
      rows.push({
        mineral_id: mineral.id,
        country_id: india ? india.id : null,
        forecast_type: 'price',
        model_type: 'arima',
        forecast_date: fDate.toISOString().split('T')[0],
        forecast_value: Number(priceVal.toFixed(2)),
        value_unit: 'USD/ton',
        confidence_lower: Number((priceVal * 0.94).toFixed(2)),
        confidence_upper: Number((priceVal * 1.06).toFixed(2)),
        confidence_level: 95,
        accuracy_score: 82.3,
        created_date: createdDate,
        created_by: 'MineralInsight Forecast Engine',
        model_parameters: JSON.stringify({ order: [2, 1, 2], seasonal: 'M' }),
        metadata: JSON.stringify({ mineral: mineral.name }),
      });

      // Demand forecast (index, base 100)
      const demandVal = 100 * (1 + 0.008 * m);
      rows.push({
        mineral_id: mineral.id,
        country_id: india ? india.id : null,
        forecast_type: 'demand',
        model_type: 'lstm',
        forecast_date: fDate.toISOString().split('T')[0],
        forecast_value: Number(demandVal.toFixed(2)),
        value_unit: 'index',
        confidence_lower: Number((demandVal * 0.9).toFixed(2)),
        confidence_upper: Number((demandVal * 1.1).toFixed(2)),
        confidence_level: 90,
        accuracy_score: 79.6,
        created_date: createdDate,
        created_by: 'MineralInsight Forecast Engine',
        model_parameters: JSON.stringify({ layers: [64, 32], window: 24 }),
        metadata: JSON.stringify({ mineral: mineral.name }),
      });

      // Supply forecast (metric tons growth index, base 100)
      const supplyVal = 100 * (1 + 0.005 * m);
      rows.push({
        mineral_id: mineral.id,
        country_id: india ? india.id : null,
        forecast_type: 'supply',
        model_type: 'linear',
        forecast_date: fDate.toISOString().split('T')[0],
        forecast_value: Number(supplyVal.toFixed(2)),
        value_unit: 'index',
        confidence_lower: Number((supplyVal * 0.93).toFixed(2)),
        confidence_upper: Number((supplyVal * 1.07).toFixed(2)),
        confidence_level: 90,
        accuracy_score: 84.1,
        created_date: createdDate,
        created_by: 'MineralInsight Forecast Engine',
        model_parameters: JSON.stringify({ trend: 'linear' }),
        metadata: JSON.stringify({ mineral: mineral.name }),
      });
    }
  }

  const chunkSize = 500;
  for (let i = 0; i < rows.length; i += chunkSize) {
    await knex('forecasts').insert(rows.slice(i, i + chunkSize));
  }
}
