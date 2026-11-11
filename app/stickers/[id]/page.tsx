import type { Metadata } from "next";
import StickerDetailClient from "@/components/stickers/StickerDetailClient";
import { STICKERS } from "@/components/stickers/stickerData";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const sticker = STICKERS.find((item) => item.id === id);
  return {
    title: sticker ? `${sticker.name} — FabricNow Stickers` : "Sticker not found — FabricNow",
    description: sticker?.blurb ?? "Explore garment stickers on FabricNow.",
  };
}

export default async function StickerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StickerDetailClient id={id} />;
}
