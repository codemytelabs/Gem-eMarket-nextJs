import { Suspense } from "react";
import Link from "next/link";
import { IBlog } from "@/types";
import Image from "next/image";

// Fetch blogs from the API
async function getBlogs() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs`, {
    cache: "no-store", // ensures fresh data on each request (SSR)
  });

  if (!res.ok) {
    throw new Error("Failed to fetch blogs");
  }

  return res.json();
}

// Loading component
function BlogsLoading() {
  return (
    <div className="px-4 py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-1/3 bg-gray-200 rounded mb-4"></div>

        <div className="flex space-x-4 overflow-x-auto hide-scrollbar">
          {[1, 2, 3, 4].map((_, idx) => (
            <div
              key={idx}
              className="min-w-[280px] max-w-xs bg-white rounded-lg shadow p-4 flex-shrink-0"
            >
              <div className="w-full h-40 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Featured blog component
function FeaturedBlog({ blog }: { blog: IBlog }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <div className="md:flex">
        <div className="md:w-1/2">
          <Image
            src={blog.images[0]}
            alt={blog.title}
            className="w-full h-64 md:h-full object-cover"
          />
        </div>
        <div className="p-6 md:w-1/2">
          <div className="flex items-center mb-2">
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              Featured
            </span>
            <span className="ml-2 text-xs text-gray-500">
              {new Date(blog.published_at).toLocaleDateString()}
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-3">{blog.title}</h2>
          <p className="text-gray-700 mb-4">{blog.excerpt}</p>
          <div className="flex items-center mb-4">
            <span className="text-sm text-gray-600">By {blog.author}</span>
            <span className="mx-2">•</span>
            <span className="text-sm text-gray-600">
              {blog.read_time} min read
            </span>
          </div>
          <div className="mb-4">
            {blog.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mr-2 mb-2"
              >
                {tag}
              </span>
            ))}
          </div>
          <Link
            href={`/blogs/${blog.id}`}
            className="text-blue-600 font-medium hover:underline"
          >
            Read more →
          </Link>
        </div>
      </div>
    </div>
  );
}

// Blog card component
function BlogCard({ blog }: { blog: IBlog }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Image
        src={blog.images[0]}
        alt={blog.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">
            {new Date(blog.published_at).toLocaleDateString()}
          </span>
          <span className="text-xs text-gray-500">
            {blog.read_time} min read
          </span>
        </div>
        <h3 className="text-lg font-semibold mb-2">{blog.title}</h3>
        <p className="text-sm text-gray-700 mb-3 line-clamp-3">
          {blog.excerpt}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">By {blog.author}</span>
          <Link
            href={`/blogs/${blog.id}`}
            className="text-blue-600 text-sm hover:underline"
          >
            Read more →
          </Link>
        </div>
      </div>
    </div>
  );
}

// Blogs listing component
async function BlogsListing() {
  try {
    const data = await getBlogs();

    if (!data || data.length === 0) {
      return (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium text-gray-600">
            No blog posts available at the moment
          </h2>
          <p className="mt-2 text-gray-500">
            Check back later for pet care tips and information!
          </p>
        </div>
      );
    }

    // Extract first blog as featured
    const featuredBlog = data[0];
    const regularBlogs = data.slice(1);

    return (
      <>
        {/* <div className="relative mb-8 overflow-hidden rounded-lg shadow-md">
          <div className="flex animate-pulse space-x-4 overflow-x-auto scroll-smooth hide-scrollbar">
            {[featuredBlog, ...regularBlogs.slice(0, 4)].map((blog, index) => (
              <div
                key={blog.id}
                className="min-w-[300px] max-w-xs bg-white rounded-lg shadow p-4 flex-shrink-0"
              >
                <Image
                  src={blog.images[0]}
                  alt={blog.title}
                  className="w-full h-40 object-cover rounded"
                />
                <h3 className="mt-3 text-lg font-semibold">{blog.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{blog.excerpt}</p>
                <Link
                  href={`/blogs/${blog.id}`}
                  className="text-blue-600 text-sm mt-2 inline-block hover:underline"
                >
                  Read more →
                </Link>
              </div>
            ))}
          </div>
        </div>
 */}
        <FeaturedBlog blog={featuredBlog} />

        <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularBlogs.map((blog: IBlog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      </>
    );
  } catch (error) {
    console.error("Error loading blogs:", error);
    return (
      <div className="text-center py-12 text-red-500">
        <h2 className="text-xl font-medium">Unable to load blog posts</h2>
        <p className="mt-2">Please try again later</p>
      </div>
    );
  }
}

// Category tabs component
function CategoryTabs() {
  const categories = [
    "All",
    "Pet Care",
    "Training",
    "Nutrition",
    "Health",
    "Adoption",
  ];

  return (
    <div className="mb-8">
      <div className="flex overflow-x-auto pb-2 hide-scrollbar">
        {categories.map((category, index) => (
          <button
            key={index}
            className={`px-4 py-2 mr-2 rounded-full text-sm whitespace-nowrap ${
              index === 0
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}

// Newsletter sign-up component
function NewsletterSignup() {
  return (
    <div className="bg-blue-50 p-6 rounded-lg shadow-md mt-12">
      <h3 className="text-xl font-bold mb-2">Subscribe to Our Newsletter</h3>
      <p className="text-gray-700 mb-4">
        Get the latest pet care tips and marketplace updates delivered to your
        inbox.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          placeholder="Your email address"
          className="flex-grow p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
          Subscribe
        </button>
      </div>
    </div>
  );
}

// Main page component
export default function BlogsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Pet Care Blog</h1>
      <p className="text-gray-600 mb-6">
        Expert advice, tips, and stories for pet owners and animal lovers
      </p>

      <CategoryTabs />

      <Suspense fallback={<BlogsLoading />}>
        <BlogsListing />
      </Suspense>

      <NewsletterSignup />
    </div>
  );
}
