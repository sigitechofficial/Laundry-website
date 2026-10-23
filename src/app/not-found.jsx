import PageShell from "../../components/ds/PageShell";
import EmptyState from "../../components/ds/EmptyState";

// Shown for any address that doesn't exist (instead of Next.js's plain 404).
export const metadata = {
  title: "Page not found | Just Dry Cleans",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <PageShell header="solid">
      <section className="px-jdc-gutter py-16 max-[720px]:py-10">
        <div className="mx-auto max-w-[560px]">
          <EmptyState
            icon="search"
            title="We can't find that page"
            text="The link may be old or mistyped. Here are some good places to go next."
            actions={[
              { label: "Go to the home page", href: "/" },
              { label: "Help centre", href: "/help-center" },
            ]}
          />
        </div>
      </section>
    </PageShell>
  );
}
