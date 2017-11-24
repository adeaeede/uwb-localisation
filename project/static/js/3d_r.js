/* #TI4: Praktikum
#UWB Lokalisierung
#Adrian Gruszczynski
#Anna/e Eckhardt
#Tobias Hellwig*/
"{%load static%}"

// Variablen für die Visualisieung 
// der Position im Raum

var scene;
var camera;
var renderer;
var dae1;
var skin1;
var material;

var sphere = [];

var photo_sphereMesh;
var photo_sphere;
var gridXY;
var K62;
var K63;
var Innenhof;
var lageplan;
var photo_sphereMaterial;


var testmesh;
var testgeometry
var testmaterial


// Koordinaten der Ankerknoten 
var	p1 = { x: -1000, y:   0, z: -1000, r: 1 };
var	p2 = { x: +1000, y:  0, z: -1000, r: 1 };
var	p3 = { x: -1000	, y: 0, z: +1000, r: 1 };
var	p4 = { x: +1000, y:  0, z: +1000, r: 1 };

// Koordinaten Sensorknoten
var p5 = null;
var p5error = null;
var p5_checkdistance_z = 1;
var p5_checkdistance_xy = 1;



// Berechnet das Fehlerfunktional (Knotenposition: xn,yn,zn; Ankerposition: xa,ya,za; Abstand: dist )
function calculateerror(xn, yn, zn, xa, ya, za, dist)
{
	var squaredist_measured = dist;
	//var squaredist_current = Math.sqrt(Math.pow(xn-xa, 2) + Math.pow(yn-ya, 2) + Math.pow(zn-za, 2));
	var squaredist_current = Math.sqrt(Math.pow(xn-xa, 2) + Math.pow(yn-ya, 2) + Math.pow(zn-za, 2));

	return Math.pow(squaredist_measured - squaredist_current, 2);
}



//#######################
function animate()
//#######################
{	// Näherungslösung
	if (p5)
	{
		
	
		p5error = 	calculateerror(p5.x, p5.y, p5.z, p1.x, p1.y, p1.z, p1.r) + 
					calculateerror(p5.x, p5.y, p5.z, p2.x, p2.y, p2.z, p2.r) + 
					calculateerror(p5.x, p5.y, p5.z, p3.x, p3.y, p3.z, p3.r) +
					calculateerror(p5.x, p5.y, p5.z, p4.x, p4.y, p4.z, p4.r);
		
		var schrittweite = Math.sqrt(p5error/4) / 2;
		var x0 = p5.x;
		var y0 = p5.y;
		var z0 = p5.z;
		var x1 = p5.x;
		var y1 = p5.y;
		var z1 = p5.z;
		
		for (x=-1;x<=2;x+=2)
		{
			for (z=-1;z<=2;z+=2)
			{
				var p5xnew = x0 + x * schrittweite ;
				var p5ynew = y0 ; // DOTO
				var p5znew = z0 + z * schrittweite ;
				
				var p5errornew = calculateerror(p5xnew, p5ynew, p5znew, p1.x, p1.y, p1.z, p1.r) + 
						 		 calculateerror(p5xnew, p5ynew, p5znew, p2.x, p2.y, p2.z, p2.r) + 
 						 		 calculateerror(p5xnew, p5ynew, p5znew, p3.x, p3.y, p3.z, p3.r) +
						 		 calculateerror(p5xnew, p5ynew, p5znew, p4.x, p4.y, p4.z, p4.r);
		
				if (p5errornew < p5error)
				{
					x1 = p5xnew;
					y1 = p5ynew;
					z1 = p5znew;
					p5error = p5errornew;
				
				}
			}
		}
		
		var kalmanpunkt = pushPosition(x1, z1);
		p5.x = kalmanpunkt.x;
		p5.y = y1; // DOTO
		p5.z = kalmanpunkt.y;		
							
		sphere[0].position.set(x1,y1,z1);	
		sphere[0].matrixAutoUpdate = true;	
			
		if (dae1)
		{
			dae1.position.set(p5.x,p5.y,p5.z);
			dae1.matrixAutoUpdate = true;
		}
	}
	else
	{
		p5 = {
			x : (p1.x + p2.x + p3.x + p4.x) / 4,
			y : (p1.y + p2.y + p3.y + p4.y) / 4,
			z : (p1.z + p2.z + p3.z + p4.z) / 4
		}
		
		p5error = 	calculateerror(p5.x, p5.y, p5.z, p1.x, p1.y, p1.z, p1.r) + 
					calculateerror(p5.x, p5.y, p5.z, p2.x, p2.y, p2.z, p2.r) + 
					calculateerror(p5.x, p5.y, p5.z, p3.x, p3.y, p3.z, p3.r) +
					calculateerror(p5.x, p5.y, p5.z, p4.x, p4.y, p4.z, p4.r);
		
		if (dae1)
		{
			dae1.position.set(p5.x,p5.y,p5.z);
			dae1.matrixAutoUpdate = true;
		}
	}
		
	requestAnimationFrame(animate);
	controls.update();
    renderer.render(scene, camera);
}



