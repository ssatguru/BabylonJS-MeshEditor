
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
//        vrtColors: number[]|Float32Array;
        faceVertices: IndicesArray;
        mesh: Mesh;
        faceId: number=0;
//        prevPosition: Vector3=Vector3.Zero();
        delta: Vector3=Vector3.Zero();
        facePicked: number=0;
        //faceSelected: boolean=false;
        faceSelector: Mesh;
        ec: EditControl;
        camera: Camera;

        constructor(mesh: Mesh,camera: Camera,canvas: HTMLCanvasElement,scene: Scene) {
            this.camera=camera;
            
         
            window.addEventListener("keyup",(e) => {return this.onKeyUp(e)},false);

            this.mesh=mesh;

            this.mesh.markVerticesDataAsUpdatable(VertexBuffer.PositionKind,true);

            this.vertices=mesh.getVerticesData(VertexBuffer.PositionKind);
            let vrtNormal=mesh.getVerticesData(VertexBuffer.NormalKind);
            let vrtUV=mesh.getVerticesData(VertexBuffer.UVKind);
            this.faceVertices=mesh.getIndices();

            // let vrtColors = box.getVerticesData(VertexBuffer.ColorKind);
            // console.log(vrtColors);
            //box.setVerticesData(VertexBuffer.ColorKind,vrtColors,true,3);
//            this.vrtColors=new Array(this.vertices.length*4/3);
//            this.clearColors(this.vrtColors);

            this.faceSelector=this.createTriangle("selector",1,scene);
            this.faceSelector.material=new StandardMaterial("impactMat",scene);
            (<StandardMaterial>this.faceSelector.material).diffuseColor=Color3.Black();
            this.faceSelector.rotationQuaternion=BABYLON.Quaternion.Identity();
            this.faceSelector.markVerticesDataAsUpdatable(VertexBuffer.PositionKind,true);
            
            
            this.ec=new EditControl(this.faceSelector,camera,canvas,0.5,false);
            this.ec.setLocal(true);
            this.ec.enableTranslation();
            //this.ec.enableRotation();
            //this.ec.enableScaling();
            
            //????
            this.highLightFace(0,this.faceSelector);
            this.highLightFace(0,this.faceSelector);
            
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
            let v1=this.faceVertices[i];
            let v2=this.faceVertices[i+1];
            let v3=this.faceVertices[i+2];

            let v=this.vertices;
            let vv1=v1*3;
            let vv2=v2*3;
            let vv3=v3*3;
            
            let verts: number[]|Float32Array = faceSelector.getVerticesData(VertexBuffer.PositionKind);
            let matrix:Matrix = faceSelector.getWorldMatrix();
            
            Vector3.TransformCoordinatesFromFloatsToRef(verts[0],verts[1],verts[2],matrix,this.pTemp);
            
            //TODO need to convert to mesh local space
            
            v[vv1]=this.pTemp.x;
            v[vv1+1]=this.pTemp.y;
            v[vv1+2]=this.pTemp.z;
            
            Vector3.TransformCoordinatesFromFloatsToRef(verts[3],verts[4],verts[5],matrix,this.pTemp);
            v[vv2]=this.pTemp.x;
            v[vv2+1]=this.pTemp.y;
            v[vv2+2]=this.pTemp.z;
            
            Vector3.TransformCoordinatesFromFloatsToRef(verts[6],verts[7],verts[8],matrix,this.pTemp);
            v[vv3]=this.pTemp.x;
            v[vv3+1]=this.pTemp.y;
            v[vv3+2]=this.pTemp.z;


        };


        private highLightFace(faceId: number, faceSelector: Mesh) {
            let i: number=faceId*3;
            let v1=this.faceVertices[i];
            let v2=this.faceVertices[i+1];
            let v3=this.faceVertices[i+2];
            console.log("face vertex index : "+v1+","+v2+","+v3);


            //face vertices position
            let v=this.vertices;
            let vv1=v1*3;
            let vv2=v2*3;
            let vv3=v3*3;
            
            faceSelector.position.x=(v[vv1]+v[vv2]+v[vv3])/3;
            faceSelector.position.y=(v[vv1+1]+v[vv2+1]+v[vv3+1])/3;
            faceSelector.position.z=(v[vv1+2]+v[vv2+2]+v[vv3+2])/3;
            
            let verts: number[]|Float32Array = faceSelector.getVerticesData(VertexBuffer.PositionKind);
            let matrix: Matrix=faceSelector.getWorldMatrix().invert();
            
            Vector3.TransformCoordinatesFromFloatsToRef(v[vv1],v[vv1+1],v[vv1+2],matrix,this.pTemp);
            verts[0]=this.pTemp.x;
            verts[1]=this.pTemp.y;
            verts[2]=this.pTemp.z;
            
            Vector3.TransformCoordinatesFromFloatsToRef(v[vv2],v[vv2+1],v[vv2+2],matrix,this.pTemp);
            verts[3]=this.pTemp.x;
            verts[4]=this.pTemp.y;
            verts[5]=this.pTemp.z;
            
            Vector3.TransformCoordinatesFromFloatsToRef(v[vv3],v[vv3+1],v[vv3+2],matrix,this.pTemp);
            verts[6]=this.pTemp.x;
            verts[7]=this.pTemp.y;
            verts[8]=this.pTemp.z;
            
            faceSelector.setVerticesData(VertexBuffer.PositionKind,verts,true);
            

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
                //this.ec.enableScaling();
            }
        }
        
        private createTriangle(name: string,w: number,scene: Scene) {
            let p: Path2=new Path2(w/2,-w/2).addLineTo(w/2,w/2).addLineTo(-w/2,w/2).addLineTo(w/2,-w/2);
            var s=new BABYLON.PolygonMeshBuilder(name,p,scene)
            var t=s.build(true);
            return t;
        }

    }
}
