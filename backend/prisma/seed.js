const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');

const adapter = new PrismaBetterSqlite3({ url: 'file:' + path.resolve(__dirname, '../../database/dev.db') });
const prisma = new PrismaClient({ adapter });

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 20 anonymous filler users — no usable login
const USER_DEFS = [
  { name: 'Alex Rivera',    email: 'alex.r@seed.dev',    interests: 'photography,travel,outdoors' },
  { name: 'Maya Chen',      email: 'maya.c@seed.dev',    interests: 'cooking,wellness,reading' },
  { name: 'Jordan Walsh',   email: 'jordan.w@seed.dev',  interests: 'gaming,technology,music' },
  { name: 'Sam Patel',      email: 'sam.p@seed.dev',     interests: 'fitness,outdoors,travel' },
  { name: 'Riley Kim',      email: 'riley.k@seed.dev',   interests: 'art,photography,design' },
  { name: 'Casey Morgan',   email: 'casey.m@seed.dev',   interests: 'music,gaming,film' },
  { name: 'Drew Santos',    email: 'drew.s@seed.dev',    interests: 'technology,cooking,sustainability' },
  { name: 'Quinn Okafor',   email: 'quinn.o@seed.dev',   interests: 'reading,writing,language' },
  { name: 'Avery Blake',    email: 'avery.b@seed.dev',   interests: 'fitness,wellness,travel' },
  { name: 'Morgan Lee',     email: 'morgan.l@seed.dev',  interests: 'cooking,art,photography' },
  { name: 'Taylor Reyes',   email: 'taylor.r@seed.dev',  interests: 'gaming,technology,music' },
  { name: 'Jamie Foster',   email: 'jamie.f@seed.dev',   interests: 'outdoors,sustainability,fitness' },
  { name: 'Robin Holt',     email: 'robin.h@seed.dev',   interests: 'film,reading,writing' },
  { name: 'Skyler Nguyen',  email: 'skyler.n@seed.dev',  interests: 'design,art,technology' },
  { name: 'Reese Park',     email: 'reese.p@seed.dev',   interests: 'music,wellness,travel' },
  { name: 'Charlie Davis',  email: 'charlie.d@seed.dev', interests: 'sustainability,gardening,cooking' },
  { name: 'Frankie Torres', email: 'frankie.t@seed.dev', interests: 'fitness,running,outdoors' },
  { name: 'Sage Wilson',    email: 'sage.w@seed.dev',    interests: 'reading,writing,wellness' },
  { name: 'Dakota Moore',   email: 'dakota.m@seed.dev',  interests: 'photography,film,music' },
  { name: 'Harley Adams',   email: 'harley.a@seed.dev',  interests: 'technology,gaming,design' },
];

