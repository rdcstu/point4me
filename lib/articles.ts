// ============================================================
// INSIDER ARTICLES — the content behind /insider
// Add an article by appending to `articles`. Body blocks:
//   { h: "Heading" }  { p: "Paragraph" }  { list: ["item", ...] }  { tip: "Callout" }
// ============================================================

export type CategoryId = "news" | "deals" | "cards" | "education" | "travel" | "product";

export const categories: { id: CategoryId; name: string; blurb: string; gradient: string }[] = [
  { id: "news", name: "News", blurb: "What's new at Point4MePoint4Free.", gradient: "from-sky-400 via-blue-500 to-indigo-700" },
  { id: "deals", name: "Deals", blurb: "How to spot and grab award deals before they're gone.", gradient: "from-rose-400 via-fuchsia-500 to-indigo-600" },
  { id: "cards", name: "Cards", blurb: "Choosing and using the credit cards that earn transferable points.", gradient: "from-amber-300 via-orange-400 to-rose-500" },
  { id: "education", name: "Education", blurb: "The fundamentals of points, miles and award travel.", gradient: "from-emerald-300 via-teal-400 to-cyan-600" },
  { id: "travel", name: "Travel", blurb: "Trip planning ideas that stretch your points further.", gradient: "from-violet-400 via-purple-500 to-slate-800" },
  { id: "product", name: "Product", blurb: "How to get the most out of our search and alerts.", gradient: "from-yellow-300 via-lime-400 to-emerald-500" },
];

export type Block = { h: string } | { p: string } | { list: string[] } | { tip: string };

export type Article = {
  slug: string;
  category: CategoryId;
  title: string;
  summary: string;
  date: string; // YYYY-MM-DD
  author: string;
  emoji: string; // shown on the cover
  featured?: boolean;
  trending?: boolean;
  body: Block[];
};

const TEAM = "Point4Me Editorial Team";

