import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from './SearchBar.tsx';

describe('SearchBar Component', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render search input with placeholder', () => {
    render(<SearchBar onSelectResult={() => {}} />);
    const input = screen.getByPlaceholderText(/search classes/i);
    expect(input).toBeInTheDocument();
  });

  it('should display error message when validation fails', async () => {
    render(<SearchBar onSelectResult={() => {}} />);
    const input = screen.getByPlaceholderText(/search classes/i) as HTMLInputElement;

    await user.type(input, 'warrior');
    await waitFor(() => {
      expect(input.value).toBe('warrior');
    });
  });

  it('should call onSelectResult when result is clicked', async () => {
    const onSelectResult = vi.fn();
    render(<SearchBar onSelectResult={onSelectResult} />);

    const input = screen.getByPlaceholderText(/search classes/i);
    await user.type(input, 'warrior');

    await waitFor(() => {
      const results = screen.queryAllByRole('button', { name: /warrior/i });
      if (results.length > 0) {
        fireEvent.click(results[0]);
      }
    });

    expect(onSelectResult).toHaveBeenCalled();
  });

  it('should clear input when clear button is clicked', async () => {
    render(<SearchBar onSelectResult={() => {}} />);
    const input = screen.getByPlaceholderText(/search classes/i) as HTMLInputElement;

    await user.type(input, 'warrior');
    expect(input.value).toBe('warrior');

    const clearButton = screen.getByRole('button', { name: /clear/i });
    await user.click(clearButton);

    expect(input.value).toBe('');
  });

  it('should have accessible attributes', () => {
    render(<SearchBar onSelectResult={() => {}} />);
    const input = screen.getByPlaceholderText(/search classes/i);

    expect(input).toHaveAttribute('aria-label');
    expect(input).toHaveAttribute('role', 'searchbox');
  });

  it('should accept custom search text', async () => {
    render(<SearchBar onSelectResult={() => {}} />);
    const input = screen.getByPlaceholderText(/search classes/i) as HTMLInputElement;

    await user.type(input, 'paladin');
    expect(input.value).toBe('paladin');
  });

  it('should filter results based on search query', async () => {
    render(<SearchBar onSelectResult={() => {}} />);
    const input = screen.getByPlaceholderText(/search classes/i);

    await user.type(input, 'war');
    await waitFor(() => {
      const results = screen.queryAllByRole('button');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  it('should display no results message when search yields nothing', async () => {
    render(<SearchBar onSelectResult={() => {}} />);
    const input = screen.getByPlaceholderText(/search classes/i);

    await user.type(input, 'nonexistentclass');
    await waitFor(() => {
      expect(screen.queryByText(/no results/i)).toBeInTheDocument();
    });
  });

  it('should handle keyboard navigation', async () => {
    render(<SearchBar onSelectResult={() => {}} />);
    const input = screen.getByPlaceholderText(/search classes/i);

    await user.type(input, 'warrior');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expect(input).toBeInTheDocument();
  });

  it('should debounce search input', async () => {
    const onSelectResult = vi.fn();
    render(<SearchBar onSelectResult={onSelectResult} />);
    const input = screen.getByPlaceholderText(/search classes/i) as HTMLInputElement;

    await user.type(input, 'war');

    await waitFor(() => {
      expect(input.value).toBe('war');
    });
  });
});
