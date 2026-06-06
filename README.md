# Consistently

Consistently is a habit challenge web app for creating personal or shared challenges, tracking daily progress, and checking in over time.

## Project Links

- Repo: `https://github.com/tomaseuu/csc437-project`
- Branch for grading: `main`
- Deployed app: `https://tle168.csse.dev/app`

## What The App Does

- Lets users register and sign in
- Lets users create habit challenges with a title, description, duration, stake, and goal
- Shows each user's challenge list
- Shows a detail page for each challenge
- Supports daily check-ins to track progress
- Supports inviting a teammate to a challenge

## Tech Stack

- Frontend: TypeScript, Vite, `@unbndl/*`
- Backend: Node.js, Express, TypeScript
- Database: MongoDB with Mongoose

## Running The App

From the repo root:

```bash
npm install
npm start
```

Then open:

```text
http://localhost:3000/app
```

## Deployment Note

The app is deployed to a production environment on `csse.dev` and can be started on the VPS from the repo root with:

```bash
npm start
```

Environment variables are stored in a server-side `.env` file and are not intended to be committed to GitHub.