function setQuaternion(qx, qy, qz, qw)
{
	if(dae1)
	{	
		// Anpassung der Koordinatensysteme
       var quaternion = (new THREE.Quaternion()).setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI/2);
       var sensorquaternion = new THREE.Quaternion(qw,qx,qy,qz);
       
       // Korrigiere die Sensormessung
       quaternion.multiply(sensorquaternion);
		
		// Translation und Rotation des IoT Boards aktualisieren
		//dae1.matrixAutoUpdate = true;		
		//dae1.position.set(dx,dy,dz);
		dae1.setRotationFromQuaternion(quaternion);
	}
}


//#######################	
function init_board()
//#######################
{
	var loader = new THREE.ColladaLoader();
	//loader.options.convertUpAxis = true;
	loader.load(
		// Quelle	
		'CC3100.dae', 
		// Funktion wenn Quelle geladen wurde
		function (collada)
		{
			// 
			dae1 = collada.scene;
			skin1 = collada.skins[0];
			dae1.position.set(0, 0, 0); 
			dae1.scale.set(10, 10, 10);
			scene.add(dae1);
		},
		// Funktion wenn Quellen geladen wird
		function ( xhr ) 
		{
		console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
		}	
 		);
}


//#######################
function init_scene()
//#######################
{	
	// Fenstergröße
	var WIDTH = window.innerWidth;
	var HEIGHT = window.innerHeight;
	
	// renderer definieren
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(WIDTH, HEIGHT);
	document.body.appendChild(renderer.domElement);
	
	// scene definieren
	scene = new THREE.Scene();

	// Hilfsgitter XY 320cm mit Raster 10cm
	gridXY = new THREE.GridHelper(370, 25);
	gridXY.setColors(new THREE.Color(0xff0000), new THREE.Color(0x8f8f8f));
	gridXY.position.set(0, -20, 0);
	gridXY.rotation.z = 0.0;
	//scene.add(gridXY);
					
	// Hilfsachsen x-rot, y-grün, z-blau im Koordinatenursprung
	var axes = new THREE.AxisHelper(50);
	axes.position.set(0,0,0);
	scene.add(axes);


	
	//========================================================
	// Näherungspunkt und Ankerpunkte einbinden
	//========================================================
	var sphere_geometry		= [20,10,1,10,1,10,1,10,1];
	var sphere_color 		= [0x000000,0xff0000,0xff0000,0x00ff00,0x00ff00,0x0000ff,0x0000ff,0xf0f000,0xf0f000];
	var sphere_transparent 	= [false, false, true, false, true, false, true, false, true];
	var sphere_depthWrite 	= [true, true, false, true, false, true, false, true, false];
	var sphere_opacity 		= [1, 1, 0.2, 1, 0.2, 1, 0.2, 1, 0.2];
	
	var geometry;
	var material;
	var sphere_x;
	
	for ( var i=0; i<=8; i++)
	{
	geometry 	= new THREE.SphereGeometry( sphere_geometry[i], 24, 24 );
	material 	= new THREE.MeshBasicMaterial({color: sphere_color[i], transparent: sphere_transparent[i], depthWrite: sphere_depthWrite[i], opacity: sphere_opacity[i] });
	sphere_x	= new THREE.Mesh(geometry, material);
	if ( i == 0)		{ sphere_x.position.set(0,0,0); }
	if ( i == 1 || i==2){ sphere_x.position.set(p1.x,p1.y,p1.z); }
	if ( i == 3 || i==4){ sphere_x.position.set(p2.x,p2.y,p2.z); }
	if ( i == 5 || i==6){ sphere_x.position.set(p3.x,p3.y,p3.z); }
	if ( i == 7 || i==8){ sphere_x.position.set(p4.x,p4.y,p4.z); }
	sphere.push (sphere_x);
	scene.add(sphere[i]);
	}



	//========================================================
	// Lageplan einbinden
	//========================================================
	//var	tex = THREE.ImageUtils.loadTexture( "keller_halb.jpg" );
	var	tex = THREE.ImageUtils.loadTexture('/static/img/maps.png');
	//tex.wrapS = THREE.RepeatWrapping; 
	//tex.wrapT = THREE.RepeatWrapping;
	//tex.repeat.x = 1;//800 / 100;
	//tex.repeat.y = 1;//2000 / 100;
	//tex.offset.x = 0;//( 300 / 100 ) * tex.repeat.x;	
	//tex.offset.y = 0;//( 400 / 100 ) * tex.repeat.y;
	
	var	material = new THREE.MeshBasicMaterial({ map : tex });
	
	lageplan = new THREE.Mesh(new THREE.PlaneGeometry(4037, 3686), material);
	
	lageplan.material.side = THREE.DoubleSide;
	
	lageplan.position.x = -1250;
	lageplan.position.y = -30; //-130;
	lageplan.position.z = -790;
	
	lageplan.rotation.x = -2*3.141/4;
	lageplan.rotation.y = 0;
	lageplan.rotation.z = -2*3.14/4;
	
	//lageplan.scale.x = 1;
	//lageplan.scale.y = 1;
	//lageplan.scale.z = 1;
	
	scene.add(lageplan);
	
/*	//========================================================
	// Lageplan einbinden
	//========================================================
	//var	tex = THREE.ImageUtils.loadTexture( "keller_halb.jpg" );
	var	tex1 = THREE.ImageUtils.loadTexture( "Informatik.jpg" );
	//tex.wrapS = THREE.RepeatWrapping; 
	//tex.wrapT = THREE.RepeatWrapping;
	//tex.repeat.x = 1;//800 / 100;
	//tex.repeat.y = 1;//2000 / 100;
	//tex.offset.x = 0;//( 300 / 100 ) * tex.repeat.x;	
	//tex.offset.y = 0;//( 400 / 100 ) * tex.repeat.y;
	
	var	material1 = new THREE.MeshBasicMaterial({ map : tex1 });
	
	lageplan1 = new THREE.Mesh(new THREE.PlaneGeometry(24037, 23686), material1);
	
	lageplan1.material.side = THREE.DoubleSide;
	
	lageplan1.position.x = -1250;
	lageplan1.position.y = -130; //-130;
	lageplan1.position.z = -790;
	
	lageplan1.rotation.x = -2*3.141/4;
	lageplan1.rotation.y = 0;
	lageplan1.rotation.z = -2*3.14/4;
	
	//lageplan.scale.x = 1;
	//lageplan.scale.y = 1;
	//lageplan.scale.z = 1;
	
	scene.add(lageplan1);
*/


	
	//========================================================
	// PhotoSphere einbinden
	//========================================================
	photo_sphere = new THREE.SphereGeometry(480, 32, 32);
	photo_sphere.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));
	photo_sphereMaterial = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.8});
	photo_sphereMaterial.map = THREE.ImageUtils.loadTexture('/static/img/K63_sphere.jpg');
	//sphereMaterial.map = THREE.TextureLoader.load('Büro.jpg');
 	photo_sphereMesh = new THREE.Mesh(photo_sphere, photo_sphereMaterial);
 	photo_sphereMesh.position.set(0,+90,0);
 	photo_sphereMesh.rotation.y = -90*6.28/360;
	

	
	//========================================================
	// 3D Räume als Quader mit Textur einbinden
	//========================================================
	K63 = load_room(scene,740,269,615,'/static/img/K63_cube.jpg');
	K63.position.x = 0;
	K63.position.y = 0;
	K63.position.z = 0;

	
	K62 = load_room(scene,615,269,370,'/static/img/K62_cube.jpg');
	K62.position.x = -580;
	K62.position.y = 0;
	K62.position.z = 0;
	K62.rotation.y = -2*3.14/4;

	
	Innenhof = load_room(scene,2120,875,1525,'/static/img/Innenhof.jpg');
	Innenhof.position.x = -787;
	Innenhof.position.y = 300;
	Innenhof.position.z = -1120;
	Innenhof.rotation.y = 0;


	
	//========================================================
	// Kamera und Lichtquelle Positionieren
	//========================================================
	camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 10000);
	camera.position.set(0,300,1000);
	camera.up = new THREE.Vector3(0,1,0);
	camera.lookAt(new THREE.Vector3(0,0,0));
	scene.add(camera);

	var ambientLight = new THREE.AmbientLight(0xffffff);
	scene.add(ambientLight);



	//========================================================
	// Eventlisener und Controls einbinden
	//========================================================
	window.addEventListener('resize', 
						function()
							{
								var WIDTH = window.innerWidth,
								HEIGHT = window.innerHeight;
								renderer.setSize(WIDTH, HEIGHT);
								camera.aspect = WIDTH / HEIGHT;
								camera.updateProjectionMatrix();							
							}
							);

	renderer.setClearColor(0xffffff);

	controls = new THREE.OrbitControls(camera, renderer.domElement);
}



