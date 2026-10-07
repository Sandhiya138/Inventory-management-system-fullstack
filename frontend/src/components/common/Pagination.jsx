import React from 'react';
import { Button } from './Button';
import { Icon } from '../icons/Icons';

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      className={`flex items-center justify-between flex-wrap gap-4 ${className}`}
      style={{ padding: '16px 4px' }}
    >
      <div className="text-muted text-sm">
        Showing <span className="font-semibold text-primary">{startItem}</span> to{' '}
        <span className="font-semibold text-primary">{endItem}</span> of{' '}
        <span className="font-semibold text-primary">{totalItems}</span> entries
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <Icon name="chevron-left" size={14} />
          Previous
        </Button>
        <span className="text-sm font-semibold text-gold" style={{ padding: '0 8px' }}>
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
          <Icon name="chevron-right" size={14} />
        </Button>
      </div>
    </div>
  );
};
