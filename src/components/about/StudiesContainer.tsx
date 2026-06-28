"use client";
import { Badge, Column, Heading, Logo, Row, Text } from "@once-ui-system/core";
import { useLocale } from "@/components/LocaleProvider";
import type { TranslationKey } from "@/lib/i18n";
import { about } from "@/resources";

const StudiesContainer = () => {
  const { translate } = useLocale();
  return (
    <>
      <Heading
        as="h2"
        id={translate("about.studies.title")}
        variant="display-strong-s"
        marginBottom="m"
      >
        {translate("about.studies.title")}
      </Heading>
      <Column fillWidth gap="l" marginBottom="40">
        {about.studies.institutions.map((institution, index) => (
          <Column
            key={`${translate(`about.studies.institutions.${index}.name` as TranslationKey)}`}
            fillWidth
            gap="4"
          >
            <Row>
              <Text
                id={`${translate(`about.studies.institutions.${index}.name` as TranslationKey)}`}
                variant="heading-strong-l"
              >
                {translate(`about.studies.institutions.${index}.name` as TranslationKey)}
              </Text>
              <Logo style={{ marginLeft: "1rem" }} wordmark={institution.logoWordmark} />
            </Row>
            <Badge
              id={translate(`about.studies.institutions.${index}.title` as TranslationKey)}
              effect={false}
              title={translate(`about.studies.institutions.${index}.title` as TranslationKey)}
            />
            <Text variant="heading-default-xs" onBackground="neutral-weak">
              {translate(`about.studies.institutions.${index}.description` as TranslationKey)}
            </Text>
          </Column>
        ))}
      </Column>
    </>
  );
};

export { StudiesContainer };
