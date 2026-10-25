# ToDoList for Zepp OS

Shopping list app for Amazfit Balance, built with Zepp OS SDK 4.

## Configure Google Apps Script

Copy `.env.example` to `.env` and set `GOOGLE_SCRIPT_URL` to your deployed
Google Apps Script URL. The `.env` file is ignored by Git. Do not commit private
or write-enabled credentials.

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
when no same-day cache exists. Use the refresh button to fetch it again early.
