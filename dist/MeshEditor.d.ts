declare namespace org.ssatguru.babylonjs.component {
    import Camera = BABYLON.Camera;
    import IndicesArray = BABYLON.IndicesArray;
    import Vector3 = BABYLON.Vector3;
    import Mesh = BABYLON.Mesh;
    import Scene = BABYLON.Scene;
    import EditControl = org.ssatguru.babylonjs.component.EditControl;
    class MeshEditor {
        vertices: number[] | Float32Array;
        faceVertices: IndicesArray;
        mesh: Mesh;
        faceId: number;
        delta: Vector3;
        facePicked: number;
        faceSelector: Mesh;
        ec: EditControl;
        camera: Camera;
        constructor(mesh: Mesh, camera: Camera, canvas: HTMLCanvasElement, scene: Scene);
        pTemp: Vector3;
        private updateFacePosition(faceId, faceSelector);
        private highLightFace(faceId, faceSelector);
        private setMaterial(mesh, color, scene);
        private clearColors(vrtColors);
        private setColor(cc, vrtColors, color);
        private onKeyUp(e);
        private createTriangle(name, w, scene);
    }
}
