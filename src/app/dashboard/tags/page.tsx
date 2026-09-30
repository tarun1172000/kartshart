import { requireUser } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { Tag } from "@/models/Tag";
import { Post } from "@/models/Post";
import { TagManagerClient } from "@/components/dashboard/TagManagerClient";

export default async function DashboardTagsPage() {
  await requireUser();
  await connectToDatabase();

  const tags = await Tag.find().sort({ name: 1 }).lean();

  const tagsWithCounts = await Promise.all(
    tags.map(async (t: any) => {
      const count = await Post.countDocuments({ tags: t.slug });
      return {
        _id: t._id.toString(),
        name: t.name,
        slug: t.slug,
        postCount: count,
      };
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
          Topic Tags
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage keyword labels and indexable topic clusters across articles.
        </p>
      </div>

      <TagManagerClient initialTags={tagsWithCounts} />
    </div>
  );
}
