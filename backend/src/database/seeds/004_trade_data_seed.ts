import { Knex } from 'knex';

/**
 * India critical-minerals trade seed.
 * Values are shaped to match the frontend TradeChart trend:
 * FY2023-24 imports ~$8.01B, exports ~$3.99B.
 * trade_date is spread within each Indian financial year (Apr-Mar).
 */

const YEARS: Array<{ fy: string; startYear: number; importB: number; exportB: number }> = [
  { fy: '2017-18', startYear: 2017, importB: 3.2, exportB: 4.8 },
  { fy: '2018-19', startYear: 2018, importB: 3.5, exportB: 4.6 },
  { fy: '2019-20', startYear: 2019, importB: 3.8, exportB: 4.5 },
  { fy: '2020-21', startYear: 2020, importB: 3.03, exportB: 5.0 },
  { fy: '2021-22', startYear: 2021, importB: 4.2, exportB: 4.8 },
  { fy: '2022-23', startYear: 2022, importB: 5.8, exportB: 4.2 },
  { fy: '2023-24', startYear: 2023, importB: 8.01, exportB: 3.99 },
];

// Distribution of yearly import total across minerals (fractions, sum ~1)
const IMPORT_SHARES: Array<[string, number]> = [
  ['Copper', 0.28],
  ['Lithium', 0.23],
  ['Graphite', 0.11],
  ['Cobalt', 0.12],
  ['Rare Earth Elements', 0.09],
  ['Nickel', 0.09],
  ['Manganese', 0.05],
  ['Aluminum', 0.03],
];

const EXPORT_SHARES: Array<[string, number]> = [
  ['Aluminum', 0.24],
  ['Copper', 0.22],
  ['Manganese', 0.16],
  ['Graphite', 0.12],
  ['Rare Earth Elements', 0.12],
  ['Nickel', 0.08],
  ['Cobalt', 0.04],
  ['Lithium', 0.02],
];

// Import sources and their share of yearly imports
const IMPORT_COUNTRIES: Array<[string, number]> = [
  ['China', 0.42],
  ['Australia', 0.18],
  ['Chile', 0.13],
  ['Indonesia', 0.10],
  ['South Africa', 0.07],
  ['Democratic Republic of Congo', 0.06],
  ['Brazil', 0.04],
];

const EXPORT_COUNTRIES: Array<[string, number]> = [
  ['China', 0.30],
  ['Japan', 0.18],
  ['United States', 0.16],
  ['South Korea', 0.14],
  ['United Arab Emirates', 0.12],
  ['Belgium', 0.10],
];

const QUARTER_WEIGHTS = [0.22, 0.26, 0.25, 0.27]; // spread across the FY

export async function seed(knex: Knex): Promise<void> {
  await knex('trade_data').del();

  const minerals = await knex('minerals').select('id', 'name', 'current_price');
  const countries = await knex('countries').select('id', 'name');
  const mineralByName = new Map(minerals.map((m) => [m.name, m]));
  const countryByName = new Map(countries.map((c) => [c.name, c]));

  const rows: any[] = [];

  for (const year of YEARS) {
    // Quarter start months within the financial year (Apr=3, Jul=6, Oct=9, Jan=0)
    const quarterMonths = [3, 6, 9, 0];

    for (const [type, shares, partnerList, totalB] of [
      ['import', IMPORT_SHARES, IMPORT_COUNTRIES, year.importB] as const,
      ['export', EXPORT_SHARES, EXPORT_COUNTRIES, year.exportB] as const,
    ]) {
      for (const [mineralName, mineralShare] of shares) {
        const mineral = mineralByName.get(mineralName);
        if (!mineral) continue;

        const mineralYearValue = totalB * 1_000_000_000 * mineralShare;

        for (const [countryName, countryShare] of partnerList) {
          const country = countryByName.get(countryName);
          if (!country) continue;

          for (let q = 0; q < 4; q++) {
            const quarterValue = mineralYearValue * countryShare * (QUARTER_WEIGHTS[q] as number);
            const month = quarterMonths[q];
            const tradeYear = q === 3 ? year.startYear + 1 : year.startYear;
            const tradeDate = new Date(Date.UTC(tradeYear, month, 15));

            const price = Number(mineral.current_price) || 1000;
            const quantity = quarterValue / price;

            rows.push({
              mineral_id: mineral.id,
              country_id: country.id,
              trade_type: type,
              quantity: Number(quantity.toFixed(2)),
              quantity_unit: 'metric_tons',
              value_usd: Number(quarterValue.toFixed(2)),
              price_per_unit: price,
              trade_date: tradeDate.toISOString().split('T')[0],
              source: 'DGCI&S',
              metadata: JSON.stringify({ financial_year: year.fy, quarter: `Q${q + 1}` }),
            });
          }
        }
      }
    }
  }

  // Insert in chunks to stay within parameter limits
  const chunkSize = 500;
  for (let i = 0; i < rows.length; i += chunkSize) {
    await knex('trade_data').insert(rows.slice(i, i + chunkSize));
  }
}
