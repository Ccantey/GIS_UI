<?php


// $ip = array();
// $ip[] = '75.149.158.33';
// $ip[] = '23.30.246.33';
// $ip[] = '67.137.181.146';
// $ip[] = '207.173.231.98';

echo testIP();
//echo $_SERVER['HTTP_X_FORWARDED_FOR'];
function testIP(){
    $uid = file_get_contents("C:\inetpub\wwwroot\CityViewer\User.txt");
    $pwd = file_get_contents("C:\inetpub\wwwroot\CityViewer\Password.txt");

    return $uid . ':' . $pwd;
    // for($i=0, $cnt=count($ip); $i<$cnt; $i++) {
    //                             $ipregex = preg_replace("/\./", "\.", $ip[$i]);
    //                             $ipregex = preg_replace("/\*/", ".*", $ipregex);
    //                             if(preg_match('/^'.$ipregex.'/', $_SERVER['HTTP_X_FORWARDED_FOR']))
    //                                             return $uid . ':' . $pwd;
    // }
    // return "nomatch";
}
?>
