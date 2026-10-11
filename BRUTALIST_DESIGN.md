# Brutalist Design

## Position

This site should feel built, not dressed.

Our brutalism is not deliberate ugliness, nostalgia for an earlier web, or the absence of design. It is a commitment to directness: content first, construction made legible, interactions that say what they do, and visual decisions that earn their place. The result should be austere without being hostile and personal without becoming decorative.

The site is an authored object. Its black type, white ground, thin rules, handwritten marks, and occasional technical interventions should make that authorship visible. They should never get between a visitor and the work.

## Principles

### 1. Begin with the thing itself

Every page begins with its actual content: the project, essay, image, quotation, link, or piece of information. Structure and styling follow from what that material needs. We do not invent containers, cards, categories, or interactions simply to make a page feel more designed.

If a page remains clear as plain semantic HTML, its foundation is sound.

### 2. Let the construction show

The site should not pretend to be paper, glass, architecture, or an app. It is a collection of linked documents in a browser. Hierarchy may be expressed through sequence, spacing, type, underlines, and rules. A visitor should be able to sense how the page is organized without deciphering a visual metaphor.

The grid can be visible. Divisions can look like divisions. A list can remain a list. The underlying order is part of the aesthetic.

### 3. Use typography as the interface

Typography carries nearly all hierarchy. The default voice is Helvetica Neue, Helvetica, Arial, or the available system sans-serif. It is regular-weight, legible, and unforced. Italics, underlines, spacing, and position do more work than changes in size or weight.

Long-form text gets a readable measure and generous line height. Titles do not need to shout. Metadata is present but secondary. Authored capitalization and punctuation are preserved.

### 4. Make every interaction honest

Links look like links. Buttons look like buttons. Text that is neither should not behave as either. Underlines are functional before they are stylistic, and hover states reinforce meaning rather than reveal it for the first time.

The browser's expected behavior is part of the design: the back button works, URLs can be shared, focus can be seen, text can be selected, and content is reached by scrolling. There is no scroll-jacking, disguised click target, custom cursor, modal-first navigation, or interface that must be learned before it can be used.

### 5. Prefer the native web

Use semantic HTML before JavaScript and CSS before a component abstraction. Progressive enhancement should make an already usable page better, not make an unusable page possible. Important content and navigation should survive a script failure.

Pages should be addressable, keyboard-operable, screen-reader intelligible, and resilient across reasonable screen sizes. Small screens are a starting condition, not an edge case.

### 6. Practice controlled rawness

The primary palette is black on white, with muted gray used sparingly. One-pixel rules, exposed lists, generous blank space, and simple alignment provide structure. We favor contrast and rhythm over polish for its own sake.

Rawness is deliberate precision, not neglect. Misalignment, collision, illegibility, inaccessible contrast, and broken responsive behavior are defects—not evidence of character.

### 7. Keep the human trace

The handwritten SVGs are evidence of a person behind the site. They can name, annotate, or underline; they should not become a second ornamental language. Their color remains black, their placement restrained, and their accessible text equivalent intact.

The same test applies to any personal gesture: does it reveal authorship or clarify voice? If not, remove it.

### 8. Make decoration answerable

Decoration is permitted when it clarifies structure, establishes atmosphere specific to the work, or rewards attention without withholding information. It must remain subordinate to the page.

The baseline-grid view, title transitions, and generative glyph field are exceptions with explicit purposes. Each must respect reduced-motion preferences, avoid delaying access, and degrade cleanly. An effect that cannot explain what it contributes should not ship.

### 9. Treat performance as form

Speed is not invisible plumbing; it shapes the encounter. Pages should arrive quickly, remain stable while loading, and avoid spending a visitor's bandwidth, battery, or attention without cause.

Prefer system fonts, compact assets, static rendering, and browser capabilities. Add a dependency only when its value is greater than its weight and maintenance cost.

### 10. Edit ruthlessly

The strongest brutalist move is often subtraction. Remove the explanatory sentence when the title is enough. Remove the wrapper when spacing is enough. Remove the animation when a state change is enough. Remove the page when a direct link is enough.

The site should feel inevitable: no more interface than the material requires.

## Working Defaults

- Black text on a white ground; muted gray only for genuinely secondary information.
- One regular sans-serif voice. Use italics and underlines before adding weights or display type.
- A restrained type scale, readable leading, and a comfortable measure for prose.
- Spacing and one-pixel rules before boxes, cards, shadows, gradients, or simulated materials.
- Underlined text links and visibly bounded controls where buttons are required.
- Persistent, predictable navigation and stable, descriptive URLs.
- Content-bearing images only, with useful alternative text. Decorative images are silent to assistive technology.
- Motion is brief, optional, and disabled under `prefers-reduced-motion`.
- Long-form text remains selectable, copyable, printable, and readable without animation.
- No autoplaying media, decorative loading screen, carousel, infinite scroll, custom cursor, or hidden navigation.
- No effect whose failure prevents access to the underlying content.

## Review Questions

Before publishing a page or feature, ask:

1. What is the page for, and is that purpose immediately visible?
2. Can the content be read and navigated on a small screen and with a keyboard?
3. Are interactive elements unmistakable before interaction?
4. Does the browser's back button behave naturally?
5. Is the hierarchy carried by the content and typography rather than added containers?
6. Does every image, animation, and script contribute something specific?
7. Does the page still make sense when enhancement fails or motion is disabled?
8. Can anything be removed without losing meaning?
9. Does the result still feel unmistakably made by Elisa?

## References

- [Brutalist Websites](https://brutalistwebsites.com/) — a broad archive of visual precedents and approaches.
- [Guidelines for Brutalist Web Design](https://brutalist-web.design/) — a functional account of honest interaction, native browser behavior, accessibility, and performance.

These references are points of departure, not a style sheet. Our implementation should remain specific to the work and voice of this site.
