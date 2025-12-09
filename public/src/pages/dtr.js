import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../css/dtr.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGroup } from '@fortawesome/free-solid-svg-icons';

function Dtr() {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch employees from API
    fetch('https://vynceianoani.helioho.st/active_staff.php')
      .then((response) => response.json())
      .then((data) => setEmployees(data))
      .catch((error) => console.error('Error fetching employees:', error));
  }, []);

  const formatDate = (date) => {
    if (!date) return '';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Manila' };
    return date.toLocaleDateString(undefined, options);
  };

  const handleProfileClick = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const handleLogout = () => {
    navigate('/');
  };

  const handleSave = (employeeId) => {
    const employee = employees.find((emp) => emp.StaffID === employeeId);
    const timeIn = `${employee.timeIn.hours}:${employee.timeIn.minutes} ${employee.timeIn.period}`;
    const timeOut = `${employee.timeOut.hours}:${employee.timeOut.minutes} ${employee.timeOut.period}`;
  
    const formattedDate = selectedDate 
      ? new Date(selectedDate).toLocaleString('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' }).split(',')[0]
      : null;
  
    const payload = {
      staffID: employee.StaffID,
      fname: employee.Fname,
      lname: employee.Lname,
      timeIn,
      timeOut,
      date: formattedDate,
    };
  
    fetch('https://vynceianoani.helioho.st/save_dtr.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          alert('DTR saved successfully');
        } else {
          alert('Error: ' + (data.error || 'Unknown error'));
        }
      })
      .catch((error) => {
        console.error('Error saving DTR:', error);
        alert('Error saving DTR');
      });
  };

  const handleTimeChange = (e, employeeId, type, part) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits allowed
    setEmployees((prevEmployees) =>
      prevEmployees.map((emp) =>
        emp.StaffID === employeeId
          ? { ...emp, [type]: { ...emp[type], [part]: value } }
          : emp
      )
    );
  };

  const handlePeriodChange = (e, employeeId, type) => {
    const value = e.target.value;
    setEmployees((prevEmployees) =>
      prevEmployees.map((emp) =>
        emp.StaffID === employeeId
          ? { ...emp, [type]: { ...emp[type], period: value } }
          : emp
      )
    );
  };

  return (
    <div className="dtr-page">
      <div className="dtr-container">
        <FontAwesomeIcon icon={faUserGroup} className="icon-dtr" beat />
        <h1>DTR</h1>
        <div className="date-time-container">
          <p>Today is {formatDate(new Date())}</p>
        </div>
        <div className="date-picker-container">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            placeholderText="Select date"
            dateFormat="MM/dd/yyyy"
            className="date-picker-input"
            todayButton="Today"
          />
        </div>
        <div className="table-dtr-container">
          <table className="staff-dtr-table">
            <thead>
              <tr>
                <th>StaffID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Time In</th>
                <th>Time Out</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.StaffID}>
                  <td>{employee.StaffID}</td>
                  <td>{employee.Fname}</td>
                  <td>{employee.Lname}</td>
                  <td>
                    <div className="time-container">
                      <div className="time-input-container">
                        <input
                          type="text"
                          maxLength="2"
                          value={employee.timeIn?.hours || ''}
                          onChange={(e) => handleTimeChange(e, employee.StaffID, 'timeIn', 'hours')}
                          placeholder="HH"
                          className="time-input"
                        />
                        :
                        <input
                          type="text"
                          maxLength="2"
                          value={employee.timeIn?.minutes || ''}
                          onChange={(e) => handleTimeChange(e, employee.StaffID, 'timeIn', 'minutes')}
                          placeholder="MM"
                          className="time-input"
                        />
                      </div>
                      <select
                        value={employee.timeIn?.period || 'AM'}
                        onChange={(e) => handlePeriodChange(e, employee.StaffID, 'timeIn')}
                        className="time-period-select"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </td>
                  <td>
                    <div className="time-container">
                      <div className="time-input-container">
                        <input
                          type="text"
                          maxLength="2"
                          value={employee.timeOut?.hours || ''}
                          onChange={(e) => handleTimeChange(e, employee.StaffID, 'timeOut', 'hours')}
                          placeholder="HH"
                          className="time-input"
                        />
                        :
                        <input
                          type="text"
                          maxLength="2"
                          value={employee.timeOut?.minutes || ''}
                          onChange={(e) => handleTimeChange(e, employee.StaffID, 'timeOut', 'minutes')}
                          placeholder="MM"
                          className="time-input"
                        />
                      </div>
                      <select
                        value={employee.timeOut?.period || 'PM'}
                        onChange={(e) => handlePeriodChange(e, employee.StaffID, 'timeOut')}
                        className="time-period-select"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </td>
                  <td>
                    <button
                      className="save-dtr-button"
                      onClick={() => handleSave(employee.StaffID)}
                    >
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="profile-dtr-container">
        <i className="fas fa-user profile-icon"></i>
        <p className="profile-dtr-label" onClick={handleProfileClick}>
          Admin
          <i className="fas fa-chevron-down arrow-dtr-icon"></i>
        </p>
        {isDropdownVisible && (
          <div className="dropdown-dtr-menu">
            <p className="dropdown-dtr-item" onClick={handleLogout}>
              Logout
              <i className="fa-solid fa-right-from-bracket logout-icon"></i>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dtr;
