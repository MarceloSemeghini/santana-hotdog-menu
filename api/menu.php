<?php
require_once 'bootstrap.php';
require_once 'vendor/autoload.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGet();
        break;

    default:
        http_response_code(405);
        echo json_encode(["status" => "fail", "message" => "Método não permitido"]);
        exit;
}

function handleGet()
{
    global $conn;

    $id = $_GET['id'] ?? null;

    if ($id) {
        $stmt = $conn->prepare("SELECT * FROM categories WHERE id = ?");
        $stmt->bind_param("i", $id);
    } else {
        $stmt = $conn->prepare("SELECT * FROM categories");
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $categories = [];

    while ($row = $result->fetch_assoc()) {
        $row['additions'] = json_decode($row['additions'], true);

        $itemStmt = $conn->prepare("SELECT id, name, price, ingredients FROM items WHERE category_id = ?");
        $itemStmt->bind_param("i", $row['id']);
        $itemStmt->execute();
        $itemsResult = $itemStmt->get_result();

        $items = [];
        while ($item = $itemsResult->fetch_assoc()) {
            $item['ingredients'] = json_decode($item['ingredients'], true);
            $items[] = $item;
        }

        $row['items'] = $items;
        $categories[] = $row;

        $itemStmt->close();
    }

    echo json_encode([
        "status" => "success",
        "data" => $categories
    ]);
}
