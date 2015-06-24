<?php

$q = $_POST["q"];

echo $q;

$myFile = "televising.html";
$fh = fopen($myFile, 'w') or die("can't open file");

$stringData = '<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<script src="mediaelement/jquery.js"></script>
	<script src="mediaelement/mediaelement-and-player.min.js"></script>
	<link rel="stylesheet" href="mediaelement/mediaelementplayer.min.css" />
    <link rel="stylesheet" href="mediaelement/mejs-skins.css" />
</head>
<body>
<p>
<video width="620px" height="470px" src=';

$stringData = $stringData . '"' . 'https://s3.amazonaws.com/WSB/SewerTelevising/WyomingMN/2013/Video/' . $q . '"';

$stringData2  = ' type="video/mp4"
	id="player1" controls="controls" preload="none"></video>
</p>
<script>
$("audio,video").mediaelementplayer({
	ipadUseNativeControls: true,
	alwaysShowControls: false
});

</script>


</body>
</html>';

$stringDataMain = $stringData . $stringData2;


fwrite($fh, $stringDataMain);


fclose($fh);


?>