// Makes the foods practice data exact: exactly these 4 categories and
// exactly these 20 Somali foods, each connected to the right category.
// - Foods/categories NOT in the lists below are DELETED.
// - No other table is touched.
// - Safe to rerun (upserts by unique name/slug).
//
// Usage:
//   node scripts/add-somali-foods.js --dry-run   show what would change, change nothing
//   node scripts/add-somali-foods.js             apply the changes
// DATABASE_URL must be set in the environment or .env (it is never printed).
import prisma from '../lib/prisma.js';

const DRY_RUN = process.argv.includes('--dry-run');

// images are stable direct URLs from Wikimedia Commons (all verified to load)
const categories = [
  {
    name: 'Quraac',
    slug: 'quraac',
    description: 'Quraacdu waa cuntada ugu horreysa ee maalinta. Waxaa ka mid ah canjeero, malawax, rooti iyo shaah caano leh, kuwaas oo maalinta si fiican loogu bilaabo.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/4/44/LahohS.jpg',
  },
  {
    name: 'Qado',
    slug: 'qado',
    description: 'Qadadu waa cuntada ugu weyn ee maalinta, waxaana badanaa la cunaa duhurkii. Waxaa caan ka ah bariis, baasto, hilib iyo kaluun.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/SOMALI_FAVORITE_MAIN_FOOD.jpg/960px-SOMALI_FAVORITE_MAIN_FOOD.jpg',
  },
  {
    name: 'Casho',
    slug: 'casho',
    description: 'Cashadu waa cuntada habeenkii la cuno. Inta badan waa cunto fudud sida cambuulo, soor, maraq ama baasto.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Chicknspag.jpg/960px-Chicknspag.jpg',
  },
  {
    name: 'Casariye',
    slug: 'casariye',
    description: 'Casariye waa cunto fudud oo galabta la cuno, badanaa shaah ayaa lagu daraa. Waxaa ka mid ah sambuus, bajiyo, kac kac iyo xalwo.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Tea_and_mandazi.jpg/960px-Tea_and_mandazi.jpg',
  },
];

