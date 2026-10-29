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
  subtitle?: string;
}

export const projects: Project[] = [
  {
    name: 'Manual',
    subtitle: 'Visual input layer for building interfaces',
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
    href: 'https://theelinumbriel.github.io/helloword/',
    external: true,
    rationale:
      'A WYSIWYG editor for Markdown. This is the synthesis of two thoughts: a - I want to actually read the markdown outputs of LLMs; b - code editors are not a nice place to do this. Helloword provides a document-style editing surface for Markdown with formatting beyond the standard spec (color, highlighting, etc.) while keeping the underlying file plain Markdown.',
  },
  {
    name: 'Inline',
    href: 'https://github.com/theelinumbriel/inline',
    external: true,
    rationale:
      "A lightweight tool for editing a live page's copy in place. Add a single script (inline.js) to any page, append /edit to the URL, and click any text to edit it directly. Saving writes the change back to the source file via a small included server; alternatively, edits can be exported as JSON.",
  },
  {
    name: 'Oystr',
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
    name: 'Closed-Loop Auditory Stimulation via Frontal Electrode Data',
    href: '/portfolio/closed-loop-auditory-stimulation',
  },
  {
    name: 'On the Evolution of Private Property',
    href: '/portfolio/evolution-of-private-property',
  },
];
