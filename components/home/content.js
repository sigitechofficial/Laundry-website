/**
 * Landing page content.
 *
 * Copy and imagery live here, apart from layout, so marketing can edit
 * them without touching components. Live data (services, FAQs) comes
 * from the API and these values are the fallbacks.
 *
 * Business values that are not confirmed yet are `null`. The UI leaves
 * them out instead of showing "[X]" placeholders. Fill them in before
 * launch:
 *   - FIRST_ORDER_OFFER.amount   e.g. "£10"
 *   - GUARANTEE.reportWindowDays e.g. 7
 *   - GUARANTEE.stats            real figures from order records
 */

const MEDIA = "/jdc/media";

export const HERO = {
  titleLines: ["Cleaner clothes.", "Better every day."],
  sub: "Just Dry Cleans collects, cleans and delivers your dry cleaning and laundry, in a one-hour window that suits you.",
  subShort: "Collected, cleaned and delivered, in a one-hour window that suits you.",
  poster: `${MEDIA}/8338be42a81f.jpg`,
  video: {
    hd: "https://videos.pexels.com/video-files/10558374/10558374-uhd_2732_1440_25fps.mp4",
    sd: "https://videos.pexels.com/video-files/10558374/10558374-sd_960_506_25fps.mp4",
  },
  pickupOptions: ["Tomorrow", "Today", "Choose a day"],
  benefits: [
    { icon: "truckBold", label: "Free collection & delivery", short: "Free pickup & delivery" },
    { icon: "clockBold", label: "One-hour windows", short: "1-hour windows" },
    { icon: "calendarCheckBold", label: "Turnaround to suit you", short: "Flexible turnaround" },
    { icon: "refreshBold", label: "Free re-clean guarantee", short: "Free re-clean" },
  ],
};

/**
 * Featured services shown in the bento grid. `match` lists the API
 * service names (lower case) each card stands for, so the grid can link
 * to live data and hide cards for services that are switched off.
 */
export const FEATURED_SERVICES = [
  {
    id: "dry-cleaning",
    layout: "hero",
    title: "Dry Cleaning",
    body: "Suits, shirts, dresses and delicates, expertly cleaned, pressed and returned on hangers.",
    cta: "Explore dry cleaning",
    tag: { icon: "clockBold", label: "Ready in 1 day" },
    icon: "hanger",
    image: `${MEDIA}/617af81a705b.jpg`,
    alt: "Freshly dry cleaned shirts hanging in a row",
    match: ["dry clean", "dry cleaning"],
  },
  {
    id: "wash",
    layout: "wide",
    title: "Wash",
    body: "Everyday laundry, washed, dried and neatly folded.",
    cta: "Explore wash",
    tag: { icon: "starBold", label: "Most booked" },
    icon: "washer",
    image: `${MEDIA}/0d89bb5e2011.jpg`,
    alt: "A neatly folded stack of fresh laundry",
    match: ["wash", "wash & fold", "wash and fold"],
  },
  {
    id: "wash-iron",
    layout: "tile",
    title: "Wash & Iron",
    body: "Washed and crisply ironed, ready to wear.",
    cta: "Explore",
    icon: "tshirt",
    image: `${MEDIA}/ceb681c44602.jpg`,
    alt: "A garment being pressed",
    match: ["wash & iron", "wash and iron"],
  },
  {
    id: "alteration-repair",
    layout: "tile",
    title: "Alteration & Repair",
    body: "Hems, zips, buttons and fitting by skilled tailors.",
    cta: "Explore",
    tag: { icon: "clockBold", label: "7 days" },
    icon: "needle",
    image: `${MEDIA}/81d1b96df40a.jpg`,
    alt: "Tailored jackets on hangers",
    match: ["alteration & repair", "alteration and repair", "alterations"],
  },
];

/** Icons for services outside the featured grid, keyed by normalised name. */
export const SERVICE_ICONS = [
  { match: ["press"], icon: "coat" },
  { match: ["jewish"], icon: "starOfDavid" },
  { match: ["duvet", "bulky"], icon: "bed" },
  { match: ["ski", "curtain"], icon: "snowflake" },
  { match: ["leather", "jacket", "coat"], icon: "jacket" },
  { match: ["iron"], icon: "tshirt" },
  { match: ["dry"], icon: "hanger" },
  { match: ["alter", "repair"], icon: "needle" },
  { match: ["wash"], icon: "washer" },
];

/** Used when the services API is unavailable. */
export const FALLBACK_SERVICE_NAMES = [
  "Wash",
  "Wash & Iron",
  "Dry Cleaning",
  "Press Only",
  "Alteration & Repair",
  "Jewish Drycleaning Items",
  "Duvets & Bulky Items",
  "Ski Clothes & Curtains",
  "Leather Jackets",
];

export const STUDIO = {
  titleA: "Every garment,",
  titleB: "finished by hand.",
  poster: `${MEDIA}/15888cdab31e.jpg`,
  video: {
    hd: "https://videos.pexels.com/video-files/5901661/5901661-uhd_2732_1440_25fps.mp4",
    sd: "https://videos.pexels.com/video-files/5901661/5901661-sd_960_506_25fps.mp4",
  },
  points: [
    {
      title: "Inspected by specialists",
      body: "Every item is checked for stains, loose buttons and care labels before cleaning.",
    },
    {
      title: "Gentle, modern cleaning",
      body: "Fabric-safe processes and cold washes wherever the label allows.",
    },
    {
      title: "Pressed to perfection",
      body: "Steamed and pressed by hand, then covered and hung for delivery.",
    },
  ],
};

