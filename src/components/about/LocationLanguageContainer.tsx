"use client";
import { Column, HoverCard, Icon, Row, Tag, Text } from "@once-ui-system/core";
import { useLocale } from "@/components/LocaleProvider";
import type { TranslationKey } from "@/lib/i18n";
import { person } from "@/resources";

const LocationLanguageContainer = () => {
  const { translate, locale } = useLocale();
  return (
    <>
      <Row gap="8" vertical="center">
        <Icon onBackground="accent-weak" name="globe" />
        {locale === "en" ? person.location : "アジア・東京"}
      </Row>
      {person.languages && person.languages.length > 0 && (
        <>
          <Row wrap gap="8">
            {person.languages.map((_, index) => (
              <Tag key={index} size="l">
                {translate(`person.languages.${index}` as TranslationKey)}
              </Tag>
            ))}
          </Row>
          <Row wrap gap="8">
            <HoverCard
              placement="bottom"
              trigger={
                <>
                  {person.learningLanguages.map((_, index) => (
                    <Tag key={index} size="m" variant="warning">
                      {translate(`person.learningLanguages.${index}.language` as TranslationKey)}
                    </Tag>
                  ))}
                </>
              }
            >
              <Column
                padding="20"
                gap="20"
                radius="l"
                maxWidth={24}
                background="page"
                border="neutral-alpha-weak"
              >
                {person.learningLanguages.map((_, index) => (
                  <Row key={index}>
                    <Text variant="body-strong-s">
                      {translate(`person.learningLanguages.${index}.language` as TranslationKey)}
                      :&nbsp;
                    </Text>
                    <Text variant="body-default-s">
                      {translate(`person.learningLanguages.${index}.description` as TranslationKey)}
                    </Text>
                  </Row>
                ))}
              </Column>
            </HoverCard>
          </Row>
        </>
      )}
    </>
  );
};

export { LocationLanguageContainer };
