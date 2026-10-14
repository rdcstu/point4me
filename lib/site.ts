// ============================================================
// SITE SETTINGS — change the brand name and copy in one place
// Prompt: "Rename the site to [Name]"
// ============================================================

export const site = {
  name: "Point4MePoint4Free",
  tagline: "Turn points into trips",
  description:
    "Search every airline loyalty program at once and see exactly how to book award flights with the credit card points you already have.",
  announcement: "New: price alerts for award seats are live",
};

export type Deal = {
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  cabin: "Economy" | "Premium" | "Business" | "First";
  program: string;
  points: number;
  cashPrice: number;
  taxes: number;
  rating: "GREAT DEAL" | "GOOD DEAL";
  gradient: string;
};

// Sample data for the demo. Replace with live search results later.
export const deals: Deal[] = [
  { from: "San Francisco", fromCode: "SFO", to: "Tokyo", toCode: "HND", cabin: "Business", program: "Partner airline program", points: 75000, cashPrice: 4820, taxes: 86, rating: "GREAT DEAL", gradient: "from-rose-400 via-fuchsia-500 to-indigo-600" },
  { from: "Los Angeles", fromCode: "LAX", to: "Paris", toCode: "CDG", cabin: "Business", program: "Transfer partner program", points: 60000, cashPrice: 3950, taxes: 112, rating: "GREAT DEAL", gradient: "from-sky-400 via-blue-500 to-indigo-700" },
  { from: "New York", fromCode: "JFK", to: "Rome", toCode: "FCO", cabin: "Premium", program: "Partner airline program", points: 45000, cashPrice: 1890, taxes: 64, rating: "GOOD DEAL", gradient: "from-amber-300 via-orange-400 to-rose-500" },
  { from: "Seattle", fromCode: "SEA", to: "Honolulu", toCode: "HNL", cabin: "Economy", program: "Domestic airline program", points: 12500, cashPrice: 489, taxes: 6, rating: "GOOD DEAL", gradient: "from-emerald-300 via-teal-400 to-cyan-600" },
  { from: "San Jose", fromCode: "SJC", to: "London", toCode: "LHR", cabin: "First", program: "Transfer partner program", points: 85000, cashPrice: 9200, taxes: 210, rating: "GREAT DEAL", gradient: "from-violet-400 via-purple-500 to-slate-800" },
  { from: "Chicago", fromCode: "ORD", to: "Cancún", toCode: "CUN", cabin: "Economy", program: "Domestic airline program", points: 15000, cashPrice: 540, taxes: 38, rating: "GOOD DEAL", gradient: "from-yellow-300 via-lime-400 to-emerald-500" },
];

export const features = [
  { title: "Every program, one search", body: "Compare award space across dozens of airline programs instead of checking each site one by one." },
  { title: "Uses the points you have", body: "Tell us which cards you hold and we only show flights you can actually book." },
  { title: "Step-by-step booking", body: "Clear instructions for which points to transfer, where, and how to finish the booking." },
  { title: "Know a good deal", body: "Every result shows its cents-per-point value so you can tell a steal from a waste." },
];

export const steps = [
  { title: "Add your wallet", body: "Pick the credit card and airline programs you collect points with." },
  { title: "Search a route", body: "Enter where and when. We scan award availability across programs." },
  { title: "Book with confidence", body: "Follow the guided transfer-and-book steps. No guesswork." },
];

export const plans = [
  {
    name: "Explorer",
    price: "Free",
    period: "",
    blurb: "Get a feel for what your points can do.",
    features: ["Browse curated deals", "Points value calculator", "Weekly deals email"],
    cta: "Start exploring",
    highlight: false,
  },
  {
    name: "Member",
    price: "$12",
    period: "/month",
    blurb: "For travelers who book a few award trips a year.",
    features: ["Unlimited award searches", "Personalized wallet filtering", "Seat alerts on saved routes", "Booking instructions for every result"],
    cta: "Become a member",
    highlight: true,
  },
  {
    name: "Concierge",
    price: "$150",
    period: "/trip",
    blurb: "We find and help book the trip for you.",
    features: ["Expert-planned itinerary", "Help with transfers", "Priority support"],
    cta: "Get expert help",
    highlight: false,
  },
];

export const examples = [
  { route: "SFO → Tokyo, Business", cash: 4820, points: 75000, taxes: 86 },
  { route: "LAX → Paris, Business", cash: 3950, points: 60000, taxes: 112 },
  { route: "JFK → Rome, Premium", cash: 1890, points: 45000, taxes: 64 },
];

export const faqs = [
  { q: "Do I need a lot of points to use this?", a: "No. Even a modest balance can cover a domestic flight, and the search shows what your current balance can reach." },
  { q: "Which points work?", a: "Flexible credit card points that transfer to airline partners, plus points you already hold directly in airline programs." },
  { q: "Do you book the flight for me?", a: "Search and booking instructions are self-serve. If you'd rather hand it off, the Concierge plan does the legwork with you." },
  { q: "How is a deal rated?", a: "We compare the cash fare to the points plus taxes and calculate the cents you get per point. Higher value earns a better rating." },
  { q: "Is award availability live?", a: "This demo uses sample data. A production version would query program availability and refresh results on each search." },
];
