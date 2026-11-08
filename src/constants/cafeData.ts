export interface MenuItem {
  id: string;
  category: 'breakfast' | 'afternoon_tea' | 'lunch' | 'bakery_beverage';
  name: string;
  description: string;
  price: string;
  dietary?: string[];
  featured?: boolean;
}

export const MENU_ITEMS: MenuItem[] = [
  // Breakfast & Morning Fare
  {
    id: 'm1',
    category: 'breakfast',
    name: 'The Traditional English Breakfast',
    description: 'Heritage Cumberland pork sausages, thick-cut smoked streaky bacon, two Clarence Court fried eggs, grilled vine tomatoes, roasted field mushroom, house baked beans & buttered sourdough toast.',
    price: '£18.50',
    dietary: ['Artisan British Pork'],
    featured: true
  },
  {
    id: 'm2',
    category: 'breakfast',
    name: 'Smoked Scottish Salmon & Scrambled Eggs',
    description: 'Severn & Wye oak-smoked salmon, creamy scrambled eggs with chives, toasted brioche and fresh lemon wedge.',
    price: '£16.00',
    dietary: ['Pescatarian']
  },
  {
    id: 'm3',
    category: 'breakfast',
    name: 'English Garden Breakfast',
    description: 'Grilled halloumi, roasted avocado, herbed field mushrooms, poached Clarence Court eggs, blistered heritage tomatoes and seed loaf.',
    price: '£15.50',
    dietary: ['Vegetarian']
  },
  {
    id: 'm4',
    category: 'breakfast',
    name: 'Toasted Crumpets & Salted Butter',
    description: 'Warm, thick griddle crumpets served with whipped sea salt butter and wild heather honey or homemade Seville orange marmalade.',
    price: '£7.50',
    dietary: ['Vegetarian']
  },

  // Afternoon Tea
  {
    id: 'm5',
    category: 'afternoon_tea',
    name: 'The Royal Mayfair Afternoon Tea',
    description: 'Traditional three-tier service: warm raisin and plain buttermilk scones, Cornish clotted cream, organic strawberry preserve, assorted finger sandwiches, and chef’s daily patisserie selection.',
    price: '£38.00 per guest',
    dietary: ['Signature Experience'],
    featured: true
  },
  {
    id: 'm6',
    category: 'afternoon_tea',
    name: 'Champagne Afternoon Tea',
    description: 'Our complete Royal Mayfair service paired with a chilled flute of Laurent-Perrier La Cuvée Brut and loose-leaf rare tea pairing.',
    price: '£52.00 per guest',
    dietary: ['Includes Champagne']
  },
  {
    id: 'm7',
    category: 'afternoon_tea',
    name: 'Warm Scones Service',
    description: 'Two freshly baked buttermilk scones, generous ramekin of Rodda’s Cornish clotted cream, and house strawberry preserves.',
    price: '£9.50',
    dietary: ['Vegetarian']
  },

  // Lunch & Savouries
  {
    id: 'm8',
    category: 'lunch',
    name: 'Slow-Braised Beef & Ale Pot Pie',
    description: 'Tender British chuck steak braised in London Pride ale, encased in buttery all-butter puff pastry, served with buttered greens and rich bone marrow gravy.',
    price: '£21.50',
    featured: true
  },
  {
    id: 'm9',
    category: 'lunch',
    name: 'Cornish Cod & Chips',
    description: 'Crisp Camden pale ale batter, mushy minted garden peas, triple-cooked Maris Piper chips, and homemade tartare sauce.',
    price: '£19.50',
    dietary: ['Fresh Daily Catch']
  },
  {
    id: 'm10',
    category: 'lunch',
    name: 'Warm Coronation Chicken Salad',
    description: 'Roast corn-fed chicken breast, lightly spiced mango mayonnaise, toasted almonds, apricots, watercress and endive.',
    price: '£16.50',
    dietary: ['Gluten-Free Option']
  },

  // Bakery & Beverages
  {
    id: 'm11',
    category: 'bakery_beverage',
    name: 'Classic Victoria Sponge',
    description: 'Featherlight vanilla sponge cake filled with Madagascan vanilla buttercream and fresh English raspberry jam, dusted with caster sugar.',
    price: '£7.00',
    dietary: ['Vegetarian']
  },
  {
    id: 'm12',
    category: 'bakery_beverage',
    name: 'Artisan Sausage Roll',
    description: 'Free-range seasoned pork with fresh thyme and caramelized onion chutney in golden flaky rough puff pastry.',
    price: '£6.50'
  },
  {
    id: 'm13',
    category: 'bakery_beverage',
    name: 'Rare Single-Estate Earl Grey Tea',
    description: 'Hand-picked Ceylon black tea scented with cold-pressed natural Calabrian bergamot oil, served in a vintage silver pot.',
    price: '£5.20',
    dietary: ['Loose-Leaf']
  },
  {
    id: 'm14',
    category: 'bakery_beverage',
    name: 'English Breakfast Blend Tea',
    description: 'Robust, comforting blend of Assam, Ceylon, and Kenyan leaves. Pairs perfectly with whole milk.',
    price: '£4.80',
    dietary: ['Loose-Leaf']
  }
];

export const CAFE_INFO = {
  name: 'English Cafe',
  tagline: 'Authentic British Food, Fresh Coffee & Afternoon Tea',
  address: '14 Royal Crescent, Mayfair, London W1J 7PT',
  phone: '+44 20 7946 0912',
  email: 'reservations@englishcafe.co.uk',
  openingHours: [
    { days: 'Monday – Friday', hours: '08:00 – 21:00' },
    { days: 'Saturday', hours: '08:30 – 21:30' },
    { days: 'Sunday', hours: '09:00 – 20:00' }
  ],
  transitNotes: '2 minutes walk from Green Park Station (Piccadilly, Victoria & Jubilee lines).'
};
