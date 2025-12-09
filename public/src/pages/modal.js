import React, { useState } from 'react';
import '../css/modal.css';

const Modal = ({ isOpen, onClose, onAddBranch, onConfirmDelete, isDeleteMode, branchName }) => {
  const [newBranchName, setNewBranchName] = useState(branchName || '');

  const handleAddBranch = () => {
    if (newBranchName.trim()) {
      onAddBranch(newBranchName);
      setNewBranchName(''); // Clear the input field
      onClose(); // Close the modal
    }
  };

  const handleConfirmDelete = () => {
    onConfirmDelete();
    onClose(); // Close the modal
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {isDeleteMode ? (
          <>
            <h2>Are you sure you want to delete this branch?</h2>
            <p>{branchName}</p>
            <div className="modal-buttons">
              <button onClick={handleConfirmDelete}>Yes</button>
              <button onClick={onClose}>No</button>
            </div>
          </>
        ) : (
          <>
            <input
              type="text"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              placeholder="Enter branch name"
            />
            <div className="modal-buttons">
              <button onClick={handleAddBranch}>Add Branch</button>
              <button onClick={onClose}>Close</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Modal;
