import { Knex } from 'knex';

/**
 * Monthly price series seed for the last 24 months for every mineral.
 * Generates a smooth random-walk around each mineral's current price.
 */
export async function seed(knex: Knex): Promise<void> {
  await knex('price_data').del();

  const minerals = await knex('minerals').select('id', 'name', 'current_price');

  const rows: any[] = [];
  const now = new Date();
  const months = 24;

  // Deterministic pseudo-random so seeds are reproducible
  let seedValue = 42;
  const rand = () => {
    seedValue = (seedValue * 9301 + 49297) % 233280;
    return seedValue / 233280;
  };

  for (const mineral of minerals) {
    const basePrice = Number(mineral.current_price) || 1000;
    let price = basePrice * 0.9;
    let prevPrice = price;

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 15);
      const drift = (basePrice - price) * 0.05;
      const noise = (rand() - 0.5) * basePrice * 0.04;
      price = price + drift + noise;

      const changePercent =
        i < months - 1 ? ((price - prevPrice) / prevPrice) * 100 : 0;

      rows.push({
        mineral_id: mineral.id,
        price: Number(price.toFixed(2)),
        price_unit: 'USD/ton',
        price_date: date.toISOString().split('T')[0],
        source: 'LME',
        market: 'Spot',
        volume: Number((Math.floor(rand() * 5000) + 1000).toFixed(2)),
        volume_unit: 'metric_tons',
        change_percent: Number(changePercent.toFixed(4)),
        metadata: JSON.stringify({ mineral: mineral.name }),
      });

      prevPrice = price;
    }
  }

  const chunkSize = 500;
  for (let i = 0; i < rows.length; i += chunkSize) {
    await knex('price_data').insert(rows.slice(i, i + chunkSize));
  }
}
