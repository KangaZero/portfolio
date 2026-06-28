"use client";
import { Button, Column, Icon, IconButton, Row } from "@once-ui-system/core";
import React from "react";
import styles from "@/components/about/about.module.scss";
import { RubyNameTitle } from "@/components/about/RubyNameTitle";
import { SkillsContainer } from "@/components/about/SkillsContainer";
import { useLocale } from "@/components/LocaleProvider";
import { about, skills, social } from "@/resources";

const IntroContainer = () => {
  const { translate, locale } = useLocale();
  return (
    <>
      <Column
        id={translate("about.intro.title") as string}
        fillWidth
        minHeight="160"
        vertical="center"
        marginBottom="32"
      >
        {about.calendar.display && (
          <Row
            fitWidth
            border="brand-alpha-medium"
            background="brand-alpha-weak"
            radius="full"
            padding="4"
            gap="8"
            marginBottom="m"
            vertical="center"
            className={styles.blockAlign}
            style={{
              backdropFilter: "blur(var(--static-space-1))",
            }}
          >
            <Icon paddingLeft="12" name="calendar" onBackground="brand-weak" />
            <Row paddingX="8">Schedule a call</Row>
            <IconButton
              href={about.calendar.link}
              data-border="rounded"
              variant="secondary"
              icon="chevronRight"
            />
          </Row>
        )}

        <RubyNameTitle />
        {social.length > 0 && (
          <Row
            className={styles.blockAlign}
            paddingTop="20"
            paddingBottom="8"
            gap="8"
            wrap
            horizontal="center"
            fitWidth
            data-border="rounded"
          >
            {social
              .filter((item) => item.essential)
              .map(
                (item) =>
                  item.link && (
                    <React.Fragment key={item.name}>
                      <Row s={{ hide: true }}>
                        <Button
                          key={item.name}
                          href={
                            item.name === "LinkedIn" && locale === "ja"
                              ? `${item.link}?locale=ja_JP`
                              : item.link
                          }
                          prefixIcon={item.icon}
                          label={item.name}
                          size="s"
                          weight="default"
                          variant="secondary"
                        />
                      </Row>
                      <Row hide s={{ hide: false }}>
                        <IconButton
                          size="l"
                          key={`${item.name}-icon`}
                          href={
                            item.name === "LinkedIn" && locale === "ja"
                              ? `${item.link}?locale=ja_JP`
                              : item.link
                          }
                          icon={item.icon}
                          variant="secondary"
                        />
                      </Row>
                    </React.Fragment>
                  ),
              )}
          </Row>
        )}
        {skills.length > 0 && (
          <Row
            className={styles.blockAlign}
            paddingTop="20"
            paddingBottom="8"
            gap="8"
            wrap
            horizontal="center"
            fitWidth
            data-border="rounded"
          >
            <SkillsContainer />
          </Row>
        )}
      </Column>

      {about.intro.display && (
        <Column textVariant="body-default-l" fillWidth gap="m" marginBottom="xl">
          {translate("about.intro.description")}
        </Column>
      )}
    </>
  );
};

export { IntroContainer };
