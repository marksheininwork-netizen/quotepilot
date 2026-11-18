# QuotePilot

A small quote builder for independent service businesses. Create and edit line-item quotes, validate pricing, track client decisions and expiry, search or filter the quote list, export a CSV backup, and print or save a client-ready quote as PDF.

## Live PWA

Install QuotePilot from [its public web app](https://marksheininwork-netizen.github.io/quotepilot/). The app shell works offline after the first visit; quote data is stored in the current browser only. See the [privacy policy](https://marksheininwork-netizen.github.io/quotepilot/privacy.html) and [support page](https://marksheininwork-netizen.github.io/quotepilot/support.html).

## Run locally

Open `index.html` in a modern browser. No install or build step is required. Quotes are stored in this browser's local storage. Printing is user initiated; this prototype never emails a quote.

## Checks

Run `node --test` with Node.js 18 or newer to check quote workflows, PWA assets, manifest wiring, and offline fallback.

## Scope

This prototype has no login, shared customer data, payment processing, or remote lead capture. The early-access link opens a prefilled GitHub issue for an inbound request.
