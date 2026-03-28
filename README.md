# Kanbanish

A tiny Kanban-style roadmap board. No auth and optional database. Just a simple stupid web-app with status columns, modal editing, and persistence options. Not winning any design award here but its entirely open to edit, bypassing paid 3rd party tools for anyone bootstrapping a project.

## Screenshot

![Kanbanish screenshot](./example.png)

## Stack

- Next.js
- React
- Tailwind CSS
- TypeScript
- Bun

## Run Locally

[Bun](https://bun.sh) required. Clone the repo, `cd` into the folder, then:

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

No `.env`, service account, later database setup is optional.

## Build

```bash
bun run build
bun run start
```

## How data is stored

**Option A: Edit the file directly**

Open `data/board.json` in any text editor or IDE, make your changes, and save. This updates the default board that anyone sees when they first run the project. Changes are permanent in the repo. Best for self-hosted sites.

**Option B: Local Only**

Changes are saved in your browser on device. They survive browser restarts, but are tied to the browser; clearing your browser's saved site data will reset the board back to whatever is in `data/board.json`. Changes made this way are not shared with anyone else and do not update the file. Best for personal projects.

**Option C: Connect a database**

If you want changes to be shared across devices and users, connect a server-side store or hosted database such as Supabase, Neon, MongoDB Atlas, or similar. Best for external projects.