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
                        this.faceId = 0;
                        this.delta = Vector3.Zero();
                        this.facePicked = 0;
                        this.pTemp = Vector3.Zero();
                        this.camera = camera;
                        window.addEventListener("keyup", function (e) { return _this.onKeyUp(e); }, false);
                        this.mesh = mesh;
                        this.mesh.markVerticesDataAsUpdatable(VertexBuffer.PositionKind, true);
                        this.vertices = mesh.getVerticesData(VertexBuffer.PositionKind);
                        var vrtNormal = mesh.getVerticesData(VertexBuffer.NormalKind);
                        var vrtUV = mesh.getVerticesData(VertexBuffer.UVKind);
                        this.faceVertices = mesh.getIndices();
                        this.faceSelector = this.createTriangle("selector", 1, scene);
                        this.faceSelector.material = new StandardMaterial("impactMat", scene);
                        this.faceSelector.material.diffuseColor = Color3.Black();
                        this.faceSelector.rotationQuaternion = BABYLON.Quaternion.Identity();
                        this.faceSelector.markVerticesDataAsUpdatable(VertexBuffer.PositionKind, true);
                        this.ec = new EditControl(this.faceSelector, camera, canvas, 0.5, false);
                        this.ec.setLocal(true);
                        this.ec.enableTranslation();
                        this.highLightFace(0, this.faceSelector);
                        this.highLightFace(0, this.faceSelector);
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
                        var vv1 = v1 * 3;
                        var vv2 = v2 * 3;
                        var vv3 = v3 * 3;
                        var verts = faceSelector.getVerticesData(VertexBuffer.PositionKind);
                        var matrix = faceSelector.getWorldMatrix();
                        Vector3.TransformCoordinatesFromFloatsToRef(verts[0], verts[1], verts[2], matrix, this.pTemp);
                        v[vv1] = this.pTemp.x;
                        v[vv1 + 1] = this.pTemp.y;
                        v[vv1 + 2] = this.pTemp.z;
                        Vector3.TransformCoordinatesFromFloatsToRef(verts[3], verts[4], verts[5], matrix, this.pTemp);
                        v[vv2] = this.pTemp.x;
                        v[vv2 + 1] = this.pTemp.y;
                        v[vv2 + 2] = this.pTemp.z;
                        Vector3.TransformCoordinatesFromFloatsToRef(verts[6], verts[7], verts[8], matrix, this.pTemp);
                        v[vv3] = this.pTemp.x;
                        v[vv3 + 1] = this.pTemp.y;
                        v[vv3 + 2] = this.pTemp.z;
                    };
                    ;
                    MeshEditor.prototype.highLightFace = function (faceId, faceSelector) {
                        var i = faceId * 3;
                        var v1 = this.faceVertices[i];
                        var v2 = this.faceVertices[i + 1];
                        var v3 = this.faceVertices[i + 2];
                        console.log("face vertex index : " + v1 + "," + v2 + "," + v3);
                        var v = this.vertices;
                        var vv1 = v1 * 3;
                        var vv2 = v2 * 3;
                        var vv3 = v3 * 3;
                        faceSelector.position.x = (v[vv1] + v[vv2] + v[vv3]) / 3;
                        faceSelector.position.y = (v[vv1 + 1] + v[vv2 + 1] + v[vv3 + 1]) / 3;
                        faceSelector.position.z = (v[vv1 + 2] + v[vv2 + 2] + v[vv3 + 2]) / 3;
                        var verts = faceSelector.getVerticesData(VertexBuffer.PositionKind);
                        var matrix = faceSelector.getWorldMatrix().invert();
                        Vector3.TransformCoordinatesFromFloatsToRef(v[vv1], v[vv1 + 1], v[vv1 + 2], matrix, this.pTemp);
                        verts[0] = this.pTemp.x;
                        verts[1] = this.pTemp.y;
                        verts[2] = this.pTemp.z;
                        Vector3.TransformCoordinatesFromFloatsToRef(v[vv2], v[vv2 + 1], v[vv2 + 2], matrix, this.pTemp);
                        verts[3] = this.pTemp.x;
                        verts[4] = this.pTemp.y;
                        verts[5] = this.pTemp.z;
                        Vector3.TransformCoordinatesFromFloatsToRef(v[vv3], v[vv3 + 1], v[vv3 + 2], matrix, this.pTemp);
                        verts[6] = this.pTemp.x;
                        verts[7] = this.pTemp.y;
                        verts[8] = this.pTemp.z;
                        faceSelector.setVerticesData(VertexBuffer.PositionKind, verts, true);
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
                        }
                    };
                    MeshEditor.prototype.createTriangle = function (name, w, scene) {
                        var p = new Path2(w / 2, -w / 2).addLineTo(w / 2, w / 2).addLineTo(-w / 2, w / 2).addLineTo(w / 2, -w / 2);
                        var s = new BABYLON.PolygonMeshBuilder(name, p, scene);
                        var t = s.build(true);
                        return t;
                    };
                    return MeshEditor;
                }());
                component.MeshEditor = MeshEditor;
            })(component = babylonjs.component || (babylonjs.component = {}));
        })(babylonjs = ssatguru.babylonjs || (ssatguru.babylonjs = {}));
    })(ssatguru = org.ssatguru || (org.ssatguru = {}));
})(org || (org = {}));
//# sourceMappingURL=MeshEditor.js.map