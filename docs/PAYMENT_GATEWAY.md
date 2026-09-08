# SSLCOMMERZ Payment Gateway — Code and Flow Explanation

This document explains the NexaBazar online-payment implementation at the code level.

The design goal is simple: **the frontend may choose the payment method, but it never decides how much money SSLCOMMERZ should charge.** The backend calculates and validates the amount.

---

## 1. Relevant files

```text
frontend/app/checkout/page.tsx
frontend/app/payment/success/page.tsx
frontend/app/payment/fail/page.tsx
frontend/app/payment/cancel/page.tsx

backend/src/orders/order.entity.ts
backend/src/orders/orders.controller.ts
backend/src/orders/orders.service.ts
backend/src/payments/payments.controller.ts
backend/src/payments/payments.service.ts
```

---

## 2. Payment-related values stored in each order

`backend/src/orders/order.entity.ts` defines:

```text
paymentMethod
  ├─ COD
  └─ SSLCOMMERZ

paymentStatus
  ├─ UNPAID
  ├─ PENDING
  ├─ PAID
  ├─ FAILED
  └─ CANCELLED

transactionId
gatewayData
```

`gatewayData` stores the validation response for later inspection/debugging.

---

## 3. Step 1 — customer submits checkout

In:

```text
frontend/app/checkout/page.tsx
```

the customer chooses either:

```text
COD
SSLCOMMERZ
```

The frontend sends only delivery information and the chosen payment method:

```text
POST /orders/checkout
```

The browser does **not** send a trusted final charge amount.

---

## 4. Step 2 — backend creates the order

In:

```text
backend/src/orders/orders.service.ts
```

`checkout()` loads the user's real cart from PostgreSQL.

For every cart item it:

1. reads the real product record
2. checks current stock
3. calculates the discounted unit price
4. calculates subtotal
5. calculates shipping fee
6. calculates total
7. creates order-item snapshots
8. reduces inventory
9. creates the order
10. clears the cart

Example:

```text
Database product price = ৳4,590
Discount               = 8%
Backend unit price      = ৳4,222.80
Quantity                = 2
Line total              = ৳8,445.60
```

Even if somebody changes a price in browser DevTools, the backend still reads the database price.

For SSLCOMMERZ the new order starts as:

```text
status        = PENDING
paymentStatus = PENDING
paymentMethod = SSLCOMMERZ
```

---

## 5. Step 3 — frontend asks backend to create a gateway session

After order creation the frontend calls:

```text
POST /payments/sslcommerz/initiate/:orderId
```

This endpoint is protected by `SessionGuard`.

The backend receives the authenticated user ID from the server session, not from a user-controlled request body.

---

## 6. Step 4 — authorization check

`PaymentsService.initiate()` first calls:

```text
orders.findOneForUser(orderId, userId, role)
```

That prevents a normal customer from initiating payment for another customer's order.

It also checks:

```text
order.paymentMethod === SSLCOMMERZ
order.paymentStatus !== PAID
```

---

## 7. Step 5 — backend generates the transaction ID

The backend creates a value similar to:

```text
NB151234567890
```

and stores it on the order before contacting SSLCOMMERZ.

That stored ID is later used to connect the gateway callback to the correct order.

---

## 8. Step 6 — backend prepares SSLCOMMERZ parameters

Inside:

```text
backend/src/payments/payments.service.ts
```

these important values are sent:

```text
store_id
store_passwd
total_amount
currency=BDT
tran_id
success_url
fail_url
cancel_url
ipn_url
customer information
shipping information
```

The critical line conceptually is:

```text
total_amount = order.total from PostgreSQL
```

not:

```text
total_amount = frontendRequest.total
```

That is one of the most important payment-security decisions in the project.

---

## 9. Step 7 — backend calls SSLCOMMERZ

Sandbox endpoint:

```text
https://sandbox-gw.sslcommerz.com/gwprocess/v4/api.php
```

Live endpoint is selected only when:

```env
SSLCOMMERZ_IS_LIVE=true
```

The backend uses Axios and form-url-encoded data.

A successful initialization response contains a hosted checkout URL such as:

```text
GatewayPageURL
```

The backend returns that URL to the frontend.

---

## 10. Step 8 — browser redirects to hosted payment page

The checkout page does:

```text
window.location.href = payment.data.gatewayUrl
```

The user enters card/mobile-banking/payment information on the gateway-hosted page, not inside NexaBazar.

That keeps sensitive payment credential handling outside this application.

---

## 11. Step 9 — SSLCOMMERZ posts back to the backend

Possible callbacks:

```text
POST /payments/sslcommerz/success
POST /payments/sslcommerz/fail
POST /payments/sslcommerz/cancel
POST /payments/sslcommerz/ipn
```

