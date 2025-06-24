'use client';

import { useState } from 'react';

interface EditKeywordModalProps {
  keyword: { id: string; keyword: string };
  onClose: () => void;
  onSave: (id: string, newKeyword: string) => void;
  isOpen: boolean;
}

export default function EditKeywordModal({ keyword, onClose, onSave, isOpen }: EditKeywordModalProps) {
  const [newKeyword, setNewKeyword] = useState(keyword.keyword);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(keyword.id, newKeyword);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Edit Keyword</h2>
        <input
          type="text"
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          className="border p-2 rounded-md w-full mb-4"
        />
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
} 