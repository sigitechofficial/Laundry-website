"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Button from "../ds/Button";
import Icon from "../ds/Icon";
import PageHero from "../ds/PageHero";
import PageShell from "../ds/PageShell";
import { CtaBand, PageHead } from "../ds/Blocks";
import { Container } from "../ds/Layout";
import { useGetBlogByIdQuery, useGetBlogsQuery } from "../../src/app/store/services/api";
import { sanitizeHtml } from "../../utilities/sanitizeHtml";
import { useStartBooking } from "../../utilities/useStartBooking";
import { formatPostDate, toBlogList, toBlogPost } from "./blogModel";
import { GRID, PostCard, STATUS } from "./BlogListView";

export default function BlogPostView({ id }) {
  const startBooking = useStartBooking();
  const { data, isLoading, isError: failed, error, refetch } = useGetBlogByIdQuery(id);
  // 404 = the article doesn't exist: show "Article not found", not a connection error
  const isError = failed && error?.status !== 404;
  const { data: allData } = useGetBlogsQuery();
  const post = toBlogPost(data);
  const related = toBlogList(allData)
    .filter((p) => String(p.id) !== String(id))
    .slice(0, 3);

  // Sanitise in the browser (DOMParser) once the post arrives.
  const [html, setHtml] = useState("");
  useEffect(() => {
    setHtml(post ? sanitizeHtml(post.html) : "");
  }, [post?.html]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the document title in step with the article.
  useEffect(() => {
    if (post?.title) document.title = `${post.title} | Just Dry Cleans`;
  }, [post?.title]);

  const date = post ? formatPostDate(post.date) : "";

  return (
    <PageShell header="overlay">
      <PageHero
        size="sm"
        image={post?.image}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post?.title ?? "Article" },
        ]}
        title={post?.title ?? (isLoading ? "Loading article…" : "Article not found")}
      >
        {post ? (
          <div className="flex flex-wrap gap-[8px_18px] mt-5 text-[14.5px] text-[rgba(255,255,255,0.75)]">
            <span>{post.readMinutes} min read</span>
            {date ? <time dateTime={post.date.toISOString()}>{date}</time> : null}
            <span>By the Just Dry Cleans team</span>
          </div>
        ) : null}
      </PageHero>

      <section className="pt-14 px-0 pb-20 max-[720px]:pt-8 max-[720px]:pb-12">
        <Container>
          <article className="max-w-[760px] mx-auto my-0">
            <Link href="/blog" className="inline-flex items-center gap-2 mb-[26px] font-bold text-jdc-blue no-underline">
              <Icon name="caretRight" size={14} className="[transform:rotate(180deg)]" /> Back to all articles
            </Link>

            {isLoading ? (
              <div className="h-[420px] rounded-jdc-lg bg-[linear-gradient(90deg,var(--jdc-white)_0%,var(--jdc-mist)_50%,var(--jdc-white)_100%)] [background-size:200%_100%] animate-jdc-shimmer" aria-busy="true" aria-label="Loading article" />
            ) : isError && !post ? (
              <div className={STATUS} role="status">
                <h2>We couldn&apos;t load this article</h2>
                <p>It may have been moved, or there was a connection problem.</p>
                <Button onClick={refetch}>Try again</Button>
              </div>
            ) : !post ? (
              <div className={STATUS} role="status">
                <h2>Article not found</h2>
                <p>It may have been removed. Browse our other guides instead.</p>
                <Button href="/blog">All articles</Button>
              </div>
            ) : (
              // Content is sanitised with an allow list in utilities/sanitizeHtml.js
              <div className="text-[19px] leading-[1.75] text-jdc-text [&_p]:m-[0_0_1.1em] [&>p:first-child]:text-[21px] [&>p:first-child]:font-medium [&>p:first-child]:text-jdc-navy [&_h2]:m-[44px_0_10px] [&_h2]:font-display [&_h2]:tracking-[-0.02em] [&_h2]:text-jdc-navy [&_h2]:text-[30px] [&_h3]:m-[44px_0_10px] [&_h3]:font-display [&_h3]:tracking-[-0.02em] [&_h3]:text-jdc-navy [&_h3]:text-[24px] [&_ul]:m-[0_0_1.1em] [&_ul]:pl-[22px] [&_ul]:list-disc [&_ol]:m-[0_0_1.1em] [&_ol]:pl-[22px] [&_ol]:list-decimal [&_li::marker]:text-jdc-blue [&_li_p]:m-0 [&_strong]:text-jdc-navy [&_a]:text-jdc-blue [&_a]:font-semibold [&_blockquote]:m-[28px_0] [&_blockquote]:pt-1 [&_blockquote]:pr-0 [&_blockquote]:pb-1 [&_blockquote]:pl-5 [&_blockquote]:border-l-[3px] [&_blockquote]:border-l-jdc-blue [&_blockquote]:text-jdc-navy [&_img]:m-[32px_0] [&_img]:rounded-jdc-lg max-[720px]:text-[17px] max-[720px]:[&>p:first-child]:text-[18.5px] max-[720px]:[&_h2]:text-[25px] max-[720px]:[&_h2]:mt-[34px]" dangerouslySetInnerHTML={{ __html: html }} />
            )}
          </article>

          <div className="max-w-[760px] mt-11 mx-auto mb-0">
            <CtaBand
              titleA="Leave it to"
              titleB="the specialists."
              body="Book a one-hour pickup and we will collect, clean and deliver."
              actions={
                <Button variant="white" onClick={() => startBooking()}>
                  Schedule your first pickup
                </Button>
              }
            />
          </div>

          {related.length ? (
            <div className="mt-[72px] max-[720px]:mt-12">
              <PageHead
                title={
                  <>
                    More <em>guides.</em>
                  </>
                }
              />
              <ul className={GRID}>
                {related.map((p) => (
                  <li key={p.id}>
                    <PostCard post={p} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Container>
      </section>
    </PageShell>
  );
}
