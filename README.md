# NexaBazar — Full-Stack E-commerce Project

NexaBazar is a complete portfolio-style e-commerce application built to stay close to the coding level and technology pattern of the **AdminPOV** project while improving the architecture, validation, security boundaries and feature completeness.

The project is split exactly into two main applications:

```text
NexaBazar/
├── backend/      # NestJS + PostgreSQL + TypeORM
├── frontend/     # Next.js + React + TypeScript + Tailwind CSS
├── database/     # Small PostgreSQL helper SQL
├── docs/         # Architecture, payment and asset explanations
└── README.md
```

## Application name

**Recommended name: NexaBazar**

It works well for a modern Bangladesh-focused multi-category e-commerce store and is already used throughout the source code and visual assets.

Alternative names if you want to rename it later: **BazarNext**, **NexaMart**, **UrbanBazar**, **ShopNexa**, **BongoCart**.

---

# 1. What is included

## Customer storefront

- Responsive modern homepage
- Hero image carousel
- Horizontal draggable/swipeable product carousels
- Category showcase
- Product listing
- Product search
- Category filtering
- Minimum/maximum price filtering
- Sort by newest, price and rating
- Pagination
- Product details page
- Multi-image product gallery
- Related product carousel
- Stock display
- Wishlist
- Shopping cart
- Quantity management
- Stock-aware quantity validation
- Checkout
- Cash on Delivery (COD)
- SSLCOMMERZ payment flow
- User profile
- Order history
- Individual order-details page
- Realtime order refresh with Pusher when configured
- Responsive mobile navigation drawer/sidebar

## Authentication and validation

- Registration
- Login using email **or** Bangladeshi phone number
- Logout
- HTTP-only server session
- Session-based protected routes
- Admin authorization guard
- Google OAuth / “Continue with Google” wiring
- bcrypt password hashing
- React Hook Form + Zod validation on the frontend
- DTO + `class-validator` validation on the NestJS backend
- Strong password requirements
- Bangladesh phone-number validation
- Email validation
- Confirm-password validation
- Unique email check
- Unique phone check
- Database-level unique constraints as a second protection layer
- Global NestJS `ValidationPipe` with unknown-field rejection

## Admin area

- Admin dashboard
- Order/revenue/customer statistics
- Product CRUD
- Product image upload with Multer
- 1–6 product images
- JPG / PNG / WEBP / GIF file validation
- 5 MB image-size limit
- Category CRUD
- Duplicate category validation
- Product stock management
- Order list
- Order status management
- Realtime admin order refresh with Pusher

## Backend services

- NestJS modules/controllers/services
- PostgreSQL
- TypeORM entities and relationships
- Session authentication
- Guards
- Multer uploads
- Mailer
- Pusher
- SSLCOMMERZ integration
- Seed data

---

# 2. Technology stack

## Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 4
- React Hook Form
- Zod
- Axios
- Pusher JS
- Lucide React icons

## Backend

- Node.js
- NestJS 11
- TypeScript
- PostgreSQL
- TypeORM
- `class-validator`
- `class-transformer`
- `express-session`
- Passport
- Google OAuth 2.0
- bcrypt
- Multer
- `@nestjs-modules/mailer`
- Pusher
- Axios for SSLCOMMERZ server requests

---

# 3. Requirements before running

Install these first:

1. **Node.js 20+** (Node 22 LTS is also fine)
2. **npm**
3. **PostgreSQL 14+**
4. VS Code or another editor

Optional external accounts are needed only for the corresponding features:

- Google Cloud OAuth credentials — Google login
- Pusher account — realtime events
- SMTP/Gmail app password — real emails
- SSLCOMMERZ sandbox merchant credentials — online payment

The application still runs locally without Google, Pusher, SMTP and SSLCOMMERZ credentials. Local registration/login, browsing, cart, wishlist, COD checkout and admin CRUD do not depend on those optional services.

---

# 4. PostgreSQL setup

