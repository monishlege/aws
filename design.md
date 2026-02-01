# Design

## Architecture
- Next.js App Router (TypeScript) for rapid delivery.
- API route `/api/gemini` calls a wrapper in `lib/gemini.ts`.
- Wrapper enforces a JSON output: `{ steps: [{ title, description, code? }] }`.
- Client page posts notes, renders structured steps.

## Data Flow
1. User pastes notes.
2. Client `fetch` POST `/api/gemini` with `{ notes }`.
3. API route invokes `generateLabFromNotes(notes)`.
4. Gemini returns text; wrapper parses raw JSON or fenced JSON.
5. Client renders steps with code blocks.

## File Structure
- `app/page.tsx` main UI.
- `app/api/gemini/route.ts` server endpoint.
- `lib/gemini.ts` Gemini wrapper and types.
- `.env.local` holds `GOOGLE_API_KEY`.

## Type Contracts
```ts
type LabStep = { title: string; description: string; code?: string };
type LabResponse = { steps: LabStep[] };
```

## Error Handling
- Input validation for `notes` on API.
- Wrapper throws on non-JSON responses.
- Client displays friendly error messages.

## UI/UX
- Minimal Tailwind styling for speed.
- Large textarea, single action button.
- Step cards with optional syntax highlighted code (basic `<pre><code>`).

