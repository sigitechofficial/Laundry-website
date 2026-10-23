"use client";

import Link from "next/link";
import Button from "../ds/Button";
import Icon from "../ds/Icon";
import PageHero from "../ds/PageHero";
import PageShell from "../ds/PageShell";
import Reveal from "../ds/Reveal";
import { Container } from "../ds/Layout";
import { useGetBlogsQuery } from "../../src/app/store/services/api";
import { formatPostDate, postHref, toBlogList } from "./blogModel";

/** Shared with BlogPostView (formerly Blog.module.css). */
export const GRID =
  "list-none m-0 p-0 grid grid-cols-[repeat(3,minmax(0,1fr))] gap-6 [&>li]:flex max-[1080px]:grid-cols-[repeat(2,minmax(0,1fr))] max-[720px]:grid-cols-[1fr] max-[720px]:gap-4";
export const STATUS =
  "max-w-[560px] mx-auto my-0 p-8 text-center bg-jdc-white border border-jdc-line rounded-jdc-lg [&_h2]:m-[0_0_6px] [&_h2]:font-display [&_h2]:text-[22px] [&_h2]:text-jdc-navy [&_p]:m-[0_0_18px] [&_p]:text-jdc-muted";
const CARD = "flex flex-col w-full overflow-hidden border border-jdc-line rounded-jdc-lg text-inherit no-underline [transition:box-shadow_0.2s]";

export default function BlogListView() {
  const { data, isLoading, isError, refetch } = useGetBlogsQuery();
  const posts = toBlogList(data);
  const [featured, ...rest] = posts;

  return (
    <PageShell header="overlay">
      <PageHero
        image="/jdc/media/8338be42a81f.jpg"
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
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className={`${CARD} h-[380px] bg-[linear-gradient(90deg,var(--jdc-white)_0%,var(--jdc-mist)_50%,var(--jdc-white)_100%)] [background-size:200%_100%] animate-jdc-shimmer`} />
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
              <p>We&apos;re writing our first guides. Check back soon.</p>
            </div>
          ) : (
            <>
              <Reveal>
                <Link href={postHref(featured.id)} className="grid grid-cols-[1.2fr_1fr] mb-7 overflow-hidden border border-jdc-line rounded-jdc-xl bg-jdc-white text-inherit no-underline [transition:box-shadow_0.2s] max-[1080px]:grid-cols-[1fr]">
                  <span className="relative min-h-[340px] overflow-hidden bg-jdc-mist max-[1080px]:min-h-0 max-[1080px]:aspect-[16/10]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={featured.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    <span className="absolute top-4 left-4 inline-flex items-center gap-[6px] py-[7px] px-[13px] rounded-jdc-pill bg-[rgba(27,34,48,0.78)] [backdrop-filter:blur(8px)] border border-[rgba(255,255,255,0.22)] text-jdc-white text-[12.5px] font-bold [&_svg]:text-jdc-sky">
                      <Icon name="starBold" size={14} />
                      Featured
                    </span>
                  </span>
                  <span className="flex flex-col justify-center gap-[14px] p-10 max-[1080px]:p-7 max-[720px]:p-[22px]">
                    <h2 className="m-0 font-display text-[32px] leading-[1.1] tracking-[-0.02em] text-jdc-navy max-[720px]:text-[24px]">{featured.title}</h2>
                    <p className="m-0 text-[17px] text-jdc-muted max-[720px]:text-[15.5px]">{featured.excerpt}</p>
                    <PostMeta post={featured} />
                    <span className="inline-flex items-center gap-2 mt-[6px] font-bold text-jdc-blue">
                      Read the article <Icon name="arrowRight" size={16} />
                    </span>
                  </span>
                </Link>
              </Reveal>

              {rest.length ? (
                <ul className={GRID}>
                  {rest.map((post) => (
                    <Reveal as="li" key={post.id}>
                      <PostCard post={post} />
                    </Reveal>
                  ))}
                </ul>
              ) : null}
            </>
          )}
        </Container>
      </section>
    </PageShell>
  );
}

export function PostCard({ post }) {
  return (
    <Link href={postHref(post.id)} className={`${CARD} bg-jdc-white`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={post.image} alt="" loading="lazy" className="w-full aspect-[16/10] object-cover bg-jdc-mist" />
      <span className="flex-1 flex flex-col gap-[10px] pt-[22px] px-6 pb-6 max-[720px]:pt-4 max-[720px]:px-[18px] max-[720px]:pb-[18px] max-[720px]:gap-2">
        <h3 className="m-0 font-display text-[21px] leading-[1.25] text-jdc-navy max-[720px]:text-[18px]">{post.title}</h3>
        <p className="flex-1 m-0 text-[15px] text-jdc-muted">{post.excerpt}</p>
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
