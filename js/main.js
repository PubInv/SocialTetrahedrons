// Copyright (C) 2019 by
//   Robert L. Read <read.robert@gmail.com>

// This program is free software: you can redistribute it and/or modify
//   it under the terms of the GNU Affero General Public License as
//   published by the Free Software Foundation, either version 3 of the
//   License, or (at your option) any later version.

//   This program is distributed in the hope that it will be useful,
//   but WITHOUT ANY WARRANTY; without even the implied warranty of
//   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//   GNU Affero General Public License for more details.

//   You should have received a copy of the GNU Affero General Public License
//   along with this program.  If not, see <https://www.gnu.org/licenses/>.


// STATUS: This was hacked from the 2018 Mathathon. A lot of this code
// is unnecessary for what we are trying to do here, which is to render
// a social tetrahedron and allow you to place objects in it. However,
// the act of cutting it away will take some time. I'm trying to see
// how much I can get done in 6 hours.

var tm = UGLY_GLOBAL_SINCE_I_CANT_GET_MY_MODULE_INTO_THE_BROWSER;
var OPERATION = "normal"; // "normal" or "helices"

const CHIRALITY_CCW = 1;
const CHIRALITY_CW = 0;
var TET_DISTANCE = 0.5;

const MAX_PARAMETRIC_STEPS = 1000;
const PARAMETRIC_BISECTION_LIMIT = 50;

const DIMENSIONS = ["Mind","Body","Spirit","Abundance"];

var DATA_OBJECTS = [];
var CURRENT_DATA_OBJECT = -1;

// Detects webgl
if (!Detector.webgl) {
    Detector.addGetWebGLMessage();
    document.getElementById('threecontainer').innerHTML = "";
}

function addShadowedLight(scene, x, y, z, color, intensity) {
    var directionalLight = new THREE.DirectionalLight(color, intensity);
    directionalLight.position.set(x, y, z);
    scene.add(directionalLight);
    directionalLight.castShadow = true;
    var d = 1;
    directionalLight.shadow.camera.left = -d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = -d;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 4;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.bias = -0.005;
}
function createParalellepiped(sx, sy, sz, pos, quat, material) {
    var pp = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz, 1, 1, 1), material);
    pp.castShadow = false;;
    pp.receiveShadow = true;
    pp.position.set(pos.x, pos.y, pos.z);
    return pp;

}
// Not sure how to use the quaternion here,
function createSphere(r, pos, color) {
    //    var cmat = memo_color_mat(tcolor);
    var tcolor = new THREE.Color(color);
    var cmat = new THREE.MeshPhongMaterial({ color: tcolor });
    var ball = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 16), cmat);
    ball.position.set(pos.x, pos.y, pos.z);
    ball.castShadow = false;;
    ball.receiveShadow = true;

    return ball;
}

function get_member_color(gui, len) {
    if (len < am.MIN_EDGE_LENGTH)
        return d3.color("black");
    else if (len > am.MAX_EDGE_LENGTH)
        return d3.color("black");
    else {
        var p = (len - am.MIN_EDGE_LENGTH) / (am.MAX_EDGE_LENGTH - am.MIN_EDGE_LENGTH);
        return d3.rgb(gui.color_scale(len));
    }
}

function create_actuator(b_a, b_z, pos, cmat) {
    var len = b_z.distanceTo(b_a) + -am.JOINT_RADIUS;
    var quat = new THREE.Quaternion();

    var pos = new THREE.Vector3(b_z.x, b_z.y, b_z.z);
    pos.add(b_a);
    pos.divideScalar(2);
    
    var mesh = createParalellepiped(
        am.INITIAL_EDGE_WIDTH,
        am.INITIAL_EDGE_WIDTH,
        len,
        pos,
        quat,
        cmat);

    mesh.lookAt(b_z);

    mesh.castShadow = false;;
    mesh.receiveShadow = true;
    am.scene.add(mesh);
    mesh.structureKind = "member";
    mesh.name = b_a.name + " " + b_z.name;
    return mesh;
}

function memo_color_mat(tcolor) {
    var string = tcolor.getHexString();
    if (!(string in am.color_material_palette)) {
        var cmat = new THREE.MeshPhongMaterial({ color: tcolor });
        am.color_material_palette[string] = cmat;
    }
    return am.color_material_palette[string]
}
function alphabetic_name(n) {
    if (n < 26) {
        return String.fromCharCode(65 + n);
    } else {
        if (n < 26 * 26) {
            return alphabetic_name(Math.floor(n / 26)) + alphabetic_name(n % 26);
        } else {
            return "" + n;
        }
    }
}

var scolors = [d3.color("DarkRed"), d3.color("DarkOrange"), d3.color("Indigo")];
var smats = [new THREE.Color(0x8B0000),
new THREE.Color(0xFF8C00),
new THREE.Color(0x000082)];

function create_vertex_mesh(pos, c) {
        var mesh = createSphere(am.JOINT_RADIUS/2, pos, c.hex());
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        am.scene.add(mesh);
}