export const articles: Article[] = [
  {
    slug: "points-vs-cash-when-to-use-each",
    category: "education",
    title: "Points or cash? A simple test for every booking",
    summary: "Work out what a point is worth on a specific flight in under a minute, and know when paying cash is the smarter move.",
    date: "2026-10-16",
    author: TEAM,
    emoji: "🧮",
    featured: true,
    trending: true,
    body: [
      { p: "Every award booking is a trade: you give up points that could be used elsewhere to avoid paying cash today. The easiest way to judge that trade is cents per point (cpp)." },
      { h: "The formula" },
      { p: "Take the cash price of the ticket, subtract the taxes and fees you'd still pay on the award, then divide by the number of points. Multiply by 100 to get cents." },
      { tip: "Example: a $3,950 business-class fare that costs 60,000 points plus $112 in taxes works out to ($3,950 − $112) ÷ 60,000 × 100 ≈ 6.4 cents per point." },
      { h: "What counts as a good value?" },
      { list: [
        "Below about 1 cent: usually better to pay cash and keep your points.",
        "Around 1–1.5 cents: fine if you have points to spare or the cash price is painful.",
        "Above 2 cents: a strong redemption, often in premium cabins.",
      ] },
      { p: "These are rules of thumb, not fixed values. Points you'll never use are worth less to you, and points from flexible programs are worth more because you have options." },
      { h: "When cash wins" },
      { list: [
        "Cheap economy fares where the award costs a lot of points.",
        "Trips where a paid ticket earns elite status or miles you actually need.",
        "When the award has high carrier-imposed surcharges that cancel out the savings.",
      ] },
      { p: "Our deal cards show cents per point on every result so you can make this call at a glance." },
    ],
  },
  {
    slug: "how-transfer-partners-work",
    category: "education",
    title: "Transfer partners, explained without the jargon",
    summary: "Why flexible credit card points are so valuable, how transfers work, and the one rule to follow before you move any points.",
    date: "2026-10-14",
    author: TEAM,
    emoji: "🔁",
    trending: true,
    body: [
      { p: "Many credit card programs let you move your points into airline and hotel loyalty programs. Those airlines and hotels are called transfer partners." },
      { h: "Why it matters" },
      { p: "One balance of flexible points can become miles in several different airline programs. Since programs price the same flight differently, being able to choose is where the big savings come from." },
      { h: "How a transfer works" },
      { list: [
        "Link your airline loyalty account to your card's rewards portal.",
        "Choose how many points to send. Most transfers are at a fixed ratio, often 1:1.",
        "Many transfers arrive instantly; some take a day or more.",
      ] },
      { tip: "Golden rule: transfers almost always can't be undone. Confirm the award seat is available and bookable before you transfer a single point." },
      { h: "Watch for transfer bonuses" },
      { p: "Card programs sometimes run limited-time bonuses, such as 20–30% extra miles when you transfer to a specific partner. If you were already planning that booking, a bonus is free value." },
    ],
  },
  {
    slug: "taxes-and-fees-on-award-tickets",
    category: "education",
    title: "Why 'free' award tickets still cost money",
    summary: "Government taxes, airport fees and carrier surcharges explained, and how to choose programs that keep them low.",
    date: "2026-10-09",
    author: TEAM,
    emoji: "🧾",
    body: [
      { p: "Points cover the base fare, but award tickets almost always come with some cash due at booking." },
      { h: "The three kinds of extra charges" },
      { list: [
        "Government taxes, which every passenger pays regardless of how the ticket is booked.",
        "Airport fees charged by the departure or arrival airport.",
        "Carrier-imposed surcharges, which some airlines add to award tickets and others don't.",
      ] },
      { p: "The first two are usually modest. Surcharges are what turn a great-looking award into a poor one, and they vary a lot by program and route." },
      { tip: "The same seat can be bookable through more than one program. Compare the cash due across programs, not just the points, before you transfer." },
      { h: "Keeping fees low" },
      { list: [
        "Check whether the program you're booking through passes on surcharges.",
        "Look at different departure airports; some countries charge much higher departure taxes.",
        "Use our points-vs-cash view, which shows the taxes next to every price.",
      ] },
    ],
  },
  {
    slug: "spotting-a-great-award-deal",
    category: "deals",
    title: "How to spot a great award deal in five seconds",
    summary: "The three numbers that tell you a deal is worth grabbing, and why the best ones disappear fast.",
    date: "2026-10-15",
    author: TEAM,
    emoji: "🔥",
    trending: true,
    body: [
      { p: "Our deal cards are labelled GREAT DEAL or GOOD DEAL. Here's what we look at, so you can judge any award yourself." },
      { h: "1. Cents per point" },
      { p: "Higher is better. Premium-cabin awards on long flights often clear 3–5 cents per point, while economy awards are usually lower." },
      { h: "2. Taxes and fees" },
      { p: "A low points price can hide high surcharges. A great deal keeps the cash portion small." },
      { h: "3. Seat count and timing" },
      { p: "Award seats are released in small numbers. If you need two seats, check that two are available, and expect popular dates to go quickly." },
      { tip: "Members can save routes and get a seat alert when award space opens, instead of checking every day." },
    ],
  },
  {
    slug: "flexible-dates-find-more-seats",
    category: "deals",
    title: "Flexible by a few days? You'll find far more award seats",
    summary: "Why searching a date range beats searching a single day, and how to use it to land premium cabins.",
    date: "2026-10-07",
    author: TEAM,
    emoji: "📅",
    body: [
      { p: "Award availability changes day to day. A route that's sold out on Friday can have several seats on Tuesday." },
      { h: "Search the range, not the day" },
      { p: "Look across a week or two of dates and pick the best option. Mid-week departures are often easier to find than weekends and holidays." },
      { h: "Mix and match one-ways" },
      { p: "Most programs price awards per direction, so you can book the outbound and return separately, even in different programs, to use the best seat each way." },
      { tip: "Book the harder direction first. Once that's confirmed, the easier leg is usually simple to fill." },
    ],
  },
  {
    slug: "choosing-your-first-travel-card",
    category: "cards",
    title: "Choosing your first travel rewards card",
    summary: "What to compare before you apply: transferable points, annual fees, welcome offers and everyday earning.",
    date: "2026-10-12",
    author: TEAM,
    emoji: "💳",
    trending: true,
    body: [
      { p: "If you're new to points, the card you start with shapes everything else. Here's what to compare." },
      { h: "Transferable points first" },
      { p: "Cards that earn flexible points with airline and hotel transfer partners give you the most options. Cards that only earn one airline's miles are simpler but lock you in." },
      { h: "Annual fee vs. what you'll actually use" },
      { p: "Higher-fee cards often include credits and perks. Only count the ones you'd use anyway when deciding if the fee is worth it." },
      { h: "Welcome offers" },
      { p: "A large sign-up bonus can be enough for a round-trip flight. Make sure the required spending fits your normal budget." },
      { tip: "Only open cards you can pay in full every month. Interest charges wipe out the value of any points you earn." },
      { p: "This article is general information, not financial advice. Check each issuer's current terms before applying." },
    ],
  },
  {
    slug: "earning-on-everyday-spending",
    category: "cards",
    title: "Earn more points on spending you already do",
    summary: "Bonus categories, shopping portals and dining programs that add up to a free flight without extra spending.",
    date: "2026-10-03",
    author: TEAM,
    emoji: "🛒",
    body: [
      { p: "The biggest points balances usually come from routine spending, not big purchases." },
      { list: [
        "Use the card with the highest multiplier for each category, such as dining, groceries or travel.",
        "Start online purchases from your airline or card's shopping portal for extra points per dollar.",
        "Join airline and hotel dining programs, which add points when you pay with a linked card.",
      ] },
      { tip: "Keep it simple: two or three cards that cover your biggest categories beat a wallet full of cards you forget to use." },
    ],
  },
  {
    slug: "first-long-haul-business-class-on-points",
    category: "travel",
    title: "Planning your first long-haul business class trip on points",
    summary: "A step-by-step plan, from choosing a destination to booking, for your first lie-flat seat.",
    date: "2026-10-10",
    author: TEAM,
    emoji: "✈️",
    body: [
      { p: "Premium cabins are where points deliver the most value. Here's a simple plan for a first big redemption." },
      { h: "1. Pick a region, not a city" },
      { p: "Being open to several gateway cities, for example anywhere in Western Europe or Japan, greatly improves your odds of finding seats." },
      { h: "2. Know your points" },
      { p: "List which airline programs your card points can transfer to. That tells you where to search." },
      { h: "3. Search, then transfer, then book" },
      { list: [
        "Find available seats across programs and dates.",
        "Confirm the seat on the airline program's own site.",
        "Transfer only the points you need, then book right away.",
      ] },
      { tip: "Position yourself if needed: a cheap domestic flight to a bigger hub can unlock far more award space." },
    ],
  },
  {
    slug: "welcome-to-point4mepoint4free",
    category: "news",
    title: "Welcome to Point4MePoint4Free",
    summary: "What we're building, who it's for, and what's coming next for award travelers.",
    date: "2026-10-17",
    author: "Russell Doi",
    emoji: "👋",
    body: [
      { p: "Point4MePoint4Free helps travelers use the credit card points and airline miles they already have to book better trips." },
      { h: "What you can do today" },
      { list: [
        "Browse curated award deals with points, taxes and cents-per-point side by side.",
        "Compare Explorer, Member and Member Plus plans and upgrade any time.",
        "Read Insider guides that explain award travel in plain language.",
      ] },
      { h: "What's next" },
      { p: "We're working on more saved-route alerts and deeper search. Tell us what you'd like to see." },
    ],
  },
  {
    slug: "member-plus-biggest-yearly-discount",
    category: "product",
    title: "Member Plus now has our biggest yearly discount",
    summary: "Member Plus is 40% off when billed yearly. Here's what it includes and how to switch.",
    date: "2026-10-17",
    author: TEAM,
    emoji: "⭐",
    trending: true,
    body: [
      { p: "Member Plus is our top plan, and it now has the largest yearly saving: $144 a year instead of $20 a month, which is 40% off." },
      { h: "What's included" },
      { list: [
        "Everything in Member, including unlimited award searches and booking steps.",
        "A free 30-minute points strategy session.",
        "Seat alerts on 10 saved routes and multi-airport search.",
        "10% off Concierge bookings.",
      ] },
      { h: "How to switch" },
      { p: "Go to Pricing on the home page and choose Member Plus. If you're already a member, your current subscription is switched rather than charged twice." },
    ],
  },
  {
    slug: "using-the-members-area",
    category: "product",
    title: "Getting the most from the Members area",
    summary: "Where to find full deal details, booking steps and Member Plus extras once you subscribe.",
    date: "2026-10-05",
    author: TEAM,
    emoji: "🗝️",
    body: [
      { p: "Once you're a member, the Members area link appears in the top bar next to My account." },
      { list: [
        "Every deal includes step-by-step booking instructions.",
        "Member Plus adds the points strategy session section.",
        "Manage billing from My account at any time: change plan, update your card or cancel.",
      ] },
    ],
  },
];

// ---------- helpers ----------

export const categoryOf = (id: string) => categories.find((c) => c.id === id);

export const sortedArticles = () => [...articles].sort((a, b) => b.date.localeCompare(a.date));

export const articlesIn = (cat: CategoryId) => sortedArticles().filter((a) => a.category === cat);

export const findArticle = (cat: string, slug: string) => articles.find((a) => a.category === cat && a.slug === slug);

export const articleHref = (a: Article) => `/insider/${a.category}/${a.slug}`;

export function readMinutes(a: Article) {
  const words = a.body
    .map((b) => ("p" in b ? b.p : "h" in b ? b.h : "tip" in b ? b.tip : b.list.join(" ")))
    .join(" ")
    .split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

export function formatDate(d: string) {
  return new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
