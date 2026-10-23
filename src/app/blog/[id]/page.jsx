import BlogPostView from "../../../../components/blog/BlogPostView";

export const metadata = {
  title: "Blog | Just Dry Cleans",
  description: "Garment care tips and guides from Just Dry Cleans.",
};

export default async function Page({ params }) {
  const { id } = await params;
  return <BlogPostView id={id} />;
}
