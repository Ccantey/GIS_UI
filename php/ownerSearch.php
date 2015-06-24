<?php

$serverName = ""; //serverName\instanceName
$connectionInfo = array( "Database"=>"", "UID"=>"", "PWD"=>"");
$conn = sqlsrv_connect( $serverName, $connectionInfo);

if( !$conn )
{
     return;
}
$q = $_GET["term"];

//$str = str_replace(" ","%",$q);
$sql = "SELECT DISTINCT UPPER(OwnerName) AS OwnerName FROM PARCEL where OwnerName LIKE '%$q%' AND (CivilDivision = '13' OR CivilDivision = '18' OR CivilDivision = '7' OR CivilDivision = '24' OR CivilDivision = '28' OR CivilDivision = '21' OR CivilDivision = '19' OR CivilDivision = '34' OR CivilDivision = '27' ) ORDER BY OwnerName ASC";


//$sql = "SELECT * FROM dbo.PARCELA where OBJECTID = 10";
$stmt = sqlsrv_query( $conn, $sql );
if( $stmt === false) {
	die( print_r( sqlsrv_errors(), true) );
}


//echo $stmt;
$results = array();
$i = 0;
$cname = array();
while( $row = sqlsrv_fetch_array( $stmt, SQLSRV_FETCH_ASSOC) ) {
   $cname[] = $row['OwnerName']; 
   
}

echo json_encode($cname);
sqlsrv_close( $conn);


?>