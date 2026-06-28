import "./achievement-card.css";
import { Avatar, Card, Column, IconButton, Line, Row, Text, useToast } from "@once-ui-system/core";
import { achievementTrophyMapping } from "@/resources";
import type { Achievement, AchievementTitle } from "@/types";
import { AnimatedTooltip } from "./AnimatedTooltip";
import GlareHover from "./glare-hover";

const rarityColors = {
  common: "var(--border-color)",
  uncommon: "var(--primary-glow)",
  rare: "linear-gradient(90deg, #7c3aed 0%, #c65385 100%)",
  legendary: "linear-gradient(90deg, gold 0%, orange 100%)",
  mythic: "linear-gradient(90deg, #00c3ff 0%, #ff00cc 100%)",
};

export const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
  const { title, description, rarity, isUnlocked, image } = achievement;
  const { addToast } = useToast();
  const handleShareAchievement = async () => {
    if (!navigator?.share) {
      return addToast({
        message: "Share button is not supported on this browser",
        variant: "danger",
      });
    }

    try {
      await navigator.share({
        url: window.location.href,
        title: `I just unlocked the "${title}" achievement!`,
        text: `I have unlocked the "${title}" achievement on KangaZero's portfolio.\n
        Description:  ${description}\n
        Rarity: ${rarity}`,
      });
    } catch (error) {
      console.error("Error sharing achievement:", error);
      addToast({
        message: "An error occurred while trying to share the achievement",
        variant: "danger",
      });
    }
  };
  return (
    <Row fillWidth>
      <GlareHover isUnlocked={isUnlocked} background={rarityColors[rarity]}>
        <Card
          fillWidth
          fillHeight
          radius="l-4"
          direction="column"
          className={
            title === ("???" as AchievementTitle) || title === "Speedophile"
              ? "negative-achievement-card"
              : ""
          }
          // border="neutral-alpha-medium"
          style={{
            // background: isUnlocked
            //   ? rarityColors[rarity]
            //   : "var(--background-dark)",
            color: isUnlocked ? "var(--white)" : "var(--border-color)",
            boxShadow: isUnlocked
              ? "0 4px 24px var(--primary-glow)"
              : "0 2px 8px var(--border-color)",
            opacity: isUnlocked ? 0.9 : 0.6,
            transition: "all 0.3s cubic-bezier(.25,.8,.25,1)",
          }}
        >
          <Row fillWidth paddingX="20" paddingY="12" gap="8" vertical="center">
            {image ? (
              <Avatar size="xs" src={image.src} />
            ) : (
              <Text style={{ fontSize: "2.5em" }}>{achievementTrophyMapping[rarity]}</Text>
            )}
            <Text variant="label-default-s" style={{ fontWeight: 700 }}>
              {title}
            </Text>
          </Row>
          <Column fillWidth paddingX="20" paddingY="24" gap="8">
            <Text variant="body-default-s">{description}</Text>
            <Text onBackground="neutral-weak" variant="body-default-xs">
              {isUnlocked
                ? `Unlocked${achievement?.unlockedAt ? ` on ${new Date(achievement.unlockedAt).toLocaleDateString()}` : ""}`
                : "Locked"}
              {" · "}
              <span style={{ textTransform: "capitalize" }}>{rarity}</span>
            </Text>
          </Column>
          {isUnlocked && (
            <>
              <Line background="neutral-alpha-medium" />
              <Row
                gap="8"
                vertical="center"
                horizontal="center"
                textVariant="label-default-s"
                onBackground="neutral-medium"
                paddingY="2"
              >
                <AnimatedTooltip
                  direction="top"
                  title={"Share Achievement"}
                  description="Share your achievement with others!"
                >
                  <IconButton icon="share" variant="ghost" onPointerDown={handleShareAchievement} />
                </AnimatedTooltip>
              </Row>
            </>
          )}
        </Card>
      </GlareHover>
    </Row>
  );
};
