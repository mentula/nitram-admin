import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero, CTAStrip } from "@/components/site/PageHero";
import { FadeIn } from "@/components/site/Section";
import { useBlogPosts, useBlogCategories, useBlogTags } from "@/lib/hooks/useBlog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Calendar, Clock, Search, Tag } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog — Nitram Logistics Limited" },
      {
        name: "description",
        content:
          "Industry insights, customs guides, and logistics updates from Zambia's leading clearing and forwarding team.",
      },
      { property: "og:title", content: "Blog — Nitram Logistics Limited" },
      {
        property: "og:description",
        content:
          "Practical guides and updates on customs, freight and Zambian logistics.",
      },
    ],
  }),
  component: BlogPage,
});

function BlogPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [tagFilter, setTagFilter] = useState<string>("");

  const { data: posts, isLoading } = useBlogPosts({
    published: true,
    search: search || undefined,
    category_id: categoryFilter || undefined,
  });

  const { data: categories } = useBlogCategories();
  const { data: tags } = useBlogTags();

  const filteredPosts = posts?.filter((post) => {
    if (tagFilter && !post.tags?.some((t: any) => t.slug === tagFilter)) return false;
    return true;
  });

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title={<>Insights from Zambia's <span className="text-gradient-gold">logistics frontline.</span></>}
        description="Practical guides, regulatory updates and Nitram news for importers, exporters and supply chain leaders."
      />

      <section className="py-24">
        <div className="container-x">
          {/* Filters */}
          <div className="mb-12 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">All categories</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.slug}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">All tags</SelectItem>
                {tags?.map((tag) => (
                  <SelectItem key={tag.id} value={tag.slug}>
                    {tag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Posts Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--gold)] border-t-transparent" />
            </div>
          ) : filteredPosts && filteredPosts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post, i) => (
                <FadeIn key={post.id} delay={i * 0.05}>
                  <article className="group h-full rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]">
                    {post.featured_image && (
                      <div className="aspect-[16/10] overflow-hidden rounded-t-2xl bg-muted">
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-7">
                      <div className="flex flex-wrap items-center gap-2">
                        {post.category && (
                          <Badge className="bg-[var(--navy)] text-white">
                            {post.category.name}
                          </Badge>
                        )}
                        {post.tags?.slice(0, 2).map((tag: any) => (
                          <Badge key={tag.id} variant="outline" className="text-xs">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                      <h3 className="mt-4 font-display text-lg font-bold leading-snug">
                        <Link
                          to="/blog/$slug" params={{ slug: post.slug }}
                          className="hover:text-[var(--gold)]"
                        >
                          {post.title}
                        </Link>
                      </h3>
                      {post.excerpt && (
                        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        {post.published_at && (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />{" "}
                            {format(new Date(post.published_at), "MMM d, yyyy")}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />{" "}
                          {post.view_count.toLocaleString()} views
                        </span>
                      </div>
                      <Link
                        to="/blog/$slug" params={{ slug: post.slug }}
                        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--navy)] hover:text-[var(--gold)]"
                      >
                        Read article <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </article>
                </FadeIn>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-muted-foreground">No articles found.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search or filters.
              </p>
            </div>
          )}
        </div>
      </section>

      <CTAStrip />
    </>
  );
}
