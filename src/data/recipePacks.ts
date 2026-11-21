export type RecipePrepKit = {
  id: string;
  name: string;
  vernacularName?: string;
  description: string;
  suggestedVegetables: string[];
  hasOnionOrPotato: boolean;
};

export const RECIPE_PREP_KITS: RecipePrepKit[] = [
  {
    id: 'pulav',
    name: 'Vegetable Pulav Mix',
    vernacularName: 'વેજ પુલાવ કટિંગ',
    description: 'Freshly diced carrots, green peas, cauliflower florets, and French beans. Ready for aromatic rice dishes.',
    suggestedVegetables: ['Carrot', 'Green Peas', 'Cauliflower', 'Beans', 'Potato'],
    hasOnionOrPotato: true,
  },
  {
    id: 'veg_fried_rice',
    name: 'Vegetable Fried Rice Pack',
    vernacularName: 'ફ્રાઈડ રાઈસ મિક્સ',
    description: 'Finely julienned and diced cabbage, spring onions, capsicum, and carrots.',
    suggestedVegetables: ['Cabbage', 'Capsicum', 'Carrot', 'Spring Onion'],
    hasOnionOrPotato: false,
  },
  {
    id: 'biryani',
    name: 'Royal Vegetable Biryani Box',
    vernacularName: 'શાહી દમ બિરયાની મિક્સ',
    description: 'Thick cut potatoes, cauliflower, carrots, and beans seasoned for slow dum cooking.',
    suggestedVegetables: ['Potato', 'Cauliflower', 'Carrot', 'Beans'],
    hasOnionOrPotato: true,
  },
  {
    id: 'sambhar_dal',
    name: 'South Indian Sambhar Pack',
    vernacularName: 'સાંભાર મિક્સ વેજીટેબલ્સ',
    description: 'Traditional drumstick batons, small shallots/onions, pumpkin chunks, and tomatoes.',
    suggestedVegetables: ['Drumstick', 'Onion', 'Tomato', 'Pumpkin'],
    hasOnionOrPotato: true,
  },
  {
    id: 'avial',
    name: 'Traditional Kerala Avial Kit',
    vernacularName: 'અવિયલ કટિંગ મિક્સ',
    description: 'Thin batons of raw plantain, drumstick, carrot, elephant yam (suran), and beans.',
    suggestedVegetables: ['Drumstick', 'Carrot', 'Elephant Yam', 'Beans'],
    hasOnionOrPotato: false,
  },
  {
    id: 'mixed_veg_bhaji',
    name: 'Pav Bhaji / Mixed Vegetable Mix',
    vernacularName: 'મિક્સ વેજ ભાજી કટિંગ',
    description: 'Steamed and diced cauliflower, potatoes, green peas, capsicum, and tomatoes.',
    suggestedVegetables: ['Potato', 'Cauliflower', 'Green Peas', 'Capsicum', 'Tomato'],
    hasOnionOrPotato: true,
  },
  {
    id: 'dal_tadka',
    name: 'Dal Tadka Aromatics Pack',
    vernacularName: 'દાલ તડકા વઘાર કટિંગ',
    description: 'Finely chopped red onions, ripe country tomatoes, ginger, and green chillies.',
    suggestedVegetables: ['Onion', 'Tomato', 'Ginger', 'Green Chilli'],
    hasOnionOrPotato: true,
  },
  {
    id: 'aloo_gobi',
    name: 'Aloo Gobi Kitchen Prep',
    vernacularName: 'બટાકા ફ્લાવર શાક કટિંગ',
    description: 'Uniform medium-diced farm potatoes and tender cauliflower florets.',
    suggestedVegetables: ['Potato', 'Cauliflower'],
    hasOnionOrPotato: true,
  },
  {
    id: 'aloo_matar',
    name: 'Aloo Matar Homestyle Pack',
    vernacularName: 'બટાકા વટાણા શાક મિક્સ',
    description: 'Diced farm potatoes paired with fresh hand-shelled green peas.',
    suggestedVegetables: ['Potato', 'Green Peas'],
    hasOnionOrPotato: true,
  },
  {
    id: 'upma',
    name: 'Wholesome Upma Tadka Veggies',
    vernacularName: 'ઉપમા વેજીટેબલ મિક્સ',
    description: 'Fine diced onions, carrots, green beans, and ginger for morning suji upma.',
    suggestedVegetables: ['Onion', 'Carrot', 'Beans', 'Ginger'],
    hasOnionOrPotato: true,
  },
  {
    id: 'poha',
    name: 'Batata Poha Morning Mix',
    vernacularName: 'બટાકા પૌઆ કટિંગ',
    description: 'Small-diced potatoes, chopped onions, and fresh coriander for Gujarati Batata Poha.',
    suggestedVegetables: ['Potato', 'Onion', 'Coriander'],
    hasOnionOrPotato: true,
  },
];
