"use client";

import { useId, useState } from "react";
import Button from "../ds/Button";
import Icon from "../ds/Icon";
import PageHero from "../ds/PageHero";
import PageShell from "../ds/PageShell";
import { CheckList, FeatureGrid, PageHead } from "../ds/Blocks";
import { Container } from "../ds/Layout";
import { BRAND, ROUTES } from "../ds/siteConfig";
import { useStartBooking } from "../../utilities/useStartBooking";
import { normalisePostcode, postcodeError } from "../../utilities/ukPostcode";

export default function LocationsView() {
  const startBooking = useStartBooking();
  const inputId = useId();
  const [postcode, setPostcode] = useState("");
  const [error, setError] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    const message = postcodeError(postcode);
    setError(message);
    if (!message) startBooking({ postcode: normalisePostcode(postcode) });
  };

  return (
    <PageShell header="overlay">
      <PageHero
        size="sm"
        image="/jdc/media/f0f6adb5a1cc.jpg"
        title={
          <>
            Where <span>we collect.</span>
          </>
        }
        lead={`Free collection and delivery across ${BRAND.city}, in a one-hour window that suits you.`}
      />

      <section className="px-0 py-16 max-[720px]:py-9">
        <Container className="grid grid-cols-[1.2fr_1fr] gap-16 [align-items:start] max-[1080px]:grid-cols-[1fr] max-[1080px]:gap-10 [&>*]:min-w-0">
          <div>
            <PageHead
              title={
                <>
                  Check <em>your area.</em>
                </>
              }
              lead="Enter your postcode to start a booking. We confirm availability for your exact address before you pay."
            />
            <form className="flex max-w-[520px] items-center gap-2 rounded-jdc-pill border-[1.5px] border-solid border-jdc-line bg-jdc-white py-1.5 pl-4 pr-1.5 [transition:border-color_0.2s,box-shadow_0.2s] focus-within:border-jdc-blue focus-within:[box-shadow:0_0_0_4px_rgba(2,120,254,0.14)]" onSubmit={onSubmit} noValidate>
              <label htmlFor={inputId} className="sr-only">
                Your postcode
              </label>
              <span className="flex text-jdc-blue">
                <Icon name="mapPin" size={20} />
              </span>
              <input
                id={inputId}
                placeholder="Enter your postcode"
                autoComplete="postal-code"
                autoCapitalize="characters"
                spellCheck={false}
                maxLength={10}
                className="h-11 min-w-0 flex-1 border-0 bg-transparent text-[16px] text-jdc-text [outline:none]"
                value={postcode}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${inputId}-err` : undefined}
                onChange={(e) => {
                  setPostcode(e.target.value);
                  if (error) setError("");
                }}
              />
              <Button type="submit" size="sm">
                Check
              </Button>
            </form>
            <p id={`${inputId}-err`} className="mb-0 ml-4 mr-0 mt-2 min-h-[1.4em] text-[13.5px] font-semibold text-jdc-danger" role="alert">
              {error}
            </p>
            <CheckList
              items={[
                "Free collection and delivery on every order",
                "One-hour windows, including evenings and weekends",
                "Live tracking from pickup to delivery",
              ]}
            />
          </div>

          <div className="rounded-jdc-xl border border-jdc-line bg-jdc-white p-8 max-[720px]:p-[22px]">
            <span className="flex h-[58px] w-[58px] items-center justify-center rounded-2xl bg-[#F1F3F7] text-[#6B7385]">
              <Icon name="mapPin" size={28} />
            </span>
            <h2 className="mx-0 mb-2 mt-[18px] font-display text-[32px] tracking-[-0.02em] text-jdc-navy">{BRAND.city}</h2>
            <p className="mx-0 mb-[22px] mt-0 text-[16px] text-jdc-muted">
              We are growing our coverage area by area. If we are not in your neighbourhood yet, get in touch
              and we will let you know when we arrive.
            </p>
            <Button href={ROUTES.contact} variant="ghost">
              Ask about your area
            </Button>
          </div>
        </Container>
      </section>

      <section className="bg-jdc-mist px-0 pb-20 pt-16 max-[720px]:pb-12 max-[720px]:pt-10">
        <Container>
          <PageHead
            title={
              <>
                Wherever you are, <em>the same care.</em>
              </>
            }
          />
          <FeatureGrid
            items={[
              { icon: "truck", title: "Collected from your door", body: "Home, office or concierge. Leave your bag somewhere safe and we will text you." },
              { icon: "sparkle", title: "Cleaned by specialists", body: "Every item is checked and cleaned the right way for its fabric." },
              { icon: "package", title: "Delivered fresh", body: "Pressed, covered and returned in the window you choose." },
            ]}
          />
        </Container>
      </section>
    </PageShell>
  );
}
