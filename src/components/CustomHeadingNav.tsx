"use client";

import { HeadingNav, IconButton, Row } from "@once-ui-system/core";
import { useState } from "react";
import styles from "./Header.module.scss";

const CustomHeadingNav: React.FC<React.ComponentProps<typeof HeadingNav>> = (props) => {
  const [show, setShow] = useState(false);

  return (
    <div
      style={{
        position: "fixed",
        right: 25,
        top: 80,
        zIndex: 100,
        pointerEvents: "auto",
      }}
    >
      <IconButton
        icon={show ? "chevronRight" : "chevronLeft"}
        variant="ghost"
        radius="bottom-right"
        onClick={() => setShow(!show)}
      />
      <Row
        fitHeight
        className={` ${styles.menuItems} ${show ? styles.menuVisible : styles.menuHidden}`}
      >
        <HeadingNav {...props} width={13} />
      </Row>
    </div>
  );
};

export { CustomHeadingNav };
