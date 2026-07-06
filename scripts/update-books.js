// Gives every book a suitable image and a clear English description.
// - Only the Book table is touched.
// - Rerun-safe: updates are idempotent, nothing is created or deleted.
// - Duplicate titles are reported but NOT deleted.
//
// Usage:
//   node scripts/update-books.js --dry-run   show what would change, change nothing
//   node scripts/update-books.js             apply the changes
// DATABASE_URL must be set in the environment or .env (it is never printed).
import prisma from '../lib/prisma.js';

const DRY_RUN = process.argv.includes('--dry-run');

// images are stable Unsplash CDN URLs (all verified to load)
const topics = [
  { match: 'JavaScript', about: 'JavaScript, the programming language that powers websites and web apps', image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&q=80' },
  { match: 'Python', about: 'Python, one of the most popular and beginner-friendly programming languages', image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&q=80' },
  { match: 'React', about: 'React, the JavaScript library for building modern user interfaces', image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80' },
  { match: 'Node.js', about: 'Node.js, the runtime that lets JavaScript run on the server', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80' },
  { match: 'SQL', about: 'SQL and relational databases, from simple queries to joining tables', image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80' },
  { match: 'HTML and CSS', about: 'HTML and CSS, the building blocks of every web page', image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80' },
  { match: 'Git', about: 'Git and version control, the everyday tools of software teams', image: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&q=80' },
  { match: 'APIs', about: 'APIs and how applications talk to each other over the web', image: 'https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=800&q=80' },
  { match: 'Clean Code', about: 'writing clean, readable code that other developers enjoy working with', image: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&q=80' },
  { match: 'Data Structures', about: 'data structures and algorithms, the foundations of efficient programs', image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80' },
  { match: 'World History', about: 'world history and the events that shaped the modern world', image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80' },
  { match: 'Ancient Egypt', about: 'ancient Egypt, its pharaohs, pyramids, and daily life along the Nile', image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800&q=80' },
  { match: 'the Horn of Africa', about: 'the Horn of Africa, its peoples, cultures, and long history', image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80' },
  { match: 'the Human Body', about: 'the human body and how its organs and systems work together', image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80' },
  { match: 'the Universe', about: 'the universe, from stars and galaxies to the mysteries of deep space', image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80' },
  { match: 'Marketing', about: 'marketing and how businesses reach, win, and keep customers', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80' },
  { match: 'Entrepreneurship', about: 'entrepreneurship and turning ideas into successful businesses', image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80' },
  { match: 'the Desert', about: 'the vast desert, its silence, dangers, and hidden beauty', image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80', fiction: true },
  { match: 'the Lost City', about: 'a forgotten city and the travelers determined to find it', image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80', fiction: true },
  { match: 'the Long Journey', about: 'a long journey that changes everyone who takes it', image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80', fiction: true },
];

// fallback for books whose title matches no known topic (verified URL)
const fallback = {
  image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
  describe: (book) => `A ${book.genre} book worth reading. It offers a clear and engaging look at its subject, written to be enjoyable for curious readers.`,
};

const factual = {
  'Learning': (about) => `A beginner-friendly book about ${about}. It explains the basics step by step with simple examples, so new learners can start with confidence.`,
  'Mastering': (about) => `An advanced book about ${about}. It goes beyond the basics with deeper techniques, best practices, and real-world examples for serious readers.`,
  'Introduction to': (about) => `A clear introduction to ${about}. It covers the most important ideas in plain language, making it a great first book on the topic.`,
  'The Story of': (about) => `An engaging book that tells the story of ${about} — where it came from, how it developed, and why it matters today.`,
};

const fiction = {
  'Learning': (about) => `A heartfelt novel about ${about}. Its characters learn, lose, and grow in a story that stays with the reader long after the last page.`,
  'Mastering': (about) => `A gripping novel about ${about}, told with rich detail, tension, and memorable characters.`,
  'Introduction to': (about) => `An inviting novel about ${about} — an easy and rewarding read, perfect as a first step into this genre.`,
  'The Story of': (about) => `A moving novel that tells the story of ${about}, written in a warm and vivid style.`,
};

const prefixes = ['Introduction to', 'The Story of', 'Learning', 'Mastering'];

function buildUpdate(book) {
  const topic = topics.find((t) => book.title.endsWith(t.match));
  if (!topic) {
    return { image: fallback.image, description: fallback.describe(book) };
  }
  const prefix = prefixes.find((p) => book.title.startsWith(p));
  const templates = topic.fiction ? fiction : factual;
  const template = (prefix && templates[prefix]) || factual['Introduction to'];
  return { image: topic.image, description: template(topic.about) };
}

async function main() {
  const books = await prisma.book.findMany({ orderBy: { id: 'asc' } });
  console.log(`Found ${books.length} books`);

  // report (but never delete) duplicate titles
  const seen = new Map();
  for (const b of books) seen.set(b.title, (seen.get(b.title) ?? 0) + 1);
  const duplicates = [...seen.entries()].filter(([, n]) => n > 1);
  console.log(
    duplicates.length
      ? `Duplicate titles found (left untouched): ${duplicates.map(([t, n]) => `${t} (x${n})`).join(', ')}`
      : 'No duplicate titles found'
  );

  const unmatched = books.filter((b) => !topics.some((t) => b.title.endsWith(t.match)));
  if (unmatched.length) {
    console.log(`Books using the generic fallback image (${unmatched.length}): ${unmatched.map((b) => b.title).join(', ')}`);
  }

  if (DRY_RUN) {
    for (const b of books.slice(0, 3)) {
      const u = buildUpdate(b);
      console.log(`\n"${b.title}" would get:\n  image: ${u.image}\n  description: ${u.description}`);
    }
    console.log('\nDry run: nothing was changed.');
    return;
  }

  let updated = 0;
  await prisma.$transaction(async (tx) => {
    for (const book of books) {
      await tx.book.update({ where: { id: book.id }, data: buildUpdate(book) });
      updated++;
    }
  }, { timeout: 120000, maxWait: 15000 });

  console.log(`Updated ${updated} books`);

  const missing = await prisma.book.count({
    where: { OR: [{ image: null }, { description: null }] },
  });
  console.log(`Books still missing image or description: ${missing}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
