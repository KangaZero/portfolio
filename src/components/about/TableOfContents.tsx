"use client";

import { Column, Flex, Text } from "@once-ui-system/core";
import type React from "react";
import { useLocale } from "@/components/LocaleProvider";
import type { TranslationKey } from "@/lib/i18n";
import styles from "./about.module.scss";

interface TableOfContentsProps {
  structure: {
    title: TranslationKey;
    display: boolean;
    items?: string[];
  }[];
  about: {
    tableOfContent: {
      display: boolean;
      subItems: boolean;
    };
  };
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ structure, about }) => {
  const { translate } = useLocale();
  const scrollTo = (id: string, offset: number) => {
    const element = document.getElementById(id);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  if (!about.tableOfContent.display) return null;

  return (
    <Column
      left="0"
      style={{
        top: "50%",
        transform: "translateY(-50%)",
        whiteSpace: "nowrap",
      }}
      position="fixed"
      paddingLeft="24"
      gap="32"
      m={{ hide: true }}
    >
      {structure
        .filter((section) => section.display)
        .map((section, sectionIndex) => (
          <Column key={sectionIndex} gap="12">
            <Flex
              cursor="interactive"
              className={styles.hover}
              gap="8"
              vertical="center"
              onClick={() => scrollTo(translate(section.title), 80)}
            >
              <Flex height="1" minWidth="16" background="neutral-strong"></Flex>
              <Text>{translate(section.title)}</Text>
            </Flex>
            {about.tableOfContent.subItems &&
              section.items &&
              section.items.map((item, itemIndex) => (
                <Flex
                  l={{ hide: true }}
                  key={itemIndex}
                  style={{ cursor: "pointer" }}
                  className={styles.hover}
                  gap="12"
                  paddingLeft="24"
                  vertical="center"
                  onClick={() => scrollTo(item, 80)}
                >
                  <Flex height="1" minWidth="8" background="neutral-strong"></Flex>
                  <Text>{item}</Text>
                </Flex>
              ))}
          </Column>
        ))}
    </Column>
  );
};

export default TableOfContents;