function draw_big_tet() {
    const colors = [d3.color("DarkRed"), d3.color("DarkOrange"), d3.color("Blue")];
    const three_colors = [0xff0000,
                          0xffff00,
                          0x00ff00,
                          0x0000ff];    
    const l = 2;

    var v = [new THREE.Vector3( Math.sqrt(8/9),-1/3,0),
             new THREE.Vector3(-Math.sqrt(2/9),-1/3,Math.sqrt(2/3)),
             new THREE.Vector3(-Math.sqrt(2/9),-1/3,-Math.sqrt(2/3)),
             new THREE.Vector3(0,1,0)];
    v[0].y += 1/3;
    v[1].y += 1/3;
    v[2].y += 1/3;
    v[3].y += 1/3;    
    v.forEach(x => { x.x *= l; x.y *= l; x.z *= l; });
    v.forEach(x => create_vertex_mesh(x,d3.color("DarkRed")));

    for (var i in DIMENSIONS) {
        var label = makeTextSprite(DIMENSIONS[i],{fontsize: 60 },"red");
        label.position.set(v[i].x,v[i].y,v[i].z);
        am.grid_scene.add(label);

       var bulbGeometry = new THREE.SphereBufferGeometry( 0.02, 16, 8 );
        const col_num = three_colors[i];
        bulbLight = new THREE.PointLight( col_num, 1, 100, 0.01 );
        bulbMat = new THREE.MeshStandardMaterial( {
            emissive: 0xffffee,
            emissiveIntensity: 1,
            color: col_num
        } );
        bulbLight.add( new THREE.Mesh( bulbGeometry, bulbMat ) );
        bulbLight.position.set(v[i].x,v[i].y+1,v[i].z);
        bulbLight.castShadow = true;
        am.scene.add( bulbLight );
     
    }


    var tcolor = new THREE.Color(0xFF8C00);
    create_actuator(v[0], v[1], null, memo_color_mat(tcolor));
    create_actuator(v[1], v[2], null, memo_color_mat(tcolor));
    create_actuator(v[2], v[0], null, memo_color_mat(tcolor));
    
    create_actuator(v[0], v[3], null, memo_color_mat(tcolor));
    create_actuator(v[1], v[3], null, memo_color_mat(tcolor));
    create_actuator(v[2], v[3], null, memo_color_mat(tcolor));

    // now we will draw in the Maslow's Pyramid....
    for(let i = 0; i < 2; i++) {
        const f = (i+1)/3;
        // I despise the non-functionl nature of THREE.js...
        const a = new THREE.Vector3(v[0].x,v[0].y,v[0].z);
        const b = new THREE.Vector3(v[1].x,v[1].y,v[1].z);
        const c = new THREE.Vector3(v[2].x,v[2].y,v[2].z);        
        a.lerp(v[3],f);
        b.lerp(v[3],f);
        c.lerp(v[3],f);
        create_actuator(a, b, null, memo_color_mat(tcolor));
        create_actuator(b, c, null, memo_color_mat(tcolor));
        create_actuator(c, a, null, memo_color_mat(tcolor));
    }
    

    
    
}
function add_vertex(am, d, i, params) {
    var colors = [d3.color("DarkRed"), d3.color("DarkOrange"), d3.color("Blue")];
    var darkgreen = d3.color("#008000");
    var dcolor = [null, darkgreen, d3.color("purple")];

    var vertices = params.vertices;
    var indices = params.indices;
    var prev = params.prev;
    var helix = params.helix;
    var v;
    var c;
    var th;
    if (i < 3) return;
    if (i == 3) {
        var base = get_base(params.init_pos, params.l);
        params.vertices = vertices = base.v.slice(0);
        th = [0, 1, 2, 3];
        indices.push(th, th, th, th); //First 3 are dummy copies to align indices and vertices
        v = base.v[i];

        if (params.wireframe == true) {
            create_vertex_mesh(base.v[0], base.vc[0]);
            create_vertex_mesh(base.v[1], base.vc[1]);
            create_vertex_mesh(base.v[2], base.vc[2]);
            create_actuator(base.v[0], base.v[1], null, memo_color_mat(cto3(base.ec[2])));
            create_actuator(base.v[1], base.v[2], null, memo_color_mat(cto3(base.ec[0])));
            create_actuator(base.v[2], base.v[0], null, memo_color_mat(cto3(base.ec[1])));
        }
        else {
            var geometry = new THREE.Geometry();
            geometry.vertices.push(vertices[0],vertices[1],vertices[2]);
            if (params.blendcolor == true) {
                geometry.faces.push(new THREE.Face3(0, 1, 2, undefined, [cto3(base.ec[0]),cto3(base.ec[1]),cto3(base.ec[2])]));
            }
            else {
                geometry.faces.push(new THREE.Face3(0, 1, 2, undefined, new THREE.Color(0)));
            }
            var material = new THREE.MeshBasicMaterial({vertexColors: THREE.VertexColors});
            var mesh = new THREE.Mesh(geometry, material);
            am.scene.add(mesh);
        }
    } else {
            //                var d = get_direction(i - 3, vertices, indices);
        switch (d) {
            case 0: th = [prev[1], prev[2], prev[3], i]; break;
            case 1: th = [prev[0], prev[3], prev[2], i]; break;
            case 2: th = [prev[3], prev[0], prev[1], i]; break;
            case 3: th = [prev[2], prev[1], prev[0], i]; break;
        }
        var l = params.l
        v = get_vertex(i, vertices, indices, vertices[th[0]], vertices[th[1]], vertices[th[2]], [l[0]+l[3],l[1]+l[4],l[2]+l[5]], params.l, params.m);
        vertices.push(v);
        indices.push(th);
    }
    c = get_colors(i, vertices, indices);
    if (params.wireframe == true) {
        create_vertex_mesh(v, c[3]);

        for (var k = 0; k < Math.min(3, i); k++) {
            var tcolor = new THREE.Color(c[k].hex());
            var cmat = memo_color_mat(tcolor);
            var mesh = create_actuator(vertices[th[k]], vertices[th[3]], null, cmat);
        }
    }
    else {
        var geometry = new THREE.Geometry();
        geometry.vertices.push(vertices[th[0]],vertices[th[1]],vertices[th[2]],vertices[th[3]]);
        if (params.blendcolor == true) {
            geometry.faces.push(
                new THREE.Face3(2, 3, 0, undefined, [cto3(c[2]),cto3(c[3]),cto3(c[0])]),
                new THREE.Face3(3, 2, 1, undefined, [cto3(c[3]),cto3(c[2]),cto3(c[1])]),
                new THREE.Face3(1, 0, 3, undefined, [cto3(c[1]),cto3(c[0]),cto3(c[3])]));
        }
        else {
            geometry.faces.push(
                new THREE.Face3(2, 3, 0, undefined, cto3(c[1])),
                new THREE.Face3(3, 2, 1, undefined, cto3(c[0])),
                new THREE.Face3(1, 0, 3, undefined, cto3(c[2])));
        }
        var material = new THREE.MeshBasicMaterial({vertexColors: THREE.VertexColors});
        var mesh = new THREE.Mesh(geometry, material);
        am.scene.add(mesh);
    }
    params.prev = th;
}
function cto3(c) {
     return new THREE.Color(c.hex());
}

