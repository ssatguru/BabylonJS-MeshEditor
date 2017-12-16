declare namespace org.ssatguru.babylonjs.component {
    import Camera = BABYLON.Camera;
    import IndicesArray = BABYLON.IndicesArray;
    import Vector3 = BABYLON.Vector3;
    import Mesh = BABYLON.Mesh;
    import Scene = BABYLON.Scene;
    import EditControl = org.ssatguru.babylonjs.component.EditControl;
    class MeshEditor {
        vertices: number[] | Float32Array;
        vrtColors: number[] | Float32Array;
        faceVertices: IndicesArray;
        mesh: Mesh;
        points: Mesh[];
        nextPoints: Mesh[];
        faceId: number;
        prevPosition: Vector3;
        delta: Vector3;
        facePicked: number;
        faceSelected: boolean;
        faceSelector: Mesh;
        ec: EditControl;
        camera: Camera;
        constructor(mesh: Mesh, camera: Camera, canvas: HTMLCanvasElement, scene: Scene);
        private updateFacePosition(faceId, points);
        private highLightFace(faceId, color, points);
        private setMaterial(mesh, color, scene);
        private clearColors(vrtColors);
        private setColor(cc, vrtColors, color);
        private onKeyUp(e);
    }
}
