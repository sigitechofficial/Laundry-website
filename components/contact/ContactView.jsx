"use client";

import { useState } from "react";
import Button from "../ds/Button";
import FaqList, { toFaqList } from "../ds/FaqList";
import Icon from "../ds/Icon";
import PageHero from "../ds/PageHero";
import PageShell from "../ds/PageShell";
import Reveal from "../ds/Reveal";
import { HeroChips, IconTile, LinkCard, PageHead } from "../ds/Blocks";
import { Bone } from "../ds/Skeleton";
import { FormAlert, FormCard, FormNote, FormRow, SelectField, TextAreaField, TextField } from "../ds/Form";
import { Container } from "../ds/Layout";
import { FAQ as HOME_FAQ } from "../home/content";
import { useGetFAQsQuery, useGetSupportContactQuery } from "../../src/app/store/services/api";
import { buildMailto, digitsOnly, validateMessage } from "./contactForm";

const TOPICS = ["An order", "Prices & services", "Feedback", "Something else"];
const EMPTY = { name: "", email: "", topic: TOPICS[0], message: "" };
// same box as LinkCard (components/ds/Blocks.jsx)
const CARD =
  "flex items-center gap-4 rounded-[20px] border border-jdc-line bg-jdc-white p-[22px] max-[720px]:px-[18px] max-[720px]:py-4";

export default function ContactView() {
  const { data: contactRes, isLoading: contactLoading } = useGetSupportContactQuery();
  const contact = contactRes?.data ?? {};
  const phone = contact.customerSupportPhone || contact.supportPhone || "";
  const email = contact.supportEmail || "";
  const hours = contact.supportHours || "";

  const { data: faqRes } = useGetFAQsQuery();
  const live = toFaqList(faqRes);
  const faqs = live.length ? live : HOME_FAQ.fallback;

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((x) => ({ ...x, [key]: undefined }));
    if (sent) setSent(false);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const found = validateMessage(form);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(`contact-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    window.location.href = buildMailto(email, form);
    setSent(true);
  };

  return (
    <PageShell header="overlay">
      <PageHero
        image="/jdc/media/hero-contact-shirts.jpg"
        title={
          <>
            We are here <span>to help.</span>
          </>
        }
        lead="Call, message or send us a note. A real person will get back to you."
      >
        <HeroChips
          items={[
            { icon: "phoneBold", label: "Call or WhatsApp" },
            { icon: "truckBold", label: "Collection & delivery" },
            { icon: "sparkleBold", label: "Cleaned by specialists" },
          ]}
        />
      </PageHero>

      <section className="px-0 py-16 max-[720px]:py-9">
        <Container className="grid grid-cols-[1fr_1.1fr] gap-16 [align-items:start] max-[1080px]:grid-cols-[1fr] max-[1080px]:gap-10 [&>*]:min-w-0">
          <div>
            <PageHead
              title={
                <>
                  Talk to <em>a real person.</em>
                </>
              }
              lead="Prefer to chat? Pick the way that suits you."
            />
            <div className="grid grid-cols-[1fr] gap-3.5 min-[721px]:max-[1080px]:grid-cols-[1fr_1fr] max-[720px]:grid-cols-[1fr] max-[720px]:gap-2.5" aria-busy={contactLoading || undefined}>
              {/* card-shaped placeholders while the support details load, so the form below
                  does not get pushed down when they arrive */}
              {contactLoading
                ? Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className={CARD} aria-hidden="true">
                      <Bone className="size-[58px] flex-none rounded-2xl" />
                      <span className="grid flex-1 gap-2">
                        <Bone className="h-[22px] w-28" />
                        <Bone className="h-4 w-40 max-w-full" />
                      </span>
                    </div>
                  ))
                : null}
              {phone ? (
                <LinkCard external href={`tel:${phone.replace(/\s+/g, "")}`} icon="phone" title="Call us" body={phone} />
              ) : null}
              {phone ? (
                <LinkCard
                  external
                  href={`https://wa.me/${digitsOnly(phone)}`}
                  icon="whatsapp"
                  title="WhatsApp"
                  body={phone}
                />
              ) : null}
              {email ? <LinkCard external href={`mailto:${email}`} icon="envelope" title="Email" body={email} /> : null}
              {hours ? (
                <div className={CARD}>
                  <IconTile name="clock" tone="tint" />
                  <span>
                    <strong className="block font-display text-[18px] text-jdc-navy">Opening hours</strong>
                    <small className="mt-0.5 block text-[15px] text-jdc-muted">{hours}</small>
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          <FormCard
            title="Send us a message"
            intro="Questions about an order, prices or anything else? We will get back to you."
          >
            {sent ? (
              <FormAlert>Your email app should now be open with your message. Press send there to reach us.</FormAlert>
            ) : null}
            <form onSubmit={onSubmit} noValidate>
              <FormRow>
                <TextField
                  id="contact-name"
                  label="Your name"
                  icon="userBold"
                  autoComplete="name"
                  placeholder="e.g. Alex Smith"
                  required
                  value={form.name}
                  onChange={update("name")}
                  error={errors.name}
                />
                <TextField
                  id="contact-email"
                  label="Email"
                  icon="envelopeBold"
                  type="email"
                  autoComplete="email"
                  placeholder="you@email.com"
                  required
                  value={form.email}
                  onChange={update("email")}
                  error={errors.email}
                />
              </FormRow>
              <SelectField
                label="What is it about?"
                icon="chatBold"
                options={TOPICS}
                value={form.topic}
                onChange={update("topic")}
              />
              <TextAreaField
                id="contact-message"
                label="Your message"
                placeholder="How can we help?"
                required
                maxLength={2000}
                value={form.message}
                onChange={update("message")}
                error={errors.message}
              />
              <Button type="submit" block disabled={!email}>
                Send message <Icon name="arrowRight" size={18} />
              </Button>
              <FormNote>{hours ? `Our team is available ${hours}.` : "We usually reply within one working day."}</FormNote>
            </form>
          </FormCard>
        </Container>
      </section>

      <section className="bg-jdc-mist px-0 pb-16 pt-14 max-[720px]:pb-11 max-[720px]:pt-10" id="faq" aria-labelledby="contact-faq-title">
        <Container>
          <Reveal>
            <PageHead
              id="contact-faq-title"
              center
              title={
                <>
                  Wants to <em>know more?</em>
                </>
              }
            />
          </Reveal>
          <FaqList items={faqs} className="mx-auto my-0 max-w-[640px]" />
        </Container>
      </section>
    </PageShell>
  );
}