export const FIRST_PICKUP = {
  titleA: "Your first pickup",
  titleB: "essentials.",
  lead: "No waiting in all evening and no guessing. Here is what happens on the day.",
  cta: "Schedule your first pickup",
  photo: `${MEDIA}/8338be42a81f.jpg`,
  photoAlt: "A team member hanging a freshly pressed shirt",
  photoChip: "One-hour pickup windows",
  steps: [
    {
      icon: "clock",
      title: "A one-hour window",
      body: "Your driver arrives inside the window you choose, including evenings and weekends.",
    },
    {
      icon: "chat",
      title: "A text before arrival",
      body: "We text you a 15-minute ETA on the day, so you are never left waiting.",
    },
    {
      icon: "navigation",
      title: "Live tracking",
      body: "Follow your driver on the map, then track your order until it is back at your door.",
    },
  ],
  video: {
    title: "What to expect from your first order",
    body: "A 60-second walkthrough, from pickup to delivery.",
    thumb: `${MEDIA}/ae6d8810278e.jpg`,
  },
};

export const WHY = {
  titleA: "Why you'll love",
  titleB: "Just Dry Cleans.",
  lead: "Specialist cleaning, delivered with the convenience of an app and the care of a local business.",
  tiles: [
    {
      icon: "medal",
      title: "Specialist care",
      body: "Trained hands, the right process for every fabric, and a final press before anything leaves us.",
      image: `${MEDIA}/092d222fe633.jpg`,
      alt: "A specialist pressing a garment",
    },
    {
      icon: "moonStars",
      title: "Your evenings back",
      body: "Book in two minutes, then forget about laundry until it is folded and home.",
      image: `${MEDIA}/d19e2bc25d53.jpg`,
      alt: "Neatly folded shirts stacked on a table",
    },
    {
      icon: "navigation",
      title: "Live order tracking",
      body: "Follow your driver on the map and track your order from pickup to delivery.",
      image: `${MEDIA}/71bb91bb5647.jpg`,
      alt: "Crisp white shirts hanging in soft light",
    },
    {
      icon: "leaf",
      title: "Sustainable cleaning",
      body: "Efficient machines, lower temperatures and reusable bags wherever we can.",
      image: `${MEDIA}/0cdf736a856e.jpg`,
      alt: "A row of modern washing machines",
    },
  ],
};

export const FIRST_ORDER_OFFER = {
  badge: "New customer offer",
  titleA: "Skip the",
  titleB: "launderette.",
  text: "We collect, clean and deliver to your door. Your first order just costs less.",
  perks: [
    { icon: "truck", label: "Free collection & delivery", short: "Free pickup & delivery" },
    { icon: "clock", label: "One-hour time slots" },
    { icon: "refresh", label: "Free re-clean guarantee", short: "Free re-clean" },
  ],
  cta: "Schedule your first pickup",
  terms: "New customers only. Terms apply.",
  /** Discount label, e.g. "£10". null shows the free delivery coupon instead. */
  amount: null,
};

export const MOSAIC = [
  `${MEDIA}/3f9beeba8fe0.jpg`,
  `${MEDIA}/941c3769fd6b.jpg`,
  `${MEDIA}/a99191a24372.jpg`,
  `${MEDIA}/f0f6adb5a1cc.jpg`,
  `${MEDIA}/00f939003323.jpg`,
  `${MEDIA}/987c976c6aee.jpg`,
];

export const GUARANTEE = {
  titleA: "The Just Dry",
  titleB: "Guarantee.",
  cta: "Read the guarantee",
  /** Days a customer has to report an issue. null keeps the copy general. */
  reportWindowDays: null,
  /**
   * Proof points from order records, e.g.
   * [{ value: "12,480", label: "items cleaned last month" }, ...]
   * null hides the stats row.
   */
  stats: null,
  statsNote: "Figures from our own order records, updated monthly.",
};

export const FAQ = {
  title: "Wants to know more?",
  /** Shown when the FAQ API is unavailable or empty. */
  fallback: [
    {
      question: "What if I receive a missing item?",
      answer:
        "Let us know from Support in your account. We check the itemised inventory taken at collection, trace the item with our cleaning partner and keep you updated.",
    },
    {
      question: "Can I change my pickup or delivery time after placing the order?",
      answer:
        "Yes. You can update your schedule before the pickup is completed, depending on availability.",
    },
    {
      question: "What services do you offer?",
      answer:
        "Wash, Wash & Iron, Dry Cleaning, Press Only, Alterations & Repairs, Jewish dry cleaning items, Duvets & bulky items, Ski clothes & curtains, and Leather jackets & coats.",
    },
    {
      question: "Can I update my address?",
      answer: "Yes. You can add or update multiple delivery addresses in your account.",
    },
    {
      question: "How do I know if I'll be charged for cancelling an order?",
      answer:
        "Before you confirm a cancellation, we always show whether a fee applies and how much it is. Nothing is charged without you seeing it first.",
    },
  ],
};
