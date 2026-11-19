"use client";

import Link from "next/link";
import Button from "../ds/Button";
import Icon from "../ds/Icon";
import PageHero from "../ds/PageHero";
import PageShell from "../ds/PageShell";
import Reveal from "../ds/Reveal";
import { Container } from "../ds/Layout";
import { Bone } from "../ds/Skeleton";
import { useGetBlogsQuery } from "../../src/app/store/services/api";
import { formatPostDate, postHref, toBlogList } from "./blogModel";

/** Shared with BlogPostView (formerly Blog.module.css). */
export const GRID =
  "list-none m-0 p-0 grid grid-cols-[repeat(3,minmax(0,1fr))] gap-6 [&>li]:flex max-[1080px]:grid-cols-[repeat(2,minmax(0,1fr))] max-[720px]:grid-cols-[1fr] max-[720px]:gap-4";
export const STATUS =
  "max-w-[560px] mx-auto my-0 p-8 text-center bg-jdc-white border border-jdc-line rounded-jdc-lg [&_h2]:m-[0_0_6px] [&_h2]:font-display [&_h2]:text-[22px] [&_h2]:text-jdc-navy [&_p]:m-[0_0_18px] [&_p]:text-jdc-muted";
const CARD = "flex flex-col w-full overflow-hidden border border-jdc-line rounded-jdc-lg text-inherit no-underline [transition:box-shadow_0.2s]";

export default function BlogListView() {
  const { data, isLoading, isError: failed, error, refetch } = useGetBlogsQuery();
  // the backend answers 404 when there are no articles: that is "empty", not an error
  const isError = failed && error?.status !== 404;
  const posts = toBlogList(data);

  return (
    <PageShell header="overlay">
      <PageHero
        image="/jdc/media/hero-blog-white-shirts.jpg"
        title={
          <>
            Tips, guides <span>&amp; advice.</span>
          </>
        }
        lead="Simple, honest advice on caring for your clothes, from stains to storage."
      />

      <section className="pt-16 px-0 pb-20 max-[720px]:pt-8 max-[720px]:pb-12" aria-label="Articles">
        <Container>
          {isLoading ? (
            <div className={GRID} aria-busy="true" aria-label="Loading articles">
              {/* same shape as a real card, so nothing moves when the articles arrive */}
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className={`${CARD} bg-jdc-white`}>
                  <Bone className="aspect-[16/10] w-full rounded-none" />
                  <span className="flex flex-col gap-[10px] pt-[22px] px-6 pb-6 max-[720px]:pt-4 max-[720px]:px-[18px] max-[720px]:pb-[18px] max-[720px]:gap-2">
                    <span className="h-[2.5em] text-[21px] max-[720px]:text-[18px]"><Bone className="h-[0.9em] w-4/5" /></span>
                    <span className="h-[4.65em] text-[15px]"><Bone className="h-[0.9em] w-full" /><Bone className="mt-2 h-[0.9em] w-3/4" /></span>
                    <span className="mt-auto flex items-center justify-between border-t border-t-jdc-line pt-[14px]"><Bone className="h-4 w-36" /><Bone className="size-[34px] rounded-full" /></span>
                  </span>
                </div>
              ))}
            </div>
          ) : isError && !posts.length ? (
            <div className={STATUS} role="status">
              <h2>We couldn&apos;t load our articles</h2>
              <p>Please check your connection and try again.</p>
              <Button onClick={refetch}>Try again</Button>
            </div>
          ) : !posts.length ? (
            <div className={STATUS} role="status">
              <h2>No articles yet</h2>
              <p>We&apos;re writing our first guides. In the meantime, our help centre answers the common questions.</p>
              <Button href="/help-center">Visit the help centre</Button>
            </div>
          ) : (
            // every article is the same card (same width, height, image and text lines);
            // the newest one keeps a "Featured" badge on its picture
            <ul className={GRID}>
              {posts.map((post, i) => (
                <Reveal as="li" key={post.id}>
                  <PostCard post={post} featured={i === 0} />
                </Reveal>
              ))}
            </ul>          )}
        </Container>
      </section>
    </PageShell>
  );
}

/*
 * Article card. Every card is the same size whatever the article: the picture has a fixed
 * shape, the title always takes 2 lines and the excerpt 3 (longer text ends with "…"),
 * and the date row sits at the bottom.
 */
export function PostCard({ post, featured = false }) {
  return (
    <Link href={postHref(post.id)} className={`${CARD} bg-jdc-white`} title={post.title}>
      <span className="relative block aspect-[16/10] w-full overflow-hidden bg-jdc-mist">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={post.image} alt="" loading={featured ? "eager" : "lazy"} className="absolute inset-0 h-full w-full object-cover" />
        {featured ? (
          <span className="absolute left-3.5 top-3.5 inline-flex items-center gap-1.5 rounded-jdc-pill bg-jdc-navy px-3 py-1.5 text-[12px] font-bold text-jdc-white [&_svg]:text-jdc-sky">
            <Icon name="starBold" size={13} />
            Featured
          </span>
        ) : null}
      </span>
      <span className="flex-1 flex flex-col gap-[10px] pt-[22px] px-6 pb-6 max-[720px]:pt-4 max-[720px]:px-[18px] max-[720px]:pb-[18px] max-[720px]:gap-2">
        <h3 className="m-0 line-clamp-2 h-[2.5em] font-display text-[21px] leading-[1.25] text-jdc-navy max-[720px]:text-[18px]">{post.title}</h3>
        <p className="m-0 line-clamp-3 h-[4.65em] text-[15px] leading-[1.55] text-jdc-muted">{post.excerpt}</p>
        <span className="flex items-center justify-between gap-[10px] mt-auto pt-[14px] border-t border-t-jdc-line">
          <PostMeta post={post} />
          <span className="flex-none w-[34px] h-[34px] rounded-[50%] flex items-center justify-center bg-jdc-mist text-jdc-navy" aria-hidden="true">
            <Icon name="arrowRight" size={16} />
          </span>
        </span>
      </span>
    </Link>
  );
}

function PostMeta({ post }) {
  const date = formatPostDate(post.date);
  return (
    <span className="inline-flex flex-wrap items-center gap-[7px] text-[13.5px] font-semibold text-jdc-muted [&_svg]:text-jdc-blue">
      <Icon name="clockBold" size={14} />
      {post.readMinutes} min read
      {date ? (
        <>
          <span aria-hidden="true">·</span>
          <time dateTime={post.date.toISOString()}>{date}</time>
        </>
      ) : null}
    </span>
  );
}
