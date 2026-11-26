export interface Post {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO
  readMinutes: number;
  body: { h?: string; p?: string[]; list?: string[] }[];
}

export const posts: Post[] = [
  {
    slug: "open-a-fabricnow-zprj-in-clo3d",
    title: "How to open a FabricNow .zprj garment in CLO3D",
    description: "Download, unzip and open a ready-made garment project — and what to check first.",
    date: "2026-11-26",
    readMinutes: 3,
    body: [
      { p: ["Every garment on FabricNow is a CLO3D project file (.zprj). Once you've paid, it unlocks instantly and stays in your account, so you can download it again whenever you need to."] },
      { h: "1. Download your file", p: ["Go to Account → My Purchases and press download next to your order. Some products arrive as a .zip that holds the .zprj plus any extra assets."] },
      { h: "2. Unzip it first", p: ["If you received a .zip, extract it to a folder before opening anything. Keep the files together — a project can refer to textures that sit beside it, and moving only the .zprj can leave the fabrics looking flat."] },
      { h: "3. Open it in CLO3D", p: ["Start CLO3D, then open the .zprj from the File menu (or drag the file onto the CLO window). The garment loads with its patterns, seams and fabrics already set up."] },
      { h: "4. Quick checks", list: ["Rotate the avatar view to make sure the drape looks right.", "Open the fabric list and confirm every fabric shows its texture.", "Save a copy under your own name before you start changing things."] },
      { p: ["If a file won't open, contact support with your order number and we'll sort it out."] },
    ],
  },
  {
    slug: "swap-fabrics-on-one-garment",
    title: "One garment, many fabrics: a simple swap workflow",
    description: "Build a whole collection from a single pattern by changing only the fabric.",
    date: "2026-11-26",
    readMinutes: 3,
    body: [
      { p: ["The fastest way to show a client options is to keep one well-fitted garment and change only the fabric. Here's a workflow that keeps things tidy."] },
      { h: "Start from a good base", p: ["Pick a garment that already fits the avatar well. Adjusting a fabric is quick; fixing a poor fit is not."] },
      { h: "Change fabrics, not patterns", p: ["Apply each new fabric to the pattern pieces and let the simulation settle. Heavier fabrics hang differently from light ones, so give every variation a moment to drape before you judge it."] },
      { h: "Tune the look", list: ["Adjust the colour or print scale if the repeat looks too big or small.", "Check seams and topstitching — a thick fabric can need different stitch settings.", "Render each version from the same camera angle so the comparison is fair."] },
      { h: "Name your files clearly", p: ["Save each variation as its own project, for example dress-denim and dress-linen. Future you will be grateful."] },
      { p: ["Browse the shop for fabrics to try, or request one we don't have yet from the Request a fabric page."] },
    ],
  },
  {
    slug: "choosing-fabric-weight-and-drape",
    title: "Choosing fabric weight and drape for your design",
    description: "A quick guide to matching fabric behaviour to the garment you're making.",
    date: "2026-11-26",
    readMinutes: 4,
    body: [
      { p: ["Before you pick a colour, decide how the garment should move. Weight and drape do most of the work."] },
      { h: "Light and fluid", p: ["Soft, lightweight fabrics fall close to the body and ripple when the avatar moves. They suit gathered skirts, blouses and flowing dresses."] },
      { h: "Medium and balanced", p: ["Mid-weight cottons and blends hold a shape while still draping gently. They are forgiving, which makes them good for everyday shirts, trousers and structured dresses."] },
      { h: "Heavy and structured", p: ["Dense fabrics keep their shape and hang straight, with fewer, wider folds. They suit jackets, coats and tailored pieces."] },
      { h: "A simple test", list: ["Picture the folds you want: many soft ones or a few sharp ones?", "Check the garment's seams and details — a bulky fabric can crowd them.", "Try two weights on the same pattern and compare side by side."] },
      { p: ["Use the Compare button in the shop to line up two or three fabrics before you buy."] },
    ],
  },
];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);
