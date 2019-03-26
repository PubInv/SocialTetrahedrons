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

var DIMENSION_NAMES = ["Mind","Body","Spirit","Abundance"];

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

function set_dimension_names(d) {
  DIMENSIONS_NAMES = d;
}
function update_dimension_names() {

  var children_to_remove = [];
  am.grid_scene.children.forEach(function (child) {
    if (child.userData.obj_type == "dimension_name")
      children_to_remove.push(child);
  });
  children_to_remove.forEach(c => am.grid_scene.remove(c));
  var v = get_vertices();
  console.log("updating DIMENSION_NAMES",DIMENSION_NAMES);
    for (var i in DIMENSION_NAMES) {
        var label = makeTextSprite(DIMENSION_NAMES[i],{fontsize: 60 },"red");
      label.position.set(v[i].x,v[i].y,v[i].z);
      label.userData.obj_type = "dimension_name";
        am.grid_scene.add(label);
    }  
}

function get_vertices() {
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
  return v;
 }

function draw_big_tet() {
    const colors = [d3.color("DarkRed"), d3.color("DarkOrange"), d3.color("Blue")];
    const three_colors = [0xff0000,
                          0xffff00,
                          0x00ff00,
                          0x0000ff];    


  var v = get_vertices();
  v.forEach(x => create_vertex_mesh(x,d3.color("DarkRed")));

  update_dimension_names();

    for (var i in DIMENSION_NAMES) {
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

var colors = [d3.color("DarkRed"), d3.color("DarkOrange"), d3.color("Indigo"), d3.color("purple"), d3.color("black")];
function get_colors(n, v, i) {
    return [d3.color("DarkRed"), d3.color("DarkOrange"), d3.color("Indigo"), d3.color("purple")];
}

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


function initGraphics(window_width,window_height) {

    am.container = document.getElementById('threecontainer');

    var PERSPECTIVE_NEAR = 0.3;


    if (OPERATION == "helices") {
        var width = 10;
        var height = width * (window_height * am.window_height_factor) / window_width;
        am.camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 1, 1000);
    } else {
        am.camera = new THREE.PerspectiveCamera(60, window_width / (window_height * am.window_height_factor), PERSPECTIVE_NEAR, 2000);
    }

    //   am.camera.aspect = window_width / (window_height * am.window_height_factor);

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
    // I think this is where we want to try doing this....
    am.renderer.setSize(window_width, window_height * am.window_height_factor);
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

//    window.addEventListener('resize', onWindowResize, false);

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


function init_3d(w,h) {
    //    initGraphics(window.innerWidth,window.innerHeight);
    initGraphics(w,h);    
    //    createGround(am);
}


initiation_stuff();

// animate();




// for testing, we need to know when somethigns is "closeto a target"
// to deal with roundoff error

function near(x, y, e = 1e-4) {
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
    CURRENT_DATA_OBJECT = DATA_OBJECTS.length - 1;

    // Now how do I add a simple object that can be moved?

    render_data_objects();
}

function add_data_object_aux(bv,lab,color) {
    DATA_OBJECTS.push({label: lab,
                       color: color,
                       pos: bv});
    CURRENT_DATA_OBJECT = DATA_OBJECTS.length - 1;

    // Now how do I add a simple object that can be moved?

    render_data_objects();
}

const GRADIENT = 0.1;

function move_current(f) {
    if (CURRENT_DATA_OBJECT >= 0) {
        f(DATA_OBJECTS[CURRENT_DATA_OBJECT].pos);
    }
    render_data_objects();
}

function up_click() {
    move_current(d => {d.y += GRADIENT});
}

function dn_click() {
    move_current(d => {d.y -= GRADIENT});    
}

function body_plus_click() {
    move_current(d => {d.z += GRADIENT});
}

function body_minus_click() {
    move_current(d => {d.z -= GRADIENT});    
}

function mind_plus_click() {
    move_current(d => {d.x += GRADIENT});
}

function mind_minus_click() {
    move_current(d => {d.x -= GRADIENT});    
}

function spirit_plus_click() {
    move_current(d => {d.z -= GRADIENT});
}

function spirit_minus_click() {
    move_current(d => {d.z += GRADIENT});    
}


function render_individual(d) {
    
    var tcolor = new THREE.Color(d.color);
    var cmat = new THREE.MeshPhongMaterial({ color: tcolor });
    var tet = new THREE.TetrahedronGeometry(0.2, 0);

    // https://stackoverflow.com/questions/12784455/three-js-rotate-tetrahedron-on-correct-axis
    tet.applyMatrix(
        new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 1, 0, -1 ).normalize(), Math.atan( Math.sqrt(2)) ) );

    tet.applyMatrix(
        new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 0, 1, 0 ).normalize(),
                                              45*(Math.PI/180) )
    );

    tet.translate(d.pos.x,d.pos.y,d.pos.z);
    
    var mesh = new THREE.Mesh(tet, cmat);
    
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.debugObject = true;

    mesh.obj_type = "data_tet";
    am.scene.add(mesh);

    var label = makeTextSprite(d.label,{fontsize: 30 },d.color);
    label.position.set(d.pos.x,d.pos.y,d.pos.z);

    label.userData.obj_type = "data_tet";
    am.grid_scene.add(label);
}

