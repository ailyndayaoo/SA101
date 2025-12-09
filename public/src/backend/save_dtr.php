<?php
header("Access-Control-Allow-Origin: *");


header("Access-Control-Allow-Methods: *");

header("Access-Control-Allow-Headers: *");

//
header("Content-Type: application/json; charset=UTF-8");
// Database connection
$conn = new mysqli('localhost', '', '', 'payroll');

if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

// Get the posted data
$staffID = $_POST['staffID'];
$fname = $_POST['fname'];
$lname = $_POST['lname'];
$timeIn = $_POST['timeIn'];
$timeOut = $_POST['timeOut'];
$date = $_POST['date'];

// Insert into the dtr table
$sql = "INSERT INTO dtr (StaffID, Fname, Lname, TimeIn, TimeOut, Date)
        VALUES ('$staffID', '$fname', '$lname', '$timeIn', '$timeOut', '$date')";

if ($conn->query($sql) === TRUE) {
  echo "DTR record saved successfully!";
} else {
  echo "Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();
?>
