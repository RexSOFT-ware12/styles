import ProductCard from "@/components/home/ProductCard";
import PinterestBoards from "@/components/pinterest/PinterestBoards";
import PinterestFollow from "@/components/pinterest/PinterestFollow";
import PinterestIcon from "@/components/pinterest/PinterestIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPinterestSettings } from "@/lib/pinterest";
import { getProducts } from "@/lib/products";
import type { Product } from "@/types/product";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const revalidate = 300;

export const metadata = {
  title: "Inspiration — Shop the looks | FabricNow",
  description:
    "Outfit ideas from our Pinterest boards, each one a ready-to-use CLO3D garment file. Save the looks you love and download the .zprj.",
};

const PER_STYLE = 8;

export default async function InspirationPage({ searchParams }: { searchParams: Promise<{ style?: string }> }) {
  const { style: picked } = await searchParams;
  const [pinterest, products] = await Promise.all([getPinterestSettings(), getProducts({ limit: 100, sort: "newest" })]);

  // Group the catalogue by style; boards tagged with a style come first.
  const byStyle = new Map<string, Product[]>();
  for (const p of products) {
    const key = p.style?.trim() || "More looks";
    if (!byStyle.has(key)) byStyle.set(key, []);
    byStyle.get(key)!.push(p);
  }
  const boardStyles = pinterest.boards.map((b) => b.style).filter((s): s is string => !!s && byStyle.has(s));
  const styles = [...new Set([...boardStyles, ...[...byStyle.keys()].sort((a, b) => byStyle.get(b)!.length - byStyle.get(a)!.length)])];
  const shown = picked && byStyle.has(picked) ? [picked] : styles.slice(0, 6);
  const pinned = products.filter((p) => p.pinterestUrl).slice(0, 8);

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="mb-12 max-w-3xl">
        <Badge className="mb-4 bg-[#E60023] text-white hover:bg-[#E60023]">
          <PinterestIcon className="mr-1.5 h-3.5 w-3.5" /> Inspiration
        </Badge>
        <h1 className="mb-3 text-3xl font-bold text-foreground sm:text-5xl">Shop the looks</h1>
        <p className="mb-6 text-lg text-muted-foreground">
          Outfit ideas from our Pinterest boards. Every look here is a ready-to-use CLO3D garment file: save it to your
          board, then download the .zprj and start designing.
        </p>
        <div className="flex flex-wrap gap-3">
          <PinterestFollow profileUrl={pinterest.profileUrl} />
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/shop">
              Browse all files <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {pinterest.boards.length > 0 && (
        <section className="mb-14">
          <h2 className="mb-4 text-2xl font-bold text-foreground">Our Pinterest boards</h2>
          <PinterestBoards boards={pinterest.boards} />
        </section>
      )}

      {pinned.length > 0 && (
        <section className="mb-14">
          <h2 className="mb-1 text-2xl font-bold text-foreground">Trending on Pinterest</h2>
          <p className="mb-5 text-muted-foreground">Looks people are saving right now.</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {pinned.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {styles.length > 1 && (
        <nav aria-label="Filter by style" className="mb-8 flex flex-wrap gap-2">
          <Link
            href="/inspiration"
            className={`rounded-full border px-4 py-1.5 text-sm ${!picked ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}
          >
            All styles
          </Link>
          {styles.map((s) => (
            <Link
              key={s}
              href={`/inspiration?style=${encodeURIComponent(s)}`}
              className={`rounded-full border px-4 py-1.5 text-sm ${picked === s ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}
            >
              {s}
            </Link>
          ))}
        </nav>
      )}

      {products.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          The looks couldn&apos;t load just now. Please try again in a moment.
        </p>
      ) : (
        shown.map((s) => {
          const list = byStyle.get(s)!;
          const board = pinterest.boards.find((b) => b.style === s);
          return (
            <section key={s} className="mb-14">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{s}</h2>
                  <p className="text-muted-foreground">
                    {list.length} {list.length === 1 ? "file" : "files"} — hover a look and press the red pin to save it.
                  </p>
                </div>
                <div className="flex gap-3 text-sm">
                  {board && (
                    <a href={board.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-medium text-[#E60023] hover:underline">
                      <PinterestIcon className="h-4 w-4" /> See the board
                    </a>
                  )}
                  {s !== "More looks" && (
                    <Link href={`/shop?style=${encodeURIComponent(s)}`} className="font-medium text-primary hover:underline">
                      Shop all {s}
                    </Link>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {(picked ? list : list.slice(0, PER_STYLE)).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