function get_random_int(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function get_direction(n, v, i) {
    if (n < 10)
        return get_random_int(3);
    else return -1;
}

function get_vertex(n, v, i, pa, pb, pc, s, l, m) {
    var valid = { v: true };
    var l0 = pa.distanceTo(pb);
    var l1 = pc.distanceTo(pa);
    var l2 = pb.distanceTo(pc);
    var ad = m ? s[0]-l0 : (n % 2 == 0) ? l[0] : l[3];
    var bd = m ? s[1]-l1 : (n % 2 == 0) ? l[1] : l[4];
    var cd = m ? s[2]-l2 : (n % 2 == 0) ? l[2] : l[5];
    var pd = find_fourth_point_given_three_points_and_three_distances(
        CHIRALITY_CCW,
        pa, pb, pc,
        ad, bd, cd,
        valid);
    return pd;
}
var colors = [d3.color("DarkRed"), d3.color("DarkOrange"), d3.color("Indigo"), d3.color("purple"), d3.color("black")];
function get_colors(n, v, i) {
    return [d3.color("DarkRed"), d3.color("DarkOrange"), d3.color("Indigo"), d3.color("purple")];
}
// I believe all of these must in principle be locatable by initial position
// if we are to allow parametric curves to start in different positions.
// I believe we should hold invariant that "init_pos" passed into
// initialParameters below is always respected.
// var cs = [];
// cs[0] = new THREE.Vector3(0, 0, 0);
// cs[1] = new THREE.Vector3(3, 0, 0);
// cs[2] = new THREE.Vector3(.5, -Math.sqrt(3) / 2, 0);

function calculate_tetrahedron(l) {
    var v = [new THREE.Vector3( l[1]/2,0,0),
             new THREE.Vector3(      0,0,0),
             new THREE.Vector3(-l[1]/2,0,0),
             new THREE.Vector3(      0,0,0)];
    v1 = v[1];
    v3 = v[3];
    s0 = l[0]*l[0];
    s1 = l[1]*l[1];
    s2 = l[2]*l[2];
    s3 = l[3]*l[3];
    s4 = l[4]*l[4];
    s5 = l[5]*l[5];
    var x1 = v1.x = -(s2-s0)/2/l[1];
    var x3 = v3.x = -(s3-s5)/2/l[1];
    var xm = (x1+x3)/2;
    var xyz1s = (s2+s0-s1/2)/2;
    var xyz3s = (s3+s5-s1/2)/2;
    var zs = (xyz1s+xyz3s-s4/2)/2-xm*xm;
    var z = Math.sqrt(zs);
    var zd = (s4/4-xyz1s+zs)/2/z;
    var z1 = v1.z = ((3*(s2+s0)+(s3+s5)-2*s1-2*s4)/8-x1*xm)/z;
    v3.z = 2*z-z1;
    v1.y = -(v3.y=Math.sqrt(xyz1s-x1*x1-z1*z1));
    return v;
}

// v [a, b, c, d], vc[a, b, c, d], ec[cb, ac, ba, ad, bd, cd]
function get_base(init_pos, l) {
    var v = calculate_tetrahedron(l);
    // now shift this dtetrhedron by the init_pos...
    v.forEach(vec => vec.add(init_pos));
    return { v: v,
             vc: [colors[3], colors[3], colors[3], colors[3]], ec: [colors[4], colors[4], colors[4], colors[0], colors[1], colors[2]] };
}

var AM = function () {
    this.container,
        this.stats;
    this.camera;
    this.controls;
    this.scene;
    this.sceneOrtho;
    this.renderer;
    this.textureLoader;
    this.clock = new THREE.Clock();
    this.clickRequest = false;
    this.mouseCoords = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.ballMaterial = new THREE.MeshPhongMaterial({ color: 0x202020 });
    this.pos = new THREE.Vector3();
    this.quat = new THREE.Quaternion();


    this.BT_CONSTRAINT_STOP_CFM = 3;
    this.BT_CONSTRAINT_STOP_ERP = 1
    this.myCFMvalue = 0.0;
    this.myERPvalue = 0.8;

    this.jointBody = null;

    this.playgroundDimensions = {
        w: 10,
        d: 10,
        h: 3
    };
    this.GROUND_WIDTH = 1.0;

    this.gravity_on = true;
    this.margin = 0.05;

    this.armMovement = 0;

    //    this.window_height_factor = 1/4.0;
    this.window_height_factor = 0.5;
    // Sadly, this seems to do nothing!
    this.CAMERA_RADIUS_FACTOR = 1;

    this.grid_scene = null;
    // Used in manipulation of objects
    this.gplane = false;


    this.INITIAL_EDGE_LENGTH = TET_DISTANCE;
    this.INITIAL_EDGE_WIDTH = this.INITIAL_EDGE_LENGTH / 40;
    this.INITIAL_HEIGHT = 3 * this.INITIAL_EDGE_LENGTH / 2;
    this.NUMBER_OF_TETRAHEDRA = 70;
    //       this.NUMBER_OF_TETRAHEDRA = 5;


    this.JOINT_RADIUS = 0.09 * this.INITIAL_EDGE_LENGTH; // This is the current turret joint ball.

    this.LENGTH_FACTOR = 20;

    // Helices look like this...
    // {
    // 	helix_joints: [],
    // 	helix_members: []
    // }
    this.helices = [];



    this.meshes = [];
    this.bodies = [];


    // This is sometimes useful for debugging.    
    //    this.jointGeo = new THREE.BoxGeometry( this.JOINT_RADIUS*2,this.JOINT_RADIUS*2,this.JOINT_RADIUS*2);
    this.jointGeo = new THREE.SphereGeometry(this.JOINT_RADIUS, 32, 32);
    this.jointMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });

    this.floorTexture = new THREE.ImageUtils.loadTexture("images/logo-white-background.png");

    this.MIN_EDGE_LENGTH = this.INITIAL_EDGE_LENGTH / 2;
    this.MAX_EDGE_LENGTH = this.INITIAL_EDGE_LENGTH * 2;
    this.color_scale = d3.scale.quantile().domain([this.MIN_EDGE_LENGTH, this.MAX_EDGE_LENGTH])
        .range(['violet', 'indigo', '#8A2BE2', 'blue', 'green', 'yellow', '#FFD700', 'orange', '#FF4500']);
    this.color_material_palette = {};

    this.GROUND_PLANE_MESH;
    this.GROUND_BODY;

    this.latestLookAt = new THREE.Vector3(0, 0, 0);

    this.helix_params = [];

    // a final adjustment
    this.INITIAL_EDGE_WIDTH *= 4;
    this.JOINT_RADIUS *= 3;

}
AM.prototype.push_body_mesh_pair = function (body, mesh) {
    this.meshes.push(mesh);
    this.bodies.push(body);
}
AM.prototype.remove_body_mesh_pair = function (body, mesh) {
    for (var i = this.meshes.length - 1; i >= 0; i--) {
        if (this.meshes[i].name === mesh.name) {
            this.meshes.splice(i, 1);
            this.bodies.splice(i, 1);
        }
    }
}

