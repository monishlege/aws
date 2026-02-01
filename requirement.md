# Requirements

## Goal
Build a tool for AI for Learning & Developer Productivity that converts messy lecture notes into interactive coding labs.

## Core Feature
- Input raw lecture notes.
- Generate structured lab steps with titles, descriptions, and optional code.
- Display lab steps in the UI for immediate use.

## Non-Functional
- Time to Market prioritized; use Next.js, TypeScript, Tailwind.
- Deterministic API contract using JSON schema.
- Secure: no secrets in repo; use GOOGLE_API_KEY in environment.

## Scope v1
- Stateless generation via Gemini 1.5 Pro.
- No persistence in v1; optional export later.
- Basic accessibility and responsive layout.

## Nice-to-Have (post-v1)
- Save labs to DB (e.g., Supabase) with auth.
- Export labs to Markdown or JSON.
- Collaborative edits with versioning.

