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
                var Path2 = BABYLON.Path2;
                var VertexBuffer = BABYLON.VertexBuffer;
                var EditControl = org.ssatguru.babylonjs.component.EditControl;
                var MeshEditor = (function () {
                    function MeshEditor(mesh, camera, canvas, scene) {
                        var _this = this;
                        this.facePicked = 0;
                        this.ec = null;
                        this.mode = "F";
                        this.v1v = new Vector3(0, 0, 0);
                        this.v2v = new Vector3(0, 0, 0);
                        this.v3v = new Vector3(0, 0, 0);
                        this.pTemp = Vector3.Zero();
                        this.mesh = mesh;
                        this.camera = camera;
                        this.canvas = canvas;
                        this.scene = scene;
                        window.addEventListener("keyup", function (e) { return _this.onKeyUp(e); }, false);
                        this.mesh.markVerticesDataAsUpdatable(VertexBuffer.PositionKind, true);
                        this.vertices = mesh.getVerticesData(VertexBuffer.PositionKind);
                        this.faceVertices = mesh.getIndices();
                        this.faceSelector = this.createFaceSelector(scene);
                        this.edgeSelector = this.createEdgeSelector(scene);
                        this.pointSelector = new Mesh("pointSelector", scene);
                        this.ec = null;
                        scene.onPointerDown = function (evt, pickResult) {
                            if (!(evt.button == 2))
                                return;
                            if (pickResult.hit) {
                                console.log(pickResult.pickedMesh);
                                if (pickResult.pickedMesh != _this.mesh)
                                    return;
                                _this.facePicked = pickResult.faceId;
                                var selector = null;
                                if (_this.mode == "F") {
                                    selector = _this.faceSelector;
                                    _this.highLightFace(_this.facePicked, selector);
                                }
                                else if (_this.mode == "E") {
                                    selector = _this.edgeSelector;
                                    _this.highLightEdge(_this.facePicked, pickResult.pickedPoint, selector);
                                }
                                else if (_this.mode == "P") {
                                    selector = _this.pointSelector;
                                    _this.highLightPoint(_this.facePicked, pickResult.pickedPoint, selector);
                                }
                                if (selector != null) {
                                    selector.visibility = 1;
                                    if (_this.ec == null) {
                                        console.log("creating ec");
                                        _this.ec = _this.createEditControl(selector, _this.camera, _this.canvas);
                                    }
                                    else {
                                        if (_this.ec.isHidden())
                                            _this.ec.show();
                                        _this.ec.switchTo(selector, true);
                                    }
                                }
                            }
                        };
                    }
                    MeshEditor.prototype.enablePoint = function () {
                        if (this.mode == "P")
                            return;
                        this.mode = "P";
                        this.faceSelector.visibility = 0;
                        this.edgeSelector.visibility = 0;
                        this.ec.hide();
                    };
                    MeshEditor.prototype.enableEdge = function () {
                        if (this.mode == "E")
                            return;
                        this.mode = "E";
                        this.faceSelector.visibility = 0;
                        this.pointSelector.visibility = 0;
                        this.ec.hide();
                    };
                    MeshEditor.prototype.enableFace = function () {
                        if (this.mode == "F")
                            return;
                        this.mode = "F";
                        this.edgeSelector.visibility = 0;
                        this.pointSelector.visibility = 0;
                        this.ec.hide();
                    };
                    MeshEditor.prototype.createEditControl = function (mesh, camera, canvas) {
                        var _this = this;
                        var ec = new EditControl(mesh, camera, canvas, 0.5, true);
                        ec.setLocal(true);
                        ec.enableTranslation();
                        ec.addActionListener(function (t) {
                            if (_this.mode == "F") {
                                _this.updateFacePosition(_this.facePicked, _this.faceSelector);
                            }
                            else if (_this.mode == "E") {
                                _this.updateEdgePosition(_this.facePicked, _this.edgeSelector);
                            }
                            else if (_this.mode == "P") {
                                _this.updatePointPosition(_this.facePicked, _this.pointSelector);
                            }
                            _this.mesh.updateVerticesData(VertexBuffer.PositionKind, _this.vertices, false, false);
                        });
                        return ec;
                    };
                    MeshEditor.prototype.createFaceSelector_old = function (scene) {
                        var fs = this.createTriangle("selector", 1, scene);
                        fs.material = new StandardMaterial("impactMat", scene);
                        fs.material.diffuseColor = Color3.Gray();
                        fs.visibility = 0.8;
                        fs.markVerticesDataAsUpdatable(VertexBuffer.PositionKind, true);
                        fs.renderingGroupId = 1;
                        return fs;
                    };
                    MeshEditor.prototype.createFaceSelector = function (scene) {
                        var fs = Mesh.CreateLines("edgeSelector", [new Vector3(-1, 0, 0), new Vector3(1, 0, 0), new Vector3(0, 0, 1), new Vector3(-1, 0, 0)], scene);
                        fs.color = Color3.Black();
                        fs.visibility = 0;
                        fs.markVerticesDataAsUpdatable(VertexBuffer.PositionKind, true);
                        fs.renderingGroupId = 1;
                        return fs;
                    };
                    MeshEditor.prototype.createEdgeSelector = function (scene) {
                        var es = Mesh.CreateLines("edgeSelector", [new Vector3(-1, 0, 0), new Vector3(1, 0, 0)], scene);
                        es.color = Color3.Black();
                        es.isPickable = false;
                        es.renderingGroupId = 1;
                        es.visibility = 0;
                        es.markVerticesDataAsUpdatable(VertexBuffer.PositionKind, true);
                        return es;
                    };
                    MeshEditor.prototype.highLightFace = function (faceId, faceSelector) {
                        console.log("highLightFace");
                        this.getFaceVertices(faceId, this.mesh, this.faceVertices);
                        var a1 = this.v1v.subtract(this.v2v);
                        var a2 = this.v3v.subtract(this.v2v);
                        faceSelector.rotation = this.getRotation(a1, a2);
                        faceSelector.position.x = (this.v1v.x + this.v2v.x + this.v3v.x) / 3;
                        faceSelector.position.y = (this.v1v.y + this.v2v.y + this.v3v.y) / 3;
                        faceSelector.position.z = (this.v1v.z + this.v2v.z + this.v3v.z) / 3;
                        var verts = faceSelector.getVerticesData(VertexBuffer.PositionKind);
                        console.log(verts.length);
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
                        verts[9] = verts[0];
                        verts[10] = verts[1];
                        verts[11] = verts[2];
                        faceSelector.setVerticesData(VertexBuffer.PositionKind, verts, true);
                    };
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
                    MeshEditor.prototype.highLightEdge = function (faceId, pickPoint, edgeSelector) {
                        console.log("highLightEdge");
                        this.getFaceVertices(faceId, this.mesh, this.faceVertices);
                        var ev1;
                        var ev2;
                        var ev3;
                        var h1 = this.getDistance(pickPoint, this.v1v, this.v2v);
                        var h2 = this.getDistance(pickPoint, this.v2v, this.v3v);
                        var h3 = this.getDistance(pickPoint, this.v3v, this.v1v);
                        var min_h = Math.min(h1, h2, h3);
                        if (min_h == h1) {
                            ev1 = this.v1v;
                            ev2 = this.v2v;
                            ev3 = this.v3v;
                            this.ep1 = 1;
                            this.ep2 = 2;
                        }
                        if (min_h == h2) {
                            ev1 = this.v2v;
                            ev2 = this.v3v;
                            ev3 = this.v1v;
                            this.ep1 = 2;
                            this.ep2 = 3;
                        }
                        if (min_h == h3) {
                            ev1 = this.v3v;
                            ev2 = this.v1v;
                            ev3 = this.v2v;
                            this.ep1 = 3;
                            this.ep2 = 1;
                        }
                        var a1 = ev1.subtract(ev2);
                        var a2 = ev3.subtract(ev2);
                        edgeSelector.rotation = this.getRotation(a1, a2);
                        edgeSelector.position.x = (ev1.x + ev2.x) / 2;
                        edgeSelector.position.y = (ev1.y + ev2.y) / 2;
                        edgeSelector.position.z = (ev1.z + ev2.z) / 2;
                        var verts = edgeSelector.getVerticesData(VertexBuffer.PositionKind);
                        var sm_i = edgeSelector.getWorldMatrix().clone().invert();
                        Vector3.TransformCoordinatesToRef(ev1, sm_i, this.pTemp);
                        verts[0] = this.pTemp.x;
                        verts[1] = this.pTemp.y;
                        verts[2] = this.pTemp.z;
                        Vector3.TransformCoordinatesToRef(ev2, sm_i, this.pTemp);
                        verts[3] = this.pTemp.x;
                        verts[4] = this.pTemp.y;
                        verts[5] = this.pTemp.z;
                        edgeSelector.setVerticesData(VertexBuffer.PositionKind, verts, true);
                        this.ec.switchTo(edgeSelector, true);
                    };
                    MeshEditor.prototype.updateEdgePosition = function (faceId, edgeSelector) {
                        var i = faceId * 3;
                        var v1 = this.faceVertices[i + this.ep1 - 1];
                        var v2 = this.faceVertices[i + this.ep2 - 1];
                        var v = this.vertices;
                        var v1s = v1 * 3;
                        var v2s = v2 * 3;
                        var verts = edgeSelector.getVerticesData(VertexBuffer.PositionKind);
                        var sm = edgeSelector.getWorldMatrix();
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
                    };
                    ;
                    MeshEditor.prototype.highLightPoint = function (faceId, pickPoint, pointSelector) {
                        this.getFaceVertices(faceId, this.mesh, this.faceVertices);
                        var p1;
                        var p2;
                        var p3;
                        var l1 = pickPoint.subtract(this.v1v).length();
                        var l2 = pickPoint.subtract(this.v2v).length();
                        var l3 = pickPoint.subtract(this.v3v).length();
                        var min_l = Math.min(l1, l2, l3);
                        if (min_l == l1) {
                            this.p = 1;
                            p1 = this.v1v;
                            p2 = this.v3v;
                            p3 = this.v2v;
                        }
                        if (min_l == l2) {
                            this.p = 2;
                            p1 = this.v2v;
                            p2 = this.v1v;
                            p3 = this.v3v;
                        }
                        if (min_l == l3) {
                            this.p = 3;
                            p1 = this.v3v;
                            p2 = this.v2v;
                            p3 = this.v1v;
                        }
                        var a1 = p2.subtract(p1);
                        var a2 = p3.subtract(p1);
                        pointSelector.rotation = this.getRotation(a1, a2);
                        pointSelector.position = p1;
                        this.ec.switchTo(pointSelector, true);
                    };
                    MeshEditor.prototype.updatePointPosition = function (faceId, pointSelector) {
                        var i = faceId * 3;
                        var v1 = this.faceVertices[i + this.p - 1];
                        var v = this.vertices;
                        var v1s = v1 * 3;
                        var mm_i = this.mesh.getWorldMatrix().clone().invert();
                        Vector3.TransformCoordinatesToRef(pointSelector.position, mm_i, this.pTemp);
                        v[v1s] = this.pTemp.x;
                        v[v1s + 1] = this.pTemp.y;
                        v[v1s + 2] = this.pTemp.z;
                    };
                    ;
                    MeshEditor.prototype.getFaceVertices = function (faceId, mesh, faceVertices) {
                        var i = faceId * 3;
                        var v1 = faceVertices[i];
                        var v2 = faceVertices[i + 1];
                        var v3 = faceVertices[i + 2];
                        var mm = mesh.getWorldMatrix();
                        var v = this.vertices;
                        var v1s = v1 * 3;
                        var v2s = v2 * 3;
                        var v3s = v3 * 3;
                        Vector3.TransformCoordinatesFromFloatsToRef(v[v1s], v[v1s + 1], v[v1s + 2], mm, this.v1v);
                        Vector3.TransformCoordinatesFromFloatsToRef(v[v2s], v[v2s + 1], v[v2s + 2], mm, this.v2v);
                        Vector3.TransformCoordinatesFromFloatsToRef(v[v3s], v[v3s + 1], v[v3s + 2], mm, this.v3v);
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
                        if (chr === "Z") {
                            this.camera.target = this.ec.getPosition();
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
                        if (chr == "F") {
                            this.enableFace();
                        }
                        if (chr == "E") {
                            this.enableEdge();
                        }
                        if (chr == "P") {
                            this.enablePoint();
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
                    MeshEditor.prototype.getDistance = function (p1, p2, p3) {
                        var v1 = p1.subtract(p2);
                        var v2 = p3.subtract(p2);
                        var angle = Math.acos((Vector3.Dot(v1, v2.normalize()) / v1.length()));
                        return v1.length() * Math.sin(angle);
                    };
                    return MeshEditor;
                }());
                component.MeshEditor = MeshEditor;
            })(component = babylonjs.component || (babylonjs.component = {}));
        })(babylonjs = ssatguru.babylonjs || (ssatguru.babylonjs = {}));
    })(ssatguru = org.ssatguru || (org.ssatguru = {}));
})(org || (org = {}));
//# sourceMappingURL=MeshEditor.js.map