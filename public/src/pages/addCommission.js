import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
/*import '../css/addCommission.css';*/

function AddCommission() {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [commissionDetails, setCommissionDetails] = useState({
        date: null,
        sales: '',
        commission: 0,
    });

    const navigate = useNavigate();

    useEffect(() => {
        // Fetch employees from your backend (replace with actual API call)
        fetch('https://vynceianoani.helioho.st/getstaff.php') // Replace with your actual API endpoint
            .then(response => response.json())
            .then(data => setEmployees(data))
            .catch(error => console.error('Error fetching employees:', error));
    }, []);

    const handleEmployeeClick = (employee) => {
        setSelectedEmployee(employee);
    };

    const handleDateChange = (date) => {
        setCommissionDetails({ ...commissionDetails, date });
    };

    const handleSalesChange = (e) => {
        const sales = e.target.value;
        const commission = sales * 0.4; // Calculate 40% commission
        setCommissionDetails({ ...commissionDetails, sales, commission });
    };

    const handleAddCommission = () => {
        // Handle commission addition logic (e.g., send data to backend)
        console.log('Adding commission for:', selectedEmployee, commissionDetails);
        // Reset form or redirect after saving
        navigate('/home/commission');
    };

    return (
        <div className="add-commission-page">
            <h1>Add Commission</h1>
            {selectedEmployee ? (
                <div className="commission-form">
                    <h2>Employee: {selectedEmployee.name}</h2>
                    <DatePicker
                        selected={commissionDetails.date}
                        onChange={handleDateChange}
                        placeholderText="Select date"
                        dateFormat="MM/dd/yyyy"
                    />
                    <input
                        type="number"
                        value={commissionDetails.sales}
                        onChange={handleSalesChange}
                        placeholder="Enter total sales"
                    />
                    <p>Total Commission: {commissionDetails.commission}</p>
                    <button onClick={handleAddCommission}>Add Commission</button>
                </div>
            ) : (
                <div className="employee-list">
                    <h2>Select an Employee</h2>
                    <ul>
                        {employees.map(employee => (
                            <li key={employee.id} onClick={() => handleEmployeeClick(employee)}>
                                {employee.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default AddCommission;
