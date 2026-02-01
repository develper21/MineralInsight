import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('countries').del();

  // Inserts seed entries
  await knex('countries').insert([
    {
      name: 'China',
      code_2: 'CN',
      code_3: 'CHN',
      region: 'Asia',
      subregion: 'Eastern Asia',
      latitude: 35.8617,
      longitude: 104.1954,
      trade_partners: JSON.stringify(['United States', 'European Union', 'Japan', 'South Korea']),
      mineral_resources: JSON.stringify(['Rare Earth Elements', 'Graphite', 'Lithium', 'Copper']),
      is_active: true
    },
    {
      name: 'United States',
      code_2: 'US',
      code_3: 'USA',
      region: 'Americas',
      subregion: 'Northern America',
      latitude: 37.0902,
      longitude: -95.7129,
      trade_partners: JSON.stringify(['China', 'Canada', 'Mexico', 'European Union']),
      mineral_resources: JSON.stringify(['Copper', 'Lithium', 'Rare Earth Elements', 'Nickel']),
      is_active: true
    },
    {
      name: 'India',
      code_2: 'IN',
      code_3: 'IND',
      region: 'Asia',
      subregion: 'Southern Asia',
      latitude: 20.5937,
      longitude: 78.9629,
      trade_partners: JSON.stringify(['China', 'United States', 'United Arab Emirates', 'Saudi Arabia']),
      mineral_resources: JSON.stringify(['Iron Ore', 'Manganese', 'Bauxite', 'Rare Earth Elements']),
      is_active: true
    },
    {
      name: 'Australia',
      code_2: 'AU',
      code_3: 'AUS',
      region: 'Oceania',
      subregion: 'Australia and New Zealand',
      latitude: -25.2744,
      longitude: 133.7751,
      trade_partners: JSON.stringify(['China', 'Japan', 'South Korea', 'India']),
      mineral_resources: JSON.stringify(['Lithium', 'Rare Earth Elements', 'Iron Ore', 'Nickel']),
      is_active: true
    },
    {
      name: 'Brazil',
      code_2: 'BR',
      code_3: 'BRA',
      region: 'Americas',
      subregion: 'South America',
      latitude: -14.2350,
      longitude: -51.9253,
      trade_partners: JSON.stringify(['China', 'United States', 'Argentina', 'European Union']),
      mineral_resources: JSON.stringify(['Iron Ore', 'Niobium', 'Manganese', 'Rare Earth Elements']),
      is_active: true
    },
    {
      name: 'Democratic Republic of Congo',
      code_2: 'CD',
      code_3: 'COD',
      region: 'Africa',
      subregion: 'Middle Africa',
      latitude: -4.0383,
      longitude: 21.7587,
      trade_partners: JSON.stringify(['China', 'Belgium', 'United Arab Emirates', 'South Africa']),
      mineral_resources: JSON.stringify(['Cobalt', 'Copper', 'Diamonds', 'Coltan']),
      is_active: true
    },
    {
      name: 'Chile',
      code_2: 'CL',
      code_3: 'CHL',
      region: 'Americas',
      subregion: 'South America',
      latitude: -35.6751,
      longitude: -71.5430,
      trade_partners: JSON.stringify(['China', 'United States', 'Japan', 'South Korea']),
      mineral_resources: JSON.stringify(['Copper', 'Lithium', 'Silver', 'Molybdenum']),
      is_active: true
    },
    {
      name: 'South Africa',
      code_2: 'ZA',
      code_3: 'ZAF',
      region: 'Africa',
      subregion: 'Southern Africa',
      latitude: -30.5595,
      longitude: 22.9375,
      trade_partners: JSON.stringify(['China', 'European Union', 'United States', 'India']),
      mineral_resources: JSON.stringify(['Platinum', 'Manganese', 'Chromium', 'Gold']),
      is_active: true
    },
    {
      name: 'Canada',
      code_2: 'CA',
      code_3: 'CAN',
      region: 'Americas',
      subregion: 'Northern America',
      latitude: 56.1304,
      longitude: -106.3468,
      trade_partners: JSON.stringify(['United States', 'China', 'European Union', 'Japan']),
      mineral_resources: JSON.stringify(['Nickel', 'Potash', 'Uranium', 'Rare Earth Elements']),
      is_active: true
    },
    {
      name: 'Russia',
      code_2: 'RU',
      code_3: 'RUS',
      region: 'Europe',
      subregion: 'Eastern Europe',
      latitude: 61.5240,
      longitude: 105.3188,
      trade_partners: JSON.stringify(['China', 'European Union', 'Turkey', 'South Korea']),
      mineral_resources: JSON.stringify(['Nickel', 'Palladium', 'Platinum', 'Rare Earth Elements']),
      is_active: true
    }
  ]);
}
