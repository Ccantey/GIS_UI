<?php

echo testIP();
//echo $_SERVER['HTTP_X_FORWARDED_FOR'];
function testIP(){
    $uid = file_get_contents("C:\inetpub\wwwroot\CityViewer\User.txt");
    $pwd = file_get_contents("C:\inetpub\wwwroot\CityViewer\Password.txt");

    return $uid . ':' . $pwd;

}
?>
