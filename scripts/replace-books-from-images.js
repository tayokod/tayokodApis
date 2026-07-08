// Replaces the generic practice books with 34 real books identified from
// the cover photos in images/books/. Rerun-safe.
// - Touches only the Book and Author tables.
// - Authors are upserted by name; books are matched by title (create/update).
// - Books whose title is not in this list are deleted; authors left with no
//   books are then removed. Nothing else is touched.
//
// Usage:
//   node scripts/replace-books-from-images.js --dry-run
//   node scripts/replace-books-from-images.js
// DATABASE_URL must be set in the environment or .env (never printed).
import prisma from '../lib/prisma.js';

const DRY_RUN = process.argv.includes('--dry-run');

const books = [
  {
    "title": "The Quran Has It All",
    "author": "Haifaa Younis",
    "country": "United States",
    "genre": "Islam",
    "publishedYear": 2022,
    "image": "/images/books/quran-has-it-all.jpg",
    "description": "Buuggan wuxuu muujinayaa sida Qur'aanku uga jawaabo su'aalaha nolosha. Haifaa Younis waxay soo bandhigaysaa aayado iyo cibrado muslim kasta ku hagaya iimaanka, sabarka, iyo ujeeddada nolosha."
  },
  {
    "title": "The Productive Muslim",
    "author": "Mohammed Faris",
    "country": "United Kingdom",
    "genre": "Islam",
    "publishedYear": 2016,
    "image": "https://covers.openlibrary.org/b/id/10840535-L.jpg",
    "description": "Mohammed Faris wuxuu isku daraa diinta iyo wax-soo-saarka. Buuggu wuxuu ku baraa sida aad waqtiga, tamarta, iyo niyadda ugu maareyso si aad u noqoto muslim firfircoon oo Alle ka cabsada."
  },
  {
    "title": "Great Women of Islam",
    "author": "Mahmood Ahmad Ghadanfar",
    "country": "Pakistan",
    "genre": "Islamic History",
    "publishedYear": 2001,
    "image": "https://covers.openlibrary.org/b/id/2953820-L.jpg",
    "description": "Taariikhda haweenka waaweyn ee Islaamka ee loo bishaareeyay Jannada. Buuggu wuxuu sheegayaa noloshooda, rumaysadkooda, iyo dhaqankooda si dadku wax uga bartaan."
  },
  {
    "title": "A Muslim Woman's Diary",
    "author": "Sumaya Amiri",
    "country": "United Kingdom",
    "genre": "Islam",
    "publishedYear": 2021,
    "image": "https://covers.openlibrary.org/b/id/13889342-L.jpg",
    "description": "Xusuus-qor dareen leh oo ka hadlaya safarka iimaanka ee haweenka muslimka ah. Sumaya Amiri waxay wadaagtaa fikrado ku saabsan salaadda, sabarka, iyo xiriirka Ilaahay."
  },
  {
    "title": "'Umar Ibn Al-Khattab: His Life and Times",
    "author": "Ali Muhammad as-Sallabi",
    "country": "Libya",
    "genre": "Islamic History",
    "publishedYear": 2007,
    "image": "https://covers.openlibrary.org/b/id/8768995-L.jpg",
    "description": "Taariikhda nolosha Khaliifka labaad, Cumar ibn al-Khaddaab (RC). Dr. Sallaabi wuxuu faahfaahinayaa caddaaladdiisa, geesinimadiisa, iyo hoggaanka Islaamka xilligiisii."
  },
  {
    "title": "Healing with the Medicine of the Prophet",
    "author": "Ibn Qayyim al-Jawziyya",
    "country": "Syria",
    "genre": "Islam",
    "publishedYear": 1998,
    "image": "https://covers.openlibrary.org/b/id/1686080-L.jpg",
    "description": "Ibn Qayyim al-Jawziyya wuxuu qoray dawooyinka iyo daawaynta Nabiga (SCW). Buuggu wuxuu isku daraa caafimaadka jirka iyo ruuxa iyadoo la raacayo Sunnada."
  },
  {
    "title": "Khadijah: The Story of Islam's First Lady",
    "author": "Fatima Barkatulla",
    "country": "United Kingdom",
    "genre": "Islamic Biography",
    "publishedYear": 2022,
    "image": "/images/books/khadijah-first-lady.jpg",
    "description": "Sheekada Khadiija (RC), haweenaydii ugu horreysay ee Islaam qaadatay. Buug sawiro leh oo muujinaya taageeradeeda Nabiga iyo dhaqankeeda sharafta leh."
  },
  {
    "title": "The Power of Du'a",
    "author": "Aliyah Umm Raiyaan",
    "country": "United Kingdom",
    "genre": "Islam",
    "publishedYear": 2023,
    "image": "/images/books/power-of-dua.jpg",
    "description": "Buuggan wuxuu ka hadlayaa xoogga du'ada iyo sida loogu baryo Ilaahay qalbi daacad ah. Aliyah Umm Raiyaan waxay ku dhiirrigelinaysaa akhristaha inuu Alle wax weydiisto oo isku halleeyo."
  },
  {
    "title": "The Sirah of the Prophet: A Contemporary and Original Analysis",
    "author": "Yasir Qadhi",
    "country": "United States",
    "genre": "Islamic History",
    "publishedYear": 2023,
    "image": "https://covers.openlibrary.org/b/id/14734290-L.jpg",
    "description": "Falanqayn casri ah oo ku saabsan nolosha Nabiga Muxammad (SCW). Dr. Yasir Qadhi wuxuu si cad u sharraxayaa Siirada si arday iyo aqoonyahan labaduba wax uga faa'iideystaan."
  },
  {
    "title": "Akhlaq: An Islamic Character Handbook",
    "author": "ilm Verlag",
    "country": "Germany",
    "genre": "Islam",
    "publishedYear": 2019,
    "image": "/images/books/akhlaq.jpg",
    "description": "Buug-hage ku saabsan anshaxa Islaamka ee carruurta iyo dadka waaweyn. Wuxuu baraa akhlaaqda wanaagsan iyo sida loo dhiso shakhsi Muslim ah oo wanaagsan. (Sannadka waa qiyaas.)"
  },
  {
    "title": "You Become What You Think",
    "author": "Shubham Kumar Singh",
    "country": "India",
    "genre": "Self-Help",
    "publishedYear": 2023,
    "image": "/images/books/you-become-what-you-think.jpg",
    "description": "A simple guide to mastering your mind. It shows how your thoughts shape your life and teaches practical ways to build positive thinking, focus, and inner calm for a more successful life."
  },
  {
    "title": "Healing the Emptiness",
    "author": "Yasmin Mogahed",
    "country": "United States",
    "genre": "Self-Help",
    "publishedYear": 2022,
    "image": "https://covers.openlibrary.org/b/id/14737897-L.jpg",
    "description": "Yasmin Mogahed offers a gentle guide to emotional and spiritual well-being. The book helps readers heal inner pain, reconnect with meaning, and find peace and strength through faith and self-reflection."
  },
  {
    "title": "Think and Grow Rich",
    "author": "Napoleon Hill",
    "country": "United States",
    "genre": "Self-Help",
    "publishedYear": 1937,
    "image": "https://covers.openlibrary.org/b/id/14542536-L.jpg",
    "description": "A timeless classic on success and wealth. Napoleon Hill studied achievers and shares principles of desire, faith, persistence, and planning that help readers turn goals and ideas into real accomplishments."
  },
  {
    "title": "The 48 Laws of Power",
    "author": "Robert Greene",
    "country": "United States",
    "genre": "Psychology",
    "publishedYear": 1998,
    "image": "https://covers.openlibrary.org/b/id/6424160-L.jpg",
    "description": "Robert Greene distills 3,000 years of history into 48 laws of power and influence. A bold, practical guide to strategy, human behaviour, and navigating social and professional relationships."
  },
  {
    "title": "Eat That Frog!",
    "author": "Brian Tracy",
    "country": "Canada",
    "genre": "Productivity",
    "publishedYear": 2001,
    "image": "https://covers.openlibrary.org/b/id/847534-L.jpg",
    "description": "Brian Tracy shares 21 practical ways to stop procrastinating and get more done. Learn to tackle your most important task first and boost your productivity and focus every single day."
  },
  {
    "title": "365 Days with Self-Discipline",
    "author": "Martin Meadows",
    "country": "Poland",
    "genre": "Self-Help",
    "publishedYear": 2017,
    "image": "https://covers.openlibrary.org/b/id/10489426-L.jpg",
    "description": "One short, powerful lesson for every day of the year. Martin Meadows helps readers build self-control, mental resilience, and lasting habits that lead to success and personal growth."
  },
  {
    "title": "The First 90 Days",
    "author": "Michael D. Watkins",
    "country": "United States",
    "genre": "Business",
    "publishedYear": 2003,
    "image": "https://covers.openlibrary.org/b/id/863960-L.jpg",
    "description": "A proven guide for starting a new role well. Michael Watkins gives strategies to get up to speed quickly, build key relationships, and secure early wins during leadership transitions."
  },
  {
    "title": "The Let Them Theory",
    "author": "Mel Robbins",
    "country": "United States",
    "genre": "Self-Help",
    "publishedYear": 2024,
    "image": "https://covers.openlibrary.org/b/id/15165806-L.jpg",
    "description": "Mel Robbins shares a simple but life-changing tool: let people be who they are. The book teaches how to stop wasting energy controlling others and reclaim your peace, focus, and freedom."
  },
  {
    "title": "Read People Like a Book",
    "author": "Patrick King",
    "country": "United States",
    "genre": "Psychology",
    "publishedYear": 2020,
    "image": "https://covers.openlibrary.org/b/id/11983442-L.jpg",
    "description": "Patrick King explains how to analyse, understand, and predict people's emotions and behaviour. A practical guide to body language, communication, and reading what others really think and feel."
  },
  {
    "title": "The Art of Reading Minds",
    "author": "Henrik Fexeus",
    "country": "Sweden",
    "genre": "Psychology",
    "publishedYear": 2019,
    "image": "https://covers.openlibrary.org/b/id/12403095-L.jpg",
    "description": "Henrik Fexeus reveals techniques of mentalism and psychology to understand others. Learn to read body language, influence conversations, and connect with people to get what you want."
  },
  {
    "title": "The Psychology of Money",
    "author": "Morgan Housel",
    "country": "United States",
    "genre": "Finance",
    "publishedYear": 2020,
    "image": "https://covers.openlibrary.org/b/id/10389354-L.jpg",
    "description": "Morgan Housel shares timeless lessons on wealth, greed, and happiness. Through short stories he shows that doing well with money depends more on behaviour and mindset than on knowledge."
  },
  {
    "title": "Deep Work",
    "author": "Cal Newport",
    "country": "United States",
    "genre": "Productivity",
    "publishedYear": 2016,
    "image": "https://covers.openlibrary.org/b/id/7988607-L.jpg",
    "description": "Cal Newport argues that focused, distraction-free work is a rare and valuable skill. The book gives rules and strategies to train deep concentration and produce high-quality work faster."
  },
  {
    "title": "Mindset",
    "author": "Carol S. Dweck",
    "country": "United States",
    "genre": "Psychology",
    "publishedYear": 2006,
    "image": "https://covers.openlibrary.org/b/id/746414-L.jpg",
    "description": "Psychologist Carol Dweck explains the difference between fixed and growth mindsets. She shows how believing you can improve shapes success in learning, work, relationships, and life."
  },
  {
    "title": "Can't Hurt Me",
    "author": "David Goggins",
    "country": "United States",
    "genre": "Memoir",
    "publishedYear": 2018,
    "image": "https://covers.openlibrary.org/b/id/8305903-L.jpg",
    "description": "The powerful memoir of David Goggins, who overcame poverty and hardship to become an elite soldier and athlete. A raw story about mastering your mind and pushing past your limits."
  },
  {
    "title": "Finish What You Start",
    "author": "Peter Hollins",
    "country": "United States",
    "genre": "Self-Help",
    "publishedYear": 2019,
    "image": "https://covers.openlibrary.org/b/id/10531822-L.jpg",
    "description": "Peter Hollins explores the art of following through. Learn practical strategies for taking action, staying focused, beating procrastination, and building the self-discipline needed to complete what you begin."
  },
  {
    "title": "The Productivity Mindset",
    "author": "Mindset Reading",
    "country": "Unknown",
    "genre": "Productivity",
    "publishedYear": 2018,
    "image": "/images/books/productivity-mindset.jpg",
    "description": "A practical guide to improving focus and beating laziness. The book offers simple strategies and mindset shifts to help readers stay disciplined, manage time well, and get more meaningful work done."
  },
  {
    "title": "The Courage to Be Disliked",
    "author": "Ichiro Kishimi",
    "country": "Japan",
    "genre": "Philosophy",
    "publishedYear": 2013,
    "image": "/images/books/courage-to-be-disliked.jpg",
    "description": "Using ideas from psychologist Alfred Adler, this Japanese bestseller shows how to free yourself from others' expectations. A dialogue-style guide to happiness, freedom, and living on your own terms. With Fumitake Koga."
  },
  {
    "title": "Ego Is the Enemy",
    "author": "Ryan Holiday",
    "country": "United States",
    "genre": "Self-Help",
    "publishedYear": 2016,
    "image": "https://covers.openlibrary.org/b/id/12447129-L.jpg",
    "description": "Ryan Holiday shows how ego blocks success at every stage of life. Drawing on history and philosophy, he teaches humility, self-awareness, and discipline as the path to real achievement."
  },
  {
    "title": "The Rudest Book Ever",
    "author": "Shwetabh Gangwar",
    "country": "India",
    "genre": "Self-Help",
    "publishedYear": 2019,
    "image": "https://covers.openlibrary.org/b/id/10874978-L.jpg",
    "description": "Shwetabh Gangwar offers blunt, practical advice for life. The book challenges harmful beliefs and teaches readers to think clearly, handle people, and free their minds from nonsense and self-sabotage."
  },
  {
    "title": "Do It Today",
    "author": "Darius Foroux",
    "country": "Netherlands",
    "genre": "Productivity",
    "publishedYear": 2018,
    "image": "https://covers.openlibrary.org/b/id/13165210-L.jpg",
    "description": "Darius Foroux shares clear ideas to overcome procrastination and improve productivity. A short, motivating book that helps readers focus on what matters and achieve more meaningful things."
  },
  {
    "title": "The 5 AM Club",
    "author": "Robin Sharma",
    "country": "Canada",
    "genre": "Self-Help",
    "publishedYear": 2018,
    "image": "https://covers.openlibrary.org/b/id/10326643-L.jpg",
    "description": "Robin Sharma shows how rising early can transform your life. Through a story he shares a morning routine to boost focus, energy, and productivity: own your morning, elevate your life."
  },
  {
    "title": "Make Your Time Right",
    "author": "Kam Jgup",
    "country": "Unknown",
    "genre": "Self-Help",
    "publishedYear": 2021,
    "image": "/images/books/make-your-time-right.jpg",
    "description": "A practical guide to time management and personal growth, covering routine, focus, habits, priorities, and financial independence to help readers use their time wisely and build a better life. (Year is approximate.)"
  },
  {
    "title": "Atomic Habits",
    "author": "James Clear",
    "country": "United States",
    "genre": "Self-Help",
    "publishedYear": 2018,
    "image": "https://covers.openlibrary.org/b/id/12539702-L.jpg",
    "description": "James Clear reveals how tiny changes lead to remarkable results. A practical, science-based guide to building good habits, breaking bad ones, and improving one percent every day."
  },
  {
    "title": "Build, Don't Talk",
    "author": "Raj Shamani",
    "country": "India",
    "genre": "Business",
    "publishedYear": 2023,
    "image": "https://covers.openlibrary.org/b/id/13329405-L.jpg",
    "description": "Raj Shamani shares practical lessons on skills, money, and relationships that school never taught. A direct, motivating guide for young people who want to build a successful life and career."
  }
];

