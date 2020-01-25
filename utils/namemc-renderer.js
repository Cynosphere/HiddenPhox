const THREE = require("three");
const { createCanvas, Image, Canvas } = require("canvas");
const gl = require("gl")(600, 800);
const PNG = require("pngjs2").PNG;

const TAU = 2 * Math.PI;
const EPSILON = 1e-3;

const skinLayout = [
    {
        head: [
            {
                l: { x: 16, y: 8, w: 8, h: 8 },
                r: { x: 0, y: 8, w: 8, h: 8 },
                u: { x: 8, y: 0, w: 8, h: 8 },
                d: { x: 16, y: 7, w: 8, h: -8 },
                f: { x: 8, y: 8, w: 8, h: 8 },
                b: { x: 24, y: 8, w: 8, h: 8 }
            },
            {
                l: { x: 48, y: 8, w: 8, h: 8 },
                r: { x: 32, y: 8, w: 8, h: 8 },
                u: { x: 40, y: 0, w: 8, h: 8 },
                d: { x: 48, y: 7, w: 8, h: -8 },
                f: { x: 40, y: 8, w: 8, h: 8 },
                b: { x: 56, y: 8, w: 8, h: 8 }
            }
        ],
        torso: [
            {
                l: { x: 28, y: 20, w: 4, h: 12 },
                r: { x: 16, y: 20, w: 4, h: 12 },
                u: { x: 20, y: 16, w: 8, h: 4 },
                d: { x: 28, y: 19, w: 8, h: -4 },
                f: { x: 20, y: 20, w: 8, h: 12 },
                b: { x: 32, y: 20, w: 8, h: 12 }
            }
        ],
        armR: [
            {
                l: { x: 48, y: 20, w: 4, h: 12 },
                r: { x: 40, y: 20, w: 4, h: 12 },
                u: { x: 44, y: 16, w: 4, h: 4 },
                d: { x: 48, y: 19, w: 4, h: -4 },
                f: { x: 44, y: 20, w: 4, h: 12 },
                b: { x: 52, y: 20, w: 4, h: 12 }
            }
        ],
        armRS: [
            {
                l: { x: 47, y: 20, w: 4, h: 12 },
                r: { x: 40, y: 20, w: 4, h: 12 },
                u: { x: 44, y: 16, w: 3, h: 4 },
                d: { x: 47, y: 19, w: 3, h: -4 },
                f: { x: 44, y: 20, w: 3, h: 12 },
                b: { x: 51, y: 20, w: 3, h: 12 }
            }
        ],
        armL: [
            {
                l: { x: 43, y: 20, w: -4, h: 12 },
                r: { x: 51, y: 20, w: -4, h: 12 },
                u: { x: 47, y: 16, w: -4, h: 4 },
                d: { x: 51, y: 19, w: -4, h: -4 },
                f: { x: 47, y: 20, w: -4, h: 12 },
                b: { x: 55, y: 20, w: -4, h: 12 }
            }
        ],
        armLS: [
            {
                l: { x: 43, y: 20, w: -4, h: 12 },
                r: { x: 50, y: 20, w: -4, h: 12 },
                u: { x: 46, y: 16, w: -3, h: 4 },
                d: { x: 49, y: 19, w: -3, h: -4 },
                f: { x: 46, y: 20, w: -3, h: 12 },
                b: { x: 53, y: 20, w: -3, h: 12 }
            }
        ],
        legR: [
            {
                l: { x: 8, y: 20, w: 4, h: 12 },
                r: { x: 0, y: 20, w: 4, h: 12 },
                u: { x: 4, y: 16, w: 4, h: 4 },
                d: { x: 8, y: 19, w: 4, h: -4 },
                f: { x: 4, y: 20, w: 4, h: 12 },
                b: { x: 12, y: 20, w: 4, h: 12 }
            }
        ],
        legL: [
            {
                l: { x: 3, y: 20, w: -4, h: 12 },
                r: { x: 11, y: 20, w: -4, h: 12 },
                u: { x: 7, y: 16, w: -4, h: 4 },
                d: { x: 11, y: 19, w: -4, h: -4 },
                f: { x: 7, y: 20, w: -4, h: 12 },
                b: { x: 15, y: 20, w: -4, h: 12 }
            }
        ]
    },
    {
        head: [
            {
                l: { x: 16, y: 8, w: 8, h: 8 },
                r: { x: 0, y: 8, w: 8, h: 8 },
                u: { x: 8, y: 0, w: 8, h: 8 },
                d: { x: 16, y: 7, w: 8, h: -8 },
                f: { x: 8, y: 8, w: 8, h: 8 },
                b: { x: 24, y: 8, w: 8, h: 8 }
            },
            {
                l: { x: 48, y: 8, w: 8, h: 8 },
                r: { x: 32, y: 8, w: 8, h: 8 },
                u: { x: 40, y: 0, w: 8, h: 8 },
                d: { x: 48, y: 7, w: 8, h: -8 },
                f: { x: 40, y: 8, w: 8, h: 8 },
                b: { x: 56, y: 8, w: 8, h: 8 }
            }
        ],
        torso: [
            {
                l: { x: 28, y: 20, w: 4, h: 12 },
                r: { x: 16, y: 20, w: 4, h: 12 },
                u: { x: 20, y: 16, w: 8, h: 4 },
                d: { x: 28, y: 19, w: 8, h: -4 },
                f: { x: 20, y: 20, w: 8, h: 12 },
                b: { x: 32, y: 20, w: 8, h: 12 }
            },
            {
                l: { x: 28, y: 36, w: 4, h: 12 },
                r: { x: 16, y: 36, w: 4, h: 12 },
                u: { x: 20, y: 32, w: 8, h: 4 },
                d: { x: 28, y: 35, w: 8, h: -4 },
                f: { x: 20, y: 36, w: 8, h: 12 },
                b: { x: 32, y: 36, w: 8, h: 12 }
            }
        ],
        armR: [
            {
                l: { x: 48, y: 20, w: 4, h: 12 },
                r: { x: 40, y: 20, w: 4, h: 12 },
                u: { x: 44, y: 16, w: 4, h: 4 },
                d: { x: 48, y: 19, w: 4, h: -4 },
                f: { x: 44, y: 20, w: 4, h: 12 },
                b: { x: 52, y: 20, w: 4, h: 12 }
            },
            {
                l: { x: 48, y: 36, w: 4, h: 12 },
                r: { x: 40, y: 36, w: 4, h: 12 },
                u: { x: 44, y: 32, w: 4, h: 4 },
                d: { x: 48, y: 35, w: 4, h: -4 },
                f: { x: 44, y: 36, w: 4, h: 12 },
                b: { x: 52, y: 36, w: 4, h: 12 }
            }
        ],
        armRS: [
            {
                l: { x: 47, y: 20, w: 4, h: 12 },
                r: { x: 40, y: 20, w: 4, h: 12 },
                u: { x: 44, y: 16, w: 3, h: 4 },
                d: { x: 47, y: 19, w: 3, h: -4 },
                f: { x: 44, y: 20, w: 3, h: 12 },
                b: { x: 51, y: 20, w: 3, h: 12 }
            },
            {
                l: { x: 47, y: 36, w: 4, h: 12 },
                r: { x: 40, y: 36, w: 4, h: 12 },
                u: { x: 44, y: 32, w: 3, h: 4 },
                d: { x: 47, y: 35, w: 3, h: -4 },
                f: { x: 44, y: 36, w: 3, h: 12 },
                b: { x: 51, y: 36, w: 3, h: 12 }
            }
        ],
        armL: [
            {
                l: { x: 40, y: 52, w: 4, h: 12 },
                r: { x: 32, y: 52, w: 4, h: 12 },
                u: { x: 36, y: 48, w: 4, h: 4 },
                d: { x: 40, y: 51, w: 4, h: -4 },
                f: { x: 36, y: 52, w: 4, h: 12 },
                b: { x: 44, y: 52, w: 4, h: 12 }
            },
            {
                l: { x: 56, y: 52, w: 4, h: 12 },
                r: { x: 48, y: 52, w: 4, h: 12 },
                u: { x: 52, y: 48, w: 4, h: 4 },
                d: { x: 56, y: 51, w: 4, h: -4 },
                f: { x: 52, y: 52, w: 4, h: 12 },
                b: { x: 60, y: 52, w: 4, h: 12 }
            }
        ],
        armLS: [
            {
                l: { x: 39, y: 52, w: 4, h: 12 },
                r: { x: 32, y: 52, w: 4, h: 12 },
                u: { x: 36, y: 48, w: 3, h: 4 },
                d: { x: 39, y: 51, w: 3, h: -4 },
                f: { x: 36, y: 52, w: 3, h: 12 },
                b: { x: 43, y: 52, w: 3, h: 12 }
            },
            {
                l: { x: 55, y: 52, w: 4, h: 12 },
                r: { x: 48, y: 52, w: 4, h: 12 },
                u: { x: 52, y: 48, w: 3, h: 4 },
                d: { x: 55, y: 51, w: 3, h: -4 },
                f: { x: 52, y: 52, w: 3, h: 12 },
                b: { x: 59, y: 52, w: 3, h: 12 }
            }
        ],
        legR: [
            {
                l: { x: 8, y: 20, w: 4, h: 12 },
                r: { x: 0, y: 20, w: 4, h: 12 },
                u: { x: 4, y: 16, w: 4, h: 4 },
                d: { x: 8, y: 19, w: 4, h: -4 },
                f: { x: 4, y: 20, w: 4, h: 12 },
                b: { x: 12, y: 20, w: 4, h: 12 }
            },
            {
                l: { x: 8, y: 36, w: 4, h: 12 },
                r: { x: 0, y: 36, w: 4, h: 12 },
                u: { x: 4, y: 32, w: 4, h: 4 },
                d: { x: 8, y: 35, w: 4, h: -4 },
                f: { x: 4, y: 36, w: 4, h: 12 },
                b: { x: 12, y: 36, w: 4, h: 12 }
            }
        ],
        legL: [
            {
                l: { x: 24, y: 52, w: 4, h: 12 },
                r: { x: 16, y: 52, w: 4, h: 12 },
                u: { x: 20, y: 48, w: 4, h: 4 },
                d: { x: 24, y: 51, w: 4, h: -4 },
                f: { x: 20, y: 52, w: 4, h: 12 },
                b: { x: 28, y: 52, w: 4, h: 12 }
            },
            {
                l: { x: 8, y: 52, w: 4, h: 12 },
                r: { x: 0, y: 52, w: 4, h: 12 },
                u: { x: 4, y: 48, w: 4, h: 4 },
                d: { x: 8, y: 51, w: 4, h: -4 },
                f: { x: 4, y: 52, w: 4, h: 12 },
                b: { x: 12, y: 52, w: 4, h: 12 }
            }
        ]
    }
];