AM.prototype.clear_non_floor_body_mesh_pairs = function () {
    this.meshes = [];
    this.bodies = [];
    this.meshes.push(am.GROUND_PLANE_MESH);
    this.bodies.push(am.GROUND_BODY);
}

var am = new AM();


var bulbLight, bulbMat, ambientLight, object, loader, stats;
var ballMat, cubeMat, floorMat;
// ref for lumens: http://www.power-sure.com/lumens.htm
var bulbLuminousPowers = {
    "110000 lm (1000W)": 110000,
    "3500 lm (300W)": 3500,
    "1700 lm (100W)": 1700,
    "800 lm (60W)": 800,
    "400 lm (40W)": 400,
    "180 lm (25W)": 180,
    "20 lm (4W)": 20,
    "Off": 0
};
// ref for solar irradiances: https://en.wikipedia.org/wiki/Lux
var hemiLuminousIrradiances = {
    "0.0001 lx (Moonless Night)": 0.0001,
    "0.002 lx (Night Airglow)": 0.002,
    "0.5 lx (Full Moon)": 0.5,
    "3.4 lx (City Twilight)": 3.4,
    "50 lx (Living Room)": 50,
    "100 lx (Very Overcast)": 100,
    "350 lx (Office Room)": 350,
    "400 lx (Sunrise/Sunset)": 400,
    "1000 lx (Overcast)": 1000,
    "18000 lx (Daylight)": 18000,
    "50000 lx (Direct Sun)": 50000
};
var params = {
    shadows: true,
    exposure: 0.68,
    bulbPower: Object.keys(bulbLuminousPowers)[4],
    hemiIrradiance: Object.keys(hemiLuminousIrradiances)[0]
};


