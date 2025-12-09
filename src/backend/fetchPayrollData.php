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
try {
    // Establish database connection
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Prepare the SQL query
    $sql = "
        SELECT 
            s.StaffID, 
            d.DTRID, 
            c.Commission_ID, 
            d.Date AS dtr_date, 
            c.total_commission_per_day
        FROM 
            staff s
        LEFT JOIN 
            dtr d ON s.StaffID = d.StaffID
        LEFT JOIN 
            commissions c ON s.StaffID = c.StaffID
        ORDER BY 
            d.Date DESC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    // Fetch the results
    $payrollData = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Return the data as JSON
    echo json_encode($payrollData);

} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
