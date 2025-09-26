<?php
require_once 'bootstrap.php';
require_once 'vendor/autoload.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        handlePost();
        break;

    case 'DELETE':
        handleDelete();
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

    authenticate();

    $body = json_decode(file_get_contents("php://input"), true);

    if (!isset($body['name']) || empty(trim($body['name']))) {
        http_response_code(400);
        echo json_encode(["status" => "fail", "message" => "Nome da categoria não informado"]);
        exit;
    }

    $id = generate_id();
    $name = trim($body['name']);

    // Verifica duplicidade
    $stmt = $conn->prepare("SELECT id FROM categories WHERE name = ?");
    $stmt->bind_param("s", $name);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows > 0) {
        http_response_code(409);
        echo json_encode(["status" => "fail", "message" => "Categoria com este nome já existe"]);
        $stmt->close();
        exit;
    }
    $stmt->close();

    $conn->begin_transaction();

    try {
        $stmt = $conn->prepare("INSERT INTO categories (id, name) VALUES (?, ?)");
        $stmt->bind_param("ss", $id, $name);
        $stmt->execute();
        $stmt->close();

        $conn->commit();

        echo json_encode([
            "status" => "success",
            "message" => "Categoria inserida com sucesso",
            "categoryId" => $id
        ]);
    } catch (Exception $e) {
        $conn->rollback();
        http_response_code(500);
        echo json_encode(["status" => "fail", "message" => $e->getMessage()]);
    }
}

function handleDelete()
{
    global $conn;

    authenticate();

    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(["status" => "fail", "message" => "ID da categoria não informado"]);
        exit;
    }

    $stmt = $conn->prepare("SELECT id FROM categories WHERE id = ?");
    $stmt->bind_param("s", $id);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows === 0) {
        http_response_code(404);
        echo json_encode(["status" => "fail", "message" => "Categoria não encontrada"]);
        $stmt->close();
        exit;
    }
    $stmt->close();

    $conn->begin_transaction();
    try {
        // Deleta todos os itens da categoria de uma vez
        $stmt = $conn->prepare("DELETE FROM items WHERE category_id = ?");
        $stmt->bind_param("s", $id);
        $stmt->execute();
        $stmt->close();

        // Deleta a categoria
        $stmt = $conn->prepare("DELETE FROM categories WHERE id = ?");
        $stmt->bind_param("s", $id);
        $stmt->execute();
        $stmt->close();

        $conn->commit();
        echo json_encode([
            "status" => "success",
            "message" => "Categoria e itens deletados com sucesso",
            "categoryId" => $id
        ]);
    } catch (Exception $e) {
        $conn->rollback();
        http_response_code(500);
        echo json_encode(["status" => "fail", "message" => $e->getMessage()]);
    }
}

function handleGet()
{
    global $conn;

    $id = $_GET['id'] ?? null;

    if ($id) {
        $stmt = $conn->prepare("SELECT * FROM categories WHERE id = ?");
        $stmt->bind_param("s", $id);
    } else {
        $stmt = $conn->prepare("SELECT * FROM categories");
    }
    $stmt->execute();
    $result = $stmt->get_result();

    $categories = [];
    $categoryIds = [];

    while ($row = $result->fetch_assoc()) {
        $row['additions'] = json_decode($row['additions'], true);
        $categories[$row['id']] = $row;
        $categoryIds[] = $row['id'];
    }
    $stmt->close();

    if (!empty($categoryIds)) {
        // Busca todos os itens de uma vez
        $in  = str_repeat('?,', count($categoryIds) - 1) . '?';
        $stmtItems = $conn->prepare("SELECT * FROM items WHERE category_id IN ($in)");
        $stmtItems->bind_param(str_repeat('s', count($categoryIds)), ...$categoryIds);
        $stmtItems->execute();
        $itemsResult = $stmtItems->get_result();

        while ($item = $itemsResult->fetch_assoc()) {
            $item['ingredients'] = json_decode($item['ingredients'], true);
            $categories[$item['category_id']]['items'][] = $item;
        }
        $stmtItems->close();
    }

    echo json_encode([
        "status" => "success",
        "data" => array_values($categories)
    ]);
}

function handleUpdate()
{
    global $conn;

    $data = json_decode(file_get_contents("php://input"), true);

    if (
        !$data ||
        !isset($data['id']) ||
        !isset($data['name']) ||
        !is_array($data['items'])
    ) {
        http_response_code(400);
        echo json_encode(["status" => "fail", "message" => "Dados inválidos"]);
        return;
    }

    $conn->begin_transaction();

    try {
        $additionsJson = isset($data['additions']) ? json_encode($data['additions']) : null;
        $stmt = $conn->prepare("UPDATE categories SET name = ?, additions = ? WHERE id = ?");
        $stmt->bind_param("sss", $data['name'], $additionsJson, $data['id']);
        $stmt->execute();
        $stmt->close();

        foreach ($data['items'] as $item) {
            $status = $item['status'] ?? null;
            $ingredientsJson = json_encode($item['ingredients']);

            if ($status === 'new') {
                $itemId = generate_id();
                $stmtInsert = $conn->prepare("INSERT INTO items (id, category_id, name, price, ingredients) VALUES (?, ?, ?, ?, ?)");
                $stmtInsert->bind_param("sssds", $itemId, $data['id'], $item['name'], $item['price'], $ingredientsJson);
                $stmtInsert->execute();
                $stmtInsert->close();
            } elseif ($status === 'delete' && !empty($item['id'])) {
                $stmtDelete = $conn->prepare("DELETE FROM items WHERE id = ? AND category_id = ?");
                $stmtDelete->bind_param("ss", $item['id'], $data['id']);
                $stmtDelete->execute();
                $stmtDelete->close();
            } else {
                $stmtUpdate = $conn->prepare("UPDATE items SET name = ?, price = ?, ingredients = ? WHERE id = ? AND category_id = ?");
                $stmtUpdate->bind_param("sdsss", $item['name'], $item['price'], $ingredientsJson, $item['id'], $data['id']);
                $stmtUpdate->execute();
                $stmtUpdate->close();
            }
        }

        $stmt = $conn->prepare("SELECT * FROM categories WHERE id = ?");
        $stmt->bind_param("s", $data['id']);
        $stmt->execute();
        $result = $stmt->get_result();
        $category = $result->fetch_assoc();
        $stmt->close();

        if ($category) {
            $category['additions'] = json_decode($category['additions'], true);

            $stmtItems = $conn->prepare("SELECT * FROM items WHERE category_id = ?");
            $stmtItems->bind_param("s", $category['id']);
            $stmtItems->execute();
            $itemsResult = $stmtItems->get_result();

            $items = [];
            while ($item = $itemsResult->fetch_assoc()) {
                $item['ingredients'] = json_decode($item['ingredients'], true);
                $items[] = $item;
            }
            $stmtItems->close();

            $category['items'] = $items;

            $conn->commit();
            echo json_encode([
                "status" => "success",
                "message" => "Categoria atualizada com sucesso",
                "category" => $category
            ]);
        } else {
            http_response_code(404);
            $conn->rollback();
            echo json_encode(["status" => "fail", "message" => "Categoria não encontrada"]);
        }
    } catch (Exception $e) {
        $conn->rollback();
        http_response_code(500);
        echo json_encode(["status" => "fail", "message" => "Erro ao atualizar categoria", "error" => $e->getMessage()]);
    }
}
