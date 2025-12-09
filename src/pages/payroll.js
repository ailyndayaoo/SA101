import React, { useState, useEffect } from 'react';
import '../css/payroll.css';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { faMoneyCheckDollar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function Payroll() {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [payrollData, setPayrollData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPayrollData = async () => {
      try {
        const branch = localStorage.getItem('selectedBranch');

        const response = await fetch(`http://localhost:3001/fetchPayrollData?branch=${encodeURIComponent(branch)}`);
        const data = await response.json();

        setPayrollData(data);
      } catch (error) {
        console.error('Error fetching payroll data:', error);
      }
    };

    fetchPayrollData();
  }, []);

  const handleProfileClick = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const handleLogout = () => {
    navigate('/');
  };

  const handleFieldChange = (index, field, value) => {
    const newData = [...payrollData];
    newData[index][field] = value;
    setPayrollData(newData);
  };

  const handleSaveClick = async (index) => {
    const item = payrollData[index];

    if (!item.StaffID || !item.dtr_date || !item.payDate) {
      alert('Please fill all the required fields.');
      return;
    }

    const commission = parseFloat(item.total_commission_per_day) || 0;
    const allowance = parseFloat(item.allowance) || 0;
    const debt = parseFloat(item.debt) || 0;
    const total = commission + allowance - debt;

    const payrollItem = {
      StaffID: item.StaffID,
      Date: item.dtr_date,
      Pay_Date: item.payDate,
      Allowance: allowance,
      Debt: debt,
      Total: total
    };

    try {
      const response = await fetch('http://localhost:3001/savePayroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payrollItem)
      });

      const result = await response.json();
      if (result.message) {
        alert('Payroll saved successfully!');
      } else {
        alert('Failed to save payroll. Please try again.');
      }
    } catch (error) {
      console.error('Error saving payroll data:', error);
      alert('Error saving payroll data.');
    }
  };

  return (
    <div className="payroll-page">
      <div className="payroll-container">
        <FontAwesomeIcon icon={faMoneyCheckDollar} className="icon-payroll" beat />
        <h1>Payroll</h1>
        <div className="profile2-container">
          <i className="fas fa-user profile-icon"></i>
          <p className="profile2-label" onClick={handleProfileClick}>
            Admin
            <i className="fas fa-chevron-down arrow-icon"></i>
          </p>
          {isDropdownVisible && (
            <div className="dropdown-payroll-menu">
              <p className="dropdown-payroll-item" onClick={handleLogout}>
                Logout
                <i className="fa-solid fa-right-from-bracket logout-icon"></i>
              </p>
            </div>
          )}
        </div>
        <div className="search-payroll-container">
          <div className="search-bar-payroll-container">
          </div>
        </div>
        <div className="date-main-payroll-container">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            placeholderText="Select date"
            dateFormat="MM/dd/yyyy"
            className="date-main-payroll-input"
          />
        </div>
        <div className="table-payroll-container">
          <table className="payroll-table">
            <thead>
              <tr>
                <th>Staff ID</th>
                <th>Date</th>
                <th>Commission</th>
                <th>Allowance</th>
                <th>Debt</th>
                <th>Pay Date</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrollData.map((item, index) => (
                <tr key={item.id}>
                  <td>{item.StaffID}</td>
                  <td>{item.dtr_date ? new Date(item.dtr_date).toLocaleDateString('en-US') : 'No Date'}</td>
                  <td>
                    <span>{item.total_commission_per_day}</span>
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.allowance}
                      onChange={(e) => handleFieldChange(index, 'allowance', e.target.value)}
                      placeholder="Enter allowance"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.debt}
                      onChange={(e) => handleFieldChange(index, 'debt', e.target.value)}
                      placeholder="Enter debt"
                    />
                  </td>
                  <td>
                    <DatePicker
                      selected={item.payDate}
                      onChange={(date) => handleFieldChange(index, 'payDate', date)}
                      placeholderText="Select pay date"
                      dateFormat="MM/dd/yyyy"
                    />
                  </td>
                  <td>
                    {(
                      (parseFloat(item.total_commission_per_day) || 0) +
                      (parseFloat(item.allowance) || 0) -
                      (parseFloat(item.debt) || 0)
                    ).toFixed(2)}
                  </td>
                  <td>
                    <button className="save-payroll-button" onClick={() => handleSaveClick(index)}>Save</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Payroll;
