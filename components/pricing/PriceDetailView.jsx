"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import Button from "../ds/Button";
import Icon from "../ds/Icon";
import PageShell from "../ds/PageShell";
import { Container } from "../ds/Layout";
import { cx } from "../ds/cx";
import { formatPrice } from "../../utilities/formatPrice";
import { filterCategories } from "./pricingModel";
import { usePricingData } from "./usePricingData";
import { IC, PricingFaq, SHIMMER, StatusCard, serviceHref } from "./PricingListView";

/** + / - buttons of the item stepper (formerly .add and .stepper button). */
const STEP_BTN =
  "w-[38px] h-[38px] flex-none inline-flex items-center justify-center border-[1.5px] border-jdc-line rounded-[12px] bg-jdc-white text-jdc-navy text-[20px] font-semibold leading-none cursor-pointer [transition:border-color_0.15s,background_0.15s] hover:border-jdc-blue hover:bg-jdc-blue-tint";

/** Estimate lines, keyed `${serviceId}:${itemId}`. Kept across service tabs. */
function useEstimate() {
  const [lines, setLines] = useState({});

  const change = (service, category, item, delta) =>
    setLines((prev) => {
      const key = `${service.id}:${item.id}`;
      const qty = (prev[key]?.qty ?? 0) + delta;
      const next = { ...prev };
      if (qty <= 0) delete next[key];
      else
        next[key] = {
          key,
          qty,
          name: item.name,
          price: item.price ?? 0,
          serviceName: service.name,
          categoryName: category.name,
        };
      return next;
    });

  const remove = (key) =>
    setLines((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

  const list = Object.values(lines);
  const count = list.reduce((n, l) => n + l.qty, 0);
  const total = list.reduce((n, l) => n + l.qty * l.price, 0);
  return { lines, list, count, total, change, remove, clear: () => setLines({}) };
}

export default function PriceDetailView() {
  const params = useSearchParams();
  const { services, currency, isLoading, isError, refetch } = usePricingData();
  const estimate = useEstimate();
  const [query, setQuery] = useState("");
  const searchId = useId();
  const tabsRef = useRef(null);

  const requestedId = params.get("id");
  const service = useMemo(
    () => services.find((s) => String(s.id) === String(requestedId)) ?? services[0],
    [services, requestedId]
  );

  // Reset the search when switching service.
  useEffect(() => setQuery(""), [service?.id]);

  // Keep the active tab visible in the scrollable tab row.
  useEffect(() => {
    tabsRef.current?.querySelector('[aria-current="page"]')?.scrollIntoView({
      block: "nearest",
      inline: "center",
    });
  }, [service?.id]);

  const categories = useMemo(
    () => (service ? filterCategories(service.categories, query) : []),
    [service, query]
  );
  const price = (v) => formatPrice(v, currency);

  return (
    <PageShell header="solid">
      <section className="pt-6 px-0 pb-14 max-[1080px]:pb-24 max-[720px]:pt-4">
        <Container>
          <Link href="/pricing" className="inline-flex items-center gap-2 py-[6px] px-0 font-semibold text-[15px] text-jdc-navy no-underline hover:text-jdc-blue">
            <Icon name="caretRight" size={14} className="[transform:rotate(180deg)]" />
            Service list
          </Link>

          {isLoading ? (
            <div className={`h-[420px] mt-5 rounded-jdc-lg ${SHIMMER}`} aria-busy="true" aria-label="Loading prices" />
          ) : isError ? (
            <StatusCard
              title="We couldn't load these prices"
              body="Please check your connection and try again."
              action={<Button onClick={refetch}>Try again</Button>}
            />
          ) : !service ? (
            <StatusCard title="Service not found" body="Choose a service from the list." />
          ) : (
            <>
              <nav className="flex gap-[10px] overflow-x-auto m-[14px_0_22px] pt-[2px] px-0 pb-[6px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[720px]:m-[10px_calc(var(--jdc-gutter)*-1)_16px] max-[720px]:pl-jdc-gutter max-[720px]:pr-jdc-gutter" aria-label="Services" ref={tabsRef}>
                {services.map((s) => (
                  <Link
                    key={s.id}
                    href={serviceHref(s.id)}
                    replace
                    scroll={false}
                    className={cx(
                      "flex-none inline-flex items-center h-[42px] py-0 px-[18px] rounded-jdc-pill bg-[#f1f3f7] text-jdc-muted font-bold text-[14px] whitespace-nowrap no-underline [transition:background_0.15s,color_0.15s] hover:text-jdc-navy max-[720px]:h-[38px] max-[720px]:px-[14px] max-[720px]:text-[13px]",
                      s.id === service.id && "bg-jdc-blue text-jdc-white hover:text-jdc-white"
                    )}
                    aria-current={s.id === service.id ? "page" : undefined}
                  >
                    {s.name}
                  </Link>
                ))}
              </nav>

              <div className="grid grid-cols-[minmax(0,1fr)_380px] gap-6 [align-items:start] max-[1080px]:grid-cols-[minmax(0,1fr)]">
                <div>
                  <h1 className="m-[0_0_16px] font-display font-bold [font-size:clamp(24px,2.4vw,32px)] tracking-[-0.02em] text-jdc-navy">{service.name} prices</h1>

                  {service.itemCount > 8 ? (
                    <div className="sticky top-jdc-header z-[5] m-[0_0_8px] py-[10px] px-0 bg-jdc-paper">
                      <label htmlFor={searchId} className="sr-only">
                        Search {service.name} items
                      </label>
                      <div className="flex items-center gap-[10px] h-12 py-0 px-4 border-[1.5px] border-jdc-line rounded-[14px] bg-jdc-white text-jdc-muted [transition:border-color_0.2s,box-shadow_0.2s] focus-within:border-jdc-blue focus-within:[box-shadow:0_0_0_4px_rgba(2,120,254,0.14)]">
                        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                          <circle cx="11" cy="11" r="7" />
                          <path d="m20 20-3.5-3.5" />
                        </svg>
                        <input
                          id={searchId}
                          type="search"
                          placeholder={`Search ${service.itemCount} items`}
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          autoComplete="off"
                          className="flex-1 min-w-0 [border:0] [outline:none] bg-transparent text-[15px] text-jdc-text"
                        />
                      </div>
                      {!query && service.categories.length > 1 ? (
                        <nav className="flex gap-2 overflow-x-auto mt-[10px] pb-[2px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Jump to a category">
                          {service.categories.map((c) => (
                            <a
                              key={c.id}
                              href={`#cat-${c.id}`}
                              className="flex-none py-[6px] px-3 border border-jdc-line rounded-jdc-pill bg-jdc-white text-[13px] font-semibold text-jdc-navy no-underline whitespace-nowrap hover:border-jdc-line-strong"
                            >
                              {c.name}
                            </a>
                          ))}
                        </nav>
                      ) : null}
                    </div>
                  ) : null}

                  {categories.length === 0 ? (
                    <p className="m-[8px_0_0] p-[18px] rounded-[14px] bg-jdc-mist text-[14.5px] text-jdc-muted" role="status">
                      {query
                        ? `No items match "${query}". Try another word, or contact us for a price.`
                        : "Prices for this service are available on request."}
                    </p>
                  ) : (
                    categories.map((cat) => (
                      <section key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-[calc(var(--jdc-header-h)+120px)] mt-[18px]" aria-labelledby={`cat-h-${cat.id}`}>
                        <h2 id={`cat-h-${cat.id}`} className="flex items-center gap-2 m-[0_0_10px] font-display font-semibold text-[18px] text-jdc-navy">
                          {cat.name}
                          <span className="min-w-[24px] h-[22px] py-0 px-[7px] rounded-jdc-pill bg-jdc-mist font-body text-[12px] leading-[22px] text-center text-jdc-muted">{cat.items.length}</span>
                        </h2>
                        {cat.items.length === 0 ? (
                          <p className="m-[8px_0_0] p-[18px] rounded-[14px] bg-jdc-mist text-[14.5px] text-jdc-muted">{cat.description || "Price on request."}</p>
                        ) : (
                          <ul className="list-none m-0 p-0 grid gap-2">
                            {cat.items.map((item) => {
                              const qty = estimate.lines[`${service.id}:${item.id}`]?.qty ?? 0;
                              return (
                                <li key={item.id} className={cx(
                                    "flex items-center gap-4 min-h-[60px] pt-[10px] pr-3 pb-[10px] pl-[18px] border border-jdc-line rounded-[14px] bg-jdc-white [transition:border-color_0.15s] max-[720px]:p-[8px_8px_8px_14px] max-[720px]:gap-[10px]",
                                    qty > 0 && "border-jdc-blue"
                                  )}>
                                  <span className="flex-1 min-w-0 text-[15.5px] font-semibold text-jdc-navy max-[720px]:text-[14.5px]">{item.name}</span>
                                  <b className="flex-none text-[15px] text-jdc-navy whitespace-nowrap">{item.price !== null ? price(item.price) : "On request"}</b>
                                  {item.price !== null ? (
                                    <Stepper
                                      qty={qty}
                                      label={item.name}
                                      onAdd={() => estimate.change(service, cat, item, 1)}
                                      onRemove={() => estimate.change(service, cat, item, -1)}
                                    />
                                  ) : null}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </section>
                    ))
                  )}
                </div>

                <aside className="sticky top-[calc(var(--jdc-header-h)+16px)] max-[1080px]:static max-[1080px]:order-[-1]" aria-label="Service summary">
                  <div className="p-5 border border-jdc-line rounded-[18px] bg-jdc-white max-[720px]:p-[14px]">
                    <div className="flex items-center gap-3">
                      <span className={IC}>
                        <Icon name={service.icon} size={22} />
                      </span>
                      <div>
                        <h2 className="m-0 font-display font-bold text-[20px] text-jdc-navy max-[720px]:text-[18px]">{service.name}</h2>
                        {service.turnaround ? (
                          <small className="inline-flex items-center gap-[5px] mt-[3px] text-[13px] text-jdc-muted">
                            <Icon name="clockBold" size={13} /> {service.turnaround}
                          </small>
                        ) : null}
                      </div>
                    </div>
                    {service.description ? <p className="m-[12px_0_0] text-[14.5px] leading-[1.5] text-jdc-muted">{service.description}</p> : null}

                    <div className="mt-4 pt-4 border-t border-t-jdc-line max-[1080px]:hidden" aria-live="polite">
                      <h3 className="m-[0_0_8px] text-[14px] font-bold text-jdc-navy">Your estimate</h3>
                      {estimate.count === 0 ? (
                        <p className="m-0 text-[14px] text-jdc-muted">Add items with + to see an estimate.</p>
                      ) : (
                        <>
                          <ul className="list-none m-0 p-0 grid gap-[10px] max-h-[260px] overflow-y-auto">
                            {estimate.list.map((l) => (
                              <li key={l.key} className="flex items-start gap-[10px] text-[14px] text-jdc-text">
                                <span className="flex-1 min-w-0">
                                  {l.qty} × {l.name}
                                  <small className="block text-[12px] text-jdc-muted">{l.serviceName}</small>
                                </span>
                                <b className="flex-none text-jdc-navy">{price(l.qty * l.price)}</b>
                                <button
                                  type="button"
                                  className="flex-none w-6 h-6 inline-flex items-center justify-center [border:0] rounded-[50%] bg-jdc-mist text-jdc-muted cursor-pointer hover:bg-jdc-danger-tint hover:text-jdc-danger"
                                  onClick={() => estimate.remove(l.key)} aria-label={`Remove ${l.name}`}>
                                  <Icon name="close" size={12} />
                                </button>
                              </li>
                            ))}
                          </ul>
                          <div className="flex justify-between items-baseline mt-3 pt-3 border-t [border-top-style:dashed] border-t-jdc-line font-bold text-jdc-navy">
                            <span>Estimated total</span>
                            <b className="text-[20px] text-jdc-blue">{price(estimate.total)}</b>
                          </div>
                          <button type="button" className="mt-[6px] p-0 [border:0] text-[13px] text-jdc-muted underline cursor-pointer" onClick={estimate.clear}>
                            Clear estimate
                          </button>
                        </>
                      )}
                    </div>

                    <p className="m-[14px_0_0] text-[12.5px] text-center text-jdc-muted max-[1080px]:hidden">Estimate only. Your total is confirmed before you pay.</p>
                  </div>
                </aside>
              </div>

              {estimate.count > 0 ? (
                <div className="hidden max-[1080px]:fixed max-[1080px]:left-0 max-[1080px]:right-0 max-[1080px]:bottom-0 max-[1080px]:z-40 max-[1080px]:flex max-[1080px]:items-center max-[1080px]:justify-between max-[1080px]:gap-3 max-[1080px]:pt-3 max-[1080px]:px-jdc-gutter max-[1080px]:pb-[calc(12px+env(safe-area-inset-bottom))] max-[1080px]:bg-jdc-white max-[1080px]:border-t max-[1080px]:border-t-jdc-line max-[1080px]:text-[13px] max-[1080px]:text-jdc-muted">
                  <span>
                    <strong className="max-[1080px]:block max-[1080px]:text-[17px] max-[1080px]:text-jdc-navy">{price(estimate.total)}</strong>
                    {estimate.count} item{estimate.count === 1 ? "" : "s"} estimated
                  </span>
                </div>
              ) : null}
            </>
          )}
        </Container>
      </section>

      <PricingFaq />
    </PageShell>
  );
}

function Stepper({ qty, label, onAdd, onRemove }) {
  if (qty === 0) {
    return (
      <button type="button" className={STEP_BTN} onClick={onAdd} aria-label={`Add ${label} to estimate`}>
        <span aria-hidden="true">+</span>
      </button>
    );
  }
  return (
    <span className="flex-none inline-flex items-center gap-[6px]" role="group" aria-label={`${label} quantity`}>
      <button type="button" className={STEP_BTN} onClick={onRemove} aria-label={`Remove one ${label}`}>
        <span aria-hidden="true">−</span>
      </button>
      <output aria-live="polite" className="min-w-[20px] text-center font-bold text-jdc-navy">{qty}</output>
      <button type="button" className={STEP_BTN} onClick={onAdd} aria-label={`Add one ${label}`}>
        <span aria-hidden="true">+</span>
      </button>
    </span>
  );
}
