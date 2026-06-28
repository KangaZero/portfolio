import { cacheLife } from "next/cache";
import styles from "./layout.module.scss";

const LEAF_CONFIGS = [
  { left: "8%", top: "12%", delay: "0s", cls: "mapleLeafSlow" },
  { left: "22%", top: "35%", delay: "1.2s", cls: "mapleLeafMedium" },
  { left: "45%", top: "8%", delay: "2.4s", cls: "mapleLeafFast" },
  { left: "60%", top: "55%", delay: "0.7s", cls: "mapleLeaf3D" },
  { left: "75%", top: "20%", delay: "3.1s", cls: "mapleLeafSlow" },
  { left: "33%", top: "70%", delay: "1.8s", cls: "mapleLeafMedium" },
  { left: "88%", top: "42%", delay: "4.0s", cls: "mapleLeafFast" },
  { left: "15%", top: "60%", delay: "2.0s", cls: "mapleLeaf3D" },
] as const;

const LayoutBackgroundMaple = async () => {
  "use cache";
  cacheLife("days");
  return (
    <div className="fixed inset-0 pointer-events-none z-1">
      {LEAF_CONFIGS.map((leaf, i) => (
        <div
          key={i}
          className={[styles.mapleLeaf, styles[leaf.cls]].join(" ")}
          style={{
            position: "absolute",
            fontSize: "2rem",
            opacity: 0.4,
            left: leaf.left,
            top: leaf.top,
            animationDelay: leaf.delay,
          }}
        >
          🍁
        </div>
      ))}
    </div>
  );
};

export { LayoutBackgroundMaple };
