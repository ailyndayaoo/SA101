    import React, { useEffect, useState } from 'react';
    import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
    import { faList, faUserGroup, faCodeBranch } from '@fortawesome/free-solid-svg-icons';
    import { useNavigate } from 'react-router-dom';
    import { Line } from 'react-chartjs-2';
    import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

    import '../css/summary.css';

    ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

    function Summary() {
        const [selectedBranch, setSelectedBranch] = useState('');
        const [staffList, setStaffList] = useState([]);
        const [isDropdownVisible, setDropdownVisible] = useState(false);
        const navigate = useNavigate();

        useEffect(() => {
            const branch = localStorage.getItem('selectedBranch');
            if (branch) {
                setSelectedBranch(branch);
                fetchStaffData(branch);
            }
        }, []);

        const fetchStaffData = (branch) => {
            const url = `http://localhost:3001/staffTotals?branch=${branch}`;
            fetch(url)
                .then(response => response.json())
                .then(data => setStaffList(data))
                .catch(error => console.error('Error fetching staff data:', error));
        };

        const handleProfileClick = () => {
            setDropdownVisible(!isDropdownVisible);
        };

        const handleLogout = () => {
            navigate('/');
        };

        const handleSeeGraph = () => {
            navigate('/home/summary/graph');
        };

        const totalSales = staffList.reduce((acc, staff) => acc + (parseFloat(staff.TotalSales) || 0), 0).toFixed(2);
        const totalCommission = staffList.reduce((acc, staff) => acc + (parseFloat(staff.TotalCommission) || 0), 0).toFixed(2);
        let totalDebt = 0;

        for (let i = 0; i < staffList.length; i++) {
            totalDebt += parseFloat(staffList[i].TotalDebt) || 0;
        }

        totalDebt = totalDebt.toFixed(2);

        const data = {
            labels: ['Sales', 'Commission',],
            datasets: [
                {
                    label: 'Total Amount',
                    data: [totalSales, totalCommission, totalDebt],
                    borderColor: 'rgba(75,192,192,1)',
                    backgroundColor: 'rgba(75,192,192,0.2)',
                    tension: 0.1,
                },
            ],
        };

        const options = {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: (tooltipItem) => `$${tooltipItem.raw}`,
                    },
                },
            },
        };

        return (
            <div className="summary-container">
                <FontAwesomeIcon icon={faList} className="summary-icon" beat />
                <h1 className="summary-title">Summary</h1>

                <div className="branch-container">
                    <h1>
                        {selectedBranch} <FontAwesomeIcon icon={faCodeBranch} className="branch-icon" />
                    </h1>
                    <p>Branch</p>
                </div>

                <div className="totalstaff-container">
                    <h1>{staffList.length} <FontAwesomeIcon icon={faUserGroup} className="total-staff-icon2" /></h1>
                    <p>Total number of staff</p>
                </div>

                <div className="totalcommission-container">
                    <h1>{totalCommission}</h1>
                    <p>Overall Total Commission</p>
                </div>

                <div className="totalsales-container">
                    <h1>{totalSales}</h1>
                    <p>Overall Total Sales</p>
                </div>

                <div className="profile2-container">
                    <i className="fas fa-user profile-icon"></i>
                    <p className="profile2-label" onClick={handleProfileClick}>
                        Admin <i className="fas fa-chevron-down arrow-icon"></i>
                    </p>
                    {isDropdownVisible && (
                        <div className="dropdown-menu">
                            <p className="dropdown-item" onClick={handleLogout}>
                                Logout <i className="fa-solid fa-right-from-bracket logout-icon"></i>
                            </p>
                        </div>
                    )}
                </div>

                <div className="staffsummary-wrapper">
                    <table className="staffsummary-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Total Sales</th>
                                <th>Total Commission</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffList.map((staff) => (
                                <tr key={staff.StaffID}>
                                    <td>{staff.StaffID}</td>
                                    <td>{staff.Fname}</td>
                                    <td>{staff.Lname}</td>
                                    <td>{staff.TotalSales}</td>
                                    <td>{staff.TotalCommission}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="see-graph-button">
                    <button onClick={handleSeeGraph}>See Graph</button>
                </div>
            </div>
        );
    }

    export default Summary;
