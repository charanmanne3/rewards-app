# Rewards Optimizer — Mobile App

Expo + TypeScript fintech UI for store-based credit card recommendations.

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Expo SDK 52 |
| Navigation | Expo Router (React Navigation stack) |
| Data | TanStack React Query + fetch API service |
| UI | Dark premium theme, `expo-linear-gradient` wallet cards |

## Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:

```bash
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:8000
```

Find your IP:

```bash
# macOS
ipconfig getifaddr en0
```

Start:

```bash
npm start
```

## Project structure

```
app/                      # Screens (file-based routes)
  index.tsx               # Home
  stores.tsx              # Store list → tap → recommendation
  best-rewards/[storeName].tsx
src/
  config/env.ts           # API URL from environment
  types/models.ts         # TypeScript API models
  services/api.ts         # HTTP client
  services/queries.ts     # React Query hooks
  components/             # StoreListCard, WalletCard, etc.
  providers/AppProviders.tsx
  navigation/types.ts     # Route param types
  theme/                  # Colors, typography, spacing
```

## Flow

1. **Home** → Browse stores  
2. **Stores** — `GET /stores` via `useStores()`  
3. **Tap store** — navigates to recommendation screen  
4. **Recommendation** — `GET /best-card/{store_name}` via `useBestCard()`  
5. Shows **WalletCard** (best card), issuer, cashback %, reward type, full ranking

## Design

Inspired by Amex / Robinhood / Apple Wallet: deep navy background, gold accents, gradient card hero, subtle glass borders.
