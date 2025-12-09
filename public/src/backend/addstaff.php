<?php
header("Access-Control-Allow-Origin: *");


header("Access-Control-Allow-Methods: *");

/
header("Access-Control-Allow-Headers: *");

//
header("Content-Type: application/json; charset=UTF-8");
// Database connection


$host = "localhost";
$dbname = "payroll"; // your database name
$username = "root";  // your MySQL username
$password = "";      // your MySQL password (leave empty if no password)

$conn = new mysqli($host, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Check if the form data was sent via POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Retrieve the form data from the request body
    $fname = $_POST['Fname'];
    $lname = $_POST['Lname'];
    $address = $_POST['Address'];
    $email = $_POST['Email'];
    $sex = $_POST['Sex'];
    $contactNumber = $_POST['ContactNumber'];

    // Prepare an SQL statement to insert the data
    $sql = "INSERT INTO staff (Fname, Lname, Address, Email, Sex, ContactNumber) 
            VALUES (?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssssss", $fname, $lname, $address, $email, $sex, $contactNumber);

    // Execute the statement
    if ($stmt->execute()) {
        echo json_encode(["message" => "Staff added successfully"]);
    } else {
        echo json_encode(["error" => "Error adding staff: " . $conn->error]);
    }

    // Close the statement and connection
    $stmt->close();
    $conn->close();
} else {
    echo json_encode(["error" => "Invalid request method"]);
}
?>
