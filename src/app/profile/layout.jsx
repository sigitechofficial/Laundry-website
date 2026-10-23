// The profile page is a client component, so its metadata lives here.
export const metadata = {
  title: "My account | Just Dry Cleans",
  description: "Manage your details, orders and notifications.",
  robots: { index: false },
};

export default function ProfileLayout({ children }) {
  return children;
}
