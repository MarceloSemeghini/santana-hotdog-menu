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

    $total = 0;
    if (!empty($orderData['products'])) {
        foreach ($orderData['products'] as $item) {
            $price = isset($item['totalPrice']) ? floatval($item['totalPrice']) : floatval($item['price']);
            $total += $price;
        }
    }

    $jsonOrder = is_string($orderData) ? $orderData : json_encode($orderData);

    $workDateResult = $conn->query("SELECT last_active FROM users ORDER BY last_active DESC LIMIT 1");
    $workDate = null;
    if ($row = $workDateResult->fetch_assoc()) {
        $workDate = $row['last_active'];
    }
    $workDateResult->free();

    $stmt = $conn->prepare("
        SELECT MAX(order_code) AS max_order_code 
        FROM orders 
        WHERE created_at = ?
    ");
    $stmt->bind_param("s", $workDate);
    $stmt->execute();
    $result = $stmt->get_result();

    $maxOrderCode = null;
    if ($row = $result->fetch_assoc()) {
        $maxOrderCode = $row['max_order_code'];
    }
    $stmt->close();

    $newOrderCode = ($maxOrderCode === null) ? 1 : $maxOrderCode + 1;

    $currentDate = get_date();

    $conn->begin_transaction();

    try {
        $stmt = $conn->prepare("
            INSERT INTO orders (id, name, order_data, order_code, created_at)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->bind_param("sssis", $id, $name, $jsonOrder, $newOrderCode, $currentDate);
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

    $date = $_GET['date'] ?? null;
    $status = $_GET['status'] ?? null;

    $query = "SELECT * FROM orders";
    $params = [];
    $types = "";

    if ($date || $status) {
        $query .= " WHERE";
        $conditions = [];

        if ($date) {
            $conditions[] = " created_at = ?";
            $params[] = $date;
            $types .= "s";
        }

        if ($status) {
            $conditions[] = " status = ?";
            $params[] = $status;
            $types .= "s";
        }

        $query .= implode(" AND", $conditions);
    }

    $query .= " ORDER BY order_code ASC";

    $stmt = $conn->prepare($query);

    if ($params) {
        $stmt->bind_param($types, ...$params);
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
            "created_at" => $row['created_at']
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