Open pgAdmin or `psql` and create the database:

```sql
CREATE DATABASE nexabazar;
```

A helper file is also provided:

```text
database/create_database.sql
```

For development, `DB_SYNCHRONIZE=true` allows TypeORM to create/update the tables automatically when the backend starts.

> Do not use TypeORM `synchronize: true` for a real production database. Use migrations in production.

---

# 5. Backend setup

Open a terminal:

```bash
cd backend
npm install
```

Copy the environment example.

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

### Windows Command Prompt

```cmd
copy .env.example .env
```

### macOS/Linux

```bash
cp .env.example .env
```

Edit `backend/.env`.

Minimum local configuration:

```env
PORT=4000
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:4000
SESSION_SECRET=replace-this-with-a-long-random-secret
COOKIE_SECURE=false

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD
DB_NAME=nexabazar
DB_SYNCHRONIZE=true
```

Start the backend:

```bash
npm run start:dev
```

Backend URL:

```text
http://localhost:4000
```

Health endpoint:

```text
GET http://localhost:4000/
```

---

# 6. Seed the demo data

With PostgreSQL running and `backend/.env` configured:

```bash
cd backend
npm run seed
```

This creates:

- 1 admin user
- 5 categories
- 12 demo products

Seeded admin account:

```text
Email:    admin@nexabazar.com
Password: Admin@12345
```

Change this password/seed logic before using the project outside local development.

The seed is written to be repeatable: it checks for existing category/product slugs and the admin email before inserting them.

---

# 7. Frontend setup

Open another terminal:

```bash
cd frontend
npm install
```

Create the frontend environment file.

### Windows PowerShell

```powershell
Copy-Item .env.example .env.local
```

### Windows Command Prompt

```cmd
copy .env.example .env.local
```

### macOS/Linux

```bash
cp .env.example .env.local
```

Default local values:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=ap2
```

Run the frontend:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

---

# 8. Recommended first-run order

Use this sequence the first time:

```text
1. Start PostgreSQL
2. Create database `nexabazar`
3. Configure backend/.env
4. cd backend && npm install
5. cd backend && npm run start:dev
6. In another terminal: cd backend && npm run seed
7. Configure frontend/.env.local
8. cd frontend && npm install
9. cd frontend && npm run dev
10. Open http://localhost:3000
```

---

# 9. Frontend validation vs backend validation

The application deliberately validates important forms twice.

## Registration example

Frontend:

```text
frontend/app/register/page.tsx
```

Uses:

```text
React Hook Form
        +
       Zod
```

Checks include:

- name length and allowed characters
- proper email
- Bangladesh phone number
- password length
- uppercase letter
- lowercase letter
- number
- special character
- confirm-password match
- terms checkbox

Backend:

```text
backend/src/auth/dto/register.dto.ts
```

Uses NestJS DTO validation for the same security-sensitive fields.

Then:

```text
backend/src/users/users.service.ts
```

checks email and phone uniqueness before saving.

Finally PostgreSQL also has `unique: true` on those entity columns.

That means browser validation improves UX, while backend/database validation protects the actual data.

---

# 10. Authentication architecture

The local email/phone login flow is:

```text
Login form
   │
   ├─ Zod + React Hook Form
   │
   ▼
POST /auth/login
   │
   ├─ LoginDto validation
   ├─ find user by email OR normalized BD phone
   ├─ bcrypt.compare(password, hash)
   │
   ▼
express-session
   │
   ├─ session.userId
   └─ session.role
   │
   ▼
HTTP-only session cookie
   │
   ▼