function radians(d) {
    return d * (TAU / 360);
}

function toCanvas(image, x, y, w, h) {
    x = typeof x === "undefined" ? 0 : x;
    y = typeof y === "undefined" ? 0 : y;
    w = typeof w === "undefined" ? image.width : w;
    h = typeof h === "undefined" ? image.height : h;

    let canvas = createCanvas(w, h);
    let ctx = canvas.getContext("2d");
    ctx.drawImage(image, x, y, w, h, 0, 0, w, h);

    return canvas;
}

function makeOpaque(image) {
    let canvas = toCanvas(image);
    let ctx = canvas.getContext("2d");
    let data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let pixels = data.data;

    for (let p = 3; p < pixels.length; p += 4) {
        pixels[p] = 255;
    }

    ctx.putImageData(data, 0, 0);

    return canvas;
}

function hasAlphaLayer(image) {
    let canvas = toCanvas(image);
    let ctx = canvas.getContext("2d");
    let data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let pixels = data.data;

    for (let p = 3; p < pixels.length; p += 4) {
        if (pixels[p] !== 255) {
            return true;
        }
    }

    return false;
}

function colorFaces(geometry, canvas, rectangles) {
    if (!rectangles) return null;
    let pixels = canvas
        .getContext("2d")
        .getImageData(0, 0, canvas.width, canvas.height).data;
    let f = 0;
    let faces = [];
    let materials = [];
    let materialIndexMap = {};
    let side = THREE.FrontSide;
    Object.keys(rectangles).forEach(function(k) {
        let rect = rectangles[k];
        let width = Math.abs(rect.w);
        let height = Math.abs(rect.h);
        let dj = Math.sign(rect.w);
        let di = Math.sign(rect.h);
        for (let y = 0, i = rect.y; y < height; y++, i += di) {
            for (let x = 0, j = rect.x; x < width; x++, j += dj, f += 2) {
                let p = 4 * (i * canvas.width + j);
                let a = pixels[p + 3];

                if (a === 0) {
                    side = THREE.DoubleSide;
                    continue;
                }

                let materialIndex = materialIndexMap[a];

                if (typeof materialIndex === "undefined") {
                    materials.push(
                        new THREE.MeshBasicMaterial({
                            vertexColors: THREE.FaceColors,
                            opacity: a / 255,
                            transparent: a !== 255
                        })
                    );
                    materialIndex = materials.length - 1;
                    materialIndexMap[a] = materialIndex;
                    if (a !== 255) {
                        side = THREE.DoubleSide;
                    }
                }

                let face1 = geometry.faces[f];
                let face2 = geometry.faces[f + 1];
                face1.color.r = pixels[p] / 255;
                face1.color.g = pixels[p + 1] / 255;
                face1.color.b = pixels[p + 2] / 255;
                face2.color = face1.color;
                face1.materialIndex = materialIndex;
                face2.materialIndex = materialIndex;
                faces.push(face1);
                faces.push(face2);
            }
        }
    });

    if (faces.length === 0) return null;

    geometry.faces = faces;

    materials.forEach(function(m) {
        m.side = side;
    });

    return new THREE.Mesh(
        new THREE.BufferGeometry().fromGeometry(geometry),
        materials
    );
}

