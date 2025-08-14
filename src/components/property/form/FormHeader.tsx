import React from 'react';
import { Save, X, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FormHeaderProps {
  title: string;
  isAdmin: boolean;
  isRealtor?: boolean;
  isBusiness?: boolean;
  isOwner?: boolean;
  showDelete: boolean;
  onDelete: () => void;
  onSave: () => void;
}

export function FormHeader({ 
  title, 
  isAdmin, 
  isRealtor = false, 
  isBusiness = false, 
  isOwner = false, 
  showDelete, 
  onDelete, 
  onSave 
}: FormHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-8 sticky top-0 bg-gray-50 z-50 py-4">
      <h1 className="text-3xl font-bold">{title}</h1>
      <div className="flex gap-4">
        {(isAdmin || isRealtor || isBusiness || isOwner) && showDelete && (
          <button
            onClick={onDelete}
            className="px-4 py-2 text-red-600 hover:text-red-700 flex items-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            <span>Verwijderen</span>
          </button>
        )}
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          <X className="w-5 h-5" />
        </button>
        <button
          onClick={onSave}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          Opslaan
        </button>
      </div>
    </div>
  );
}
