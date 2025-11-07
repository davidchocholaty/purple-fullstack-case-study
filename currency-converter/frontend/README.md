# Frontend Architecture

This document describes the architecture of the Currency Converter frontend.

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main page (orchestrates components)
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── ui/                   # Reusable UI components
│   │   ├── Button.tsx        # Button component
│   │   ├── Input.tsx         # Input field with label
│   │   ├── Select.tsx        # Select dropdown with label
│   │   ├── Card.tsx          # Container/card component
│   │   ├── Table.tsx         # Stylized history table
│   │   └── index.ts          # Barrel export
│   ├── Wallet.tsx            # Wallet display component
│   ├── CurrencyConverterForm.tsx  # Conversion form
│   ├── ResultBox.tsx         # Results display
│   ├── StatisticsDashboard.tsx    # Statistics tables/charts
│   └── ConversionsChart.tsx  # Pie chart component
├── hooks/
│   └── useCurrencyConverter.ts    # Main business logic hook
├── services/
│   └── api.ts                # API service layer
└── types/
    └── index.ts              # Shared TypeScript types
```

## Architecture Principles

### Separation of Concerns
- **Components**: Pure presentational components
- **Hooks**: Business logic and state management
- **Services**: API communication
- **Types**: Shared interfaces and types

### Reusable Components

#### UI Components (`components/ui/`)
- **Button**: Primary/secondary variants, disabled states
- **Input**: Label, validation attributes
- **Select**: Label, options rendering
- **Card**: Multiple variants (primary/white/transparent)

## Adding New Features

### Add a new statistic:
1. Add type to `types/index.ts`
2. Add API endpoint in `services/api.ts`
3. Add state in `useCurrencyConverter` hook
4. Add UI in `StatisticsDashboard` component

### Add a new UI component:
1. Create in `components/ui/`
2. Export from `components/ui/index.ts`
3. Use in other components

### Add a new mode:
1. Add to `AppMode` type
2. Add logic in `useCurrencyConverter`
3. Add UI in page component

## Future Improvements

- Add React Query for better data fetching
- Add loading skeletons
- Add error boundaries
- Add analytics tracking
- Add internationalization

