import { Knex } from 'knex';

/**
 * Enriched India state mineral resources seed — covers every state shown on the
 * frontend India map with realistic mineral resource lists, coordinates and
 * mining companies.
 */
export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('states').del();

  // Get country IDs
  const countries = await knex('countries').select('id', 'name');
  const india = countries.find((c) => c.name === 'India');
  const china = countries.find((c) => c.name === 'China');
  const australia = countries.find((c) => c.name === 'Australia');
  const brazil = countries.find((c) => c.name === 'Brazil');
  const usa = countries.find((c) => c.name === 'United States');

  if (!india) {
    throw new Error('India country not found — run countries seed first');
  }

  await knex('states').insert([
    // ============ INDIAN STATES (frontend India map) ============
    {
      name: 'Odisha', code: 'OD', country_id: india.id,
      latitude: 20.9517, longitude: 85.0985, area_sq_km: 155707,
      population: 41974219, capital: 'Bhubaneswar',
      mineral_resources: JSON.stringify(['Iron Ore', 'Coal', 'Bauxite', 'Chromite', 'Manganese', 'Graphite']),
      mining_companies: JSON.stringify(['Tata Steel', 'JSW Steel', 'NMDC', 'Hindalco', 'OMC']),
      is_active: true,
    },
    {
      name: 'Jharkhand', code: 'JH', country_id: india.id,
      latitude: 23.6102, longitude: 85.2799, area_sq_km: 79714,
      population: 32988134, capital: 'Ranchi',
      mineral_resources: JSON.stringify(['Iron Ore', 'Coal', 'Copper', 'Manganese', 'Bauxite', 'Graphite', 'Uranium']),
      mining_companies: JSON.stringify(['Steel Authority of India', 'Tata Steel', 'Coal India', 'Hindustan Copper']),
      is_active: true,
    },
    {
      name: 'Chhattisgarh', code: 'CG', country_id: india.id,
      latitude: 21.2787, longitude: 81.8661, area_sq_km: 135192,
      population: 25545198, capital: 'Raipur',
      mineral_resources: JSON.stringify(['Iron Ore', 'Coal', 'Bauxite', 'Limestone', 'Dolomite', 'Tin']),
      mining_companies: JSON.stringify(['NMDC', 'Steel Authority of India', 'Coal India']),
      is_active: true,
    },
    {
      name: 'Rajasthan', code: 'RJ', country_id: india.id,
      latitude: 27.0238, longitude: 74.2179, area_sq_km: 342239,
      population: 68548437, capital: 'Jaipur',
      mineral_resources: JSON.stringify(['Zinc', 'Lead', 'Copper', 'Gypsum', 'Limestone', 'Rare Earth Elements']),
      mining_companies: JSON.stringify(['Hindustan Zinc', 'RSMML', 'Vedanta']),
      is_active: true,
    },
    {
      name: 'Karnataka', code: 'KA', country_id: india.id,
      latitude: 15.3173, longitude: 75.7139, area_sq_km: 191791,
      population: 61095297, capital: 'Bengaluru',
      mineral_resources: JSON.stringify(['Iron Ore', 'Gold', 'Manganese', 'Bauxite', 'Chromite', 'Lithium']),
      mining_companies: JSON.stringify(['NMDC', 'KIOCL', 'Hutti Gold Mines']),
      is_active: true,
    },
    {
      name: 'Gujarat', code: 'GJ', country_id: india.id,
      latitude: 22.2587, longitude: 71.1924, area_sq_km: 196024,
      population: 60439692, capital: 'Gandhinagar',
      mineral_resources: JSON.stringify(['Limestone', 'Bauxite', 'Lignite', 'Gypsum', 'Silica Sand']),
      mining_companies: JSON.stringify(['Gujarat Mineral Development Corporation', 'Ambuja Cements', 'UltraTech']),
      is_active: true,
    },
    {
      name: 'Madhya Pradesh', code: 'MP', country_id: india.id,
      latitude: 22.9734, longitude: 78.6569, area_sq_km: 308245,
      population: 72626809, capital: 'Bhopal',
      mineral_resources: JSON.stringify(['Coal', 'Limestone', 'Manganese', 'Bauxite', 'Copper', 'Diamond']),
      mining_companies: JSON.stringify(['Coal India', 'Hindustan Copper', 'MP Mining Federation']),
      is_active: true,
    },
    {
      name: 'Andhra Pradesh', code: 'AP', country_id: india.id,
      latitude: 15.9129, longitude: 79.7400, area_sq_km: 162975,
      population: 49386799, capital: 'Amaravati',
      mineral_resources: JSON.stringify(['Barytes', 'Limestone', 'Bauxite', 'Manganese', 'Mica', 'Graphite']),
      mining_companies: JSON.stringify(['NMDC', 'AP Mineral Development Corporation']),
      is_active: true,
    },
    {
      name: 'Maharashtra', code: 'MH', country_id: india.id,
      latitude: 19.7515, longitude: 75.7139, area_sq_km: 307713,
      population: 112374333, capital: 'Mumbai',
      mineral_resources: JSON.stringify(['Coal', 'Iron Ore', 'Bauxite', 'Manganese', 'Limestone']),
      mining_companies: JSON.stringify(['Coal India', 'Lloyd Metals', 'MSMC']),
      is_active: true,
    },
    {
      name: 'Telangana', code: 'TG', country_id: india.id,
      latitude: 17.6868, longitude: 80.8468, area_sq_km: 112077,
      population: 35003674, capital: 'Hyderabad',
      mineral_resources: JSON.stringify(['Coal', 'Limestone', 'Bauxite', 'Manganese']),
      mining_companies: JSON.stringify(['Singareni Collieries', 'Telangana Mineral Development Corp']),
      is_active: true,
    },
    {
      name: 'Tamil Nadu', code: 'TN', country_id: india.id,
      latitude: 11.1271, longitude: 78.6569, area_sq_km: 130058,
      population: 72147030, capital: 'Chennai',
      mineral_resources: JSON.stringify(['Lignite', 'Limestone', 'Graphite', 'Monazite', 'Ilmenite']),
      mining_companies: JSON.stringify(['Neyveli Lignite Corporation', 'Indian Rare Earths']),
      is_active: true,
    },
    {
      name: 'Kerala', code: 'KL', country_id: india.id,
      latitude: 10.8505, longitude: 76.2711, area_sq_km: 38852,
      population: 33406061, capital: 'Thiruvananthapuram',
      mineral_resources: JSON.stringify(['Ilmenite', 'Monazite', 'Rutile', 'Zircon']),
      mining_companies: JSON.stringify(['Indian Rare Earths', 'Kerala Minerals & Metals']),
      is_active: true,
    },
    {
      name: 'Goa', code: 'GA', country_id: india.id,
      latitude: 15.2993, longitude: 74.1240, area_sq_km: 3702,
      population: 1458545, capital: 'Panaji',
      mineral_resources: JSON.stringify(['Iron Ore', 'Bauxite', 'Manganese']),
      mining_companies: JSON.stringify(['Vedanta Sesa Goa', 'Fomento Resources']),
      is_active: true,
    },
    {
      name: 'Himachal Pradesh', code: 'HP', country_id: india.id,
      latitude: 31.1048, longitude: 77.1734, area_sq_km: 55673,
      population: 6864602, capital: 'Shimla',
      mineral_resources: JSON.stringify(['Limestone', 'Salt', 'Barytes', 'Gypsum']),
      mining_companies: JSON.stringify(['HP Mineral Development Corp']),
      is_active: true,
    },
    {
      name: 'Arunachal Pradesh', code: 'AR', country_id: india.id,
      latitude: 28.2180, longitude: 94.7278, area_sq_km: 83743,
      population: 1383727, capital: 'Itanagar',
      mineral_resources: JSON.stringify(['Coal', 'Limestone', 'Graphite', 'Rare Earth Elements']),
      mining_companies: JSON.stringify(['NEC', 'Arunachal Pradesh Mineral Development']),
      is_active: true,
    },
    {
      name: 'West Bengal', code: 'WB', country_id: india.id,
      latitude: 22.9868, longitude: 87.8550, area_sq_km: 88752,
      population: 91276115, capital: 'Kolkata',
      mineral_resources: JSON.stringify(['Coal', 'China Clay', 'Apatite', 'Dolomite']),
      mining_companies: JSON.stringify(['Coal India', 'Eastern Coalfields']),
      is_active: true,
    },
    {
      name: 'Uttar Pradesh', code: 'UP', country_id: india.id,
      latitude: 26.8467, longitude: 80.9462, area_sq_km: 240928,
      population: 199812341, capital: 'Lucknow',
      mineral_resources: JSON.stringify(['Limestone', 'Diaspore', 'Silica Sand', 'Magnetite']),
      mining_companies: JSON.stringify(['UP Mineral Development Corp']),
      is_active: true,
    },
    {
      name: 'Bihar', code: 'BR', country_id: india.id,
      latitude: 25.0961, longitude: 85.3131, area_sq_km: 94163,
      population: 104099452, capital: 'Patna',
      mineral_resources: JSON.stringify(['Pyrite', 'Mica', 'Limestone']),
      mining_companies: JSON.stringify(['Bihar State Mineral Development Corp']),
      is_active: true,
    },
    {
      name: 'Assam', code: 'AS', country_id: india.id,
      latitude: 26.2006, longitude: 92.9376, area_sq_km: 78438,
      population: 31205576, capital: 'Dispur',
      mineral_resources: JSON.stringify(['Coal', 'Limestone', 'Natural Gas', 'Silica Sand']),
      mining_companies: JSON.stringify(['Coal India NEC', 'Oil India']),
      is_active: true,
    },
    {
      name: 'Punjab', code: 'PB', country_id: india.id,
      latitude: 31.1471, longitude: 75.3412, area_sq_km: 50362,
      population: 27743338, capital: 'Chandigarh',
      mineral_resources: JSON.stringify(['Coal', 'Limestone', 'Silica Sand']),
      mining_companies: JSON.stringify(['Punjab State Mineral Development Corp']),
      is_active: true,
    },
    // ============ FOREIGN STATES/PROVINCES ============
    {
      name: 'Inner Mongolia', code: 'NM', country_id: china!.id,
      latitude: 44.2584, longitude: 112.5335, area_sq_km: 1183000,
      population: 24049155, capital: 'Hohhot',
      mineral_resources: JSON.stringify(['Coal', 'Rare Earth Elements', 'Iron Ore', 'Copper']),
      mining_companies: JSON.stringify(['China Northern Rare Earth Group', 'Shenhua Group']),
      is_active: true,
    },
    {
      name: 'Sichuan', code: 'SC', country_id: china!.id,
      latitude: 30.6171, longitude: 104.0648, area_sq_km: 486000,
      population: 83408000, capital: 'Chengdu',
      mineral_resources: JSON.stringify(['Rare Earth Elements', 'Iron Ore', 'Copper', 'Lithium']),
      mining_companies: JSON.stringify(['Sichuan Rare Earth Group', 'Jiangxi Copper']),
      is_active: true,
    },
    {
      name: 'Jiangxi', code: 'JX', country_id: china!.id,
      latitude: 28.6760, longitude: 115.8922, area_sq_km: 166900,
      population: 45188635, capital: 'Nanchang',
      mineral_resources: JSON.stringify(['Rare Earth Elements', 'Copper', 'Tungsten', 'Gold']),
      mining_companies: JSON.stringify(['China Southern Rare Earth Group', 'Jiangxi Copper']),
      is_active: true,
    },
    {
      name: 'Western Australia', code: 'WA', country_id: australia!.id,
      latitude: -27.6728, longitude: 121.6283, area_sq_km: 2529875,
      population: 2667130, capital: 'Perth',
      mineral_resources: JSON.stringify(['Iron Ore', 'Lithium', 'Gold', 'Nickel', 'Rare Earth Elements']),
      mining_companies: JSON.stringify(['BHP', 'Rio Tinto', 'Mineral Resources', 'IGO']),
      is_active: true,
    },
    {
      name: 'Queensland', code: 'QLD', country_id: australia!.id,
      latitude: -22.7449, longitude: 145.9989, area_sq_km: 1851859,
      population: 5184847, capital: 'Brisbane',
      mineral_resources: JSON.stringify(['Coal', 'Lithium', 'Rare Earth Elements', 'Copper']),
      mining_companies: JSON.stringify(['BHP', 'Glencore', 'Newcrest Mining']),
      is_active: true,
    },
    {
      name: 'Minas Gerais', code: 'MG', country_id: brazil!.id,
      latitude: -19.9167, longitude: -43.9345, area_sq_km: 586528,
      population: 21168791, capital: 'Belo Horizonte',
      mineral_resources: JSON.stringify(['Iron Ore', 'Manganese', 'Bauxite', 'Gold', 'Niobium']),
      mining_companies: JSON.stringify(['Vale', 'Anglo American', 'CBMM']),
      is_active: true,
    },
    {
      name: 'Pará', code: 'PA', country_id: brazil!.id,
      latitude: -3.4653, longitude: -48.5477, area_sq_km: 1247954,
      population: 8602865, capital: 'Belém',
      mineral_resources: JSON.stringify(['Iron Ore', 'Bauxite', 'Copper', 'Gold', 'Manganese']),
      mining_companies: JSON.stringify(['Vale', 'Hydro', 'Alcoa']),
      is_active: true,
    },
    {
      name: 'Nevada', code: 'NV', country_id: usa!.id,
      latitude: 39.3310, longitude: -116.6300, area_sq_km: 286380,
      population: 3104614, capital: 'Carson City',
      mineral_resources: JSON.stringify(['Lithium', 'Gold', 'Silver', 'Copper']),
      mining_companies: JSON.stringify(['Lithium Americas', 'Newmont']),
      is_active: true,
    },
  ]);
}
