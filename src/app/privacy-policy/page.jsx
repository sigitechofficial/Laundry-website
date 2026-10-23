import LegalPage from "../../../components/ds/LegalPage";

// Previous layout: see git history (before the 2026 redesign)

export const metadata = {
  title: "Privacy Policy | Just Dry Cleaners",
  description:
    "Read the Just Dry Cleaners privacy policy to understand how we collect, use and protect your personal data.",
};

const sections = [
  {
    heading: "1. Who we are",
    body: `Just Dry Cleaners ("we", "us", "our") operates the website www.justdrycleans.com and the associated mobile applications. We are committed to protecting your personal information and being transparent about how we use it. If you have any questions about this policy, please contact us at privacy@justdrycleans.com.`,
  },
  {
    heading: "2. Information we collect",
    body: `We may collect the following types of personal information when you use our services:
• Identity & contact data – name, email address, phone number and billing address.
• Account credentials – encrypted password and authentication tokens.
• Order & transaction data – service selections, collection/delivery addresses, payment confirmations and order history.
• Device & usage data – IP address, browser type, pages visited, timestamps and referring URLs, collected automatically via cookies and similar technologies.
• Location data – approximate or precise location (with your consent) to calculate available zones and delivery charges.`,
  },
  {
    heading: "3. How we use your information",
    body: `We use your personal data to:
• Process and fulfil your laundry and dry-cleaning orders.
• Send booking confirmations, status updates and invoices.
• Respond to customer-service enquiries.
• Personalise your experience and remember your preferences.
• Improve and develop our platform through aggregated analytics.
• Comply with legal and regulatory obligations.
• Send marketing communications where you have opted in (you can unsubscribe at any time).`,
  },
  {
    heading: "4. Legal bases for processing",
    body: `We process your data on the following legal grounds under UK/EU data-protection law:
• Contract – processing necessary to deliver the services you have requested.
• Legitimate interests – fraud prevention, security monitoring and analytics (balanced against your rights).
• Consent – marketing emails and precise location data.
• Legal obligation – tax records, dispute resolution and law-enforcement requests.`,
  },
  {
    heading: "5. Sharing your information",
    body: `We do not sell your personal data. We may share it with:
• Cleaning partners who fulfil your orders (under confidentiality agreements).
• Payment processors (e.g. Stripe) to handle transactions securely.
• Cloud infrastructure providers who host our platform.
• Analytics and communications services used to operate and improve our product.
• Law-enforcement or regulatory authorities where required by applicable law.
All third-party processors are bound by data-processing agreements and may only use your data for specified purposes.`,
  },
  {
    heading: "6. Cookies",
    body: `We use cookies and similar tracking technologies to provide core site functionality, remember your session, and analyse traffic. You can control non-essential cookies through your browser settings or our cookie-preference centre. Blocking certain cookies may affect your ability to use some features of our site.`,
  },
  {
    heading: "7. Data retention",
    body: `We retain your personal data for as long as necessary to fulfil the purposes described in this policy, including for legal, tax and accounting requirements. Account data is typically retained for the duration of your account plus six years thereafter. You can request deletion at any time (see Section 9).`,
  },
  {
    heading: "8. International transfers",
    body: `Your data may be transferred to and processed in countries outside the UK or EEA. Where we do so, we ensure appropriate safeguards are in place (e.g. Standard Contractual Clauses approved by the relevant authority).`,
  },
  {
    heading: "9. Your rights",
    body: `Depending on your location, you may have the right to:
• Access the personal data we hold about you.
• Correct inaccurate or incomplete data.
• Request erasure ("right to be forgotten") where no overriding legitimate interest exists.
• Restrict or object to certain processing activities.
• Receive your data in a portable, machine-readable format.
• Withdraw consent at any time (without affecting prior processing).
To exercise any of these rights, please email privacy@justdrycleans.com. We will respond within 30 days.`,
  },
  {
    heading: "10. Security",
    body: `We implement industry-standard technical and organisational measures—including TLS encryption in transit, encrypted password storage and role-based access controls—to protect your data from unauthorised access, loss or disclosure.`,
  },
  {
    heading: "11. Changes to this policy",
    body: `We may update this Privacy Policy from time to time. We will notify you of material changes by email or by a prominent notice on our website at least 14 days before the change takes effect.`,
  },
  {
    heading: "12. Contact us",
    body: `If you have questions or concerns about this policy or our data practices, please contact our Data Protection Officer at:\n\nJust Dry Cleaners\nprivacy@justdrycleans.com`,
  },
];

export default function Page() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="April 2025"
      intro="We value your privacy and are committed to handling your personal data with care. Please read this policy carefully."
      sections={sections}
    />
  );
}
