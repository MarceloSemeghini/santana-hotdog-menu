<?php
// Verifica se um valor foi enviado via POST
$senha = $_POST['senha'] ?? '';
$hash = '';

if (!empty($senha)) {
    $hash = password_hash($senha, PASSWORD_DEFAULT);
}
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Gerador de Hash (PHP)</title>
    <style>
        body { font-family: sans-serif; max-width: 500px; margin: 40px auto; }
        input[type="text"], input[type="submit"] {
            padding: 10px; width: 100%; margin: 10px 0; box-sizing: border-box;
        }
        .hash { background: #f5f5f5; padding: 10px; word-break: break-all; border-radius: 4px; }
    </style>
</head>
<body>
    <h2>🔐 Gerador de Hash (PHP - password_hash)</h2>
    <form method="POST">
        <label>Digite a senha:</label>
        <input type="text" name="senha" required placeholder="Ex: senha123">
        <input type="submit" value="Gerar hash">
    </form>

    <?php if ($hash): ?>
        <h3>✅ Hash gerado:</h3>
        <div class="hash"><?php echo htmlspecialchars($hash); ?></div>
    <?php endif; ?>
</body>
</html>
