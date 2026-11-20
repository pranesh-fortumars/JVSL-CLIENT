export type Season = 'all_year' | 'winter' | 'summer' | 'monsoon';

export interface SeasonalProduce {
  id: string;
  name: string;
  vernacularName?: string;
  category: 'vegetable' | 'fruit' | 'milk';
  season: Season;
  seasonLabel: string;
  availableMonths: string;
  unit: string;
  allowedUnits: string[];
  pricePerKg?: number;
  pricePerUnit?: number;
  imageUrl: string;
  nutritionalNotes?: string;
  medicalAdvisory?: string;
  benefits?: string[];
}

export const SEASONAL_CATALOGUE: SeasonalProduce[] = [
  // 1. All Year (બારેમાસ - 12 Months)
  {
    id: 'potato',
    name: 'Potato - Aloo',
    vernacularName: 'બટાકા / બટાટો',
    category: 'vegetable',
    season: 'all_year',
    seasonLabel: 'બારેમાસ - 12 Months',
    availableMonths: '365 Days',
    unit: 'kg',
    allowedUnits: ['250g', '500g', '1kg', '2kg'],
    pricePerKg: 35,
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
    nutritionalNotes: 'Wholesome source of potassium, dietary fiber, and complex carbohydrates.',
    benefits: ['Provides steady energy', 'Gentle on digestion', 'Essential kitchen staple']
  },
  {
    id: 'onion',
    name: 'Onion - Pyaaz',
    vernacularName: 'ડુંગળી / કાંદા',
    category: 'vegetable',
    season: 'all_year',
    seasonLabel: 'બારેમાસ - 12 Months',
    availableMonths: '365 Days',
    unit: 'kg',
    allowedUnits: ['250g', '500g', '1kg', '2kg'],
    pricePerKg: 50,
    imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80',
    nutritionalNotes: 'Abundant in quercetin antioxidants and prebiotic fibers.',
    benefits: ['Supports cardiovascular wellness', 'Enhances gut microbiome', 'Natural immunity booster']
  },
  {
    id: 'tomato',
    name: 'Tomato - Tamatar',
    vernacularName: 'ટામેટા',
    category: 'vegetable',
    season: 'all_year',
    seasonLabel: 'બારેમાસ - 12 Months',
    availableMonths: '365 Days',
    unit: 'kg',
    allowedUnits: ['250g', '500g', '1kg'],
    pricePerKg: 40,
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    nutritionalNotes: 'Exceptional source of lycopene, vitamin C, and cellular antioxidants.',
    benefits: ['Cellular health', 'Heart protection', 'Skin radiance']
  },
  {
    id: 'coriander',
    name: 'Coriander leaves - Kotmir',
    vernacularName: 'ધાણા / કોથમીર',
    category: 'vegetable',
    season: 'all_year',
    seasonLabel: 'બારેમાસ - 12 Months',
    availableMonths: '365 Days',
    unit: 'bunch',
    allowedUnits: ['1 bunch', '2 bunches', '100g', '250g'],
    pricePerUnit: 15,
    imageUrl: 'https://images.unsplash.com/photo-1590868309235-ea34bed7bd7f?auto=format&fit=crop&w=600&q=80',
    nutritionalNotes: 'Natural detoxifier, rich in Vitamin A, C, and essential aromatic oils.',
    benefits: ['Aids heavy metal detox', 'Stimulates digestive enzymes']
  },
  {
    id: 'ginger',
    name: 'Ginger - Adrak',
    vernacularName: 'આદુ',
    category: 'vegetable',
    season: 'all_year',
    seasonLabel: 'બારેમાસ - 12 Months',
    availableMonths: '365 Days',
    unit: '100g',
    allowedUnits: ['100g', '250g', '500g'],
    pricePerKg: 120,
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
    nutritionalNotes: 'Potent gingerols and digestive anti-inflammatory compounds.',
    benefits: ['Reduces nausea', 'Soothes throat and joints', 'Enhances bio-availability']
  },

  // 2. Winter Season (શિયાળો - Winter / Shiyāḷo: Oct - Feb)
  {
    id: 'spinach_green',
    name: 'Spinach - Green Palak',
    vernacularName: 'પાલક',
    category: 'vegetable',
    season: 'winter',
    seasonLabel: 'શિયાળો - Winter (Oct - Feb)',
    availableMonths: 'Oct - Feb',
    unit: 'bunch',
    allowedUnits: ['1 bunch', '2 bunches', '500g', '1kg'],
    pricePerKg: 30,
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
    nutritionalNotes: 'Natural nitrates and potassium moderate blood pressure. High in Vitamin K1, calcium, and magnesium supporting bone density. High in insoluble fiber.',
    medicalAdvisory: 'Clinical Note: Patients taking 400-500mg Warfarin daily must consult their physician and limit to 100g Palak. Kidney stone patients should moderate intake.',
    benefits: ['Supports gut microbiome', 'Aids nursing mothers in breast milk quality', 'Preserves bone density']
  },
  {
    id: 'spinach_red',
    name: 'Red Palak - Lal Saag / Chaulai',
    vernacularName: 'લાલ પાલક / રાજગરો',
    category: 'vegetable',
    season: 'winter',
    seasonLabel: 'શિયાળો - Winter (Oct - Feb)',
    availableMonths: 'Oct - Feb',
    unit: 'bunch',
    allowedUnits: ['1 bunch', '2 bunches', '500g'],
    pricePerKg: 35,
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    nutritionalNotes: 'Dietary nitrates, bioavailable iron, and anthocyanin antioxidants that convert to nitric oxide in the bloodstream.',
    medicalAdvisory: 'Combine with fresh lemon juice to maximize iron and hemoglobin absorption. Warfarin patients consult doctor.',
    benefits: ['Improves blood circulation', 'Boosts physical endurance', 'Nourishing for nursing mothers']
  },
  {
    id: 'fenugreek_methi',
    name: 'Fenugreek Leaves - Methi',
    vernacularName: 'મેથીની ભાજી',
    category: 'vegetable',
    season: 'winter',
    seasonLabel: 'શિયાળો - Winter (Oct - Feb)',
    availableMonths: 'Oct - Feb',
    unit: 'bunch',
    allowedUnits: ['1 bunch', '2 bunches', '500g'],
    pricePerKg: 40,
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
    nutritionalNotes: 'High soluble galactomannan fiber slows glucose absorption, improving insulin sensitivity. Lowers LDL and triglycerides.',
    benefits: ['Helps blood sugar balance', 'Promotes digestive bile production', 'Strengthens hair roots', 'Lactation booster']
  },
  {
    id: 'carrot_gajar',
    name: 'Crisp Carrot - Gajar',
    vernacularName: 'ગાજર',
    category: 'vegetable',
    season: 'winter',
    seasonLabel: 'શિયાળો - Winter (Oct - Feb)',
    availableMonths: 'Oct - Feb',
    unit: 'kg',
    allowedUnits: ['250g', '500g', '1kg'],
    pricePerKg: 45,
    imageUrl: 'https://images.unsplash.com/photo-1590868309235-ea34bed7bd7f?auto=format&fit=crop&w=600&q=80',
    nutritionalNotes: 'Loaded with beta-carotene, lutein, and dietary fiber for eye and cellular health.',
    benefits: ['Improves night vision', 'Cellular radiance', 'Low glycemic snack']
  },
  {
    id: 'green_peas_matar',
    name: 'Green Peas - Matar',
    vernacularName: 'વટાણા',
    category: 'vegetable',
    season: 'winter',
    seasonLabel: 'શિયાળો - Winter (Oct - Feb)',
    availableMonths: 'Oct - Feb',
    unit: 'kg',
    allowedUnits: ['250g', '500g', '1kg'],
    pricePerKg: 65,
    imageUrl: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=600&q=80',
    nutritionalNotes: 'Plant protein, coumestrol polyphenols, and vitamins A, B1, and C.',
    benefits: ['Plant-powered protein', 'Heart friendly', 'Rich in natural sweetness']
  },
  {
    id: 'shimla_apple',
    name: 'Shimla Royal Apple',
    vernacularName: 'સફરજન',
    category: 'fruit',
    season: 'winter',
    seasonLabel: 'શિયાળો - Winter (Oct - Feb)',
    availableMonths: 'Oct - Feb',
    unit: 'kg',
    allowedUnits: ['500g', '1kg', '2kg'],
    pricePerKg: 180,
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80',
    nutritionalNotes: 'High pectin fiber, boron for bone health, and Vitamin C.',
    benefits: ['Digestive regularity', 'Brain support', 'Satisfies sweet tooth naturally']
  },

  // 3. Summer Season (ઉનાળો - Summer / Unāḷo: Mar - June)
  {
    id: 'okra_bhindi',
    name: 'Okra / Lady Finger - Bhindi',
    vernacularName: 'ભીંડો',
    category: 'vegetable',
    season: 'summer',
    seasonLabel: 'ઉનાળો - Summer (Mar - June)',
    availableMonths: 'Mar - June',
    unit: 'kg',
    allowedUnits: ['250g', '500g', '1kg'],
    pricePerKg: 55,
    imageUrl: 'https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?auto=format&fit=crop&w=600&q=80',
    nutritionalNotes: 'Mucilage fiber binds to cholesterol and bile acids, cooling digestion.',
    benefits: ['Low glycemic index', 'Soothes intestinal lining', 'Summer cooling vegetable']
  },
  {
    id: 'cucumber_kakdi',
    name: 'Crisp Cucumber - Kakdi',
    vernacularName: 'કાકડી',
    category: 'vegetable',
    season: 'summer',
    seasonLabel: 'ઉનાળો - Summer (Mar - June)',
    availableMonths: 'Mar - June',
    unit: 'kg',
    allowedUnits: ['250g', '500g', '1kg'],
    pricePerKg: 35,
    imageUrl: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=600&q=80',
    nutritionalNotes: '95% water content, silica, and electrolytes restoring cellular hydration.',
    benefits: ['Hydration powerhouse', 'Flushes toxins', 'Skin rejuvenating']
  },
  {
    id: 'drumstick_pods',
    name: 'Drumstick Pods - Sahjan ki Phali',
    vernacularName: 'સરગવો',
    category: 'vegetable',
    season: 'summer',
    seasonLabel: 'ઉનાળો - Summer (Mar - June)',
    availableMonths: 'Mar - June',
    unit: '250g',
    allowedUnits: ['250g', '500g', '1kg'],
    pricePerKg: 70,
    imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?auto=format&fit=crop&w=600&q=80',
    nutritionalNotes: 'Rich in bio-calcium, iron, and zinc promoting joint and respiratory wellness.',
    benefits: ['Joint nourishment', 'Purifies blood', 'Digestive support']
  },

  // 4. Monsoon Season (ચોમાસું - Monsoon: June - Sept)
  {
    id: 'sweet_corn',
    name: 'Sweet Corn - Makki',
    vernacularName: 'મકાઈ',
    category: 'vegetable',
    season: 'monsoon',
    seasonLabel: 'ચોમાસું - Monsoon (June - Sept)',
    availableMonths: 'June - Sept',
    unit: 'piece',
    allowedUnits: ['2 pcs', '4 pcs', '6 pcs'],
    pricePerUnit: 20,
    imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80',
    nutritionalNotes: 'Rich in lutein, zeaxanthin, and energizing complex starches.',
    benefits: ['Protects vision', 'Energy fuel for rainy days']
  },
  {
    id: 'elephant_yam',
    name: 'Elephant Foot Yam - Suran / Jimikand',
    vernacularName: 'સુરણ',
    category: 'vegetable',
    season: 'monsoon',
    seasonLabel: 'ચોમાસું - Monsoon (June - Sept)',
    availableMonths: 'June - Sept',
    unit: 'kg',
    allowedUnits: ['500g', '1kg'],
    pricePerKg: 60,
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
    nutritionalNotes: 'High trace minerals and gut-protective prebiotic fibers.',
    benefits: ['Traditional digestive wellness', 'Sustained satiety']
  },

  // 5. Pure Farm Dairy
  {
    id: 'farm_milk_shakti',
    name: 'Pure Farm Milk (Desi Cow & Buffalo)',
    vernacularName: 'શુદ્ધ ગાય-ભેંસનું દૂધ',
    category: 'milk',
    season: 'all_year',
    seasonLabel: 'બારેમાસ - Daily Fresh (Morning Delivery)',
    availableMonths: '365 Days',
    unit: 'litre',
    allowedUnits: ['500ml', '1 Litre', '1.5 Litres', '2 Litres'],
    pricePerUnit: 65,
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
    nutritionalNotes: 'Direct, unadulterated farm milk collected and chilled each morning. Wholesome A2 beta-casein proteins and bio-calcium.',
    benefits: ['Strong bones and muscle repair', 'Children nourishment', 'No preservatives or synthetic processing']
  },
  {
    id: 'farm_fresh_dahi',
    name: 'Fresh Curd (Dahi)',
    vernacularName: 'તાજું દહીં',
    category: 'milk',
    season: 'all_year',
    seasonLabel: 'બારેમાસ - Daily Farm Fresh',
    availableMonths: '365 Days',
    unit: '500g',
    allowedUnits: ['250g', '500g', '1kg'],
    pricePerUnit: 45,
    imageUrl: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?auto=format&fit=crop&w=600&q=80',
    nutritionalNotes: 'Naturally fermented artisanal curd with live probiotic cultures. Calms digestive fire (Pitta) and enriches gut microbiome.',
    benefits: ['Rich in natural probiotics', 'Supports gut and digestive health', 'No synthetic thickening agents']
  },
  {
    id: 'traditional_chaas',
    name: 'Spiced Buttermilk (Chaas)',
    vernacularName: 'મસાલા છાશ',
    category: 'milk',
    season: 'all_year',
    seasonLabel: 'બારેમાસ - Daily Farm Fresh',
    availableMonths: '365 Days',
    unit: 'litre',
    allowedUnits: ['500ml', '1 Litre', '2 Litres'],
    pricePerUnit: 35,
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80',
    nutritionalNotes: 'Light, churned buttermilk blended with roasted cumin, rock salt, and mint. Essential digestive elixir in Gujarati households.',
    benefits: ['Aids post-meal digestion', 'Hydrates and cools the system', 'Low fat and electrolyte rich']
  }
];

