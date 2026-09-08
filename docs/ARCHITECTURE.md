# NexaBazar Architecture

## 1. High-level architecture

```text
┌──────────────────────────────────────┐
│ Next.js / React Frontend             │
│                                      │
│ Pages + Components                   │
│ React Hook Form + Zod                │
│ Axios                                │
│ Pusher JS                            │
└───────────────────┬──────────────────┘
                    │ HTTP / JSON
                    │ session cookie
                    ▼
┌──────────────────────────────────────┐
│ NestJS Backend                       │
│                                      │
│ Controllers                          │
│ DTO Validation                       │
│ Session/Admin Guards                 │
│ Services                             │
│ TypeORM                              │
│ Multer / Mailer / Pusher / Payment   │
└───────────────────┬──────────────────┘
                    │
                    ▼
┌──────────────────────────────────────┐
│ PostgreSQL                           │
│                                      │
│ users                                │
│ categories                           │
│ products                             │
│ cart_items                           │
│ wishlist_items                       │
│ orders                               │
│ order_items                          │
└──────────────────────────────────────┘
```

External optional services:

```text
Google OAuth
Pusher
SMTP
SSLCOMMERZ
```

---

## 2. Why the backend is split into modules

AdminPOV already used the NestJS Controller -> Service -> Repository concept. NexaBazar keeps that idea but separates business domains so one AdminService does not become responsible for the whole application.

```text
auth/
users/
categories/
products/
cart/
wishlist/
orders/
payments/
mail/
notifications/
```

Each feature is still simple enough to trace manually.

---

## 3. Typical NestJS request flow

Example: adding a product.

```text
Frontend ProductForm
    │
    ├─ React Hook Form + Zod
    ▼
POST /products
    │
    ▼
ProductsController
    │
    ├─ AdminGuard
    ├─ CreateProductDto
    ▼
ProductsService
    │
    ├─ duplicate slug check
    ├─ category lookup
    ▼
TypeORM Repository
    │
    ▼
PostgreSQL
```

---

## 4. Entity relationships

```text
User
 ├── 1:N CartItem
 ├── 1:N WishlistItem
 └── 1:N Order

Category
 └── 1:N Product

Product
 ├── N:1 Category
 ├── referenced by CartItem
 └── referenced by WishlistItem

Order
 ├── N:1 User
 └── 1:N OrderItem
```

Order items are snapshots. They store product name, unit price, quantity and image at purchase time, so an old order does not lose its historical price/name just because the product changes later.

---

## 5. Frontend architecture

### `app/`

Next.js App Router pages.

### `components/`

Reusable visual/functional components such as:

```text
Navbar
HeroCarousel
ProductCarousel
ProductCard
ProductForm
AdminShell
Footer
```

### `context/`

```text
AuthContext
ToastContext
```

`AuthContext` centralizes the current logged-in user instead of requesting `/auth/me` separately inside every component.

### `lib/`

```text
api.ts             Axios client
utils.ts           money/slug/error helpers
types.ts           shared frontend TypeScript shapes
useOrderRealtime.ts Pusher subscription hook
```

---

## 6. Authentication boundary

The frontend may hide admin navigation, but that is not considered security.

Actual access control lives in the NestJS backend:

```text
SessionGuard -> any logged-in user
AdminGuard   -> logged-in ADMIN only
```

That means a customer cannot gain admin API access just by editing frontend JavaScript.

---

## 7. Validation boundary

```text
Frontend Zod
    │
    │ UX validation
    ▼
Backend DTO / ValidationPipe
    │
    │ trust boundary
    ▼
Service business rules
    │
    │ uniqueness/stock/ownership
    ▼
PostgreSQL constraints
```

Every layer has a different job.

---

## 8. Realtime architecture

```text
Order created / status changed
          │
          ▼
NotificationsService
          │
          ▼
Pusher
     ┌────┴─────────────┐
     ▼                  ▼
admin-orders       user-{id}
     │                  │
     ▼                  ▼
Admin UI           Customer order UI
refreshes          refreshes
```

Pusher is optional, so no Pusher credentials means normal HTTP functionality still works.

---

## 9. Mail architecture

Business services call `MailService` after important events.

Examples:

```text
registration -> welcome email
checkout     -> order-created email
status edit  -> order-status email
```

The mail module is configured centrally from environment variables.

---

## 10. Payment architecture

```text
Checkout
   │
   ▼
OrdersService creates trusted order total
   │
   ▼
PaymentsService creates SSLCOMMERZ session
   │
   ▼
Hosted SSLCOMMERZ page
   │
   ▼
Callback/IPN
   │
   ▼
PaymentsService validation API call
   │
   ▼
transaction + currency + amount checks
   │
   ▼
PAID + CONFIRMED
```

See `PAYMENT_GATEWAY.md` for the detailed explanation.

---

## 11. Why this architecture fits the intended skill level

The project deliberately does **not** use:

- microservices
- Kafka
- CQRS
- event sourcing
- GraphQL federation
- Kubernetes
- complicated repository abstraction layers

Those technologies are not necessary to demonstrate this e-commerce system and would make the project harder to understand and defend in a viva/interview.

The main progression from AdminPOV is instead:

```text
better module separation
+ consistent DTO validation
+ backend authorization
+ stronger TypeScript usage
+ real cart/order relationships
+ payment validation
+ reusable frontend components
```
