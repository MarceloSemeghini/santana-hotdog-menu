<?php
require_once 'bootstrap.php';
require_once 'vendor/autoload.php';

global $key;

use \Firebase\JWT\JWT;

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->email) || !isset($data->password)) {
        echo json_encode([
            "status" => "fail",
            "message" => "Email e senha são obrigatórios"
        ]);
        exit();
    }

    $email = $data->email;
    $password = $data->password;

    $stmt = $conn->prepare("SELECT id, email, password FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($userRow = $result->fetch_assoc()) {
        if (password_verify($password, $userRow["password"])) {
            $key;
            $issuedAt = time();
            $expirationTime = $issuedAt + (10 * 60 * 60);
            $payload = [
                'iat' => $issuedAt,
                'exp' => $expirationTime,
                'userId' => $userRow['id'],
                'email' => $userRow['email']
            ];

            $token = JWT::encode($payload, $key, 'HS256');

            echo json_encode([
                "status" => "success",
                "message" => "Login bem-sucedido",
                "token" => $token
            ]);
        } else {
            echo json_encode([
                "status" => "fail",
                "message" => "Senha inválida"
            ]);
        }
    } else {
        echo json_encode([
            "status" => "fail",
            "message" => "Usuário não encontrado"
        ]);
    }

    $stmt->close();
    $conn->close();
} else {
    echo json_encode([
        "status" => "fail",
        "message" => "Método não permitido"
    ]);
}