async function main() {
  const keepTitles = books.map((b) => b.title);
  const authors = [...new Map(books.map((b) => [b.author, b.country])).entries()];

  const existingBooks = await prisma.book.findMany({ select: { title: true } });
  const existingAuthors = await prisma.author.count();
  const toDelete = existingBooks.filter((b) => !keepTitles.includes(b.title));

  console.log(`Before: ${existingBooks.length} books, ${existingAuthors} authors`);
  console.log(`Books to keep/insert: ${books.length}`);
  console.log(`Books to delete (not in the 34): ${toDelete.length}`);
  console.log(`Authors in new set: ${authors.length}`);

  if (DRY_RUN) {
    console.log('\nSample of final books:');
    for (const b of books.slice(0, 3)) {
      console.log(`  "${b.title}" by ${b.author} [${b.genre}, ${b.publishedYear}] -> ${b.image}`);
    }
    const localCount = books.filter((b) => b.image.startsWith('/images/')).length;
    console.log(`\nImage sources: ${books.length - localCount} Open Library, ${localCount} local`);
    console.log('Dry run: nothing changed.');
    return;
  }

  await prisma.$transaction(async (tx) => {
    // 1. upsert authors, build name -> id map
    const authorIds = {};
    for (const [name, country] of authors) {
      const a = await tx.author.upsert({
        where: { name },
        update: { country },
        create: { name, country },
      });
      authorIds[name] = a.id;
    }

    // 2. remove books that are not in the confirmed list
    await tx.book.deleteMany({ where: { title: { notIn: keepTitles } } });

    // 3. create or update each confirmed book (title is not unique -> findFirst)
    for (const b of books) {
      const data = {
        title: b.title,
        genre: b.genre,
        authorId: authorIds[b.author],
        publishedYear: b.publishedYear,
        image: b.image,
        description: b.description,
      };
      const existing = await tx.book.findFirst({ where: { title: b.title } });
      if (existing) await tx.book.update({ where: { id: existing.id }, data });
      else await tx.book.create({ data });
    }

    // 4. remove authors left with no books (old generic authors)
    await tx.author.deleteMany({ where: { books: { none: {} } } });
  }, { timeout: 120000, maxWait: 15000 });

  const [bookCount, authorCount, noImg, noDesc] = await Promise.all([
    prisma.book.count(),
    prisma.author.count(),
    prisma.book.count({ where: { OR: [{ image: null }, { image: '' }] } }),
    prisma.book.count({ where: { OR: [{ description: null }, { description: '' }] } }),
  ]);
  console.log(`\nAfter: ${bookCount} books, ${authorCount} authors`);
  console.log(`Books missing image: ${noImg}, missing description: ${noDesc}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