//#######################
// Menu für die Eingabe
//#######################

// Variablen für das Steuerungsmenu
var radius = { r1: 1, r2: 1, r3: 1, r4: 1}	
var anker_1 = { x: p1.x, y: p1.y, z: p1.z}
var anker_2 = { x: p2.x, y: p2.y, z: p2.z}
var anker_3 = { x: p3.x, y: p3.y, z: p3.z}
var anker_4 = { x: p4.x, y: p4.y, z: p4.z}
var anzeige = { Radien: true, Ankerpunkte: true, Raster: true, Näherungslösung: false, Raum: false, PhotoSphere: false, Karte: false }
var gui;
var f0;
var f1;
var f2;
var f3;	
var f4;	
var f5;	


// Steuerungsmenu zur manuellen Dateneingabe einbinden  
window.onload = function() 
{
	gui = new dat.GUI(); 

	f0 = gui.addFolder( 'Radius' );
	(f0.add(radius, 'r1', 1, 1000)).onChange(manipulateR);
	(f0.add(radius, 'r2', 1, 1000)).onChange(manipulateR);
	(f0.add(radius, 'r3', 1, 1000)).onChange(manipulateR);
	(f0.add(radius, 'r4', 1, 1000)).onChange(manipulateR);

	f1 = gui.addFolder( 'Anker1 (rot)' );
	(f1.add(anker_1, 'x', -1000, 1000)).onChange(manipulateA1);
	(f1.add(anker_1, 'y', -1000, 1000)).onChange(manipulateA1);
	(f1.add(anker_1, 'z', -1000, 1000)).onChange(manipulateA1);

	f2 = gui.addFolder( 'Anker2 (grün)' );
	(f2.add(anker_2, 'x', -1000, 1000)).onChange(manipulateA2);
	(f2.add(anker_2, 'y', -1000, 1000)).onChange(manipulateA2);
	(f2.add(anker_2, 'z', -1000, 1000)).onChange(manipulateA2);

	f3 = gui.addFolder( 'Anker3 (blau)' );
	(f3.add(anker_3, 'x', -1000, 1000)).onChange(manipulateA3);
	(f3.add(anker_3, 'y', -1000, 1000)).onChange(manipulateA3);
	(f3.add(anker_3, 'z', -1000, 1000)).onChange(manipulateA3);
	
	f4 = gui.addFolder( 'Anker4 (gelb)' );
	(f4.add(anker_4, 'x', -1000, 1000)).onChange(manipulateA4);
	(f4.add(anker_4, 'y', -1000, 1000)).onChange(manipulateA4);
	(f4.add(anker_4, 'z', -1000, 1000)).onChange(manipulateA4);
	
	f5 = gui.addFolder( ' Anzeige Optionen' );
	(f5.add(anzeige, 'Radien')).onChange(manipulateA5);
	(f5.add(anzeige, 'Ankerpunkte')).onChange(manipulateA5);
	(f5.add(anzeige, 'Raster')).onChange(manipulateA5);
	(f5.add(anzeige, 'Näherungslösung')).onChange(manipulateA5);
	(f5.add(anzeige, 'Raum')).onChange(manipulateA5);
	(f5.add(anzeige, 'PhotoSphere')).onChange(manipulateA5);
	(f5.add(anzeige, 'Karte')).onChange(manipulateA5);
	
	gui.close(); 
}

