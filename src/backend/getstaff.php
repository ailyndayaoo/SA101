<?php
header('Content-Type: application/json');

// Database connection
$host = 'localhost'; // Replace with your database host
$db = 'payroll'; // Replace with your database name
$user = 'root'; // Replace with your database username
$pass = ''; // Replace with your database password

$conn = new mysqli($host, $user, $pass, $db);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get branch parameter
$branch = isset($_GET['branch']) ? $conn->real_escape_string($_GET['branch']) : '';

// Base SQL query
$sql = "SELECT * FROM staff WHERE is_removed = 0";

// Add branch filter if provided
if (!empty($branch)) {
    $sql .= " AND branch = '$branch'"; // Adjust the column name to match your schema
}

$result = $conn->query($sql);

// Check for SQL errors
if (!$result) {
    echo json_encode(['error' => $conn->error]);
    $conn->close();
    exit();
}

// Fetch the staff and send back as JSON
$staff = [];
while ($row = $result->fetch_assoc()) {
    $staff[] = $row;
}

echo json_encode($staff);

$conn->close();
?>
