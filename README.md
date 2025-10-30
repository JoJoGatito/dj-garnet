# DJ Song Request System

A minimal, elegant song request system for DJ events with real-time request management.

## Features

- **Minimal Design**: Black background with garnet red accents
- **Simple Interface**: Users enter "Artist - Song Title" to submit requests  
- **DJ Management**: Tag requests as "Played", "Coming Up", or "Maybe"
- **Real-time Updates**: Requests appear instantly across all devices
- **Static Deployment**: Ready for GitHub Pages, Vercel, or Netlify

## Quick Deploy

### 🚀 Full Featured Hosting (Recommended)

For **complete functionality** (song requests + feedback storage):

#### Deploy to Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fdj-requests)

1. Click deploy button → Connect GitHub → Add `DATABASE_URL` environment variable

#### Deploy to Netlify  
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/dj-requests)

1. Click deploy button → Connect GitHub → Add `DATABASE_URL` environment variable

### 📄 GitHub Pages (Static Only)

**⚠️ LIMITED FUNCTIONALITY**: GitHub Pages only shows the frontend - song requests and feedback won't save to database.

1. Go to your repo → Settings → Pages
2. Source: "GitHub Actions" 
3. The site deploys automatically on push to main

**Better for full functionality**: Use Vercel or Netlify instead

## Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/dj-requests.git
   cd dj-requests
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Add your DATABASE_URL
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

## Environment Variables

- `DATABASE_URL` - PostgreSQL database connection string

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Serverless functions
- **Database**: PostgreSQL (Neon, Supabase, etc.)
- **Deployment**: Vercel, Netlify, GitHub Pages

## Usage

1. **For Audience**: Visit the main page and submit song requests
2. **For DJs**: Go to `/playlist` to view the playlist and `/booth` to manage requests

## License

MIT