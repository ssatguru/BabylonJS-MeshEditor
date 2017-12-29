
namespace org.ssatguru.babylonjs.component {

    import ArcRotateCamera=BABYLON.ArcRotateCamera;
    import MeshBuilder=BABYLON.MeshBuilder;
    import Color3=BABYLON.Color3;
    import Camera=BABYLON.Camera;
    import IndicesArray=BABYLON.IndicesArray;
    import Vector3=BABYLON.Vector3;
    import LinesMesh=BABYLON.LinesMesh;
    import Matrix=BABYLON.Matrix;
    import Mesh=BABYLON.Mesh;
    import Scene=BABYLON.Scene;
    import StandardMaterial=BABYLON.StandardMaterial;
    import Ray=BABYLON.Ray;
    import Path2=BABYLON.Path2;
    import PickingInfo=BABYLON.PickingInfo;
    import VertexBuffer=BABYLON.VertexBuffer;
    import EditControl=org.ssatguru.babylonjs.component.EditControl;

    export class MeshEditor {

        vertices: number[]|Float32Array;
        faceVertices: IndicesArray;
        mesh: Mesh;
        facePicked: number=0;
        ec: EditControl;
        camera: Camera;
        mode: String="F";


        faceSelector: Mesh;
        edgeSelector: Mesh;
        pointSelector: Mesh;

        selectedMesh: Mesh;

        public enablePoint() {
            this.mode="P";
        }
        public enableEdge() {
            this.mode="E";
        }
        public enableFace() {
            this.mode="F";
        }

        constructor(mesh: Mesh,camera: Camera,canvas: HTMLCanvasElement,scene: Scene) {
            this.camera=camera;
            this.mesh=mesh;

            window.addEventListener("keyup",(e) => {return this.onKeyUp(e)},false);

            this.mesh.markVerticesDataAsUpdatable(VertexBuffer.PositionKind,true);

            this.vertices=mesh.getVerticesData(VertexBuffer.PositionKind);
            this.faceVertices=mesh.getIndices();

            // let vrtColors = box.getVerticesData(VertexBuffer.ColorKind);
            // console.log(vrtColors);
            //box.setVerticesData(VertexBuffer.ColorKind,vrtColors,true,3);
            //            this.vrtColors=new Array(this.vertices.length*4/3);
            //            this.clearColors(this.vrtColors);




            if(this.mode=="F") {
                this.faceSelector=this.createFaceSelector(scene);
                this.ec=new EditControl(this.faceSelector,camera,canvas,0.5,true);
                //????
//                this.facePicked=90;
//                this.highLightFace(this.facePicked,this.faceSelector);
//                this.highLightFace(this.facePicked,this.faceSelector);
            } else if(this.mode=="E") {
                this.edgeSelector=this.createEdgeSelector(scene);
                this.ec=new EditControl(this.edgeSelector,camera,canvas,0.5,true);
            } else if(this.mode=="P"){
                console.log("point selectot");
                this.pointSelector = new Mesh("pointSelector",scene);
                this.ec = new EditControl(this.pointSelector,camera,canvas,0.5,true);
            }

            this.ec.setLocal(true);
            this.ec.enableTranslation();

            this.ec.addActionListener((t) => {
                if(this.mode=="F") {
                    this.updateFacePosition(this.facePicked,this.faceSelector);
                }else if (this.mode=="E"){
                    this.updateEdgePosition(this.facePicked,this.edgeSelector);
                }else if (this.mode=="P"){
                    this.updatePointPosition(this.facePicked,this.pointSelector);
                }
                this.mesh.updateVerticesData(VertexBuffer.PositionKind,this.vertices,false,false);
            })

            scene.onPointerDown=(evt,pickResult) => {

                //select only on right click
                if(!(evt.button==2)) return;
                if(pickResult.hit) {
                    if(pickResult.pickedMesh!=this.mesh) return;
                    this.facePicked=pickResult.faceId;
                    console.log("face id "+this.facePicked);

                    //                    let f: number=pickResult.faceId;
                    //
                    //                    //pick even-odd faces
                    //                    let next: number=f+1;
                    //                    if(Math.floor(f/2)<f/2) {
                    //                        next=f-1;
                    //                    }
                    //                    console.log("faceId "+f+","+next);
                    if(this.mode=="F") this.highLightFace(this.facePicked,this.faceSelector);
                    else if(this.mode=="E") this.highLightEdge(this.facePicked,pickResult.pickedPoint,this.edgeSelector);
                    else if(this.mode=="P") this.highLightPoint(this.facePicked,pickResult.pickedPoint,this.pointSelector);
                }
            };
        }

