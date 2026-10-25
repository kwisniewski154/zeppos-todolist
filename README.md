# ToDoList for Zepp OS

Shopping list app for Amazfit Balance, built with Zepp OS SDK 4.

## Configure Google Apps Script

Copy `.env.example` to `.env` and set `GOOGLE_SCRIPT_URL` to your deployed
Google Apps Script URL. The `.env` file is ignored by Git. Do not commit private
or write-enabled credentials.

Use the Web App deployment URL from Apps Script (the URL ending in
`/macros/s/<deployment-id>/exec`). The endpoint must be accessible to the app
and return a JSON array; an HTML page usually means the deployment URL or its
access settings are incorrect.

Build and preview through the npm scripts so the environment variable is
generated into an ignored local config file before Zeus runs:

```sh
npm install
npm run dev
npm run build
npm run preview
```

The generated `app-side/config.js` is ignored by Git. Without the URL, the app
reports an error when you request the list. If the old URL previously present
in this project was active, revoke or rotate it.

The shopping list is cached on the watch for the current local calendar day.
The app loads that cached list at startup and fetches a new one automatically
when no same-day cache exists. Checked items are saved to the same cache and
remain checked when the app is reopened that day. Use the refresh button to
fetch the list again early.
