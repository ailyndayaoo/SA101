<?php
header("Content-Type: application/json");

// Database configuration
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "payroll";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Get the input data
$input = json_decode(file_get_contents("php://input"), true);

// Validate input
if (!isset($input['StaffID'], $input['Fname'], $input['Lname'], $input['Address'], $input['Email'], $input['Sex'], $input['ContactNumber'])) {
    echo json_encode(["error" => "Invalid input"]);
    exit;
}

// Sanitize input
$staffID = $conn->real_escape_string($input['StaffID']);
$fname = $conn->real_escape_string($input['Fname']);
$lname = $conn->real_escape_string($input['Lname']);
$address = $conn->real_escape_string($input['Address']);
$email = $conn->real_escape_string($input['Email']);
$sex = $conn->real_escape_string($input['Sex']);
$contactNumber = $conn->real_escape_string($input['ContactNumber']);

// Prepare and execute the update query
$sql = "UPDATE staff SET Fname='$fname', Lname='$lname', Address='$address', Email='$email', Sex='$sex', ContactNumber='$contactNumber' WHERE StaffID='$staffID'";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["message" => "Staff updated successfully"]);
} else {
    echo json_encode(["error" => "Error updating staff: " . $conn->error]);
}

// Close connection
$conn->close();
?>
