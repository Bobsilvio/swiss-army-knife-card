// Test setup file
import { vi } from 'vitest';

// Mock Home Assistant globals
global.window = {
  location: { protocol: 'https:' },
  performance: {
    now: vi.fn(() => Date.now()),
  },
};

global.document = {
  createElement: vi.fn(),
  getElementById: vi.fn(),
  querySelector: vi.fn(),
  querySelectorAll: vi.fn(() => []),
};

global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn();

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock lit-element
vi.mock('lit-element', () => ({
  svg: vi.fn(),
  html: vi.fn(),
}));

// Mock lit-html directives
vi.mock('lit-html/directives/class-map', () => ({
  classMap: vi.fn(),
}));

vi.mock('lit-html/directives/style-map', () => ({
  styleMap: vi.fn(),
}));