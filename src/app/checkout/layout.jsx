// Client pages: metadata lives in this layout. Private flow, not indexed.
export const metadata = {
  title: "Checkout | Just Dry Cleans",
  robots: { index: false },
};

export default function Layout({ children }) {
  return children;
}
