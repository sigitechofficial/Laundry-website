"use client";

import Link from "next/link";
import Icon from "./Icon";
import { BrandLogo } from "./Brand";
import { StoreBadges, SocialIcon } from "./StoreBadges";
import { BRAND, FOOTER_NAV, ROUTES, SOCIAL_LINKS } from "./siteConfig";
import { cx } from "./cx";

// Footer links inherit the muted colour and turn blue on hover.
const linkCls = "text-inherit no-underline hover:text-jdc-blue";
const colTitleCls = "mb-[18px] mt-0 font-display text-[16px] font-semibold text-jdc-navy";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-jdc-line bg-jdc-white pb-10 pt-24 font-body text-jdc-sm leading-[1.6] text-jdc-muted max-[720px]:pb-[26px] max-[720px]:pt-[38px]">
      <div className="px-jdc-gutter">
        <div className="grid grid-cols-[1.5fr_repeat(3,1fr)_1.4fr] gap-10 border-b border-jdc-line pb-16 max-[1080px]:grid-cols-[1fr_1fr] max-[720px]:grid-cols-[1fr] max-[720px]:gap-0 max-[720px]:pb-[26px]">
          <div className="max-[720px]:flex max-[720px]:flex-col max-[720px]:items-center max-[720px]:text-center">
            <BrandLogo className="mb-5 h-auto w-[200px] max-[720px]:mx-auto max-[720px]:mb-3.5 max-[720px]:w-[150px]" />
            <p className="m-0 max-w-[280px] max-[720px]:mx-auto max-[720px]:max-w-[320px] max-[720px]:text-[14.5px]">
              Dry cleaning and laundry, collected and delivered across {BRAND.city}.
            </p>
          </div>

          {FOOTER_NAV.map((group) => (
            <nav key={group.title} className="max-[720px]:hidden" aria-label={group.title}>
              <h2 className={colTitleCls}>{group.title}</h2>
              <ul className="m-0 grid list-none gap-[11px] p-0">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className={linkCls}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-5 border-b border-jdc-line py-[26px] max-[720px]:flex-col max-[720px]:items-center max-[720px]:gap-4 max-[720px]:py-[22px] max-[720px]:text-center">
          <div>
            <h2 className={cx(colTitleCls, "mb-3")}>Download our app</h2>
            <StoreBadges />
          </div>
          <ul className="m-0 flex list-none gap-2.5 p-0" aria-label="Social media">
            {SOCIAL_LINKS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-[50%] border border-jdc-line text-jdc-navy no-underline [transition:border-color_0.2s,background_0.2s] hover:border-jdc-line-strong hover:bg-jdc-paper hover:text-jdc-navy"
                >
                  <SocialIcon name={s.icon} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-7 text-[13px] max-[720px]:flex-col max-[720px]:justify-center max-[720px]:gap-3 max-[720px]:text-center">
          <p className="m-0">
            © {year} {BRAND.name}. All rights reserved. By visiting this page you agree to our{" "}
            <Link href={ROUTES.privacy} className="text-inherit underline hover:text-jdc-blue">
              Privacy policy
            </Link>{" "}
            and{" "}
            <Link href={ROUTES.terms} className="text-inherit underline hover:text-jdc-blue">
              Terms and conditions
            </Link>
            .
          </p>
          <Link
            href={ROUTES.locations}
            className="inline-flex items-center gap-2 rounded-jdc-pill border border-jdc-line px-4 py-2 text-jdc-navy no-underline"
          >
            <Icon name="mapPin" size={16} />
            {BRAND.city}
          </Link>
        </div>
      </div>
    </footer>
  );
}
