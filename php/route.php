<?php
	if (isset($_POST['data']) === true) {
		$myRouteParam = json_decode($_POST['data'], true);
		$connect = mysqli_connect('localhost', 'root', '7453', 'ajaxdb');
		
		$insertQuery = "
			INSERT INTO two_points_route_parameters (name, distance, duration) 
			VALUES ('".$myRouteParam[0]['Name']."', ".$myRouteParam[0]['Distance'].", ".$myRouteParam[0]['Duration'].")
		";
		mysqli_query($connect, $insertQuery);
		
		$selectQuery = "
			SELECT *
			FROM `two_points_route_parameters`
			WHERE (`distance` < 10000) OR (`duration` < 1000);
		";
		$result = mysqli_query($connect, $selectQuery);
		
		while($row = mysqli_fetch_assoc($result))
			$rows[] = $row;
		echo json_encode([$rows[0]['name'], $rows[0]['distance'], $rows[0]['duration']]);
	}
?>


