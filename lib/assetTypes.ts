import type { AssetType } from "@/types/product";

export interface AssetTypeInfo {
  type: Exclude<AssetType, "addon">;
  /** Tab label. */
  label: string;
  /** Singular badge on product cards. */
  badge: string;
  /** Page heading on /shop?type=… */
  heading: string;
  blurb: string;
  /** File formats the download contains, as shown to shoppers. */
  formats: string;
  /** "What you get → Works with" line. */
  worksWith: string;
}

/** Shop sections, in the order the tabs appear. */
export const ASSET_TYPES: AssetTypeInfo[] = [
  {
    type: "garment",
    badge: "Garment",
    label: "Garments",
    heading: "CLO3D garment files",
    blurb: "Ready-made garments: open the project, pick your avatar and start designing.",
    formats: ".zprj project",
    worksWith: "CLO3D (opens as a ready-made project)",
  },
  {
    type: "fabric",
    badge: "Fabric",
    label: "Fabrics",
    heading: "CLO3D fabric library",
    blurb: "Fabrics with the physical settings already tuned, from kente and ankara to denim, silk and leather. Drop them on any garment.",
    formats: ".zfab fabric + texture maps",
    worksWith: "CLO3D: drag the .zfab into your Object Browser",
  },
  {
    type: "trim",
    badge: "Trim",
    label: "Trims & hardware",
    heading: "Trims and hardware",
    blurb: "Buttons, zippers, buckles and lace, ready to drop into any project.",
    formats: "CLO3D trims",
    worksWith: "CLO3D: add from your Library or Object Browser",
  },
  {
    type: "pose",
    badge: "Pose",
    label: "Poses & animations",
    heading: "Poses and runway animations",
    blurb: "Poses and walks for presenting your garments and making turntables.",
    formats: "CLO3D pose / motion files",
    worksWith: "CLO3D: apply to your avatar",
  },
  {
    type: "render",
    badge: "Render preset",
    label: "Render presets",
    heading: "Render presets",
    blurb: "Studio lighting and background setups that make any garment look professional.",
    formats: "CLO3D render scene",
    worksWith: "CLO3D Render window",
  },
  {
    type: "block",
    badge: "Starter block",
    label: "Starter blocks",
    heading: "Starter pattern blocks",
    blurb: "Basic bodice, sleeve, trouser and skirt blocks to build your own designs from. Great for students and beginners.",
    formats: ".zprj project",
    worksWith: "CLO3D (opens as a ready-made project)",
  },
];

export const ADDON_LABEL: Record<string, { title: string; text: string }> = {
  techpack: { title: "Tech pack", text: "Measurements, materials and construction notes for a factory or tailor." },
  dxf: { title: "DXF pattern (DXF-AAMA)", text: "Flat pattern pieces for printing, plotting or cutting software." },
};

export function assetTypeInfo(type?: string | null): AssetTypeInfo {
  return ASSET_TYPES.find((t) => t.type === type) || ASSET_TYPES[0];
}

export function isAssetType(v: unknown): v is Exclude<AssetType, "addon"> {
  return typeof v === "string" && ASSET_TYPES.some((t) => t.type === v);
}
