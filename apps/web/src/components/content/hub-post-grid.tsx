import { Link } from "@/i18n/navigation";
import type { ContentPostCard } from "@/lib/content-posts";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  posts: ContentPostCard[];
  channel: "blog" | "news";
};

export function HubPostGrid({ posts, channel }: Props) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <li key={post.slug}>
          <Link className="block h-full" href={`/${channel}/${post.slug}`}>
            <Card className="h-full transition-colors hover:border-primary/40">
              <CardHeader>
                <CardTitle className="text-base leading-snug">{post.title}</CardTitle>
                {post.excerpt ? (
                  <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
                ) : null}
              </CardHeader>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
}