function initGraphics() {

    am.container = document.getElementById('threecontainer');

    var PERSPECTIVE_NEAR = 0.3;


    if (OPERATION == "helices") {
        var width = 10;
        var height = width * (window.innerHeight * am.window_height_factor) / window.innerWidth;
        am.camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 1, 1000);
    } else {
        am.camera = new THREE.PerspectiveCamera(60, window.innerWidth / (window.innerHeight * am.window_height_factor), PERSPECTIVE_NEAR, 2000);
    }

    //   am.camera.aspect = window.innerWidth / (window.innerHeight * am.window_height_factor);

    var origin = new THREE.Vector3(0, 0, 0);
    am.camera.lookAt(origin);

    //    am.camera.quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), (Math.PI/2));

    am.scene = new THREE.Scene();
    am.scene.fog = new THREE.Fog(0x000000, 500, 10000);

    am.camera.position.x = -0.25;
    am.camera.position.y = 1.5;
    am.camera.position.z = 2;

    am.controls = new THREE.OrbitControls(am.camera, am.container);
    am.controls.target.set(0, 0, 0);

    am.renderer = new THREE.WebGLRenderer({ antialias: true });
    am.renderer.setClearColor(0xffffff);
    am.renderer.autoClearColor = true;

    am.renderer.setPixelRatio(window.devicePixelRatio);
    am.renderer.setSize(window.innerWidth, window.innerHeight * am.window_height_factor);
    am.SCREEN_WIDTH = am.renderer.getSize().width;
    am.SCREEN_HEIGHT = am.renderer.getSize().height;
    am.camera.radius = (am.SCREEN_WIDTH + am.SCREEN_HEIGHT) / this.CAMERA_RADIUS_FACTOR;


    am.cameraOrtho = new THREE.OrthographicCamera(0, am.SCREEN_WIDTH, am.SCREEN_HEIGHT, 0, - 10, 10);

    hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
    am.scene.add(hemiLight);

    // var directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    // directionalLight.position = new THREE.Vector3(100, 5, 0);
    // am.scene.add(directionalLight);


    
    var ambientLight = new THREE.AmbientLight(0x404040);

    am.grid_scene = new THREE.Scene();
    am.grid_scene.fog = new THREE.Fog(0x000000, 500, 10000);

    // GROUND
    var groundGeo = new THREE.PlaneBufferGeometry(10000, 10000);
    var groundMat;
    if (OPERATION == "normal") {
        groundMat = new THREE.MeshPhongMaterial({ color: 0x777777, specular: 0x050505 });
    } else {
        groundMat = new THREE.MeshPhongMaterial({ color: 0xfffffff, specular: 0x050505 });
    }
    //    groundMat.color.setHSL( 0.095, 1, 0.75 );

    var ground = new THREE.Mesh(groundGeo, groundMat);
    ground.name = "GROUND";
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    am.scene.add(ground);

    ground.receiveShadow = true;


    // HACK:  These diemensions are probably not right here!
    gridInit(am.grid_scene, am.playgroundDimensions);

    am.container.innerHTML = "";

    am.container.appendChild(am.renderer.domElement);

    am.sceneOrtho = new THREE.Scene();

    window.addEventListener('resize', onWindowResize, false);

}

AM.prototype.push_body_mesh_pair = function (body, mesh) {
    this.meshes.push(mesh);
    this.bodies.push(body);
}
AM.prototype.remove_body_mesh_pair = function (body, mesh) {
    for (var i = this.meshes.length - 1; i >= 0; i--) {
        if (this.meshes[i].name === mesh.name) {
            this.meshes.splice(i, 1);
            this.bodies.splice(i, 1);
        }
    }
    delete mesh["ammo_obj"];
    for (var i = this.rigidBodies.length - 1; i >= 0; i--) {
        if (this.rigidBodies[i].name === body.name) {
            this.rigidBodies.splice(i, 1);
        }
    }
}


function onWindowResize() {
    am.camera.aspect = window.innerWidth / (window.innerHeight * am.window_height_factor);
    am.renderer.setSize(window.innerWidth, window.innerHeight * am.window_height_factor);

    am.camera.updateProjectionMatrix();
    am.SCREEN_WIDTH = am.renderer.getSize().width;
    am.SCREEN_HEIGHT = am.renderer.getSize().height;
    am.camera.radius = (am.SCREEN_WIDTH + am.SCREEN_HEIGHT) / this.CAMERA_RADIUS_FACTOR;

    am.cameraOrtho = new THREE.OrthographicCamera(0, am.SCREEN_WIDTH, am.SCREEN_HEIGHT, 0, - 10, 10);
}

function animate() {
    // Seems this is likely to be a problem...
    requestAnimationFrame(animate);
    render();
}