// 50 clubs — ownerIndex maps into USER_DEFS
const CLUB_DEFS = [
  // Photography & Art
  { name: 'Golden Hour Society',        interests: 'photography,travel,outdoors',       location: 'San Francisco, CA',  visibility: 'public',  ownerIndex: 0,  desc: 'Chasing light, one golden hour at a time. We share locations, critique work, and host monthly photowalks.' },
  { name: 'Darkroom Collective',        interests: 'photography,art',                   location: 'Brooklyn, NY',       visibility: 'private', ownerIndex: 14, desc: 'Analog photography enthusiasts. We develop film and share processes the old-fashioned way.' },
  { name: 'Sketchbook Exchange',        interests: 'art,design,drawing',                location: null,                 visibility: 'public',  ownerIndex: 4,  desc: 'Mail your sketchbook to a stranger, get one back filled with drawings. Monthly themes.' },
  { name: 'Type Nerds',                 interests: 'design,typography,art',             location: 'Online',             visibility: 'public',  ownerIndex: 13, desc: 'Obsessing over kerning, type history, and beautiful letterforms since forever.' },
  { name: 'Urban Sketchers',            interests: 'art,outdoors,travel',               location: 'Chicago, IL',        visibility: 'public',  ownerIndex: 4,  desc: 'We draw the world one city block at a time. Weekly meetups at interesting spots.' },
  { name: 'Film Grain Forum',           interests: 'photography,film',                  location: null,                 visibility: 'public',  ownerIndex: 18, desc: 'Celebrating grain, imperfection, and analogue aesthetics in the digital age.' },
  { name: 'Color Theory Club',          interests: 'art,design',                        location: 'Austin, TX',         visibility: 'public',  ownerIndex: 13, desc: 'Weekly challenges exploring color relationships, palettes, and the psychology of color.' },
  { name: 'Street Photography Crew',    interests: 'photography,travel',                location: 'New York, NY',       visibility: 'public',  ownerIndex: 0,  desc: 'Documenting city life through candid photography. Monthly themed photo walks.' },
  // Food & Cooking
  { name: 'Sourdough Syndicate',        interests: 'cooking,baking',                    location: 'Portland, OR',       visibility: 'public',  ownerIndex: 1,  desc: 'Trading starter cultures, troubleshooting loaves, and celebrating the art of sourdough.' },
  { name: 'Late Night Kitchen',         interests: 'cooking,food',                      location: null,                 visibility: 'public',  ownerIndex: 9,  desc: "For people who cook elaborate meals at midnight and think that's totally normal." },
  { name: 'Spice Route Club',           interests: 'cooking,travel',                    location: 'Online',             visibility: 'public',  ownerIndex: 1,  desc: 'Cooking through global spice traditions. Every month: a new cuisine, a new pantry staple.' },
  { name: 'Fermentation Station',       interests: 'cooking,science',                   location: 'Seattle, WA',        visibility: 'public',  ownerIndex: 6,  desc: 'Kimchi, kombucha, miso, kefir — we ferment everything. Share cultures, share results.' },
  { name: 'Sunday Brunch Collective',   interests: 'cooking,social',                    location: 'Los Angeles, CA',    visibility: 'private', ownerIndex: 9,  desc: 'Rotating brunch hosts every Sunday. You cook once, you eat twelve times.' },
  { name: 'Ramen Obsessed',             interests: 'cooking,japan',                     location: 'Online',             visibility: 'public',  ownerIndex: 1,  desc: 'From tonkotsu to shoyu — recipe breakdowns, restaurant reviews, and broth science.' },
  { name: 'Zero Waste Kitchen',         interests: 'cooking,sustainability',             location: 'Online',             visibility: 'public',  ownerIndex: 15, desc: 'Cooking with scraps, roots, and peels. Zero waste recipes and tips for a low-impact kitchen.' },
  // Gaming & Tech
  { name: 'Pixel Pioneers',             interests: 'gaming,retro',                      location: null,                 visibility: 'public',  ownerIndex: 2,  desc: 'Celebrating gaming history from Atari to PS1. Weekly retro play sessions and deep dives.' },
  { name: 'Midnight Raid Guild',        interests: 'gaming,rpg',                        location: 'Online',             visibility: 'private', ownerIndex: 10, desc: 'Serious MMO and RPG players. Coordinated raids, strategy guides, and loot discussions.' },
  { name: 'Board & Byte',               interests: 'gaming,boardgames',                 location: 'Denver, CO',         visibility: 'public',  ownerIndex: 2,  desc: 'Where tabletop and digital gaming overlap. Teach a classic, learn something new every meet.' },
  { name: 'Open Source Fridays',        interests: 'technology,programming',             location: 'Online',             visibility: 'public',  ownerIndex: 6,  desc: 'Monthly contribution sprints on interesting open source projects. All skill levels welcome.' },
  { name: 'Side Project Club',          interests: 'technology,entrepreneurship',        location: 'Online',             visibility: 'public',  ownerIndex: 19, desc: 'Accountability, feedback, and cheerleading for people building things on the side.' },
  { name: 'AI Tinkerers',               interests: 'technology,ai',                     location: 'San Francisco, CA',  visibility: 'public',  ownerIndex: 13, desc: 'Hands-on experiments with local models, fine-tuning, and AI tooling. No hype, just builds.' },
  // Music
  { name: 'Vinyl Revival',              interests: 'music,collecting',                  location: 'Nashville, TN',      visibility: 'public',  ownerIndex: 5,  desc: 'Record collectors sharing finds, crate-digging tips, and listening sessions at member homes.' },
  { name: 'Bedroom Producers',          interests: 'music,production,technology',       location: 'Online',             visibility: 'public',  ownerIndex: 2,  desc: 'Making beats in small rooms and big software. Share WIPs, get feedback, collab.' },
  { name: 'Jazz & Coffee Society',      interests: 'music,social',                      location: 'New Orleans, LA',    visibility: 'public',  ownerIndex: 14, desc: 'Sunday morning listening sessions at rotating hosts. Bring coffee, bring a record.' },
  { name: 'Choir of Misfits',           interests: 'music,singing',                     location: 'London, UK',         visibility: 'public',  ownerIndex: 5,  desc: 'Non-competitive community choir. No auditions, all voices, weekly rehearsals.' },
  { name: 'Sound Design Workshop',      interests: 'music,technology',                  location: 'Online',             visibility: 'public',  ownerIndex: 10, desc: 'Field recordings, synth patches, and Foley art. Monthly challenges with shared results.' },
  // Fitness & Outdoors
  { name: '5AM Run Crew',               interests: 'fitness,running',                   location: 'Boston, MA',         visibility: 'public',  ownerIndex: 16, desc: 'Early risers logging miles before the world wakes up. All paces welcome, no excuses.' },
  { name: 'Bouldering Bloc',            interests: 'fitness,climbing,outdoors',         location: 'Salt Lake City, UT', visibility: 'public',  ownerIndex: 3,  desc: 'Indoor and outdoor bouldering community. Beta sharing, technique workshops, weekend crags.' },
  { name: 'Sunday Cyclists',            interests: 'fitness,cycling',                   location: 'Amsterdam, NL',      visibility: 'public',  ownerIndex: 3,  desc: 'Leisurely Sunday rides ending with good food. No lycra required.' },
  { name: 'Cold Plunge Club',           interests: 'wellness,fitness',                  location: 'Online',             visibility: 'public',  ownerIndex: 8,  desc: 'Cold water immersion enthusiasts. Tips, protocols, local spots, and accountability.' },
  { name: 'Urban Foragers',             interests: 'outdoors,sustainability,food',      location: 'Portland, OR',       visibility: 'public',  ownerIndex: 11, desc: 'Finding edible plants, mushrooms, and berries in cities and parks. Safety first.' },
  { name: 'Tide Pool Explorers',        interests: 'outdoors,science,nature',           location: 'Monterey, CA',       visibility: 'public',  ownerIndex: 3,  desc: 'Low-tide excursions to coastal habitats. Bring a field guide, leave everything as you found it.' },
  { name: 'Stargazers Anonymous',       interests: 'outdoors,science,astronomy',        location: 'Online',             visibility: 'public',  ownerIndex: 18, desc: "Amateur astronomy — dark sky trips, telescope setups, and wondering what's out there." },
  { name: 'Midnight Hikers',            interests: 'outdoors,fitness',                  location: 'Colorado',           visibility: 'private', ownerIndex: 11, desc: 'Night hiking under the stars. Headlamps mandatory, sense of adventure essential.' },
  // Books & Writing
  { name: 'Dog-Eared Pages',            interests: 'reading,books',                     location: 'Online',             visibility: 'public',  ownerIndex: 7,  desc: "A book club that doesn't finish every book and isn't sorry about it. Discussion over dogma." },
  { name: 'Marginalia Club',            interests: 'reading,writing',                   location: null,                 visibility: 'public',  ownerIndex: 17, desc: 'We annotate the same book, then compare marginal notes. Insight from other readers.' },
  { name: 'Sci-Fi Deep Cuts',           interests: 'reading,scifi,film',                location: 'Online',             visibility: 'public',  ownerIndex: 7,  desc: 'Beyond the bestsellers — obscure, challenging, and underrated science fiction.' },
  { name: 'Poetry Loud',                interests: 'writing,poetry,music',              location: 'New York, NY',       visibility: 'public',  ownerIndex: 7,  desc: 'Monthly open mic for original poetry. First-timers especially welcome.' },
  { name: 'Zine Makers',                interests: 'writing,art,design',                location: 'Online',             visibility: 'public',  ownerIndex: 17, desc: 'Making low-fi self-published zines on anything and everything. Swap zines, share process.' },
  // Film & Media
  { name: 'Film Noir Thursdays',        interests: 'film,history',                      location: 'Los Angeles, CA',    visibility: 'public',  ownerIndex: 12, desc: 'Weekly screenings of classic and neo-noir films followed by discussion. Shadows mandatory.' },
  { name: 'Criterion Crew',             interests: 'film,art',                          location: 'Online',             visibility: 'public',  ownerIndex: 12, desc: 'Working through the Criterion Collection. One film a week, deep-dive discussion.' },
  { name: 'Podcast Junkies',            interests: 'podcasting,media,technology',       location: 'Online',             visibility: 'public',  ownerIndex: 19, desc: 'Listening recommendations, production tips, and discussions on the best long-form audio.' },
  { name: 'Documentary Debrief',        interests: 'film,social,discussion',            location: 'Online',             visibility: 'public',  ownerIndex: 12, desc: 'Watch documentaries together, discuss the implications. Monthly themed collections.' },
  // Sustainability
  { name: 'Zero Waste Collective',      interests: 'sustainability,environment',         location: 'Online',             visibility: 'public',  ownerIndex: 15, desc: 'Sharing practical steps toward lower-waste living. No guilt, just progress.' },
  { name: 'Repair Café Network',        interests: 'sustainability,diy,community',       location: 'Amsterdam, NL',      visibility: 'public',  ownerIndex: 6,  desc: 'Bring your broken things, fix them with help. Skill sharing, tool lending, and coffee.' },
  { name: 'Seed Savers',                interests: 'sustainability,gardening,outdoors', location: null,                 visibility: 'public',  ownerIndex: 15, desc: 'Collecting, storing, and trading heirloom seeds. Preserving genetic diversity one plant at a time.' },
  { name: 'Urban Gardeners Collective', interests: 'gardening,sustainability,food',     location: 'Chicago, IL',        visibility: 'public',  ownerIndex: 11, desc: 'Rooftops, balconies, window boxes — growing food wherever we can find space.' },
  // Wellness & Community
  { name: 'Sunday Meditators',          interests: 'wellness,mindfulness',              location: 'Online',             visibility: 'public',  ownerIndex: 8,  desc: 'Guided and silent sessions every Sunday morning. All traditions welcome, no experience required.' },
  { name: 'Neighborhood Dinners',       interests: 'social,cooking,community',          location: 'Online',             visibility: 'private', ownerIndex: 9,  desc: 'Rotating potluck dinners hosted by members. Meet your neighbors, share a table.' },
  { name: 'Journal Collective',         interests: 'writing,wellness,mindfulness',      location: null,                 visibility: 'public',  ownerIndex: 17, desc: 'Prompts, accountability, and community for daily journaling. Share as much or as little as you want.' },
  { name: 'Rooftop Cinema Club',        interests: 'film,social,outdoors',              location: 'Sydney, AU',         visibility: 'public',  ownerIndex: 18, desc: 'Outdoor film screenings on rooftops around the city. Bring a blanket, bring a friend.' },
];

