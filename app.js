import * as THREE from '../../libs/three/three.module.js';
import { OrbitControls } from '../../libs/three/jsm/OrbitControls.js';
import { GLTFLoader } from '../../libs/three/jsm/GLTFLoader.js';
import { Stats } from '../../libs/stats.module.js';
import { CanvasUI } from '../../libs/CanvasUI.js'
import { ARButton } from '../../libs/ARButton.js';
import {
	Constants as MotionControllerConstants,
	fetchProfile
} from '../../libs/three/jsm/motion-controllers.module.js';
import { ControllerGestures } from '../../libs/ControllerGestures.js';
import { ImgJPG2PNG } from '../../libs/ImgJPG2PNG.js';
const DEFAULT_PROFILES_PATH = 'https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0/dist/profiles';
const DEFAULT_PROFILE = 'generic-trigger';

class App{

	constructor(){
        const container = document.createElement( 'div' );
        this.url='https://api.aileenn.net/organizations/1/products/327';
        document.body.appendChild( container );
        this.data;
       // this.test=this.requestH(this.url,this.data);
        this.fetchData(this.url);
        
       /* this.sprites=[{map:new THREE.TextureLoader().load( 'pic_1.png' ),des:'Chamarra bonita'},
        {map:new THREE.TextureLoader().load( 'pic_2.png' ),des:'Chamarra no bonita'}];*/
        this.sprite;
        
        this.current=0;
        
        this.clock = new THREE.Clock();
        
		this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 20 );
		
		this.scene = new THREE.Scene();
        
        this.scene.add ( this.camera );
       
		this.scene.add( new THREE.HemisphereLight( 0x606060, 0x404040 ) );

        const light = new THREE.DirectionalLight( 0xffffff );
        light.position.set( 1, 1, 1 ).normalize();
		this.scene.add( light );
			
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        
		container.appendChild( this.renderer.domElement );
        
        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.target.set(0, 3.5, 0);
        this.controls.update();
        
        //this.stats = new Stats();
        //document.body.appendChild( this.stats.dom );
        
        this.origin = new THREE.Vector3();
        this.quaternion = new THREE.Quaternion();
        this.euler = new THREE.Euler();
        
