<?php
header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Collect and sanitize input
    $name = strip_tags(trim($_POST["name"]));
    $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
    $phone = strip_tags(trim($_POST["phone"]));
    $service = strip_tags(trim($_POST["service"]));
    $message = strip_tags(trim($_POST["message"]));

    // Destination Email
    $to = "contato@grupolitoralseg.com.br";

    // Email Subject
    $subject = "=?UTF-8?B?" . base64_encode("Novo Orçamento: $name - $service") . "?=";

    // Email Body
    $email_content = "Novo contato recebido pelo site:\n\n";
    $email_content .= "Nome: $name\n";
    $email_content .= "E-mail: $email\n";
    $email_content .= "Telefone: $phone\n";
    $email_content .= "Serviço: $service\n\n";
    $email_content .= "Mensagem:\n$message\n";

    // Email Headers
    $headers = "From: contato@grupolitoralseg.com.br\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    // Send the email
    if (mail($to, $subject, $email_content, $headers)) {
        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Mensagem enviada com sucesso!"]);
    }
    else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Ocorreu um erro ao enviar o e-mail."]);
    }

}
else {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Método não permitido."]);
}
?>
