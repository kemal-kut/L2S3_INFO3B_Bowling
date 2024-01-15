const ALLEY_LENGTH = 200;
const BLUE_TEAM_COLOR = 0x0000ff;
const RED_TEAM_COLOR = 0xff0000;
const borneVue = 12; 

var vitesse = 5;

var start = null;

class Alley extends THREE.Group{
    housePos = new THREE.Vector3();

    constructor(){
        super();
        this.makeAlley();
    }

    makeAlley(){
        const mainWidth = 40;
        const mainHeight = 3;
        const mainDepth = ALLEY_LENGTH;
        const mainColor = 0xAF822E;
        
        this.housePos = new THREE.Vector3(0, 0, mainDepth*0.35);

        var alley = new THREE.Group();

        const mainGeometry = new THREE.BoxGeometry(mainWidth, mainHeight, mainDepth);
        const mainMaterial = new THREE.MeshPhongMaterial({color : mainColor});
        const main = new THREE.Mesh(mainGeometry, mainMaterial);
        this.add(main);

        return alley;
    }
}

class Ball extends THREE.Group{
    launched = false;
    speed = new THREE.Vector3();
    movementType = "Linéaire";
    curve = new THREE.QuadraticBezierCurve3();
    curvePos = 0;
    team = 0;
    lastPosition = new THREE.Vector3();
    traveledDistance = 0;

    constructor(color, pos){
        super();
        this.position.set(pos.x, pos.y, pos.z);
        this.makeBall(color)
    }

    makeBall(teamColor){
        const sphereGeo = new THREE.SphereGeometry(4,500,500);
        const sphereMat = new THREE.MeshStandardMaterial({color: teamColor, wireframe: true});
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        sphere.castShadow = true;

        this.add(sphere);
    }

    isMoving(){

        let epsilon = 0.001;
        
        return (this.speed.lengthSq() > epsilon);
    }
}

