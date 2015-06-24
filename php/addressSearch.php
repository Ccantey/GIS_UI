<?php

$serverName = ""; //serverName\instanceName
$connectionInfo = array( "Database"=>"", "UID"=>"", "PWD"=>"");
$conn = sqlsrv_connect( $serverName, $connectionInfo);

if( !$conn )
{
     return;
}
//$q = addslashes($_GET["q"]);
$q = $_GET["term"];

$sql = "SELECT Adddress FROM PARCEL where Adddress LIKE '%$q%' AND (CivilDivision = '13' OR CivilDivision = '18' OR CivilDivision = '7' OR CivilDivision = '24' OR CivilDivision = '28' OR CivilDivision = '21' OR CivilDivision = '19' OR CivilDivision = '34' OR CivilDivision = '27' ) ORDER BY Adddress ASC"; // 'q% to match only the beginning

$stmt = sqlsrv_query( $conn, $sql );
if( $stmt === false) {
	die( print_r( sqlsrv_errors(), true) );
}
$results = array();
$i = 0;
$cname = array();
while( $row = sqlsrv_fetch_array( $stmt, SQLSRV_FETCH_ASSOC) ) {

	$cname[] = $row['Adddress'];
}

echo json_encode($cname);
sqlsrv_close( $conn);


?>