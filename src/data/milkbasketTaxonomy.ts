export type SubCategory = {
  id: string;
  name: string;
  vernacularName?: string;
  itemCount: number;
  icon?: string;
};

export type CategoryCluster = {
  id: string;
  name: string;
  vernacularName?: string;
  iconName: string;
  description: string;
  subcategories: SubCategory[];
};

export const MILKBASKET_TAXONOMY: CategoryCluster[] = [
  {
    id: 'dairy-breakfast',
    name: 'Dairy, Bread & Morning Essentials',
    vernacularName: 'ડેરી, દૂધ અને સવારનો નાસ્તો',
    iconName: 'Milk',
    description: 'Chilled pure milk, curd, cultured buttermilk, whole grain bread and fresh morning kitchen starters.',
    subcategories: [
      { id: 'cow-milk', name: 'Desi A2 Gir Cow Milk (500ml Pouch)', vernacularName: 'A2 ગાયનું દૂધ', itemCount: 4 },
      { id: 'buffalo-milk', name: 'Pure Farm Buffalo Milk (500ml Pouch)', vernacularName: 'ભેંસનું દૂધ', itemCount: 3 },
      { id: 'curd-chaas', name: 'Cultured Curd (Dahi) & Spiced Chaas', vernacularName: 'દહીં અને છાશ', itemCount: 5 },
      { id: 'paneer-ghee', name: 'Fresh Malai Paneer & Desi Cow Ghee', vernacularName: 'પનીર અને ઘી', itemCount: 4 },
      { id: 'bread-toast', name: 'Artisanal Khakhra & Bakery Toasts', vernacularName: 'ખાખરા અને ટોસ્ટ', itemCount: 6 },
    ],
  },
  {
    id: 'fresh-vegetables',
    name: 'Farm Fresh Daily Vegetables',
    vernacularName: 'તાજા શાકભાજી (ખેતરમાંથી સીધા)',
    iconName: 'Leaf',
    description: 'Hand-picked daily harvest vegetables in custom gram & kg packs. Never frozen, no warehouse hoarding.',
    subcategories: [
      { id: 'daily-veggies', name: 'Daily Cooking Staples (Potato, Onion, Tomato)', vernacularName: 'બટાકા, ડુંગળી, ટામેટા', itemCount: 6 },
      { id: 'green-leaves', name: 'Fresh Leafy Greens (Methi, Palak, Coriander)', vernacularName: 'મેથી, પાલક, કોથમીર', itemCount: 8 },
      { id: 'gourds-beans', name: 'Fresh Gourds, Bhindi & Tender Beans', vernacularName: 'દૂધી, ભીંડો, ચોળી', itemCount: 10 },
      { id: 'exotic-salad', name: 'Salad Cucumbers, Capsicum & Herbs', vernacularName: 'કાકડી અને કેપ્સિકમ', itemCount: 7 },
      { id: 'precut-recipe', name: 'Pre-Cut Recipe Kits (Fine / Diced / Sliced)', vernacularName: 'કટિંગ શાકભાજી કિટ', itemCount: 6 },
    ],
  },
  {
    id: 'fresh-fruits',
    name: 'Seasonal Harvest Fruits',
    vernacularName: 'ઋતુ અનુસાર તાજા ફળો',
    iconName: 'Apple',
    description: 'Naturally ripened, nutrient-dense whole fruits and mixed family wellness harvest baskets.',
    subcategories: [
      { id: 'bananas', name: 'Bananas (Robusta, Kerala Nendran, Elaichi)', vernacularName: 'કેળાની વિવિધ જાત', itemCount: 4 },
      { id: 'apples-citrus', name: 'Shimla Apples, Sweet Mosambi & Oranges', vernacularName: 'સફરજન, મોસંબી, સંતરા', itemCount: 6 },
      { id: 'papaya-melons', name: 'Farm Papaya, Muskmelon & Pineapple', vernacularName: 'પપૈયું, ટેટી, અનાનસ', itemCount: 5 },
      { id: 'pomegranate-exotic', name: 'Ruby Pomegranate, Kiwi & Dragon Fruit', vernacularName: 'દાડમ અને ડ્રેગન ફ્રુટ', itemCount: 5 },
      { id: 'combo-baskets', name: 'Family Mixed Harvest Fruit Combos', vernacularName: 'સંપૂર્ણ ફ્રૂટ કોમ્બો', itemCount: 3 },
    ],
  },
  {
    id: 'snacks-bites',
    name: 'JVLSD Bites & Mindful Snacking',
    vernacularName: 'હેલ્ધી નાસ્તો અને ડ્રાયફ્રૂટ્સ',
    iconName: 'Cookie',
    description: 'Clean roasted nuts, 5-seed omega power mixes, whole grain biscuits and traditional Gujarati snacks.',
    subcategories: [
      { id: 'roasted-nuts', name: 'California Jumbo Almonds & Cashews', vernacularName: 'બદામ અને કાજુ', itemCount: 5 },
      { id: 'seed-mixes', name: '5-Seed Omega-3 Roasted Energy Mix', vernacularName: 'પંચ-બીજ એનર્જી મિક્સ', itemCount: 3 },
      { id: 'artisanal-khakhra', name: 'Ghee Roasted Methi & Jeera Khakhra', vernacularName: 'મેથી અને જીરું ખાખરા', itemCount: 4 },
      { id: 'nutri-cookies', name: 'Jaggery & Oats Nutri-Cookies (No Palm Oil)', vernacularName: 'ગોળ-ઓટ્સ કુકીઝ', itemCount: 4 },
    ],
  },
];
