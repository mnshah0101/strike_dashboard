# Strike Dashboard

## Overview
Internal risk management and operations dashboard for Strike - the world's first leveraged Daily Fantasy Sports (DFS) platform, backed by Y Combinator W24.

Built by [Moksh Shah](https://github.com/mokshshh), Founding Engineer at Strike.

## Features
- Real-time risk analysis and monitoring
- Advanced statistical modeling for line movement
- Comprehensive CRUD operations for:
  - Players and teams
  - Betting lines and events
  - User bets and positions
- Volume imbalance detection
- Automated risk alerts
- Historical data analysis

## Tech Stack
- **Frontend**: Next.js 15, React 19, TailwindCSS
- **UI Components**: Shadcn/UI
- **State Management**: TanStack Query
- **Data Visualization**: Recharts
- **Authentication**: JWT with secure token management

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
