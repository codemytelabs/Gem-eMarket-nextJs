export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "GemCeylon Blog — Ceylon Gem Industry Insights",
  description:
    "Expert guides on Ceylon sapphires, rubies, cat's eye, gem buying tips, and Sri Lankan gem industry news.",
};

export default async function BlogsPage() {
  const posts = await db.blogPost.findMany({
    where: { status: "PUBLISHED" },
    include: {
      author: { select: { name: true, avatarUrl: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            GemCeylon <span className="text-blue-600">Blog</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Expert guides, gem identification tips, and Sri Lankan gem industry
            news.
          </p>
        </div>

        {posts.length === 0 && (
          <div className="text-center py-24 text-gray-500">
            No blog posts yet. Check back soon.
          </div>
        )}

        {featured && (
          <Link
            href={`/blogs/${featured.slug}`}
            className="group block mb-10 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-800 md:flex"
          >
            <div className="md:w-1/2 aspect-video relative bg-gray-100 dark:bg-gray-800">
              {featured.featuredImageUrl ? (
                <Image
                  src={featured.featuredImageUrl}
                  alt={featured.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-gray-300" />
                </div>
              )}
              <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                Featured
              </div>
            </div>
            <div className="p-6 md:w-1/2 flex flex-col justify-center">
              {featured.focusKeyword && (
                <div className="mb-3">
                  <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                    {featured.focusKeyword}
                  </span>
                </div>
              )}
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 transition-colors line-clamp-3">
                {featured.title}
              </h2>
              {featured.excerpt && (
                <p className="text-gray-500 dark:text-gray-400 mb-4 line-clamp-3">
                  {featured.excerpt}
                </p>
              )}
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span>{featured.author.name}</span>
                {featured.publishedAt && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />{" "}
                      {new Date(featured.publishedAt).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" },
                      )}
                    </span>
                  </>
                )}
              </div>
            </div>
          </Link>
        )}

        {rest.length > 0 && (
          <>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">
              Latest Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {rest.map((post) => (
                <Link
                  key={post.id}
                  href={`/blogs/${post.slug}`}
                  className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="aspect-video relative bg-gray-100 dark:bg-gray-800">
                    {post.featuredImageUrl ? (
                      <Image
                        src={post.featuredImageUrl}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
                      {post.title}
                    </p>
                    {post.excerpt && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{post.author.name}</span>
                      {post.publishedAt && (
                        <>
                          <span>·</span>
                          <span>
                            {new Date(post.publishedAt).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" },
                            )}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
