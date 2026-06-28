import { getCurrentYear } from "@/utils/getCurrentYear";
import { getLocalTimeZone } from "@/utils/getLocalTimeZone";
import { getPersonsCurrentStatus } from "@/utils/getPersonsCurrentStatus";

const userLocation = getLocalTimeZone() || "Asia/Tokyo";
//WARNING: Following used for metaData: Don't add for title, description, baseURL, path, image
//NOTE: keep the structure as close to content.tsx as possible
// Keys (except person.languages) wrapped in arrays are used for ReactNode parameters or functions
const en = {
  loading: [
    "Did you know waiting causes time to pass",
    "The English word 'water' is different in the Japanese language",
    "It is impossible to open doors that are already open",
  ],
  notFound: {
    heading: "Page Not Found",
    text: "The page you are looking for does not exist.",
    link: "Return Home",
  },
  person: {
    workplace: "Accenture",
    languages: ["English", "Japanese"],
    learningLanguages: [
      {
        language: "Malay",
        description: "Conversational",
      },
      {
        language: "Mandarin",
        description: "Limited proficiency",
      },
      {
        language: "German",
        description: "Limited to reading",
      },
    ],
    role: "Frontend Developer",
    technologies: {
      category: {
        professional: "professional",
        hobby: "hobby",
      },
    },
    currentStatus: getPersonsCurrentStatus(userLocation, "en"),
  },
  //NOTE: this still exists in content.ts and is used to determine the length
  //TODO: in the future just use this to determine the length
  headerHoverCardDetails: [
    `Based in ${userLocation}`,
    `Working at Accenture`,
    `Currently ${getPersonsCurrentStatus(userLocation, "en")}`,
  ],
  headerDate: {
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  },
  home: {
    code: `// To visit the About page, type this in your browser console:\nwindow.location.href = '/about';`,
    headline: ["Samuel Wai Weng Yong", "'s", "Portfolio", `${getCurrentYear("en")}`],
    subline: ["Created by"],
    projects: "Projects",
  },
  about: {
    label: "About",
    intro: {
      title: "Introduction",
      description: `Professional Frontend Developer specialized in React and TypeScript.
      Hobbyist Backend Developer and Rust, Golang, NIXOS enjoyer.`,
    },
    work: {
      title: "Work Experience",
      subtitle: "Frontend Developer",
      //? For TrueFocus component, the blurred text will always show this, while when focused shows "Title"
      subtitleBlur: "Backend",
      experiences: [
        {
          company: "Accenture",
          timeframe: "2023 - Present",
          role: "Frontend Developer",
          achievements: [
            `<>
                  <b>Unified a fragmented ecosystem</b> of legacy tools (Excel,
                  PowerPoint, and Sharepoint docs) into a single, standardized
                  platform, creating a <q>single source of truth</q> for enterprise
                  workflows.
                </>`,
            `<>
                  <b>Developed interactive visual builders</b>, including an SAP
                  component canvas and a design-flow engine, allowing users to build
                  and test enterprise applications through a drag-and-drop interface.
                </>`,
            `<>
                  <b>
                    Engineered an <q>App-Wide Intelligence</q> layer
                  </b>{" "}
                  that enables the platform to automatically read, update, and
                  refactor data across the entire web application to ensure
                  consistency.
                </>`,
            `<>
                  <b>Transformed the Developer Experience (DX)</b> by replacing slow,
                  manual documentation processes with automated tools, significantly
                  reducing project delivery times and operational costs.
                </>`,
          ],
          images: [
            {
              alt: "Once UI Project",
            },
          ],
        },
        {
          company: "Timewitch",
          timeframe: "2023",
          role: "Fullstack intern",
          achievements: [
            `<>
                  Developed a design system that unified the brand across multiple
                  platforms, improving design consistency by 40%.
                </>
                `,
          ],
          images: [],
        },
      ],
    },
    studies: {
      title: "Education",
      institutions: [
        {
          name: "University of Sydney",
          description: "Majored in Classical Piano, minored in Fullstack Web Development",
          title: "Bachelor of Arts",
        },
      ],
    },
  },
  work: {
    label: "Work",
  },
  blog: {
    label: "Blog",
  },
  achievements: {
    label: "Achievements",
  },
  gallery: {
    label: "Gallery",
  },
} as const;
export default en;