function init(){

    const clock = new THREE.Clock();
    var stats = initStats();

    const container = document.getElementById("webgl");
    const renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth-20, window.innerHeight-100);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFFCAAF);

    const camera = new THREE.PerspectiveCamera(40, window.innerWidth/window.innerHeight, 0.01, 1000);
    camera.position.set(-150,100,0);
  
    const orbit = new THREE.OrbitControls(camera, renderer.domElement);
    orbit.update();
    
    const spotLight = new THREE.SpotLight(0xFFFFFF);
    spotLight.position.set(0,100,60);
    spotLight.castShadow = true;
    spotLight.angle = 0.5;
  
    const pointLight = new THREE.PointLight(0x404040, 5);
    pointLight.position.set(0, 50, 5);

    const sLightHelper = new THREE.SpotLightHelper(spotLight);
    scene.add(spotLight, pointLight, sLightHelper);
    
    var currentTeam = 0;
    var teamColors = [BLUE_TEAM_COLOR,RED_TEAM_COLOR];

    var balls = [];
    var currentBall;

    var teamScores = [0,0];




    var launchParam = new function(){
        this.type = "Courbe";
        this.velocity = new THREE.Vector3(30,0,0);
        this.curvature = 1.0;
        this.dir = 0.0;
        this.velocityLinear = 50.0;
    }




    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    var gui = new dat.GUI();
  
    //Lumières
    var guiLights = gui.addFolder("Lumières");
    guiLights.add(spotLight, 'intensity', 0, 10).name("Intensité Spot").setValue(1.5);
    guiLights.add(pointLight, 'intensity', 0, 10).name("Intensité Point").setValue(1.5);
    var options = {angle : 0.5};
    gui.add(options, 'angle', 0, 1);
    
    //lancer de la balle
    var guiLaunch = gui.addFolder("Lancement de la boule");
    guiLaunch.add(launchParam,"type", ["Courbe","Linéaire"]).name("Type de lancer").onChange(UpdateLaunchingCurve);
    var guiLaunchCurve = guiLaunch.addFolder("Courbe");
            var guiLaunchVelocity = guiLaunchCurve.addFolder("Vitesse initiale");
              guiLaunchVelocity.add(launchParam.velocity, "x", 0.0, 30.0).onChange(UpdateLaunchingCurve);
              guiLaunchVelocity.add(launchParam.velocity, "z", -30.0, 30.0).onChange(UpdateLaunchingCurve);
              guiLaunchVelocity.open();
            guiLaunchCurve.add(launchParam, "curvature", 0.01, 2).name("Courbure").onChange(UpdateLaunchingCurve);
          var guiLaunchLinear = guiLaunch.addFolder("Linéaire");
            guiLaunchLinear.add(launchParam, "dir", -1.0, 1.0).name("Direction").onChange(UpdateLaunchingCurve);
            guiLaunchLinear.add(launchParam, "velocityLinear", 1.0, 100.0).name("Vitesse").onChange(UpdateLaunchingCurve);


    //Caméra
     // ajout du menu dans le GUI
    let menuGUI = new function () {
        this.cameraxPos = camera.position.x;
        this.camerayPos = camera.position.y;
        this.camerazPos = camera.position.z;
        this.cameraZoom = 1;
        this.cameraxDir = 0;
        this.camerayDir = 0;
        this.camerazDir = 0;

        //pour actualiser dans la scene   
        this.actualisation = function () {
            posCamera();
            reAffichage();
        }; // fin this.actualisation
    }; // fin de la fonction menuGUI
    // ajout de la camera dans le menu
    ajoutCameraGui(gui,menuGUI,camera) 
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    tick();
    

    function tick(){
        requestAnimationFrame(tick);

        const delta = clock.getDelta();

        if(!currentBall || (!currentBall.isMoving() && currentBall.launched)){
            updateScores();


        }

    }

    


    function UpdateLaunchingCurve(){
        scene.remove(launchLine);
        launchCurve = MakeLaunchingCurve(launchParam.velocity, launchParam.curvature);

        launchLine = lineFromBezier(launchCurve,50,teamColors[currentTeam]);

        scene.remove(launchLinearCurve);
        launchLinearCurve = MakeLaunchingLinearCurve(launchParam.dir,launchParam.velocityLinear);
        launchLinearLine = LineFromLineCurve3(launchLinearCurve, teamColors[currentTeam]);

        if(launchParam.type == "Courbe"){
            scene.add(launchLine);

            guiLaunchCurve.open();
        guiLaunchLinear.close();

      guiLaunchCurve.domElement.style.pointerEvents = "";
      guiLaunchCurve.domElement.style.opacity = 1;

      guiLaunchLinear.domElement.style.pointerEvents = "none";
      guiLaunchLinear.domElement.style.opacity = .6;
    }
    else if(launchParam.type == "Linéaire")
    {
      scene.add(launchLinearLine);

      guiLaunchLinear.open();
      guiLaunchCurve.close();

      guiLaunchLinear.domElement.style.pointerEvents = "";
      guiLaunchLinear.domElement.style.opacity = 1;

      guiLaunchCurve.domElement.style.pointerEvents = "none";
      guiLaunchCurve.domElement.style.opacity = .6;
    }
        
    }

    function MakeLaunchingCurve(velocity,curvature){
        let A = new THREE.Vector3();
        let B = new THREE.Vector3();
        let C = new THREE.Vector3();


        A.set(0,0,0);
        B.copy(velocity);
        C.copy(A);

        C.lerp(housePosition,1/curvature);

        return new THREE.QuadraticBezierCurve3(A,B,C);

    }

    



    function lineFromBezier(bez,precision,color){
        const material = new THREE.LineBasicMaterial({color:color});$
        const points = bez.getPoints(precision);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry,material);

        return line;

    }

    function MakeLaunchingLinearCurve(dir, scalar)
   {
    let A = new THREE.Vector3(0, 0, 0);
    let B = ComputeLaunchLinearSpeedVector();

    return new THREE.LineCurve3(A, B);
   }


   function LineFromLineCurve3(curve, color)
  {
    const material = new THREE.LineBasicMaterial({ color: color });

    const points = [];
    points.push( curve.v1, curve.v2 );

    const geometry = new THREE.BufferGeometry().setFromPoints( points );

    return new THREE.Line( geometry, material );
  }




    //piste 
    var alley = new Alley();
    alley.position.set(80/2.5, 1, 0);
    alley.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI / 2);
    var housePosition = alley.housePos.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2).add(alley.position);
    housePosition.y = 0;
    scene.add(alley);


    var launchCurve;
    var launchLine;


    var launchLinearCurve;
    var launchLinearLine;

     
    //boule de bowling
    var ball = new Ball(0x1CFF00, new THREE.Vector3(-50,6.5,0), 0);
    scene.add(ball);


    let coef = 1.0;
 let origine = new THREE.Vector3(0,0,0);
 let N0 = new THREE.Vector3(0,8,0);
 let N1 = new THREE.Vector3(1,8,0);
 let N2 = new THREE.Vector3(1.6,6,0);
 let N3 = new THREE.Vector3(0.6,4,0);
 let P0 = new THREE.Vector3(N3.x,N3.y,0);
 let P1 = new THREE.Vector3(1,1,0);
 let P2 = new THREE.Vector3(2,1,0);
 let P3 = new THREE.Vector3(2.5,0,0);
 let M0 = new THREE.Vector3(P3.x,P3.y,0);
 let M1 = new THREE.Vector3(0,0,0);
 let M2 = new THREE.Vector3(3,-2.5,0);
 let M3 = new THREE.Vector3(1.1,-5,0);
 let vP2P3 = new THREE.Vector3(0,0,0);
 let vTan2 = new THREE.Vector3(0,0,0);
 vP2P3.subVectors(P3,P2);//P3-P2
 vTan2.addScaledVector(vP2P3,coef);
 M1.addVectors(M0,vTan2);
 //alert(M0.x+"\n"+M0.y);
 let nb=100;//nmbre de pts par courbe
 let epai=2;//epaisseur de la courbe
 let nbPtCB=50;//nombre de points sur la courbe de Bezier
 let nbePtRot=150;// nbe de points sur les cercles
 let dimPt=0.05;
 tracePt(scene, P0, "#008888",dimPt,true);
 tracePt(scene, P1, "#008888",dimPt,true);
 tracePt(scene, P2, "#008888",dimPt,true);
 tracePt(scene, P3, "#880000",dimPt,true);
 tracePt(scene, M1, "#000088",dimPt,true);
 tracePt(scene, M2, "#880088",dimPt,true);
 tracePt(scene, M3, "#880088",dimPt,true);
 let nbPts = 100;//nbe de pts de la courbe de Bezier
 let epaiB = 5;//epaisseur de la courbe de Bezier
 let cbeBez2 = TraceBezierCubique(M0, M1, M2, M3,nbPts,"#0000FF",epaiB);
 let cbeBez1 = TraceBezierCubique(P0, P1, P2, P3,nbPts,"#FF00FF",epaiB);
 //let cbeBez1 = TraceBezierQuadratique(P0, P1, P2, nbPts,"#FF00FF",epaiB);
 //scene.add(cbeBez1);
 //scene.add(cbeBez2);
 //Quille 1
 let lathe0 = latheBez3(nbPtCB,nbePtRot,N0,N1,N2,N3,"#FFFFFF",1,false);
 let lathe1 = latheBez3(nbPtCB,nbePtRot,P0,P1,P2,P3,"#FFFFFF",1,false);
 let lathe2 = latheBez3(nbPtCB,nbePtRot,M0,M1,M2,M3,"#FFFFFF",1,false);
 lathe0.position.x=120;
 lathe1.position.x=120;
 lathe2.position.x=120;
 lathe0.position.y=8;
 lathe1.position.y=8;
 lathe2.position.y=8;
 lathe0.position.z=15;
 lathe1.position.z=15;
 lathe2.position.z=15;
 //Quille 2
 let lathe3 = latheBez3(nbPtCB,nbePtRot,N0,N1,N2,N3,"#FFFFFF",1,false);
 let lathe4 = latheBez3(nbPtCB,nbePtRot,P0,P1,P2,P3,"#FFFFFF",1,false);
 let lathe5 = latheBez3(nbPtCB,nbePtRot,M0,M1,M2,M3,"#FFFFFF",1,false);
 lathe3.position.x=120;
 lathe4.position.x=120;
 lathe5.position.x=120;
 lathe3.position.y=8;
 lathe4.position.y=8;
 lathe5.position.y=8;
 lathe3.position.z=-15;
 lathe4.position.z=-15;
 lathe5.position.z=-15;
 //Quille 3
 let lathe6 = latheBez3(nbPtCB,nbePtRot,N0,N1,N2,N3,"#FFFFFF",1,false);
 let lathe7 = latheBez3(nbPtCB,nbePtRot,P0,P1,P2,P3,"#FFFFFF",1,false);
 let lathe8 = latheBez3(nbPtCB,nbePtRot,M0,M1,M2,M3,"#FFFFFF",1,false);
 lathe6.position.x=100;
 lathe7.position.x=100;
 lathe8.position.x=100;
 lathe6.position.y=8;
 lathe7.position.y=8;
 lathe8.position.y=8;

 
 //Quille 4
 let lathe9 = latheBez3(nbPtCB,nbePtRot,N0,N1,N2,N3,"#FFFFFF",1,false);
 let lathe10 = latheBez3(nbPtCB,nbePtRot,P0,P1,P2,P3,"#FFFFFF",1,false);
 let lathe11= latheBez3(nbPtCB,nbePtRot,M0,M1,M2,M3,"#FFFFFF",1,false);
 lathe9.position.x=110;
 lathe10.position.x=110;
 lathe11.position.x=110;
 lathe9.position.y=8;
 lathe10.position.y=8;
 lathe11.position.y=8;
 lathe9.position.z=7.5;
 lathe10.position.z=7.5;
 lathe11.position.z=7.5;

 //Quille 5
 let lathe12= latheBez3(nbPtCB,nbePtRot,N0,N1,N2,N3,"#FFFFFF",1,false);
 let lathe13= latheBez3(nbPtCB,nbePtRot,P0,P1,P2,P3,"#FFFFFF",1,false);
 let lathe14= latheBez3(nbPtCB,nbePtRot,M0,M1,M2,M3,"#FFFFFF",1,false);
 lathe12.position.x=110;
 lathe13.position.x=110;
 lathe14.position.x=110;
 lathe12.position.y=8;
 lathe13.position.y=8;
 lathe14.position.y=8;
 lathe12.position.z=-7.5;
 lathe13.position.z=-7.5;
 lathe14.position.z=-7.5;


  //Quille 6
  let lathe15 = latheBez3(nbPtCB,nbePtRot,N0,N1,N2,N3,"#FFFFFF",1,false);
  let lathe16 = latheBez3(nbPtCB,nbePtRot,P0,P1,P2,P3,"#FFFFFF",1,false);
  let lathe17 = latheBez3(nbPtCB,nbePtRot,M0,M1,M2,M3,"#FFFFFF",1,false);
  lathe15.position.x=110;
  lathe16.position.x=110;
  lathe17.position.x=110;
  lathe15.position.y=8;
  lathe16.position.y=8;
  lathe17.position.y=8;
  

   //Quille 7
  let lathe18 = latheBez3(nbPtCB,nbePtRot,N0,N1,N2,N3,"#FFFFFF",1,false);
  let lathe19 = latheBez3(nbPtCB,nbePtRot,P0,P1,P2,P3,"#FFFFFF",1,false);
  let lathe20 = latheBez3(nbPtCB,nbePtRot,M0,M1,M2,M3,"#FFFFFF",1,false);
  lathe18.position.x=120;
  lathe19.position.x=120;
  lathe20.position.x=120;
  lathe18.position.y=8;
  lathe19.position.y=8;
  lathe20.position.y=8;
  lathe18.position.z=-7.5;
  lathe19.position.z=-7.5;
  lathe20.position.z=-7.5;

  //Quille 8
  let lathe21 = latheBez3(nbPtCB,nbePtRot,N0,N1,N2,N3,"#FFFFFF",1,false);
  let lathe22 = latheBez3(nbPtCB,nbePtRot,P0,P1,P2,P3,"#FFFFFF",1,false);
  let lathe23 = latheBez3(nbPtCB,nbePtRot,M0,M1,M2,M3,"#FFFFFF",1,false);
  lathe21.position.x=120;
  lathe22.position.x=120;
  lathe23.position.x=120;
  lathe21.position.y=8;
  lathe22.position.y=8;
  lathe23.position.y=8;
  lathe21.position.z=7.5;
  lathe22.position.z=7.5;
  lathe23.position.z=7.5;

  //Quille 9
  let lathe24 = latheBez3(nbPtCB,nbePtRot,N0,N1,N2,N3,"#FFFFFF",1,false);
  let lathe25 = latheBez3(nbPtCB,nbePtRot,P0,P1,P2,P3,"#FFFFFF",1,false);
  let lathe26 = latheBez3(nbPtCB,nbePtRot,M0,M1,M2,M3,"#FFFFFF",1,false);
  lathe24.position.x=120;
  lathe25.position.x=120;
  lathe26.position.x=120;
  lathe24.position.y=8;
  lathe25.position.y=8;
  lathe26.position.y=8;


 scene.add(lathe0);
 scene.add(lathe1);
 scene.add(lathe2);

 scene.add(lathe3);
 scene.add(lathe4);
 scene.add(lathe5);

 scene.add(lathe6);
 scene.add(lathe7);
 scene.add(lathe8);

 scene.add(lathe9);
 scene.add(lathe10);
 scene.add(lathe11);

 scene.add(lathe12);
 scene.add(lathe13);
 scene.add(lathe14);

 scene.add(lathe15);
 scene.add(lathe16);
 scene.add(lathe17);

 scene.add(lathe18);
 scene.add(lathe19);
 scene.add(lathe20);

 scene.add(lathe21);
 scene.add(lathe22);
 scene.add(lathe23);

 scene.add(lathe24);
 scene.add(lathe25);
 scene.add(lathe26);
    
          // création d'un courbe de Bézier à partir d'un point de départ,
      // de deux points de contrôle et d'un point d'arrivée.
      var curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(-80, 6.5, 0),
        new THREE.Vector3( -20, 6.5, 0),
        new THREE.Vector3( 30, 6.5, 0),
        new THREE.Vector3( 100,  6.5, 0)
      );

      var points = curve.getPoints(40);
      var geometry = new THREE.BufferGeometry().setFromPoints(points);
      var material = new THREE.LineBasicMaterial();
      var curveObject = new THREE.Line(geometry, material);
      scene.add(curveObject);

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // ajoute le rendu dans l'element HTML
    document.getElementById("webgl").appendChild(renderer.domElement);
   
    // affichage de la scene
    renderer.render(scene, camera);
 
    function reAffichage() {
        setTimeout(function () {
        }, 200);// fin setTimeout(function ()
          // rendu avec requestAnimationFrame
        rendu.render(scene, camera);
    }// fin fonction reAffichage()


    function UpdateScores()
  {
    teamScores  = [0, 0];

    for(var i = 0 ; i < balls.length ; i++)
    {
      let s = balls[i].position.clone();

    //   if(balls[i].position.distanceTo(housePosition) < houseRadius + stones[i].radius)
    //     teamScores[stones[i].team]++;
    }

    WriteScoresHTML();
  }

  function WriteScoresHTML()
  {
    var tableTd = [];
    tableTd.push(document.getElementsByTagName('table')[0].getElementsByTagName('tr')[1].getElementsByTagName('td')[1]);
    tableTd.push(document.getElementsByTagName('table')[0].getElementsByTagName('tr')[1].getElementsByTagName('td')[2]);

    var color;

    if(teamScores[0] > teamScores[1])
      color = BLUE_TEAM_COLOR;
    else if(teamScores[1] > teamScores[0])
      color = RED_TEAM_COLOR;
    else
      color = 0x777777;

    colorStr = color.toString(16);
    while(colorStr.length < 6)
      colorStr = "0" + colorStr;


    tableTd[0].innerHTML = "<span style=\"color:#" + colorStr + ";\">" + teamScores[0] + "</span>";
    tableTd[1].innerHTML = "<span style=\"color:#" + colorStr + ";\">" + teamScores[1] + "</span>";
  }

    function animate(t){
        stats.update();
        spotLight.angle = options.angle;
        sLightHelper.update();

        // //mouvement de la balle
        if (start == null) {
            start = t;
        }
        var delai = t - start;
  
        curve.getPoint((delai * vitesse * .00001) % 1, ball.position);
  
        requestAnimationFrame(animate);
    
        renderer.render(scene,camera);
    }
      renderer.setAnimationLoop(animate);
}