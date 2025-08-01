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

    $rawInput = file_get_contents("php://input");
    $body = json_decode($rawInput, true);

    if (!isset($body['name'])) {
        http_response_code(400);
        echo json_encode(["status" => "fail", "message" => "Campo obrigatório faltando"]);
        exit;
    }

    $name = $body['name'];
    $additions = isset($body['additions']) ? json_encode($body['additions'], JSON_UNESCAPED_UNICODE) : null;

    $checkStmt = $conn->prepare("SELECT id FROM categories WHERE name = ?");
    $checkStmt->bind_param("s", $name);
    $checkStmt->execute();
    $checkStmt->store_result();

    if ($checkStmt->num_rows > 0) {
        http_response_code(409);
        echo json_encode(["status" => "fail", "message" => "Categoria com este nome já existe"]);
        $checkStmt->close();
        exit;
    }
    $checkStmt->close();

    $stmt = $conn->prepare("INSERT INTO categories (name, additions) VALUES (?, ?)");
    $stmt->bind_param("ss", $name, $additions);

    if ($stmt->execute()) {
        echo json_encode([
            "status" => "success",
            "message" => "Categoria inserida com sucesso",
            "categoryId" => $stmt->insert_id
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "fail", "message" => "Erro ao inserir no banco"]);
    }

    $stmt->close();
}
function handleDelete()
{
    global $conn;

    authenticate();

    $id = $_GET['id'] ?? null;

    if (!$id || !is_numeric($id)) {
        http_response_code(400);
        echo json_encode(["status" => "fail", "message" => "ID inválido"]);
        exit;
    }

    $conn->begin_transaction();

    $checkStmt = $conn->prepare("SELECT id FROM categories WHERE id = ?");
    $checkStmt->bind_param("i", $id);
    $checkStmt->execute();
    $checkStmt->store_result();

    if ($checkStmt->num_rows === 0) {
        http_response_code(404);
        echo json_encode(["status" => "fail", "message" => "Categoria não encontrada"]);
        $conn->rollback();
        $checkStmt->close();
        exit;
    }
    $checkStmt->close();

    $stmt = $conn->prepare("DELETE FROM categories WHERE id = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode([
            "status" => "success",
            "message" => "Categoria deletada com sucesso"
        ]);
    } else {
        http_response_code(500);
        $conn->rollback();
        echo json_encode(["status" => "fail", "message" => "Erro ao deletar a categoria"]);
    }

    $conn->commit();
    $stmt->close();
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

function handleUpdate()
{
    global $conn;

    $data = json_decode(file_get_contents("php://input"), true);

    if (
        !$data ||
        !isset($data['id']) ||
        !isset($data['name']) ||
        !is_array($data['additions']) ||
        !is_array($data['items'])
    ) {
        http_response_code(400);
        echo json_encode(["status" => "fail", "message" => "Dados inválidos"]);
        return;
    }

    $conn->begin_transaction();

    try {
        // Atualiza categoria (nome + adições)
        $stmt = $conn->prepare("UPDATE categories SET name = ?, additions = ? WHERE id = ?");
        $additionsJson = json_encode($data['additions']);
        $stmt->bind_param("ssi", $data['name'], $additionsJson, $data['id']);
        $stmt->execute();
        $stmt->close();

        // Atualiza ou insere itens
        foreach ($data['items'] as &$item) {
            $status = $item['status'] ?? null;
            $ingredientsJson = json_encode($item['ingredients']);

            if ($status === 'new') {
                // INSERE novo item
                $stmtInsert = $conn->prepare("INSERT INTO items (category_id, name, price, ingredients) VALUES (?, ?, ?, ?)");
                $stmtInsert->bind_param("isds", $data['id'], $item['name'], $item['price'], $ingredientsJson);
                $stmtInsert->execute();
                $item['id'] = $stmtInsert->insert_id;
                $stmtInsert->close();
                unset($item['status']); // Remove flag após o uso
            } elseif ($status === 'delete' && !empty($item['id'])) {
                // DELETA item existente
                $stmtDelete = $conn->prepare("DELETE FROM items WHERE id = ? AND category_id = ?");
                $stmtDelete->bind_param("ii", $item['id'], $data['id']);
                $stmtDelete->execute();
                $stmtDelete->close();
                continue; // Não inclui no retorno final
            } else {
                // ATUALIZA item existente
                $stmtUpdate = $conn->prepare("UPDATE items SET name = ?, price = ?, ingredients = ? WHERE id = ? AND category_id = ?");
                $stmtUpdate->bind_param("sdsii", $item['name'], $item['price'], $ingredientsJson, $item['id'], $data['id']);
                $stmtUpdate->execute();
                $stmtUpdate->close();
                unset($item['status']); // Limpa flag se existir
            }
        }

        $conn->commit();

        // Recarrega categoria atualizada para retornar ao front
        $stmt = $conn->prepare("SELECT * FROM categories WHERE id = ?");
        $stmt->bind_param("i", $data['id']);
        $stmt->execute();
        $result = $stmt->get_result();
        $category = $result->fetch_assoc();
        $stmt->close();

        if ($category) {
            $category['additions'] = json_decode($category['additions'], true);

            // Busca itens da categoria
            $stmtItems = $conn->prepare("SELECT id, name, price, ingredients FROM items WHERE category_id = ?");
            $stmtItems->bind_param("i", $category['id']);
            $stmtItems->execute();
            $itemsResult = $stmtItems->get_result();

            $items = [];
            while ($item = $itemsResult->fetch_assoc()) {
                $item['ingredients'] = json_decode($item['ingredients'], true);
                $items[] = $item;
            }

            $stmtItems->close();

            $category['items'] = $items;

            echo json_encode([
                "status" => "success",
                "message" => "Categoria atualizada com sucesso",
                "category" => $category
            ]);
        } else {
            http_response_code(404);
            echo json_encode(["status" => "fail", "message" => "Categoria não encontrada"]);
        }
    } catch (Exception $e) {
        $conn->rollback();
        http_response_code(500);
        echo json_encode(["status" => "fail", "message" => "Erro ao atualizar categoria", "error" => $e->getMessage()]);
    }
}

