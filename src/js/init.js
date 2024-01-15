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
}

function motif(MaScene,R,nb,P,coul)
{
   
   let points1= new Array(nb/2+1);
   for(var k=0;k<=nb/2;k++){
      let t2=Math.PI/2+k/nb*Math.PI; 
      t2=t2.toPrecision(5);
      let x0=R*Math.cos(t2);
      let z0=R*Math.sin(t2);    
      points1[k] = new THREE.Vector3(x0,0,z0);
     }
   
     let points2= new Array(nb+1);
     for(var k=0;k<=nb;k++){
        let t2=Math.PI/2+k/nb*Math.PI; 
        t2=t2.toPrecision(5);
        let x0=R*Math.cos(t2);
        let y0=R*Math.sin(t2);    
        points2[k] = new THREE.Vector3(x0,y0,0);
       }

       let points3= new Array(nb+1);
       for(var k=0;k<=nb;k++){
         let t2=-Math.PI/2+k/nb*Math.PI; 
         t2=t2.toPrecision(5);
         let z0=R*Math.cos(t2);
         let y0=R*Math.sin(t2);    
         points3[k] = new THREE.Vector3(0,y0,z0);
        }
      
     let PtsCbePara = new THREE.BufferGeometry().setFromPoints(points);
     let ProprieteCbe = new THREE.LineBasicMaterial( { 
      color: coul,
      linewidth:50 
     } );
     
     let courbePara = new THREE.Line(PtsCbePara  , ProprieteCbe );
     courbePara.position.set(P.x,P.y,P.z);
     MaScene.add(courbePara);
     return  courbePara  ;
     

}//fonction qui permet la création d'une courbe de Bézier sur la boule 


function detectCollision(Object1,Object2)
{

let Bound1 = new THREE.Box3().setFromObject(Object1);

let Bound2= new THREE.Box3().setFromObject(Object2);

return Bound1.intersectsBox(Bound2);
}

function init(){
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
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    var gui = new dat.GUI();
  
    //Lumières
    var guiLights = gui.addFolder("Lumières");
    guiLights.add(spotLight, 'intensity', 0, 10).name("Intensité Spot").setValue(1.5);
    guiLights.add(pointLight, 'intensity', 0, 10).name("Intensité Point").setValue(1.5);
    var options = {angle : 0.5};
    gui.add(options, 'angle', 0, 1);

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
    
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    
    
    //piste 
    var alley = new Alley();
    alley.position.set(80/2.5, 1, 0);
    alley.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI / 2);
    var housePosition = alley.housePos.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2).add(alley.position);
    housePosition.y = 0;
    scene.add(alley);

    //boule de bowling
    var ball = new Ball(0x1CFF00, new THREE.Vector3(-50,6.5,0), 0);
    scene.add(ball);







//création des Quilles 

    let coef = 1.0;
 let origine = new THREE.Vector3(0,0,0);
 let N0 = new THREE.Vector3(0,8,0);
 let N1 = new THREE.Vector3(1.5,8,0);
 let N2 = new THREE.Vector3(2,6,0);
 let N3 = new THREE.Vector3(0.9,4,0);
 let P0 = new THREE.Vector3(N3.x,N3.y,0);
 let P1 = new THREE.Vector3(1,4,0);
 let P2 = new THREE.Vector3(1.25,3,0);
 let P3 = new THREE.Vector3(1.5,2,0);
 let M0 = new THREE.Vector3(P3.x,P3.y,0);
 let M1 = new THREE.Vector3(1,1.5,0);
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

 let tabQuilles = new Array(30) 

 let lathe0 = latheBez3(nbPtCB,nbePtRot,N0,N1,N2,N3,"#FFFFFF",1,false);
 let lathe1 = latheBez3(nbPtCB,nbePtRot,P0,P1,P2,P3,"#FF0000",1,false);
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
 let lathe4 = latheBez3(nbPtCB,nbePtRot,P0,P1,P2,P3,"#FF0000",1,false);
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
 let lathe7 = latheBez3(nbPtCB,nbePtRot,P0,P1,P2,P3,"#FF0000",1,false);
 let lathe8 = latheBez3(nbPtCB,nbePtRot,M0,M1,M2,M3,"#FFFFFF",1,false);
 lathe6.position.x=90;
 lathe7.position.x=90;
 lathe8.position.x=90;
 lathe6.position.y=8;
 lathe7.position.y=8;
 lathe8.position.y=8;

 
 //Quille 4
 let lathe9 = latheBez3(nbPtCB,nbePtRot,N0,N1,N2,N3,"#FFFFFF",1,false);
 let lathe10 = latheBez3(nbPtCB,nbePtRot,P0,P1,P2,P3,"#FF0000",1,false);
 let lathe11= latheBez3(nbPtCB,nbePtRot,M0,M1,M2,M3,"#FFFFFF",1,false);
 lathe9.position.x=110;
 lathe10.position.x=110;
 lathe11.position.x=110;
 lathe9.position.y=8;
 lathe10.position.y=8;
 lathe11.position.y=8;
 lathe9.position.z=-10.75;
 lathe10.position.z=-10.75;
 lathe11.position.z=-10.75;

 //Quille 5
 let lathe12= latheBez3(nbPtCB,nbePtRot,N0,N1,N2,N3,"#FFFFFF",1,false);
 let lathe13= latheBez3(nbPtCB,nbePtRot,P0,P1,P2,P3,"#FF0000",1,false);
 let lathe14= latheBez3(nbPtCB,nbePtRot,M0,M1,M2,M3,"#FFFFFF",1,false);
 lathe12.position.x=110;
 lathe13.position.x=110;
 lathe14.position.x=110;
 lathe12.position.y=8;
 lathe13.position.y=8;
 lathe14.position.y=8;
 lathe12.position.z=10.75;
 lathe13.position.z=10.75;
 lathe14.position.z=10.75;

