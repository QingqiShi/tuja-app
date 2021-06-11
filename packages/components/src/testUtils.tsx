import { render as rtlRender, fireEvent, act } from '@testing-library/react';
import sync from 'framesync';
import { MotionConfig } from 'framer-motion';
import { ThemeProvider } from 'styled-components';
import { getTheme } from './theme';
import { defaultRect } from './hooks/useSize';

/*
 * Render with theme
 * (deprecated!)
 */

interface RenderOptions {
  theme: 'light' | 'dark';
}

export const render = (ui: React.ReactElement, options?: RenderOptions) => {
  const { theme } = options ?? {};
  const results = rtlRender(
    <ThemeProvider theme={getTheme(theme ?? 'light')}>{ui}</ThemeProvider>
  );
  return {
    ...results,
    rerender: (ui: React.ReactElement) =>
      results.rerender(
        <ThemeProvider theme={getTheme(theme ?? 'light')}>{ui}</ThemeProvider>
      ),
  };
};

/*
 * Utils for testing drag gesture.
 */

type Point = {
  x: number;
  y: number;
};

const pos: Point = {
  x: 0,
  y: 0,
};

const frame = {
  postRender: () => new Promise((resolve) => sync.postRender(resolve)),
};

export const drag = (element: any, triggerElement?: any) => {
  pos.x = 0;
  pos.y = 0;
  fireEvent.mouseDown(triggerElement || element);

  const controls = {
    to: async (x: number, y: number) => {
      pos.x = x;
      pos.y = y;

      fireEvent.mouseMove(document.body, { buttons: 1 });
      await act(async () => {
        await frame.postRender();
      });

      return controls;
    },
    end: () => {
      fireEvent.mouseUp(element);
    },
  };

  return controls;
};

export const MockDrag = ({ children }: { children: React.ReactNode }) => (
  <MotionConfig transformPagePoint={() => pos}>{children}</MotionConfig>
);

/*
 * Utils for mocking element size
 */

export const mockResizeObserver = () => {
  const listeners = new Map<
    HTMLElement,
    (entries: { contentRect: DOMRect }[]) => void
  >();

  beforeAll(() => {
    (window as any).ResizeObserver = class ResizeObserver {
      listener: (entries: { contentRect: DOMRect }[]) => void;
      constructor(ls: (entries: { contentRect: DOMRect }[]) => void) {
        this.listener = ls;
      }
      observe(el: HTMLElement) {
        listeners.set(el, this.listener);
      }
      disconnect() {}
    };
  });

  afterEach(() => {
    listeners.clear();
  });

  return (el: HTMLElement, rect: Partial<DOMRect>) => {
    act(() => {
      listeners.get(el)?.([
        {
          contentRect: {
            toJSON() {
              return JSON.stringify(this);
            },
            ...defaultRect,
            ...rect,
          },
        },
      ]);
    });
  };
};
