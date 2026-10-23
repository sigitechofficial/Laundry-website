/**
 * Pricing page copy. Live service names, descriptions and prices come
 * from the API; these are fallbacks and supporting text.
 */

export const PRICING_HERO = {
  titleA: "Simple prices.",
  titleB: "No surprises.",
  lead: "Every price is shown before you pay. Pick a service below.",
};

export const LIST_NOTE = "Select a service to see its prices. Collection and delivery are free.";

/** Short descriptions used when the API has none, matched on normalised name. */
export const SERVICE_BLURBS = [
  { match: ["wash & iron"], text: "Washed, then ironed and returned ready to wear." },
  { match: ["press"], text: "Already clean? We steam and press it by hand." },
  { match: ["jewish"], text: "Specialist care for Jewish dry cleaning items." },
  { match: ["leather"], text: "Specialist cleaning for leather and suede." },
  { match: ["duvet", "bulky"], text: "Duvets, pillows and other bulky items that are hard to wash at home." },
  { match: ["ski", "curtain"], text: "Technical ski wear and curtains, cleaned with care." },
  { match: ["alteration", "repair"], text: "Hems, zips, buttons and fitting by skilled tailors." },
  { match: ["dry clean"], text: "Suits, shirts, dresses and delicates, expertly cleaned, pressed and returned on hangers." },
  { match: ["wash"], text: "Everyday laundry, washed, dried and neatly folded." },
];

export const PRICING_FAQ = {
  title: "Questions about",
  titleEm: "pricing?",
  items: [
    {
      question: "Are there any hidden charges?",
      answer: "No. Any minimum order or service fee is shown at checkout, before you pay.",
    },
    {
      question: "How do I know what my items will cost?",
      answer:
        "Every item has its price on this page, so you can add up your order before you book. Your total is confirmed before you pay.",
    },
    {
      question: "What if my item is not listed?",
      answer: "Just ask. Send us a message from our contact page and we will tell you the price.",
    },
    {
      question: "Do I need to be home?",
      answer:
        "No. Leave your bag with a concierge or in a safe place and we will text you when it has been collected or delivered.",
    },
    {
      question: "How do I know if I will be charged for cancelling an order?",
      answer:
        "Before you confirm a cancellation, we always show whether a fee applies and how much it is. Nothing is charged without you seeing it first.",
    },
  ],
};