function buildMinecraftModel(skinImage, capeImage, slim, flip) {
    if (skinImage.width < 64 || skinImage.height < 32) {
        return null;
    }

    let version = skinImage.height >= 64 ? 1 : 0;
    let capeScale = capeImage ? (capeImage.height >= 34 ? 2 : 1) : null;

    let opaqueSkinCanvas = makeOpaque(skinImage);
    let transparentSkinCanvas = toCanvas(skinImage);
    let hasAlpha = hasAlphaLayer(skinImage);

    let headGroup = new THREE.Object3D();
    headGroup.position.x = 0;
    headGroup.position.y = 12;
    headGroup.position.z = 0;
    let box = new THREE.BoxGeometry(8, 8, 8, 8, 8, 8);
    let headMesh = colorFaces(
        box,
        opaqueSkinCanvas,
        skinLayout[version]["head"][0]
    );
    headGroup.add(headMesh);
    if (hasAlpha) {
        box = new THREE.BoxGeometry(9, 9, 9, 8, 8, 8);
        let hatMesh = colorFaces(
            box,
            transparentSkinCanvas,
            skinLayout[version]["head"][1]
        );
        hatMesh && headGroup.add(hatMesh);
    }

    let torsoGroup = new THREE.Object3D();
    torsoGroup.position.x = 0;
    torsoGroup.position.y = 2;
    torsoGroup.position.z = 0;
    box = new THREE.BoxGeometry(
        8 + EPSILON,
        12 + EPSILON,
        4 + EPSILON,
        8,
        12,
        4
    );
    let torsoMesh = colorFaces(
        box,
        opaqueSkinCanvas,
        skinLayout[version]["torso"][0]
    );
    torsoGroup.add(torsoMesh);
    if (version >= 1 && hasAlpha) {
        box = new THREE.BoxGeometry(
            8.5 + EPSILON,
            12.5 + EPSILON,
            4.5 + EPSILON,
            8,
            12,
            4
        );
        let jacketMesh = colorFaces(
            box,
            transparentSkinCanvas,
            skinLayout[version]["torso"][1]
        );
        jacketMesh && torsoGroup.add(jacketMesh);
    }

    let rightArmGroup = new THREE.Object3D();
    rightArmGroup.position.x = slim ? -5.5 : -6;
    rightArmGroup.position.y = 6;
    rightArmGroup.position.z = 0;
    let rightArmMesh;
    if (slim) {
        box = new THREE.BoxGeometry(3, 12, 4, 3, 12, 4).translate(0, -4, 0);
        rightArmMesh = colorFaces(
            box,
            opaqueSkinCanvas,
            skinLayout[version]["armRS"][0]
        );
    } else {
        box = new THREE.BoxGeometry(4, 12, 4, 4, 12, 4).translate(0, -4, 0);
        rightArmMesh = colorFaces(
            box,
            opaqueSkinCanvas,
            skinLayout[version]["armR"][0]
        );
    }
    rightArmGroup.add(rightArmMesh);
    if (version >= 1 && hasAlpha) {
        let rightSleeveMesh;
        if (slim) {
            box = new THREE.BoxGeometry(
                3.5 + EPSILON * 4,
                12.5 + EPSILON * 4,
                4.5 + EPSILON * 4,
                3,
                12,
                4
            ).translate(0, -4, 0);
            rightSleeveMesh = colorFaces(
                box,
                transparentSkinCanvas,
                skinLayout[version]["armRS"][1]
            );
        } else {
            box = new THREE.BoxGeometry(
                4.5 + EPSILON * 4,
                12.5 + EPSILON * 4,
                4.5 + EPSILON * 4,
                4,
                12,
                4
            ).translate(0, -4, 0);
            rightSleeveMesh = colorFaces(
                box,
                transparentSkinCanvas,
                skinLayout[version]["armR"][1]
            );
        }
        rightSleeveMesh && rightArmGroup.add(rightSleeveMesh);
    }

    let leftArmGroup = new THREE.Object3D();
    leftArmGroup.position.x = slim ? 5.5 : 6;
    leftArmGroup.position.y = 6;
    leftArmGroup.position.z = 0;
    let leftArmMesh;
    if (slim) {
        box = new THREE.BoxGeometry(3, 12, 4, 3, 12, 4).translate(0, -4, 0);
        leftArmMesh = colorFaces(
            box,
            opaqueSkinCanvas,
            skinLayout[version]["armLS"][0]
        );
    } else {
        box = new THREE.BoxGeometry(4, 12, 4, 4, 12, 4).translate(0, -4, 0);
        leftArmMesh = colorFaces(
            box,
            opaqueSkinCanvas,
            skinLayout[version]["armL"][0]
        );
    }
    leftArmGroup.add(leftArmMesh);
    if (version >= 1 && hasAlpha) {
        let leftSleeveMesh;
        if (slim) {
            box = new THREE.BoxGeometry(
                3.5 + EPSILON * 4,
                12.5 + EPSILON * 4,
                4.5 + EPSILON * 4,
                3,
                12,
                4
            ).translate(0, -4, 0);
            leftSleeveMesh = colorFaces(
                box,
                transparentSkinCanvas,
                skinLayout[version]["armLS"][1]
            );
        } else {
            box = new THREE.BoxGeometry(
                4.5 + EPSILON * 4,
                12.5 + EPSILON * 4,
                4.5 + EPSILON * 4,
                4,
                12,
                4
            ).translate(0, -4, 0);
            leftSleeveMesh = colorFaces(
                box,
                transparentSkinCanvas,
                skinLayout[version]["armL"][1]
            );
        }
        leftSleeveMesh && leftArmGroup.add(leftSleeveMesh);
    }

    let rightLegGroup = new THREE.Object3D();
    rightLegGroup.position.x = -2;
    rightLegGroup.position.y = -4;
    rightLegGroup.position.z = 0;
    box = new THREE.BoxGeometry(4, 12, 4, 4, 12, 4).translate(0, -6, 0);
    let rightLegMesh = colorFaces(
        box,
        opaqueSkinCanvas,
        skinLayout[version]["legR"][0]
    );
    rightLegGroup.add(rightLegMesh);
    if (version >= 1 && hasAlpha) {
        box = new THREE.BoxGeometry(
            4.5 + EPSILON * 2,
            12.5 + EPSILON * 2,
            4.5 + EPSILON * 2,
            4,
            12,
            4
        ).translate(0, -6, 0);
        let rightPantMesh = colorFaces(
            box,
            transparentSkinCanvas,
            skinLayout[version]["legR"][1]
        );
        rightPantMesh && rightLegGroup.add(rightPantMesh);
    }

    let leftLegGroup = new THREE.Object3D();
    leftLegGroup.position.x = 2;
    leftLegGroup.position.y = -4;
    leftLegGroup.position.z = 0;
    box = new THREE.BoxGeometry(4, 12, 4, 4, 12, 4).translate(0, -6, 0);
    let leftLegMesh = colorFaces(
        box,
        opaqueSkinCanvas,
        skinLayout[version]["legL"][0]
    );
    leftLegGroup.add(leftLegMesh);
    if (version >= 1 && hasAlpha) {
        box = new THREE.BoxGeometry(
            4.5 + EPSILON * 3,
            12.5 + EPSILON * 3,
            4.5 + EPSILON * 3,
            4,
            12,
            4
        ).translate(0, -6, 0);
        let leftPantMesh = colorFaces(
            box,
            transparentSkinCanvas,
            skinLayout[version]["legL"][1]
        );
        leftPantMesh && leftLegGroup.add(leftPantMesh);
    }

    let playerGroup = new THREE.Object3D();
    playerGroup.add(headGroup);
    playerGroup.add(torsoGroup);
    playerGroup.add(rightArmGroup);
    playerGroup.add(leftArmGroup);
    playerGroup.add(rightLegGroup);
    playerGroup.add(leftLegGroup);

    if (capeImage) {
        let capeCanvas = makeOpaque(capeImage);

        let capeGroup = new THREE.Object3D();
        capeGroup.position.x = 0;
        capeGroup.position.y = 8;
        capeGroup.position.z = -2;
        capeGroup.rotation.y += radians(180);
        let capeMesh;
        if (capeScale === 2) {
            box = new THREE.BoxGeometry(10, 16, 1, 20, 32, 2).translate(
                0,
                -8,
                0.5
            );
            capeMesh = colorFaces(box, capeCanvas, {
                left: { x: 22, y: 2, w: 2, h: 32 },
                right: { x: 0, y: 2, w: 2, h: 32 },
                top: { x: 2, y: 0, w: 20, h: 2 },
                bottom: { x: 22, y: 1, w: 20, h: -2 },
                front: { x: 2, y: 2, w: 20, h: 32 },
                back: { x: 24, y: 2, w: 20, h: 32 }
            });
        } else {
            box = new THREE.BoxGeometry(10, 16, 1, 10, 16, 1).translate(
                0,
                -8,
                0.5
            );
            capeMesh = colorFaces(box, capeCanvas, {
                left: { x: 11, y: 1, w: 1, h: 16 },
                right: { x: 0, y: 1, w: 1, h: 16 },
                top: { x: 1, y: 0, w: 10, h: 1 },
                bottom: { x: 11, y: 0, w: 10, h: -1 },
                front: { x: 1, y: 1, w: 10, h: 16 },
                back: { x: 12, y: 1, w: 10, h: 16 }
            });
        }
        capeGroup.add(capeMesh);
        playerGroup.add(capeGroup);
    }

    if (flip) {
        playerGroup.rotation.z += radians(180);
    }

    return playerGroup;
}

