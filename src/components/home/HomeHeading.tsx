"use client";

import "@/utils/styles/verticalText.css";
import {
  Avatar,
  Badge,
  Button,
  CodeBlock,
  Column,
  Heading,
  RevealFx,
  Row,
  Text,
} from "@once-ui-system/core";
import { useLocale } from "@/components/LocaleProvider";
import { about, home, person } from "@/resources";

const HomeHeading = () => {
  const { translate, locale } = useLocale();
  return (
    <Column paddingY="40" fillWidth horizontal="center" gap="m">
      <Column maxWidth="s" horizontal="center" align="center" position="relative">
        {home.featured.display && (
          <RevealFx
            fillWidth
            horizontal="center"
            paddingTop="16"
            paddingBottom="32"
            paddingLeft="12"
          >
            <Badge
              className="home-page-featured-badge"
              background="brand-alpha-weak"
              paddingX="12"
              paddingY="4"
              onBackground="neutral-alpha-medium"
              textVariant="label-default-s"
              arrow={false}
              href={home.featured.href}
            >
              <Row paddingY="2">{home.featured.title}</Row>
            </Badge>
          </RevealFx>
        )}
        <RevealFx
          translateY="4"
          fillWidth
          horizontal={locale === "en" ? "center" : "end"}
          paddingBottom="16"
        >
          {locale === "en" ? (
            <Heading id="home-headline" variant="display-strong-l">
              {home.headline(
                translate("home.headline.0"),
                translate("home.headline.1"),
                translate("home.headline.2"),
                translate("home.headline.3"),
              )}
            </Heading>
          ) : (
            <Row fillWidth horizontal="between" s={{ horizontal: "center" }}>
              <Column>
                <h1 className="vertical-text">{home.subline(translate("home.subline.0"), true)}</h1>
              </Column>
              <Column>
                <h1 id="home-headline" className="vertical-text">
                  {home.headline(
                    translate("home.headline.0"),
                    translate("home.headline.1"),
                    translate("home.headline.2"),
                    translate("home.headline.3"),
                  )}
                </h1>
              </Column>
            </Row>
          )}
        </RevealFx>
        {locale === "en" && (
          <RevealFx translateY="8" delay={0.2} fillWidth horizontal="center" paddingBottom="32">
            <Text wrap="balance" onBackground="neutral-weak" variant="heading-default-xl">
              {home.subline(translate("home.subline.0"))}
            </Text>
          </RevealFx>
        )}
      </Column>
      <Column horizontal="center" align="center" gap="16">
        <RevealFx paddingTop="12" delay={0.4} horizontal="center" paddingLeft="12">
          <Row s={{ hide: true }}>
            <CodeBlock
              lineNumbers={true}
              copyButton={true}
              codes={[
                {
                  code: translate("home.code"),
                  language: "typescript",
                  startLineNumber: 1,
                  highlight: "2",
                  label: "aboutMe.ts",
                },
              ]}
            />
          </Row>
        </RevealFx>
      </Column>
      <Row>
        <Button
          id="about"
          data-border="rounded"
          href={about.path}
          variant="secondary"
          size="m"
          weight="default"
          arrowIcon
        >
          <Row gap="8" vertical="center" paddingRight="4">
            {about.avatar.display && (
              <Avatar
                marginRight="8"
                style={{ marginLeft: "-0.75rem" }}
                src={person.avatar}
                size="m"
              />
            )}
            {about.title}
          </Row>
        </Button>
      </Row>
    </Column>
  );
};

export { HomeHeading };