The success callback does **not** immediately trust the word “success”.

Instead it calls the validation method.

---

## 12. Step 10 — server-to-server validation

`PaymentsService.validate()` sends `val_id` to SSLCOMMERZ's validation API.

The backend then verifies four things:

```text
1. status is VALID or VALIDATED
2. returned tran_id equals the order transactionId
3. returned currency is BDT
4. returned amount equals the database order total
```

The amount check uses a small decimal tolerance:

```text
abs(gatewayAmount - order.total) < 0.01
```

If any check fails, the backend throws an error and **does not mark the order paid**.

---

## 13. Step 11 — mark payment as paid

Only after successful validation:

```text
paymentStatus = PAID
status        = CONFIRMED
```

The gateway response is stored in `gatewayData`.

The notification service can then notify connected clients using Pusher.

---

## 14. Success redirect

After the backend validation succeeds, the backend redirects the browser to:

```text
/frontend/payment/success?order=ORDER_NUMBER
```

If validation fails:

```text
/frontend/payment/fail?reason=validation
```

If the customer cancels:

```text
/frontend/payment/cancel
```

---

## 15. Why both success callback and IPN exist

A browser redirect is useful for user experience, but users can close a browser or lose connection.

IPN (Instant Payment Notification) lets the payment gateway notify the backend separately.

The project includes:

```text
POST /payments/sslcommerz/ipn
```

which validates a valid payment again before marking it paid.

This gives the backend another reconciliation path.

---

## 16. Why this is safer than trusting the frontend

Bad design:

```text
Browser sends { orderId: 10, amount: 1 }
Backend sends ৳1 to gateway
```

NexaBazar design:

```text
Browser sends orderId 10
       │
       ▼
Backend loads order 10 from PostgreSQL
       │
       ▼
Backend reads total = ৳8,445.60
       │
       ▼
Backend sends ৳8,445.60 to SSLCOMMERZ
       │
       ▼
Gateway returns result
       │
       ▼
Backend validates gateway amount == ৳8,445.60
```

The customer cannot simply alter the JavaScript price and pay a different amount.

---

## 17. Cash on Delivery flow

COD does not call SSLCOMMERZ.

At order creation:

```text
status        = CONFIRMED
paymentStatus = UNPAID
paymentMethod = COD
```

When an admin marks a COD order `DELIVERED`, the backend changes:

```text
paymentStatus = PAID
```

This represents payment being collected on delivery.

---

## 18. Failed/cancelled online payments and stock

NexaBazar creates the order and reserves/reduces stock before opening the external payment page.

If payment fails or is cancelled, the payment status changes, while the order remains available for retry from the order-details page.

If the order should no longer be kept, an admin can change the order to `CANCELLED`. The order service then restores every order item's quantity back into product stock.

This makes the simple learning-level flow easy to understand:

```text
checkout -> reserve stock -> try payment -> retry OR admin cancel/restock
```

A large production store would usually add an automatic payment-expiry/reservation job.

---

## 19. Sandbox environment variables

```env
SSLCOMMERZ_STORE_ID=YOUR_STORE_ID
SSLCOMMERZ_STORE_PASSWORD=YOUR_STORE_PASSWORD
SSLCOMMERZ_IS_LIVE=false
```

Do not put these values in frontend environment variables. The store password belongs only on the backend.

---

## 20. Local testing sequence

```text
1. Start PostgreSQL
2. Start backend on port 4000
3. Start frontend on port 3000
4. Login/register
5. Add an item to cart
6. Go to checkout
7. Choose SSLCOMMERZ
8. Place order
9. Backend creates order
10. Backend creates SSLCOMMERZ session
11. Browser opens sandbox payment page
12. Complete sandbox payment
13. Callback reaches backend
14. Backend validates with SSLCOMMERZ
15. Order becomes PAID + CONFIRMED
16. Browser opens payment success page
```

For reliable callback/IPN testing from the internet, expose the backend through an HTTPS development tunnel and update `BACKEND_URL` accordingly.

---

## 21. Production improvements to know for viva/interview discussion

If asked what you would improve for production, good answers are:

- idempotency/reconciliation around repeated callbacks
- database-backed payment-attempt table instead of one transaction field
- automatic expiration of abandoned pending payments
- dedicated inventory reservation records
- row locking for high-concurrency stock changes
- webhook/IPN audit logging
- retry queue for temporary gateway failures
- HTTPS-only secure cookies
- rate limiting
- tests for payment-success amount mismatch and duplicate callbacks

Those are sensible next steps, but the current implementation keeps the core flow understandable and demonstrates the important security concept: **server-calculated amount + server-side gateway validation**.