function render_data_objects() {

    am.scene.children.forEach(function (child) {
        if (child.obj_type == "data_tet")
            am.scene.remove(child);
    });

    am.grid_scene.children.forEach(function (child) {
        console.log(child.obj_type);
        console.log(child.userData);
        console.log(child);
        if (child.userData.obj_type == "data_tet") {
            console.log("XXX");
            am.grid_scene.remove(child);
        }
    });

    DATA_OBJECTS.forEach(d =>
                         render_individual(d)
    );

}

(function () {

    // // PAGE ELEMENTS
    
    var executeButton;
    var funcStatus;
//    var generatorsSelector;
    var new_label;

    var up_button;
    var dn_button;
    // This is a mistake, in that it makes the dimensions unparameterizable...
    var mind_plus_button;
    var mind_minus_button;
    var body_plus_button;
    var body_minus_button;
    var spirit_plus_button;
    var spirit_minus_button;
    var axis_button;

    // MAIN FUNCTION
    
    $(function () { main(); });
    function main() {
        // executeButton = document.getElementById('execute-button');
        // funcStatus = document.getElementById('function-status');
        // var addButton = document.getElementById('add');
        // addButton.addEventListener('click', add_data_object);

        // new_label = document.getElementById('new_label');        
        // executeButton.addEventListener('click', onExecute);


        // up_button = document.getElementById('up');        
        // up_button.addEventListener('click', up_click);
        // dn_button = document.getElementById('dn');        
        // dn_button.addEventListener('click', dn_click);


        // mind_plus_button = document.getElementById('mind_plus');        
        // mind_plus_button.addEventListener('click', mind_plus_click);
        // mind_minus_button = document.getElementById('mind_minus');        
        // mind_minus_button.addEventListener('click', mind_minus_click);

        // body_plus_button = document.getElementById('body_plus');        
        // body_plus_button.addEventListener('click', body_plus_click);
        // body_minus_button = document.getElementById('body_minus');        
        // body_minus_button.addEventListener('click', body_minus_click);

        // spirit_plus_button = document.getElementById('spirit_plus');        
        // spirit_plus_button.addEventListener('click', spirit_plus_click);
        // spirit_minus_button = document.getElementById('spirit_minus');        
        // spirit_minus_button.addEventListener('click', spirit_minus_click);
        


        
        onExecute();
        draw_big_tet();
    }

    // STEP FUNCTION
    
//     function step(fn, i, other_params) {
//         var dir;
//         try {
//             dir = fn(i);
// //            dir = generatorFn(i);
//         } catch (err) {
//            funcStatus.innerHTML = "Step " + i + ": " + err.message;
//            dir = -1;
//         }
        
//         if (dir!==-1 && dir!==0 && dir!==1 && dir!==2) {
//             funcStatus.innerHTML = "Step " + i + ": Unexpected return value " + dir;
//             dir = -1;    
//         }
        
// //        console.log('Step ' + i + ' direction ' + dir);
//         if (dir != -1) {
//             other_params = drawTetrahedron(dir, i, other_params);
//             setTimeout(step, INTERVAL, fn, i+1, other_params);
//         } else {
//                 var vertices = other_params.vertices;
//                 var indices = other_params.indices;
//                 var th = indices.slice(-1)[0];
//                 console.log(vertices[th[0]], vertices[th[1]], vertices[th[2]], vertices[th[3]]);

//             executeButton.disabled = false;
//         }
//     }
    
//     // EVENT HANDLERS

//     function generator_init(params) {
//     }

     function onExecute() {
         clearAm();
     }

    
        
})();

