// Seed script with practice data for students.
// Safe to rerun: each section is skipped if that table already has data.
// Run with: npm run seed
import prisma from '../lib/prisma.js';

// ---------- categories + foods ----------

async function seedCategoriesAndFoods() {
  if ((await prisma.categories.count()) > 0) {
    console.log('categories/foods: already seeded, skipping');
    return;
  }

  const quraac = await prisma.categories.create({
    data: { name: 'Quraac', slug: 'quraac', description: 'Breakfast foods' },
  });
  const qado = await prisma.categories.create({
    data: { name: 'Qado', slug: 'qado', description: 'Lunch foods' },
  });
  const casho = await prisma.categories.create({
    data: { name: 'Casho', slug: 'casho', description: 'Dinner foods' },
  });

  const foods = [
    { name: 'Canjeero', price: 5, categoryId: quraac.id, tags: ['breakfast'], rating: 4.5, ingredients: ['flour', 'water', 'yeast'] },
    { name: 'Malawah', price: 4, categoryId: quraac.id, tags: ['breakfast', 'sweet'], rating: 4.2, ingredients: ['flour', 'sugar', 'egg'] },
    { name: 'Shaah', price: 2, categoryId: quraac.id, tags: ['drink'], rating: 4.8, ingredients: ['tea', 'milk', 'sugar'] },
    { name: 'Sambuus', price: 3, categoryId: quraac.id, tags: ['snack', 'fried'], rating: 4.6, ingredients: ['flour', 'meat', 'onion'] },
    { name: 'Bariis Iskukaris', price: 12, categoryId: qado.id, tags: ['rice', 'lunch'], rating: 4.7, ingredients: ['rice', 'meat', 'spices'] },
    { name: 'Baasto', price: 10, categoryId: qado.id, tags: ['pasta', 'lunch'], rating: 4.3, ingredients: ['pasta', 'meat', 'tomato'] },
    { name: 'Suqaar', price: 15, categoryId: qado.id, tags: ['meat', 'spicy'], rating: 4.6, ingredients: ['beef', 'pepper', 'onion'] },
    { name: 'Hilib Ari', price: 20, categoryId: qado.id, tags: ['meat'], rating: 4.9, ingredients: ['goat meat', 'spices'] },
    { name: 'Muufo', price: 6, categoryId: casho.id, tags: ['bread'], rating: 4.1, ingredients: ['corn flour', 'water'] },
    { name: 'Cambuulo', price: 7, categoryId: casho.id, tags: ['beans', 'dinner'], rating: 4.4, ingredients: ['azuki beans', 'butter', 'sugar'] },
    { name: 'Maraq', price: 8, categoryId: casho.id, tags: ['soup', 'dinner'], rating: 4.0, ingredients: ['vegetables', 'meat', 'water'] },
    { name: 'Kaluun', price: 14, categoryId: casho.id, tags: ['fish', 'dinner'], rating: 4.5, ingredients: ['fish', 'lemon', 'spices'] },
  ];
  await prisma.foods.createMany({ data: foods });
  console.log(`categories/foods: seeded 3 categories and ${foods.length} foods`);
}

// ---------- cities ----------

