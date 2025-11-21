import React, { useState } from 'react';

export type ValidationSeverity = 'info' | 'warning' | 'error';

interface ValidationErrorsProps {
  errors: string[];
  severity?: ValidationSeverity;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Component to display validation errors
 * Shows a list of validation errors with optional dismiss button
 */
export const ValidationErrors: React.FC<ValidationErrorsProps> = ({
  errors,
  severity = 'error',
  onDismiss,
  className = '',
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (errors.length === 0 || isDismissed) {
    return null;
  }

  const severityStyles = {
    info: 'bg-blue-900/20 border-blue-500/30 text-blue-300',
    warning: 'bg-yellow-900/20 border-yellow-500/30 text-yellow-300',
    error: 'bg-red-900/20 border-red-500/30 text-red-300',
  };

  const iconStyles = {
    info: '💡',
    warning: '⚠️',
    error: '❌',
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <div
      className={`
        validation-errors
        border rounded-lg p-4 mb-4
        ${severityStyles[severity]}
        ${className}
      `}
      role="alert"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-lg flex-shrink-0">{iconStyles[severity]}</span>
          <div className="flex-1">
            <ul className="space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="text-sm">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-lg hover:opacity-70 transition-opacity"
            aria-label="Dismiss errors"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default React.memo(ValidationErrors);
