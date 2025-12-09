import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../css/addstaff.css';
import { faClipboardUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function AddStaff({ isEdit = false, refreshStaffList }) {
  const navigate = useNavigate();
  const { staffID } = useParams();

  const [staffData, setStaffData] = useState({
    Fname: '',
    Lname: '',
    Address: '',
    Email: '',
    Sex: '',
    ContactNumber: '',
    Branch: '',
  });

  useEffect(() => {
    const branch = localStorage.getItem('selectedBranch');
    if (branch) {
      setStaffData((prevData) => ({
        ...prevData,
        Branch: branch,
      }));
    }
  }, []);
  
  useEffect(() => {
    if (isEdit && staffID) {
      fetch(`http://localhost:3001/staff?StaffID=${staffID}`)
        .then((response) => response.json())
        .then((data) => setStaffData(data))
        .catch((error) => console.error('Error fetching staff data:', error));
    }
  }, [isEdit, staffID]);
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStaffData({
      ...staffData,
      [name]: value,
    });
  };

  const handleBackClick = () => {
    navigate('/home/staff');
  };

  const validateForm = () => {
    const { Fname, Lname, Address, Email, Sex, ContactNumber, Branch } = staffData;
    const phonePattern = /^[0-9]{11}$/;

    if (!Fname || !Lname || !Address || !Email || !Sex || !ContactNumber || !Branch) {
      alert('Please fill out all required fields.');
      return false;
    }

    if (!Email.includes('@gmail.com')) {
      alert('Please enter a valid Gmail address.');
      return false;
    }

    if (!phonePattern.test(ContactNumber)) {
      alert('Please input a correct phone number.');
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const url = isEdit
      ? 'http://localhost:3001/updatestaff'
      : 'http://localhost:3001/addstaff';

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(staffData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          alert(data.message);
          if (typeof refreshStaffList === 'function') {
            refreshStaffList();
          }
          navigate('/home/staff');
        } else {
          alert(data.error || 'An error occurred');
        }
      })
      .catch((error) => {
        console.error('There was an error saving the staff!', error);
      });
  };

  return (
    <div className="page-container">
      <div className="header-container">
        <button className="back-button" onClick={handleBackClick}>
          &lt; Back
        </button>
        <h1>
          {isEdit ? 'Edit Staff' : 'Add a New Staff'}
          <FontAwesomeIcon icon={faClipboardUser} className="icon-add" beat />
        </h1>
        <span className="new-staff-title">
          {isEdit ? 'Edit staff details' : 'Create account for a new staff'}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="form-background">
        <div className="form-container">
          <div className="scrollable-section">
            <div className="input-group input-two-column">
              <div className="input-item">
                <label className="input-label">First Name</label>
                <input
                  type="text"
                  name="Fname"
                  placeholder="Enter first name"
                  className="input-field"
                  value={staffData.Fname}
                  onChange={handleInputChange}
                />
              </div>
              <div className="input-item">
                <label className="input-label">Last Name</label>
                <input
                  type="text"
                  name="Lname"
                  placeholder="Enter last name"
                  className="input-field"
                  value={staffData.Lname}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Address</label>
              <input
                type="text"
                name="Address"
                placeholder="Enter Address"
                className="input-field"
                value={staffData.Address}
                onChange={handleInputChange}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input
                type="email"
                name="Email"
                placeholder="Enter Email Address"
                className="input-field"
                value={staffData.Email}
                onChange={handleInputChange}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Gender</label>
              <select
                name="Sex"
                className="input-field"
                value={staffData.Sex}
                onChange={handleInputChange}
              >
                <option value="" disabled>
                  Select
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Phone Number</label>
              <input
                type="tel"
                name="ContactNumber"
                placeholder="Enter phone number"
                className="input-field"
                value={staffData.ContactNumber}
                onChange={handleInputChange}
                pattern="[0-9]*"
                maxLength="11"
              />
            </div>

            {/* Branch Input */}
            <div className="input-group">
              <label className="input-label">Branch</label>
              <input
                type="text"
                name="Branch"
                placeholder="Enter Branch"
                className="input-field"
                value={staffData.Branch}
                onChange={handleInputChange}
                readOnly={!!localStorage.getItem('selectedBranch')}
              />
            </div>
          </div>
        </div>

        <button className="submit-add-button" type="submit">
          {isEdit ? 'Save Changes' : 'Add Staff'}
        </button>
      </form>
    </div>
  );
}

export default AddStaff;