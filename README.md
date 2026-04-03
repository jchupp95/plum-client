# Plum Client - Mobile Recipe Manager

A mobile-first React application built with TypeScript, Vite, and shadcn/ui for managing recipes. This is the front-end client for the Plum recipe server.

## Features

- 📱 Mobile-first responsive design
- 🍳 Recipe browsing with images and details
- 🧭 Hamburger menu navigation
- 🏠 Bottom navigation for quick access
- 🎨 Modern UI with shadcn/ui components
- 🌙 Dark/light theme support
- ⚡ Fast development with Vite

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **shadcn/ui** - Component library
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5174](http://localhost:5174) in your browser

### Build for Production

```bash
npm run build
```

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

## Project Structure

```
src/
├── components/
│   ├── ui/           # shadcn/ui components
│   └── mobile-layout.tsx  # Mobile app layout
├── pages/
│   └── recipes.tsx   # Recipes page
├── services/
│   └── recipe-service.ts  # API service for recipes
├── types/
│   └── recipe.ts     # TypeScript types
├── App.tsx           # Main app component
├── main.tsx          # App entry point
└── index.css         # Global styles
```

## API Integration

The app is designed to work with the Plum server API. Configure the API endpoint by setting the `VITE_API_URL` environment variable:

```bash
VITE_API_URL=http://127.0.0.1:8000
```

The app fetches recipes from the `/recipe/overview` endpoint, which returns simplified recipe data (id, name, image). If the API is not available, the app will fall back to mock data.

## Adding Components

To add new shadcn/ui components:

```bash
npx shadcn@latest add [component-name]
```

## Mobile Optimization

The app is optimized for mobile devices with:
- Touch-friendly interactions
- Responsive design
- Proper viewport configuration
- Mobile navigation patterns

## Contributing

1. Follow the existing code style
2. Use TypeScript for type safety
3. Test on mobile devices
4. Run type checking before committing
