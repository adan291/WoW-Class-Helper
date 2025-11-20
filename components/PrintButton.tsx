/**
 * Print Button Component
 * Provides print-friendly mode
 */

import React from 'react';
import { printService } from '../services/printService.ts';
import { toastService } from '../services/toastService.ts';

interface PrintButtonProps {
  title: string;
  content: string;
}

export const PrintButton: React.FC<PrintButtonProps> = ({ title, content }) => {
  const handlePrint = () => {
    try {
      printService.openPrintPreview(title, content, {
        includeHeader: true,
        includeFooter: true,
        includeTimestamp: true,
        includeMetadata: true,
      });
      toastService.success('Print preview opened');
    } catch (error) {
      toastService.error('Failed to open print preview');
    }
  };

  return (
    <button
      onClick={handlePrint}
      className="p-2 hover:bg-gray-700 rounded-lg transition"
      title="Print (Ctrl+P)"
    >
      🖨️
    </button>
  );
};

export default React.memo(PrintButton);
