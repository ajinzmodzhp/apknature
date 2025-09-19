# Telegram SDCard Sender (Next.js)

## Quick notes
- You must add two environment variables to Vercel:
  - `TELEGRAM_BOT_TOKEN` — your bot token (keep secret)
  - `TELEGRAM_CHAT_ID` — the chat id (user or group) where files will be sent

- Browsers cannot automatically enumerate `/sdcard`. The user must open the page on their Android device and use the file picker to select the folder (the file input uses `webkitdirectory`).

## Deploy to Vercel
1. Create a GitHub repo and push this project.
2. Import the repo into Vercel.
3. In Vercel Project Settings → Environment Variables, add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` (set for Production).
4. Deploy. Open the URL on an Android device and test.

## How it works
- Client: file input (directory mode) -> displays files -> sends selected files to `/api/upload`.
- Server: `/api/upload` accepts multipart, forwards each file to Telegram using the bot token and chat id.

## Privacy & limits
- This is user-driven: the browser will ask the user to choose files/folders.
- Large uploads may fail; consider adding file size limits or compressing before sending.
