// Upgrades food and book images to more beautiful, high-quality photos.
// - Only the foods and Book tables are touched (image field only).
// - Rerun-safe: idempotent updates, nothing created or deleted.
// - Foods not listed here keep their current (accurate, authentic) image.
//
// Usage:
//   node scripts/update-food-book-images.js --dry-run
//   node scripts/update-food-book-images.js
// DATABASE_URL must be set in the environment or .env (never printed).
import prisma from '../lib/prisma.js';

const DRY_RUN = process.argv.includes('--dry-run');

// --- foods: only the 9 dishes that got a clearly more beautiful AND accurate
// match are replaced. The other 11 keep their authentic photos (culturally
// specific or halal-sensitive dishes where accuracy beats a prettier stock shot).
// All images are Unsplash CDN URLs, verified to load and visually checked.
const foodImages = {
  'Malawax':          'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1080&q=80', // pancake stack
  'Boorash':          'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=1080&q=80', // oatmeal + berries
  'Bariis Iskukaris': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1080&q=80', // spiced rice / biryani
  'Baasto Soomaali':  'https://images.unsplash.com/photo-1622973536968-3ead9e780960?w=1080&q=80', // spaghetti bolognese
  'Baasto Fudud':     'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=1080&q=80', // pasta in tomato sauce
  'Sambuus':          'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1080&q=80', // samosas
  'Bajiyo':           'https://images.unsplash.com/photo-1593001874117-c99c800e3eb8?w=1080&q=80', // falafel
  'Muufo':            'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1080&q=80', // rustic bread loaves
  'Suqaar':           'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=1080&q=80', // diced sauteed meat + peppers
};

// --- books: image is shared by all books whose title ends with the topic.
// 8 topics get a new, more attractive image; the rest keep their (good) image
// but are bumped to a higher resolution (w=1080).
const bookTopicImages = {
  'JavaScript':         'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=1080&q=80',
  'Python':             'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1080&q=80', // new: python code
  'React':              'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1080&q=80',
  'Node.js':            'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1080&q=80',
  'SQL':                'https://images.unsplash.com/photo-1633988354540-d3f4e97c67b5?w=1080&q=80', // new: server room
  'HTML and CSS':       'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1080&q=80',
  'Git':                'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=1080&q=80', // new: github octocat
  'APIs':               'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1080&q=80',   // new: server racks
  'Clean Code':         'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1080&q=80', // new: clean code
  'Data Structures':    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1080&q=80',   // new: data dashboard
  'World History':      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1080&q=80',
  'Ancient Egypt':      'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=1080&q=80',
  'the Horn of Africa': 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1080&q=80',
  'the Human Body':     'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=1080&q=80', // new: heart model
  'the Universe':       'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1080&q=80',
  'Marketing':          'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=1080&q=80', // new: marketing strategy
  'Entrepreneurship':   'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1080&q=80',
  'the Desert':         'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1080&q=80',
  'the Lost City':      'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1080&q=80',
  'the Long Journey':   'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1080&q=80',
};

async function main() {
  const foods = await prisma.foods.findMany({ select: { id: true, name: true } });
  const books = await prisma.book.findMany({ select: { id: true, title: true } });

  const foodUpdates = foods
    .filter((f) => foodImages[f.name])
    .map((f) => ({ id: f.id, name: f.name, image: foodImages[f.name] }));

  const topicFor = (title) => Object.keys(bookTopicImages).find((t) => title.endsWith(t));
  const bookUpdates = books
    .map((b) => ({ id: b.id, title: b.title, topic: topicFor(b.title) }))
    .filter((b) => b.topic)
    .map((b) => ({ id: b.id, image: bookTopicImages[b.topic] }));

  const unmatchedBooks = books.filter((b) => !topicFor(b.title));
  console.log(`Foods: ${foodUpdates.length} to update (of ${foods.length}), ${foods.length - foodUpdates.length} keep authentic image`);
  console.log(`Books: ${bookUpdates.length} to update (of ${books.length})` + (unmatchedBooks.length ? `, ${unmatchedBooks.length} unmatched!` : ''));

  if (DRY_RUN) {
    console.log('\nFood images being replaced:');
    for (const f of foodUpdates) console.log(`  ${f.name} -> ${f.image}`);
    console.log('\nDry run: nothing changed.');
    return;
  }

  await prisma.$transaction(async (tx) => {
    for (const f of foodUpdates) await tx.foods.update({ where: { id: f.id }, data: { image: f.image } });
    for (const b of bookUpdates) await tx.book.update({ where: { id: b.id }, data: { image: b.image } });
  }, { timeout: 120000, maxWait: 15000 });

  const foodsNoImg = await prisma.foods.count({ where: { OR: [{ image: null }, { image: '' }] } });
  const booksNoImg = await prisma.book.count({ where: { OR: [{ image: null }, { image: '' }] } });
  console.log(`\nDone. Foods updated: ${foodUpdates.length}, Books updated: ${bookUpdates.length}`);
  console.log(`Foods missing image: ${foodsNoImg}, Books missing image: ${booksNoImg}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
