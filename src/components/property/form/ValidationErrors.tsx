import React from 'react';

interface ValidationErrorsProps {
  errors: Record<string, string>;
}

export function ValidationErrors({ errors }: ValidationErrorsProps) {
  if (Object.keys(errors).length === 0) return null;

  return (
    <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg">
      <ul className="list-disc list-inside">
        {Object.values(errors).map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </div>
  );
}
