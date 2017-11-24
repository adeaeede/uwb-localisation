/* #TI4: Praktikum
#UWB Lokalisierung
#Adrian Gruszczynski
#Anna/e Eckhardt
#Tobias Hellwig*/
var broker	= "160.45.114.181"; 
var port 	= 50001
var max		= 100;
var min 	= 1;
var id 		= "IoT_Board-" +  Math.floor(( Math.random() * (max - min + 1) ) + min);

var client 	= new Paho.MQTT.Client(broker, port, id);

var itext = 0;

//========================================================
// Anmeldung beim Broker
//========================================================

//#######################
function mqttws_start()
//#######################
{
	console.log('mqttstart!');
	client.onConnectionLost = onConnectionLost;
	client.onMessageArrived = onMessageArrived;
	client.connect(	{	
				timeout: 3,
				onSuccess: 	onBroker_pub_sub,
				onFailure:	onError
				});
}

function onConnectionLost(responseObject)
{
	console.log("connection lost: " + responseObject.errorMessage);
}


function onMessageArrived(message)
{
	//console.log(message.destinationName, ' -- ', message.payloadString);

// Quaternion des IoT-Boards und Abstand des IoT-Boards zu den Ankerpunkten
// - Topic: hwp1/q - Daten: x;y;z;w;r1;r2;r3;r4

if (message.destinationName == "hwp1/q")
	{
		var quaternion = message;
		var qx = parseFloat(quaternion[0]);
		var qy = parseFloat(quaternion[1]);
		var qz = parseFloat(quaternion[2]);
		var qw = parseFloat(quaternion[3]);
		setQuaternion(qx, qy, qz, qw);
		
		if (r1 >=0 ) {p1.r = r1;}
		
		var r1 = parseFloat(quaternion[4])*100;
		var r2 = parseFloat(quaternion[5])*100;
		var r3 = parseFloat(quaternion[6]-1)*100;
		var r4 = parseFloat(quaternion[7]-1)*100;
		
		if (r1 >=0 ) {p1.r = r1;}
		if (r2 >=0 ) {p2.r = r2;}
		if (r3 >=0 ) {p3.r = r3;}
		if (r4 >=0 ) {p4.r = r4;}
		
		
		sphere[2].scale.set(p1.r,p1.r,p1.r); 
		sphere[2].matrixAutoUpdate = true;	
		
		sphere[4].scale.set(p2.r,p2.r,p2.r); 
		sphere[4].matrixAutoUpdate = true;	
		
		sphere[6].scale.set(p3.r,p3.r,p3.r); 
		sphere[6].matrixAutoUpdate = true;
		
		sphere[8].scale.set(p4.r,p4.r,p4.r); 
		sphere[8].matrixAutoUpdate = true;
		
		itext = itext + 1 ;
		var myDiv = document.getElementById("meldung");
  		if (itext<30){
  		myDiv.innerHTML = myDiv.innerHTML + '</br>' + quaternion[0]+' '+quaternion[1]+' '+quaternion[2]+' '+quaternion[3];
		}
		if (itext>=30)
		{
		myDiv.innerHTML = quaternion[4]+' '+quaternion[5]+' '+quaternion[6]+' '+quaternion[7];
		itext = 0;
		}

		
	}
	
// Quaternion des IoT-Boards - Topic: hwp1/qu - Daten: x;y;z;w
	if (message.destinationName == "hwp1/qu")
	{
		var quaternion = message;
		var qx = parseFloat(quaternion[0]);
		var qy = parseFloat(quaternion[1]);
		var qz = parseFloat(quaternion[2]);
		var qw = parseFloat(quaternion[3]);
		setQuaternion(qx, qy, qz, qw);
	}
// Abstand des IoT-Boards zu den Ankerpunkten - Topic: hwp1/ab - Daten: r1;r2;r3;r4	
	// if (message.destinationName == "hwp1/ab")
	// {
		var quaternion = message;
		// var quaternion = message.payloadString.split(";");
		// var quaternion = message.payloadString.split(";");
		p1.r = parseFloat(quaternion[0])*100;
		p2.r = parseFloat(quaternion[1])*100;
		p3.r = parseFloat(quaternion[2])*100;
		p4.r = parseFloat(quaternion[3])*100;
		
		sphere[2].scale.set(p1.r,p1.r,p1.r); 
		sphere[2].matrixAutoUpdate = true;	
		
		sphere[4].scale.set(p2.r,p2.r,p2.r); 
		sphere[4].matrixAutoUpdate = true;	
		
		sphere[6].scale.set(p3.r,p3.r,p3.r); 
		sphere[6].matrixAutoUpdate = true;
		
		sphere[8].scale.set(p4.r,p4.r,p4.r); 
		sphere[8].matrixAutoUpdate = true;
		
		itext = itext + 1 ;
		var myDiv = document.getElementById("meldung");
  		if (itext<30){
  		myDiv.innerHTML = myDiv.innerHTML + '</br>' + message
		}
		if (itext>=30)
		{
		myDiv.innerHTML = message.payloadString;
		itext = 0;
		}
	// }

// Ankerkoordinate - Topic:hwp1/a1 - Daten: x;y;z
	if (message.destinationName == "hwp1/a1")
	{
		var quaternion = message.payloadString.split(";");
		p1.x = parseFloat(quaternion[0]);
		p1.y = parseFloat(quaternion[1]);
		p1.z = parseFloat(quaternion[2]);
		
		sphere[1].position.set(p1.x,p1.y,p1.z);	
		sphere[1].matrixAutoUpdate = true;	
		
		sphere[2].position.set(p1.x,p1.y,p1.z);	
		sphere[2].matrixAutoUpdate = true;
	}

// Ankerkoordinate - Topic:hwp1/a2 - Daten: x;y;z
	if (message.destinationName == "hwp1/a2")
	{
		var quaternion = message.payloadString.split(";");
		p2.x = parseFloat(quaternion[0]);
		p2.y = parseFloat(quaternion[1]);
		p2.z = parseFloat(quaternion[2]);
		
		sphere[3].position.set(p2.x,p2.y,p2.z);	
		sphere[3].matrixAutoUpdate = true;		
		
		sphere[4].position.set(p2.x,p2.y,p2.z);	
		sphere[4].matrixAutoUpdate = true;	
	}

// Ankerkoordinate - Topic:hwp1/a3 - Daten: x;y;z

	if (message.destinationName == "hwp1/a3")
	{
		var quaternion = message.payloadString.split(";");
		p3.x = parseFloat(quaternion[0]);
		p3.y = parseFloat(quaternion[1]);
		p3.z = parseFloat(quaternion[2]);
		
		sphere[5].position.set(p3.x,p3.y,p3.z);	
		sphere[5].matrixAutoUpdate = true;	
				
		sphere[6].position.set(p3.x,p3.y,p3.z);	
		sphere[6].matrixAutoUpdate = true;	
	}

// Ankerkoordinate - Topic:hwp1/a4 - Daten: x;y;z
		
	if (message.destinationName == "hwp1/a4")
	{
		var quaternion = message.payloadString.split(";");
		p4.x = parseFloat(quaternion[0]);
		p4.y = parseFloat(quaternion[1]);
		p4.z = parseFloat(quaternion[2]);
		
		sphere[7].position.set(p4.x,p4.y,p4.z);	
		sphere[7].matrixAutoUpdate = true;	
				
		sphere[8].position.set(p4.x,p4.y,p4.z);	
		sphere[8].matrixAutoUpdate = true;	
	}
}


function onBroker_pub_sub(context)
{	client.subscribe('hwp1/q' , {qos: 0});
	client.subscribe('hwp1/qu', {qos: 0});
	client.subscribe('hwp1/ab', {qos: 0});
	client.subscribe('hwp1/a1', {qos: 0});
	client.subscribe('hwp1/a2', {qos: 0});
	client.subscribe('hwp1/a3', {qos: 0});
	client.subscribe('hwp1/a4', {qos: 0});
}

 	
function onError(message)
{
	console.log("Connection failed: " + message.errorMessage);
}

 	
function unsubscribeSuccess(context)
{
    console.info('Successfully unsubscribed from ' + context.invocationContext.topic);
}

 
function unsubscribeFailure(context)
{
    console.info('Failed to  unsubscribe from ' + context.invocationContext.topic);
}

