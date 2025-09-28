// utils.ts - Fresh framework utilities

import { type Handlers, type PageProps } from "fresh";

export interface State {
  corsHeaders?: Record<string, string>;
  shared?: string;
}

export const define = {
  page: <T = unknown>(component: (props: PageProps<T, State>) => JSX.Element) => component,
  
  handlers: <T = unknown>(handlers: Handlers<T, State>) => handlers,
  
  middleware: (middleware: (ctx: any) => Promise<Response> | Response) => middleware,
};

export type { PageProps, Handlers };
