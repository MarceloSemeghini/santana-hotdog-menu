<?php
require_once 'bootstrap.php';
require_once 'vendor/autoload.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

header("Content-Type: application/json");

$headers = getallheaders();
$authHeader = $headers["Authorization"] ?? "";

if (!$authHeader || !str_starts_with($authHeader, "Bearer ")) {
    echo json_encode(["valid" => false, "message" => "Token ausente"]);
    exit();
}

$token = str_replace("Bearer ", "", $authHeader);
global $key;

try {
    $decoded = JWT::decode($token, new Key($key, 'HS256'));
    echo json_encode(["valid" => true, "user" => $decoded]);
} catch (Exception $e) {
    echo json_encode(["valid" => false, "message" => "Token inválido ou expirado"]);
}
