import "dotenv/config";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type MenuCategory, type NoiseLevel, type CrowdLevel } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

faker.seed(42);

// ---------------------------------------------------------------------------
// Static reference data
// ---------------------------------------------------------------------------

const AMENITIES = [
  { name: "Fast Wi-Fi", icon: "Wifi" },
  { name: "Power Outlets", icon: "Plug" },
  { name: "Air Conditioning", icon: "Wind" },
  { name: "Outdoor Seating", icon: "Trees" },
  { name: "Pet Friendly", icon: "Dog" },
  { name: "Wheelchair Accessible", icon: "Accessibility" },
  { name: "Parking", icon: "SquareParking" },
  { name: "Vegan Options", icon: "Leaf" },
  { name: "Private Meeting Room", icon: "Users" },
  { name: "Printing", icon: "Printer" },
  { name: "Large Tables", icon: "Rows3" },
  { name: "Natural Light", icon: "Sun" },
];

const INTERESTS = [
  "React", "AI", "Startups", "Design", "UI/UX", "Photography", "Writing",
  "Product", "Marketing", "Data Science", "Web3", "Mobile Dev", "Backend",
  "DevOps", "Music", "Film", "Fitness", "Travel", "Languages", "Finance",
  "Illustration", "Branding", "Game Dev", "Open Source", "Public Speaking",
  "Coffee", "Sustainability", "Education", "E-commerce", "Hardware",
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- used only as a type source below
const MOOD_KEYS = [
  "DEEP_WORK", "STUDY", "CODING", "CREATIVE", "NETWORKING",
  "QUIET_FOCUS", "SOCIAL", "AESTHETIC", "LATE_NIGHT", "RELAX",
] as const;

const NEIGHBORHOODS: Record<string, string[]> = {
  Tashkent: ["Yunusabad", "Mirzo Ulugbek", "Chilanzar", "Mirabad", "Shaykhantahur", "Yakkasaray", "Amir Temur", "Sergeli"],
  Samarkand: ["Registan District", "University Boulevard", "Siab", "Konigil"],
  Bukhara: ["Old Town", "Lyabi House", "Eshoni Pir"],
};

const STREETS = ["Afrosiyob St", "Islam Karimov St", "Buyuk Ipak Yuli", "Mustaqillik Ave", "Shota Rustaveli St", "Amir Temur Ave", "Bobur St", "Nukus St", "Parkent St", "Universitet St"];

// 20 fictional cafés, each with a distinct personality
const CAFE_SEEDS: Array<{
  name: string;
  tagline: string;
  description: string;
  city: keyof typeof NEIGHBORHOODS;
  moods: (typeof MOOD_KEYS)[number][];
  wifiScore: number;
  outletsScore: number;
  seatingComfortScore: number;
  coffeeScore: number;
  foodScore: number;
  workScore: number;
  studyScore: number;
  networkingScore: number;
  aestheticScore: number;
  noiseLevel: NoiseLevel;
  crowdLevel: CrowdLevel;
  priceLevel: number;
  isOpenLate: boolean;
  hasOutdoorSeating: boolean;
  isPetFriendly: boolean;
  isMeetingFriendly: boolean;
  isGroupFriendly: boolean;
  featured?: boolean;
}> = [
  {
    name: "Brew Lab", tagline: "Where focus meets fermentation.",
    description: "A minimalist specialty coffee bar built for people who treat their afternoon like a sprint. Single-origin pour-overs, gigabit Wi-Fi, and a 'quiet zone' upstairs where phone calls go to the stairwell.",
    city: "Tashkent", moods: ["DEEP_WORK", "CODING", "QUIET_FOCUS"],
    wifiScore: 98, outletsScore: 95, seatingComfortScore: 82, coffeeScore: 91, foodScore: 70,
    workScore: 95, studyScore: 88, networkingScore: 55, aestheticScore: 80,
    noiseLevel: "QUIET", crowdLevel: "MODERATE", priceLevel: 2, isOpenLate: false,
    hasOutdoorSeating: false, isPetFriendly: false, isMeetingFriendly: true, isGroupFriendly: false,
    featured: true,
  },
  {
    name: "The Reading Room", tagline: "Library hush, café warmth.",
    description: "Floor-to-ceiling shelves, worn leather armchairs, and a strict no-phone-calls policy. Students colonize the long oak tables from 9am; by evening it's half-empty and completely silent.",
    city: "Tashkent", moods: ["STUDY", "QUIET_FOCUS", "DEEP_WORK"],
    wifiScore: 88, outletsScore: 90, seatingComfortScore: 90, coffeeScore: 78, foodScore: 60,
    workScore: 85, studyScore: 97, networkingScore: 30, aestheticScore: 85,
    noiseLevel: "SILENT", crowdLevel: "LOW", priceLevel: 1, isOpenLate: false,
    hasOutdoorSeating: false, isPetFriendly: false, isMeetingFriendly: false, isGroupFriendly: false,
  },
  {
    name: "Compile & Co.", tagline: "Fuel for builders.",
    description: "Started by two ex-engineers who got tired of coffee shops that fought their laptops. Every seat has an outlet, the Wi-Fi is wired-speed, and the espresso machine never closes before midnight.",
    city: "Tashkent", moods: ["CODING", "DEEP_WORK", "LATE_NIGHT"],
    wifiScore: 99, outletsScore: 99, seatingComfortScore: 78, coffeeScore: 84, foodScore: 72,
    workScore: 97, studyScore: 80, networkingScore: 60, aestheticScore: 68,
    noiseLevel: "MODERATE", crowdLevel: "MODERATE", priceLevel: 2, isOpenLate: true,
    hasOutdoorSeating: false, isPetFriendly: false, isMeetingFriendly: true, isGroupFriendly: true,
    featured: true,
  },
  {
    name: "Atelier Nine", tagline: "A studio for people who make things.",
    description: "Part gallery, part café. Rotating exhibitions from local illustrators line the walls, the playlist leans jazz-adjacent, and the courtyard tables are the most photographed seats in the district.",
    city: "Tashkent", moods: ["CREATIVE", "AESTHETIC", "SOCIAL"],
    wifiScore: 80, outletsScore: 55, seatingComfortScore: 85, coffeeScore: 88, foodScore: 82,
    workScore: 62, studyScore: 45, networkingScore: 70, aestheticScore: 97,
    noiseLevel: "MODERATE", crowdLevel: "HIGH", priceLevel: 3, isOpenLate: false,
    hasOutdoorSeating: true, isPetFriendly: true, isMeetingFriendly: false, isGroupFriendly: true,
    featured: true,
  },
  {
    name: "Founders Table", tagline: "The unofficial HQ for Tashkent's startup scene.",
    description: "Pitch decks get workshopped at the communal table, investors hold office hours in the back booth on Thursdays, and the barista knows half the city's founders by name.",
    city: "Tashkent", moods: ["NETWORKING", "SOCIAL", "DEEP_WORK"],
    wifiScore: 92, outletsScore: 85, seatingComfortScore: 80, coffeeScore: 80, foodScore: 75,
    workScore: 83, studyScore: 55, networkingScore: 96, aestheticScore: 78,
    noiseLevel: "MODERATE", crowdLevel: "HIGH", priceLevel: 2, isOpenLate: false,
    hasOutdoorSeating: true, isPetFriendly: false, isMeetingFriendly: true, isGroupFriendly: true,
    featured: true,
  },
  {
    name: "Hazel & Ash", tagline: "Slow mornings, done properly.",
    description: "No laptops before noon — just a house rule that's kept this place a genuine neighborhood hangout. Excellent pastries, unreasonably comfortable window seats, sun until early afternoon.",
    city: "Tashkent", moods: ["RELAX", "SOCIAL", "AESTHETIC"],
    wifiScore: 60, outletsScore: 40, seatingComfortScore: 95, coffeeScore: 85, foodScore: 90,
    workScore: 40, studyScore: 35, networkingScore: 50, aestheticScore: 90,
    noiseLevel: "MODERATE", crowdLevel: "MODERATE", priceLevel: 2, isOpenLate: false,
    hasOutdoorSeating: true, isPetFriendly: true, isMeetingFriendly: false, isGroupFriendly: true,
  },
  {
    name: "Nightshift Coffee", tagline: "Open when your deadline is.",
    description: "A 24-hour café built for the people whose best work happens after 10pm. Red-tinted lighting, strong cold brew on tap, and a playlist that never gets too loud to think over.",
    city: "Tashkent", moods: ["LATE_NIGHT", "CODING", "DEEP_WORK"],
    wifiScore: 95, outletsScore: 93, seatingComfortScore: 75, coffeeScore: 80, foodScore: 65,
    workScore: 90, studyScore: 78, networkingScore: 40, aestheticScore: 72,
    noiseLevel: "QUIET", crowdLevel: "LOW", priceLevel: 2, isOpenLate: true,
    hasOutdoorSeating: false, isPetFriendly: false, isMeetingFriendly: false, isGroupFriendly: false,
  },
  {
    name: "Marigold", tagline: "Instagram's favorite corner table.",
    description: "Terracotta tiles, a wall of hanging plants, and natural light that photographs perfectly past 4pm. The matcha here has its own fan account.",
    city: "Tashkent", moods: ["AESTHETIC", "SOCIAL", "CREATIVE"],
    wifiScore: 70, outletsScore: 45, seatingComfortScore: 88, coffeeScore: 82, foodScore: 85,
    workScore: 50, studyScore: 40, networkingScore: 65, aestheticScore: 99,
    noiseLevel: "MODERATE", crowdLevel: "HIGH", priceLevel: 3, isOpenLate: false,
    hasOutdoorSeating: true, isPetFriendly: false, isMeetingFriendly: false, isGroupFriendly: true,
    featured: true,
  },
  {
    name: "Quiet Hours", tagline: "Exactly what it sounds like.",
    description: "A dedicated silent floor upstairs (headphones or silence, no exceptions), a normal café downstairs. The two-tier system works better than it has any right to.",
    city: "Tashkent", moods: ["QUIET_FOCUS", "STUDY", "DEEP_WORK"],
    wifiScore: 90, outletsScore: 92, seatingComfortScore: 80, coffeeScore: 75, foodScore: 58,
    workScore: 92, studyScore: 95, networkingScore: 25, aestheticScore: 65,
    noiseLevel: "SILENT", crowdLevel: "LOW", priceLevel: 1, isOpenLate: false,
    hasOutdoorSeating: false, isPetFriendly: false, isMeetingFriendly: false, isGroupFriendly: false,
  },
  {
    name: "The Common Desk", tagline: "A café that works like a coworking space.",
    description: "Bookable meeting pods, a printer that always has ink, and enough standing desks to make your back forget this is technically a café.",
    city: "Tashkent", moods: ["DEEP_WORK", "NETWORKING", "CODING"],
    wifiScore: 97, outletsScore: 96, seatingComfortScore: 83, coffeeScore: 76, foodScore: 68,
    workScore: 96, studyScore: 75, networkingScore: 82, aestheticScore: 70,
    noiseLevel: "MODERATE", crowdLevel: "HIGH", priceLevel: 2, isOpenLate: false,
    hasOutdoorSeating: false, isPetFriendly: false, isMeetingFriendly: true, isGroupFriendly: true,
  },
  {
    name: "Olive & Stone", tagline: "Mediterranean mornings, Tashkent afternoons.",
    description: "Stone walls, olive branches in clay pots, and a kitchen that takes its shakshuka seriously. Gets loud and social after 6pm.",
    city: "Tashkent", moods: ["SOCIAL", "RELAX", "AESTHETIC"],
    wifiScore: 65, outletsScore: 50, seatingComfortScore: 86, coffeeScore: 80, foodScore: 93,
    workScore: 45, studyScore: 35, networkingScore: 60, aestheticScore: 88,
    noiseLevel: "LIVELY", crowdLevel: "HIGH", priceLevel: 3, isOpenLate: false,
    hasOutdoorSeating: true, isPetFriendly: true, isMeetingFriendly: false, isGroupFriendly: true,
  },
  {
    name: "Keystroke", tagline: "A café built by developers, for developers.",
    description: "Mechanical keyboards for sale at the counter, a dedicated 'pair programming' table with dual monitors, and a Discord server more active than most startups' Slack.",
    city: "Tashkent", moods: ["CODING", "NETWORKING", "DEEP_WORK"],
    wifiScore: 99, outletsScore: 98, seatingComfortScore: 75, coffeeScore: 79, foodScore: 62,
    workScore: 95, studyScore: 72, networkingScore: 85, aestheticScore: 66,
    noiseLevel: "MODERATE", crowdLevel: "MODERATE", priceLevel: 2, isOpenLate: true,
    hasOutdoorSeating: false, isPetFriendly: false, isMeetingFriendly: true, isGroupFriendly: true,
  },
  {
    name: "Paper Crane", tagline: "A study café with a tea ceremony's patience.",
    description: "Low tables, floor cushions, and a tea menu longer than the coffee one. Popular with language-exchange meetups on weekend mornings.",
    city: "Tashkent", moods: ["STUDY", "RELAX", "QUIET_FOCUS"],
    wifiScore: 82, outletsScore: 70, seatingComfortScore: 80, coffeeScore: 70, foodScore: 75,
    workScore: 75, studyScore: 90, networkingScore: 55, aestheticScore: 86,
    noiseLevel: "QUIET", crowdLevel: "LOW", priceLevel: 1, isOpenLate: false,
    hasOutdoorSeating: false, isPetFriendly: false, isMeetingFriendly: false, isGroupFriendly: true,
  },
  {
    name: "Satellite", tagline: "Where the design crowd lands.",
    description: "Concrete, brass fixtures, and a wall of framed type specimens. The unofficial Friday meetup spot for the city's UI/UX community.",
    city: "Tashkent", moods: ["CREATIVE", "NETWORKING", "AESTHETIC"],
    wifiScore: 88, outletsScore: 72, seatingComfortScore: 84, coffeeScore: 86, foodScore: 78,
    workScore: 70, studyScore: 50, networkingScore: 88, aestheticScore: 93,
    noiseLevel: "MODERATE", crowdLevel: "HIGH", priceLevel: 3, isOpenLate: false,
    hasOutdoorSeating: true, isPetFriendly: false, isMeetingFriendly: true, isGroupFriendly: true,
    featured: true,
  },
  {
    name: "Granary", tagline: "Converted mill, unreasonable ceiling height.",
    description: "A 1930s grain mill turned café-slash-events-space. The acoustics are surprisingly good for how enormous it is — ask for a table near the old machinery for the best light.",
    city: "Tashkent", moods: ["AESTHETIC", "SOCIAL", "CREATIVE"],
    wifiScore: 75, outletsScore: 60, seatingComfortScore: 82, coffeeScore: 83, foodScore: 80,
    workScore: 58, studyScore: 48, networkingScore: 68, aestheticScore: 94,
    noiseLevel: "MODERATE", crowdLevel: "MODERATE", priceLevel: 2, isOpenLate: false,
    hasOutdoorSeating: true, isPetFriendly: true, isMeetingFriendly: false, isGroupFriendly: true,
  },
  {
    name: "Even Keel", tagline: "A café designed around your nervous system.",
    description: "Warm dimmable lighting, a 'low-stimulation' seating zone, and decaf options that don't taste like an apology. Built with neurodivergent regulars in mind, loved by everyone.",
    city: "Tashkent", moods: ["QUIET_FOCUS", "RELAX", "DEEP_WORK"],
    wifiScore: 85, outletsScore: 80, seatingComfortScore: 92, coffeeScore: 78, foodScore: 70,
    workScore: 82, studyScore: 80, networkingScore: 35, aestheticScore: 82,
    noiseLevel: "QUIET", crowdLevel: "LOW", priceLevel: 2, isOpenLate: false,
    hasOutdoorSeating: false, isPetFriendly: false, isMeetingFriendly: false, isGroupFriendly: false,
  },
  {
    name: "Terrace 48", tagline: "The rooftop everyone asks about.",
    description: "Four floors up with a skyline view, string lights, and a cocktail-coffee hybrid menu that gets going around 7pm. Loud, lively, and the best spot in the city to close a deal informally.",
    city: "Tashkent", moods: ["SOCIAL", "NETWORKING", "LATE_NIGHT"],
    wifiScore: 78, outletsScore: 45, seatingComfortScore: 85, coffeeScore: 76, foodScore: 84,
    workScore: 50, studyScore: 30, networkingScore: 90, aestheticScore: 92,
    noiseLevel: "LIVELY", crowdLevel: "HIGH", priceLevel: 4, isOpenLate: true,
    hasOutdoorSeating: true, isPetFriendly: false, isMeetingFriendly: false, isGroupFriendly: true,
  },
  {
    name: "Soft Focus", tagline: "A café shot entirely in golden hour.",
    description: "Dusty pink walls, film-camera decor, and a window seat row that's booked out by 3pm on weekends. Oat milk only, and they're not sorry about it.",
    city: "Samarkand", moods: ["AESTHETIC", "CREATIVE", "RELAX"],
    wifiScore: 72, outletsScore: 50, seatingComfortScore: 86, coffeeScore: 84, foodScore: 80,
    workScore: 48, studyScore: 42, networkingScore: 58, aestheticScore: 97,
    noiseLevel: "MODERATE", crowdLevel: "HIGH", priceLevel: 3, isOpenLate: false,
    hasOutdoorSeating: true, isPetFriendly: true, isMeetingFriendly: false, isGroupFriendly: true,
  },
  {
    name: "Silk Road Study Hall", tagline: "Where Samarkand's thesis season lives.",
    description: "Walking distance from the university, open from 7am, and the only café in town that refills your thermos for free if you're pulling a long one.",
    city: "Samarkand", moods: ["STUDY", "DEEP_WORK", "QUIET_FOCUS"],
    wifiScore: 90, outletsScore: 88, seatingComfortScore: 78, coffeeScore: 72, foodScore: 65,
    workScore: 88, studyScore: 96, networkingScore: 40, aestheticScore: 70,
    noiseLevel: "QUIET", crowdLevel: "MODERATE", priceLevel: 1, isOpenLate: false,
    hasOutdoorSeating: false, isPetFriendly: false, isMeetingFriendly: false, isGroupFriendly: false,
  },
  {
    name: "Caravanserai Coffee", tagline: "An old trade-route stop, reopened for laptops.",
    description: "Restored courtyard walls, shaded seating, and a slower pace than anywhere else on this list. Wi-Fi is solid despite the historic building; outlets are a little rarer, so come charged.",
    city: "Bukhara", moods: ["RELAX", "AESTHETIC", "CREATIVE"],
    wifiScore: 76, outletsScore: 55, seatingComfortScore: 88, coffeeScore: 79, foodScore: 82,
    workScore: 55, studyScore: 50, networkingScore: 52, aestheticScore: 95,
    noiseLevel: "QUIET", crowdLevel: "LOW", priceLevel: 2, isOpenLate: false,
    hasOutdoorSeating: true, isPetFriendly: true, isMeetingFriendly: false, isGroupFriendly: true,
  },
];

const MENU_POOL: Record<MenuCategory, Array<{ name: string; description: string; price: number }>> = {
  COFFEE: [
    { name: "Iced Spanish Latte", description: "Espresso, milk, condensed milk, served over ice.", price: 4.5 },
    { name: "Pour-Over, Single Origin", description: "Rotating origin, brewed to order on V60.", price: 5.5 },
    { name: "Flat White", description: "Double ristretto, velvet-textured milk.", price: 4.0 },
    { name: "Cortado", description: "Equal parts espresso and steamed milk.", price: 3.5 },
    { name: "Cold Brew", description: "Steeped 18 hours, served black or over cream.", price: 4.25 },
    { name: "Honey Cinnamon Cappuccino", description: "House-made honey syrup, Ceylon cinnamon dust.", price: 4.75 },
    { name: "Affogato", description: "A shot of espresso poured over vanilla gelato.", price: 5.0 },
  ],
  TEA: [
    { name: "Jasmine Green Tea", description: "Whole-leaf jasmine, brewed 3 minutes.", price: 3.5 },
    { name: "Hibiscus Ginger Iced Tea", description: "Caffeine-free, lightly sweetened, served cold.", price: 4.0 },
    { name: "Masala Chai", description: "Black tea simmered with cardamom, cinnamon, and clove.", price: 4.25 },
    { name: "Peppermint Infusion", description: "Fresh mint leaves, caffeine-free.", price: 3.25 },
  ],
  BREAKFAST: [
    { name: "Shakshuka", description: "Eggs poached in spiced tomato sauce, side of flatbread.", price: 7.5 },
    { name: "Avocado Toast", description: "Sourdough, smashed avocado, chili flake, lemon.", price: 6.75 },
    { name: "Granola Bowl", description: "House granola, yogurt, seasonal fruit, honey.", price: 6.0 },
    { name: "Classic Omelette", description: "Three eggs, herbs, choice of two fillings.", price: 6.5 },
  ],
  LUNCH: [
    { name: "Grain Bowl", description: "Farro, roasted vegetables, feta, tahini dressing.", price: 8.5 },
    { name: "Chicken Caesar Wrap", description: "Grilled chicken, romaine, parmesan, house caesar.", price: 7.75 },
    { name: "Soup of the Day", description: "Rotating daily, served with crusty bread.", price: 5.5 },
    { name: "Veggie Plov", description: "A café twist on the local classic, with roasted carrots and chickpeas.", price: 7.0 },
  ],
  DESSERTS: [
    { name: "Basque Burnt Cheesecake", description: "Caramelized top, custardy center.", price: 5.5 },
    { name: "Pistachio Croissant", description: "Laminated dough, pistachio cream filling.", price: 4.5 },
    { name: "Dark Chocolate Tart", description: "70% cacao ganache, sea salt flake.", price: 5.75 },
    { name: "Honey Cake (Medovik)", description: "Classic layered honey cake, local favorite.", price: 4.75 },
  ],
  DRINKS: [
    { name: "Fresh Orange Juice", description: "Cold-pressed, no added sugar.", price: 4.0 },
    { name: "Sparkling Lemon Mint", description: "Soda water, fresh lemon, muddled mint.", price: 3.75 },
    { name: "Iced Matcha Latte", description: "Ceremonial-grade matcha, oat milk.", price: 5.25 },
    { name: "Hot Chocolate", description: "Dark chocolate, steamed milk, whipped cream.", price: 4.5 },
  ],
};

const PROFESSIONS = [
  "Frontend Developer", "Product Designer", "Backend Engineer", "Founder", "UX Researcher",
  "Data Scientist", "Freelance Writer", "Marketing Lead", "Mobile Developer", "Illustrator",
  "Graduate Student", "Photographer", "Growth Marketer", "ML Engineer", "Brand Strategist",
  "Full-Stack Developer", "Architecture Student", "Game Developer", "Community Manager", "Economics Student",
];

const BIO_TEMPLATES = [
  (p: string) => `${p}, building things on the side and perpetually two coffees deep.`,
  (p: string) => `${p} chasing good Wi-Fi and better conversations.`,
  (p: string) => `${p}. Here most weekdays, always open to talk shop.`,
  (p: string) => `Freelance ${p.toLowerCase()} looking for collaborators and new ideas.`,
  (p: string) => `${p} based in Tashkent. Currently deep in a side project I'll probably mention unprompted.`,
];

const GOALS = [
  "Shipping a side project by the end of the quarter",
  "Meeting more people in the local startup scene",
  "Finishing a thesis without losing my mind",
  "Finding a regular co-working crew",
  "Learning to say no to more meetings",
  "Reading one book a week this year",
  "Launching a small studio with two friends",
];

const REVIEW_OPENERS = [
  "Been coming here for weeks now and it's become my default spot.",
  "First visit, and I can already tell I'll be back.",
  "Not what I expected, in a good way.",
  "My go-to when I actually need to get things done.",
  "Stumbled in during a rainstorm and ended up staying four hours.",
  "A friend recommended this place and they were right.",
];

const REVIEW_MIDDLES = [
  "The Wi-Fi held up through two video calls without a hiccup.",
  "Noise level was perfect — enough ambient sound that I didn't feel like I was in a library, but no one was shouting into their phone.",
  "Outlets at almost every table, which shouldn't be rare but somehow still is.",
  "Coffee was genuinely excellent, not just 'fine for a work café.'",
  "Got a little crowded around lunch but it thinned out by 2pm.",
  "Staff didn't rush me out even after I'd been parked for three hours.",
  "The seating is comfortable enough that I forgot how long I'd been sitting.",
  "Natural light all afternoon made it easy to stay focused.",
];

const REVIEW_CLOSERS = [
  "Would recommend to anyone who needs a few quiet hours.",
  "Already planning my next visit.",
  "Not cheap, but worth it for the atmosphere alone.",
  "Perfect if you're working solo and want to feel a little less alone.",
  "Ideal for a first meeting with a client — professional but relaxed.",
  "Bring your charger just in case, it does get busy.",
];

const REVIEW_TAG_POOL = [
  "Great Wi-Fi", "Very quiet", "Good coffee", "Perfect for coding", "Crowded after 6 PM",
  "Comfy seating", "Lots of outlets", "Friendly staff", "Good for meetings", "Instagrammable",
  "Great for groups", "Quiet mornings", "Slow service", "Worth the price", "Good natural light",
];

const WORK_SESSION_TITLES = [
  "Working on a startup landing page", "Deep in a React refactor", "Prepping a pitch deck",
  "Studying for finals, company welcome", "Debugging a gnarly API issue", "Sketching new UI concepts",
  "Writing — open to feedback", "Reviewing a thesis chapter", "Building a side project MVP",
  "Practicing a client presentation",
];

const WORK_SESSION_CATEGORIES = [
  "Study session", "Coding session", "Startup discussion", "Design session",
  "Language exchange", "Networking", "Casual coffee",
];

const EVENT_TEMPLATES = [
  { title: "Frontend Developers Meetup", category: "Networking", description: "A casual monthly meetup for frontend developers to swap notes on frameworks, tooling, and the eternal CSS debate." },
  { title: "AI & Startup Night", category: "Startup discussion", description: "Founders and engineers building with AI share what's working, what's not, and what they wish they knew six months ago." },
  { title: "Study Together — 3 Hours", category: "Study session", description: "A silent co-working study block. Bring headphones, bring your toughest subject, leave with actual progress." },
  { title: "UX Design Coffee Meetup", category: "Design session", description: "An informal portfolio review and critique session for designers at any stage of their career." },
  { title: "Freelancer Networking Morning", category: "Networking", description: "Early coffee and introductions for freelancers and independent consultants in the city." },
  { title: "Language Exchange: English/Uzbek", category: "Language exchange", description: "Casual conversation practice, paired up by fluency level. All levels welcome." },
  { title: "Women in Tech Coffee Hour", category: "Networking", description: "An open, low-pressure gathering for women working in or entering the tech industry." },
  { title: "Indie Hackers Demo Day", category: "Startup discussion", description: "Short, informal demos of side projects and small products people are building outside their day jobs." },
  { title: "Photography Walk & Coffee", category: "Casual coffee", description: "A short neighborhood photo walk ending with coffee and a casual print swap." },
  { title: "Book Club: Product & Design", category: "Casual coffee", description: "Monthly discussion of a book on product thinking, design, or craft. Message the organizer for this month's pick." },
];

const BADGES = ["CAFE_EXPLORER", "AESTHETIC_HUNTER", "TRUSTED_REVIEWER", "CONNECTOR", "DEEP_WORKER", "CITY_EXPLORER"];

// Café-post captions — a mix of Uzbek (primary), Russian, and English, matching
// the multilingual community the app describes.
const CAFE_POST_CAPTIONS = [
  "Bugun yangi joy topdim. Juda sokin va ishlash uchun ideal ekan ☕💻",
  "Frontend developerlar uchun juda yaxshi joy. Wi-Fi tez, rozetkalar yetarli.",
  "4 soat shu yerda o'tirdim va vaqt qanday o'tganini sezmadim ham.",
  "Ertalabki smena eng yaxshisi — hali hech kim yo'q, juda tinch.",
  "Do'stim bilan uchrashdik, bu joy suhbat uchun ham, ish uchun ham mos ekan.",
  "Coffee here is genuinely worth the trip. Found my new regular spot.",
  "Working from here for the third day in a row — the light in the afternoon is unreal.",
  "Отличное место для работы: быстрый Wi-Fi, тихо, кофе прекрасный.",
  "Встретила здесь двух разработчиков, разговорились про React — хорошая атмосфера для нетворкинга.",
  "Shu yerda startup g'oyamni birinchi marta qog'ozga tushirdim.",
  "Studying for finals here — the quiet corner upstairs is a hidden gem.",
  "Bu joyning aesthetic’i Instagram uchun tayyor, lekin ishlash uchun ham zo'r.",
  "Not what I expected walking in, but ended up staying four hours.",
  "Mijoz bilan uchrashuv uchun ajoyib joy — professional, lekin issiq muhit.",
  "Weekend morning here with a book and an oat latte. Perfect.",
  "The barista here is incredibly kind and remembers my order every time.",
  "Если нужно спокойное место для учёбы — рекомендую именно сюда.",
  "Hamma narsa zo'r, faqat kechqurun biroz gavjum bo'ladi.",
  "First time trying this place for a client call — the acoustics are surprisingly good.",
  "Oddiy kofe xonasidan ko'ra ko'proq narsa — bu yerda haqiqiy hamjamiyat bor.",
];

const VIBE_POST_CAPTIONS = [
  "Bugun biroz charchagan edim, shu yerda o'zimga kelib oldim.",
  "Just needed a quiet corner and a good coffee today.",
  "Productive morning — knocked out my to-do list before noon.",
  "Сегодня просто нужно было тихое место и хороший кофе.",
  "Lo-fi, iced latte, va uzluksiz 2 soat kodlash. Perfect combo.",
  "Feeling social today — ended up chatting with three different people here.",
  "Creative block ketdi, g'oyalar qayta kela boshladi ☕🎨",
  "Night owl mode: hamma uyga ketdi, men esa hali ham shu yerdaman.",
  "Slow Sunday, good music, better coffee.",
  "Energy is at a 9/10 today and this playlist is not helping me focus, but I don't care.",
];

const VIBE_REACTIONS = ["LIKE", "SAME_VIBE", "LOVE_IT", "PRODUCTIVE"];

const VIBE_POST_MUSIC = ["Lo-fi", "Jazz", "Silence", "Ambient", "Indie", "Classical", "Podcast"];
const VIBE_POST_DRINKS = ["Iced Latte", "Cappuccino", "Cold Brew", "Flat White", "Masala Chai", "Matcha Latte", "Americano", "Hot Chocolate"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function pick<T>(arr: readonly T[]) {
  return arr[faker.number.int({ min: 0, max: arr.length - 1 })];
}

function pickMany<T>(arr: readonly T[], count: number) {
  return faker.helpers.arrayElements(arr, count);
}

function avatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=f2ead9,e0a868,8a9869`;
}

// Real café-aesthetic photography (verified, freely hotlinkable Unsplash CDN
// URLs — images.unsplash.com, not the deprecated source.unsplash.com proxy),
// grouped by category. A string-hash picks a deterministic-but-varied photo
// per seed, so re-running the seed script always produces the same result.
const CAFE_INTERIOR_PHOTOS = [
  "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56",
  "https://images.unsplash.com/photo-1551887196-72e32bfc7bf3",
  "https://images.unsplash.com/photo-1469631423273-6995642a6a40",
  "https://images.unsplash.com/photo-1564849744694-348ecd00c279",
  "https://images.unsplash.com/photo-1680528221511-e495d841c4e5",
  "https://images.unsplash.com/photo-1645677020082-721a854c24f2",
  "https://images.unsplash.com/photo-1633583960343-e258fb899aef",
  "https://images.unsplash.com/photo-1696350826221-983026d1c627",
  "https://images.unsplash.com/photo-1590741861173-85035e8af62c",
  "https://images.unsplash.com/photo-1561336635-c0e118ad72a0",
  "https://images.unsplash.com/photo-1785302710677-69cc4ea97bee",
  "https://images.unsplash.com/photo-1792325416561-76b46e59783c",
  "https://images.unsplash.com/photo-1691758685047-8edbbf25152b",
  "https://images.unsplash.com/photo-1653754056000-bcc6c5a402ff",
  "https://images.unsplash.com/photo-1615847014013-0dfa967ba04f",
  "https://images.unsplash.com/photo-1774178290359-a0be2aa88ade",
];

const WORK_LAPTOP_PHOTOS = [
  "https://images.unsplash.com/photo-1762923756718-264874c14249",
  "https://images.unsplash.com/photo-1623658877772-69ae99a89304",
  "https://images.unsplash.com/photo-1739292774739-ee38cd9a5735",
  "https://images.unsplash.com/photo-1739300293091-6e187cdf4b2c",
  "https://images.unsplash.com/photo-1739303987861-1b0c1104b747",
  "https://images.unsplash.com/photo-1650097364104-eef0e54af0da",
];

const COFFEE_CLOSEUP_PHOTOS = [
  "https://images.unsplash.com/photo-1579265898841-79c7890d69cf",
  "https://images.unsplash.com/photo-1559001724-fbad036dbc9e",
  "https://images.unsplash.com/photo-1495862433577-132cf20d7902",
  "https://images.unsplash.com/photo-1496582490020-60c1344c64aa",
  "https://images.unsplash.com/photo-1602094689189-a7cb72dc1ff9",
  "https://images.unsplash.com/photo-1599549192669-6baac5d32432",
  "https://images.unsplash.com/photo-1763037583719-1230a5033730",
  "https://images.unsplash.com/photo-1532713107108-dfb5d8d2fc42",
  "https://images.unsplash.com/photo-1670404161009-29548c027d06",
];

const PASTRY_PHOTOS = [
  "https://images.unsplash.com/photo-1587241321921-91a834d6d191",
  "https://images.unsplash.com/photo-1583338917451-face2751d8d5",
  "https://images.unsplash.com/photo-1571942948809-74637bfc59b9",
  "https://images.unsplash.com/photo-1705972018470-a89eda1c6ce4",
  "https://images.unsplash.com/photo-1711141326113-e6b607fd78ef",
];

function hashIndex(seed: string, length: number) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return hash % length;
}

function photoFrom(pool: string[], seed: string, w: number, h: number) {
  const base = pool[hashIndex(seed, pool.length)];
  return `${base}?q=80&w=${w}&h=${h}&auto=format&fit=crop`;
}

function cafeInteriorPhoto(seed: string) {
  return photoFrom(CAFE_INTERIOR_PHOTOS, seed, 1200, 800);
}
function workPhoto(seed: string) {
  return photoFrom(WORK_LAPTOP_PHOTOS, seed, 1200, 800);
}
function coffeePhoto(seed: string) {
  return photoFrom(COFFEE_CLOSEUP_PHOTOS, seed, 800, 800);
}
function pastryPhoto(seed: string) {
  return photoFrom(PASTRY_PHOTOS, seed, 800, 800);
}
function menuPhotoFor(category: MenuCategory, seed: string) {
  switch (category) {
    case "DESSERTS":
    case "BREAKFAST":
    case "LUNCH":
      return pastryPhoto(seed);
    case "COFFEE":
    case "TEA":
    case "DRINKS":
    default:
      return coffeePhoto(seed);
  }
}

function vibeScoreOf(c: (typeof CAFE_SEEDS)[number]) {
  return Math.round(
    c.workScore * 0.25 +
      c.wifiScore * 0.15 +
      c.coffeeScore * 0.15 +
      c.aestheticScore * 0.15 +
      c.networkingScore * 0.1 +
      c.studyScore * 0.1 +
      c.seatingComfortScore * 0.1,
  );
}

const OPENING_HOURS = {
  mon: { open: "07:30", close: "22:00" },
  tue: { open: "07:30", close: "22:00" },
  wed: { open: "07:30", close: "22:00" },
  thu: { open: "07:30", close: "22:00" },
  fri: { open: "07:30", close: "23:00" },
  sat: { open: "08:30", close: "23:00" },
  sun: { open: "08:30", close: "21:00" },
};

const LATE_HOURS = {
  mon: { open: "00:00", close: "23:59" },
  tue: { open: "00:00", close: "23:59" },
  wed: { open: "00:00", close: "23:59" },
  thu: { open: "00:00", close: "23:59" },
  fri: { open: "00:00", close: "23:59" },
  sat: { open: "00:00", close: "23:59" },
  sun: { open: "00:00", close: "23:59" },
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("Clearing existing data...");
  await prisma.$transaction([
    prisma.promoCodeRedemption.deleteMany(),
    prisma.promoCode.deleteMany(),
    prisma.coinTransaction.deleteMany(),
    prisma.subscription.deleteMany(),
    prisma.commentLike.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.postLike.deleteMany(),
    prisma.postSave.deleteMany(),
    prisma.postImage.deleteMany(),
    prisma.post.deleteMany(),
    prisma.follow.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.message.deleteMany(),
    prisma.workSessionParticipant.deleteMany(),
    prisma.workSession.deleteMany(),
    prisma.eventParticipant.deleteMany(),
    prisma.event.deleteMany(),
    prisma.cafeVisit.deleteMany(),
    prisma.connection.deleteMany(),
    prisma.reviewLike.deleteMany(),
    prisma.reviewImage.deleteMany(),
    prisma.review.deleteMany(),
    prisma.favorite.deleteMany(),
    prisma.collection.deleteMany(),
    prisma.menuItem.deleteMany(),
    prisma.menu.deleteMany(),
    prisma.cafeImage.deleteMany(),
    prisma.cafe.deleteMany(),
    prisma.cafeAmenity.deleteMany(),
    prisma.profile.deleteMany(),
    prisma.interest.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  console.log("Creating amenities & interests...");
  const amenities = await Promise.all(
    AMENITIES.map((a) => prisma.cafeAmenity.create({ data: a })),
  );
  const interests = await Promise.all(
    INTERESTS.map((name) => prisma.interest.create({ data: { name, category: "general" } })),
  );

  console.log("Creating cafés, menus & images...");
  const cafes: Awaited<ReturnType<typeof prisma.cafe.create>>[] = [];
  for (const seed of CAFE_SEEDS) {
    const slug = slugify(seed.name);
    const cafe = await prisma.cafe.create({
      data: {
        slug,
        name: seed.name,
        tagline: seed.tagline,
        description: seed.description,
        address: `${faker.number.int({ min: 1, max: 140 })} ${pick(STREETS)}`,
        city: seed.city,
        neighborhood: pick(NEIGHBORHOODS[seed.city]),
        lat: 41.29 + faker.number.float({ min: -0.08, max: 0.08, fractionDigits: 4 }),
        lng: 69.24 + faker.number.float({ min: -0.08, max: 0.08, fractionDigits: 4 }),
        priceLevel: seed.priceLevel,
        avgPriceUsd: seed.priceLevel * 3.5,
        openingHours: seed.isOpenLate ? LATE_HOURS : OPENING_HOURS,
        wifiScore: seed.wifiScore,
        outletsScore: seed.outletsScore,
        seatingComfortScore: seed.seatingComfortScore,
        coffeeScore: seed.coffeeScore,
        foodScore: seed.foodScore,
        workScore: seed.workScore,
        studyScore: seed.studyScore,
        networkingScore: seed.networkingScore,
        aestheticScore: seed.aestheticScore,
        vibeScore: vibeScoreOf(seed),
        noiseLevel: seed.noiseLevel,
        crowdLevel: seed.crowdLevel,
        hasOutdoorSeating: seed.hasOutdoorSeating,
        isPetFriendly: seed.isPetFriendly,
        isLaptopFriendly: seed.workScore > 55,
        isMeetingFriendly: seed.isMeetingFriendly,
        isGroupFriendly: seed.isGroupFriendly,
        isOpenLate: seed.isOpenLate,
        moodTags: seed.moods,
        heroImageUrl: cafeInteriorPhoto(`${slug}-hero`),
        rating: 0,
        reviewCount: 0,
        featured: seed.featured ?? false,
        amenities: {
          connect: pickMany(amenities, faker.number.int({ min: 5, max: 9 })).map((a) => ({ id: a.id })),
        },
        images: {
          create: Array.from({ length: faker.number.int({ min: 4, max: 6 }) }, (_, i) => ({
            url: i % 3 === 2 ? coffeePhoto(`${slug}-gallery-${i}`) : cafeInteriorPhoto(`${slug}-gallery-${i}`),
            alt: `${seed.name} interior`,
            position: i,
          })),
        },
      },
    });

    const categories = Object.keys(MENU_POOL) as MenuCategory[];
    const items = categories.flatMap((cat) => {
      const pool = MENU_POOL[cat];
      const count = cat === "COFFEE" ? 4 : 2;
      return pickMany(pool, Math.min(count, pool.length)).map((item, idx) => ({
        category: cat,
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: menuPhotoFor(cat, `${slug}-menu-${cat}-${idx}`),
        isPopular: idx === 0,
      }));
    });
    // top up to 15 items per café by repeating a few extra coffee/dessert picks
    while (items.length < 15) {
      const cat = pick(categories);
      const pool = MENU_POOL[cat];
      const extra = pick(pool);
      if (!items.find((i) => i.name === extra.name)) {
        items.push({
          category: cat,
          name: extra.name,
          description: extra.description,
          price: extra.price,
          imageUrl: menuPhotoFor(cat, `${slug}-menu-extra-${items.length}`),
          isPopular: false,
        });
      }
    }

    await prisma.menu.create({
      data: { cafeId: cafe.id, items: { create: items } },
    });

    cafes.push(cafe);
  }

  console.log("Creating users & profiles...");
  const demoPasswordHash = await bcrypt.hash("password123", 10);

  const adminUser = await prisma.user.create({
    data: {
      name: "Tanzila",
      email: "admin@vibecafe.app",
      hashedPassword: await bcrypt.hash("admin1234", 10),
      role: "ADMIN",
      image: avatarUrl("admin-tanzila"),
      profile: {
        create: {
          profession: "Frontend Developer",
          bio: "Building VIBECAFE. Drinking coffee, looking for interesting people.",
          location: "Tashkent",
          skills: ["React", "TypeScript", "Design Systems"],
          goals: "Launch VIBECAFE to the community",
          isOpenToNetworking: true,
          isVisibleForNetworking: true,
          networkingMessage: "Building a café discovery platform — always happy to chat about product or coffee.",
          points: 420,
          badges: ["TRUSTED_REVIEWER", "CONNECTOR"],
          coins: 850,
          currentStreak: 12,
          longestStreak: 30,
          lastActiveDate: new Date(),
          streakFreezes: 3,
          interests: { connect: pickMany(interests, 5).map((i) => ({ id: i.id })) },
        },
      },
      collections: {
        create: [
          { name: "Favorite cafés", icon: "Heart" },
          { name: "Best workspaces", icon: "Laptop" },
          { name: "Study spots", icon: "BookOpen" },
        ],
      },
    },
  });

  const users = [adminUser];
  for (let i = 0; i < 29; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const name = `${firstName} ${lastName}`;
    const email = faker.internet.email({ firstName, lastName, provider: "example.com" }).toLowerCase();
    const profession = pick(PROFESSIONS);
    const userInterests = pickMany(interests, faker.number.int({ min: 3, max: 6 }));
    const openToNetworking = faker.datatype.boolean({ probability: 0.55 });

    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword: demoPasswordHash,
        image: avatarUrl(email),
        profile: {
          create: {
            profession,
            bio: pick(BIO_TEMPLATES)(profession),
            location: pick(["Tashkent", "Tashkent", "Tashkent", "Samarkand", "Bukhara"]),
            skills: pickMany(INTERESTS, faker.number.int({ min: 2, max: 5 })),
            goals: pick(GOALS),
            isOpenToNetworking: openToNetworking,
            isVisibleForNetworking: openToNetworking && faker.datatype.boolean({ probability: 0.7 }),
            networkingMessage: openToNetworking
              ? `Working on ${faker.company.catchPhrase().toLowerCase()}. Happy to meet other ${pick(["developers", "designers", "founders", "builders"])}.`
              : null,
            points: faker.number.int({ min: 0, max: 650 }),
            badges: pickMany(BADGES, faker.number.int({ min: 0, max: 3 })),
            currentCafeId: faker.datatype.boolean({ probability: 0.3 }) ? pick(cafes).id : null,
            coins: faker.number.int({ min: 0, max: 400 }),
            currentStreak: faker.number.int({ min: 0, max: 21 }),
            longestStreak: faker.number.int({ min: 0, max: 40 }),
            lastActiveDate: faker.datatype.boolean({ probability: 0.6 }) ? faker.date.recent({ days: 3 }) : null,
            interests: { connect: userInterests.map((int) => ({ id: int.id })) },
          },
        },
        collections: {
          create: [
            { name: "Favorite cafés", icon: "Heart" },
            { name: "Best workspaces", icon: "Laptop" },
            { name: "Study spots", icon: "BookOpen" },
          ],
        },
      },
    });
    users.push(user);
  }

  console.log("Creating subscriptions & coin history...");
  await prisma.subscription.create({
    data: { userId: adminUser.id, plan: "PRO", renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  });
  const paidUsers = pickMany(users.filter((u) => u.id !== adminUser.id), 8);
  for (const [index, user] of paidUsers.entries()) {
    const plan = index < 3 ? "PRO" : "PLUS";
    await prisma.subscription.create({
      data: { userId: user.id, plan, renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    });
  }
  const coinEarners = pickMany(users, 20);
  for (const user of coinEarners) {
    const transactions = Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () => ({
      userId: user.id,
      amount: pick([5, 8, 10, 12, 20, 50]),
      reason: pick(["CHECK_IN", "POST", "REVIEW", "STREAK_BONUS", "SUBSCRIPTION_BONUS"]),
      createdAt: faker.date.recent({ days: 20 }),
    }));
    await prisma.coinTransaction.createMany({ data: transactions });
  }

  console.log("Creating promo codes...");
  const promoCafes = pickMany(cafes, 6);
  const promoCodeSeeds: {
    code: string; title: string; description: string; discountPercent: number; requiredPlan: "FREE" | "PLUS" | "PRO"; maxRedemptions?: number;
  }[] = [
    { code: "VIBE10", title: "10% chegirma", description: "Har qanday ichimlikka 10% chegirma.", discountPercent: 10, requiredPlan: "PLUS" },
    { code: "VIBEPLUS15", title: "Plus a'zolar uchun 15%", description: "Butun menyuga 15% chegirma.", discountPercent: 15, requiredPlan: "PLUS" },
    { code: "PROVIP20", title: "Pro VIP 20%", description: "Pro a'zolar uchun maxsus 20% chegirma.", discountPercent: 20, requiredPlan: "PRO", maxRedemptions: 50 },
    { code: "MORNINGBOOST", title: "Ertalabki kofe +10%", description: "Soat 9:00 gacha kofega 10% chegirma.", discountPercent: 10, requiredPlan: "FREE" },
    { code: "WORKWEEK", title: "Ish haftasi maxsusi", description: "Dush-Juma kunlari noutbuk bilan kelganlarga 12% chegirma.", discountPercent: 12, requiredPlan: "PLUS" },
    { code: "STUDYNIGHT", title: "Kechki smena", description: "21:00 dan keyin 15% chegirma.", discountPercent: 15, requiredPlan: "PRO" },
  ];
  const promoCodes: Awaited<ReturnType<typeof prisma.promoCode.create>>[] = [];
  for (const [index, seedData] of promoCodeSeeds.entries()) {
    const promo = await prisma.promoCode.create({
      data: { ...seedData, cafeId: promoCafes[index % promoCafes.length].id },
    });
    promoCodes.push(promo);
  }

  const redeemers = pickMany(users, 10);
  for (const user of redeemers) {
    const promo = pick(promoCodes);
    await prisma.promoCodeRedemption.create({ data: { promoCodeId: promo.id, userId: user.id } }).catch(() => null);
  }

  console.log("Creating reviews...");
  const reviewTargets = Array.from({ length: 50 }, () => ({
    cafe: pick(cafes),
    user: pick(users),
  }));
  const reviews = [];
  for (const { cafe, user } of reviewTargets) {
    const rating = faker.number.int({ min: 3, max: 5 });
    const body = `${pick(REVIEW_OPENERS)} ${pick(REVIEW_MIDDLES)} ${pick(REVIEW_MIDDLES)} ${pick(REVIEW_CLOSERS)}`;
    const review = await prisma.review.create({
      data: {
        cafeId: cafe.id,
        userId: user.id,
        rating,
        body,
        tags: pickMany(REVIEW_TAG_POOL, faker.number.int({ min: 2, max: 4 })),
        coffeeRating: faker.number.int({ min: 3, max: 5 }),
        wifiRating: faker.number.int({ min: 2, max: 5 }),
        quietnessRating: faker.number.int({ min: 2, max: 5 }),
        workRating: faker.number.int({ min: 2, max: 5 }),
        aestheticRating: faker.number.int({ min: 3, max: 5 }),
        likeCount: faker.number.int({ min: 0, max: 42 }),
        createdAt: faker.date.recent({ days: 120 }),
        images: faker.datatype.boolean({ probability: 0.25 })
          ? { create: [{ url: cafeInteriorPhoto(`review-${cafe.slug}-${user.id}`) }] }
          : undefined,
      },
    });
    reviews.push(review);
  }

  // like a handful of reviews
  for (const review of faker.helpers.arrayElements(reviews, 30)) {
    const likers = pickMany(users, faker.number.int({ min: 1, max: 5 }));
    for (const liker of likers) {
      await prisma.reviewLike.upsert({
        where: { reviewId_userId: { reviewId: review.id, userId: liker.id } },
        update: {},
        create: { reviewId: review.id, userId: liker.id },
      });
    }
  }

  console.log("Recomputing café ratings...");
  for (const cafe of cafes) {
    const agg = await prisma.review.aggregate({
      where: { cafeId: cafe.id },
      _avg: { rating: true },
      _count: true,
    });
    await prisma.cafe.update({
      where: { id: cafe.id },
      data: {
        rating: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : 4.5,
        reviewCount: agg._count,
      },
    });
  }

  console.log("Creating favorites & collections...");
  for (const user of users) {
    const favCafes = pickMany(cafes, faker.number.int({ min: 2, max: 7 }));
    const collections = await prisma.collection.findMany({ where: { userId: user.id } });
    for (const cafe of favCafes) {
      await prisma.favorite.upsert({
        where: { userId_cafeId: { userId: user.id, cafeId: cafe.id } },
        update: {},
        create: {
          userId: user.id,
          cafeId: cafe.id,
          collectionId: faker.datatype.boolean({ probability: 0.6 }) ? pick(collections).id : null,
        },
      });
    }
  }

  console.log("Creating connections...");
  const connectionPairs = new Set<string>();
  let connectionsCreated = 0;
  while (connectionsCreated < 40) {
    const a = pick(users);
    const b = pick(users);
    if (a.id === b.id) continue;
    const key = [a.id, b.id].sort().join(":");
    if (connectionPairs.has(key)) continue;
    connectionPairs.add(key);
    await prisma.connection.create({
      data: {
        requesterId: a.id,
        recipientId: b.id,
        status: pick(["PENDING", "ACCEPTED", "ACCEPTED", "DECLINED"]),
        message: faker.datatype.boolean({ probability: 0.5 })
          ? `Saw we're both into ${pick(INTERESTS)} — would love to connect.`
          : null,
      },
    });
    connectionsCreated++;
  }

  console.log("Creating café visits...");
  for (const user of users) {
    const visitCafes = pickMany(cafes, faker.number.int({ min: 1, max: 10 }));
    for (const cafe of visitCafes) {
      await prisma.cafeVisit.create({
        data: { userId: user.id, cafeId: cafe.id, visitedAt: faker.date.recent({ days: 90 }) },
      });
    }
  }

  console.log("Creating events...");
  for (const template of EVENT_TEMPLATES) {
    const cafe = pick(cafes);
    const organizer = pick(users);
    const startAt = faker.date.soon({ days: 30 });
    const endAt = new Date(startAt.getTime() + faker.number.int({ min: 1, max: 3 }) * 60 * 60 * 1000);
    const event = await prisma.event.create({
      data: {
        slug: `${slugify(template.title)}-${faker.string.alphanumeric(5).toLowerCase()}`,
        cafeId: cafe.id,
        organizerId: organizer.id,
        title: template.title,
        description: template.description,
        category: template.category,
        startAt,
        endAt,
        capacity: faker.number.int({ min: 10, max: 40 }),
        imageUrl: cafeInteriorPhoto(`event-${slugify(template.title)}`),
      },
    });
    const participants = pickMany(
      users.filter((u) => u.id !== organizer.id),
      faker.number.int({ min: 3, max: 16 }),
    );
    for (const p of participants) {
      await prisma.eventParticipant.create({ data: { eventId: event.id, userId: p.id } });
    }
  }

  console.log("Creating work-with-me sessions...");
  for (let i = 0; i < 16; i++) {
    const user = pick(users);
    const cafe = pick(cafes);
    const untilHoursFromNow = faker.number.int({ min: 1, max: 5 });
    const session = await prisma.workSession.create({
      data: {
        userId: user.id,
        cafeId: cafe.id,
        title: pick(WORK_SESSION_TITLES),
        category: pick(WORK_SESSION_CATEGORIES),
        topics: pickMany(INTERESTS, faker.number.int({ min: 1, max: 3 })),
        untilTime: new Date(Date.now() + untilHoursFromNow * 60 * 60 * 1000),
        isActive: true,
      },
    });
    const joiners = pickMany(
      users.filter((u) => u.id !== user.id),
      faker.number.int({ min: 0, max: 4 }),
    );
    for (const joiner of joiners) {
      await prisma.workSessionParticipant.create({ data: { workSessionId: session.id, userId: joiner.id } });
    }
  }

  console.log("Creating notifications...");
  for (const user of pickMany(users, 15)) {
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "SYSTEM",
        title: "Welcome to VIBECAFE",
        body: "Set your vibe for today and we'll recommend the best spots nearby.",
        isRead: faker.datatype.boolean(),
      },
    });
  }

  console.log("Creating follows...");
  const followPairs = new Set<string>();
  let followsCreated = 0;
  while (followsCreated < 90) {
    const follower = pick(users);
    const target = pick(users);
    if (follower.id === target.id) continue;
    const key = `${follower.id}:${target.id}`;
    if (followPairs.has(key)) continue;
    followPairs.add(key);
    await prisma.follow.create({ data: { followerId: follower.id, followingId: target.id } });
    followsCreated++;
  }

  console.log("Creating posts...");
  const POST_VIBE_TAGS = ["Cozy", "Work", "Study", "Creative", "Social", "Calm", "Aesthetic"];
  const VIBE_MOOD_KEYS = ["COZY", "FOCUSED", "PRODUCTIVE", "CALM", "CREATIVE", "SOCIAL", "ENERGETIC", "NIGHT_OWL", "TALKATIVE", "PEACEFUL"];
  const posts: Awaited<ReturnType<typeof prisma.post.create>>[] = [];

  for (let i = 0; i < 90; i++) {
    const user = pick(users);
    const cafe = pick(cafes);
    const isVibePost = faker.datatype.boolean({ probability: 0.35 });
    const slug = cafe.slug;

    const post = await prisma.post.create({
      data: {
        userId: user.id,
        cafeId: cafe.id,
        type: isVibePost ? "VIBE_POST" : "CAFE_POST",
        caption: isVibePost ? pick(VIBE_POST_CAPTIONS) : pick(CAFE_POST_CAPTIONS),
        vibeTags: pickMany(POST_VIBE_TAGS, faker.number.int({ min: 1, max: 3 })),
        coffeeRating: !isVibePost ? faker.number.int({ min: 3, max: 5 }) : null,
        atmosphereRating: !isVibePost ? faker.number.int({ min: 3, max: 5 }) : null,
        workRating: !isVibePost ? faker.number.int({ min: 3, max: 5 }) : null,
        wifiRating: !isVibePost ? faker.number.int({ min: 2, max: 5 }) : null,
        mood: isVibePost ? pick(VIBE_MOOD_KEYS) : null,
        energy: isVibePost ? faker.number.int({ min: 3, max: 10 }) : null,
        workingHours: isVibePost ? faker.number.int({ min: 1, max: 5 }) : null,
        music: isVibePost ? pick(VIBE_POST_MUSIC) : null,
        drink: isVibePost ? pick(VIBE_POST_DRINKS) : null,
        createdAt: faker.date.recent({ days: 45 }),
        images: {
          create: Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, (_, idx) => {
            const seed = `post-${slug}-${user.id}-${i}-${idx}`;
            const url = isVibePost
              ? (idx % 2 === 0 ? workPhoto(seed) : coffeePhoto(seed))
              : (idx % 3 === 0 ? cafeInteriorPhoto(seed) : idx % 3 === 1 ? coffeePhoto(seed) : pastryPhoto(seed));
            return { url, position: idx };
          }),
        },
      },
    });
    posts.push(post);
  }

  console.log("Creating post likes & comments...");
  const COMMENT_BODIES = [
    "Bu joyda Wi-Fi qanday?",
    "Juda yaxshi, men 3 soat ishladim.",
    "Manzilini yuborasizmi?",
    "Men ham shu yerga borib ko'raman.",
    "Qaysi stolda o'tirdingiz, qulayroq joy bormi?",
    "Отличное фото! Как там с розетками?",
    "Выглядит очень уютно, нужно будет заглянуть.",
    "Looks amazing, adding this to my list.",
    "How's the noise level in the evening?",
    "This is exactly the vibe I needed today.",
    "Saved — going there this weekend.",
    "Qanday kofe buyurtma qildingiz?",
  ];

  for (const post of posts) {
    const likers = pickMany(users, faker.number.int({ min: 0, max: 18 }));
    for (const liker of likers) {
      await prisma.postLike.upsert({
        where: { postId_userId: { postId: post.id, userId: liker.id } },
        update: {},
        create: { postId: post.id, userId: liker.id, reaction: pick(VIBE_REACTIONS) },
      });
    }

    const commenters = pickMany(users, faker.number.int({ min: 0, max: 5 }));
    for (const commenter of commenters) {
      await prisma.comment.create({
        data: { postId: post.id, userId: commenter.id, body: pick(COMMENT_BODIES) },
      });
    }

    const savers = pickMany(users, faker.number.int({ min: 0, max: 4 }));
    for (const saver of savers) {
      await prisma.postSave.upsert({
        where: { postId_userId: { postId: post.id, userId: saver.id } },
        update: {},
        create: { postId: post.id, userId: saver.id },
      });
    }

    const [likeCount, commentCount] = await Promise.all([
      prisma.postLike.count({ where: { postId: post.id } }),
      prisma.comment.count({ where: { postId: post.id } }),
    ]);
    await prisma.post.update({ where: { id: post.id }, data: { likeCount, commentCount } });
  }

  console.log("Seed complete:", {
    cafes: cafes.length,
    users: users.length,
    reviews: reviews.length,
    amenities: amenities.length,
    interests: interests.length,
    posts: posts.length,
    subscriptions: paidUsers.length + 1,
    promoCodes: promoCodes.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