// category is matched by slug below
const foods = [
  // Quraac
  { name: 'Canjeero iyo Maraq', category: 'quraac', price: 5, rating: 4.7, tags: ['breakfast'], description: 'Canjeero jilicsan oo la duudduubay, lagu cuno maraq kulul. Waa quraac Soomaalidu aad u jecel yihiin.', ingredients: ['bur', 'biyo', 'khamiir'], image: 'https://upload.wikimedia.org/wikipedia/commons/8/85/Canjeer_wwikipedia.jpg' },
  { name: 'Malawax', category: 'quraac', price: 4, rating: 4.5, tags: ['breakfast', 'sweet'], description: 'Malawax waa canjeero khafiif ah oo saliid lagu dubay. Waxaa lagu cunaa malab, sonkor ama suugo.', ingredients: ['bur', 'ukun', 'sonkor'], image: 'https://upload.wikimedia.org/wikipedia/commons/7/78/Malawach.jpg' },
  { name: 'Muufo', category: 'quraac', price: 4, rating: 4.3, tags: ['breakfast', 'bread'], description: 'Muufo waa rooti laga sameeyo bur galley, waxaana lagu dubaa foorno dhoobo ah. Waxaa lagu cunaa shaah ama maraq.', ingredients: ['bur galley', 'biyo'], image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Preparation_of_qurasah.jpg/960px-Preparation_of_qurasah.jpg' },
  { name: 'Rooti iyo Shaah', category: 'quraac', price: 3, rating: 4.2, tags: ['breakfast', 'drink'], description: 'Rooti jilicsan iyo shaah caano iyo xawaash leh. Waa quraac fudud oo degdeg ah.', ingredients: ['rooti', 'shaah', 'caano'], image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Tea_and_Bread.JPG/960px-Tea_and_Bread.JPG' },
  { name: 'Boorash', category: 'quraac', price: 3, rating: 4.0, tags: ['breakfast', 'sweet'], description: 'Boorash diiran oo jilicsan, lagu daro caano iyo sonkor. Waa quraac tamar badan oo caruurta iyo dadka waaweyn ku habboon.', ingredients: ['bur', 'caano', 'sonkor'], image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Bowl_of_porridge_with_spoon.jpg/960px-Bowl_of_porridge_with_spoon.jpg' },

  // Qado
  { name: 'Bariis Iskukaris', category: 'qado', price: 12, rating: 4.8, tags: ['lunch', 'rice'], description: 'Bariis lagu kariyey hilib, khudaar iyo xawaash Soomaali. Waa cuntada qadada ugu caansan.', ingredients: ['bariis', 'hilib', 'xawaash'], image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Hilib.jpg/960px-Hilib.jpg' },
  { name: 'Baasto Soomaali', category: 'qado', price: 10, rating: 4.6, tags: ['lunch', 'pasta'], description: 'Baasto lagu shubay suugo hilib iyo yaanyo leh. Waa qado Soomaalidu aad u jecel yihiin.', ingredients: ['baasto', 'hilib', 'yaanyo'], image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/BaastoSuugo.jpg/960px-BaastoSuugo.jpg' },
  { name: 'Suqaar', category: 'qado', price: 15, rating: 4.7, tags: ['lunch', 'meat', 'spicy'], description: 'Hilib yaryar oo la jarjaray, lagu shiilay basal, basbaas iyo xawaash. Waxaa lagu cunaa bariis, baasto ama canjeero.', ingredients: ['hilib', 'basal', 'basbaas'], image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Cooking_stir_fry_beef%2C_Terrytown%2C_Louisiana%2C_February_2016.jpg/960px-Cooking_stir_fry_beef%2C_Terrytown%2C_Louisiana%2C_February_2016.jpg' },
  { name: 'Hilib Ari', category: 'qado', price: 20, rating: 4.9, tags: ['lunch', 'meat'], description: 'Hilib ari oo la dubay ama la kariyey, dhadhan macaan leh. Waxaa lagu cunaa bariis ama muufo.', ingredients: ['hilib ari', 'xawaash'], image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Roasted_goat%27s_meat.jpg/960px-Roasted_goat%27s_meat.jpg' },
  { name: 'Kaluun La Shiilay', category: 'qado', price: 14, rating: 4.5, tags: ['lunch', 'fish'], description: 'Kaluun cusub oo la shiilay, lagu daray liin iyo xawaash. Waxaa badanaa lagu cunaa bariis.', ingredients: ['kaluun', 'liin', 'xawaash'], image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Fried_Fish_2.jpg/960px-Fried_Fish_2.jpg' },

  // Casho
  { name: 'Cambuulo', category: 'casho', price: 7, rating: 4.6, tags: ['dinner', 'beans'], description: 'Digir azuki ah oo la kariyey, lagu daray subag iyo sonkor. Waa casho caan ah oo caafimaad leh.', ingredients: ['digir', 'subag', 'sonkor'], image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Africa_ugali_and_beans.jpg/960px-Africa_ugali_and_beans.jpg' },
  { name: 'Soor iyo Maraq', category: 'casho', price: 8, rating: 4.4, tags: ['dinner'], description: 'Soor galley ah oo jilicsan, lagu cuno maraq iyo khudaar. Waa casho dhaqameed Soomaaliyeed.', ingredients: ['bur galley', 'khudaar'], image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Ugali%2C_Maharage_%26_Kuku.JPG/960px-Ugali%2C_Maharage_%26_Kuku.JPG' },
  { name: 'Canjeero iyo Hilib', category: 'casho', price: 10, rating: 4.6, tags: ['dinner', 'meat'], description: 'Canjeero lagu cuno suqaar hilib ah. Waa casho fudud oo dhadhan wanaagsan.', ingredients: ['canjeero', 'hilib', 'basal'], image: 'https://upload.wikimedia.org/wikipedia/commons/1/11/Canjeelo.jpg' },
  { name: 'Baasto Fudud', category: 'casho', price: 8, rating: 4.1, tags: ['dinner', 'pasta'], description: 'Baasto fudud oo suugo khafiif ah leh. Waa casho degdeg ah oo la jecel yahay.', ingredients: ['baasto', 'suugo'], image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Spaghetti_bolognese_at_restaurant_Persilja.jpg/960px-Spaghetti_bolognese_at_restaurant_Persilja.jpg' },
  { name: 'Maraq Digaag', category: 'casho', price: 9, rating: 4.5, tags: ['dinner', 'soup'], description: 'Maraq digaag oo kulul, lagu daray khudaar iyo xawaash. Waa casho diiran oo caafimaad leh.', ingredients: ['digaag', 'khudaar', 'biyo'], image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Spicy_Tomato_Chicken_Stew.jpg/960px-Spicy_Tomato_Chicken_Stew.jpg' },

  // Casariye
  { name: 'Sambuus', category: 'casariye', price: 2, rating: 4.8, tags: ['snack', 'fried'], description: 'Sambuus waa bur la duubay oo ay ku jiraan hilib, basal iyo basbaas, kadibna la shiilay. Waa cuntada casariyaha ugu caansan.', ingredients: ['bur', 'hilib', 'basal'], image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Samboosa.JPG/960px-Samboosa.JPG' },
  { name: 'Bajiyo', category: 'casariye', price: 2, rating: 4.4, tags: ['snack', 'fried'], description: 'Bajiyo waa kubbado yaryar oo laga sameeyo digir la shiiday, kadibna la shiilay. Waxaa lagu cunaa basbaas.', ingredients: ['digir', 'basal', 'basbaas'], image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Falafel_1.JPG/960px-Falafel_1.JPG' },
  { name: 'Kac Kac', category: 'casariye', price: 2, rating: 4.3, tags: ['snack', 'sweet'], description: 'Kac kac waa bur macaan oo la shiilay, qaab afar gees ah. Waxaa lagu cabaa shaah.', ingredients: ['bur', 'sonkor', 'saliid'], image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Mandazis.jpg/960px-Mandazis.jpg' },
  { name: 'Qumbe', category: 'casariye', price: 3, rating: 4.2, tags: ['snack', 'sweet'], description: 'Nacnac laga sameeyo qumbe iyo sonkor. Waa macmacaan casariye ah oo la jecel yahay.', ingredients: ['qumbe', 'sonkor'], image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Coconut_Candy_%2852311610055%29.jpg/960px-Coconut_Candy_%2852311610055%29.jpg' },
  { name: 'Xalwo', category: 'casariye', price: 5, rating: 4.7, tags: ['snack', 'sweet'], description: 'Xalwo waa macmacaan Soomaaliyeed oo laga sameeyo sonkor, saliid iyo xawaash. Waxaa la cunaa munaasabadaha iyo casariyaha.', ingredients: ['sonkor', 'saliid', 'xawaash'], image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Omani_Halwa_with_saffron.jpg/960px-Omani_Halwa_with_saffron.jpg' },
];

const keepFoodNames = foods.map((f) => f.name);
const keepCategorySlugs = categories.map((c) => c.slug);

async function main() {
  // what exists now (names only, no secrets)
  const existingCategories = await prisma.categories.findMany({ select: { name: true, slug: true } });
  const existingFoods = await prisma.foods.findMany({ select: { name: true } });
  const existingFoodNames = new Set(existingFoods.map((f) => f.name));

  const foodsToDelete = existingFoods.filter((f) => !keepFoodNames.includes(f.name));
  const categoriesToDelete = existingCategories.filter((c) => !keepCategorySlugs.includes(c.slug));

  console.log(`Before: ${existingCategories.length} categories, ${existingFoods.length} foods`);
  console.log(`Foods to delete (${foodsToDelete.length}): ${foodsToDelete.map((f) => f.name).join(', ') || 'none'}`);
  console.log(`Categories to delete (${categoriesToDelete.length}): ${categoriesToDelete.map((c) => c.name).join(', ') || 'none'}`);

  if (DRY_RUN) {
    const createFoods = keepFoodNames.filter((n) => !existingFoodNames.has(n));
    const updateFoods = keepFoodNames.filter((n) => existingFoodNames.has(n));
    console.log(`Foods to create (${createFoods.length}): ${createFoods.join(', ') || 'none'}`);
    console.log(`Foods to update (${updateFoods.length}): ${updateFoods.join(', ') || 'none'}`);
    console.log('Dry run: nothing was changed.');
    return;
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. remove foods that are not in the 20-food list
    const deletedFoods = await tx.foods.deleteMany({
      where: { name: { notIn: keepFoodNames } },
    });

    // 2. create/update the 4 categories
    const categoryIds = {};
    for (const cat of categories) {
      const saved = await tx.categories.upsert({
        where: { slug: cat.slug },
        update: { name: cat.name, description: cat.description, image: cat.image },
        create: cat,
      });
      categoryIds[cat.slug] = saved.id;
    }

    // 3. remove categories that are not in the 4-category list
    //    (their foods were already deleted or will be re-linked below)
    const deletedCategories = await tx.categories.deleteMany({
      where: { slug: { notIn: keepCategorySlugs } },
    });

    // 4. create/update the 20 foods, each connected to the right category
    let created = 0;
    let updated = 0;
    for (const food of foods) {
      const { category, ...data } = food;
      const values = { ...data, categoryId: categoryIds[category], isAvailable: true };
      await tx.foods.upsert({
        where: { name: food.name },
        update: values,
        create: values,
      });
      if (existingFoodNames.has(food.name)) updated++;
      else created++;
    }

    return { deletedFoods: deletedFoods.count, deletedCategories: deletedCategories.count, created, updated };
  }, { timeout: 120000, maxWait: 15000 }); // generous timeout for remote databases

  console.log(`Deleted: ${result.deletedFoods} foods, ${result.deletedCategories} categories`);
  console.log(`Foods: ${result.created} created, ${result.updated} updated`);

  // verify the final state
  const catCount = await prisma.categories.count();
  const foodCount = await prisma.foods.count();
  const perCategory = await prisma.categories.findMany({
    select: { name: true, _count: { select: { foods: true } } },
    orderBy: { name: 'asc' },
  });
  console.log(`After: ${catCount} categories, ${foodCount} foods`);
  for (const c of perCategory) {
    console.log(`  ${c.name}: ${c._count.foods} foods`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
