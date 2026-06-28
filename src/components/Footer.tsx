"use client";
import {
  Row,
  IconButton,
  SmartLink,
  Text,
  Logo,
  StatusIndicator,
  Badge,
} from "@once-ui-system/core";
import { person, social } from "@/resources";
import styles from "./Footer.module.scss";

//Api
import { getGithubProfile } from "@/api/queries/getGithubProfile";
import { Suspense } from "react";

const CurrentYearText = () => {
  const currentYear = new Date().getFullYear();
  return <Text onBackground="neutral-weak">© {currentYear}</Text>;
};

export const Footer = () => {
  const {
    data: githubData,
    isLoading,
    isError,
  } = getGithubProfile(person.githubUsername);

  return (
    <Row
      suppressHydrationWarning
      as="footer"
      fillWidth
      padding="8"
      horizontal="center"
      s={{ direction: "column" }}
    >
      <Row
        className={styles.mobile}
        maxWidth="m"
        paddingY="8"
        paddingX="16"
        gap="16"
        horizontal="between"
        vertical="center"
        s={{
          direction: "column",
          horizontal: "center",
          style: { textAlign: "center" },
        }}
      >
        <Text variant="body-default-s" onBackground="neutral-strong">
          <Suspense fallback={<Text onBackground="neutral-weak">© 2026</Text>}>
            <CurrentYearText />
          </Suspense>
          <Text paddingX="4">{person.name} / KangaWorks</Text>
          <Text size="xs" onBackground="neutral-weak">
            {/* Usage of this template requires attribution. Please don't remove the link to Once UI unless you have a Pro license. */}
            Built with
            <SmartLink href="https://once-ui.com/products/magic-portfolio">
              Once UI
            </SmartLink>
          </Text>
        </Text>
        <Row gap="12" vertical="center">
          {social.map(
            (item) =>
              item.name === "GitHub" &&
              githubData &&
              !isError && (
                <Badge
                  key={item.name}
                  href={item.link}
                  icon="github"
                  id="github-followers"
                  title={`${isLoading ? "Loading..." : githubData?.followers}`}
                  effect={false}
                  arrow={false}
                  paddingX="8"
                  paddingY="4"
                >
                  <StatusIndicator color={isLoading ? "gray" : "green"} />
                </Badge>
                // <IconButton
                //   key={item.name}
                //   href={item.link}
                //   icon="github"
                //   tooltip={item.name}
                //   size="s"
                //   variant="ghost"
                //   children={<Text>{githubData?.followers}</Text>}
                // />
              ),
          )}
          {social.map(
            (item) =>
              item.link &&
              item.name !== "GitHub" && (
                <IconButton
                  key={item.name}
                  href={item.link}
                  icon={item.icon}
                  tooltip={item.name}
                  size="s"
                  variant="ghost"
                />
              ),
          )}
          <Logo
            wordmark="/trademarks/kanga-zero.svg"
            className={styles.logoDesktop}
          />
        </Row>
        <Row center hide s={{ hide: false }}>
          <Logo wordmark="/trademarks/kanga-zero.svg" />
        </Row>
      </Row>
      <Row height="80" hide s={{ hide: false }} />
    </Row>
  );
};
