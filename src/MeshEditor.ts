
namespace org.ssatguru.babylonjs.component {

    import ArcRotateCamera=BABYLON.ArcRotateCamera;
    import MeshBuilder=BABYLON.MeshBuilder;
    import Color3=BABYLON.Color3;
    import Camera=BABYLON.Camera;
    import IndicesArray=BABYLON.IndicesArray;
    import Vector3=BABYLON.Vector3;
    import Mesh=BABYLON.Mesh;
    import Scene=BABYLON.Scene;
    import StandardMaterial=BABYLON.StandardMaterial;
    import Ray=BABYLON.Ray;
    import PickingInfo=BABYLON.PickingInfo;
    import VertexBuffer=BABYLON.VertexBuffer;
    import EditControl=org.ssatguru.babylonjs.component.EditControl;

    export class MeshEditor {

        vertices: number[]|Float32Array;
        vrtColors: number[]|Float32Array;
        faceVertices: IndicesArray;
        mesh: Mesh;
        points: Mesh[];
        nextPoints: Mesh[];
        faceId: number=0;
        prevPosition: Vector3=Vector3.Zero();
        delta: Vector3=Vector3.Zero();
        facePicked: number=0;
        faceSelected: boolean=false;
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

            this.vrtColors=new Array(this.vertices.length*4/3);
            this.clearColors(this.vrtColors);

            let r: number=0.1;
            this.faceSelector=Mesh.CreateSphere("",10,r,scene);
            this.faceSelector.material=new StandardMaterial("impactMat",scene);
            (<StandardMaterial>this.faceSelector.material).diffuseColor=Color3.Black();

            this.faceSelector.rotationQuaternion=BABYLON.Quaternion.Zero();

            this.ec=new EditControl(this.faceSelector,camera,canvas,0.5,false);

            this.ec.addActionListener((t) => {
                this.faceSelector.position.subtractToRef(this.prevPosition,this.delta);
                s1.position.addInPlace(this.delta);
                s2.position.addInPlace(this.delta);
                s3.position.addInPlace(this.delta);
                this.prevPosition.set(this.faceSelector.position.x,this.faceSelector.position.y,this.faceSelector.position.z);
                this.updateFacePosition(this.facePicked,this.points);
                this.mesh.updateVerticesData(VertexBuffer.PositionKind,this.vertices,false,false);
            })

            //this.faceSelector.position=new Vector3(0,0,0);

            let s1=Mesh.CreateSphere("s1",3,r,scene);
            this.setMaterial(s1,Color3.Blue(),scene);
            let s2=s1.clone("s2");
            let s3=s1.clone("s3");

            //            let s2=Mesh.CreateSphere("s2",5,r,scene);
            //            this.setMaterial(s2,Color3.Green(),scene);
            //
            //            let s3=Mesh.CreateSphere("s3",5,r,scene);
            //            this.setMaterial(s3,Color3.Blue(),scene);


            this.points=[s1,s2,s3];

            //            let s4=s3.c            lone("s4");
            //            this.setMaterial(s4,Color3.Yello            w(),scene);
            //            let s5=s4.c            lone("s5");
            //            let s6=s4.c            lone("s6");
            //            this.nextPoints=[s4,s5,s6];


            scene.onPointerDown=(evt,pickResult) => {

                //select only on right click
                if(!(evt.button==2)) return;
                if(pickResult.hit) {
                    this.ec.enableTranslation();
                    this.faceSelected=true;

                    this.faceSelector.position=pickResult.pickedPoint;

                    this.prevPosition.set(this.faceSelector.position.x,this.faceSelector.position.y,this.faceSelector.position.z);
                    this.clearColors(this.vrtColors);
                    this.facePicked=pickResult.faceId;
                    //                    let f: number=pickResult.faceId;
                    //
                    //                    //pick even-odd faces
                    //                    let next: number=f+1;
                    //                    if(Math.floor(f/2)<f/2) {
                    //                        next=f-1;
                    //                    }
                    //                    console.log("faceId "+f+","+next);
                    this.highLightFace(this.facePicked,Color3.Gray(),this.points);
                    //this.highLightFace(next,Color3.Red(),this.nextPoints);

                }
            };
        }

        private updateFacePosition(faceId: number,points: Mesh[]) {
            let i: number=faceId*3;
            let v1=this.faceVertices[i];
            let v2=this.faceVertices[i+1];
            let v3=this.faceVertices[i+2];

            let v=this.vertices;
            let vv1=v1*3;
            let vv2=v2*3;
            let vv3=v3*3;

            v[vv1]=points[0].position.x;
            v[vv1+1]=points[0].position.y;
            v[vv1+2]=points[0].position.z;

            v[vv2]=points[1].position.x;
            v[vv2+1]=points[1].position.y;
            v[vv2+2]=points[1].position.z;

            v[vv3]=points[2].position.x;
            v[vv3+1]=points[2].position.y;
            v[vv3+2]=points[2].position.z;

        };

        private highLightFace(faceId: number,color: Color3,points: Mesh[]) {
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
            let p1=new Vector3(v[vv1],v[vv1+1],v[vv1+2]);
            let p2=new Vector3(v[vv2],v[vv2+1],v[vv2+2]);
            let p3=new Vector3(v[vv3],v[vv3+1],v[vv3+2]);

            points[0].position=p1;
            points[1].position=p2;
            points[2].position=p3;

            //face vertices color
            let cc1=v1*4;
            let cc2=v2*4;
            let cc3=v3*4;
            this.setColor(cc1,this.vrtColors,color);
            this.setColor(cc2,this.vrtColors,color);
            this.setColor(cc3,this.vrtColors,color);
            this.mesh.setVerticesData(VertexBuffer.ColorKind,this.vrtColors,true);
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
            if(event.keyCode===27) {
                this.faceSelected=false;
                this.ec.disableTranslation();
            }

            if(chr==="F") {
                (<ArcRotateCamera>this.camera).target=this.faceSelector.position;
            }
        }

    }
}
