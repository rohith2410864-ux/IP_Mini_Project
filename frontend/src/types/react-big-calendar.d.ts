declare module 'react-big-calendar' {
  import type { ComponentType } from 'react';

  // Minimal typings so strict TS can compile; real typings come from the library once installed.
  export const Calendar: ComponentType<Record<string, unknown>>;
  export const dateFnsLocalizer: (options: Record<string, unknown>) => unknown;
}