Protected NestJS endpoints
```

The frontend Axios instance uses:

```ts
withCredentials: true
```

so the browser sends the session cookie to the backend.

Backend guards:

```text
backend/src/common/guards/session.guard.ts
backend/src/common/guards/admin.guard.ts
```

The backend still protects admin/customer APIs even if someone manually types an admin URL in the browser.

---

# 11. Google OAuth setup

Google login files:

```text
backend/src/auth/google.strategy.ts
backend/src/auth/auth.controller.ts
```

Add these to `backend/.env`:

```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback
```

In Google Cloud Console, create an **OAuth 2.0 Web application** and add this authorized redirect URI:

```text
http://localhost:4000/auth/google/callback
```

For a deployed site, replace it with your deployed backend callback URL.

Flow:

```text
Frontend “Continue with Google”
          │
          ▼
GET /auth/google
          │
          ▼
Google consent screen
          │
          ▼
/auth/google/callback
          │
          ├─ find Google ID
          ├─ otherwise link same email safely
          └─ otherwise create customer
          │
          ▼
Create normal server session
          │
          ▼
Redirect to frontend /account
```

Google commonly does not provide a phone number. The account page therefore asks a Google-created customer to add a unique Bangladeshi phone number before checkout.

---

# 12. Cart and stock logic

Cart APIs are protected with `SessionGuard`.

Important backend rules:

- product must exist
- product must have stock
- quantity must be integer
- quantity must be between 1 and 20
- quantity cannot exceed current product stock
- duplicate product rows are merged into one cart item

At checkout the backend **recalculates prices and stock again**. It does not trust the price shown in the browser.

This matters because frontend data can be modified manually by a user.

---

# 13. Checkout and order flow

```text
Cart
  │
  ▼
Checkout form
  │
  ├─ Zod validation
  ▼
POST /orders/checkout
  │
  ├─ CheckoutDto validation
  ├─ load cart from PostgreSQL
  ├─ re-check stock
  ├─ recalculate discounted unit price
  ├─ calculate subtotal
  ├─ calculate shipping
  ├─ calculate total
  ├─ create order snapshot
  ├─ reduce stock
  └─ clear cart
  │
  ├──────── COD ──────────► order confirmed / unpaid
  │
  └──── SSLCOMMERZ ───────► payment pending
```

Shipping in the demo:

```text
Subtotal >= ৳3,000  -> Free
Subtotal <  ৳3,000  -> ৳80
```

---

# 14. SSLCOMMERZ payment gateway

The project contains a sandbox-ready SSLCOMMERZ flow.

Main files:

```text
backend/src/payments/payments.controller.ts
backend/src/payments/payments.service.ts
backend/src/orders/orders.service.ts
frontend/app/checkout/page.tsx
frontend/app/payment/success/page.tsx
frontend/app/payment/fail/page.tsx
frontend/app/payment/cancel/page.tsx
```

Add sandbox credentials to `backend/.env`:

```env
SSLCOMMERZ_STORE_ID=your-sandbox-store-id
SSLCOMMERZ_STORE_PASSWORD=your-sandbox-store-password
SSLCOMMERZ_IS_LIVE=false
```

The important security rule is that the amount sent to the gateway comes from the **order stored in PostgreSQL**, not from a number sent by the frontend.

After SSLCOMMERZ returns a successful transaction, the backend calls SSLCOMMERZ's validation API and verifies:

- gateway status is valid
- transaction ID matches the order
- currency is BDT
- amount matches the database order total

Only then does the backend set:

```text
paymentStatus = PAID
orderStatus   = CONFIRMED
```

A detailed explanation is provided here:

```text
docs/PAYMENT_GATEWAY.md
```

### Local callback note

The success/fail/cancel URLs use `BACKEND_URL`. Browser redirects may work with localhost, but for reliable gateway callbacks/IPN during sandbox testing it is better to expose the backend temporarily using a development tunnel such as Cloudflare Tunnel or ngrok, then set `BACKEND_URL` and the callback configuration to that HTTPS URL.

---

# 15. Pusher realtime setup

Pusher is optional.

Backend `.env`:

```env
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=ap2
```

Frontend `.env.local`:

```env
NEXT_PUBLIC_PUSHER_KEY=THE_SAME_PUSHER_KEY
NEXT_PUBLIC_PUSHER_CLUSTER=ap2
```

Backend event service:

```text
backend/src/notifications/notifications.service.ts
```

Channels/events:

```text
admin-orders
  ├─ order-created
  └─ order-updated

