// single source of truth for the portfolio grid.
// `href` null + `soon:true`  -> renders as an underlined word, no link
// `href` set                 -> renders as a real link (internal or external)
// `plain:true`               -> not underlined at all
// hardware projects carry a `media` block for the hover-to-play clip

export interface ProjectMedia {
  /** path (public-relative, with leading slash) to the poster image */
  poster: string;
  /** path (public-relative, with leading slash) to the mp4 clip */
  video: string;
  /** alt text for the still */
  alt: string;
  /** optional caption shown under the video */
  caption?: string;
  /** optional source repo link, rendered beside the caption */
  repo?: string;
}

export interface Project {
  name: string;
  href?: string | null;
  external?: boolean;
  soon?: boolean;
  plain?: boolean;
  /** optional details note, revealed on click */
  rationale?: string;
  subtitle?: string;
  /** course code (e.g. "HEB 117") shown parenthetically in Work in Progress */
  course?: string;
  media?: ProjectMedia;
}

export const softwareProjects: Project[] = [
  {
    name: 'Manual',
    subtitle: 'Visual input layer for building with LLMs',
    href: '/portfolio/manual',
    rationale:
      "A recurring frustration that I have when building anything visual is the meaning that gets lost when I try to translate the visual I have in my mind into a natural language prompt. This aims to reduce the friction of drawing something out and uploading a screenshot or photo; use this to sketch screens on an iPad, save them to a Mac, and use them as design references for your LLM. You can also capture a working web page onto another screen to annotate the next iteration.",
  },
  {
    name: 'Aniso',
    subtitle: 'Simulation of the evolution of syntactic language',
    href: 'https://aniso-three.vercel.app',
    external: true,
    rationale:
      "One of my favorite papers in the evolutionary biology canon is Seyfarth et al.’s 1980 paper “Vervet monkey alarm calls: Semantic communication in a free-ranging primate.”\n\nThis project simulates the evolution of language by modeling the vervet monkeys in the Seyfarth paper as abstract agents that encounter three threat classes and can only emit three sounds: a, ni, or so. The goal is to study whether stable signaling conventions can emerge from initially unassigned calls under stochastic threat exposure and selection; the observer tracks population-level outcomes and per-agent interaction histories.",
  },
  {
    name: 'Helloword',
    subtitle: 'A more pleasant Markdown editor',
    href: 'https://theelinumbriel.github.io/helloword/',
    external: true,
    rationale:
      'A WYSIWYG editor for Markdown. This is the synthesis of two thoughts: a - I want to actually read the markdown outputs of LLMs; b - code editors are not a nice place to do this. Helloword provides a document-style editing surface for Markdown with formatting beyond the standard spec (color, highlighting, etc.) while keeping the underlying file plain Markdown.',
  },
  {
    name: 'Inline',
    subtitle: 'Live editing for webapps',
    href: 'https://github.com/theelinumbriel/inline',
    external: true,
    rationale:
      "A lightweight tool for editing a live page's copy in place. Add a single script (inline.js) to any page, append /edit to the URL, and click any text to edit it directly. Saving writes the change back to the source file via a small included server; alternatively, edits can be exported as JSON.",
  },
  {
    name: 'OYSTR',
    subtitle: 'Natural language to voxels',
    href: null,
    soon: true,
    plain: true,
    rationale:
      'A prototype built in Xcode using the OpenAI API to generate virtual-reality elements from natural-language prompts, for applications in gaming. Demo available on request.',
  },
  { name: 'Work at the Learning Lab', href: '/portfolio/learning-lab' },
];

export const hardwareProjects: Project[] = [
  {
    name: 'Haptic output from an LLM',
    subtitle: 'A piezo disc at your model’s disposal',
    plain: true,
    rationale:
      'A piezoelectric disc plus an Arduino. Through natural language in a browser window you give your model a fixed vocabulary of haptic output (length, number, rhythm of vibration) and as much context as you want, and your LLM can emit vibrations that travel over Web Serial to the board. I can imagine a use case being feedback while you present; a model follows your talk and tells you to slow down or skip ahead or check the time with a tap against your wrist.',
    media: {
      poster: '/videos/haptic-output.jpg',
      video: '/videos/haptic-output.mp4',
      alt: 'A piezoelectric disc wired to an Arduino, buzzing in response to an LLM in a browser chat window.',
      repo: 'https://github.com/theelinumbriel/haptic-feedback',
    },
  },
  {
    name: 'Corner of my eye',
    subtitle: 'Glanceable risk levels for an LLM’s permission requests',
    plain: true,
    rationale:
      'A one-digit display updates in real time; your LLM’s lifecycle hooks drive it. It shows a spinner while the LLM is working, a blinking 1–3 when it stops for a permission request (the number corresponds to the risk level, with 3 as highest risk), and a short “u” when the turn is done.',
    media: {
      poster: '/videos/corner-of-my-eye.jpg',
      video: '/videos/corner-of-my-eye.mp4',
      alt: 'A single-digit display sitting on a desk, flashing a risk level while a chat window runs beside it.',
      repo: 'https://github.com/theelinumbriel/corner-of-my-eye',
    },
  },
];

// kept for any older imports (now equivalent to the software list)
export const projects: Project[] = softwareProjects;

export const workInProgress: Project[] = [
  {
    name: 'Closed-Loop Auditory Stimulation via Frontal Electrode Data',
    href: '/portfolio/closed-loop-auditory-stimulation',
    course: 'HEB 117',
  },
  {
    name: 'On the Evolution of Private Property',
    href: '/portfolio/evolution-of-private-property',
    course: 'MATH 242',
  },
];