// Radius (Entfernung IoT-Board vom Ankerpunkt aktualisieren	
function manipulateR()
{
	p1.r = radius.r1;
	p2.r = radius.r2;
	p3.r = radius.r3;
	p4.r = radius.r4;

	sphere[2].scale.set(p1.r,p1.r,p1.r); 
	sphere[2].matrixAutoUpdate = true;	

	sphere[4].scale.set(p2.r,p2.r,p2.r); 
	sphere[4].matrixAutoUpdate = true;	

	sphere[6].scale.set(p3.r,p3.r,p3.r); 
	sphere[6].matrixAutoUpdate = true;
	
	sphere[8].scale.set(p4.r,p4.r,p4.r); 
	sphere[8].matrixAutoUpdate = true;

}


// Koordinaten Ankerpunkt 1 setzen	
function manipulateA1()
{
	p1.x = anker_1.x;
	p1.y = anker_1.y;
	p1.z = anker_1.z;

	sphere[1].position.set(anker_1.x,anker_1.y,anker_1.z);	
	sphere[1].matrixAutoUpdate = true;	
	
	sphere[2].position.set(anker_1.x,anker_1.y,anker_1.z);	
	sphere[2].matrixAutoUpdate = true;
}

//Koordinaten Ankerpunkt 2 setzen 	
function manipulateA2()
{
	p2.x = anker_2.x;
	p2.y = anker_2.y;
	p2.z = anker_2.z;

	sphere[3].position.set(anker_2.x,anker_2.y,anker_2.z);	
	sphere[3].matrixAutoUpdate = true;	
	
	sphere[4].position.set(anker_2.x,anker_2.y,anker_2.z);	
	sphere[4].matrixAutoUpdate = true;
}
	