;
  //Quille 6
  let lathe15 = latheBez3(nbPtCB,nbePtRot,N0,N1,N2,N3,"#FFFFFF",1,false);
  let lathe16 = latheBez3(nbPtCB,nbePtRot,P0,P1,P2,P3,"#FF0000",1,false);
  let lathe17 = latheBez3(nbPtCB,nbePtRot,M0,M1,M2,M3,"#FFFFFF",1,false);
  lathe15.position.x=110;
  lathe16.position.x=110;
  lathe17.position.x=110;
  lathe15.position.y=8;
  lathe16.position.y=8;
  lathe17.position.y=8;
  

   //Quille 7
  let lathe18 = latheBez3(nbPtCB,nbePtRot,N0,N1,N2,N3,"#FFFFFF",1,false);
  let lathe19 = latheBez3(nbPtCB,nbePtRot,P0,P1,P2,P3,"#FF0000",1,false);
  let lathe20 = latheBez3(nbPtCB,nbePtRot,M0,M1,M2,M3,"#FFFFFF",1,false);
  lathe18.position.x=120;
  lathe19.position.x=120;
  lathe20.position.x=120;
  lathe18.position.y=8;
  lathe19.position.y=8;
  lathe20.position.y=8;
  lathe18.position.z=-5.75;
  lathe19.position.z=-5.75;
  lathe20.position.z=-5.75;

  //Quille 8
  let lathe21 = latheBez3(nbPtCB,nbePtRot,N0,N1,N2,N3,"#FFFFFF",1,false);
  let lathe22 = latheBez3(nbPtCB,nbePtRot,P0,P1,P2,P3,"#FF0000",1,false);
  let lathe23 = latheBez3(nbPtCB,nbePtRot,M0,M1,M2,M3,"#FFFFFF",1,false);
  lathe21.position.x=120;
  lathe22.position.x=120;
  lathe23.position.x=120;
  lathe21.position.y=8;
  lathe22.position.y=8;
  lathe23.position.y=8;
  lathe21.position.z=5.75;
  lathe22.position.z=5.75;
  lathe23.position.z=5.75;

  //Quille 10
  let lathe24 = latheBez3(nbPtCB,nbePtRot,N0,N1,N2,N3,"#FFFFFF",1,false);
  let lathe25 = latheBez3(nbPtCB,nbePtRot,P0,P1,P2,P3,"#FF0000",1,false);
  let lathe26 = latheBez3(nbPtCB,nbePtRot,M0,M1,M2,M3,"#FFFFFF",1,false);
  lathe24.position.x=100;
  lathe25.position.x=100;
  lathe26.position.x=100;
  lathe24.position.y=8;
  lathe25.position.y=8;
  lathe26.position.y=8;
  lathe24.position.z=5.75;
  lathe25.position.z=5.75;
  lathe26.position.z=5.75;

   //Quille 10
   let lathe27 = latheBez3(nbPtCB,nbePtRot,N0,N1,N2,N3,"#FFFFFF",1,false);
   let lathe28 = latheBez3(nbPtCB,nbePtRot,P0,P1,P2,P3,"#FF0000",1,false);
   let lathe29 = latheBez3(nbPtCB,nbePtRot,M0,M1,M2,M3,"#FFFFFF",1,false);
   lathe27.position.x=100;
   lathe28.position.x=100;
   lathe29.position.x=100;
   lathe27.position.y=8;
   lathe28.position.y=8;
   lathe29.position.y=8;
   lathe27.position.z=-5.75;
   lathe28.position.z=-5.75;
   lathe29.position.z=-5.75;

   
 

 scene.add(lathe0);
 tabQuilles[1] = lathe0;
 scene.add(lathe1);
 tabQuilles[1] = lathe1;
 scene.add(lathe2);
 tabQuilles[1] = lathe2;

 scene.add(lathe3);
 tabQuilles[2] = lathe3;
 scene.add(lathe4);
 tabQuilles[2] = lathe4;
 scene.add(lathe5);
 tabQuilles[2] = lathe5;

 scene.add(lathe6);
 tabQuilles[3] = lathe6;
 scene.add(lathe7);
 tabQuilles[3] = lathe7;
 scene.add(lathe8);
 tabQuilles[3] = lathe8;

 scene.add(lathe9);
 tabQuilles[4] = lathe9;
 scene.add(lathe10);
 tabQuilles[4] = lathe10;
 scene.add(lathe11);
 tabQuilles[4] = lathe11;

 scene.add(lathe12);
 tabQuilles[5] = lathe12;
 scene.add(lathe13);
 tabQuilles[5] = lathe13;
 scene.add(lathe14);
 tabQuilles[5] = lathe14;

 scene.add(lathe15);
 tabQuilles[6] = lathe15;
 scene.add(lathe16);
 tabQuilles[6] = lathe16;
 scene.add(lathe17);
 tabQuilles[6] = lathe17;

 scene.add(lathe18);
 tabQuilles[7] = lathe18;
 scene.add(lathe19);
 tabQuilles[7] = lathe19;
 scene.add(lathe20);
 tabQuilles[7] = lathe20;

 scene.add(lathe21);
 tabQuilles[8] = lathe21;
 scene.add(lathe22);
 tabQuilles[8] = lathe22;
 scene.add(lathe23);
 tabQuilles[8] = lathe23;

 scene.add(lathe24);
 tabQuilles[9] = lathe24;
 scene.add(lathe25);
 tabQuilles[9] = lathe25;
 scene.add(lathe26);
 tabQuilles[9] = lathe26;

 scene.add(lathe27);
 tabQuilles[10] = lathe27;
 scene.add(lathe28);
 tabQuilles[10] = lathe28;
 scene.add(lathe29);
 tabQuilles[10] = lathe29;
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
 //FIN DE CREATION DES QUILLES
 ////////////////////////////////////////////////////////////////////////////////////
 ////////////////////////////////////////////////////////////////////////////////////

 
    
          // création d'un courbe de Bézier à partir d'un point de départ,
      // de deux points de contrôle et d'un point d'arrivée.
      var curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(-50,  6.5, 0),
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

    function animation(scene,curve,ball,tab,choixPiste)
{

  
    //Propriete geometrique de la courbe
   let cbeGeometry= new THREE.Geometry();

   
   
   // Points de la courbe de Bezier1
   cbeGeometry.vertices = curve.getPoints(40);

   let  i  = 0;

   var score1 = 0 ;
   var score2 = 0; 

    
   
   
   let anim = setInterval(function () {
        ball.position.set( cbeGeometry.vertices[i].x, cbeGeometry.vertices[i].y, cbeGeometry.vertices[i].z);
        ball.rotateX(i*Math.PI/800) ; 
         if(animate)
         {
            for ( var k  = 0 ; k<10; k++)
        { 
        let b =ball.children[0]; 
        let q = tabQuilles[k].children[1];
         if(detectCollision(b,q))
         {
         Mascene.remove(tabQuilles[k]) ;
        ParaRect(Mascene,2,1,1,1,1,1,tab[k].position.x,tab[k].position.y,tab[k].position.z,"#FFFFFF");
         score1 ++ ;
         document.getElementById("PtsN1").value = score1 ; 
         }
        }

         }
         if(choixPiste==2){
            for ( var k  = 10 ; k<20; k++)
        {
         let b =ball.children[0]; 
        let q = tabQuilles[k].children[1];
         if(detectCollision(b,q))
         {tab[k].rotateX(Math.Pi/2)   ; 
          scene.remove(tabQuilles[k]) ;
         ParaRect(scene,2,1,1,1,1,1,tab[k].position.x,tab[k].position.y,tab[k].position.z,"#FFFFFF");
         score2++;
         document.getElementById("PtsB1").value = score2 ; 
             }
        }


         }

            if(boule.position.y<-50)
            {
               clearInterval(anim) ;
               scene.remove(ball) ; 
            }


          i++ ;
       },20);



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
  
        curve.getPoint((delai * vitesse * .0001) % 1, ball.position);
  
        requestAnimationFrame(animate);
    
        renderer.render(scene,camera);
    }
      renderer.setAnimationLoop(animate);
}