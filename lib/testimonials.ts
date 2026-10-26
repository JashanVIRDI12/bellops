/**
 * Client quotes for the home page's proof slot, under the opening scene.
 * Add only real quotes the client has approved, word for word, one or two
 * at most. While the list is empty the slot isn't rendered at all.
 */
export type Testimonial = {
  quote: string;
  name: string;
  /** Their role, e.g. "Founder". */
  role?: string;
  company: string;
  /** Slug of the client's case study in lib/work.ts, if there is one. */
  caseStudy?: string;
};

export const testimonials: readonly Testimonial[] = [];
