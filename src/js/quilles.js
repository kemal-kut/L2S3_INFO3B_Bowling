function latheBez3(nbePtCbe,nbePtRot,P0,P1,P2,P3,coul,opacite,bolTranspa){
 //let geometry = new THREE.Geometry();
 let p0= new THREE.Vector3(P0.x,P0.y,P0.z);
 let p1= new THREE.Vector3(P1.x,P1.y,P1.z);
 let p2= new THREE.Vector3(P2.x,P2.y,P2.z);
 let p3= new THREE.Vector3(P3.x,P3.y,P3.z);
 let Cbe3 = new THREE.CubicBezierCurve(p0,p1,p2,p3);
 let points = Cbe3.getPoints(nbePtCbe);
 let latheGeometry = new THREE.LatheGeometry(points,nbePtRot,0,2*Math.PI);
 let lathe = surfPhong(latheGeometry,coul,opacite,bolTranspa,"#223322");
 return lathe;
}// fin latheBez3

