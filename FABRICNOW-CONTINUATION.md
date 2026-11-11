# FabricNow storefront continuation

## Added
- `/stickers/[id]`: individual sticker detail pages, metadata, related designs and add-to-cart.
- `/custom-sticker`: custom artwork quote request with size, quantity and estimate.
- Sticker catalogue cards link to their detail pages.
- Sticker landing hero links to the custom order page.

## Important custom-order note
The custom sticker page is an enquiry flow, not a paid checkout or upload service. It opens the visitor's email application with the order brief. The form opens a prefilled Gmail compose addressed to the support inbox already used by the site's Contact page (`support@fabricnow.pro`). The artwork file is not attached or uploaded. Connect a real upload endpoint/storage plus server-side pricing before accepting payment.

## Run locally
```bash
npm install
npm run dev
```
