import {
  Column,
  ContextMenu,
  Icon,
  Line,
  Meta,
  Option,
  RevealFx,
  Schema,
} from "@once-ui-system/core";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { Metadata } from "next";
import { HomeHeading } from "@/components/home/HomeHeading";
import HomeProjectsTitle from "@/components/home/HomeProjectsTitle";
// import { Mailchimp } from "@/components";
// import { Projects } from "@/components/work/Projects";
// import { Posts } from "@/components/blog/Posts";
// import DrawingPanel from "@/components/DrawingPanel";
import MagicBento from "@/components/MagicBento";
import { about, baseURL, home, person, userSettings } from "@/resources";
// import { ExpandableProjectCardGrid } from "@/components/ui/ExpandableProjectCardGrid";

export async function generateMetadata(): Promise<Metadata> {
  return Meta.generate({
    title: home.title,
    description: home.description,
    baseURL: baseURL,
    path: home.path,
    image: home.image,
  });
}

export default function Home() {
  return (
    <ContextMenu
      placement="bottom-start"
      dropdown={
        <Column gap="2" padding="4" minWidth={10}>
          <Option
            hasPrefix={<Icon size="xs" name="edit" onBackground="neutral-weak" />}
            label="Edit"
            value="edit"
          />
          <Option
            hasPrefix={<Icon size="xs" name="copy" onBackground="neutral-weak" />}
            label="Duplicate"
            value="duplicate"
          />
          <Line marginY="2" />
          <Option
            hasPrefix={<Icon size="xs" name="delete" onBackground="danger-medium" />}
            danger
            label="Delete"
            value="delete"
          />
        </Column>
      }
    >
      <Column maxWidth="m" gap="xl" paddingY="4" horizontal="center">
        <Schema
          as="webPage"
          baseURL={baseURL}
          path={home.path}
          title={home.title}
          description={home.description}
          image={`/api/og/generate?title=${encodeURIComponent(home.title)}`}
          author={{
            name: person.name,
            url: `${baseURL}${about.path}`,
            image: `${baseURL}${person.avatar}`,
          }}
        />
        <HomeHeading />
        {/* <RevealFx translateY="16" delay={0.6}>
            <Projects range={[1, 1]} />
          </RevealFx> */}
        {/* {
          routes["/blog"] && (
              <Column fillWidth gap="24" marginBottom="l">
                <Row fillWidth paddingRight="64">
                  <Line maxWidth={48} />
                </Row>
                <Row fillWidth gap="24" marginTop="40" s={{ direction: "column" }}>
                  <Row flex={1} paddingLeft="l" paddingTop="24">
                    <Heading as="h2" variant="display-strong-xs" wrap="balance">
                      Latest from the blog
                    </Heading>
                  </Row>
                  <Row flex={3} paddingX="20">
                    <Posts range={[1, 2]} columns="2" />
                  </Row>
                </Row>
                <Row fillWidth paddingLeft="64" horizontal="end">
                  <Line maxWidth={48} />
                </Row>
              </Column>
          )
        } */}
        <RevealFx fillWidth horizontal="center">
          <HomeProjectsTitle />
        </RevealFx>
        {/* <MagicBento textAutoHide={true} disableAnimations={!userSettings.isEffectsEnabled} /> /*}
        {/*<ExpandableProjectCardGrid />*/}
        {/*<Projects range={[2]} />*/}
        {/*<Column fillWidth gap="xl">
          <Column fillWidth horizontal="center" gap="m" paddingBottom="m">
            <Heading variant="display-strong-m" wrap="balance">
              Creative Drawing Panel
            </Heading>
            <Column maxWidth={40}>
              <Text
                wrap="balance"
                onBackground="neutral-weak"
                variant="body-default-l"
              >
                Unleash your creativity with our interactive drawing panel.
                Draw, add shapes, upload images, and create stunning digital
                art.
              </Text>
            </Column>
          </Column>
          <DrawingPanel />
        </Column>*/}
        {/* <Mailchimp />  */}
      </Column>
      <ReactQueryDevtools initialIsOpen={false} />
    </ContextMenu>
  );
}
