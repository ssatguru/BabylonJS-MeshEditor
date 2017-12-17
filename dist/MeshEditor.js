var org;
(function (org) {
    var ssatguru;
    (function (ssatguru) {
        var babylonjs;
        (function (babylonjs) {
            var component;
            (function (component) {
                var Color3 = BABYLON.Color3;
                var Vector3 = BABYLON.Vector3;
                var StandardMaterial = BABYLON.StandardMaterial;
                var Path2 = BABYLON.Path2;
                var VertexBuffer = BABYLON.VertexBuffer;
                var EditControl = org.ssatguru.babylonjs.component.EditControl;
                var MeshEditor = (function () {
                    function MeshEditor(mesh, camera, canvas, scene) {
                        var _this = this;
                        this.facePicked = 0;
                        this.pTemp = Vector3.Zero();
                        this.v1v = new Vector3(0, 0, 0);
                        this.v2v = new Vector3(0, 0, 0);
                        this.v3v = new Vector3(0, 0, 0);
                        this.camera = camera;
                        this.mesh = mesh;
                        window.addEventListener("keyup", function (e) { return _this.onKeyUp(e); }, false);
                        this.mesh.markVerticesDataAsUpdatable(VertexBuffer.PositionKind, true);
                        this.vertices = mesh.getVerticesData(VertexBuffer.PositionKind);
                        this.faceVertices = mesh.getIndices();
                        this.faceSelector = this.createTriangle("selector", 1, scene);
                        this.faceSelector.material = new StandardMaterial("impactMat", scene);
                        this.faceSelector.material.diffuseColor = Color3.Gray();
                        this.faceSelector.visibility = 0.8;
                        this.faceSelector.markVerticesDataAsUpdatable(VertexBuffer.PositionKind, true);
                        this.faceSelector.renderingGroupId = 1;
                        this.ec = new EditControl(this.faceSelector, camera, canvas, 0.5, true);
                        this.ec.setLocal(true);
                        this.ec.enableTranslation();
                        this.facePicked = 90;
                        this.highLightFace(this.facePicked, this.faceSelector);
                        this.highLightFace(this.facePicked, this.faceSelector);
                        this.ec.addActionListener(function (t) {
                            _this.updateFacePosition(_this.facePicked, _this.faceSelector);
                            _this.mesh.updateVerticesData(VertexBuffer.PositionKind, _this.vertices, false, false);
                        });
                        scene.onPointerDown = function (evt, pickResult) {
                            if (!(evt.button == 2))
                                return;
                            if (pickResult.hit) {
                                if (pickResult.pickedMesh != _this.mesh)
                                    return;
                                _this.facePicked = pickResult.faceId;
                                console.log("face id " + _this.facePicked);
                                _this.highLightFace(_this.facePicked, _this.faceSelector);
                            }
                        };
                    }
                    MeshEditor.prototype.updateFacePosition = function (faceId, faceSelector) {
                        var i = faceId * 3;
                        var v1 = this.faceVertices[i];
                        var v2 = this.faceVertices[i + 1];
                        var v3 = this.faceVertices[i + 2];
                        var v = this.vertices;
                        var v1s = v1 * 3;
                        var v2s = v2 * 3;
                        var v3s = v3 * 3;
                        var verts = faceSelector.getVerticesData(VertexBuffer.PositionKind);
                        var sm = faceSelector.getWorldMatrix();
                        var mm_i = this.mesh.getWorldMatrix().clone().invert();
                        Vector3.TransformCoordinatesFromFloatsToRef(verts[0], verts[1], verts[2], sm, this.pTemp);
                        Vector3.TransformCoordinatesFromFloatsToRef(this.pTemp.x, this.pTemp.y, this.pTemp.z, mm_i, this.pTemp);
                        v[v1s] = this.pTemp.x;
                        v[v1s + 1] = this.pTemp.y;
                        v[v1s + 2] = this.pTemp.z;
                        Vector3.TransformCoordinatesFromFloatsToRef(verts[3], verts[4], verts[5], sm, this.pTemp);
                        Vector3.TransformCoordinatesFromFloatsToRef(this.pTemp.x, this.pTemp.y, this.pTemp.z, mm_i, this.pTemp);
                        v[v2s] = this.pTemp.x;
                        v[v2s + 1] = this.pTemp.y;
                        v[v2s + 2] = this.pTemp.z;
                        Vector3.TransformCoordinatesFromFloatsToRef(verts[6], verts[7], verts[8], sm, this.pTemp);
                        Vector3.TransformCoordinatesFromFloatsToRef(this.pTemp.x, this.pTemp.y, this.pTemp.z, mm_i, this.pTemp);
                        v[v3s] = this.pTemp.x;
                        v[v3s + 1] = this.pTemp.y;
                        v[v3s + 2] = this.pTemp.z;
                    };
                    ;
                    MeshEditor.prototype.highLightFace = function (faceId, faceSelector) {
                        var i = faceId * 3;
                        var v1 = this.faceVertices[i];
                        var v2 = this.faceVertices[i + 1];
                        var v3 = this.faceVertices[i + 2];
                        var mm = this.mesh.getWorldMatrix();
                        var v = this.vertices;
                        var v1s = v1 * 3;
                        var v2s = v2 * 3;
                        var v3s = v3 * 3;
                        Vector3.TransformCoordinatesFromFloatsToRef(v[v1s], v[v1s + 1], v[v1s + 2], mm, this.v1v);
                        Vector3.TransformCoordinatesFromFloatsToRef(v[v2s], v[v2s + 1], v[v2s + 2], mm, this.v2v);
                        Vector3.TransformCoordinatesFromFloatsToRef(v[v3s], v[v3s + 1], v[v3s + 2], mm, this.v3v);
                        var a1 = this.v1v.subtract(this.v2v);
                        var a2 = this.v3v.subtract(this.v2v);
                        this.faceSelector.rotation = this.getRotation(a1, a2);
                        faceSelector.position.x = (this.v1v.x + this.v2v.x + this.v3v.x) / 3;
                        faceSelector.position.y = (this.v1v.y + this.v2v.y + this.v3v.y) / 3;
                        faceSelector.position.z = (this.v1v.z + this.v2v.z + this.v3v.z) / 3;
                        var verts = faceSelector.getVerticesData(VertexBuffer.PositionKind);
                        var sm_i = faceSelector.getWorldMatrix().clone().invert();
                        Vector3.TransformCoordinatesToRef(this.v1v, sm_i, this.pTemp);
                        verts[0] = this.pTemp.x;
                        verts[1] = this.pTemp.y;
                        verts[2] = this.pTemp.z;
                        Vector3.TransformCoordinatesToRef(this.v2v, sm_i, this.pTemp);
                        verts[3] = this.pTemp.x;
                        verts[4] = this.pTemp.y;
                        verts[5] = this.pTemp.z;
                        Vector3.TransformCoordinatesToRef(this.v3v, sm_i, this.pTemp);
                        verts[6] = this.pTemp.x;
                        verts[7] = this.pTemp.y;
                        verts[8] = this.pTemp.z;
                        faceSelector.setVerticesData(VertexBuffer.PositionKind, verts, true);
                        this.ec.switchTo(faceSelector, true);
                    };
                    MeshEditor.prototype.setMaterial = function (mesh, color, scene) {
                        mesh.material = new StandardMaterial("", scene);
                        mesh.material.diffuseColor = color;
                    };
                    MeshEditor.prototype.clearColors = function (vrtColors) {
                        var j = vrtColors.length - 3;
                        for (var i = 0; i < j; i = i + 4) {
                            vrtColors[i] = 1;
                            vrtColors[i + 1] = 1;
                            vrtColors[i + 2] = 1;
                            vrtColors[i + 3] = 1;
                        }
                    };
                    MeshEditor.prototype.setColor = function (cc, vrtColors, color) {
                        vrtColors[cc] = color.r;
                        vrtColors[cc + 1] = color.g;
                        vrtColors[cc + 2] = color.b;
                        vrtColors[cc + 3] = 0;
                    };
                    MeshEditor.prototype.onKeyUp = function (e) {
                        var event = e;
                        var chr = String.fromCharCode(event.keyCode);
                        if (event.keyCode === 27) {
                        }
                        if (chr === "F") {
                            this.camera.target.x = this.faceSelector.position.x;
                            this.camera.target.y = this.faceSelector.position.y;
                            this.camera.target.z = this.faceSelector.position.z;
                        }
                        if (chr === "1") {
                            this.ec.enableTranslation();
                        }
                        if (chr === "2") {
                            this.ec.enableRotation();
                        }
                        if (chr === "3") {
                            this.ec.enableScaling();
                            if (!this.ec.isLocal())
                                this.ec.setLocal(true);
                        }
                        if (chr === "L") {
                            this.ec.setLocal(!this.ec.isLocal());
                        }
                        if (chr === "W") {
                            this.mesh.material.wireframe = !this.mesh.material.wireframe;
                        }
                    };
                    MeshEditor.prototype.createTriangle = function (name, w, scene) {
                        var p = new Path2(w / 2, -w / 2).addLineTo(w / 2, w / 2).addLineTo(-w / 2, w / 2).addLineTo(w / 2, -w / 2);
                        var s = new BABYLON.PolygonMeshBuilder(name, p, scene);
                        var t = s.build(true);
                        return t;
                    };
                    MeshEditor.prototype.getRotation = function (a1, a2) {
                        Vector3.CrossToRef(a1, a2, this.pTemp);
                        var a3 = Vector3.Cross(this.pTemp, a1);
                        return Vector3.RotationFromAxis(a3, this.pTemp, a1);
                    };
                    return MeshEditor;
                }());
                component.MeshEditor = MeshEditor;
            })(component = babylonjs.component || (babylonjs.component = {}));
        })(babylonjs = ssatguru.babylonjs || (ssatguru.babylonjs = {}));
    })(ssatguru = org.ssatguru || (org.ssatguru = {}));
})(org || (org = {}));
//# sourceMappingURL=MeshEditor.js.map