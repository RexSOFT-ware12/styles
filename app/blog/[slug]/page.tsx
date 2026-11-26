import { Button } from "@/components/ui/button";
import { getPost, posts } from "@/data/posts";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return { title: "Post not found — FabricNow" };
  return { title: `${post.title} — FabricNow`, description: post.description };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  return (
    <article className="container mx-auto max-w-2xl px-4 py-12">
      <Link href="/blog" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All posts
      </Link>
      <h1 className="mb-3 text-3xl font-bold leading-tight text-foreground sm:text-4xl">{post.title}</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · {post.readMinutes} min read
      </p>
      <div className="space-y-4 text-foreground">
        {post.body.map((b, i) => (
          <div key={i} className="space-y-3">
            {b.h && <h2 className="pt-4 text-xl font-semibold">{b.h}</h2>}
            {b.p?.map((t, j) => (
              <p key={j} className="leading-relaxed text-foreground/90">{t}</p>
            ))}
            {b.list && (
              <ul className="list-disc space-y-1 pl-6 text-foreground/90">
                {b.list.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      <div className="mt-12 rounded-xl border bg-muted/30 p-6 text-center">
        <p className="mb-3 font-medium">Ready to try it?</p>
        <Button asChild><Link href="/shop">Browse the shop</Link></Button>
      </div>
    </article>
  );
}
