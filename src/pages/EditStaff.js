import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/addstaff.css';

function EditStaff() {
    const { staffID } = useParams();
    const [staffData, setStaffData] = useState({
        Fname: '',
        Lname: '',
        Address: '',
        Email: '',
        Sex: '',
        ContactNumber: '',
        Branch: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchStaffData();
    }, [staffID]);

    const fetchStaffData = () => {
        fetch(`http://localhost:3001/getID?StaffID=${encodeURIComponent(staffID)}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success' && data.staff) {
                    setStaffData(data.staff);
                } else {
                    alert('Staff not found or inactive.');
                }
            })
            .catch(error => console.error('Error fetching staff data:', error));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setStaffData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const payload = {
            StaffID: staffID,
            Fname: staffData.Fname,
            Lname: staffData.Lname,
            Address: staffData.Address,
            Email: staffData.Email,
            Sex: staffData.Sex,
            ContactNumber: staffData.ContactNumber,
            Branch: staffData.Branch || localStorage.getItem('selectedBranch') || ''
        };

        fetch('http://localhost:3001/updatestaff', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    alert('Staff information updated successfully!');
                    navigate('/home/staff');
                } else {
                    alert(data.message || 'Update failed');
                    navigate('/home/staff');
                }
            })
            .catch(error => {
                console.error('Error updating staff:', error);
                alert('Error updating staff: ' + (error.message || error));
            });
    };

    return (
        <div className="page-container">
            <div className="header-container">
                <button className="back-button" onClick={() => navigate('/home/staff')}>
                    &lt; Back
                </button>
                <h1>Edit Staff </h1>
                <span className="new-staff-title">Edit staff details</span>
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
                                    onChange={handleChange}
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
                                    onChange={handleChange}
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
                                onChange={handleChange}
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
                                onChange={handleChange}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Gender</label>
                            <select
                                name="Sex"
                                className="input-field"
                                value={staffData.Sex}
                                onChange={handleChange}
                            >
                                <option value="" disabled>Select</option>
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
                                onChange={handleChange}
                                pattern="[0-9]*"
                                maxLength="11"
                            />
                        </div>
                    </div>
                </div>

                <button className="submit-add-button" type="submit">
                    Save Changes
                </button>
            </form>
        </div>
    );
}

export default EditStaff;
