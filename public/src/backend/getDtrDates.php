<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json; charset=UTF-8");
// Database connection
$host = 'localhost:3306'; // Database host
$db = 'vynceianoani_ailyn'; // Database name
$user = 'vynceianoani_ailyn'; // Database username
$pass  = 'password'; // Database password

$conn = new mysqli($host, $user, $pass, $db);

// Check for connection errors
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get the StaffID from the request
$staffID = isset($_GET['StaffID']) ? $_GET['StaffID'] : null;

if ($staffID) {
    // Prepare the SQL query to fetch dates from the DTR table for the selected employee
    $sql = "SELECT DISTINCT Date FROM dtr WHERE StaffID = ? ORDER BY Date DESC";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $staffID); // Bind the staff ID parameter
    $stmt->execute();
    
    $result = $stmt->get_result();
    
    $dates = [];
    
    // Fetch the dates
    while ($row = $result->fetch_assoc()) {
        $dates[] = $row['Date'];
    }

    // Return the dates as a JSON response
    echo json_encode($dates);
} else {
    echo json_encode(['error' => 'StaffID not provided']);
}

// Close the connection
$conn->close();
?>
