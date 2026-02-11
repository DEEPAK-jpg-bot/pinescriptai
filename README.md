# PineScript AI Generator (Next.js Version)

This project has been migrated to Next.js 16 with a modern Light UI theme ("PineGen").

## structure

- **src/app**: Next.js App Router pages (Dashboard, Chat).
- **src/components**: React components (Sidebar, CodeBlock, etc).
- **original-repo**: The original cloned repository (contains Python backend).

## Running the Project

### 1. Start the Python Backend
You need to run the backend from the original repo code.

```bash
cd original-repo/backend
pip install -r ../requirements.txt
# Set up .env variables (SUPABASE_URL, GEMINI_API_KEY, etc.)
python server.py
```

### 2. Start the Next.js Frontend
In a new terminal (root directory):

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Features
- **Modern Dashboard**: Stats, Recent Scripts.
- **AI Chat Generator**: Generate Pine Script strategies.
- **Light Theme**: Clean, professional UI using TailwindCSS v4.
- **Code Editor**: Integrated Monaco Editor with syntax highlighting.