var sprite_controls = new function () {
    this.size = 50;
    this.sprite = 0;
    this.transparent = true;
    this.opacity = 0.6;
    this.colorize = 0xffffff;
    this.textcolor = "yellow";
    this.rotateSystem = true;

    this.clear = function (x, y) {
        am.sceneOrtho.children.forEach(function (child) {
            if (child instanceof THREE.Sprite) am.sceneOrtho.remove(child);
        })
    };

    this.draw_and_create = function (sprite, x, y, message) {
        var fontsize = 128;
        var ctx, texture,
            spriteMaterial,
            canvas = document.createElement('canvas');
        ctx = canvas.getContext('2d');
        ctx.font = fontsize + "px Arial";

        // setting canvas width/height before ctx draw, else canvas is empty
        canvas.width = ctx.measureText(message).width;
        canvas.height = fontsize * 2; // fontsize * 1.5

        // after setting the canvas width/height we have to re-set font to apply!?! looks like ctx reset
        ctx.font = fontsize + "px Arial";
        ctx.fillStyle = this.textcolor;
        ctx.fillText(message, 0, fontsize);

        texture = new THREE.Texture(canvas);
        texture.minFilter = THREE.LinearFilter; // NearestFilter;
        texture.needsUpdate = true;

        var spriteMaterial = new THREE.SpriteMaterial({
            opacity: this.opacity,
            color: this.colorize,
            transparent: this.transparent,
            map: texture
        });

        spriteMaterial.scaleByViewport = true;
        spriteMaterial.blending = THREE.AdditiveBlending;

        if (!sprite) {
            sprite = new THREE.Sprite(spriteMaterial);
        }

        sprite.scale.set(this.size, this.size, this.size);
        sprite.position.set(x, y, 0);

        am.sceneOrtho.add(sprite);
        return sprite;
    };
};

function render() {
    var deltaTime = am.clock.getDelta();

    sprite_controls.clear();
    am.controls.update(deltaTime);

    // note this....
    //    am.renderer.autoClear = true;        
    am.renderer.render(am.scene, am.camera);
    if (OPERATION == "normal") {
        am.renderer.render(am.grid_scene, am.camera);
    }
    am.renderer.autoClear = false;
    am.renderer.render(am.sceneOrtho, am.cameraOrtho);
}

function initiation_stuff() {
    // Initialize Three.js
    if (!Detector.webgl) Detector.addGetWebGLMessage();
}


function init() {
    initGraphics();
    //    createGround(am);
}


initiation_stuff();

init();
animate();




// for testing, we need to know when somethigns is "closeto a target"
// to deal with roundoff error

function near(x, y, e) {
    return Math.abs(x - y) <= e;
}

// Find the normal to a triangle in 3space: https://stackoverflow.com/questions/19350792/calculate-normal-of-a-single-triangle-in-3d-space
// arguments THREE.js Vector3's
function normal(a, b, c) {
    var U = b.sub(a);
    var V = c.sub(a);
    return U.cross(V);
}



function clearAm() {
    am.clear_non_floor_body_mesh_pairs();
    for (var i = am.scene.children.length - 1; i >= 0; i--) {
        var obj = am.scene.children[i];
        if (obj.type == "Mesh" && obj.name != "GROUND") {
            am.scene.remove(obj);
        }
    }
    am.helices = [];
    am.helix_params = [];
}

function initialParameters(init_pos,wf,bc,l,a) { 
    var params = { vertices: [], indices: [], prev: [], helix: {helix_joints: [], helix_members: [],
                                                               },
                 init_pos: init_pos};
    if (wf === undefined)
        wf = true;
    if (bc === undefined)
        bc = true;
    params.wireframe = wf;
    params.blendcolor = bc;
    params.l = l;
    params.m = !a;
//    for (var i = 0; i < 3; i++) {
//        add_vertex(am, 0, i, params);
//    }
    add_vertex(am, 0, 3, params);
    return params;
}

function drawTetrahedron(dir, i, other_params) {
    // ... do stuff
    add_vertex(am, dir, i + 3, other_params);
    return other_params;
}

function add_data_object() {
    DATA_OBJECTS.push({label: new_label.value,
                       pos: new THREE.Vector3(0, 0, 0)});

    // Now how do I add a simple object that can be moved?

    // we have no way to release this.
    
    var tcolor = new THREE.Color("white");
    var cmat = new THREE.MeshPhongMaterial({ color: tcolor });
    var tet = new THREE.TetrahedronGeometry(0.2, 0);

    // https://stackoverflow.com/questions/12784455/three-js-rotate-tetrahedron-on-correct-axis
    tet.applyMatrix(
        new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 1, 0, -1 ).normalize(), Math.atan( Math.sqrt(2)) ) );

    tet.applyMatrix(
        new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 0, 1, 0 ).normalize(),
                                              45*(Math.PI/180) )
    );

    tet.translate(0,1,0);
    
    var mesh = new THREE.Mesh(tet, cmat);
    
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.debugObject = true;

    
    am.scene.add(mesh);
    render_data_objects();
}


function render_data_objects() {
    var table = document.getElementById('object_table');
    function addRow(d,i) {
        var row = table.insertRow();

        // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
        var cell0 = row.insertCell(0);
        cell0.innerHTML = d.label;
        var cell1 = row.insertCell(1);
        cell1.innerHTML = "<button class='currentbutton' id='current"+i+"'>Make Current</button>";
    }
    var rows = table.getElementsByTagName("tr")
    const n = rows.length;
    for (var i = 1; i < n; i++) {
        table.deleteRow(-1);
    }
    DATA_OBJECTS.forEach(addRow);
    
$(".currentbutton").on('click', function(event){
    event.stopPropagation();
    event.stopImmediatePropagation();
    //(... rest of your JS code)
    console.log(event);
    console.log(event.currentTarget.id);
    let idstr = event.currentTarget.id.substring("current".length);
    let idnum = parseInt(idstr);
    console.log(idnum);
    CURRENT_DATA_OBJECT = idnum;
    let current_label = document.getElementById("current-label");
    current_label.innerHTML = DATA_OBJECTS[CURRENT_DATA_OBJECT].label;
    
    
});
}

