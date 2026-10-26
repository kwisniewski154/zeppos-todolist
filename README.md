# ToDoList for Zepp OS

Shopping list app for Amazfit Balance, built with Zepp OS SDK 4.

## Configure Google Apps Script

Set `GOOGLE_SCRIPT_URL` in `app-side/config.js` to your deployed Google Apps
Script URL. Do not commit private or write-enabled credentials.

The app uses the watch language when Polish or English is available, and
defaults to Polish. Translations are maintained in `page/i18n/pl-PL.po` and
`page/i18n/en-US.po`.

Use the Web App deployment URL from Apps Script (the URL ending in
`/macros/s/<deployment-id>/exec`). The endpoint must be accessible to the app
and return a JSON array; an HTML page usually means the deployment URL or its
access settings are incorrect.

Build and preview with the npm scripts:

```sh
npm install
npm run dev
npm run build
npm run preview
```

To test without a phone connection, set `IS_DEV_MODE` to `true` in
`app-side/config.js`. This loads a fixed sample shopping list in the simulator.
Set it back to `false` for the production list before building or previewing:

```sh
npm run dev
```

Without the URL, the app reports an error when you request the list. If the old
URL previously present in this project was active, revoke or rotate it.

The shopping list is cached on the watch for the current local calendar day.
The app loads that cached list at startup and fetches a new one automatically
when no same-day cache exists. Checked items are saved to the same cache and
remain checked when the app is reopened that day. Use the refresh button to
fetch the list again early.
