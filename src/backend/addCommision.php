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

// Get data from POST request
$staffID = $_POST['staffID'];
$date = $_POST['date'];
$totalSales = $_POST['total_sales'];
$totalCommission = $_POST['total_commission'];

// Insert data into the commission table
$sql = "INSERT INTO commissions (StaffID, Date, total_sales_per_day, total_commission_per_day) 
        VALUES ('$staffID', '$date', '$totalSales', '$totalCommission')";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => true, "message" => "Commission added successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
}

$conn->close();
?>
