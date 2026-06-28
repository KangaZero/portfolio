import { Flex, Meta, Schema } from "@once-ui-system/core";
import type { Metadata } from "next";
import { about, achievements, baseURL, person } from "@/resources";
import AchievementsTitle from "./components/AchievementsTitle";
import AchievementsWrapper from "./components/AchievementsWrapper";
export async function generateMetadata(): Promise<Metadata> {
  return Meta.generate({
    title: achievements.title,
    description: achievements.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(achievements.title)}`,
    path: achievements.path,
  });
}

export default function Achievements() {
  return (
    <Flex direction="column" maxWidth="l">
      <Schema
        as="webPage"
        baseURL={baseURL}
        path={achievements.path}
        title={achievements.title}
        description={achievements.description}
        image={`/api/og/generate?title=${encodeURIComponent(achievements.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <AchievementsTitle />
      <AchievementsWrapper />
    </Flex>
  );
}
