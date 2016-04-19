<?php
	ini_set("display_errors", 1);					
	$db = "lafuente_flisol2015";	
	$dbuser = "lafuente_flisol"; 					
	$dbpass = "__Peron.LF.flisol__"; 
	try {
	    $conn = new PDO("mysql:host=localhost;dbname=lafuente_flisol2015", $dbuser, $dbpass);
	    // set the PDO error mode to exception
	    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	    $stmt = $conn->prepare("INSERT INTO inscriptos(`nombre`, `apellido`, `email`) VALUES ( :nombre, :apellido, :email)");
		$stmt->execute(array(':nombre' => $_POST["nombre"], ':apellido' => $_POST["apellido"], ':email' => $_POST["email"]));
		$msj="El registro se realizo correctamente";
	}
	catch(PDOException $e){
    	if ($e->getCode() == 23000) {
	    	$msj= 'El Mail ya esta registrado!';
	    } else{
	    	$msj= 'Hubo un error, no pudimos realizar la inscripcion :( manda un mail a lafuenteunlp@gmail.com';
	    }
	}

    echo $msj;
?>