async function seedCities() {
  if ((await prisma.city.count()) > 0) {
    console.log('cities: already seeded, skipping');
    return;
  }

  const cities = [
    { name: 'Jigjiga', country: 'Ethiopia', population: 126000 },
    { name: 'Addis Ababa', country: 'Ethiopia', population: 5006000 },
    { name: 'Dire Dawa', country: 'Ethiopia', population: 493000 },
    { name: 'Harar', country: 'Ethiopia', population: 130000 },
    { name: 'Gode', country: 'Ethiopia', population: 76000 },
    { name: 'Degehabur', country: 'Ethiopia', population: 46000 },
    { name: 'Kebri Dahar', country: 'Ethiopia', population: 58000 },
    { name: 'Hargeisa', country: 'Somaliland', population: 1200000 },
    { name: 'Berbera', country: 'Somaliland', population: 250000 },
    { name: 'Burco', country: 'Somaliland', population: 400000 },
    { name: 'Borama', country: 'Somaliland', population: 250000 },
    { name: 'Mogadishu', country: 'Somalia', population: 2610000 },
    { name: 'Kismayo', country: 'Somalia', population: 240000 },
    { name: 'Baidoa', country: 'Somalia', population: 160000 },
    { name: 'Garowe', country: 'Somalia', population: 210000 },
    { name: 'Bosaso', country: 'Somalia', population: 400000 },
    { name: 'Djibouti City', country: 'Djibouti', population: 600000 },
    { name: 'Nairobi', country: 'Kenya', population: 4400000 },
    { name: 'Mombasa', country: 'Kenya', population: 1200000 },
    { name: 'Kampala', country: 'Uganda', population: 1650000 },
    { name: 'Dar es Salaam', country: 'Tanzania', population: 5380000 },
    { name: 'Khartoum', country: 'Sudan', population: 5274000 },
    { name: 'Cairo', country: 'Egypt', population: 10100000 },
    { name: 'Dubai', country: 'United Arab Emirates', population: 3500000 },
    { name: 'Istanbul', country: 'Turkey', population: 15600000 },
    { name: 'London', country: 'United Kingdom', population: 8900000 },
    { name: 'Minneapolis', country: 'United States', population: 430000 },
    { name: 'Toronto', country: 'Canada', population: 2930000 },
    { name: 'Stockholm', country: 'Sweden', population: 980000 },
    { name: 'Oslo', country: 'Norway', population: 700000 },
    { name: 'Amsterdam', country: 'Netherlands', population: 920000 },
    { name: 'Kuala Lumpur', country: 'Malaysia', population: 1980000 },
  ];
  await prisma.city.createMany({ data: cities });
  console.log(`cities: seeded ${cities.length} cities`);
}

// ---------- products ----------

async function seedProducts() {
  if ((await prisma.product.count()) > 0) {
    console.log('products: already seeded, skipping');
    return;
  }

  const baseItems = [
    { name: 'Phone', category: 'electronics', basePrice: 300 },
    { name: 'Laptop', category: 'electronics', basePrice: 700 },
    { name: 'Tablet', category: 'electronics', basePrice: 250 },
    { name: 'Headphones', category: 'electronics', basePrice: 50 },
    { name: 'Smart Watch', category: 'electronics', basePrice: 120 },
    { name: 'Bluetooth Speaker', category: 'electronics', basePrice: 45 },
    { name: 'Camera', category: 'electronics', basePrice: 450 },
    { name: 'Power Bank', category: 'electronics', basePrice: 25 },
    { name: 'T-Shirt', category: 'clothing', basePrice: 15 },
    { name: 'Jacket', category: 'clothing', basePrice: 60 },
    { name: 'Jeans', category: 'clothing', basePrice: 40 },
    { name: 'Hoodie', category: 'clothing', basePrice: 35 },
    { name: 'Sneakers', category: 'shoes', basePrice: 55 },
    { name: 'Sandals', category: 'shoes', basePrice: 20 },
    { name: 'Running Shoes', category: 'shoes', basePrice: 70 },
    { name: 'Desk Lamp', category: 'home', basePrice: 22 },
    { name: 'Coffee Maker', category: 'home', basePrice: 80 },
    { name: 'Blender', category: 'home', basePrice: 45 },
    { name: 'Football', category: 'sports', basePrice: 25 },
    { name: 'Yoga Mat', category: 'sports', basePrice: 18 },
  ];
  const brands = ['Alpha', 'Nova', 'Prime', 'Urban', 'Zen'];

  // 20 base items x 5 brands = 100 products
  const products = [];
  let i = 0;
  for (const item of baseItems) {
    for (const brand of brands) {
      products.push({
        title: `${brand} ${item.name}`,
        description: `${item.name} by ${brand}. Good quality at a fair price.`,
        price: item.basePrice + (i % 5) * 10,
        category: item.category,
        rating: Math.round((3 + (i % 21) / 10) * 10) / 10, // 3.0 to 5.0
        stock: (i * 7) % 100,
      });
      i++;
    }
  }
  await prisma.product.createMany({ data: products });
  console.log(`products: seeded ${products.length} products`);
}

// ---------- students + marks ----------

