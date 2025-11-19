import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorMessage } from './ErrorMessage.tsx';

describe('ErrorMessage', () => {
  it('should render error message', () => {
    const { container } = render(<ErrorMessage error="Test error" />);
    expect(container.textContent).toContain('Test error');
  });

  it('should render context when provided', () => {
    const { container } = render(<ErrorMessage error="Test error" context="API Error" />);
    expect(container.textContent).toContain('API Error');
  });

  it('should render default context when not provided', () => {
    const { container } = render(<ErrorMessage error="Test error" />);
    expect(container.textContent).toContain('An error occurred');
  });

  it('should render retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<ErrorMessage error="Test error" onRetry={onRetry} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.some(btn => btn.textContent?.includes('Retry'))).toBe(true);
  });

  it('should not render retry button when onRetry is not provided', () => {
    const { container } = render(<ErrorMessage error="Test error" />);
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(0);
  });

  it('should call onRetry when retry button is clicked', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorMessage error="Test error" onRetry={onRetry} />);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    await user.click(retryButton);

    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('should show admin tip for admin users', () => {
    const { container } = render(<ErrorMessage error="Test error" userRole="admin" />);
    expect(container.textContent).toContain('Admin tip');
  });

  it('should show admin tip for master users', () => {
    const { container } = render(<ErrorMessage error="Test error" userRole="master" />);
    expect(container.textContent).toContain('Admin tip');
  });

  it('should not show admin tip for regular users', () => {
    const { container } = render(<ErrorMessage error="Test error" userRole="user" />);
    expect(container.textContent).not.toContain('Admin tip');
  });

  it('should render details section when showDetails is true', () => {
    const { container } = render(<ErrorMessage error="Test error" showDetails={true} />);
    expect(container.textContent).toContain('Show details');
  });

  it('should not render details section when showDetails is false', () => {
    const { container } = render(<ErrorMessage error="Test error" showDetails={false} />);
    expect(container.textContent).not.toContain('Show details');
  });

  it('should provide API error suggestions', () => {
    const { container } = render(
      <ErrorMessage error="API key not configured" errorType="api" />
    );
    expect(container.textContent).toContain('API key');
  });

  it('should provide network error suggestions', () => {
    const { container } = render(
      <ErrorMessage error="Network timeout occurred" errorType="network" />
    );
    expect(container.textContent).toContain('internet connection');
  });

  it('should provide validation error suggestions', () => {
    const { container } = render(
      <ErrorMessage error="Invalid selection" errorType="validation" />
    );
    expect(container.textContent).toContain('verify');
  });

  it('should display appropriate icon for error type', () => {
    const { container: apiContainer } = render(
      <ErrorMessage error="API error" errorType="api" />
    );
    expect(apiContainer.querySelector('svg')).toBeTruthy();
  });

  it('should handle long error messages', () => {
    const longError = 'A'.repeat(500);
    const { container } = render(<ErrorMessage error={longError} />);
    expect(container.textContent).toContain('A'.repeat(100));
  });

  it('should be accessible with proper ARIA labels', () => {
    const { container } = render(
      <ErrorMessage error="Test error" context="Error Context" />
    );
    const heading = container.querySelector('h3');
    expect(heading).toBeTruthy();
    expect(heading?.textContent).toContain('Error Context');
  });
});