user-{userId}
  └─ order-updated
```

When Pusher is not configured, the service safely does nothing and the rest of the application continues to work.

---

# 16. Mailer setup

Mailer is optional and disabled by default.

Default:

```env
MAIL_ENABLED=false
```

To use Gmail SMTP, use a Google **App Password**, not your normal Gmail password.

Example:

```env
MAIL_ENABLED=true
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-google-app-password
MAIL_FROM=NexaBazar <your-email@gmail.com>
```

The project can send:

- welcome email after registration
- order-created email
- order-status email

When mail is disabled the configured stream transport prevents SMTP credentials from being required during local development.

---

# 17. Product image upload

Admin product images are uploaded through:

```text
POST /products/upload
```

Backend implementation:

```text
backend/src/products/products.controller.ts
```

Rules:

- admin session required
- maximum 6 files
- JPG, PNG, WEBP or GIF only
- maximum 5 MB each
- random UUID filenames
- stored under `backend/uploads/products/`
- served from `/uploads/products/...`

The frontend also checks file type, size and count before upload, but the backend performs its own validation too.

---

# 18. Main folder structure

```text
backend/src/
├── auth/
│   ├── dto/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   └── google.strategy.ts
├── users/
├── categories/
├── products/
├── cart/
├── wishlist/
├── orders/
├── payments/
├── mail/
├── notifications/
├── common/
│   ├── guards/
│   └── utils/
├── seed/
├── app.module.ts
├── main.ts
└── seed.ts
```

```text
frontend/
├── app/
│   ├── account/
│   ├── admin/
│   ├── cart/
│   ├── checkout/
│   ├── login/
│   ├── payment/
│   ├── products/
│   ├── register/
│   ├── wishlist/
│   └── page.tsx
├── components/
├── context/
├── lib/
└── public/
    ├── images/
    └── docs/
