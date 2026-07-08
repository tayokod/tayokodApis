# Tayokod Practice API

A simple REST API for students to practice fetching, filtering, searching, pagination, and CRUD operations.

Built with **Express 5**, **Prisma**, and **PostgreSQL**.

## Resources

| Resource   | List endpoint     | Notes                                   |
| ---------- | ----------------- | --------------------------------------- |
| Foods      | `/api/foods`      | Somali foods, belongs to a category     |
| Categories | `/api/categories` | Food categories                         |
| Cities     | `/api/cities`     | Standalone cities                       |
| Products   | `/api/products`   | E-commerce style products               |
| Students   | `/api/students`   | One student has many marks              |
| Marks      | `/api/marks`      | Belongs to a student                    |
| Authors    | `/api/authors`    | One author has many books               |
| Books      | `/api/books`      | Belongs to an author                    |
| Companies  | `/api/companies`  | One company has many jobs               |
| Jobs       | `/api/jobs`       | Belongs to a company                    |

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Create a .env file (see below)

# 3. Apply the database migrations
npx prisma migrate deploy

# 4. Generate the Prisma client
npx prisma generate

# 5. Fill the database with practice data (safe to rerun)
npm run seed

# 6. Start the dev server (restarts on file changes)
npm run dev

# Or start it normally
npm start
```

### .env example

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DATABASE"
API_KEY="choose-a-strong-secret-key"
PORT=3000
```

The server refuses to start if `API_KEY` is missing.

## Authentication

- **GET endpoints are public** — no key needed.
- **POST / PATCH / PUT / DELETE need an API key** in the `x-api-key` header, otherwise you get `403 Forbidden`.

```
x-api-key: your-api-key
```

## Static images

Locally-hosted images are served from the `images/` folder at `/images/...`.
For example, some book covers live at `/images/books/<name>.jpg`. Book `image`
fields are either a full external cover URL or a local `/images/books/...` path.

## Common query features

Most list endpoints support:

- `?search=text` — case-insensitive search
- `?page=1&limit=10` — pagination. Without `page`/`limit` you get a plain array; with them you get `{ data, pagination: { page, limit, total, totalPages } }`
- Filters and sorting where listed below

Error responses always look like `{ "error": "message" }`:

- `400` — invalid id, bad query value, invalid body, or a foreign key that does not exist
- `403` — missing or wrong API key
- `404` — record not found
- `409` — duplicate unique value (e.g. a city name that already exists)

## Endpoints

### Cities

```
GET    /api/cities
GET    /api/cities/:id
GET    /api/cities?search=Jigjiga
GET    /api/cities?country=Ethiopia
GET    /api/cities?page=1&limit=10
POST   /api/cities            (protected)
PATCH  /api/cities/:id        (protected)
DELETE /api/cities/:id        (protected)
```

Body for POST: `{ "name": "Jigjiga", "country": "Ethiopia", "population": 126000 }` (`country` and `population` optional)

### Products

```
GET    /api/products
GET    /api/products/:id
GET    /api/products?search=phone
GET    /api/products?category=electronics
GET    /api/products?minPrice=100&maxPrice=1000
GET    /api/products?page=1&limit=10
GET    /api/products?sort=price        (ascending)
GET    /api/products?sort=-price       (descending)
POST   /api/products          (protected)
PATCH  /api/products/:id      (protected)
DELETE /api/products/:id      (protected)
```

Body for POST: `{ "title": "Nova Phone", "price": 300, "category": "electronics", "description": "...", "rating": 4.5, "stock": 10 }` (`title`, `price`, `category` required)

### Students and Marks

```
GET    /api/students
GET    /api/students/:id               (includes marks)
GET    /api/students/:id/marks
GET    /api/students?search=ahmed
GET    /api/students?className=Grade 9A
POST   /api/students          (protected)
PATCH  /api/students/:id      (protected)
DELETE /api/students/:id      (protected, deletes their marks too)

GET    /api/marks
GET    /api/marks/:id
GET    /api/marks?studentId=1
GET    /api/marks?subject=Math
GET    /api/marks?status=Passed
POST   /api/marks             (protected)
PATCH  /api/marks/:id         (protected)
DELETE /api/marks/:id         (protected)
```

Student body: `{ "fullName": "Ahmed Warsame", "className": "Grade 9A", "gender": "male", "city": "Jigjiga", "email": "ahmed@example.com" }` (`email` optional)

Mark body: `{ "studentId": 1, "subject": "Math", "score": 75 }`

- `score` must be between 0 and 100.
- If you do not send `status`, it is calculated: score >= 50 is `Passed`, below 50 is `Failed`.

