var 
	lasttimestamp;

// Matrices
var 
	A,
	B,
	H,
	Q,
	R;

var 
	kalman_x_last,
	kalman_p_last;

function initializekalman()
{
	A = $M([
		[1, 0, 0.01, 0],
		[0, 1, 0, 0.01],
		[0, 0, 1, 0],
		[0, 0, 0, 1]
	]);
	
	B = $M([
		[1, 0, 0, 0],
		[0, 1, 0, 0],
		[0, 0, 1, 0],
		[0, 0, 0, 1]
	]);

	H = $M([
		[1, 0, 0, 0],
		[0, 1, 0, 0],
		[0, 0, 1, 0],
		[0, 0, 0, 1]
	]);

	Q = $M([
		[0.001, 0, 0, 0],
		[0, 0.001, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0]
	]);

	R = $M([
		[0.1, 0, 0, 0],
		[0, 0.1, 0, 0],
		[0, 0, 0.1, 0],
		[0, 0, 0, 0.1]
	]);
	
	kalman_x_last = $V([0,0,0,0]);
	kalman_p_last = $M([
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0]
	]);
	
	// Speichere den letzten Zeitstempel
	lasttimestamp = new Date().getTime();
}

function pushPosition(x, y)
{
	// Prüfe, ob 
	var currenttimestamp = new Date().getTime();
	if (lasttimestamp > currenttimestamp)
	{
		// Ein Überlauf hat stattgefunden
		lasttimestamp = currenttimestamp;
	}
	else 
	{
		// Berechne die Zeitdifferenz seit der letzten Schätzung
		var timedifference = currenttimestamp - lasttimestamp;
		if (timedifference > 10)
		{
			// Speichere den letzten Zeitstempel
			lasttimestamp = currenttimestamp;
			
			// Erstelle den Mess- und den Kontrollvektor
			var measurement = $V([
				x, 
				y, 
				(x - kalman_x_last.elements[0]) / (timedifference / 1000.0), 
				(y - kalman_x_last.elements[1]) / (timedifference / 1000.0)
			]);
			var control = $V([0, 0, 0, 0]); // TODO - adjust
			
			// prediction
			var kalman_x = (A.multiply(kalman_x_last)).add(B.multiply(control));
			var kalman_p = ((A.multiply(kalman_p_last)).multiply(A.transpose())).add(Q); 

			// correction
			var kalman_s = ((H.multiply(kalman_p)).multiply(H.transpose())).add(R);
			var kalman_k = (kalman_p.multiply(H.transpose())).multiply(kalman_s.inverse());
			var kalman_y = measurement.subtract(H.multiply(kalman_x));

			// Bestimme die aktuelle Schätzposition
			kalman_x_last = kalman_x.add(kalman_k.multiply(kalman_y));
			kalman_p_last = ((Matrix.I(4)).subtract(kalman_k.multiply(H))).multiply(kalman_p);
			
			// Gebe die aktuelle Schätzposition aus
		}
	}
	return {
			x : kalman_x_last.elements[0],
			y : kalman_x_last.elements[1]
			};
}

$(window).ready(function() 
{
	initializekalman();
	
	
	
});