<?php


//$mailLabelFieldsString = "Ownname,MailAddr,MailCity,MailState,MailZip";
//                            0          1        2         3
$mailLabelFieldsString = "OwnerName,Adddress,MAILADDLN1,MAILADDLN2,CITYSTZIP";

require('fpdf.php');
$pdf=new FPDF();
$pdf->AliasNbPages();
$pdf->SetFont('Arial','B',10);
$pdf->AddPage();
$pdf->SetAutoPageBreak('0','5');

$serverName = ""; //serverName\instanceName
$connectionInfo = array( "Database"=>"", "UID"=>"", "PWD"=>"");
$conn = sqlsrv_connect( $serverName, $connectionInfo);

if(!$conn )
{
     die( print_r( sqlsrv_errors(), true) );
}

$q = $_POST["q"];
$str = "('" . implode($q,"','") . "')";


$sql = "SELECT distinct $mailLabelFieldsString FROM PARCEL where ParcelNo in $str";

$stmt = sqlsrv_query( $conn, $sql );
if( $stmt === false) {
	die( print_r( sqlsrv_errors(), true) );
}
$results = array();
$ob_file = fopen('residentMails.txt','w');

while( $row = sqlsrv_fetch_array( $stmt, SQLSRV_FETCH_NUMERIC) ) {
  $needle = str_replace(" ", "", $row[1]);
  $haystack = str_replace(" ", "", $row[2]);
  similar_text($needle, $haystack, $percent);
   if($percent> 95 ){
     fwrite($ob_file,str_replace(',', '-', $row[0]).", ".$row[2].", ".$row[4]);
     fwrite($ob_file,"\r\n");
   }
   else{    
       fwrite($ob_file,"Current Resident" . ", " .$row[1] . ",Wisconsin Rapids WI 54494");
       fwrite($ob_file,"\r\n");     
   }  
   
}
sqlsrv_close( $conn);

fclose($ob_file);


$y = 10;
$x = 2;
$l = 0;
$pb = 0;

$list = file('residentMails.txt');

$y = 12;
$x = 4;
$l = 0;
$pb = 0;

for($j=0;$j<sizeof($list)/3;$j++){
  if($pb == 10 || $pb == 20 || $pb == 30 || $pb == 40 || $pb == 50 || $pb == 60 || $pb == 70 || $pb == 80 || $pb == 90 || $pb == 100 || $pb == 110 || $pb == 120 || $pb == 130 || $pb == 140 || $pb == 150 || $pb == 160 || $pb == 170 || $pb == 180 || $pb == 190 || $pb == 200 || $pb == 210 || $pb == 220 || $pb == 230 || $pb == 240 || $pb == 250 || $pb == 260 || $pb == 270 || $pb == 280 || $pb == 290 || $pb == 300 || $pb ==310 || $pb == 320 || $pb == 330 || $pb >= 340 || $pb == 350 || $pb ==360 || $pb == 370 || $pb == 380 || $pb >= 390 || $pd == 400 ){
  $pdf->AddPage();
  $y = 10;
  $x = 2;  
  }
  for ($i=0;$i<3;$i++){
   $data = explode(',' , $list[$i + $l]);
   if ( strlen($data[0]) > 40) {
     $pdf->SetFont('Arial','B',8);
     $maxLine = 30;
     $str = explode("\n", wordwrap($data[0], $maxLine));
     $result = array( $str[0], $str[1]);
	   $pdf->Text($x + 2,$y + 5,$str[0]);
	   $pdf->Text($x + 2,$y + 10,$str[1]);
     $pdf->Text($x + 2,$y + 15,$data[1]);
     $pdf->Text($x + 2,$y + 20,$data[2]);
   }
   else {
     $pdf->SetFont('Arial','B',8);
     $pdf->Text($x + 2,$y + 7,$data[0]);
     $pdf->Text($x + 2,$y + 12,$data[1]);
     $pdf->Text($x + 2,$y + 17,$data[2]);
   }
   
   $x = $x + 75;
  }
 $l  = $l + 3;
 $y = $y + 28;
 $x = 2;
 $pb = $pb + 1;
}


$mailName = "temp/mailLabel_" . rand() . ".pdf";
$pdf->Output($mailName,"F");
echo $mailName;

?>