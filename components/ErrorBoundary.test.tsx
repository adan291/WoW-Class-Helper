import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from './ErrorBoundary.tsx';

describe('ErrorBoundary', () => {
  it('should render children when no error occurs', () => {
    const { container } = render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );
    expect(container.textContent).toContain('Test content');
  });

  it('should display error message when error is thrown', () => {
    const ThrowError = () => {
      throw new Error('Test error message');
    };

    const { container } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(container.textContent).toContain('Something went wrong');
    expect(container.textContent).toContain('Test error message');
  });

  it('should display retry button', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('should use custom fallback when provided', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    const customFallback = (error: Error, retry: () => void) => (
      <div>
        <p>Custom error: {error.message}</p>
        <button onClick={retry}>Custom retry</button>
      </div>
    );

    const { container } = render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(container.textContent).toContain('Custom error: Test error');
    expect(screen.getByRole('button', { name: /custom retry/i })).toBeInTheDocument();
  });

  it('should display error details in expandable section', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    const { container } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(container.textContent).toContain('Error details');
  });
});
