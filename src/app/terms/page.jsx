import React from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import HomeClientWrapper from "../../../utilities/Test";

export const metadata = {
  title: "Terms & Conditions | Just Dry Cleaners",
  description:
    "Read the Just Dry Cleaners terms and conditions that govern use of our website and services.",
};

const sections = [
  {
    heading: "1. About these terms",
    body: `These Terms and Conditions ("Terms") govern your use of the Just Dry Cleaners website (www.justdrycleans.com) and mobile applications, as well as the laundry and dry-cleaning services we provide ("Services"). By placing an order or creating an account, you agree to be bound by these Terms. If you do not agree, please do not use our Services.`,
  },
  {
    heading: "2. Our services",
    body: `Just Dry Cleaners provides collection, cleaning and delivery of garments and household textiles. Services are available in selected zones as shown on our website. We reserve the right to refuse or cancel an order at our sole discretion, including if a requested service is unavailable in your area.`,
  },
  {
    heading: "3. Placing an order",
    body: `To place an order you must:
• Be at least 18 years of age.
• Provide accurate collection and delivery addresses within a supported zone.
• Have a valid payment method on file.
By submitting an order you make an offer to purchase the Services. We accept that offer when we send you an order-confirmation email or push notification.`,
  },
  {
    heading: "4. Pricing and payment",
    body: `Prices are displayed on our pricing page and are inclusive of applicable VAT unless stated otherwise. A minimum order charge and service fee may apply; these are displayed at checkout before you confirm payment.
Payment is processed by our third-party provider (Stripe) after your cleaned items are ready for return. We do not store full card details on our servers. If a payment fails, we will notify you and may suspend future collections until the balance is resolved.`,
  },
  {
    heading: "5. Collection and delivery",
    body: `Collection and delivery times are estimates only. We will make reasonable efforts to meet agreed windows, but we are not liable for delays caused by events outside our reasonable control (e.g. traffic, severe weather, or third-party courier issues). You are responsible for ensuring someone is available at the collection/delivery address, or for providing a safe-location instruction.`,
  },
  {
    heading: "6. Care of garments",
    body: `You warrant that:
• All items submitted for cleaning are owned by you or you have authority to submit them.
• Items do not contain prohibited materials (e.g. sharp objects, cash, jewellery, illegal substances).
• You have checked care labels and flagged any known pre-existing damage before collection.
We will follow care-label instructions where legible. We are not responsible for damage arising from incorrect or missing care labels, pre-existing wear, or inherent weakness in the fabric.`,
  },
  {
    heading: "7. Lost or damaged items",
    body: `We take great care with your garments. If an item is lost or damaged due to our negligence, our liability is limited to the lesser of: (a) the verified replacement cost of the item; or (b) ten times the cleaning charge for that item, up to a maximum of £150 per item.
We are not liable for items left in pockets, damage to leather or suede, shrinkage caused by undisclosed prior alterations, or items with pre-existing damage. Claims must be raised within 48 hours of delivery.`,
  },
  {
    heading: "8. Cancellations and rescheduling",
    body: `You may cancel or reschedule a collection free of charge up to 2 hours before the scheduled collection window. Cancellations within 2 hours may be subject to a cancellation fee as shown at the time of booking. Once items have been collected, the order cannot be cancelled.`,
  },
  {
    heading: "9. Promotional codes",
    body: `Promotional codes are single-use, non-transferable and cannot be exchanged for cash. Codes may only be applied to eligible orders as specified in the promotion. We reserve the right to withdraw or amend promotions at any time.`,
  },
  {
    heading: "10. Intellectual property",
    body: `All content on our website and apps—including text, images, logos, icons and software—is owned by or licensed to Just Dry Cleaners and is protected by UK and international intellectual-property laws. You may not reproduce, distribute or create derivative works without our written consent.`,
  },
  {
    heading: "11. Limitation of liability",
    body: `To the fullest extent permitted by law, Just Dry Cleaners shall not be liable for any indirect, incidental, special or consequential losses (including loss of data, revenue or profit) arising from your use of our Services, even if we have been advised of the possibility of such losses. Our total aggregate liability to you shall not exceed the total fees paid by you in the three months preceding the event giving rise to the claim.
Nothing in these Terms limits liability for death or personal injury caused by our negligence, fraud, or any other liability that cannot be excluded by law.`,
  },
  {
    heading: "12. Governing law",
    body: `These Terms are governed by and construed in accordance with the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.`,
  },
  {
    heading: "13. Changes to these terms",
    body: `We may update these Terms from time to time. We will provide at least 14 days' notice of material changes via email or a prominent notice on our website. Continued use of our Services after that date constitutes acceptance of the revised Terms.`,
  },
  {
    heading: "14. Contact us",
    body: `If you have any questions about these Terms, please contact us at:\n\nJust Dry Cleaners\nlegal@justdrycleans.com`,
  },
];

export default function Terms() {
  return (
    <HomeClientWrapper>
      <div className="w-full relative">
        <div className="max-xl:fixed max-xl:z-50 w-full">
          <Header type="how" />
        </div>

        {/* Hero */}
        <div className="w-full bg-theme-blue px-5 md:px-[45px] pt-28 pb-16 sm:pt-36 sm:pb-20">
          <div className="max-w-[1290px] mx-auto">
            <p className="font-sf text-white/70 text-sm sm:text-base mb-2">
              Last updated: April 2025
            </p>
            <h1 className="font-youth font-bold text-4xl sm:text-5xl 2xl:text-[60px] leading-tight text-white">
              Terms &amp; Conditions
            </h1>
            <p className="font-sf text-white/80 text-base sm:text-xl mt-4 max-w-2xl">
              Please read these terms carefully before using Just Dry Cleaners
              services. They set out your rights and obligations as a customer.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="w-full px-5 md:px-[45px] py-12 sm:py-20">
          <div className="max-w-[860px] mx-auto space-y-10 font-sf">
            {sections.map((section) => (
              <div key={section.heading} className="space-y-3">
                <h2 className="font-youth font-bold text-xl sm:text-2xl text-theme-darkBlue">
                  {section.heading}
                </h2>
                <p className="text-base sm:text-lg text-black/70 leading-relaxed whitespace-pre-line">
                  {section.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Footer />
      </div>
    </HomeClientWrapper>
  );
}
