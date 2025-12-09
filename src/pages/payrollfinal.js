import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyCheckDollar } from '@fortawesome/free-solid-svg-icons';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import '../css/payrollfinal.css';

const PayrollFinal = () => {
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const [staffData, setStaffData] = useState([]); 
    const navigate = useNavigate();

    const fetchStaffData = async () => {
        try {
            const branch = localStorage.getItem('selectedBranch');
    
            const response = await fetch(`http://localhost:3001/staff?branch=${encodeURIComponent(branch)}`);
            const data = await response.json();
    
            setStaffData(data);
        } catch (error) {
            console.error('Error fetching staff data:', error);
        }
    };
    

    useEffect(() => {
        fetchStaffData();
    }, []);

    const handleButtonClick = (StaffID, name) => {
        navigate('/home/calculatepayroll', { 
            state: { StaffID, name }  
        });
    };

    const handleProfileClick = () => {
        setDropdownVisible(!isDropdownVisible);
    };

    const handleLogout = () => {
        navigate('/');
    };

    return (
        <div className="payrollfinal-page">
            <div className="payrollfinal-container">
                <FontAwesomeIcon icon={faMoneyCheckDollar} className="icon-payrollfinal" beat />
                <h1>Payroll</h1>
                <div className="profile2-container">
                    <i className="fas fa-user profile-icon"></i>
                    <p className="profile2-label" onClick={handleProfileClick}>
                        Admin
                        <i className="fas fa-chevron-down arrow-icon"></i>
                    </p>
                    {isDropdownVisible && (
                        <div className="dropdown-menu">
                            <p className="dropdown-item" onClick={handleLogout}>
                                Logout <i className="fa-solid fa-right-from-bracket logout-icon"></i>
                            </p>
                        </div>
                    )}
                </div>

               
                
                <div className="button-payrollfinal-container">
                    {staffData.length > 0 ? (
                        staffData.map((staff, index) => (
                            <div key={index} className="button-box">
                                <div className="info-container">
                                    <p className="name">{`${staff.Fname} ${staff.Lname}`}</p>
                                    <p className="id">ID: {staff.StaffID}</p>
                                </div>
                                <button
                                    className="action-button"
                                    onClick={() => handleButtonClick(staff.StaffID, `${staff.Fname} ${staff.Lname}`)} 
                                >
                                    Payroll
                                </button>
                            </div>
                        ))
                    ) : (
                        <p>No staff available.</p>
                    )}
                </div>

                <div className="table-dtr-container">
                </div>
            </div>
        </div>
    );
};

export default PayrollFinal;
