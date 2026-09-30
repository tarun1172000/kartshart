import { requireUser } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { Category } from "@/models/Category";
import dynamic from "next/dynamic";
const PostEditor = dynamic(
  () => import("@/components/dashboard/PostEditor").then((mod) => mod.PostEditor),
  { loading: () => <div className="p-8 text-center animate-pulse">Loading Editor Core...</div> }
);

export default async function NewPostPage() {
  const user = await requireUser();
  await connectToDatabase();

  const categories = await Category.find().select("_id name slug").lean();
  const formattedCategories = categories.map((c: any) => ({
    _id: c._id.toString(),
    name: c.name,
    slug: c.slug,
  }));

  return (
    <PostEditor
      categories={formattedCategories}
      userRole={user.role}
    />
  );
}
