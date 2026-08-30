import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, CTAStrip } from "@/components/site/PageHero";
import { FadeIn } from "@/components/site/Section";
import { useBlogPostBySlug, useBlogPosts, useBlogTags } from "@/lib/hooks/useBlog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Calendar, Clock, Tag, Share2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => {
    const fallbackTitle = "Article — Nitram Logistics";
    const fallbackDescription = "Read this logistics insights article from Nitram Logistics Limited.";
    const url = `${import.meta.env.VITE_SITE_URL || "https://nitramclearing.co.zm"}/blog/${params.slug}`;
    return {
      meta: [
        { title: fallbackTitle },
        { name: "description", content: fallbackDescription },
        { name: "robots", content: "index,follow,max-image-preview:large" },
        { property: "og:title", content: fallbackTitle },
        { property: "og:description", content: fallbackDescription },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: fallbackTitle },
        { name: "twitter:description", content: fallbackDescription },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: BlogPostPage,
  loader: async () => ({}),
});

function BlogPostPage() {
  const { slug } = Route.useParams();
  const { data: post, isLoading } = useBlogPostBySlug(slug);
  const { data: relatedPosts } = useBlogPosts({ published: true, category_id: post?.category_id || undefined });
  const { data: tags } = useBlogTags();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--gold)] border-t-transparent" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <h1 className="text-3xl font-bold">Article not found</h1>
        <p className="mt-2 text-muted-foreground">
          This article may have been removed or is no longer published.
        </p>
        <Link
          to="/blog"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-6 py-3 text-sm font-semibold text-white"
        >
          Back to Blog <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const related = relatedPosts?.filter((p) => p.id !== post.id).slice(0, 3) || [];

  const share = async () => {
    const url = window.location.href;
    const title = post.title;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // fallback
      }
    }
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  const canonicalUrl = post.canonical_url || `${window.location.origin}/blog/${post.slug}`;
  const description = post.seo_description || post.excerpt || `Read ${post.title} from Nitram Logistics Limited.`;
  const structuredData = {
    '@context': 'https://schema.org', '@type': 'BlogPosting',
    headline: post.title, description, url: canonicalUrl,
    image: post.featured_image ? [post.featured_image] : undefined,
    author: post.author ? { '@type': 'Person', name: post.author.name } : undefined,
    publisher: { '@type': 'Organization', name: 'Nitram Logistics Limited' },
    datePublished: post.published_at, dateModified: post.updated_at,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <PageHero
        eyebrow={post.category?.name}
        title={post.title}
        description={post.excerpt || undefined}
        cta={
          <button
            onClick={share}
            className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
          >
            <Share2 className="h-4 w-4" /> Share article
          </button>
        }
      />

      <section className="py-24">
        <div className="container-x">
          <div className="mx-auto max-w-3xl">
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {post.published_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />{" "}
                  {format(new Date(post.published_at), "MMMM d, yyyy")}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> {post.view_count.toLocaleString()} views
              </span>
              {post.author && (
                <span className="font-medium text-foreground">{post.author.name}</span>
              )}
            </div>

            <Separator className="my-8" />

            {/* Featured Image */}
            {post.featured_image && (
              <div className="mb-10 overflow-hidden rounded-2xl">
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="h-auto w-full object-cover"
                  loading="eager"
                  onError={(event) => { event.currentTarget.style.display = 'none'; }}
                />
              </div>
            )}

            {/* Content */}
            <article
              className="blog-article-content"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <Separator className="my-10" />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {post.tags.map((tag: any) => (
                  <Badge key={tag.id} variant="outline">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Back link */}
            <div className="mt-10">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--navy)] hover:text-[var(--gold)]"
              >
                <ArrowRight className="h-4 w-4 rotate-180" /> All articles
              </Link>
            </div>
          </div>

          {/* Related Posts */}
          {related.length > 0 && (
            <div className="mt-24">
              <h2 className="mb-8 font-display text-2xl font-bold">Related articles</h2>
              <div className="grid gap-6 md:grid-cols-3">
                {related.map((r, i) => (
                  <FadeIn key={r.id} delay={i * 0.05}>
                    <article className="h-full rounded-2xl border border-border bg-card p-7 transition hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]">
                      {r.featured_image && (
                        <div className="mb-4 aspect-[16/10] overflow-hidden rounded-xl bg-muted">
                          <img
                            src={r.featured_image}
                            alt={r.title}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      {r.category && (
                        <Badge className="bg-[var(--navy)] text-white">{r.category.name}</Badge>
                      )}
                      <h3 className="mt-3 font-display text-lg font-bold leading-snug">
                        <Link to="/blog/$slug" params={{ slug: r.slug }} className="hover:text-[var(--gold)]">
                          {r.title}
                        </Link>
                      </h3>
                      {r.excerpt && (
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                          {r.excerpt}
                        </p>
                      )}
                      <Link
                        to="/blog/$slug" params={{ slug: r.slug }}
                        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--navy)] hover:text-[var(--gold)]"
                      >
                        Read article <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </article>
                  </FadeIn>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <CTAStrip />
    </>
  );
}