        private createFaceSelector_old(scene: Scene): Mesh {
            let fs: Mesh=this.createTriangle("selector",1,scene);
            fs.material=new StandardMaterial("impactMat",scene);
            (<StandardMaterial>fs.material).diffuseColor=Color3.Gray();
            fs.visibility=0.8;
            fs.markVerticesDataAsUpdatable(VertexBuffer.PositionKind,true);
            fs.renderingGroupId=1;
            return fs;
        }
        private createFaceSelector(scene: Scene): Mesh {
            let fs: Mesh=Mesh.CreateLines("edgeSelector",[new Vector3(-1,0,0),new Vector3(1,0,0),new Vector3(0,0,1),new Vector3(-1,0,0)],scene);
            //fs.color=Color3.Black();
            let edgeMat: StandardMaterial=new StandardMaterial("edgeMat",scene);
            edgeMat.diffuseColor=Color3.Black();
            edgeMat.emissiveColor=Color3.Black();
            fs.material=edgeMat;
            fs.visibility=1;
            fs.markVerticesDataAsUpdatable(VertexBuffer.PositionKind,true);
            fs.renderingGroupId=1;
            return fs;
        }
        private createEdgeSelector(scene: Scene): Mesh {
            let es: LinesMesh=Mesh.CreateLines("edgeSelector",[new Vector3(-1,0,0),new Vector3(1,0,0)],scene);
            es.color=Color3.Black();
            es.isPickable=false;
            es.renderingGroupId=1;
            es.markVerticesDataAsUpdatable(VertexBuffer.PositionKind,true);
            return es;
        }

        v1v: Vector3=new Vector3(0,0,0);
        v2v: Vector3=new Vector3(0,0,0);
        v3v: Vector3=new Vector3(0,0,0);
        
        private highLightFace(faceId: number,faceSelector: Mesh) {
            console.log("highLightFace");
            this.getFaceVertices(faceId,this.mesh,this.faceVertices);

            //set selector rotation so it is parallel to the triangular face selected
            let a1: Vector3=this.v1v.subtract(this.v2v);
            let a2: Vector3=this.v3v.subtract(this.v2v);
            faceSelector.rotation=this.getRotation(a1,a2);

            //baycenter position
            faceSelector.position.x=(this.v1v.x+this.v2v.x+this.v3v.x)/3;
            faceSelector.position.y=(this.v1v.y+this.v2v.y+this.v3v.y)/3;
            faceSelector.position.z=(this.v1v.z+this.v2v.z+this.v3v.z)/3;

            let verts: number[]|Float32Array=faceSelector.getVerticesData(VertexBuffer.PositionKind);
            console.log(verts.length);
            let sm_i: Matrix=faceSelector.getWorldMatrix().clone().invert();

            Vector3.TransformCoordinatesToRef(this.v1v,sm_i,this.pTemp);
            verts[0]=this.pTemp.x;
            verts[1]=this.pTemp.y;
            verts[2]=this.pTemp.z;

            Vector3.TransformCoordinatesToRef(this.v2v,sm_i,this.pTemp);
            verts[3]=this.pTemp.x;
            verts[4]=this.pTemp.y;
            verts[5]=this.pTemp.z;

            Vector3.TransformCoordinatesToRef(this.v3v,sm_i,this.pTemp);
            verts[6]=this.pTemp.x;
            verts[7]=this.pTemp.y;
            verts[8]=this.pTemp.z;

            //if using line mesh
            verts[9]=verts[0];
            verts[10]=verts[1];
            verts[11]=verts[2];

            faceSelector.setVerticesData(VertexBuffer.PositionKind,verts,true);
            this.ec.switchTo(faceSelector,true);

            //face vertices color
            //            let cc1=v1*4;
            //            let cc2=v2*4;
            //            let cc3=v3*4;
            //            this.setColor(cc1,this.vrtColors,color);
            //            this.setColor(cc2,this.vrtColors,color);
            //            this.setColor(cc3,this.vrtColors,color);
            //            this.mesh.setVerticesData(VertexBuffer.ColorKind,this.vrtColors,true);
        }
        
