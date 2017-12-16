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
                var Mesh = BABYLON.Mesh;
                var StandardMaterial = BABYLON.StandardMaterial;
                var VertexBuffer = BABYLON.VertexBuffer;
                var EditControl = org.ssatguru.babylonjs.component.EditControl;
                var MeshEditor = (function () {
                    function MeshEditor(mesh, camera, canvas, scene) {
                        var _this = this;
                        this.faceId = 0;
                        this.prevPosition = Vector3.Zero();
                        this.delta = Vector3.Zero();
                        this.facePicked = 0;
                        this.faceSelected = false;
                        this.camera = camera;
                        window.addEventListener("keyup", function (e) { return _this.onKeyUp(e); }, false);
                        this.mesh = mesh;
                        this.mesh.markVerticesDataAsUpdatable(VertexBuffer.PositionKind, true);
                        this.vertices = mesh.getVerticesData(VertexBuffer.PositionKind);
                        var vrtNormal = mesh.getVerticesData(VertexBuffer.NormalKind);
                        var vrtUV = mesh.getVerticesData(VertexBuffer.UVKind);
                        this.faceVertices = mesh.getIndices();
                        this.vrtColors = new Array(this.vertices.length * 4 / 3);
                        this.clearColors(this.vrtColors);
                        var r = 0.1;
                        this.faceSelector = Mesh.CreateSphere("", 10, r, scene);
                        this.faceSelector.material = new StandardMaterial("impactMat", scene);
                        this.faceSelector.material.diffuseColor = Color3.Black();
                        this.faceSelector.rotationQuaternion = BABYLON.Quaternion.Zero();
                        this.ec = new EditControl(this.faceSelector, camera, canvas, 0.5, false);
                        this.ec.addActionListener(function (t) {
                            _this.faceSelector.position.subtractToRef(_this.prevPosition, _this.delta);
                            s1.position.addInPlace(_this.delta);
                            s2.position.addInPlace(_this.delta);
                            s3.position.addInPlace(_this.delta);
                            _this.prevPosition.set(_this.faceSelector.position.x, _this.faceSelector.position.y, _this.faceSelector.position.z);
                            _this.updateFacePosition(_this.facePicked, _this.points);
                            _this.mesh.updateVerticesData(VertexBuffer.PositionKind, _this.vertices, false, false);
                        });
                        var s1 = Mesh.CreateSphere("s1", 3, r, scene);
                        this.setMaterial(s1, Color3.Blue(), scene);
                        var s2 = s1.clone("s2");
                        var s3 = s1.clone("s3");
                        this.points = [s1, s2, s3];
                        scene.onPointerDown = function (evt, pickResult) {
                            if (!(evt.button == 2))
                                return;
                            if (pickResult.hit) {
                                _this.ec.enableTranslation();
                                _this.faceSelected = true;
                                _this.faceSelector.position = pickResult.pickedPoint;
                                _this.prevPosition.set(_this.faceSelector.position.x, _this.faceSelector.position.y, _this.faceSelector.position.z);
                                _this.clearColors(_this.vrtColors);
                                _this.facePicked = pickResult.faceId;
                                _this.highLightFace(_this.facePicked, Color3.Gray(), _this.points);
                            }
                        };
                    }
                    MeshEditor.prototype.updateFacePosition = function (faceId, points) {
                        var i = faceId * 3;
                        var v1 = this.faceVertices[i];
                        var v2 = this.faceVertices[i + 1];
                        var v3 = this.faceVertices[i + 2];
                        var v = this.vertices;
                        var vv1 = v1 * 3;
                        var vv2 = v2 * 3;
                        var vv3 = v3 * 3;
                        v[vv1] = points[0].position.x;
                        v[vv1 + 1] = points[0].position.y;
                        v[vv1 + 2] = points[0].position.z;
                        v[vv2] = points[1].position.x;
                        v[vv2 + 1] = points[1].position.y;
                        v[vv2 + 2] = points[1].position.z;
                        v[vv3] = points[2].position.x;
                        v[vv3 + 1] = points[2].position.y;
                        v[vv3 + 2] = points[2].position.z;
                    };
                    ;
                    MeshEditor.prototype.highLightFace = function (faceId, color, points) {
                        var i = faceId * 3;
                        var v1 = this.faceVertices[i];
                        var v2 = this.faceVertices[i + 1];
                        var v3 = this.faceVertices[i + 2];
                        console.log("face vertex index : " + v1 + "," + v2 + "," + v3);
                        var v = this.vertices;
                        var vv1 = v1 * 3;
                        var vv2 = v2 * 3;
                        var vv3 = v3 * 3;
                        var p1 = new Vector3(v[vv1], v[vv1 + 1], v[vv1 + 2]);
                        var p2 = new Vector3(v[vv2], v[vv2 + 1], v[vv2 + 2]);
                        var p3 = new Vector3(v[vv3], v[vv3 + 1], v[vv3 + 2]);
                        points[0].position = p1;
                        points[1].position = p2;
                        points[2].position = p3;
                        var cc1 = v1 * 4;
                        var cc2 = v2 * 4;
                        var cc3 = v3 * 4;
                        this.setColor(cc1, this.vrtColors, color);
                        this.setColor(cc2, this.vrtColors, color);
                        this.setColor(cc3, this.vrtColors, color);
                        this.mesh.setVerticesData(VertexBuffer.ColorKind, this.vrtColors, true);
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
                            this.faceSelected = false;
                            this.ec.disableTranslation();
                        }
                        if (chr === "F") {
                            this.camera.target = this.faceSelector.position;
                        }
                    };
                    return MeshEditor;
                }());
                component.MeshEditor = MeshEditor;
            })(component = babylonjs.component || (babylonjs.component = {}));
        })(babylonjs = ssatguru.babylonjs || (ssatguru.babylonjs = {}));
    })(ssatguru = org.ssatguru || (org.ssatguru = {}));
})(org || (org = {}));
//# sourceMappingURL=MeshEditor.js.map