import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../css/addstaff.css';
import { faClipboardUser } from '@fortawesome/free-solid-svg-icons'; // Use solid icons set
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
    StaffID: ''
  });

  // Fetch staff data if in edit mode
  useEffect(() => {
    if (isEdit && staffID) {
      fetch(`http://vynceianoani.helioho.st/getstaff.php?StaffID=${staffID}`)
        .then(response => response.json())
        .then(data => setStaffData(data))
        .catch(error => console.error('Error fetching staff data:', error));
    }
  }, [isEdit, staffID]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStaffData({
      ...staffData,
      [name]: value
    });
  };

  const handleBackClick = () => {
    navigate('/home/staff');
  };

  const validateForm = () => {
    const { Fname, Lname, Address, Email, Sex, ContactNumber } = staffData;
    const phonePattern = /^[0-9]{11}$/; // Regex to allow only numbers with exactly 11 digits
  
    if (!Fname || !Lname || !Address || !Email || !Sex || !ContactNumber) {
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

    const url = isEdit ? 'http://vynceianoani.helioho.st/editstaff.php' : 'http://vynceianoani.helioho.st/addstaff.php';
    const dataToSend = isEdit
      ? { ...staffData, StaffID: staffID }
      : staffData;

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataToSend)
    })
      .then(response => response.json())
      .then(data => {
        if (data.message) {
          alert(data.message);
          // Refresh the staff list after adding/editing a staff member
          if (typeof refreshStaffList === 'function') {
            refreshStaffList();
          }
          navigate('/home/staff');
        } else {
          alert(data.error || 'An error occurred');
        }
      })
      .catch(error => {
        console.error('There was an error saving the staff!', error);
      });
  };

  return (
    <div className="page-container">
      <div className="header-container">
        <button className="back-button" onClick={handleBackClick}>
          &lt; Back
        </button>
        <h1>{isEdit ? 'Edit Staff' : 'Add a New Staff'}
          <FontAwesomeIcon icon={faClipboardUser} className="icon-add" beat />
        </h1>
        <span className="new-staff-title">{isEdit ? 'Edit staff details' : 'Create account for a new staff'}</span>
      </div>

      <form onSubmit={handleSubmit} className="form-background">
        <div className="form-container">
          <div className="upload-section">
            <div className="background-box">
              <label className="upload-label">
                <input type="file" className="file-input" />
                <div className="upload-text">Upload photo</div>
              </label>
              <div className="upload-info">
                <p className="p1">Allowed format</p>
                <p className="p2">JPG, JPEG, and PNG</p>
                <p className="p3">Max file size</p>
                <p className="p4">2MB</p>
              </div>
            </div>
          </div>
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
                pattern="[0-9]*" // Allow only numbers
                maxLength="11" // Limit the input to 11 characters
              />
            </div>
          </div>
        </div>

        <button 
          className="submit-add-button" 
          type="submit"
        >
          {isEdit ? 'Save Changes' : 'Add Staff'}
        </button>
      </form>
    </div>
  );
}

export default AddStaff;
