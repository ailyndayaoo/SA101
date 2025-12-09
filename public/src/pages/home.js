import React, { useEffect, useState } from 'react';
import { NavLink, Route, Routes, Navigate, useNavigate, useLocation } from 'react-router-dom';
import '../css/home.css';
import pic2 from '../pictures/pic2.png';
import DTR from './dtr';
import Commission from './commission';
import Payroll from './payroll';
import AddStaff from './AddStaff';
import EditStaff from './EditStaff';
import CalculatePayroll from './calculatepayroll';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGroup, faSackDollar, faMoneyCheckDollar } from '@fortawesome/free-solid-svg-icons';

function Home() {
    const [selectedBranch, setSelectedBranch] = useState('');
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [staffList, setStaffList] = useState([]);
    const [searchQuery, setSearchQuery] = useState(''); // New state for the search query
    const navigate = useNavigate();
    const location = useLocation();

    // Fetch branch and staff data from localStorage
    useEffect(() => {
        const branch = localStorage.getItem('selectedBranch');
        if (branch) {
            setSelectedBranch(branch);
            fetchStaffData(branch); // Fetch staff data when a branch is selected
        }
    }, []);

    // Fetch staff data based on the selected branch
    const fetchStaffData = (branch) => {
        const url = `https://vynceianoani.helioho.st/getstaff.php${branch ? `?branch=${encodeURIComponent(branch)}` : ''}`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                localStorage.setItem('staffList', JSON.stringify(data));
                setStaffList(data);
            })
            .catch(error => console.error('Error fetching staff data:', error));
    };

    // Handle branch change
    const handleBranchChange = (newBranch) => {
        setSelectedBranch(newBranch);
        localStorage.setItem('selectedBranch', newBranch);
        fetchStaffData(newBranch);
    };

    // Format the date to be displayed
    const formatDate = () => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date().toLocaleDateString('en-US', options);
    };

    // Toggle profile dropdown
    const handleProfileClick = () => setIsDropdownVisible(!isDropdownVisible);

    // Logout and navigate to login page
    const handleLogout = () => navigate('/');

    // Navigate to the add staff page
    const handleAddStaff = () => navigate('/home/staff/add-new-staff');

    // Handle editing a staff member
    const handleEditStaff = (staffID) => {
        localStorage.setItem('selectedStaffID', staffID); // Save staffID to localStorage
        navigate(`/home/edit/${staffID}`); // Navigate to edit page with staffID
    };
    

    // Handle setting a staff member as inactive
    const handleRemoveStaff = (staffID) => {
        if (window.confirm('Are you sure you want to set this staff member as inactive?')) {
            fetch('https://vynceianoani.helioho.st/setinactive.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ staffID: staffID })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    const updatedStaffList = staffList.filter(staff => staff.StaffID !== staffID);
                    localStorage.setItem('staffList', JSON.stringify(updatedStaffList));
                    setStaffList(updatedStaffList);
                    alert('Staff member set as inactive successfully.');
                } else {
                    alert('Error setting staff member as inactive: ' + data.message);
                }
            })
            .catch(error => console.error('Error setting staff member as inactive:', error));
        }
    };

    // Check for current page routes
    const isStaffPage = location.pathname.startsWith('/home/staff');
    const isAddStaffPage = location.pathname === '/home/staff/add-new-staff';
    const isEditStaffPage = location.pathname.startsWith('/editstaff');

    // Filter staff based on the search query
    const filteredStaffList = staffList.filter(staff => 
        staff.Fname.toLowerCase().includes(searchQuery.toLowerCase()) || 
        staff.Lname.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="home-container">
            <div className="sidebar">
                <div className="logo-container">
                    <img src={pic2} alt="Logo" className="logo" />
                </div>
                <ul>
                    <li>
                        <NavLink to="staff" className={({ isActive }) => (isActive ? 'active' : '')}>
                            <FontAwesomeIcon icon={faUserGroup} className="icon-sidebar" /> Staff
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="dtr" className={({ isActive }) => (isActive ? 'active' : '')}>
                            <FontAwesomeIcon icon={faUserGroup} className="icon-sidebar" /> DTR
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="commission" className={({ isActive }) => (isActive ? 'active' : '')}>
                            <FontAwesomeIcon icon={faSackDollar} className="icon-sidebar" /> Commission
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="payroll" className={({ isActive }) => (isActive ? 'active' : '')}>
                            <FontAwesomeIcon icon={faMoneyCheckDollar} className="icon-sidebar" /> Payroll
                        </NavLink>
                    </li>
                </ul>
            </div>

            <div className="content">
                {isStaffPage && !isAddStaffPage && !isEditStaffPage && (
                    <>
                        <div className="top-bar">
                            <button className="add-staff-button" onClick={handleAddStaff}>Add a new staff</button>
                            <div className="search-container">
                        <div className="search-bar-container">
                            <input 
                                type="text" 
                                className="search-bar" 
                                placeholder="Search by First Name or Last Name..." 
                                value={searchQuery} 
                                onChange={(e) => setSearchQuery(e.target.value)} // Update search query
                            />
                            <i className="fas fa-search search-icon"></i>
                        </div>
                    </div>
                    <div className="branch-selector">
                        <select onChange={(e) => handleBranchChange(e.target.value)} value={selectedBranch}>
                            <option value="">Select a branch</option>
                            <option value="Paris">Paris</option>
                            <option value="Rome">Rome</option>
                            <option value="Switzerland">Switzerland</option>
                        </select>
                    </div>
                </div>
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
                    </>
                )}

                <Routes>
                    <Route path="/" element={<Navigate to="staff" />} />
                    <Route path="staff" element={
                        <div className="staff-container">
                            <div className="welcome-container">
                                <h1>Welcome!</h1>
                            </div>
                            <div className="branch-container">
                                <h1>
                                    {selectedBranch} <i className="fa-solid fa-code-branch branch-icon"></i>
                                </h1>
                                <p>Branch</p>
                            </div>
                            <div className="totalstaff-container">
                                <h1>{staffList.length}
                                    <FontAwesomeIcon icon={faUserGroup} className="total-staff-icon2" />
                                </h1>
                                <p>Total number of staff</p>
                            </div>
                            <div className="date-container">
                                <p>Today is {formatDate()}</p>
                            </div>

                            <div className="staff-table-container">
                                <h2>List of Staff</h2>
                                <div className="staff-table-wrapper">
                                    <table className="staff-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>First Name</th>
                                                <th>Last Name</th>
                                                <th>Address</th>
                                                <th>Sex</th>
                                                <th>Email</th>
                                                <th>Phone Number</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredStaffList  .map((staff) => (
                                                <tr key={staff.StaffID}>
                                                    <td>{staff.StaffID}</td>
                                                    <td>{staff.Fname}</td>
                                                    <td>{staff.Lname}</td>
                                                    <td>{staff.Address}</td>
                                                    <td>{staff.Sex}</td>
                                                    <td>{staff.Email}</td>
                                                    <td>{staff.ContactNumber}</td>
                                                    <td>
                                                        <button onClick={() => handleEditStaff(staff.StaffID)}>Edit</button>
                                                        <button onClick={() => handleRemoveStaff(staff.StaffID)}>Remove</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    } />

                    <Route path="dtr" element={<DTR />} />
                    <Route path="commission" element={<Commission />} />
                    <Route path="payroll" element={<Payroll />} />
                    <Route path="staff/add-new-staff" element={<AddStaff />} />
                    <Route path="edit/:staffID" element={<EditStaff />} />
                    <Route path="calculatepayroll" element={<CalculatePayroll />} />
                </Routes>
            </div>
        </div>
    );
}

export default Home;