async function main() {
  // ── 1. Admin user (idempotent) ──────────────────────────────────────────
  const adminPw = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@clubora.com' },
    update: { role: 'admin' },
    create: { email: 'admin@clubora.com', name: 'Clubora Admin', password: adminPw, role: 'admin' },
  });
  console.log(`Admin ready — id: ${admin.id}`);

  // ── 2. Idempotency check for seed clubs ────────────────────────────────
  const firstClub = await prisma.club.findFirst({ where: { name: 'Golden Hour Society' } });
  if (firstClub) {
    console.log('Seed clubs already present — skipping clubs and memberships.');
    return;
  }

  // ── 3. Seed users ─────────────────────────────────────────────────────
  // Hash once and reuse — these accounts are not intended to be logged into
  const seedPw = await bcrypt.hash('SEED_INTERNAL_NOT_FOR_LOGIN_' + Date.now(), 4);

  const seedUsers = [];
  for (const u of USER_DEFS) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { email: u.email, name: u.name, password: seedPw, interests: u.interests },
    });
    seedUsers.push(user);
  }
  console.log(`Seed users ready — ${seedUsers.length} users`);

  // ── 4. Clubs + memberships ────────────────────────────────────────────
  let clubCount = 0;
  let membershipCount = 0;

  for (const def of CLUB_DEFS) {
    const owner = seedUsers[def.ownerIndex];

    const club = await prisma.club.create({
      data: {
        name:        def.name,
        description: def.desc,
        interests:   def.interests,
        location:    def.location,
        visibility:  def.visibility,
        ownerId:     owner.id,
      },
    });
    clubCount++;

    // Owner gets admin membership
    await prisma.membership.create({
      data: { userId: owner.id, clubId: club.id, role: 'admin', status: 'approved' },
    });
    membershipCount++;

    // Pick 4–18 additional members from the other 19 seed users
    const others = seedUsers.filter((u) => u.id !== owner.id);
    const count  = Math.floor(Math.random() * 15) + 4; // 4–18
    const members = shuffle(others).slice(0, count);

    for (const member of members) {
      await prisma.membership.create({
        data: { userId: member.id, clubId: club.id, role: 'member', status: 'approved' },
      });
      membershipCount++;
    }
  }

  console.log(`Done — ${clubCount} clubs, ${membershipCount} memberships created`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
