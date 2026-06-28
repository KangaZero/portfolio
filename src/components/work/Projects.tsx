import { Column } from "@once-ui-system/core";
import { ProjectCard } from "@/components";
import { filterAndSortPosts, getPosts } from "@/utils/mdx";

interface ProjectsProps {
  range?: [number, number?];
  exclude?: string[];
}

export function Projects({ range, exclude }: ProjectsProps) {
  const displayedProjects = filterAndSortPosts(
    getPosts(["src", "app", "[lang]", "work", "projects"]),
    { range, exclude },
  );

  return (
    <Column fillWidth gap="xl" marginBottom="40" paddingX="l">
      {displayedProjects.map((post, index) => (
        <ProjectCard
          priority={index < 2}
          key={post.slug}
          href={`/work/${post.slug}`}
          images={post.metadata.images}
          title={post.metadata.title}
          description={post.metadata.summary}
          content={post.content}
          avatars={post.metadata.team?.map((member) => ({ src: member.avatar })) || []}
          link={post.metadata.link || ""}
        />
      ))}
    </Column>
  );
}
