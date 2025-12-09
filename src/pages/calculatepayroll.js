import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyCheckDollar } from '@fortawesome/free-solid-svg-icons';
import '../css/calculatepayroll.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function CalculatePayroll() {
  const [payrollData, setPayrollData] = useState({
    allowance: '',
    debt: '',
    reasonDebt: '',
  });
  const [commissions, setCommissions] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [weeklyCommissions, setWeeklyCommissions] = useState([]);
  const [totalPay, setTotalPay] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const [startDate, setStartDate] = useState(new Date());


  const { StaffID = 'Unknown ID', name = 'Unknown Staff' } = location.state || {};

  useEffect(() => {
    if (StaffID) fetchCommissions();
  }, [StaffID]);

  const fetchCommissions = async () => {
    try {
      const response = await fetch(`http://localhost:3001/commissions?staffID=${StaffID}`);
      const data = await response.json();
      setCommissions(data);
    } catch (error) {
      console.error("Error fetching commissions:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPayrollData((prev) => ({ ...prev, [name]: value }));
  };

  const handleWeekChange = (date) => {
    setSelectedWeek(date);

    const firstDayOfWeek = new Date(date);
    firstDayOfWeek.setDate(firstDayOfWeek.getDate() - firstDayOfWeek.getDay());
    const daysInWeek = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(firstDayOfWeek);
      day.setDate(firstDayOfWeek.getDate() + i);
      return day;
    });

    const filteredCommissions = daysInWeek
      .map((day) => {
        const matchingCommission = commissions.find((commission) => {
          const commissionDate = new Date(commission.Date);
          return (
            commissionDate.getFullYear() === day.getFullYear() &&
            commissionDate.getMonth() === day.getMonth() &&
            commissionDate.getDate() === day.getDate()
          );
        });

        return {
          date: day,
          commission: parseFloat(matchingCommission?.total_commission_per_day || 0),
          commissionID: matchingCommission?.Commission_ID ?? null,
          dtrID: matchingCommission?.DTRID ?? null
        };
      })
      // keep only days that actually have a commission > 0 and have DTRID/Commission_ID
      .filter(d => !Number.isNaN(d.commission) && d.commission > 0 && d.commissionID && d.dtrID);

    setWeeklyCommissions(filteredCommissions);
  };
  


  const calculateTotalPay = () => {
    const totalCommission = weeklyCommissions.reduce(
      (sum, commission) => sum + parseFloat(commission.commission || 0), // Use `commission` field here
      0
    );
    const allowance = parseFloat(payrollData.allowance || 0);
    const debt = parseFloat(payrollData.debt || 0);
    return totalCommission + allowance - debt;
  };
  
  useEffect(() => {
    setTotalPay(calculateTotalPay());
  }, [weeklyCommissions, payrollData.allowance, payrollData.debt]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // pick first matching day in the selected week (or let UI expose selection)
    const selectedDay = weeklyCommissions[0] ?? null;
    const DTRID = selectedDay?.dtrID ?? payrollData.dtrID ?? null;
    const Commission_ID = selectedDay?.commissionID ?? payrollData.commissionID ?? null;

    if (!DTRID || !Commission_ID) {
      alert('No linked DTR/Commission found for the selected week. Select a week/day that has commission and DTR.');
      return;
    }

    const submissionData = {
      StaffID: StaffID,
      DTRID: DTRID,
      Commission_ID: Commission_ID,
      Pay_Date: startDate ? new Date(startDate).toISOString().split('T')[0] : '',
      Allowance: parseFloat(payrollData.allowance || 0),
      Debt: parseFloat(payrollData.debt || 0),
      Total: totalPay.toFixed(2),
      ReasonDebt: payrollData.reasonDebt || '',
    };

    try {
      const response = await fetch('http://localhost:3001/savePayroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();
      if (result.success) {
        alert('Payroll data saved successfully!');
        navigate('/home/payrollfinal');
      } else {
        alert('Failed to save payroll data: ' + (result.message || 'Unknown error occurred.'));
      }

    } catch (error) {
      console.error("Error submitting payroll data:", error);
      alert('Error occurred while saving payroll data: ' + error.message);
    }
  };


  return (
    <div className="calculate-payroll-container">
      <FontAwesomeIcon icon={faMoneyCheckDollar} className="icon-calculate-payroll" beat />
      <h3>Payroll</h3>

      <button className="back-payroll-button" onClick={() => navigate('/home/payrollfinal')}>
        &lt; Back
      </button>




      <div className="scrollable-form-container">
        <div className="form-payroll-background">
          <div className="name-id-display">
            <p><strong>Name:</strong> {name}</p>
            <p><strong>ID:</strong> {StaffID}</p>
          </div>

          <div className="paydate-container">
            <p1>Pay Date</p1>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="MMMM d, yyyy"
              className="date-picker-payrollfinal"
              placeholderText="Select a date"
            />
          </div>

          <div className="week-picker">
            <label>Select Week:</label>
            <DatePicker
              selected={selectedWeek}
              onChange={handleWeekChange}
              showWeekNumbers
              dateFormat="yyyy-'W'ww"
              placeholderText="Select a week"
            />
          </div>

          <div className="commissions-list">
            <h4>Weekly Commissions</h4>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Commission</th>
                </tr>
              </thead>
              <tbody>
                {weeklyCommissions.map((day, index) => (
                  <tr key={index}>
                    <td>{day.date.toLocaleDateString()}</td>
                    <td>{day.commission}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>


          <div className="payroll-columns">
            <div className="payroll-column">
              <label htmlFor="allowance">Allowance:</label>
              <input
                type="number"
                id="allowance"
                name="allowance"
                value={payrollData.allowance}
                onChange={handleInputChange}
                placeholder="Enter allowance"
              />
            </div>

            <div className="payroll-column">
              <label htmlFor="debt">Debt:</label>
              <input
                type="number"
                id="debt"
                name="debt"
                value={payrollData.debt}
                onChange={handleInputChange}
                placeholder="Enter debt"
              />
            </div>

            <div className="payroll-column">
              <label htmlFor="reasonDebt">Type of Debt:</label>
              <input
                type="text"
                id="reasonDebt"
                name="reasonDebt"
                value={payrollData.reasonDebt}
                onChange={handleInputChange}
                placeholder="Enter reason for debt"
              />
            </div>

            <div className="payroll-column">
              <label htmlFor="totalPay">Total Pay:</label>
              <input type="text" id="totalPay" value={totalPay.toFixed(2)} readOnly />
            </div>
          </div>

          <button className="save-payroll-button" onClick={handleSubmit}>
            Save Payroll
          </button>
        </div>
      </div>
    </div>
  );
}

export default CalculatePayroll;
