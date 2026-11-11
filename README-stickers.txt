Copy into your project root, keeping paths:
  app/stickers/page.tsx                  (new route: /stickers)
  components/stickers/StickerShop.tsx    (new)
  components/stickers/stickerData.ts     (new: edit names, prices, ids here)
  public/images/stickers/*.svg           (new: 12 stickers + 3 pack covers)
  components/layout/Header.tsx           (replaces: adds "Stickers" nav link)
  components/layout/Footer.tsx           (replaces: adds footer link)
Checkout needs a backend product for each id in stickerData.ts (e.g. sticker-voltage).
