/**
 * animations.ts — Centralized Framer Motion animation presets.
 *
 * Design Philosophy:
 * - Spring animations for organic, Apple-quality feel
 * - Consistent timing across all components
 * - whileInView for scroll-triggered reveals
 * - Stagger children for list animations
 */

import type { Variants, Transition } from "framer-motion";

// ─────────────────────────────────────────────────────────────────
// BASE TRANSITIONS
// ─────────────────────────────────────────────────────────────────

/** Smooth spring — default for most interactions */
export const springTransition: Transition = {
  type: "spring",
  stiffness: 100,
  damping: 15,
};

/** Snappy spring — for quick micro-interactions */
export const snappyTransition: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 20,
};

/** Smooth ease — for opacity/color transitions */
export const smoothTransition: Transition = {
  duration: 0.3,
  ease: [0.16, 1, 0.3, 1],
};

/** Page transition — slightly longer for dramatic reveal */
export const pageTransition: Transition = {
  duration: 0.4,
  ease: [0.16, 1, 0.3, 1],
};

// ─────────────────────────────────────────────────────────────────
// PAGE VARIANTS
// ─────────────────────────────────────────────────────────────────

/** Fade + slide up for page entry */
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: pageTransition },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

// ─────────────────────────────────────────────────────────────────
// SECTION / ELEMENT REVEAL VARIANTS (Scroll-triggered)
// ─────────────────────────────────────────────────────────────────

/** Fade up — standard section reveal */
export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

/** Fade in — pure opacity reveal */
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

/** Slide in from left */
export const slideLeftVariants: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

/** Slide in from right */
export const slideRightVariants: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

/** Scale in — for cards and modals */
export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
};

// ─────────────────────────────────────────────────────────────────
// STAGGER CONTAINER (Parent that staggers children)
// ─────────────────────────────────────────────────────────────────

/** Container that staggers child animations */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

/** Fast stagger — for dense lists */
export const fastStaggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

/** Child item for stagger containers */
export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

// ─────────────────────────────────────────────────────────────────
// HOVER ANIMATIONS (used directly in motion components)
// ─────────────────────────────────────────────────────────────────

/** Standard card hover */
export const cardHover = {
  whileHover: { y: -4, scale: 1.01 },
  transition: snappyTransition,
};

/** Button hover */
export const buttonHover = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.97 },
  transition: snappyTransition,
};

/** Icon hover */
export const iconHover = {
  whileHover: { scale: 1.15, rotate: 5 },
  transition: snappyTransition,
};

// ─────────────────────────────────────────────────────────────────
// VIEWPORT OPTIONS (for whileInView)
// ─────────────────────────────────────────────────────────────────

/** Standard viewport trigger — fire when 20% visible */
export const viewportOptions = {
  once: true,      // Only animate once (performance + UX)
  amount: 0.2,     // Trigger when 20% of element is visible
};

/** Eager viewport — fire when just entering view */
export const eagerViewportOptions = {
  once: true,
  amount: 0.05,
};
