<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json; charset=UTF-8");
// Database connection
$host = 'localhost:3306'; // Database host
$dbname = 'vynceianoani_ailyn'; // Database name
$username = 'vynceianoani_ailyn'; // Database username
$password = 'password'; // Database password

$conn = new mysqli($host, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Retrieve commissions data
$sql = "SELECT Commission_ID, StaffID, Date, total_sales_per_day, total_commission_per_day FROM commissions";
$result = $conn->query($sql);

$commissions = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $commissions[] = $row;
    }
}

echo json_encode($commissions);

$conn->close();
?>
