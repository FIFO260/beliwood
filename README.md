# BeliWood — E-shop s ručne vyrábaným dreveným nábytkom

Moderný e-shop postavený na Next.js 14 (App Router), Tailwind CSS, GSAP animáciách a Zustand košíku.

## Spustenie

### 1. Inštalácia závislostí

```bash
npm install
```

### 2. Nastavenie premenných prostredia

Skopírujte `.env.local` a vyplňte hodnoty:

```bash
RESEND_API_KEY=re_your_key_here   # z resend.com
ORDER_EMAIL=info@beliwood.sk       # kam chodia objednávky
```

> Ak Resend nemáte, zaregistrujte sa na [resend.com](https://resend.com) — free tier stačí na 3 000 emailov/mesiac.

### 3. Spustenie vývojového servera

```bash
npm run dev
```

Otvorte [http://localhost:3000](http://localhost:3000).

---

## Štruktúra projektu

```
/app
  /page.tsx               — homepage (hero, produkty, o nás, štatistiky)
  /products/page.tsx      — zoznam produktov s filtrom
  /products/[id]/page.tsx — detail produktu
  /checkout/page.tsx      — objednávkový formulár
  /success/page.tsx       — poďakovanie
  /api/order/route.ts     — API endpoint, odosiela email cez Resend
/components
  Navbar.tsx              — fixná navbar, hide/show pri scrolle (GSAP)
  Hero.tsx                — hero sekcia s animovaným textom
  ProductCard.tsx         — karta produktu
  ProductGrid.tsx         — mriežka produktov so stagger animáciou
  Cart.tsx                — slide-in košík panel (GSAP)
  OrderForm.tsx           — objednávkový formulár
  Footer.tsx
/lib
  products.ts             — mock dáta produktov (6 kusov)
/store
  cartStore.ts            — Zustand store, persisted v localStorage
```

## Pridanie Stripe platieb (neskôr)

1. Nainštalujte `@stripe/stripe-js` a `stripe`
2. Pridajte do `.env.local`:
   ```
   STRIPE_SECRET_KEY=sk_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
   ```
3. Vytvorte `/app/api/checkout/route.ts` — vytvorí Stripe Checkout Session
4. V `OrderForm.tsx` nahraďte `fetch('/api/order')` za `fetch('/api/checkout')` a presmerujte na Stripe URL

## Tech stack

| Technológia | Verzia |
|---|---|
| Next.js | 16.x (App Router) |
| TypeScript | 5.x |
| Tailwind CSS | 4.x |
| GSAP | 3.x |
| Zustand | 5.x |
| Resend | 4.x |
