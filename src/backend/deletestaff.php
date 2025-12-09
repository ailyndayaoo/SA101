<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Database configuration
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "payroll";

// Create a connection to the database
$conn = new mysqli($servername, $username, $password, $dbname);

// Check the connection
if ($conn->connect_error) {
    echo json_encode(['error' => 'Connection failed: ' . $conn->connect_error]);
    exit();
}

// Get the raw POST data
$data = json_decode(file_get_contents("php://input"));

// Log the received data
error_log("Received data: " . print_r($data, true));

// Ensure the StaffID is provided
if (!isset($data->StaffID)) {
    echo json_encode(['error' => 'StaffID is required']);
    exit();
}

$staffID = $data->StaffID;

// Prepare and execute the SQL DELETE query
$sql = "DELETE FROM staff WHERE StaffID = ?";
$stmt = $conn->prepare($sql);

// Check if the statement was prepared correctly
if ($stmt) {
    $stmt->bind_param("s", $staffID);
    $stmt->execute();

    // Log SQL errors if any
    if ($conn->error) {
        error_log("SQL Error: " . $conn->error);
        echo json_encode(['error' => 'SQL Error: ' . $conn->error]);
        exit();
    }

    if ($stmt->affected_rows > 0) {
        echo json_encode(['message' => 'Staff deleted successfully']);
    } else {
        echo json_encode(['error' => 'No staff found with the given ID']);
    }

    $stmt->close();
} else {
    echo json_encode(['error' => 'Failed to prepare the SQL statement']);
}

// Close the database connection
$conn->close();
?>
