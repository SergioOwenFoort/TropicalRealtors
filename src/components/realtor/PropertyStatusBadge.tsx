import React from 'react';
import { Property } from '../../types';

const STATUS_STYLES = {
  actief: 'bg-green-100 text-green-800',
  concept: 'bg-gray-100 text-gray-800',
  verkocht: 'bg-blue-100 text-blue-800',
  verhuurd: 'bg-purple-100 text-purple-800',
  ingetrokken: 'bg-red-100 text-red-800'
} as const;

interface PropertyStatusBadgeProps {
  status: Property['status'];
}

export function PropertyStatusBadge({ status }: PropertyStatusBadgeProps) {
  if (!status || !(status in STATUS_STYLES)) {
    return null;
  }

  return (
    <span className={`px-3 py-1 rounded-full text-sm ${STATUS_STYLES[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