(function () {

    // // PAGE ELEMENTS
    
    var executeButton;
    var funcStatus;
//    var generatorsSelector;
    var new_label;
    
    // MAIN FUNCTION
    
    $(function () { main(); });
    function main() {
        executeButton = document.getElementById('execute-button');
        funcStatus = document.getElementById('function-status');
        var addButton = document.getElementById('add');
        addButton.addEventListener('click', add_data_object);

        new_label = document.getElementById('new_label');        
        executeButton.addEventListener('click', onExecute);
        onExecute();
        draw_big_tet();
    }

    // STEP FUNCTION
    
    function step(fn, i, other_params) {
        var dir;
        try {
            dir = fn(i);
//            dir = generatorFn(i);
        } catch (err) {
           funcStatus.innerHTML = "Step " + i + ": " + err.message;
           dir = -1;
        }
        
        if (dir!==-1 && dir!==0 && dir!==1 && dir!==2) {
            funcStatus.innerHTML = "Step " + i + ": Unexpected return value " + dir;
            dir = -1;    
        }
        
//        console.log('Step ' + i + ' direction ' + dir);
        if (dir != -1) {
            other_params = drawTetrahedron(dir, i, other_params);
            setTimeout(step, INTERVAL, fn, i+1, other_params);
        } else {
                var vertices = other_params.vertices;
                var indices = other_params.indices;
                var th = indices.slice(-1)[0];
                console.log(vertices[th[0]], vertices[th[1]], vertices[th[2]], vertices[th[3]]);

            executeButton.disabled = false;
        }
    }
    
    // EVENT HANDLERS

    function generator_init(params) {
    }

    function onExecute() {
        clearAm();
    }

    
        
    function onGeneratorChanged() {
        funcStatus.innerHTML = '';
        generatorText.value = EXAMPLE_GENERATORS[generatorsSelector.value].src || '';
    }
    
    // HELPER FUNCTIONS
    
    function compileGenerator(src) {
        var fn;
        try { fn = eval(src); }
        catch(err) {
            funcStatus.innerHTML = err.message;
            return undefined;
        }
        var fnType = typeof fn;
        if (fnType != 'function') {
            funcStatus.innerHTML = "Generator needs to be a function, not " + fnType;
            return undefined;
        }
        funcStatus.innerHTML = "";
        return fn;
    }

    // return true iff lpt is inside the tetrahedron formed
    // by a,b,c,d
    // https://stackoverflow.com/questions/25179693/how-to-check-whether-the-point-is-in-the-tetrahedron-or-not
    function SameSide(v1, v2, v3, v4, p)
    {
        var v21 = v2.clone();
        v21.sub(v1);
        var v31 = v3.clone();
        v31.sub(v1);
        var normal = new THREE.Vector3();
        normal.crossVectors(v21,v31);
        //        var normal = cross(v2 - v1, v3 - v1);
        var v41 = v4.clone();
        v41.sub(v1);
        
        var dotV4 = normal.dot(v41);
        var p_v1 = p.clone();
        p_v1.sub(v1);
        var dotP = normal.dot(p_v1);

        var r = (Math.sign(dotV4) == Math.sign(dotP));
        return r;
    }
    function test_SameSide() {
        var c = [];
        c[0] = new THREE.Vector3(0, 0, 0);
        c[1] = new THREE.Vector3(1, 0, 0);
        c[2] = new THREE.Vector3(0, 1, 0);
        c[3] = new THREE.Vector3(0, 0, 1);
        var psam = new THREE.Vector3(2, 2, 2);
        var pnsam = new THREE.Vector3(2, 2, -2);        
        console.assert(SameSide(c[0],c[1],c[2],c[3],psam));
        console.assert(!SameSide(c[0],c[1],c[2],c[3],pnsam));
        var small = new THREE.Vector3(2, 2, 2);
        console.assert(SameSide(c[0],c[1],c[2],c[3],small));        
    }
    test_SameSide();
    
    
    function pointIsInsideTetPnts(p, v1,v2,v3,v4) {
        var A =  SameSide(v1, v2, v3, v4, p);
        var B = SameSide(v2, v3, v4, v1, p);
        var C = SameSide(v3, v4, v1, v2, p);
        var D = SameSide(v4, v1, v2, v3, p);
        return A && B && C && D;

    }

    function test_pointIsInsideTet() {
        var c = [];
        c[0] = new THREE.Vector3(0, 0, 0);
        c[1] = new THREE.Vector3(1, 0, 0);
        c[2] = new THREE.Vector3(0, 1, 0);
        c[3] = new THREE.Vector3(0, 0, 1);
        var pin = new THREE.Vector3(0.1, .1, 0.1);
        var pout = new THREE.Vector3(2,2,2);        
        
        console.assert(pointIsInsideTetPnts(pin,c[0],c[1],c[2],c[3]));
        
        console.assert(!pointIsInsideTetPnts(pout,c[0],c[1],c[2],c[3]));        
    }

    function addDebugSphere(am,pos,color) {
        if (!color) {
            color = "yellow";
        }
        var mesh = createSphere(am.JOINT_RADIUS/5, pos, color);
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        mesh.debugObject = true;
        am.scene.add(mesh);
    }
    function pointIsInsideTet(lpt, tc, params) {
        var N = params.vertices.length - 1;
        var prev = params.prev;
        var vs = [];
        vs[0] = params.vertices[prev[0]];
        vs[1] = params.vertices[prev[1]];
        vs[2] = params.vertices[prev[2]];
        // This is the most recently added point.
        vs[3] = params.vertices[prev[3]];
        return pointIsInsideTetPnts(lpt,vs[0],vs[1],vs[2],vs[3]);
    }
    test_pointIsInsideTet();

    // PARAMETRIC CURVE FUNCTIONALITY

    // lpt is a Vector3. tc is the index
    // return value if very weird here, since we have cases.
    function nextParametricTet(lpt, tc,params) {
        if (pointIsInsideTet(lpt, tc,params)) { return "INSIDECURRENT"; }
        var debug = false;
        if (debug) addDebugSphere(am,lpt,"white");
        var prev = params.prev;
        var vs = [];
        vs[0] = params.vertices[prev[0]];
        vs[1] = params.vertices[prev[1]];
        vs[2] = params.vertices[prev[2]];
        // This is the most recently added point.
        vs[3] = params.vertices[prev[3]];

        // Face and direction 0 are OPPOSITE vertex 0.
        // Face and direction 3 are GOING BACKWARD.

        var te = 1.0;
        var valid = { v: true };        
        var v0 = find_fourth_point_given_three_points_and_three_distances(
            CHIRALITY_CCW,
            vs[1], vs[2], vs[3],
            te, te, te,
            valid);
        console.assert(valid.v);

        if (debug) addDebugSphere(am,v0,"green");
        
        if (pointIsInsideTetPnts(lpt,v0,vs[1],vs[2],vs[3])) {
            console.log("return",lpt,0);
            return 0;
        }

        // I don't know why I need this chirality change, but I do.
        var v1 = find_fourth_point_given_three_points_and_three_distances(
            CHIRALITY_CCW,
             vs[2],vs[0], vs[3],            
            te, te, te,
            valid);
        console.assert(valid.v);
        if (debug) addDebugSphere(am,v1,"blue");        
        
        if (pointIsInsideTetPnts(lpt,vs[0],v1,vs[2],vs[3])) {
            console.log("return",lpt,1);            
            return 1;
        }
        
        var v2 = find_fourth_point_given_three_points_and_three_distances(
            CHIRALITY_CCW,
            vs[0], vs[1], vs[3],
            te, te, te,
            valid);
        console.assert(valid.v);
        
        if (pointIsInsideTetPnts(lpt,vs[0],vs[1],v2,vs[3])) {
            console.log("return",lpt,2);                        
            return 2;
        }

        if (debug) addDebugSphere(am,v2,"red");                

        var v3 = find_fourth_point_given_three_points_and_three_distances(
            CHIRALITY_CCW,
            vs[0], vs[1], vs[2],            
            te, te, te,
            valid);
        console.assert(valid.v);

        addDebugSphere(am,v3,"gray");
        
        if (pointIsInsideTetPnts(lpt,vs[0],vs[1],vs[2],v3)) {
            console.log("CURVE WENT BACKWARD!");
            return 3;
        }
        console.log("NORREACH",lpt);
        // otherwise we can't reach it in one...
        return "NOREACH";
        
    }


    function test_nextParametricTet() {
        var initialPt = new THREE.Vector3(0,0,0);
        var offset = new THREE.Vector3(initialPt.x-0.5,
                                       initialPt.y-(Math.sqrt(3) / 2)/2,
                                       initialPt.z-0.2);
        
//        var wf = document.getElementById('wireframe').checked;
        //        var bc = document.getElementById('blendcolor').checked;
        var wf = true;
        var bc = true;
        var l = [];
        for(var i = 0; i < 6; i++) {
            l[i] = document.getElementById('l'+i).value || 1;
        }

        var params = initialParameters(offset,wf,bc,l);
        add_vertex(am,0,3,params);
        var prev = params.prev;
        var vs = [];
        console.log(prev);
        console.log(params);
        console.log(params.vertices);
        vs[0] = params.vertices[prev[0]];
        vs[1] = params.vertices[prev[1]];
        vs[2] = params.vertices[prev[2]];
        // This is the most recently added point.
        vs[3] = params.vertices[prev[3]];

        // A should be the midpoint of 2 and 3
        var A = new THREE.Vector3(0,0,0);
        A.add(vs[1]);
        A.add(vs[2]);
        A.multiplyScalar(0.5);
        A.x += 0.0;
        A.y += 0.1;
        A.z += 0.2;                

        addDebugSphere(am,A,"red");
        console.log("vs[1],vs[2]",vs[1],vs[2]);
        console.log("A",A);
        var nt = nextParametricTet(A, 3 ,params);
        console.log("nt",nt);
        console.assert(0 == nt );        
        // var B = new THREE.Vector3(0,0,0);
        // console.assert(nextParametricTet(B, 3 ,params) );                 var C = new THREE.Vector3(0,0,0);
        // console.assert(nextParametricTet(C, 3 ,params) );
        clearAm();        
    }
})();