        pTemp: Vector3=Vector3.Zero();
        private updateFacePosition(faceId: number,faceSelector: Mesh) {
            let i: number=faceId*3;

            //index into the vertices array
            let v1=this.faceVertices[i];
            let v2=this.faceVertices[i+1];
            let v3=this.faceVertices[i+2];

            //start of the three vertices
            let v=this.vertices;
            let v1s=v1*3;
            let v2s=v2*3;
            let v3s=v3*3;

            let verts: number[]|Float32Array=faceSelector.getVerticesData(VertexBuffer.PositionKind);
            let sm: Matrix=faceSelector.getWorldMatrix();

            let mm_i: Matrix=this.mesh.getWorldMatrix().clone().invert();

            //lets get the selector vertex in world space
            Vector3.TransformCoordinatesFromFloatsToRef(verts[0],verts[1],verts[2],sm,this.pTemp);
            //now lets get the selector vertex in mesh's local space.
            Vector3.TransformCoordinatesFromFloatsToRef(this.pTemp.x,this.pTemp.y,this.pTemp.z,mm_i,this.pTemp);

            v[v1s]=this.pTemp.x;
            v[v1s+1]=this.pTemp.y;
            v[v1s+2]=this.pTemp.z;

            Vector3.TransformCoordinatesFromFloatsToRef(verts[3],verts[4],verts[5],sm,this.pTemp);
            Vector3.TransformCoordinatesFromFloatsToRef(this.pTemp.x,this.pTemp.y,this.pTemp.z,mm_i,this.pTemp);

            v[v2s]=this.pTemp.x;
            v[v2s+1]=this.pTemp.y;
            v[v2s+2]=this.pTemp.z;

            Vector3.TransformCoordinatesFromFloatsToRef(verts[6],verts[7],verts[8],sm,this.pTemp);
            Vector3.TransformCoordinatesFromFloatsToRef(this.pTemp.x,this.pTemp.y,this.pTemp.z,mm_i,this.pTemp);

            v[v3s]=this.pTemp.x;
            v[v3s+1]=this.pTemp.y;
            v[v3s+2]=this.pTemp.z;
        };
        
        

        private highLightEdge(faceId: number,pickPoint: Vector3,edgeSelector: Mesh) {
            console.log("highLightEdge");
            this.getFaceVertices(faceId,this.mesh,this.faceVertices);
            //ev1 and ev2 are the two vertices of the edge
            let ev1: Vector3;
            let ev2: Vector3;
            //ev3 will be used to get rotation
            let ev3: Vector3;
            
            let h1=this.getDistance(pickPoint,this.v1v,this.v2v);
            let h2=this.getDistance(pickPoint,this.v2v,this.v3v);
            let h3=this.getDistance(pickPoint,this.v3v,this.v1v);
           
            let min_h=Math.min(h1,h2,h3);

            if (min_h==h1){ ev1=this.v1v;ev2=this.v2v;ev3=this.v3v;this.ep1=1;this.ep2=2;}
            if (min_h==h2){ ev1=this.v2v;ev2=this.v3v;ev3=this.v1v;this.ep1=2;this.ep2=3;}
            if (min_h==h3){ ev1=this.v3v;ev2=this.v1v;ev3=this.v2v;this.ep1=3;this.ep2=1;}

 
            //set selector rotation so it is parallel to the triangular face selected
            let a1: Vector3=ev1.subtract(ev2);
            let a2: Vector3=ev3.subtract(ev2);
            edgeSelector.rotation=this.getRotation(a1,a2);

            //baycenter position
            edgeSelector.position.x=(ev1.x+ev2.x)/2;
            edgeSelector.position.y=(ev1.y+ev2.y)/2;
            edgeSelector.position.z=(ev1.z+ev2.z)/2;

            let verts: number[]|Float32Array=edgeSelector.getVerticesData(VertexBuffer.PositionKind);
            let sm_i: Matrix=edgeSelector.getWorldMatrix().clone().invert();

            Vector3.TransformCoordinatesToRef(ev1,sm_i,this.pTemp);
            verts[0]=this.pTemp.x;
            verts[1]=this.pTemp.y;
            verts[2]=this.pTemp.z;

            Vector3.TransformCoordinatesToRef(ev2,sm_i,this.pTemp);
            verts[3]=this.pTemp.x;
            verts[4]=this.pTemp.y;
            verts[5]=this.pTemp.z;

            edgeSelector.setVerticesData(VertexBuffer.PositionKind,verts,true);
            this.ec.switchTo(edgeSelector,true);
        }
        
