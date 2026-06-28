/** eslint-disable @next/next/no-img-element */
"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { useOutsideClick } from "@/utils/useOutsideClick";

export function ExpandableProjectCardGrid() {
  const [active, setActive] = useState<(typeof cards)[number] | boolean | null>(null);
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(false);
      }
    }

    if (active && typeof active === "object") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  return (
    <>
      <AnimatePresence>
        {active && typeof active === "object" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // className="fixed inset-0 bg-black/20 h-full w-full z-10"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.2)",
              height: "100%",
              width: "100%",
              zIndex: 10,
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && typeof active === "object" ? (
          <div
            style={{
              position: "fixed",
              inset: 0,
              display: "grid",
              placeItems: "center",
              zIndex: 100,
            }}
            // className="fixed inset-0  grid place-items-center z-[100]"
          >
            <motion.button
              key={`button-${active.title}-${id}`}
              layout
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
                transition: {
                  duration: 0.05,
                },
              }}
              style={{
                display: "flex",
                position: "absolute",
                top: "0.5rem",
                right: "0.5rem",
                alignItems: "center",
                justifyContent: "center",
                background: "#fff",
                borderRadius: "9999px",
                height: "1.5rem",
                width: "1.5rem",
              }}
              // className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              // className="w-full max-w-[500px]  h-full md:h-fit md:max-h-[90%]  flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden"
              style={{
                width: "100%",
                maxWidth: "500px",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                background: "#fff",
                borderRadius: "1.5rem",
                overflow: "hidden",
                maxHeight: "90%",
              }}
            >
              <motion.div layoutId={`image-${active.title}-${id}`}>
                <img
                  width={200}
                  height={200}
                  src={active.src}
                  alt={active.title}
                  style={{
                    width: "100%",
                    height: "20rem",
                    objectFit: "cover",
                    objectPosition: "top",
                    borderTopLeftRadius: "0.5rem",
                    borderTopRightRadius: "0.5rem",
                  }}
                  // className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
                />
              </motion.div>

              <div>
                <div
                  // className="flex justify-between items-start p-4"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    padding: "1rem",
                  }}
                >
                  <div className="">
                    <motion.h3
                      layoutId={`title-${active.title}-${id}`}
                      style={{
                        fontWeight: 500,
                        color: "#404040",
                        fontSize: "1rem",
                      }}
                      // className="font-medium text-neutral-700 dark:text-neutral-200 text-base"
                    >
                      {active.title}
                    </motion.h3>
                    <motion.p
                      layoutId={`description-${active.description}-${id}`}
                      style={{
                        color: "#525252",
                        fontSize: "1rem",
                      }}
                      // className="text-neutral-600 dark:text-neutral-400 text-base"
                    >
                      {active.description}
                    </motion.p>
                  </div>

                  <motion.a
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    href={active.ctaLink}
                    target="_blank"
                    style={{
                      padding: "0.75rem 1rem",
                      fontSize: "0.875rem",
                      borderRadius: "9999px",
                      fontWeight: "bold",
                      background: "#22c55e",
                      color: "#fff",
                      textDecoration: "none",
                      display: "inline-block",
                    }}
                    rel="noopener"
                    // className="px-4 py-3 text-sm rounded-full font-bold bg-green-500 text-white"
                  >
                    {active.ctaText}
                  </motion.a>
                </div>
                <div
                  style={{
                    paddingTop: "1rem",
                    position: "relative",
                    paddingLeft: "1rem",
                    paddingRight: "1rem",
                  }}
                  // className="pt-4 relative px-4">
                >
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      color: "#525252",
                      fontSize: "0.75rem",
                      height: "10rem",
                      paddingBottom: "2.5rem",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: "1rem",
                      overflow: "auto",
                      WebkitMaskImage: "linear-gradient(to bottom, white, white, transparent)",
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                      WebkitOverflowScrolling: "touch",
                    }}
                    // className="text-neutral-600 text-xs md:text-sm lg:text-base h-40 md:h-fit pb-10 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400 [mask:linear-gradient(to_bottom,white,white,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                  >
                    {typeof active.content === "function" ? active.content() : active.content}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <ul
        style={{
          maxWidth: "42rem",
          margin: "0 auto",
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          alignItems: "start",
          gap: "1rem",
        }}
        // className="max-w-2xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 items-start gap-4"
      >
        {cards.map((card, index) => (
          <motion.div
            layoutId={`card-${card.title}-${id}`}
            key={index}
            onClick={() => setActive(card)}
            style={{
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              borderRadius: "0.75rem",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            // className="p-4 flex flex-col  hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
          >
            {/*<div className="flex gap-4 flex-col w-full">*/}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                flexDirection: "column",
                width: "100%",
              }}
            >
              <motion.div layoutId={`image-${card.title}-${id}`}>
                <img
                  width={100}
                  height={100}
                  src={card.src}
                  alt={card.title}
                  style={{
                    height: "15rem",
                    width: "100%",
                    borderRadius: "0.5rem",
                    objectFit: "cover",
                    objectPosition: "top",
                  }}
                  // className="h-60 w-full  rounded-lg object-cover object-top"
                />
              </motion.div>
              {/*<div className="flex justify-center items-center flex-col">*/}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                }}
              >
                <motion.h3
                  layoutId={`title-${card.title}-${id}`}
                  style={{
                    fontWeight: 500,
                    color: "#262626",
                    textAlign: "center",
                    fontSize: "1rem",
                  }}
                  // className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left text-base"
                >
                  {card.title}
                </motion.h3>
                <motion.p
                  layoutId={`description-${card.description}-${id}`}
                  style={{
                    color: "#525252",
                    textAlign: "center",
                    fontSize: "1rem",
                  }}
                  // className="text-neutral-600 dark:text-neutral-400 text-center md:text-left text-base"
                >
                  {card.description}
                </motion.p>
              </div>
            </div>
          </motion.div>
        ))}
      </ul>
    </>
  );
}

