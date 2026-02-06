# Event Generator UI

React + Vite + TypeScript + Tailwind CSS frontend for the Event Generator API.

## Features

- **Connection Status**: Real-time API connectivity monitoring
- **Quick Emit**: Generate single events with custom parameters
- **Batch Emit**: Generate multiple events at once (1-500)
- **Auto Emit**: Continuous event generation with configurable rate (1-100/sec)
- **Distribution Editor**: Modify event type distribution in real-time
- **Event Log Table**: View last 50 events with detailed JSON modal

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (port 5174)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Requirements

- Node.js 18+
- Generator API running on http://localhost:7070

## Configuration

The UI connects to the API at `http://localhost:7070`. To change this, edit `src/services/generatorApi.ts`:

```typescript
const API_BASE_URL = 'http://localhost:7070';
```

## Components

- `ConnectionStatus.tsx` - API health monitoring
- `QuickEmit.tsx` - Single event generation with parameters
- `BatchEmit.tsx` - Bulk event generation
- `AutoEmit.tsx` - Continuous event generation
- `DistributionEditor.tsx` - Event type distribution configuration
- `EventLogTable.tsx` - Event log with JSON detail modal

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **Fetch API** - HTTP client
