import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../css/calculatepayroll.css'; // Ensure this file exists and contains your styles
import { faMoneyCheckDollar } from '@fortawesome/free-solid-svg-icons'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function CalculatePayroll() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [payrollData, setPayrollData] = useState({
    payrollID: '',
    commissionID: '',
    dtrID: '',
    allowance: '',
    debt: '',
    payDate: '',
    totalCommission: ''
  });
  const [isEdit, setIsEdit] = useState(false); // For editing mode
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/home/payroll');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPayrollData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      // Logic for saving changes
      console.log("Saving changes:", payrollData);
    } else {
      // Logic for adding commission data
      console.log("Submitting new commission:", payrollData);
    }
  };

  return (
    <div className="calculate-payroll-container">
      <FontAwesomeIcon icon={faMoneyCheckDollar} className="icon-calculate-payroll" beat />   
      <h3>Payroll</h3>
      <button className="back-payroll-button" onClick={handleBackClick}>
        &lt; Back
      </button>
      
      <div className="date-payroll-container">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          placeholderText="Select date"
          dateFormat="MM/dd/yyyy"
          className="date-payroll-input"
        />
      </div>

      <div className="form-payroll-background">
        <div className="form-payroll-container">
          <div className="background-payroll-box">
            <label className="image-payroll-label">
              <div className="image-payroll-text">staff photo</div>
            </label>
            <div className="image-payroll-info">
              <p className="p2">John Doe</p>
              <p className="p3">Staff ID</p>
              <p className="p4">101</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
        <div className="scrollable-payroll-section">
          <div className="input-payroll-group input-two-column">
            <div className="input-payroll-item">
              <label className="input-payroll-label">Payroll ID</label>
              <input
                type="text"
                name="payrollID"
                placeholder="Enter Payroll ID"
                className="input-payroll-field"
                value={payrollData.payrollID}
                onChange={handleInputChange}
              />
            </div>
            <div className="input-payroll-item">
              <label className="input-payroll-label">Allowance</label>
              <input
                type="text"
                name="allowance"
                placeholder="Enter allowance"
                className="input-payroll-field"
                value={payrollData.allowance}
                onChange={handleInputChange}
              />
            </div>
            <div className="input-payroll-item">
              <label className="input-payroll-label">Debt</label>
              <input
                type="text"
                name="debt"
                placeholder="Enter debt"
                className="input-payroll-field"
                value={payrollData.debt}
                onChange={handleInputChange}
              />
            </div>
            <div className="input-payroll-item">
              <label className="input-payroll-label">Pay Date</label>
              <input
                type="text"
                name="payDate"
                placeholder="Enter pay date"
                className="input-payroll-field"
                value={payrollData.payDate}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <button 
            className="total-payroll-button" 
            type="submit"
            onClick={handleSubmit}
          >
            {isEdit ? 'Save Changes' : 'Total'}
          </button>
          
          <div className="input-total-item">
            <input
              type="text"
              name="totalCommission"
              placeholder="TOTAL"
              className="input-total-field"
              value={payrollData.totalCommission}
              onChange={handleInputChange}
            />
          </div>

          <button 
            className="save-payroll-button" 
            type="submit"
            onClick={handleSubmit}
          >
            {isEdit ? 'Save Changes' : 'Save'}
          </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CalculatePayroll;
