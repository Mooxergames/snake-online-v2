/**
 * Renders the rendered-HTML body of a blog post.
 *
 * `html` comes from lib/blog.ts which:
 *   1. runs the source markdown through remark → HTML
 *   2. auto-injects <a> tags around snake names that match the catalog
 *
 * Both inputs are author-controlled (MDX frontmatter + curated content) —
 * no end-user data flows in — so dangerouslySetInnerHTML below is safe.
 */
export default function BlogPostBody({ html }: { html: string }) {
  return (
    <div
      className="prose prose-invert prose-headings:font-display prose-headings:text-balance prose-h2:text-3xl prose-h2:font-semibold prose-h2:mt-12 prose-h3:text-xl prose-a:text-brand-400 hover:prose-a:text-brand-300 prose-strong:text-text-primary prose-img:rounded-2xl prose-blockquote:border-brand-500 prose-blockquote:not-italic max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
