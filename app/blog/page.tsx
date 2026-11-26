import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { posts } from "@/data/posts";
import Link from "next/link";

export const metadata = {
  title: "Blog — FabricNow",
  description: "Design tips, product news, and behind-the-scenes from FabricNow.",
};

export default function Blog() {
  return (
    <div className="bg-background">
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-6 bg-primary text-primary-foreground">
              Blog
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Notes on design, straight from the studio
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tips for working faster in CLO3D, new product drops, and
              what we&apos;re building next.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                <Card className="h-full transition-colors group-hover:border-primary">
                  <CardContent className="flex h-full flex-col p-6">
                    <p className="mb-2 text-xs text-muted-foreground">
                      {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · {post.readMinutes} min read
                    </p>
                    <h2 className="mb-2 text-lg font-semibold text-foreground group-hover:text-primary">{post.title}</h2>
                    <p className="text-sm text-muted-foreground">{post.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
