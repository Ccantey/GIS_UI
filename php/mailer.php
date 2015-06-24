<?php
/* Set e-mail recipient */
$myemail = "";

/* Check all form inputs using check_input function */
$name = check_input($_POST['inputName'], "Your Name");
$email = check_input($_POST['inputEmail'], "Your E-mail Address");
$subject = check_input($_POST['inputSubject'], "Message Subject");
$message = check_input($_POST['inputMessage'], "Your Message");

//$from_add = $email;  //"email From - required"
$headers = "From: $email \r\n";
$headers .= "Reply-To: $email \r\n";
$headers .= "Return-Path: $email\r\n";
$headers .= "X-Mailer: PHP \r\n";

/* If e-mail is not valid show error message */
if (!preg_match("/([\w\-]+\@[\w\-]+\.[\w\-]+)/", $email))
{
show_error("Invalid e-mail address");
}

$message = "
Someone has sent you a message from your.org/CityViewer using the contact form:

Name: $name
Email: $email
Subject: $subject

Message:
$message

";



/* Send the message using mail() function */
mail($myemail, $subject, $message, $headers);

/* Redirect visitor to the thank you page */
echo '<script type="text/javascript">'
   , 'alert("Your message has been sent to GIS staff. Thank you.");'
   , 'window.location.replace("http://your.org/CityViewer/");'
   , '</script>'
;

exit();

/* Functions we used */
function check_input($data, $problem='')
{
$data = trim($data);
$data = stripslashes($data);
$data = htmlspecialchars($data);
if ($problem && strlen($data) == 0)
{
show_error($problem);
}
return $data;
}

function show_error($myError)
{
?>
<html>
<body>

<p>Please correct the following error:</p>
<strong><?php echo $myError; ?></strong>
<p>Hit the back button and try again</p>

</body>
</html>
<?php
exit();
}
?>