export const CloseIcon = () => {
  return (
    <motion.svg
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
        transition: {
          duration: 0.05,
        },
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        height: "1rem",
        width: "1rem",
        color: "#000",
      }}
      // className="h-4 w-4 text-black"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};

const cards = [
  {
    description: "Lana Del Rey",
    title: "Summertime Sadness",
    src: "https://assets.aceternity.com/demos/lana-del-rey.jpeg",
    ctaText: "Visit",
    ctaLink: "https://ui.aceternity.com/templates",
    content: () => {
      return (
        <p>
          Lana Del Rey, an iconic American singer-songwriter, is celebrated for her melancholic and
          cinematic music style. Born Elizabeth Woolridge Grant in New York City, she has captivated
          audiences worldwide with her haunting voice and introspective lyrics. <br /> <br /> Her
          songs often explore themes of tragic romance, glamour, and melancholia, drawing
          inspiration from both contemporary and vintage pop culture. With a career that has seen
          numerous critically acclaimed albums, Lana Del Rey has established herself as a unique and
          influential figure in the music industry, earning a dedicated fan base and numerous
          accolades.
        </p>
      );
    },
  },
  {
    description: "Babbu Maan",
    title: "Mitran Di Chhatri",
    src: "https://assets.aceternity.com/demos/babbu-maan.jpeg",
    ctaText: "Visit",
    ctaLink: "https://ui.aceternity.com/templates",
    content: () => {
      return (
        <p>
          Babu Maan, a legendary Punjabi singer, is renowned for his soulful voice and profound
          lyrics that resonate deeply with his audience. Born in the village of Khant Maanpur in
          Punjab, India, he has become a cultural icon in the Punjabi music industry. <br /> <br />{" "}
          His songs often reflect the struggles and triumphs of everyday life, capturing the essence
          of Punjabi culture and traditions. With a career spanning over two decades, Babu Maan has
          released numerous hit albums and singles that have garnered him a massive fan following
          both in India and abroad.
        </p>
      );
    },
  },

  {
    description: "Metallica",
    title: "For Whom The Bell Tolls",
    src: "https://assets.aceternity.com/demos/metallica.jpeg",
    ctaText: "Visit",
    ctaLink: "https://ui.aceternity.com/templates",
    content: () => {
      return (
        <p>
          Metallica, an iconic American heavy metal band, is renowned for their powerful sound and
          intense performances that resonate deeply with their audience. Formed in Los Angeles,
          California, they have become a cultural icon in the heavy metal music industry. <br />{" "}
          <br /> Their songs often reflect themes of aggression, social issues, and personal
          struggles, capturing the essence of the heavy metal genre. With a career spanning over
          four decades, Metallica has released numerous hit albums and singles that have garnered
          them a massive fan following both in the United States and abroad.
        </p>
      );
    },
  },
  {
    description: "Lord Himesh",
    title: "Aap Ka Suroor",
    src: "https://assets.aceternity.com/demos/aap-ka-suroor.jpeg",
    ctaText: "Visit",
    ctaLink: "https://ui.aceternity.com/templates",
    content: () => {
      return (
        <p>
          Himesh Reshammiya, a renowned Indian music composer, singer, and actor, is celebrated for
          his distinctive voice and innovative compositions. Born in Mumbai, India, he has become a
          prominent figure in the Bollywood music industry. <br /> <br /> His songs often feature a
          blend of contemporary and traditional Indian music, capturing the essence of modern
          Bollywood soundtracks. With a career spanning over two decades, Himesh Reshammiya has
          released numerous hit albums and singles that have garnered him a massive fan following
          both in India and abroad.
        </p>
      );
    },
  },
];
