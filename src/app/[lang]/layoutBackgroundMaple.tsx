import { cacheLife } from "next/cache";
import styles from "./layout.module.scss";

const LayoutBackgroundMaple = async () => {
  "use cache";
  cacheLife("days");
  return (
    <div className="fixed inset-0 pointer-events-none z-1">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className={[
            styles.mapleLeaf,
            i % 4 === 0
              ? styles.mapleLeafSlow
              : i % 4 === 1
                ? styles.mapleLeafMedium
                : i % 4 === 2
                  ? styles.mapleLeafFast
                  : styles.mapleLeaf3D,
          ].join(" ")}
          style={{
            position: "absolute",
            fontSize: "2rem",
            opacity: 0.4,
            // eslint-disable-next-line react-hooks/purity
            left: `${Math.random() * 75}%`,
            // eslint-disable-next-line react-hooks/purity
            top: `${Math.random() * 75}%`,
            // eslint-disable-next-line react-hooks/purity
            animationDelay: `${Math.random() * 5}s`,
          }}
        >
          🍁
        </div>
      ))}
    </div>
  );
};

export { LayoutBackgroundMaple };
