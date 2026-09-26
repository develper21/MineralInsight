import { Knex } from 'knex';

/**
 * State-wise production seed. Uses each state's mineral_resources list so the
 * India map and state pages show realistic production quantities.
 */
export async function seed(knex: Knex): Promise<void> {
  await knex('production_data').del();

  const minerals = await knex('minerals').select('id', 'name');
  const countries = await knex('countries').select('id', 'name');
  const states = await knex('states')
    .join('countries', 'states.country_id', 'countries.id')
    .select('states.*', 'countries.name as country_name');

  const mineralByName = new Map(minerals.map((m) => [m.name, m]));
  const india = countries.find((c) => c.name === 'India');

  // Base annual production (metric tons) per mineral for India overall
  const INDIA_BASE_TONNES: Record<string, number> = {
    'Iron Ore': 250000000,
    Coal: 800000000,
    Copper: 4300000,
    Lithium: 5000,
    Graphite: 25000,
    Cobalt: 500,
    'Rare Earth Elements': 3000,
    Nickel: 2000,
    Manganese: 2800000,
    Aluminum: 2100000,
    Bauxite: 22000000,
    Zinc: 750000,
    Lead: 450000,
    Gold: 2500,
    Chromite: 4000000,
    Limestone: 350000000,
    'Diamond': 30000,
  };

  const rows: any[] = [];
  const now = new Date();
  const productionYear = now.getFullYear() - 1;

  for (const state of states) {
    // pg auto-parses json columns — handle both arrays and raw strings
    let resources: string[] = [];
    const rawResources = state.mineral_resources;
    if (Array.isArray(rawResources)) {
      resources = rawResources;
    } else if (typeof rawResources === 'string') {
      try {
        const parsed = JSON.parse(rawResources);
        resources = Array.isArray(parsed) ? parsed : [];
      } catch {
        resources = [];
      }
    }

    for (const resourceName of resources) {
      // Try exact match first, then partial match (e.g. 'Rare Earth Elements')
      let mineral =
        mineralByName.get(resourceName) ||
        minerals.find(
          (m) =>
            resourceName.toLowerCase().includes(m.name.toLowerCase()) ||
            m.name.toLowerCase().includes(resourceName.toLowerCase().split(' ')[0])
        );

      // Only track minerals that exist in our minerals table
      if (!mineral) continue;

      const isIndia = state.country_name === 'India';
      const baseT = INDIA_BASE_TONNES[resourceName] || 100000;

      // Indian states split national production; foreign states get their own scale
      const stateShare = isIndia ? 0.05 + ((state.id % 7) / 20) : 0.15 + ((state.id % 5) / 10);
      const annualQty = isIndia ? baseT * stateShare : baseT * 2 * stateShare;

      // One row per quarter for the last production year
      for (let q = 0; q < 4; q++) {
        const month = [3, 6, 9, 0][q];
        const year = q === 3 ? productionYear + 1 : productionYear;
        rows.push({
          mineral_id: mineral.id,
          state_id: state.id,
          country_id: state.country_id,
          quantity: Number((annualQty / 4).toFixed(2)),
          quantity_unit: 'metric_tons',
          production_date: new Date(Date.UTC(year, month, 15)).toISOString().split('T')[0],
          period_type: 'quarterly',
          source: 'IBM (Indian Bureau of Mines)',
          metadata: JSON.stringify({
            state: state.name,
            country: state.country_name,
            resource: resourceName,
          }),
        });
      }
    }
  }

  // Country-level aggregate rows for India (state_id null) so country queries work
  if (india) {
    for (const [resourceName, baseT] of Object.entries(INDIA_BASE_TONNES)) {
      const mineral = mineralByName.get(resourceName);
      if (!mineral) continue;
      for (let q = 0; q < 4; q++) {
        const month = [3, 6, 9, 0][q];
        const year = q === 3 ? productionYear + 1 : productionYear;
        rows.push({
          mineral_id: mineral.id,
          state_id: null,
          country_id: india.id,
          quantity: Number((baseT / 4).toFixed(2)),
          quantity_unit: 'metric_tons',
          production_date: new Date(Date.UTC(year, month, 15)).toISOString().split('T')[0],
          period_type: 'quarterly',
          source: 'IBM (Indian Bureau of Mines)',
          metadata: JSON.stringify({ country: 'India', resource: resourceName }),
        });
      }
    }
  }

  const chunkSize = 500;
  for (let i = 0; i < rows.length; i += chunkSize) {
    await knex('production_data').insert(rows.slice(i, i + chunkSize));
  }
}
