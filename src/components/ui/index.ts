/**
 * components/ui/index.ts — Barrel export for all reusable UI primitives.
 *
 * Import from "@/components/ui" for clean, single-import access:
 *   import { Button, Card, Badge, Input, Modal } from "@/components/ui"
 */

export { Button } from "./Button";
export type { ButtonProps } from "./Button";

export { Card } from "./Card";

export { Badge } from "./Badge";

export { Input, Textarea } from "./Input";
export type { InputProps, TextareaProps } from "./Input";

export { SectionHeader } from "./SectionHeader";

export { Modal } from "./Modal";
export type { ModalProps } from "./Modal";

export { EmptyState } from "./EmptyState";

export { LoadingSpinner } from "./LoadingSpinner";

export { WhatsAppButton } from "./WhatsAppButton";
