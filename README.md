# 최민영 · 소예린 모바일 청첩장

React + Vite + Framer Motion. Mobile-first single-page invitation with letter animation, photo lightbox, map links, RSVP form, and host-only RSVP dashboard.

## Local preview

```bash
npm install
npm run dev
```

Open the URL printed by Vite. The page is previewable without Supabase, but RSVP storage and host login stay unavailable until Supabase is configured.

## Configure real RSVP storage (Supabase)

1. Create a project at https://supabase.com/ and open **SQL Editor**.
2. Run `supabase/schema.sql`.
3. In **Authentication → Users**, create the host account (use a strong unique password).
4. Copy that user's UUID. In SQL Editor run `insert into public.admin_users (user_id) values ('PASTE-UUID-HERE');`.
5. Copy Project URL and the publishable/anon key from **Project Settings → API** into `.env.local` (copy `.env.example` first). The key is designed for browser use; do not use a service-role/secret key.
6. Restart `npm run dev` after changing env vars.
7. Test a guest RSVP, then log into the page's small **관리자** link in the footer. Check that an unauthorised account cannot read or delete responses.

The RLS policies allow guests to INSERT only. SELECT/DELETE are restricted to UUIDs in `admin_users`. Do not disable RLS. Set a retention reminder and delete responses once the stated retention period has elapsed; the app does not automatically delete records on a timer.

## Edit invitation content

Edit `src/data.js` for names, date, venue, copy, photo paths, map image path, privacy purpose/items/retention/consent text. Map buttons are configured in the same file.

## Add real assets

The provided environment contained no uploaded photos or map image, so the ZIP cannot include the actual originals yet. Add your original assets:

- `public/images/photo-1.jpg`
- `public/images/photo-2.jpg`
- `public/images/photo-3.jpg`
- `public/images/map.png`
- `public/images/og-cover.svg` is the current original preview image for link sharing; replace with an approved wedding photo if preferred.

Keep image rights/consent in mind before publishing guest or family photos. The three photo cards deliberately show an explicit missing-asset state until the real files are added.

## Maps

Naver Map and Kakao Map buttons open search results for `서울 중구 퇴계로18길 46 라루체 웨딩홀`. TMAP currently opens its official website because a verified destination-specific link could not be confirmed in this environment. Before sharing, test the destination in each app and replace the TMAP URL only with a verified link from TMAP's own share/navigation feature.

## Deploy

Build with `npm run build`. Deploy the generated `dist/` directory to a static host (for example, Vercel or Netlify) and set the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables in that host's project settings. A deploy URL is not included because no hosting account or deployment permission was connected in this workspace.

## Lockfile note

`package-lock.json` is not included because the npm registry was unreachable in the packaging environment, so a valid dependency lock could not be generated. Run `npm install` in this folder with network access to generate `package-lock.json` before committing.

## Current verification limits

Build and local code checks can be performed here. Actual database insertion, RLS/admin permission testing, Safari/Android device testing, and deployed Open Graph preview require your Supabase project, actual images, and a public deployment URL.
