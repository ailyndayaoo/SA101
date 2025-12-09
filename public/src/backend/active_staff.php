<?php
header("Access-Control-Allow-Origin: *");


header("Access-Control-Allow-Methods: *");

/
header("Access-Control-Allow-Headers: *");

//
header("Content-Type: application/json; charset=UTF-8");
// Database connection

// Database connection setup
$host = 'localhost'; // Replace with your host
$user = 'root'; // Replace with your DB user
$password = ''; // Replace with your DB password
$dbname = 'payroll'; // Replace with your database name

// Create connection
$conn = new mysqli($host, $user, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Query to fetch active employees
$sql = "SELECT StaffID, Fname, Lname FROM staff WHERE status = 'Active'";
$result = $conn->query($sql);

// Check if any results were returned
if ($result->num_rows > 0) {
    $activeStaff = [];

    // Fetch all rows and add them to the array
    while ($row = $result->fetch_assoc()) {
        $activeStaff[] = $row;
    }

    // Return data as JSON
    header('Content-Type: application/json');
    echo json_encode($activeStaff);
} else {
    echo json_encode([]);
}

// Close the database connection
$conn->close();
?>
