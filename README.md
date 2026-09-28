# IT Cyber Technology Classes Website

A responsive full-stack starter website for online/offline IT classes.

## Features
- Mobile responsive homepage
- Courses, timings and fees
- Online / Offline / Hybrid enquiry form
- Enquiries saved to `data/enquiries.json`
- Admin login
- Admin lead list
- Update lead status
- Delete lead
- `/health` endpoint
- Ready for Railway / Render / any Node.js host

## Run locally

1. Install Node.js 18+
2. Open terminal in this folder
3. Run:

```bash
npm install
npm start
```

Open: http://localhost:3000

## Admin login

Default:
- Username: `admin`
- Password: `ChangeMe123!`

IMPORTANT: Before real deployment, set environment variables:
- `ADMIN_USER`
- `ADMIN_PASSWORD`

Example:
```bash
ADMIN_USER=myadmin
ADMIN_PASSWORD=StrongPasswordHere
```

## Before publishing
Edit `public/index.html` and update:
- Institute phone number
- Email
- Address/contact details
- Real fees
- Real timings
- Course names/content

## Production note
This starter saves leads in a JSON file. On some cloud hosts, local disk can reset after redeploy/restart. For production, connect PostgreSQL/Supabase/MySQL for permanent storage.
