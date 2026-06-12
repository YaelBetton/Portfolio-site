<?php

$discord_webhook = "https://discord.com/api/webhooks/1514885929196720236/u9ISpk5jnWgkvB9jiWdVRbplxLOWpqIf8fWwSCsWTQo6aL-7grwbzQFR8jZDn20-S2U_";

$recipient_email = "yaelbetton@gmail.com"; // fallback email si pas de webhook
$subject_prefix = "[Portfolio] ";
$sender_email = $recipient_email;
$redirect_success = "portfolio-yael-betton_2.html?mail=ok#contact";
$redirect_error = "portfolio-yael-betton_2.html?mail=error#contact";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Location: portfolio-yael-betton_2.html");
    exit;
}

$name = trim((string) filter_input(INPUT_POST, 'name', FILTER_SANITIZE_FULL_SPECIAL_CHARS));
$email = trim((string) filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL));
$subject = trim((string) filter_input(INPUT_POST, 'subject', FILTER_SANITIZE_FULL_SPECIAL_CHARS));
$message = trim((string) filter_input(INPUT_POST, 'message', FILTER_SANITIZE_FULL_SPECIAL_CHARS));
$honeypot = trim((string) filter_input(INPUT_POST, 'website', FILTER_SANITIZE_FULL_SPECIAL_CHARS));

/* Anti-spam : si le champ caché est rempli, on fait semblant que tout va bien */
if ($honeypot !== '') {
    header("Location: $redirect_success");
    exit;
}

if ($name === '' || $email === '' || $subject === '' || $message === '') {
    header("Location: $redirect_error");
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header("Location: $redirect_error");
    exit;
}

if (strlen($message) > 3000) {
    header("Location: $redirect_error");
    exit;
}

$sent = false;

/* ============ Envoi vers Discord (webhook) ============ */
if ($discord_webhook !== '' && str_starts_with($discord_webhook, 'https://discord.com/api/webhooks/')) {

    $payload = json_encode([
        // Décommente la ligne suivante pour être mentionné à chaque message :
        // "content" => "@everyone",
        "username" => "Portfolio — yaelbetton.dev",
        "embeds" => [[
            "title"       => "📬 " . mb_substr($subject, 0, 240),
            "description" => mb_substr($message, 0, 4000),
            "color"       => 16757844, // ambre #FFB454, la couleur du site
            "fields"      => [
                ["name" => "Nom",   "value" => mb_substr($name, 0, 1000),  "inline" => true],
                ["name" => "Email", "value" => mb_substr($email, 0, 1000), "inline" => true],
            ],
            "footer"      => ["text" => "Formulaire de contact du portfolio"],
            "timestamp"   => gmdate('c'),
        ]],
    ], JSON_UNESCAPED_UNICODE);

    $ch = curl_init($discord_webhook);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 10,
    ]);
    curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $sent = ($http_code >= 200 && $http_code < 300);
}

/* ============ Fallback email si Discord indisponible / non configuré ============ */
if (!$sent) {
    $email_subject = $subject_prefix . $subject;
    $email_body = "Nouveau message depuis le portfolio\n\n";
    $email_body .= "Nom: $name\n";
    $email_body .= "Email: $email\n";
    $email_body .= "Sujet: $subject\n\n";
    $email_body .= "Message:\n$message\n";

    $headers = array(
        "From: Portfolio <$sender_email>",
        "Reply-To: $name <$email>",
        "Content-Type: text/plain; charset=UTF-8",
        "X-Mailer: PHP/" . phpversion()
    );
    $headers_string = implode("\r\n", $headers);
    $additional_params = "-f $sender_email";

    $sent = mail($recipient_email, $email_subject, $email_body, $headers_string, $additional_params);
}

header("Location: " . ($sent ? $redirect_success : $redirect_error));
exit;
