import React, { useState, useEffect } from 'react';
import '../css/modal.css';

const Modal = ({ isOpen, onClose, onAddBranch, onConfirmDelete, isDeleteMode, branchName }) => {
  const [newBranchName, setNewBranchName] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (isDeleteMode) {
        setNewBranchName(branchName || '');
      } else {
        setNewBranchName('');
      }
    }
  }, [isOpen, isDeleteMode, branchName]);

  const handleAdd = () => {
    if (!newBranchName.trim()) {
      alert('Branch name cannot be empty!');
      return;
    }

    onAddBranch(newBranchName.trim());  // ← use parent function
    setNewBranchName('');
    onClose();
  };

  const handleDelete = () => {
    onConfirmDelete();
    onClose();
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
              <button onClick={handleDelete}>Yes</button>
              <button onClick={onClose}>No</button>
            </div>
          </>
        ) : (
          <>
            <h2>Add Branch</h2>
            <input
              type="text"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              placeholder="Enter branch name"
            />
            <div className="modal-buttons">
              <button onClick={handleAdd}>Add Branch</button>
              <button onClick={onClose}>Close</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Modal;
