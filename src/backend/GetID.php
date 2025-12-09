<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json; charset=UTF-8");
// Database connection
$servername = 'localhost:3306'; // Database host
$dbname = 'vynceianoani_ailyn'; // Database name
$username = 'vynceianoani_ailyn'; // Database username
$password = 'password'; // Database password


// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['status' => 'error', 'message' => 'Connection failed: ' . $conn->connect_error]));
}

// Get staffID from the request
if (isset($_GET['staffID'])) {
    $staffID = $conn->real_escape_string($_GET['staffID']);

    // Query to fetch staff details
    $sql = "SELECT StaffID, Fname, Lname, Address, Email, Sex, ContactNumber, Photo FROM staff WHERE StaffID = '$staffID' AND Status = 'Active'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        // Fetch the staff data
        $staffData = $result->fetch_assoc();

        // Return the staff data as JSON
        echo json_encode(['status' => 'success', 'staff' => $staffData]);
    } else {
        // If no staff found
        echo json_encode(['status' => 'error', 'message' => 'Staff not found or inactive']);
    }
} else {
    // If staffID is not provided
    echo json_encode(['status' => 'error', 'message' => 'Invalid request, staffID missing']);
}

// Close connection
$conn->close();
?>