let renderState;

function render(callback) {
    let time = 90;

    let angle = Math.sin(radians(time));
    renderState.model.children[2].rotation.x = -radians(18) * angle;
    renderState.model.children[3].rotation.x = radians(18) * angle;
    renderState.model.children[4].rotation.x = radians(20) * angle;
    renderState.model.children[5].rotation.x = -radians(20) * angle;
    if (renderState.model.children[6]) {
        let capeAngle = Math.sin(radians(renderState.frame));
        renderState.model.children[6].rotation.x =
            radians(18) - radians(6) * capeAngle;
    }
    renderState.renderer.render(renderState.scene, renderState.camera);
    if (renderState.canvas !== renderState.renderer.domElement) {
        renderState.canvas
            .getContext("2d")
            .drawImage(renderState.renderer.domElement, 0, 0);
    }

    callback(null, renderState.renderer.getContext());
}

let renderer;

function renderSkinHelper(canvas, animate, theta, phi, time, model, callback) {
    if (renderState) {
        renderState.theta = theta;
        renderState.phi = phi;
        renderState.time = time;
        renderState.canvas = canvas;
        renderState.scene.remove(renderState.model);
        renderState.model = model;

        let origin = new THREE.Vector3(0, 0, 0);

        function positionCamera(camera, theta, phi) {
            let cosPhi = Math.cos(phi);
            camera.position.x = 72 * cosPhi * Math.sin(theta);
            camera.position.z = 72 * cosPhi * Math.cos(theta);
            camera.position.y = 72 * Math.sin(phi);
            camera.lookAt(origin);
        }

        renderState.scene.add(model);

        positionCamera(
            renderState.camera,
            radians(renderState.theta),
            radians(renderState.phi)
        );

        render(callback);
        return;
    }

    if (!renderer) {
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            canvas: canvas,
            context: gl
        });
    }

    renderState = {
        canvas: canvas,
        animate: animate,
        model: model,
        theta: theta,
        phi: phi,
        scene: new THREE.Scene(),
        camera: new THREE.PerspectiveCamera(
            32,
            canvas.width / canvas.height,
            72 - 20,
            72 + 20
        ),
        //camera: new THREE.OrthographicCamera(-19 * canvas.width / canvas.height, 19 * canvas.width / canvas.height, 19, -19, 1, 100),
        renderer: renderer,
        dragState: {},
        frame: time / 4
    };

    let origin = new THREE.Vector3(0, 0, 0);

    function positionCamera(camera, theta, phi) {
        let cosPhi = Math.cos(phi);
        camera.position.x = 72 * cosPhi * Math.sin(theta);
        camera.position.z = 72 * cosPhi * Math.cos(theta);
        camera.position.y = 72 * Math.sin(phi);
        camera.lookAt(origin);
    }

    renderState.scene.add(model);

    positionCamera(
        renderState.camera,
        radians(renderState.theta),
        radians(renderState.phi)
    );

    render(callback);
}