async function seedStudentsAndMarks() {
  if ((await prisma.student.count()) > 0) {
    console.log('students/marks: already seeded, skipping');
    return;
  }

  const maleNames = ['Ahmed', 'Mohamed', 'Abdi', 'Hassan', 'Hussein', 'Omar', 'Ali', 'Yusuf', 'Ibrahim', 'Khalid', 'Mustafa', 'Abdirahman', 'Liban'];
  const femaleNames = ['Amina', 'Fatima', 'Khadija', 'Hodan', 'Sagal', 'Nimo', 'Ayaan', 'Zahra', 'Halima', 'Ifrah', 'Sumaya', 'Nasteexo'];
  const lastNames = ['Abdullahi', 'Warsame', 'Farah', 'Jama', 'Hersi', 'Aden', 'Guled', 'Osman', 'Sheikh', 'Duale'];
  const classNames = ['Grade 9A', 'Grade 9B', 'Grade 10A', 'Grade 10B', 'Grade 11A', 'Grade 12A'];
  const cities = ['Jigjiga', 'Addis Ababa', 'Dire Dawa', 'Hargeisa', 'Gode'];
  const subjects = ['Math', 'English', 'Science', 'History', 'Somali', 'ICT'];

  let totalMarks = 0;
  for (let i = 0; i < 50; i++) {
    const isMale = i % 2 === 0;
    const firstName = isMale
      ? maleNames[i % maleNames.length]
      : femaleNames[i % femaleNames.length];
    const lastName = lastNames[i % lastNames.length];

    // 4 subjects per student with a spread of passing and failing scores
    const marks = [];
    for (let s = 0; s < 4; s++) {
      const subject = subjects[(i + s) % subjects.length];
      const score = (i * 13 + s * 29) % 71 + 30; // 30 to 100
      marks.push({
        subject,
        score,
        status: score >= 50 ? 'Passed' : 'Failed',
      });
    }
    totalMarks += marks.length;

    await prisma.student.create({
      data: {
        fullName: `${firstName} ${lastName}`,
        className: classNames[i % classNames.length],
        gender: isMale ? 'male' : 'female',
        city: cities[i % cities.length],
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
        marks: { create: marks },
      },
    });
  }
  console.log(`students/marks: seeded 50 students and ${totalMarks} marks`);
}

// ---------- authors + books ----------

async function seedAuthorsAndBooks() {
  if ((await prisma.author.count()) > 0) {
    console.log('authors/books: already seeded, skipping');
    return;
  }

  const authors = [
    { name: 'Nuruddin Farah', country: 'Somalia' },
    { name: 'Chinua Achebe', country: 'Nigeria' },
    { name: 'Ngugi wa Thiongo', country: 'Kenya' },
    { name: 'Maaza Mengiste', country: 'Ethiopia' },
    { name: 'Dinaw Mengestu', country: 'Ethiopia' },
    { name: 'Warsan Shire', country: 'Somalia' },
    { name: 'Chimamanda Adichie', country: 'Nigeria' },
    { name: 'Paulo Coelho', country: 'Brazil' },
    { name: 'George Orwell', country: 'United Kingdom' },
    { name: 'Agatha Christie', country: 'United Kingdom' },
    { name: 'Naguib Mahfouz', country: 'Egypt' },
    { name: 'Khaled Hosseini', country: 'Afghanistan' },
    { name: 'Haruki Murakami', country: 'Japan' },
    { name: 'Gabriel Garcia Marquez', country: 'Colombia' },
    { name: 'Kyle Simpson', country: 'United States' },
    { name: 'Douglas Crockford', country: 'United States' },
    { name: 'Marijn Haverbeke', country: 'Netherlands' },
    { name: 'Robert Martin', country: 'United States' },
    { name: 'Eric Freeman', country: 'United States' },
    { name: 'Jon Duckett', country: 'United Kingdom' },
  ];
  const createdAuthors = await prisma.author.createManyAndReturn({ data: authors });

  const topics = [
    { subject: 'JavaScript', genre: 'programming' },
    { subject: 'Python', genre: 'programming' },
    { subject: 'React', genre: 'programming' },
    { subject: 'Node.js', genre: 'programming' },
    { subject: 'SQL', genre: 'programming' },
    { subject: 'HTML and CSS', genre: 'programming' },
    { subject: 'Git', genre: 'programming' },
    { subject: 'APIs', genre: 'programming' },
    { subject: 'Clean Code', genre: 'programming' },
    { subject: 'Data Structures', genre: 'programming' },
    { subject: 'World History', genre: 'history' },
    { subject: 'Ancient Egypt', genre: 'history' },
    { subject: 'the Horn of Africa', genre: 'history' },
    { subject: 'the Human Body', genre: 'science' },
    { subject: 'the Universe', genre: 'science' },
    { subject: 'Marketing', genre: 'business' },
    { subject: 'Entrepreneurship', genre: 'business' },
    { subject: 'the Desert', genre: 'fiction' },
    { subject: 'the Lost City', genre: 'fiction' },
    { subject: 'the Long Journey', genre: 'fiction' },
  ];
  const prefixes = ['Learning', 'Mastering', 'Introduction to', 'The Story of'];

  // 20 topics x 4 prefixes = 80 books
  const books = [];
  let i = 0;
  for (const topic of topics) {
    for (const prefix of prefixes) {
      books.push({
        title: `${prefix} ${topic.subject}`,
        genre: topic.genre,
        authorId: createdAuthors[i % createdAuthors.length].id,
        publishedYear: 1990 + (i % 35),
      });
      i++;
    }
  }
  await prisma.book.createMany({ data: books });
  console.log(`authors/books: seeded ${authors.length} authors and ${books.length} books`);
}

