<?php

$q = $_POST["q"];


$ob_file = fopen('parcelInfo.csv','w');
$csvInfo = $q;
for($k=0;$k<sizeof($csvInfo);$k++){
   fwrite($ob_file,$csvInfo[$k]);
   fwrite($ob_file,"\r\n");
}
echo "done";
fclose($ob_file);

?>