let modelCache = {};

function renderSkin(
    canvas,
    slim,
    flip,
    animate,
    theta,
    phi,
    time,
    skin,
    cape,
    callback
) {
    let hash = [cape, skin, slim, flip].join(":");

    function handleModel() {
        try {
            renderSkinHelper(
                canvas,
                animate,
                theta,
                phi,
                time,
                modelCache[hash],
                callback
            );
        } catch (e) {
            callback(e);
        }
    }

    if (modelCache[hash]) {
        handleModel();
    } else {
        function handleImages(skinImage, capeImage) {
            let model = buildMinecraftModel(skinImage, capeImage, slim, flip);
            if (model) {
                modelCache[hash] = model;
                handleModel();
            } else {
                callback();
            }
        }

        let skinImage = new Image();
        skinImage.crossOrigin = "";
        skinImage.src = skin;
        skinImage.onload = function() {
            if (cape) {
                let capeImage = new Image();
                capeImage.crossOrigin = "";
                capeImage.src = cape;
                capeImage.onload = function() {
                    handleImages(skinImage, capeImage);
                };
                capeImage.onerror = function() {
                    handleImages(skinImage, null);
                };
            } else {
                handleImages(skinImage, null);
            }
        };
        skinImage.onerror = function(e) {
            console.error(e);
        };
    }
}

