const MEDIA = "/jdc/media";

export const HIW = {
  hero: {
    image: `${MEDIA}/hero-how-folded-stack.jpg`,
    titleA: "Laundry day,",
    titleB: "sorted.",
    lead: "Book in two minutes. We collect, clean and deliver in a one-hour window that suits you.",
    chips: [
      { icon: "clockBold", label: "One-hour windows" },
      { icon: "cameraBold", label: "Photo list at collection" },
      { icon: "navigationBold", label: "Live tracking" },
    ],
  },
  steps: {
    titleA: "From your door, to ours,",
    titleB: "and back.",
    lead: "Here is exactly what happens from the moment you book to the moment your clothes are back, fresh and ready to wear.",
    image: `${MEDIA}/71bb91bb5647.jpg`,
    imageAlt: "Freshly cleaned shirts pressed and hung",
    items: [
      {
        icon: "calendarCheck",
        title: "Book your pickup",
        body: "Choose a day and a time window that suits you. Add your postcode and we do the rest.",
        tag: "Pick your slot online",
      },
      {
        icon: "truck",
        title: "We collect",
        body: "Your driver arrives inside your window. We text you a 15-minute ETA on the day, so you are never left waiting.",
        tag: "Live 15-minute ETA",
      },
      {
        icon: "sparkle",
        title: "Cleaned by specialists",
        body: "Every item is checked for stains, loose buttons and care labels, then cleaned the right way for its fabric.",
        tag: "Checked & cleaned by hand",
      },
      {
        icon: "package",
        title: "Delivered fresh",
        body: "Steamed and pressed by hand, covered and hung, or folded by the bag, then returned in the delivery window you pick.",
        tag: "Pressed, covered & returned",
      },
    ],
  },
  track: {
    titleA: "You know where your clothes are,",
    titleB: "every step.",
    lead: "No guessing and no waiting in all evening. Here is what you get with every order.",
    checks: [
      "A photo and itemised list of everything we collect",
      "A text with a 15-minute ETA on the day",
      "Live tracking on the map, from pickup to delivery",
      "A free re-clean guarantee if you are not happy",
    ],
    image: `${MEDIA}/987c976c6aee.jpg`,
    imageAlt: "Garments covered and hung, ready for delivery",
  },
  week: {
    titleA: "Made to fit",
    titleB: "your week.",
    items: [
      {
        icon: "door",
        title: "No need to be home",
        body: "Leave your bag with a concierge or in a safe place and we will text you when it has been collected or delivered.",
      },
      {
        icon: "refresh",
        title: "Change your slot",
        body: "Reschedule from your order whenever plans change, subject to availability.",
      },
      {
        icon: "bag",
        title: "Free bags on your first visit",
        body: "Your driver brings free Just Dry Cleans bags on your first visit, ready for the next order.",
      },
    ],
  },
  start: {
    titleA: "Not sure",
    titleB: "where to start?",
    items: [
      { icon: "hanger", title: "Dry Cleaning", body: "Suits, shirts, dresses and delicates." },
      { icon: "washer", title: "Wash", body: "Everyday laundry, washed and folded." },
      { icon: "tshirt", title: "Wash & Iron", body: "Washed, ironed and ready to wear." },
    ],
  },
};