### Authors and Books

```
GET    /api/authors
GET    /api/authors/:id                (includes books)
GET    /api/authors/:id/books
POST   /api/authors           (protected)
PATCH  /api/authors/:id       (protected)
DELETE /api/authors/:id       (protected, deletes their books too)

GET    /api/books
GET    /api/books/:id
GET    /api/books?authorId=1
GET    /api/books?genre=programming
GET    /api/books?search=javascript
POST   /api/books             (protected)
PATCH  /api/books/:id         (protected)
DELETE /api/books/:id         (protected)
```

Author body: `{ "name": "Nuruddin Farah", "country": "Somalia" }`

Book body: `{ "title": "Learning JavaScript", "genre": "programming", "authorId": 1, "publishedYear": 2020 }`

### Companies and Jobs

```
GET    /api/companies
GET    /api/companies/:id              (includes jobs)
GET    /api/companies/:id/jobs
POST   /api/companies         (protected)
PATCH  /api/companies/:id     (protected)
DELETE /api/companies/:id     (protected, deletes their jobs too)

GET    /api/jobs
GET    /api/jobs/:id
GET    /api/jobs?companyId=1
GET    /api/jobs?type=remote
GET    /api/jobs?location=Jigjiga
GET    /api/jobs?search=developer
POST   /api/jobs              (protected)
PATCH  /api/jobs/:id          (protected)
DELETE /api/jobs/:id          (protected)
```

Company body: `{ "name": "Tayokod", "location": "Jigjiga", "website": "https://tayokod.com" }` (`website` optional)

Job body: `{ "title": "Frontend Developer", "type": "remote", "location": "Remote", "salary": 800, "companyId": 1, "description": "..." }` (`salary` optional)

### Foods and Categories

```
GET    /api/foods
GET    /api/foods/:id
GET    /api/foods?search=canjeero
GET    /api/foods?categoryId=1
GET    /api/foods?minPrice=5&maxPrice=15
GET    /api/foods?tags=spicy,vegan
GET    /api/foods?sort=-price
GET    /api/foods/category/:categoryName
POST   /api/foods             (protected)
PUT    /api/foods/:id         (protected)
DELETE /api/foods/:id         (protected)

GET    /api/categories
GET    /api/categories/:id             (includes foods)
POST   /api/categories        (protected)
PUT    /api/categories/:id    (protected)
DELETE /api/categories/:id    (protected)
```

## Fetch examples

```js
// Get all products
fetch('http://localhost:3000/api/products')
  .then((res) => res.json())
  .then((products) => console.log(products));

// Search and filter
fetch('http://localhost:3000/api/products?category=electronics&sort=-price&page=1&limit=10')
  .then((res) => res.json())
  .then((result) => console.log(result.data, result.pagination));

// Create a city (protected)
fetch('http://localhost:3000/api/cities', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your-api-key',
  },
  body: JSON.stringify({ name: 'Wajaale', country: 'Ethiopia' }),
})
  .then((res) => res.json())
  .then((city) => console.log(city));
```

## Axios examples

```js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: { 'x-api-key': 'your-api-key' },
});

// Get one student with their marks
const { data: student } = await api.get('/students/1');

// Add a mark (status is calculated automatically)
const { data: mark } = await api.post('/marks', {
  studentId: 1,
  subject: 'Math',
  score: 85,
});

// Update a product
await api.patch('/products/1', { price: 250 });

// Delete a job
await api.delete('/jobs/1');
```

## Practice tasks for students

1. Fetch all cities and show them in a list.
2. Add a search input that calls `/api/cities?search=...` while typing.
3. Build a product grid with pagination buttons using `page` and `limit`.
4. Add a price filter with `minPrice` and `maxPrice`, and a sort dropdown (`price`, `-price`).
5. Show one student's report card using `/api/students/:id/marks`, and color `Passed` green and `Failed` red.
6. Calculate a student's average score on the frontend.
7. List authors, and when one is clicked, load their books from `/api/authors/:id/books`.
8. Build a job board: filter by `type=remote` and search by title.
9. Build a form that creates a new student (remember the `x-api-key` header).
10. Handle errors: show the API's `error` message when a request fails (try creating a duplicate city).

## Useful Prisma commands

```bash
npx prisma migrate dev --name my_change   # create a new migration after editing schema.prisma
npx prisma migrate deploy                 # apply migrations (production)
npx prisma generate                       # regenerate the client
npx prisma studio                         # browse the database in the browser
npm run seed                              # fill the database with practice data
```
