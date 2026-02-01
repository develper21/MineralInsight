import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('minerals').del();

  // Inserts seed entries
  await knex('minerals').insert([
    {
      name: 'Lithium',
      symbol: 'LI',
      category: 'critical',
      description: 'Essential for batteries and energy storage systems',
      color_code: '#FF6B6B',
      current_price: 15000.00,
      price_unit: 'USD/ton',
      primary_use: 'Battery manufacturing',
      applications: JSON.stringify([
        'Electric vehicle batteries',
        'Grid storage systems',
        'Consumer electronics',
        'Aerospace applications'
      ]),
      is_active: true
    },
    {
      name: 'Cobalt',
      symbol: 'CO',
      category: 'critical',
      description: 'Critical component in lithium-ion batteries',
      color_code: '#4ECDC4',
      current_price: 75000.00,
      price_unit: 'USD/ton',
      primary_use: 'Battery cathodes',
      applications: JSON.stringify([
        'Electric vehicle batteries',
        'Portable electronics',
        'Superalloys',
        'Catalysts'
      ]),
      is_active: true
    },
    {
      name: 'Rare Earth Elements',
      symbol: 'REE',
      category: 'critical',
      description: 'Group of 17 elements essential for high-tech applications',
      color_code: '#95E77E',
      current_price: 120000.00,
      price_unit: 'USD/ton',
      primary_use: 'Permanent magnets',
      applications: JSON.stringify([
        'Wind turbines',
        'Electric motors',
        'Defense systems',
        'Electronics'
      ]),
      is_active: true
    },
    {
      name: 'Graphite',
      symbol: 'GR',
      category: 'critical',
      description: 'Essential for battery anodes and industrial applications',
      color_code: '#6C5CE7',
      current_price: 1200.00,
      price_unit: 'USD/ton',
      primary_use: 'Battery anodes',
      applications: JSON.stringify([
        'Lithium-ion batteries',
        'Steel production',
        'Lubricants',
        'Pencils'
      ]),
      is_active: true
    },
    {
      name: 'Nickel',
      symbol: 'NI',
      category: 'strategic',
      description: 'Essential for stainless steel and batteries',
      color_code: '#FD79A8',
      current_price: 18000.00,
      price_unit: 'USD/ton',
      primary_use: 'Stainless steel',
      applications: JSON.stringify([
        'Stainless steel production',
        'Electric vehicle batteries',
        'Alloys',
        'Electroplating'
      ]),
      is_active: true
    },
    {
      name: 'Manganese',
      symbol: 'MN',
      category: 'strategic',
      description: 'Critical for steel production and batteries',
      color_code: '#FDCB6E',
      current_price: 1500.00,
      price_unit: 'USD/ton',
      primary_use: 'Steel manufacturing',
      applications: JSON.stringify([
        'Steel production',
        'Battery cathodes',
        'Chemical production',
        'Fertilizers'
      ]),
      is_active: true
    },
    {
      name: 'Copper',
      symbol: 'CU',
      category: 'industrial',
      description: 'Essential for electrical infrastructure and renewable energy',
      color_code: '#E17055',
      current_price: 8500.00,
      price_unit: 'USD/ton',
      primary_use: 'Electrical wiring',
      applications: JSON.stringify([
        'Electrical wiring',
        'Renewable energy systems',
        'Construction',
        'Electronics'
      ]),
      is_active: true
    },
    {
      name: 'Aluminum',
      symbol: 'AL',
      category: 'industrial',
      description: 'Lightweight metal essential for transportation and packaging',
      color_code: '#74B9FF',
      current_price: 2200.00,
      price_unit: 'USD/ton',
      primary_use: 'Transportation',
      applications: JSON.stringify([
        'Automotive industry',
        'Aerospace',
        'Packaging',
        'Construction'
      ]),
      is_active: true
    }
  ]);
}