// Koordinaten Ankerpunkt 3 setzen
function manipulateA3()
{
	p3.x = anker_3.x;
	p3.y = anker_3.y;
	p3.z = anker_3.z;

	sphere[5].position.set(anker_3.x,anker_3.y,anker_3.z);	
	sphere[5].matrixAutoUpdate = true;	
	
	sphere[6].position.set(anker_3.x,anker_3.y,anker_3.z);	
	sphere[6].matrixAutoUpdate = true;
}	

// Koordinaten Ankerpunkt 4 setzen
function manipulateA4()
{
	p4.x = anker_4.x;
	p4.y = anker_4.y;
	p4.z = anker_4.z;

	sphere[7].position.set(anker_4.x,anker_4.y,anker_4.z);	
	sphere[7].matrixAutoUpdate = true;	
	
	sphere[8].position.set(anker_4.x,anker_4.y,anker_4.z);	
	sphere[8].matrixAutoUpdate = true;
}

// Anzeigeoptionen 
function manipulateA5()
{	
	if (anzeige.Radien == true) { scene.add( sphere[2] ); scene.add( sphere[4] ); scene.add( sphere[6] ); scene.add( sphere[8] );	}
	else {	scene.remove( sphere[2] ); scene.remove( sphere[4] ); scene.remove( sphere[6] ); scene.remove( sphere[8] ); }

	if (anzeige.Ankerpunkte == true) { scene.add( sphere[1] ); scene.add( sphere[3] ); scene.add( sphere[5] ); scene.add( sphere[7]); }
	else { scene.remove(sphere[1] ); scene.remove( sphere[3] ); scene.remove( sphere[5] ); scene.remove( sphere[7] ); }

	if (anzeige.Raster == true) { scene.add(gridXY); }
	else { scene.remove(gridXY); }
	
	if (anzeige.Näherungslösung == true) { scene.add(sphere[0]); }
	else { scene.remove(sphere[0]); }
	
	if (anzeige.Raum == true) { scene.add(K62); scene.add(K63); scene.add(Innenhof); }
	else { scene.remove(K62); scene.remove(K63); scene.remove(Innenhof); }
	
	if (anzeige.PhotoSphere == true) { scene.add(photo_sphereMesh); }
	else { scene.remove(photo_sphereMesh); }

	if (anzeige.Karte == true) { scene.add(lageplan); }
	else { scene.remove(lageplan); }
}