// ---------- companies + jobs ----------

async function seedCompaniesAndJobs() {
  if ((await prisma.company.count()) > 0) {
    console.log('companies/jobs: already seeded, skipping');
    return;
  }

  const companies = [
    { name: 'Tayokod', location: 'Jigjiga', website: 'https://tayokod.com' },
    { name: 'SomTech', location: 'Hargeisa', website: 'https://somtech.example.com' },
    { name: 'Hodan Solutions', location: 'Mogadishu', website: 'https://hodan.example.com' },
    { name: 'Awash Software', location: 'Addis Ababa', website: 'https://awash.example.com' },
    { name: 'Dire Digital', location: 'Dire Dawa', website: 'https://diredigital.example.com' },
    { name: 'Nomad Labs', location: 'Nairobi', website: 'https://nomadlabs.example.com' },
    { name: 'Sahan Systems', location: 'Garowe', website: 'https://sahan.example.com' },
    { name: 'Geeska Apps', location: 'Berbera', website: 'https://geeska.example.com' },
    { name: 'Baraka Bank Tech', location: 'Djibouti City', website: 'https://baraka.example.com' },
    { name: 'Ogaden Online', location: 'Jigjiga', website: 'https://ogadenonline.example.com' },
    { name: 'Zeila Cloud', location: 'Borama', website: 'https://zeila.example.com' },
    { name: 'Juba Innovations', location: 'Kismayo', website: 'https://juba.example.com' },
    { name: 'Shabelle Media', location: 'Mogadishu', website: 'https://shabelle.example.com' },
    { name: 'Harar Hub', location: 'Harar', website: 'https://hararhub.example.com' },
    { name: 'Nile Networks', location: 'Khartoum', website: 'https://nile.example.com' },
    { name: 'Red Sea Retail', location: 'Bosaso', website: 'https://redsea.example.com' },
    { name: 'Salaam Delivery', location: 'Burco', website: 'https://salaam.example.com' },
    { name: 'Kaah Energy', location: 'Gode', website: 'https://kaah.example.com' },
    { name: 'Daryeel Health', location: 'Baidoa', website: 'https://daryeel.example.com' },
    { name: 'Horn Academy', location: 'Addis Ababa', website: 'https://hornacademy.example.com' },
  ];
  const createdCompanies = await prisma.company.createManyAndReturn({ data: companies });

  const titles = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Mobile Developer',
    'UI/UX Designer',
    'Data Analyst',
    'Project Manager',
    'QA Engineer',
    'DevOps Engineer',
    'Support Specialist',
  ];
  const types = ['full-time', 'part-time', 'remote', 'contract', 'internship'];

  // 10 titles x 5 types = 50 jobs
  const jobs = [];
  let i = 0;
  for (const title of titles) {
    for (const type of types) {
      const company = createdCompanies[i % createdCompanies.length];
      jobs.push({
        title,
        type,
        location: type === 'remote' ? 'Remote' : company.location,
        salary: 400 + (i % 10) * 150,
        companyId: company.id,
        description: `We are looking for a ${title} to join ${company.name}. This is a ${type} position.`,
      });
      i++;
    }
  }
  await prisma.job.createMany({ data: jobs });
  console.log(`companies/jobs: seeded ${companies.length} companies and ${jobs.length} jobs`);
}

async function main() {
  await seedCategoriesAndFoods();
  await seedCities();
  await seedProducts();
  await seedStudentsAndMarks();
  await seedAuthorsAndBooks();
  await seedCompaniesAndJobs();
  console.log('Seeding finished.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