const noop = () => {};

global.addEventListener = noop;
global.HTMLImageElement = noop;
global.HTMLCanvasElement = noop;

class _Canvas extends Canvas {
    constructor(w, h, type) {
        super(w, h, type);
        this.style = {};
    }

    addEventListener() {
        //noop
    }
}

async function drawSkin3D(
    slim = false,
    skin,
    cape,
    flip = false,
    animate = false,
    theta = -30,
    phi = 20,
    time = 90
) {
    let glCtx = await new Promise((resolve, reject) => {
        renderSkin(
            new _Canvas(600, 800),
            slim,
            flip,
            animate,
            theta,
            phi,
            time,
            skin,
            cape,
            function(e, c) {
                if (e) {
                    reject(e);
                } else {
                    resolve(c);
                }
            }
        );
    });
    if (!glCtx) return;
    let w = 600;
    let h = 800;

    let png = new PNG({ width: w, height: h });
    let pixels = new Uint8Array(4 * w * h);
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            let i = y * w + x;
            let r = pixels[4 * i];
            let g = pixels[4 * i + 1];
            let b = pixels[4 * i + 2];
            let a = pixels[4 * i + 3];

            let j = (h - y + 1) * w + x;
            png.data[4 * j] = r;
            png.data[4 * j + 1] = g;
            png.data[4 * j + 2] = b;
            png.data[4 * j + 3] = a;
        }
    }

    const stream = png.pack();
    const tmp = [];
    let img = await new Promise((resolve, reject) => {
        stream.on("data", function(d) {
            tmp.push(d);
        });
        stream.on("end", function() {
            resolve(Buffer.concat(tmp));
        });
    });

    return img;
}

module.exports = { drawSkin3D };
