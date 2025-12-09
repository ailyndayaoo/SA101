  import React, { useState, useEffect } from 'react';
  import axios from 'axios';
  import { useNavigate } from 'react-router-dom';
  import pic1 from '../pictures/pic1.jpg';
  import '../css/chooseBranch.css';
  import Modal from './modal';

  const ChooseBranch = () => {
    const [branches, setBranches] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
      const fetchBranches = async () => {
        try {
          const response = await axios.get('http://localhost:3001/branch');
          setBranches(response.data);
        } catch (error) {
          console.error('Error fetching branches:', error);
        }
      };

      fetchBranches();
    }, []);

    const handleBranchClick = (branchName) => {
      console.log(`${branchName} branch selected`);
      localStorage.setItem('selectedBranch', branchName); 
      navigate('/signIn', { state: { selectedBranch: branchName } });
    };
    

    const handleAddBranch = async (branchName) => {
  if (!branchName) return;

  try {
    const resp = await axios.post('http://localhost:3001/addbranch', { name: branchName });

    if (resp.data && resp.data.branch) {
      // Use the correct returned branch (with id)
      setBranches(prev => [...prev, resp.data.branch]);
    } else {
      // fallback: reload branch list
      const list = await axios.get('http://localhost:3001/branch');
      setBranches(list.data || []);
    }

  } catch (error) {
    console.error('Error adding branch:', error?.response?.data || error.message || error);
  }
};


   const handleConfirmDelete = async () => {
  if (!selectedBranch) return;

  try {
    const resp = await axios.delete('http://localhost:3001/deletebranch', {
      params: { branch: selectedBranch.name },
    });

    if (resp.data.message) {
      setBranches(branches.filter(branch => branch.name !== selectedBranch.name));
      setIsDeleteMode(false);
      setIsModalOpen(false);
    } else {
      console.error(resp.data.error || 'Delete failed');
    }
  } catch (error) {
    console.error('Error deleting branch:', error?.response?.data || error.message || error);
  }
};

    
    const handleRightClick = (e, branch) => {
      e.preventDefault();
      setSelectedBranch(branch);
      setIsDeleteMode(true); 
      setIsModalOpen(true); 
    };

    return (
      <div className="choose-branch">
        <div className="branch-buttons">
        <h4p>Payroll System for Chic Station</h4p>
          <h1>Choose Branch</h1>
          <div className="button-container">
            {branches.map((branch, index) => (
              <button
                key={index}
                onClick={() => handleBranchClick(branch.name)}
                onContextMenu={(e) => handleRightClick(e, branch)}
              >
                {branch.name}
              </button>
            ))}
          </div>
          <div className="add-branch-container">
            <button
              className="add-branch-button"
              onClick={() => {
                setIsModalOpen(true);
                setIsDeleteMode(false);
                setSelectedBranch(null); 
              }}
            >
              Add Branch
            </button>
          </div>
        </div>
        <div className="branch-image">
          <img src={pic1} alt="Branch" />
        </div>
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddBranch={handleAddBranch}
          onConfirmDelete={handleConfirmDelete}
          isDeleteMode={isDeleteMode}
          branchName={selectedBranch?.name}
        />
      </div>
    );
  };

  export default ChooseBranch;