        private ep1:number;
        private ep2:number;
        private updateEdgePosition(faceId: number,edgeSelector: Mesh) {
            let i: number=faceId*3;

            //index into the vertices array
            let v1=this.faceVertices[i+this.ep1-1];
            let v2=this.faceVertices[i+this.ep2-1];

            //start of the three vertices
            let v=this.vertices;
            let v1s=v1*3;
            let v2s=v2*3;


            let verts: number[]|Float32Array=edgeSelector.getVerticesData(VertexBuffer.PositionKind);
            let sm: Matrix=edgeSelector.getWorldMatrix();

            let mm_i: Matrix=this.mesh.getWorldMatrix().clone().invert();

            //lets get the selector vertex in world space
            Vector3.TransformCoordinatesFromFloatsToRef(verts[0],verts[1],verts[2],sm,this.pTemp);
            //now lets get the selector vertex in mesh's local space.
            Vector3.TransformCoordinatesFromFloatsToRef(this.pTemp.x,this.pTemp.y,this.pTemp.z,mm_i,this.pTemp);

            v[v1s]=this.pTemp.x;
            v[v1s+1]=this.pTemp.y;
            v[v1s+2]=this.pTemp.z;

            Vector3.TransformCoordinatesFromFloatsToRef(verts[3],verts[4],verts[5],sm,this.pTemp);
            Vector3.TransformCoordinatesFromFloatsToRef(this.pTemp.x,this.pTemp.y,this.pTemp.z,mm_i,this.pTemp);

            v[v2s]=this.pTemp.x;
            v[v2s+1]=this.pTemp.y;
            v[v2s+2]=this.pTemp.z;
        };
        
        private p;
        private highLightPoint(faceId: number,pickPoint: Vector3,pointSelector: Mesh) {

            this.getFaceVertices(faceId,this.mesh,this.faceVertices);
            //p1 is the vertex of the point
            let p1: Vector3;
            //p2 and p3 will be used for edit control orientation
            let p2: Vector3;
            let p3: Vector3;


            //get the vertex the pickpoint is closest to
            let l1=pickPoint.subtract(this.v1v).length();
            let l2=pickPoint.subtract(this.v2v).length();
            let l3=pickPoint.subtract(this.v3v).length();
            
            let min_l=Math.min(l1,l2,l3);
            if (min_l==l1){this.p=1;p1=this.v1v;p2=this.v3v;p3=this.v2v;}
            if (min_l==l2){this.p=2;p1=this.v2v;p2=this.v1v;p3=this.v3v;}
            if (min_l==l3){this.p=3;p1=this.v3v;p2=this.v2v;p3=this.v1v;}

            //set selector rotation so that it's Y axis(up) is parallel to the selected face normal
            let a1: Vector3=p2.subtract(p1);
            let a2: Vector3=p3.subtract(p1);
            pointSelector.rotation=this.getRotation(a1,a2);

            pointSelector.position=p1;

            this.ec.switchTo(pointSelector,true);
        }
        
        private updatePointPosition(faceId: number,pointSelector: Mesh) {
            let i: number=faceId*3;

            //index into the vertices array
            let v1=this.faceVertices[i+this.p-1];

            //start of the three vertices
            let v=this.vertices;
            let v1s=v1*3;
            
            //now lets get the selector vertex in mesh's local space.
            let mm_i: Matrix=this.mesh.getWorldMatrix().clone().invert();
            Vector3.TransformCoordinatesToRef(pointSelector.position,mm_i,this.pTemp);

            v[v1s]=this.pTemp.x;
            v[v1s+1]=this.pTemp.y;
            v[v1s+2]=this.pTemp.z;
           
        };
        
