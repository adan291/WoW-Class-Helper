import '@testing-library/jest-dom';
import { afterEach, vi, expect } from 'vitest';
import { cleanup } from '@testing-library/react';

// Make expect globally available
globalThis.expect = expect;

afterEach(() => {
  cleanup();
});

// Mock console methods to reduce noise in tests
vi.spyOn(console, 'error').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});
