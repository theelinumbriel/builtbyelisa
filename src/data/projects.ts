// single source of truth for the portfolio grid.
// `href` null + `soon:true`  -> renders as an underlined word, no link
// `href` set                 -> renders as a real link (internal or external)
// `plain:true`               -> not underlined at all

export interface Project {
  name: string;
  href?: string | null;
  external?: boolean;
  soon?: boolean;
  plain?: boolean;
  /** optional details note, revealed on click */
  rationale?: string;
}

export const projects: Project[] = [
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

export const workInProgress: Project[] = [
  {
    name: 'closed loop auditory stimulation via frontal electrode data',
    href: '/portfolio/closed-loop-auditory-stimulation',
  },
  {
    name: 'on the evolution of private property',
    href: '/portfolio/evolution-of-private-property',
  },
];