        private getFaceVertices(faceId: number,mesh: Mesh,faceVertices: IndicesArray) {
            let i: number=faceId*3;

            //index into the vertices array
            let v1=faceVertices[i];
            let v2=faceVertices[i+1];
            let v3=faceVertices[i+2];

            let mm: Matrix=mesh.getWorldMatrix();

            //start of the three vertices
            let v=this.vertices;
            let v1s=v1*3;
            let v2s=v2*3;
            let v3s=v3*3;

            //get vertices in world frame of reference
            Vector3.TransformCoordinatesFromFloatsToRef(v[v1s],v[v1s+1],v[v1s+2],mm,this.v1v);
            Vector3.TransformCoordinatesFromFloatsToRef(v[v2s],v[v2s+1],v[v2s+2],mm,this.v2v);
            Vector3.TransformCoordinatesFromFloatsToRef(v[v3s],v[v3s+1],v[v3s+2],mm,this.v3v);

        }

        private setMaterial(mesh: Mesh,color: Color3,scene: Scene) {
            mesh.material=new StandardMaterial("",scene);
            (<StandardMaterial>mesh.material).diffuseColor=color;
        }

        //reset each face to white
        private clearColors(vrtColors) {
            let j=vrtColors.length-3;
            for(let i=0;i<j;i=i+4) {
                vrtColors[i]=1;
                vrtColors[i+1]=1;
                vrtColors[i+2]=1;
                vrtColors[i+3]=1;
            }
        }

        private setColor(cc,vrtColors,color) {
            vrtColors[cc]=color.r;
            vrtColors[cc+1]=color.g;
            vrtColors[cc+2]=color.b;
            vrtColors[cc+3]=0;

        }

        private onKeyUp(e: Event) {
            var event: KeyboardEvent=<KeyboardEvent>e;
            var chr: string=String.fromCharCode(event.keyCode);
            
            //esc
            if(event.keyCode===27) {
                //this.ec.disableTranslation();
            }

            if(chr==="F") {
                (<ArcRotateCamera>this.camera).target=this.ec.getPosition();
//                (<ArcRotateCamera>this.camera).target.x=this.faceSelector.position.x;
//                (<ArcRotateCamera>this.camera).target.y=this.faceSelector.position.y;
//                (<ArcRotateCamera>this.camera).target.z=this.faceSelector.position.z;
            }
            if(chr==="1") {
                this.ec.enableTranslation();
            }
            if(chr==="2") {
                this.ec.enableRotation();
            }
            if(chr==="3") {
                this.ec.enableScaling();
                if(!this.ec.isLocal()) this.ec.setLocal(true);
            }
            if(chr==="L") {
                this.ec.setLocal(!this.ec.isLocal());
            }
            if(chr==="W") {
                this.mesh.material.wireframe=!this.mesh.material.wireframe;
            }
        }

        private createTriangle(name: string,w: number,scene: Scene) {
            let p: Path2=new Path2(w/2,-w/2).addLineTo(w/2,w/2).addLineTo(-w/2,w/2).addLineTo(w/2,-w/2);
            var s=new BABYLON.PolygonMeshBuilder(name,p,scene)
            var t=s.build(true);
            return t;
        }
        
        
        private getRotation(a1: Vector3,a2: Vector3): Vector3 {
            //get three orthogonal axis a1,v,a3
            //where v is perpendicular to a1 and a2
            //and a3 is perpendicular to a1 and v
            Vector3.CrossToRef(a1,a2,this.pTemp);
            let a3: Vector3=Vector3.Cross(this.pTemp,a1);
            //get the rotation of the frame of referencec made uo by a1,v,a3
            return Vector3.RotationFromAxis(a3,this.pTemp,a1);
        }
        /**
         * returns distance of point p1 from line segment formed by points p2 and p3
         */
        private getDistance(p1:Vector3,p2:Vector3,p3:Vector3):number{
            let v1: Vector3=p1.subtract(p2);
            let v2: Vector3=p3.subtract(p2);
            //angle between v1 & v2
            let angle: number=Math.acos((Vector3.Dot(v1,v2.normalize())/v1.length()));
            return v1.length()*Math.sin(angle);
            
            
        }

    }
}
