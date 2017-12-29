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
        facePicked: number;
        ec: EditControl;
        camera: Camera;
        mode: String;
        faceSelector: Mesh;
        edgeSelector: Mesh;
        pointSelector: Mesh;
        selectedMesh: Mesh;
        enablePoint(): void;
        enableEdge(): void;
        enableFace(): void;
        constructor(mesh: Mesh, camera: Camera, canvas: HTMLCanvasElement, scene: Scene);
        private createFaceSelector_old(scene);
        private createFaceSelector(scene);
        private createEdgeSelector(scene);
        v1v: Vector3;
        v2v: Vector3;
        v3v: Vector3;
        private highLightFace(faceId, faceSelector);
        pTemp: Vector3;
        private updateFacePosition(faceId, faceSelector);
        private highLightEdge(faceId, pickPoint, edgeSelector);
        private ep1;
        private ep2;
        private updateEdgePosition(faceId, edgeSelector);
        private p;
        private highLightPoint(faceId, pickPoint, pointSelector);
        private updatePointPosition(faceId, pointSelector);
        private getFaceVertices(faceId, mesh, faceVertices);
        private setMaterial(mesh, color, scene);
        private clearColors(vrtColors);
        private setColor(cc, vrtColors, color);
        private onKeyUp(e);
        private createTriangle(name, w, scene);
        private getRotation(a1, a2);
        private getDistance(p1, p2, p3);
    }
}
