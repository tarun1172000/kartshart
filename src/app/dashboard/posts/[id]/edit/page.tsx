import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { Post } from "@/models/Post";
import { Category } from "@/models/Category";
import { Role } from "@/lib/constants";
import dynamic from "next/dynamic";
const PostEditor = dynamic(
  () => import("@/components/dashboard/PostEditor").then((mod) => mod.PostEditor),
  { loading: () => <div className="p-8 text-center animate-pulse">Loading Editor Core...</div> }
);

interface EditPostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const user = await requireUser();
  await connectToDatabase();

  const post = await Post.findById(id).lean();
  if (!post) {
    notFound();
  }

  // Permission check for Editors
  if (
    user.role === Role.EDITOR &&
    post.authorId.toString() !== user._id.toString()
  ) {
    redirect("/dashboard/posts");
  }

  const categories = await Category.find().select("_id name slug").lean();
  const formattedCategories = categories.map((c: any) => ({
    _id: c._id.toString(),
    name: c.name,
    slug: c.slug,
  }));

  const initialPost = {
    _id: post._id.toString(),
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    contentHtml: post.contentHtml,
    coverImageUrl: post.coverImageUrl,
    coverImageAlt: post.coverImageAlt,
    coverImageCredit: post.coverImageCredit,
    categoryId: post.categoryId.toString(),
    tags: post.tags,
    status: post.status,
    featured: post.featured,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    ogImageUrl: post.ogImageUrl,
    canonicalUrl: post.canonicalUrl,
    faq: post.faq,
    keyTakeaways: post.keyTakeaways,
    geoFocus: post.geoFocus,
    language: post.language,
    allowIndex: post.allowIndex,
  };

  return (
    <PostEditor
      initialPost={initialPost}
      categories={formattedCategories}
      userRole={user.role}
    />
  );
}