```

For a detailed architecture walkthrough see:

```text
docs/ARCHITECTURE.md
```

---

# 19. Important API endpoints

## Authentication

```text
POST   /auth/register
POST   /auth/login
POST   /auth/logout
GET    /auth/me
PATCH  /auth/profile
GET    /auth/google
GET    /auth/google/callback
```

## Categories

```text
GET     /categories
POST    /categories             ADMIN
PATCH   /categories/:id         ADMIN
DELETE  /categories/:id         ADMIN
```

## Products

```text
GET     /products
GET     /products/featured
GET     /products/sale
GET     /products/:slug
GET     /products/admin/:id     ADMIN
POST    /products               ADMIN
PATCH   /products/:id           ADMIN
DELETE  /products/:id           ADMIN
POST    /products/upload        ADMIN
```

## Cart

```text
GET     /cart
POST    /cart
PATCH   /cart/:id
DELETE  /cart/:id
DELETE  /cart
```

## Wishlist

```text
GET     /wishlist
POST    /wishlist
DELETE  /wishlist/:productId
```

## Orders

```text
POST   /orders/checkout
GET    /orders/my
GET    /orders/:id
GET    /orders/admin/stats      ADMIN
GET    /orders/admin/all        ADMIN
PATCH  /orders/:id/status       ADMIN
```

## Payments

```text
POST /payments/sslcommerz/initiate/:orderId
POST /payments/sslcommerz/success
POST /payments/sslcommerz/fail
POST /payments/sslcommerz/cancel
POST /payments/sslcommerz/ipn
```

---

# 20. Assets/images

All visuals needed by the storefront are included inside the project, so the seed data works without hot-linking external product images.

Main asset locations:

```text
frontend/public/images/hero/
frontend/public/images/categories/
frontend/public/images/products/
frontend/public/images/deal-loop.gif
frontend/public/logo.svg
```

The two screenshots supplied as design inspiration are included only for reference under:

```text
frontend/public/docs/
```

See the complete asset explanation:

```text
docs/ASSETS.md
```

---

# 21. Security choices already implemented

- password hashes are not selected by normal TypeORM queries
- password is sanitized from auth responses
- bcrypt hashing with cost 12
- HTTP-only session cookie
- secure cookie mode configurable
- backend guards for protected APIs
- separate admin guard
- DTO validation globally enabled
- unknown DTO properties rejected
- database email uniqueness
- database phone uniqueness
- normalized Bangladeshi phone numbers
- product price and order total recalculated server-side
- SSLCOMMERZ result validated server-side
- stock checked on backend
- uploaded file type/size restricted
- secrets are stored in `.env`, not hard-coded in source files

---

# 22. Production-hardening notes

This project is intentionally kept understandable at an AdminPOV-to-early-intermediate level. For a real company launch, the next improvements should be:

1. Replace the default `express-session` MemoryStore with PostgreSQL/Redis-backed session storage.
2. Set `COOKIE_SECURE=true` behind HTTPS.
3. Add CSRF protection for state-changing cookie-authenticated requests.
4. Add rate limiting to login, registration and payment endpoints.
5. Use TypeORM migrations and set `DB_SYNCHRONIZE=false`.
6. Move uploaded media to object storage/CDN.
7. Add automated unit/integration/e2e tests.
8. Add structured logging and monitoring.
9. Add order-payment expiry/reconciliation jobs for abandoned online payments.
10. Add inventory locking/reservation for high-concurrency stores.
11. Add proper terms/privacy/refund pages for a public store.
12. Rotate the seeded admin password immediately outside local development.

These are deliberately listed as next steps instead of hiding them behind overly advanced code that would make the project difficult to explain.

---

# 23. Troubleshooting

## Backend cannot connect to PostgreSQL

Check:

```env
DB_HOST
DB_PORT
DB_USERNAME
DB_PASSWORD
DB_NAME
```

Confirm PostgreSQL service is running and `nexabazar` exists.

## Frontend receives CORS/session errors

For local development use:

```env
# backend/.env
FRONTEND_URL=http://localhost:3000
COOKIE_SECURE=false

# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Do not mix `localhost` and `127.0.0.1` unnecessarily because cookie/origin behavior can become confusing.

## Google login fails

Verify the Google callback URI exactly matches:

```text
http://localhost:4000/auth/google/callback
```

and that the Client ID/secret are configured.

## SSLCOMMERZ says it is not configured

Fill:

```env
SSLCOMMERZ_STORE_ID=
SSLCOMMERZ_STORE_PASSWORD=
SSLCOMMERZ_IS_LIVE=false
```

Use sandbox credentials for development.

## Product images uploaded by admin do not display

Verify:

```env
BACKEND_URL=http://localhost:4000
```

and confirm `backend/uploads/products/` exists.

---

# 24. Build commands

Backend:

```bash
cd backend
npm run build
```

Frontend:

```bash
cd frontend
npm run build
```

Production start commands after a successful build:

```bash
# backend
npm run start:prod

# frontend
npm run start
```

---

# 25. Recommended learning order for this project

To understand the code rather than memorizing it, study it in this order:

```text
1. frontend/lib/api.ts
2. backend/src/main.ts
3. User entity
4. Register/Login DTOs
5. AuthController + AuthService
6. SessionGuard + AdminGuard
7. Products entity/controller/service
8. Cart entity/controller/service
9. Wishlist
10. Orders entities + checkout service
11. Frontend checkout page
12. PaymentsService
13. PaymentsController
14. Pusher NotificationsService
15. MailService
16. Admin pages
```

That order follows the same progression as the concepts already present in AdminPOV and then adds the new e-commerce/payment pieces.

---

## Final note

The repository contains **no real credentials**. Copy the `.env.example` files and add your own local/sandbox credentials. Do not commit `.env` or `.env.local` files to GitHub.
