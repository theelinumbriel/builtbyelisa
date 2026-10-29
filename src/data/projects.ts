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
  /** optional source repo link, rendered below the clip */
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
  /** parenthetical label after the project name */
  subtitle?: string;
  /** course code (e.g. "HEB 117") shown parenthetically in Work in Progress */
  course?: string;
  media?: ProjectMedia;
}

export const softwareProjects: Project[] = [
  {
    name: 'manual',
    href: '/portfolio/manual',
    rationale:
      'A visual input layer for building interfaces with AI. Sketch named screens on an iPad, save them to a Mac, and use the drawings as design references. Capture a working web page onto another screen to annotate the next revision.',
  },
  {
    name: 'aniso',
    href: 'https://aniso-three.vercel.app',
    external: true,
    rationale:
      'A public, read-only agent-based simulation for studying whether stable signaling conventions can emerge from initially unassigned calls under stochastic threat exposure and selection. Abstract agents encounter three threat classes and can emit a, ni, or so; the observer tracks population-level outcomes and per-agent interaction histories.',
  },
  {
    name: 'helloword',
    href: 'https://theelinumbriel.github.io/helloword/',
    external: true,
    rationale:
      'A WYSIWYG editor for Markdown. This is the synthesis of two thoughts: a - I want to actually read the markdown outputs of LLMs; b - code editors are not a nice place to do this. Helloword provides a document-style editing surface for Markdown with formatting beyond the standard spec (color, highlighting, etc.) while keeping the underlying file plain Markdown.',
  },
  {
    name: 'inline',
    href: 'https://github.com/theelinumbriel/inline',
    external: true,
    rationale:
      "A lightweight tool for editing a live page's copy in place. Add a single script (inline.js) to any page, append /edit to the URL, and click any text to edit it directly. Saving writes the change back to the source file via a small included server; alternatively, edits can be exported as JSON.",
  },
  {
    name: 'oystr',
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
    name: 'haptic output from an LLM',
    subtitle: 'a piezo disc at your model’s disposal',
    plain: true,
    rationale:
      'a piezoelectric disc plus an Arduino. through natural language in a browser window you give your model a fixed vocabulary of haptic output (length, number, rhythm of vibration) and as much context as you want, and your LLM can emit vibrations that travel over Web Serial to the board. i can imagine a use case being feedback while you present; a model follows your talk and tells you to slow down or skip ahead or check the time with a tap against your wrist.',
    media: {
      poster: '/videos/haptic-output.jpg',
      video: '/videos/haptic-output.mp4',
      alt: 'a piezoelectric disc wired to an Arduino, buzzing in response to an LLM in a browser chat window',
      repo: 'https://github.com/theelinumbriel/haptic-feedback',
    },
  },
  {
    name: 'corner of my eye',
    subtitle: 'glanceable risk levels for an LLM’s permission requests',
    plain: true,
    rationale:
      'a one-digit display updates in real time; your LLM’s lifecycle hooks drive it. it shows a spinner while the LLM is working, a blinking 1–3 when it stops for a permission request (the number corresponds to the risk level, with 3 as highest risk), and a short “u” when the turn is done.',
    media: {
      poster: '/videos/corner-of-my-eye.jpg',
      video: '/videos/corner-of-my-eye.mp4',
      alt: 'a single-digit display sitting on a desk, flashing a risk level while a chat window runs beside it',
      repo: 'https://github.com/theelinumbriel/corner-of-my-eye',
    },
  },
];

// kept for any older imports (now equivalent to the software list)
export const projects: Project[] = softwareProjects;

export const workInProgress: Project[] = [
  {
    name: 'closed loop auditory stimulation via frontal electrode data',
    href: '/portfolio/closed-loop-auditory-stimulation',
    course: 'HEB 117',
  },
  {
    name: 'on the evolution of private property',
    href: '/portfolio/evolution-of-private-property',
    course: 'MATH 242',
  },
];
