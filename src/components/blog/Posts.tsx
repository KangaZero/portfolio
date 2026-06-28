import { Grid } from "@once-ui-system/core";
import { filterAndSortPosts, getPosts } from "@/utils/mdx";
import Post from "./Post";

interface PostsProps {
  range?: [number, number?];
  columns?: "1" | "2" | "3";
  thumbnail?: boolean;
  direction?: "row" | "column";
  exclude?: string[];
}

export function Posts({
  range,
  columns = "1",
  thumbnail = false,
  exclude = [],
  direction,
}: PostsProps) {
  const displayedBlogs = filterAndSortPosts(getPosts(["src", "app", "[lang]", "blog", "posts"]), {
    range,
    exclude,
  });

  return (
    <>
      {displayedBlogs.length > 0 && (
        <Grid columns={columns} s={{ columns: 1 }} fillWidth marginBottom="40" gap="16">
          {displayedBlogs.map((post) => (
            <Post key={post.slug} post={post} thumbnail={thumbnail} direction={direction} />
          ))}
        </Grid>
      )}
    </>
  );
}
