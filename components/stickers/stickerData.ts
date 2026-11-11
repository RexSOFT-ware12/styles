export type Garment = "shirt" | "shorts" | "hoodie";

export interface Sticker {
  /** Cart / checkout id. Create a product with this id in the backend so checkout can price it. */
  id: string;
  name: string;
  price: number;
  image: string;
  style: string;
  blurb: string;
  garments: Garment[];
  /** Number of designs inside (1 for single stickers). */
  count: number;
  isPack?: boolean;
  badge?: string;
}

const img = (slug: string) => `/images/stickers/${slug}.svg`;

export const STICKERS: Sticker[] = [
  { id: "sticker-good-vibes", name: "Good Vibes Sunburst", price: 3.99, image: img("good-vibes"), style: "Badge", blurb: "Bold sunburst badge. Sits well on a chest or a hoodie pocket.", garments: ["shirt", "hoodie"], count: 1, badge: "Best seller" },
  { id: "sticker-voltage", name: "Voltage Bolt", price: 2.99, image: img("voltage"), style: "Graphic", blurb: "High-contrast lightning bolt on royal blue.", garments: ["shirt", "shorts", "hoodie"], count: 1 },
  { id: "sticker-retro-sun", name: "Retro Sunset", price: 3.49, image: img("retro-sun"), style: "Retro", blurb: "Striped sun in warm gradient. Clean on dark fabric.", garments: ["shirt", "shorts"], count: 1 },
  { id: "sticker-flame-heart", name: "Flame Heart", price: 3.49, image: img("flame-heart"), style: "Graphic", blurb: "A heart with a flame cut-out. Works at left-chest size.", garments: ["shirt", "hoodie"], count: 1 },
  { id: "sticker-varsity-star", name: "Varsity Star", price: 3.99, image: img("varsity-star"), style: "Badge", blurb: "Collegiate star roundel with stitched-look ring.", garments: ["shirt", "shorts", "hoodie"], count: 1 },
  { id: "sticker-night-shift", name: "Night Shift Moon", price: 2.99, image: img("night-shift"), style: "Graphic", blurb: "Crescent moon with three sparkles.", garments: ["shirt", "hoodie"], count: 1 },
  { id: "sticker-cactus", name: "Desert Pot", price: 3.49, image: img("cactus"), style: "Illustration", blurb: "Potted cactus on a peach disc.", garments: ["shirt", "shorts"], count: 1 },
  { id: "sticker-wave", name: "Wave Crest", price: 3.49, image: img("wave"), style: "Illustration", blurb: "Layered ocean wave in a circle. A natural fit for swim shorts.", garments: ["shorts", "shirt"], count: 1 },
  { id: "sticker-checker", name: "Full Lap Checker", price: 2.99, image: img("checker"), style: "Streetwear", blurb: "Checkerboard roundel with a red banner.", garments: ["shorts", "shirt", "hoodie"], count: 1 },
  { id: "sticker-stay-wild", name: "Stay Wild Tag", price: 2.99, image: img("stay-wild"), style: "Typography", blurb: "Tilted two-line slogan tag in violet and yellow.", garments: ["shirt", "hoodie"], count: 1 },
  { id: "sticker-cherries", name: "Cherry Pair", price: 2.99, image: img("cherries"), style: "Illustration", blurb: "Glossy cherries with a leaf. Small and cheerful.", garments: ["shirt", "shorts"], count: 1 },
  { id: "sticker-orbit", name: "Ringed Planet", price: 3.99, image: img("orbit"), style: "Graphic", blurb: "Orange planet, pale ring, loose stars.", garments: ["shirt", "hoodie"], count: 1 },

  { id: "sticker-pack-starter", name: "Starter Pack", price: 9.99, image: img("pack-starter"), style: "Pack", blurb: "Six everyday shirt designs, including Good Vibes, Voltage and Flame Heart.", garments: ["shirt", "hoodie"], count: 6, isPack: true, badge: "Save 30%" },
  { id: "sticker-pack-shorts", name: "Shorts Side-Print Pack", price: 7.99, image: img("pack-shorts"), style: "Pack", blurb: "Four round designs sized for a leg print: Retro Sunset, Wave Crest, Full Lap and Desert Pot.", garments: ["shorts"], count: 4, isPack: true },
  { id: "sticker-pack-library", name: "Full Library", price: 19.99, image: img("pack-library"), style: "Pack", blurb: "All twelve single stickers in one purchase, plus every future drop.", garments: ["shirt", "shorts", "hoodie"], count: 12, isPack: true, badge: "Best value" },
];

export const GARMENT_LABEL: Record<Garment, string> = {
  shirt: "T-shirt",
  shorts: "Shorts",
  hoodie: "Hoodie",
};

export const GARMENT_COLORS = [
  { name: "White", value: "#f5f5f4" },
  { name: "Black", value: "#1c1917" },
  { name: "Sand", value: "#d6c3a3" },
  { name: "Forest", value: "#365a45" },
  { name: "Navy", value: "#1e2a4a" },
  { name: "Brick", value: "#9a3b2e" },
];

/** Where a sticker lands on each garment mockup (300x300 viewBox). */
export const PLACEMENTS: Record<Garment, { id: string; label: string; x: number; y: number; size: number }[]> = {
  shirt: [
    { id: "chest", label: "Centre chest", x: 150, y: 128, size: 96 },
    { id: "left", label: "Left chest", x: 188, y: 100, size: 46 },
    { id: "hem", label: "Lower hem", x: 150, y: 214, size: 62 },
  ],
  shorts: [
    { id: "left", label: "Left leg", x: 104, y: 160, size: 62 },
    { id: "right", label: "Right leg", x: 196, y: 160, size: 62 },
    { id: "waist", label: "Near waist", x: 112, y: 92, size: 40 },
  ],
  hoodie: [
    { id: "chest", label: "Centre chest", x: 150, y: 140, size: 90 },
    { id: "left", label: "Left chest", x: 188, y: 108, size: 44 },
    { id: "sleeve", label: "Sleeve", x: 46, y: 150, size: 40 },
  ],
};
