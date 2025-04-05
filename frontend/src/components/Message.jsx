import React, { useState } from "react";
import { Pencil, X, Check } from "lucide-react";

const Message = ({ role, content, onEdit, onRetry }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);

  const handleSave = () => {
    setIsEditing(false);
    onEdit?.(editContent);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditContent(content);
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-2xl my-2 ${
        role === "user"
          ? "bg-blue-100 dark:bg-blue-900"
          : "bg-gray-100 dark:bg-gray-800"
      }`}
    >
      <div className="flex-grow">
        {isEditing ? (
          <>
            <textarea
              className="w-full p-2 rounded-xl bg-white dark:bg-black border border-gray-300 dark:border-gray-700 resize-none"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={Math.max(2, editContent.split("\n").length)}
            />
            <div className="flex mt-2 gap-2">
              <button
                className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-xl"
                onClick={handleSave}
              >
                <Check size={16} /> Save
              </button>
              <button
                className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-xl"
                onClick={handleCancel}
              >
                <X size={16} /> Cancel
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-start gap-2">
            <div className="flex-1 whitespace-pre-wrap">{content}</div>

            {role === "user" && (
              <button
                className="ml-2 text-sm text-blue-500 hover:underline"
                onClick={() => setIsEditing(true)}
              >
                <Pencil size={16} />
              </button>
            )}

            {onRetry && (
              <button
                onClick={onRetry}
                className="ml-2 text-sm text-blue-500 hover:underline"
              >
                ↻ Regenerate
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
