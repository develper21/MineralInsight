import { Knex } from 'knex';

/**
 * Risk assessment seed shaped to match the frontend RiskGauge values:
 * Copper ~58 (Elevated), Lithium ~89 (Critical), Graphite ~72 (Elevated),
 * plus high-risk counts for the summary stat card.
 */
export async function seed(knex: Knex): Promise<void> {
  await knex('risk_assessments').del();

  const minerals = await knex('minerals').select('id', 'name');
  const countries = await knex('countries').select('id', 'name');
  const mineralByName = new Map(minerals.map((m) => [m.name, m]));
  const countryByName = new Map(countries.map((c) => [c.name, c]));

  const assessmentDate = new Date().toISOString().split('T')[0];

  // Per-mineral: [risk_type, score] pairs
  const RISK_MATRIX: Record<string, Array<[string, number]>> = {
    Lithium: [
      ['supply', 89],
      ['price', 78],
      ['geopolitical', 85],
    ],
    Graphite: [
      ['supply', 72],
      ['price', 55],
      ['geopolitical', 65],
    ],
    Copper: [
      ['supply', 58],
      ['price', 62],
      ['geopolitical', 45],
    ],
    Cobalt: [
      ['supply', 92],
      ['price', 74],
      ['geopolitical', 95],
    ],
    'Rare Earth Elements': [
      ['supply', 95],
      ['price', 68],
      ['geopolitical', 90],
    ],
    Nickel: [
      ['supply', 66],
      ['price', 58],
      ['geopolitical', 60],
    ],
    Manganese: [
      ['supply', 42],
      ['price', 38],
      ['geopolitical', 35],
    ],
    Aluminum: [
      ['supply', 36],
      ['price', 44],
      ['geopolitical', 30],
    ],
  };

  const levelFor = (score: number): string =>
    score >= 85 ? 'critical' : score >= 65 ? 'high' : score >= 40 ? 'medium' : 'low';

  const rows: any[] = [];

  for (const [mineralName, factors] of Object.entries(RISK_MATRIX)) {
    const mineral = mineralByName.get(mineralName);
    if (!mineral) continue;

    for (const [riskType, score] of factors) {
      rows.push({
        mineral_id: mineral.id,
        country_id: null,
        risk_type: riskType,
        risk_score: score,
        risk_level: levelFor(score),
        risk_description: `${riskType} risk assessment for ${mineralName} based on import dependency, supply concentration and market volatility`,
        risk_factors: JSON.stringify([
          { name: 'Import Dependency', value: score },
          { name: 'Supply Concentration', value: Math.max(20, score - 10) },
          { name: 'Price Volatility', value: Math.max(15, score - 20) },
        ]),
        mitigation_strategies: JSON.stringify([
          'Diversify supplier base across friendly nations',
          'Build strategic stockpiles',
          'Invest in domestic recycling capacity',
        ]),
        assessment_date: assessmentDate,
        assessed_by: 'MineralInsight Risk Engine',
        source: 'Internal Analytics',
        metadata: JSON.stringify({ mineral: mineralName }),
      });
    }
  }

  // Country-level geopolitical risk rows for top partners
  const COUNTRY_RISK: Array<[string, number]> = [
    ['China', 88],
    ['Democratic Republic of Congo', 85],
    ['Indonesia', 62],
    ['South Africa', 55],
    ['Russia', 90],
    ['Chile', 35],
    ['Australia', 25],
    ['United States', 22],
    ['Japan', 18],
    ['Brazil', 40],
  ];

  for (const [countryName, score] of COUNTRY_RISK) {
    const country = countryByName.get(countryName);
    if (!country) continue;
    rows.push({
      mineral_id: minerals[0].id,
      country_id: country.id,
      risk_type: 'geopolitical',
      risk_score: score,
      risk_level: levelFor(score),
      risk_description: `Geopolitical supply risk assessment for imports from ${countryName}`,
      risk_factors: JSON.stringify([
        { name: 'Governance Stability', value: Math.max(10, 100 - score) },
        { name: 'Trade Relationship', value: Math.max(15, 100 - score - 5) },
        { name: 'Export Control Risk', value: score },
      ]),
      mitigation_strategies: JSON.stringify(['Diversify sourcing', 'Establish bilateral mineral partnerships']),
      assessment_date: assessmentDate,
      assessed_by: 'MineralInsight Risk Engine',
      source: 'Internal Analytics',
      metadata: JSON.stringify({ country: countryName }),
    });
  }

  await knex('risk_assessments').insert(rows);
}