// 3D Quader mit Textur für den Raum einblenden 
function load_room(scene,B,H,T,textur)
{
	//========================================================
	// 3D Raum als Quader mit Textur einbinden
	//========================================================
	var unity = 1.0/3.0;
	var unitx = 1.0/4.0;
	
	var tnx = [new THREE.Vector2(0*unitx, 2*unity), new THREE.Vector2(1*unitx,2*unity), new THREE.Vector2(1*unitx, 1*unity), new THREE.Vector2(0*unitx, 1*unity)];
	var tpz = [new THREE.Vector2(1*unitx, 2*unity), new THREE.Vector2(2*unitx,2*unity), new THREE.Vector2(2*unitx, 1*unity), new THREE.Vector2(1*unitx, 1*unity)];
	var tpx = [new THREE.Vector2(2*unitx, 2*unity), new THREE.Vector2(3*unitx,2*unity), new THREE.Vector2(3*unitx, 1*unity), new THREE.Vector2(2*unitx, 1*unity)];
	var tnz = [new THREE.Vector2(3*unitx, 2*unity), new THREE.Vector2(4*unitx,2*unity), new THREE.Vector2(4*unitx, 1*unity), new THREE.Vector2(3*unitx, 1*unity)];
	var tpy = [new THREE.Vector2(2*unitx, 2*unity), new THREE.Vector2(1*unitx,2*unity), new THREE.Vector2(1*unitx, 3*unity), new THREE.Vector2(2*unitx, 3*unity)];
	var tny = [new THREE.Vector2(2*unitx, 0*unity), new THREE.Vector2(1*unitx,0*unity), new THREE.Vector2(1*unitx, 1*unity), new THREE.Vector2(2*unitx, 1*unity)];
	
	var roomgeometry = new THREE.CubeGeometry(B,H,T);
	var roommaterial = new THREE.MeshLambertMaterial( { map: THREE.ImageUtils.loadTexture(textur) } );
	var roommesh = new THREE.Mesh(roomgeometry, roommaterial );
	roommesh.material.side = THREE.BackSide;
	//scene.add( roommesh );
	
	//flip every vertex normal in mesh by multiplying normal by -1
	for(var i = 0; i<roommesh.geometry.faces.length; i++)
	{
		roommesh.geometry.faces[i].normal.x = -1*roommesh.geometry.faces[i].normal.x;
		roommesh.geometry.faces[i].normal.y = -1*roommesh.geometry.faces[i].normal.y;
		roommesh.geometry.faces[i].normal.z = -1*roommesh.geometry.faces[i].normal.z;
	}
	
	roommesh.geometry.computeVertexNormals();
	roommesh.geometry.computeFaceNormals();
	
	roomgeometry.faceVertexUvs[0][0]  = [ tpx[1], tpx[2], tpx[0] ];
	roomgeometry.faceVertexUvs[0][1]  = [ tpx[2], tpx[3], tpx[0] ];
	roomgeometry.faceVertexUvs[0][2]  = [ tnx[1], tnx[2], tnx[0] ];
	roomgeometry.faceVertexUvs[0][3]  = [ tnx[2], tnx[3], tnx[0] ];
	roomgeometry.faceVertexUvs[0][4]  = [ tpy[1], tpy[2], tpy[0] ];
	roomgeometry.faceVertexUvs[0][5]  = [ tpy[2], tpy[3], tpy[0] ];
	roomgeometry.faceVertexUvs[0][6]  = [ tny[1], tny[2], tny[0] ];
	roomgeometry.faceVertexUvs[0][7]  = [ tny[2], tny[3], tny[0] ];
	roomgeometry.faceVertexUvs[0][8]  = [ tnz[1], tnz[2], tnz[0] ];
	roomgeometry.faceVertexUvs[0][9]  = [ tnz[2], tnz[3], tnz[0] ];
	roomgeometry.faceVertexUvs[0][10] = [ tpz[1], tpz[2], tpz[0] ];
	roomgeometry.faceVertexUvs[0][11] = [ tpz[2], tpz[3], tpz[0] ];
	
	return roommesh;

}