        this.initScene();
        this.setupXR();
        window.addEventListener('resize', this.resize.bind(this) );
	}	
    
    initScene(){
        this.dummyCam = new THREE.Object3D();
        this.camera.add( this.dummyCam );
        
        this.createUI();
    }
    whiteToAlpha(image){
        for(var y=0; y < image.getHeight(); y++){
      
          for(var x=0; x<image.getWidth(); x++){
            var r = image.getIntComponent0(x,y);
          var g = image.getIntComponent1(x,y);
          var b = image.getIntComponent2(x,y);
          
          if(r >= 250 && g >= 250 && b >= 250){
                    image.setIntColor(x, y, 0);
          }
        }
    }
    }

    fetchData(theUrl){
        fetch(theUrl)
            .then(response => response.json())
            .then(data => {
                let imgArray=[];
                let canvas=document.getElementById("canvas");
                
                data.images.forEach(element =>{
                    let image = new MarvinImage();

                    image.load(element.image_url,()=>{
                        this.whiteToAlpha(image);
                        image.draw(canvas);
                        var dataURL = canvas.toDataURL("image/png");
                        dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
                        image.src = dataURL;
                        imgArray.push(new THREE.TextureLoader().load(image.src));

                    });

                });
                canvas.style.display="none";
                this.data={info:data.description,cost:data.cost,img:imgArray};
                
            });

    }

    requestH(theUrl,data){
 
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
        xmlHttp.send( null );

        var dataTmp=JSON.parse( xmlHttp.responseText);
        var imgArray=[];
        var canvas=document.getElementById("canvas");
        dataTmp.images.forEach(element => {
            var image = new MarvinImage();
           
            image.load(element.image_url, ()=>{
                image.setColorToAlpha(0, 0);
             
                this.whiteToAlpha(image);
                //Marvin.alphaBoundary(image.clone(), image, 8);
                //Marvin.scale(image.clone(), image, 400);

               // var canvasContext = canvas.getContext("2d")
               // canvasContext.drawImage(image.image, 0, 0, image.width, image.height);
                image.draw(canvas);
                
                var dataURL = canvas.toDataURL("image/png");
                dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
                image.src = dataURL;
               //console.log(THREE.ImageUtils.getDataURL(image));
               // console.log(image.image.data);
                

                imgArray.push(new THREE.TextureLoader().load(image.src,(err1)=>{

                }));
                
            });
            
            

        });
        canvas.style.display="none";
        this.data={info:dataTmp.description,cost:dataTmp.cost,img:imgArray};

        return  JSON.parse( xmlHttp.responseText);

    }
    
    createUI() {
        
        const config = {
            panelSize: { width: 1.5, height: 1 },
            width: 512,
            height: 512,
            opacity: 0.5,
            body:{
                clipPath: "M 258.3888 5.4432 C 126.9744 5.4432 20.4432 81.8424 20.4432 164.4624 C 20.4432 229.1976 86.3448 284.2128 178.1016 304.8192 C 183.5448 357.696 173.2416 444.204 146.8032 476.6688 C 186.6552 431.9568 229.2288 356.5296 244.7808 313.3728 C 249.252 313.3728 253.9176 313.7616 258.3888 313.7616 C 389.8032 313.7616 496.14 246.888 496.14 164.4624 S 389.8032 5.4432 258.3888 5.4432 Z",
                fontFamily:'Gochi Hand', 
                fontSize:30, 
                padding:10, 
                backgroundColor: '#fff', 
                fontColor:'#000', 
                borderRadius: 6,
                opacity: 1
            },
            info:{
                type: "text",
                position: { left: 50, top: 80 },
                height: 250
            }
        }
        const content = {
            info: "info"
        }
        
        const ui = new CanvasUI( content, config );
        ui.mesh.material.opacity = 0.3;
        
        this.ui = ui;
    }
    
    setupXR(){
        this.renderer.xr.enabled = true; 
        
        const self = this;
        this.gestures=new ControllerGestures(this.renderer);

        this.gestures.addEventListener('tap',(ev)=>{
            console.log(self.sprite);
            if(this.data.length!=0){
            if (self.sprite===undefined||self.sprite.parent===null) {
               
                const material = new THREE.SpriteMaterial( { map: self.data.img[this.current] } );
                
                self.sprite = new THREE.Sprite( material );
                self.sprite.material.needsUpdate=true;
                //self.sprite.map.needsUpdate=true;
                self.sprite.position.set( 0, 0, -1.1 ).applyMatrix4(controller.matrixWorld);
                //sprite.quaternion.setFromRotationMatrix(controller.matrixWorld);
    
                self.sprite.scale.set(1, 1, 1);
    
                self.scene.add(self.sprite);
                console.log(self.sprite.position);
                //self.ui.mesh.position.set(0.2,0.5,-1.1);
                self.ui.mesh.position.set(self.sprite.position.x+0.1,self.sprite.position.y+1.5,self.sprite.position.z).applyMatrix4(controller.matrixWorld);
                self.scene.add(self.ui.mesh);
                //self.camera.add(self.ui.mesh);
                console.log(self.ui.mesh.position)
                self.ui.updateElement('info',self.data.info+'  $'+self.data.cost);
                   
               } else {
                self.sprite.position.set( 0, 0, -1.1 ).applyMatrix4(controller.matrixWorld);
                //self.ui.mesh.position.set(0.2,0.5,-1.1);
                self.ui.mesh.position.set(self.sprite.position.x+0.1,self.sprite.position.y+1.5,self.sprite.position.z).applyMatrix4(controller.matrixWorld);
                
               }
            }

        });

        this.gestures.addEventListener('swipeY',(ev)=>{

            this.data=[];
            var tmp=this.url.split('/')[6];
            let tmpInnt=parseInt(tmp,10);
            self.scene.remove(self.ui.mesh);
            self.scene.remove(self.sprite);
            this.current=0;
            if(ev.direction==='UP'){
                tmpInnt++;
                this.url=this.url.replace(tmp,tmpInnt);
                //this.requestH(this.url,this.data);
                this.fetchData(this.url);    
            }else if(ev.direction==='DOWN'){
                tmpInnt--;
                this.url=this.url.replace(tmp,tmpInnt);
               // this.requestH(this.url,this.data);
                this.fetchData(this.url); 
            }
            //self.ui.updateElement('info',self.data.info+'  $'+self.data.cost);
        });

        this.gestures.addEventListener('swipeX',(ev)=>{
            
            if(0!=this.data.length){

            if (ev.direction==='L2R') {
                if (this.current<self.data.img.length) {
                    this.current++;
                    
                } else {
                    this.current=0;
                }
            }else if(ev.direction==='R2L'){
                if (0<this.current) {
                    this.current--;
                    
                } else {
                    this.current=self.data.img.length-1;
                }
            }
            const pos = self.sprite.position;
            
          
            self.ui.updateElement('info',self.data.info+'  $'+self.data.cost);
            self.scene.remove(self.sprite);
            const mat=new THREE.SpriteMaterial( { map: self.data.img[this.current] } );
            self.sprite=new THREE.Sprite( mat );
            self.sprite.material.needsUpdate=true;
            self.scene.add(self.sprite)
        }
           // self.sprite.position.set(pos).applyMatrix4(controller.matrixWorld);

            //self.sprite.scale.set(1, 1, 1);
              
        });


        function onSelect(){
           // const map = new THREE.TextureLoader().load( 'pic_1.png' );
           // const material = new THREE.SpriteMaterial( { map: map } );
/*
           if (self.sprite===undefined) {
            const material = new THREE.SpriteMaterial( { map: self.sprites[0].map } );
            
            self.sprite = new THREE.Sprite( material );
            self.sprite.material.needsUpdate=true;
            //self.sprite.map.needsUpdate=true;
            self.sprite.position.set( -0.1, 0, -1.1 ).applyMatrix4(controller.matrixWorld);
            //sprite.quaternion.setFromRotationMatrix(controller.matrixWorld);

            self.sprite.scale.set(1, 1, 1);

            self.camera.add(self.sprite);

            self.ui.mesh.position.set(0.2,0.5,-1.1);
           // scene.add(self.ui.mesh);
            self.camera.add(self.ui.mesh);
               
           } else {
            self.sprite.position.set( 0, 0, -1.1 ).applyMatrix4(controller.matrixWorld);
            self.ui.mesh.position.set(0.2,0.5,-1.1);
           }
*/
        }
        
      /*  function onConnected( event ) {
            if (self.info === undefined){
                const info = {};

                fetchProfile( event.data, DEFAULT_PROFILES_PATH, DEFAULT_PROFILE ).then( ( { profile, assetPath } ) => {
                    //console.log( JSON.stringify(profile));

                    info.name = profile.profileId;
                    info.targetRayMode = event.data.targetRayMode;

                    Object.entries( profile.layouts ).forEach( ( [key, layout] ) => {
                        const components = {};
                        Object.values( layout.components ).forEach( ( component ) => {
                            components[component.type] = component.gamepadIndices;
                        });
                        info[key] = components;
                    });

                    self.info = info;
                    self.ui.updateElement( "info", JSON.stringify(info) );

                } );
            }
        }*/
        
        function onSessionStart(){
            //self.ui.mesh.position.set(0,-1,-1.1);
           // scene.add(self.ui.mesh);
            //self.camera.add(self.ui.mesh);
            
        }
        
        function onSessionEnd(){
            self.camera.remove( self.ui.mesh );
            self.camera.remove(self.sprite);

        }

        const btn = new ARButton( this.renderer, { onSessionStart, onSessionEnd, sessionInit: { optionalFeatures: [ 'dom-overlay' ], 
        domOverlay: { root: document.body } } } );

        const controller = this.renderer.xr.getController( 0 );
        //controller.addEventListener( 'connected', onConnected );

        controller.addEventListener('select',onSelect);

        this.scene.add( controller );
        this.controller = controller;
        
        this.renderer.setAnimationLoop( this.render.bind(this) );
    }
    
    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );  
    }
    
    createMsg( pos, rot ){
        const msg = `position:${pos.x.toFixed(2)},${pos.y.toFixed(2)},${pos.z.toFixed(2)} rotation:${rot.x.toFixed(2)},${rot.y.toFixed(2)},${rot.z.toFixed(2)}`;
        return msg;
    }
    
	render( ) {   
        const dt = this.clock.getDelta();
        //this.stats.update();
        this.ui.update();
        this.gestures.update();
        if (this.renderer.xr.isPresenting){
            const pos = this.controller.getWorldPosition( this.origin );
            //this.euler.setFromQuaternion( this.controller.getWorldQuaternion( this.quaternion ));
            
            //const msg = this.createMsg( pos, this.euler );
            //this.ui.updateElement("msg", msg);
            
            //this.ui.update();
        }
        this.renderer.render( this.scene, this.camera );
    }
}

export { App };