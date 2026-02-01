import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('states').del();

  // Get country IDs
  const countries = await knex('countries').select('id', 'name');
  const india = countries.find(c => c.name === 'India');
  const china = countries.find(c => c.name === 'China');
  const australia = countries.find(c => c.name === 'Australia');
  const brazil = countries.find(c => c.name === 'Brazil');
  const usa = countries.find(c => c.name === 'United States');

  // Inserts seed entries
  await knex('states').insert([
    // Indian States
    {
      name: 'Jharkhand',
      code: 'JH',
      country_id: india!.id,
      latitude: 23.6102,
      longitude: 85.2799,
      area_sq_km: 79714,
      population: 32988134,
      capital: 'Ranchi',
      mineral_resources: JSON.stringify(['Iron Ore', 'Coal', 'Copper', 'Manganese', 'Bauxite']),
      mining_companies: JSON.stringify(['Steel Authority of India', 'Tata Steel', 'Coal India']),
      is_active: true
    },
    {
      name: 'Chhattisgarh',
      code: 'CG',
      country_id: india!.id,
      latitude: 21.2787,
      longitude: 81.8661,
      area_sq_km: 135192,
      population: 25545198,
      capital: 'Raipur',
      mineral_resources: JSON.stringify(['Iron Ore', 'Coal', 'Bauxite', 'Limestone', 'Dolomite']),
      mining_companies: JSON.stringify(['NMDC', 'Steel Authority of India', 'Coal India']),
      is_active: true
    },
    {
      name: 'Odisha',
      code: 'OD',
      country_id: india!.id,
      latitude: 20.9517,
      longitude: 85.0985,
      area_sq_km: 155707,
      population: 41974219,
      capital: 'Bhubaneswar',
      mineral_resources: JSON.stringify(['Iron Ore', 'Coal', 'Bauxite', 'Chromite', 'Manganese']),
      mining_companies: JSON.stringify(['Tata Steel', 'JSW Steel', 'NMDC', 'Hindalco']),
      is_active: true
    },
    {
      name: 'Karnataka',
      code: 'KA',
      country_id: india!.id,
      latitude: 15.3173,
      longitude: 75.7139,
      area_sq_km: 191791,
      population: 61095297,
      capital: 'Bengaluru',
      mineral_resources: JSON.stringify(['Iron Ore', 'Gold', 'Manganese', 'Bauxite', 'Chromite']),
      mining_companies: JSON.stringify(['NMDC', 'KIOCL', 'Hutti Gold Mines']),
      is_active: true
    },
    {
      name: 'Rajasthan',
      code: 'RJ',
      country_id: india!.id,
      latitude: 27.0238,
      longitude: 74.2179,
      area_sq_km: 342239,
      population: 68548437,
      capital: 'Jaipur',
      mineral_resources: JSON.stringify(['Zinc', 'Lead', 'Copper', 'Gypsum', 'Limestone']),
      mining_companies: JSON.stringify(['Hindustan Zinc', 'RSMML', 'Vedanta']),
      is_active: true
    },
    // Chinese Provinces
    {
      name: 'Inner Mongolia',
      code: 'NM',
      country_id: china!.id,
      latitude: 44.2584,
      longitude: 112.5335,
      area_sq_km: 1183000,
      population: 24049155,
      capital: 'Hohhot',
      mineral_resources: JSON.stringify(['Coal', 'Rare Earth Elements', 'Iron Ore', 'Copper']),
      mining_companies: JSON.stringify(['China Northern Rare Earth Group', 'Shenhua Group']),
      is_active: true
    },
    {
      name: 'Sichuan',
      code: 'SC',
      country_id: china!.id,
      latitude: 30.6171,
      longitude: 104.0648,
      area_sq_km: 486000,
      population: 83408000,
      capital: 'Chengdu',
      mineral_resources: JSON.stringify(['Rare Earth Elements', 'Iron Ore', 'Copper', 'Lithium']),
      mining_companies: JSON.stringify(['Sichuan Rare Earth Group', 'Jiangxi Copper']),
      is_active: true
    },
    {
      name: 'Jiangxi',
      code: 'JX',
      country_id: china!.id,
      latitude: 28.6760,
      longitude: 115.8922,
      area_sq_km: 166900,
      population: 45188635,
      capital: 'Nanchang',
      mineral_resources: JSON.stringify(['Rare Earth Elements', 'Copper', 'Tungsten', 'Gold']),
      mining_companies: JSON.stringify(['China Southern Rare Earth Group', 'Jiangxi Copper']),
      is_active: true
    },
    // Australian States
    {
      name: 'Western Australia',
      code: 'WA',
      country_id: australia!.id,
      latitude: -27.6728,
      longitude: 121.6283,
      area_sq_km: 2529875,
      population: 2667130,
      capital: 'Perth',
      mineral_resources: JSON.stringify(['Iron Ore', 'Lithium', 'Gold', 'Nickel', 'Rare Earth Elements']),
      mining_companies: JSON.stringify(['BHP', 'Rio Tinto', 'Mineral Resources', 'IGO']),
      is_active: true
    },
    {
      name: 'Queensland',
      code: 'QLD',
      country_id: australia!.id,
      latitude: -22.7449,
      longitude: 145.9989,
      area_sq_km: 1851859,
      population: 5184847,
      capital: 'Brisbane',
      mineral_resources: JSON.stringify(['Coal', 'Lithium', 'Rare Earth Elements', 'Copper']),
      mining_companies: JSON.stringify(['BHP', 'Glencore', 'Newcrest Mining']),
      is_active: true
    },
    // Brazilian States
    {
      name: 'Minas Gerais',
      code: 'MG',
      country_id: brazil!.id,
      latitude: -19.9167,
      longitude: -43.9345,
      area_sq_km: 586528,
      population: 21168791,
      capital: 'Belo Horizonte',
      mineral_resources: JSON.stringify(['Iron Ore', 'Manganese', 'Bauxite', 'Gold', 'Niobium']),
      mining_companies: JSON.stringify(['Vale', 'Anglo American', 'CBMM']),
      is_active: true
    },
    {
      name: 'Pará',
      code: 'PA',
      country_id: brazil!.id,
      latitude: -3.4653,
      longitude: -48.5477,
      area_sq_km: 1247954,
      population: 8602865,
      capital: 'Belém',
      mineral_resources: JSON.stringify(['Iron Ore', 'Bauxite', 'Copper', 'Gold', 'Manganese']),
      mining_companies: JSON.stringify(['Vale', 'Hydro', 'Alcoa']),
      is_active: true
    }
  ]);
}
