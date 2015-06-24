<?php

$serverName = "cowr-fs3.cowr.local\WIRapids_GIS"; //serverName\instanceName
$connectionInfo = array( "Database"=>"gisWiRapids", "UID"=>"LGIM", "PWD"=>"WiscRapidsGIS");
$conn = sqlsrv_connect( $serverName, $connectionInfo);

if( !$conn )
{
     return;
}
$q = $_GET["term"];
//$str = str_replace(" ","%",$q);
$sql = "SELECT TOP 1000 PARCELNO FROM LGIM.PARCEL where PARCELNO LIKE '$q%' AND (CivilDivision = '13' OR CivilDivision = '18' OR CivilDivision = '7' OR CivilDivision = '24' OR CivilDivision = '28' OR CivilDivision = '21' OR CivilDivision = '19' OR CivilDivision = '34' OR CivilDivision = '27' ) ORDER BY PARCELNO ASC"; // 'q% to match only the beginning

$stmt = sqlsrv_query( $conn, $sql );
if( $stmt === false) {
	die( print_r( sqlsrv_errors(), true) );
}

$cname = array();
while( $row = sqlsrv_fetch_array( $stmt, SQLSRV_FETCH_ASSOC) ) {
   $cname[] = $row['PARCELNO'];
}

echo json_encode($cname);
sqlsrv_close( $conn);


?>