
namespace org.ssatguru.babylonjs.component {

    import ArcRotateCamera=BABYLON.ArcRotateCamera;
    import MeshBuilder=BABYLON.MeshBuilder;
    import Color3=BABYLON.Color3;
    import Camera=BABYLON.Camera;
    import IndicesArray=BABYLON.IndicesArray;
    import Vector3=BABYLON.Vector3;
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
        faceSelector: Mesh;
        ec: EditControl;
        camera: Camera;

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

            this.faceSelector=this.createTriangle("selector",1,scene);
            this.faceSelector.material=new StandardMaterial("impactMat",scene);
            (<StandardMaterial>this.faceSelector.material).diffuseColor=Color3.Gray();
            this.faceSelector.visibility=0.8;
            this.faceSelector.markVerticesDataAsUpdatable(VertexBuffer.PositionKind,true);
            this.faceSelector.renderingGroupId=1;
            
            this.ec=new EditControl(this.faceSelector,camera,canvas,0.5,true);
            this.ec.setLocal(true);
            this.ec.enableTranslation();
            //this.ec.enableRotation();
            //this.ec.enableScaling();
            
            //????
            this.facePicked=90;
            this.highLightFace(this.facePicked,this.faceSelector);
            this.highLightFace(this.facePicked,this.faceSelector);
            
            this.ec.addActionListener((t) => {
                this.updateFacePosition(this.facePicked,this.faceSelector);
                this.mesh.updateVerticesData(VertexBuffer.PositionKind,this.vertices,false,false);
            })

            scene.onPointerDown=(evt,pickResult) => {
                
                //select only on right click
                if(!(evt.button==2)) return;
                if(pickResult.hit) {
                    if (pickResult.pickedMesh != this.mesh) return;
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

                    this.highLightFace(this.facePicked,this.faceSelector);
                }
            };
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
            
            let verts: number[]|Float32Array = faceSelector.getVerticesData(VertexBuffer.PositionKind);
            let sm:Matrix = faceSelector.getWorldMatrix();
          
            
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

        v1v:Vector3=new Vector3(0,0,0);
        v2v:Vector3=new Vector3(0,0,0);
        v3v:Vector3=new Vector3(0,0,0);
        private highLightFace(faceId: number, faceSelector: Mesh) {
            let i: number=faceId*3;
            
            //index into the vertices array
            let v1=this.faceVertices[i];
            let v2=this.faceVertices[i+1];
            let v3=this.faceVertices[i+2];

            let mm: Matrix=this.mesh.getWorldMatrix();

            //start of the three vertices
            let v=this.vertices;
            let v1s=v1*3;
            let v2s=v2*3;
            let v3s=v3*3;
            
            Vector3.TransformCoordinatesFromFloatsToRef(v[v1s],v[v1s+1],v[v1s+2],mm,this.v1v);
            Vector3.TransformCoordinatesFromFloatsToRef(v[v2s],v[v2s+1],v[v2s+2],mm,this.v2v);
            Vector3.TransformCoordinatesFromFloatsToRef(v[v3s],v[v3s+1],v[v3s+2],mm,this.v3v);
            
           //set selector rotation so it is parallel to the triangular face selected
            let a1: Vector3=this.v1v.subtract(this.v2v);
            let a2: Vector3=this.v3v.subtract(this.v2v);
            this.faceSelector.rotation=this.getRotation(a1,a2);
            
            //baycenter position
            faceSelector.position.x=(this.v1v.x+this.v2v.x+this.v3v.x)/3;
            faceSelector.position.y=(this.v1v.y+this.v2v.y+this.v3v.y)/3;
            faceSelector.position.z=(this.v1v.z+this.v2v.z+this.v3v.z)/3;
            
            let verts: number[]|Float32Array = faceSelector.getVerticesData(VertexBuffer.PositionKind);
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
                (<ArcRotateCamera>this.camera).target.x=this.faceSelector.position.x;
                (<ArcRotateCamera>this.camera).target.y=this.faceSelector.position.y;
                (<ArcRotateCamera>this.camera).target.z=this.faceSelector.position.z;
            }
            if(chr==="1") {
                this.ec.enableTranslation();
            }
            if(chr==="2") {
                this.ec.enableRotation();
            }
            if(chr==="3") {
                this.ec.enableScaling();
                if (!this.ec.isLocal()) this.ec.setLocal(true);
            }
            if (chr==="L"){
                this.ec.setLocal(!this.ec.isLocal());
            }
            if (chr==="W"){
                this.mesh.material.wireframe=!this.mesh.material.wireframe;
            }
        }
        
        private createTriangle(name: string,w: number,scene: Scene) {
            let p: Path2=new Path2(w/2,-w/2).addLineTo(w/2,w/2).addLineTo(-w/2,w/2).addLineTo(w/2,-w/2);
            var s=new BABYLON.PolygonMeshBuilder(name,p,scene)
            var t=s.build(true);
            return t;
        }
        
        private  getRotation(a1:Vector3,a2:Vector3):Vector3{
            Vector3.CrossToRef(a1,a2,this.pTemp);
            let a3:Vector3=Vector3.Cross(this.pTemp,a1);
            return Vector3.RotationFromAxis(a3,this.pTemp,a1);
        }

    }
}
