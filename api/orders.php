<?php
require_once 'bootstrap.php';
require_once 'vendor/autoload.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        handlePost();
        break;

    case 'GET':
        handleGet();
        break;

    case 'PUT':
        handleUpdate();
        break;

    default:
        http_response_code(405);
        echo json_encode(["status" => "fail", "message" => "Método não permitido"]);
        exit;
}

function handlePost()
{
    global $conn;

    $rawInput = file_get_contents("php://input");
    $body = json_decode($rawInput, true);

    if (!isset($body["name"]) || !isset($body["items"])) {
        http_response_code(400);
        echo json_encode(["status" => "fail", "message" => "Campos obrigatórios ausentes"]);
        exit;
    }

    $id = generate_id();
    $name = $body["name"];
    $orderData = $body["items"];

    $address = isset($body["address"]) ? json_encode($body["address"]) : null;

    $total = 0;
    if (!empty($orderData['products'])) {
        foreach ($orderData['products'] as $item) {
            $price = isset($item['totalPrice']) ? floatval($item['totalPrice']) : floatval($item['price']);
            $total += $price;
        }
    }

    $jsonOrder = is_string($orderData) ? $orderData : json_encode($orderData);

    $hour = (int) date("H");
    $workDate = ($hour < 12) ? date("Y-m-d", strtotime("-1 day")) : date("Y-m-d");

    $stmt = $conn->prepare("
        SELECT MAX(order_code) AS max_order_code 
        FROM orders 
        WHERE work_date = ?
    ");
    $stmt->bind_param("s", $workDate);
    $stmt->execute();
    $result = $stmt->get_result();
    $maxOrderCode = ($row = $result->fetch_assoc()) ? $row['max_order_code'] : null;
    $stmt->close();

    $newOrderCode = ($maxOrderCode === null) ? 1 : $maxOrderCode + 1;

    $currentDate = date("Y-m-d H:i:s");

    $conn->begin_transaction();

    try {
        $stmt = $conn->prepare("
            INSERT INTO orders (id, name, order_data, order_code, created_at, work_date, address)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->bind_param("sssisss", $id, $name, $jsonOrder, $newOrderCode, $currentDate, $workDate, $address);
        $stmt->execute();
        $stmt->close();

        $conn->commit();

        echo json_encode([
            "status" => "success",
            "data" => [
                "id" => $id,
                "name" => $name,
                "order_code" => $newOrderCode,
                "total" => number_format($total, 2, '.', '')
            ]
        ]);
    } catch (Exception $e) {
        $conn->rollback();
        http_response_code(500);
        echo json_encode([
            "status" => "fail",
            "message" => $e->getMessage()
        ]);
    }
}

function handleGet()
{
    global $conn;

    authenticate();

    $start_date = $_GET['start_date'] ?? null;
    $end_date = $_GET['end_date'] ?? null;
    $status = $_GET['status'] ?? null;

    $query = "SELECT * FROM orders";
    $params = [];
    $types = [];

    $conditions = [];

    if ($start_date && $end_date) {
        $conditions[] = "work_date BETWEEN ? AND ?";
        $params[] = $start_date;
        $params[] = $end_date;
        $types[] = "s";
        $types[] = "s";
    } elseif ($start_date) {
        $conditions[] = "work_date >= ?";
        $params[] = $start_date;
        $types[] = "s";
    }

    if ($status) {
        $conditions[] = "status = ?";
        $params[] = $status;
        $types[] = "s";
    }

    if ($conditions) {
        $query .= " WHERE " . implode(" AND ", $conditions);
    }

    $query .= " ORDER BY order_code ASC";

    $stmt = $conn->prepare($query);

    if ($params) {
        $stmt->bind_param(implode("", $types), ...$params);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $orders[] = [
            "id" => $row['id'],
            "name" => $row['name'],
            "items" => json_decode($row['order_data'], true),
            "order_code" => $row['order_code'],
            "status" => $row['status'],
            "created_at" => $row['created_at'],
            "work_date" => $row['work_date'],
            "address" => json_decode($row['address'], true)
        ];
    }

    $result->free();
    $stmt->close();

    echo json_encode([
        "status" => "success",
        "data" => $orders
    ]);
}

function handleUpdate()
{
    global $conn;

    $rawInput = file_get_contents("php://input");
    $body = json_decode($rawInput, true);

    if (!isset($body["id"]) || !isset($body["status"])) {
        http_response_code(400);
        echo json_encode(["status" => "fail", "message" => "Falha ao receber dados do pedido"]);
        exit;
    }

    $id = $body["id"];
    $status = $body["status"];

    try {
        $conn->commit();

        $stmt = $conn->prepare("UPDATE orders SET status = ? WHERE id = ?");
        $stmt->bind_param("ss", $status, $id);
        $stmt->execute();
        $stmt->close();

        $conn->commit();
        echo json_encode([
            "status" => "success",
            "message" => "Pedido atualizada com sucesso",
            "category" => $status
        ]);
    } catch (Exception $e) {
        $conn->rollback();
        http_response_code(500);
        echo json_encode(["status" => "fail", "message" => "Erro ao atualizar pedido", "error" => $e->getMessage()]);
    }
}


