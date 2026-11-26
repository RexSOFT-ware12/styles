export interface Testimonial {
  quote: string;
  name: string;
  role?: string;
}

/**
 * Add REAL customer quotes here (with their permission). The homepage section
 * only appears once this list has entries.
 */
export const testimonials: Testimonial[] = [];
