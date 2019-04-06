(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.triadb = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// curry :: (a -> b -> ... -> n) -> (a -> b) -> (b -> ...) -> (... -> n)
var curry = function curry(fn) {
  var curried = function curried() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (args.length >= fn.length) {
      return fn.apply(undefined, args);
    }
    return function () {
      for (var _len2 = arguments.length, argsNext = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        argsNext[_key2] = arguments[_key2];
      }

      return curried.apply(undefined, args.concat(argsNext));
    };
  };
  return curried;
};

// pipe :: (a -> b) -> (b -> ...) -> (... -> n)
var pipe = function pipe(fn1) {
  for (var _len3 = arguments.length, functions = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
    functions[_key3 - 1] = arguments[_key3];
  }

  return function () {
    return functions.reduce(function (acc, fn) {
      return fn(acc);
    }, fn1.apply(undefined, arguments));
  };
};

// compose :: (... -> n) -> (b -> ...) -> (a -> b)
var compose = function compose() {
  for (var _len4 = arguments.length, functions = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    functions[_key4] = arguments[_key4];
  }

  return pipe.apply(undefined, _toConsumableArray(functions.reverse()));
};

// vAdd :: Vector -> Vector -> Vector
var vAdd = curry(function (v, v2) {
  return [v[0] + v2[0], v[1] + v2[1]];
});

// vAdd3 :: Vector -> Vector -> Vector -> Vector
var vAdd3 = curry(function (v, v2, v3) {
  return [v[0] + v2[0] + v3[0], v[1] + v2[1] + v3[1]];
});

// vAddAll :: [Vector] -> Vector
var vAddAll = function vAddAll(vs) {
  return vs.reduce(vAdd, [0, 0]);
};

// vSub :: Vector -> Vector -> Vector
var vSub = curry(function (v, v2) {
  return [v[0] - v2[0], v[1] - v2[1]];
});

// vSub3 :: Vector -> Vector -> Vector -> Vector
var vSub3 = curry(function (v, v2, v3) {
  return [v[0] - v2[0] - v3[0], v[1] - v2[1] - v3[1]];
});

// vSubAll :: [Vector] -> Vector
var vSubAll = function vSubAll(vs) {
  return vs.slice(1).reduce(vSub, vs.slice(0, 1)[0]);
};

// vMag :: Vector -> Number
var vMag = function vMag(v) {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
};

// vNormal :: Vector -> Vector
var vNormal = function vNormal(v) {
  return [-v[1], v[0]];
};

// vScale :: Number -> Vector
var vScale = curry(function (sc, v) {
  return [v[0] * sc, v[1] * sc];
});

// vTowards :: Number -> Vector -> Vector -> Vector
var vTowards = curry(function (t, v1, v2) {
  var d = vSub(v2, v1);
  var sc = vMag(d) * t;
  return vAdd(v1, vScale(sc, vNorm(d)));
});

// vLerp :: Vector -> Vector -> Number -> Vector
var vLerp = curry(function (v1, v2, t) {
  return vTowards(t, v1, v2);
});

// vScalarNear :: Number -> Number -> Number -> bool
var vScalarNear = curry(function (e, a, b) {
  return Math.abs(a - b) < e;
});

// vNear :: Number -> Vector -> Vector -> bool
var vNear = curry(function (e, a, b) {
  return vScalarNear(e, a[0], b[0]) && vScalarNear(e, a[1], b[1]);
});

// vClampMag :: Number -> Number -> Vector -> Vector
var vClampMag = curry(function (min, max, v) {
  var d = vec.mag(v);
  if (d < min) return vec.scale(min / d, v);else if (d > max) return vec.scale(max / d, v);else return v;
});

// vNorm :: Vector -> Vector
var vNorm = function vNorm(v) {
  var mag = vMag(v);
  return [v[0] / mag, v[1] / mag];
};

// mId :: Matrix
var mId = Object.freeze([1, 0, 0, 0, 1, 0, 0, 0, 1]);

// vCreateMatrix :: Number -> Number -> Number -> Number -> Number -> Number -> Matrix
var vCreateMatrix = function vCreateMatrix() {
  var a = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
  var b = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var c = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var d = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
  var tx = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
  var ty = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;
  return [a, c, tx, b, d, ty, 0, 0, 1];
};

// vTransform :: Matrix -> Vector -> Vector
var vTransform = curry(function (m, v) {
  return [v[0] * m[0] + v[1] * m[1] + m[2], v[0] * m[3] + v[1] * m[4] + m[5]];
});

// mCompose :: Matrix -> Matrix -> Matrix
var mCompose = curry(function (m, m2) {
  return [m[0] * m2[0] + m[1] * m2[3] + m[2] * m2[6], m[0] * m2[1] + m[1] * m2[4] + m[2] * m2[7], m[0] * m2[2] + m[1] * m2[5] + m[2] * m2[8], m[3] * m2[0] + m[4] * m2[3] + m[5] * m2[6], m[3] * m2[1] + m[4] * m2[4] + m[5] * m2[7], m[3] * m2[2] + m[4] * m2[5] + m[5] * m2[8], m[6] * m2[0] + m[7] * m2[3] + m[8] * m2[6], m[6] * m2[1] + m[7] * m2[4] + m[8] * m2[7], m[6] * m2[2] + m[7] * m2[5] + m[8] * m2[8]];
});

// mRotate :: Number -> Matrix -> Matrix
var mRotate = function mRotate(a) {
  return mCompose([Math.cos(a), -Math.sin(a), 0, Math.sin(a), Math.cos(a), 0, 0, 0, 1]);
};

// mTranslate :: Vector -> Matrix -> Matrix
var mTranslate = function mTranslate(v) {
  return mCompose([1, 0, v[0], 0, 1, v[1], 0, 0, 1]);
};

// mScale :: Vector -> Matrix -> Matrix
var mScale = function mScale(v) {
  return mCompose([v[0], 0, 0, 0, v[1], 0, 0, 0, 1]);
};

// mShear :: Vector -> Matrix -> Matrix
var mShear = function mShear(v) {
  return mCompose([1, v[0], 0, v[1], 1, 0, 0, 0, 1]);
};

// vRotate :: Number -> Vector -> Vector
var vRotate = curry(function (a, v) {
  return [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
});

// vRotatePointAround :: Number -> Vector -> Vector -> Vector
var vRotatePointAround = curry(function (a, cp, v) {
  var v2 = vSub(v, cp);
  return vAdd(cp, [v2[0] * Math.cos(a) - v2[1] * Math.sin(a), v2[0] * Math.sin(a) + v2[1] * Math.cos(a)]);
});

// vMidpoint :: Vector -> Vector -> Vector
var vMidpoint = curry(function (v, v2) {
  return vScale(0.5, vAdd(v, v2));
});

// vAngle :: Number -> Vector
var vAngle = function vAngle(a) {
  return [Math.cos(a), Math.sin(a)];
};

// vAlongAngle :: Number -> Number -> Vector
var vAlongAngle = curry(function (a, r, v) {
  return compose(vAdd(v), vScale(r), vAngle)(a);
});

// vFastDist :: Vector -> Vector -> Number
var vFastDist = curry(function (v, v2) {
  return Math.pow(v2[0] - v[0], 2) + Math.pow(v2[1] - v[1], 2);
});

// vDist :: Vector -> Vector -> Number
var vDist = curry(function (v, v2) {
  return Math.hypot(v2[0] - v[0], v2[1] - v[1]);
});

// vDot :: Vector -> Vector -> Number
var vDot = curry(function (v, v2) {
  return v[0] * v2[0] + v[1] * v2[1];
});

// vPerpDot :: Vector -> Vector -> Number
var vPerpDot = curry(function (v, v2) {
  return v[0] * v2[1] - v[1] * v2[0];
});

// vTriangleArea :: Vector -> Vector -> Vector -> Number
var vTriangleArea = curry(function (a, b, c) {
  return ((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1])) / 2;
});

// vColinear :: Vector -> Vector -> Vector -> bool
var vColinear = curry(function (v0, v1, v2) {
  return vScalarNear(1e-4, vTriangleArea(v0, v1, v2), 0);
});

// vDet :: Matrix -> Number
var vDet = function vDet(m) {
  return m[0] * m[4] - m[3] * m[1];
};

var vec = {
  add: vAdd,
  add3: vAdd3,
  addAll: vAddAll,
  sub: vSub,
  sub3: vSub3,
  subAll: vSubAll,
  mag: vMag,
  normal: vNormal,
  scale: vScale,
  towards: vTowards,
  lerp: vLerp,
  scalarNear: vScalarNear,
  near: vNear,
  clampMag: vClampMag,
  norm: vNorm,
  mId: mId,
  createMatrix: vCreateMatrix,
  transform: vTransform,
  mCompose: mCompose,
  mRotate: mRotate,
  mTranslate: mTranslate,
  mScale: mScale,
  mShear: mShear,
  rotate: vRotate,
  rotatePointAround: vRotatePointAround,
  midpoint: vMidpoint,
  angle: vAngle,
  alongAngle: vAlongAngle,
  fastDist: vFastDist,
  dist: vDist,
  dot: vDot,
  perpdot: vPerpDot,
  triangleArea: vTriangleArea,
  colinear: vColinear,
  det: vDet
};

/* start exports */
exports.default = vec;
exports.vec = vec;
exports.vAdd = vAdd;
exports.vAdd3 = vAdd3;
exports.vAddAll = vAddAll;
exports.vSub = vSub;
exports.vSub3 = vSub3;
exports.vSubAll = vSubAll;
exports.vMag = vMag;
exports.vNormal = vNormal;
exports.vScale = vScale;
exports.vTowards = vTowards;
exports.vLerp = vLerp;
exports.vScalarNear = vScalarNear;
exports.vNear = vNear;
exports.vClampMag = vClampMag;
exports.vNorm = vNorm;
exports.mId = mId;
exports.vCreateMatrix = vCreateMatrix;
exports.vTransform = vTransform;
exports.mCompose = mCompose;
exports.mRotate = mRotate;
exports.mTranslate = mTranslate;
exports.mScale = mScale;
exports.mShear = mShear;
exports.vRotate = vRotate;
exports.vRotatePointAround = vRotatePointAround;
exports.vMidpoint = vMidpoint;
exports.vAngle = vAngle;
exports.vAlongAngle = vAlongAngle;
exports.vFastDist = vFastDist;
exports.vDist = vDist;
exports.vDot = vDot;
exports.vPerpDot = vPerpDot;
exports.vTriangleArea = vTriangleArea;
exports.vColinear = vColinear;
exports.vDet = vDet;
/* end exports */
},{}],2:[function(require,module,exports){
//   Copyright 2019, Robert L. Read
//
//   This file is part of TriadBalance.
//
//   TriadBalance is free software: you can redistribute it and/or modify
//   it under the terms of the GNU General Public License as published by
//   the Free Software Foundation, either version 3 of the License, or
//   (at your option) any later version.
//
//   TriadBalance is distributed in the hope that it will be useful,
//   but WITHOUT ANY WARRANTY; without even the implied warranty of
//   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//   GNU General Public License for more details.
//
//   You should have received a copy of the GNU General Public License
//   along with TriadBalance.  If not, see <https://www.gnu.org/licenses/>.

"use strict";

var m = require("./TriadBalanceMath.js");
var vec = require("../js/vec.module.js");

// The TriadBalanceState is stashed in the svg element object
// given us to insure uniqueness. I use the annoying long name "triad_balance_state"
// specifically to make the chance of name collision very small.

class TriadBalanceState {
  constructor(svg,ccb,lbls,
              twt,w,h,cb,ctc,
              ntu = m.L1,
              s_t_m_b = 7/10,
              fs_r_t_h = 1/20,
              ydpc = 10,
              pu = true) {

    // REQUIRED
    // The SVG HTML ELMENT
    this.SVG_ELT = svg;
    // callback to receive numeric data on click
    // This routine is called ccb(tp,tipi,bal) upon clicks
    // on the SVG elemement.
    // tp = The triangle coordinates where the click occured,
    // tpi = The point on the same line guaranteed to be "in" the triangle
    // bal = The normalized 3-vector representing the attributes.
    this.CLICK_CALLBACK = ccb;
    // An array of 3 titles for the 3 attributes
    this.LABELS = lbls;

    // THESES ARE COMPUTED VALUES
    // The World Triangle coordinates
    this.TRIAD_WORLD_TRIANGLE = twt;
    // The width of the SVG element
    this.W = w;
    // The Height  of the SVG element
    this.H = h;

    // These are convenient storage
    // The most recent "balance vector", a 3-attribute vector
    this.CUR_BALANCE = cb;
    // The most recent click point in 2-dimensional space of the SVG triangle
    this.CUR_TRIANGLE_COORDS = ctc;

    // OPTIONAL
    // Either the L1 or L2 norm (see TriadBalanceMath.js)
    this.NORM_TO_USE = ntu;
    // For confiruation, the size of the font relative to the total height
    this.FONT_SIZE_RATIO_TO_HEIGHT = fs_r_t_h;
    // The percent of the height to lower the orign to create a balanced appearance
    this.Y_DISP_PER_CENT = ydpc;
    // Whether the triangle points up or not;
    this.POINTS_UPWARD = pu;
    // The length of a triangle side to SVG elment size (ratio)
    this.SIDE_TO_MIN_BOUND = s_t_m_b;
  }
  get Hhalf() {
    return this.H/2;
  }
  get Whalf() {
    return this.W/2;
  }
}


// svg is the HTML Element.
// norm is either L1 or L2
function set_norm_to_use(svg,norm) {
  svg.triad_balance_state.NORM_TO_USE = norm;
}

// svg is the HTML Element.
// labels is an array of three strings
function set_labels(svg,labels) {
  svg.triad_balance_state.LABELS = labels;
  render_svg(svg,svg.triad_balance_state.FONT_SIZE_RATIO_TO_HEIGHT);
  rerender_marker(svg,svg.triad_balance_state.CUR_BALANCE);
}

// svg is the HTML Element.
// labels is an array of three strings
// Create an upward pointing triangle

function get_triangle(upward,svg,s_to_m_b = 7/10) {
  let W = svg.clientWidth;
  let H = svg.clientHeight;
  // we compute against whichever dimension is smaller
  var min = Math.min(W,H);

  const TRIANGLE_WIDTH = 1;
  const TRIANGLE_HEIGHT = Math.sqrt(3)/2;

  // This could be a parameter...
  let SIDE_LENGTH_PIXEL = min * s_to_m_b;

  const SIDE_LENGTH_HEIGHT = SIDE_LENGTH_PIXEL * TRIANGLE_HEIGHT;
  const BASE = -(1/3) * SIDE_LENGTH_HEIGHT;

  const UF = upward ? 1 : -1;

  let wtc_vector = [[-SIDE_LENGTH_PIXEL/2,BASE*UF],
                    [SIDE_LENGTH_PIXEL/2,BASE*UF],
                    [0,(BASE+SIDE_LENGTH_HEIGHT)*UF]];
// This is the "shield" formation (Scutum Fidei).
  return wtc_vector;
}

// remove the markers from the svg element (there may be only one or none.)
function clear_markers(svg) {
  var x = document.getElementsByClassName("triad-marker");
  for(var i = x.length -1; i >= 0; i--) {
    x[i].parentNode.removeChild(x[i]);
  }
}

// Graphics systems make y positve point downward, but our virtual triangle space has y upward
function vpy(y) { return -y; }
function vpx(x) { return x; }

// svg is the HTML Element
// bal_vec is the balance vector (a 3-vector in the unit attribute space.)
function rerender_marker(svg,bal_vec) {
  if (bal_vec) {
    // We have to find the current marker and remove it..
    clear_markers(svg);
    let tri_point = m.invertTriadBalance2to3(bal_vec,
                                           svg.triad_balance_state.TRIAD_WORLD_TRIANGLE,
                                           svg.triad_balance_state.NORM_TO_USE);
    let point = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    point.setAttributeNS(null, 'cx', vpx(tri_point[0]));
    point.setAttributeNS(null, 'cy', vpy(tri_point[1]));
    // This value can be overridden in CSS
    point.setAttributeNS(null, 'r', 3);
    point.setAttributeNS(null,"class","triad-marker");
    point.ISMARKER = true;
    svg.appendChild(point);
  }
}

// svg is the HTML Element
// fs_ratio_to_height is the ratio of the font size of the labels to the total height
function render_svg(svg,fs_ratio_to_height) {
  let fs = svg.triad_balance_state.H * fs_ratio_to_height;

  function append_text(svg,id,class_name,x,y,dy,text) {
    var newText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    newText.setAttributeNS(null,"x",x);
    newText.setAttributeNS(null,"y",y);
    newText.setAttributeNS(null,"dy",dy);
    newText.setAttributeNS(null,"font-size",fs);
    newText.setAttributeNS(null,"class",class_name);
    newText.setAttributeNS(null,"id",id);
    newText.appendChild(document.createTextNode(text));
    svg.appendChild(newText);
  }

  // Note: if we wished to depend on jQueryUI or d3, there are other solutions:
  // https://stackoverflow.com/questions/3674265/is-there-an-easy-way-to-clear-an-svg-elements-contents
  while (svg.lastChild) {
    svg.removeChild(svg.lastChild);
  }

  var polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  polygon.setAttributeNS(null,"id","triad-balance-triangle");
  svg.appendChild(polygon);

  for (let i = 0; i < 3; i++) {
    var point = svg.createSVGPoint();
    point.x = vpx(svg.triad_balance_state.TRIAD_WORLD_TRIANGLE[i][0]);
    point.y = vpy(svg.triad_balance_state.TRIAD_WORLD_TRIANGLE[i][1]);
    polygon.points.appendItem(point);
  }

  function render_labels(svg,vertices,d_labels,fs) {
    // This is just what looks good to me, perhaps this should be
    // configurable or stylable.
    let pa = 4; // pixel_adjustment
    let vertical_adjustments = [fs+pa,fs+pa,-(fs/2 + pa)];
    for(let i = 0; i < 3; i++) {
//      console.log("DY",svg.triad_balance_state.POINTS_UPWARD ? vertical_adjustments[i] : -vertical_adjustments[i]+fs/2);
      append_text(svg,"triad-vertex-label-"+i,
                  "triad-vertices-labels",
                  vpx(svg.triad_balance_state.TRIAD_WORLD_TRIANGLE[i][0]),
                  vpy(svg.triad_balance_state.TRIAD_WORLD_TRIANGLE[i][1]),

                  // WARNING: This is somewhat arbitrary.
                  svg.triad_balance_state.POINTS_UPWARD ? vertical_adjustments[i] : -vertical_adjustments[i]+fs/2,
                  d_labels[i]
                 );
    }
  }

  render_labels(svg,svg.triad_balance_state.TRIAD_WORLD_TRIANGLE,
                svg.triad_balance_state.LABELS,
                fs);

  // this is the center of the triangle...
  let origin = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
  origin.setAttributeNS(null, 'cx', vpx(0));
  origin.setAttributeNS(null, 'cy', vpy(0));
  origin.setAttributeNS(null, 'r', 2);
  origin.setAttributeNS(null,"id","triangle_origin");
  svg.appendChild(origin);
}


// This is tricky because click events on an SVG
// depend on which object inside the SVG are hit.
// We don't really want to do that, we have
// created a global triangle space. A solution is to
// use screen coordinates, but only to compute a difference.

// evt is the mouse event
// fs is the font_size
// svg is the html SVG element
// labels is the set of strings
// click_callback is called when a click occurs with the position data
function clicked(evt,fs,svg,labels,click_callback) {
  var br = svg.getBoundingClientRect();
  var x = evt.clientX - br.left;
  var y = evt.clientY - br.top;
  // x and y are in screen coordinates of the
  // SVG ; we need to convert them
  // to the coordinates of our triangle.
  var xc = x + -svg.triad_balance_state.Whalf;

  let oriented_ydpc = (svg.triad_balance_state.POINTS_UPWARD ?
                       svg.triad_balance_state.Y_DISP_PER_CENT :
                       -svg.triad_balance_state.Y_DISP_PER_CENT)
  var yc = -(y + -svg.triad_balance_state.Hhalf
             + -svg.triad_balance_state.H * oriented_ydpc/100.0 );
  // Note, we balance and invert here to make sure we are inside the triangle!
  svg.triad_balance_state.CUR_TRIANGLE_COORDS = [xc,yc];

  svg.triad_balance_state.CUR_BALANCE =
    m.TriadBalance2to3(svg.triad_balance_state.CUR_TRIANGLE_COORDS,
                     svg.triad_balance_state.TRIAD_WORLD_TRIANGLE,
                     svg.triad_balance_state.NORM_TO_USE);

  var tri_point = m.invertTriadBalance2to3(
    svg.triad_balance_state.CUR_BALANCE,
    svg.triad_balance_state.TRIAD_WORLD_TRIANGLE,
    svg.triad_balance_state.NORM_TO_USE);

  rerender_marker(svg,svg.triad_balance_state.CUR_BALANCE);

  click_callback(svg.triad_balance_state.CUR_TRIANGLE_COORDS,
                 tri_point,
                 svg.triad_balance_state.CUR_BALANCE);
}
// svg is the HTML SVG element
// norm_to_use is either L1 or L2
// labels is an array of 3 strings
// click_callback is the callback that send the balance vector back on a click
// fs_ratio_to_height is the ration of the font_size to the height of svg
// s_to_m_b is the ratio of a side of the triangle to the minimum bound of the svg
// ydpc  is the Y displacement percent (downward) to make it look balanced
function initialize_triad_diagram(tbs) {
  tbs.SVG_ELT.triad_balance_state = tbs;

  // We need this as a separate function to handle resize events.
  function setSizeConstants(svg) {
    let W = svg.triad_balance_state.W = svg.clientWidth;
    let H = svg.triad_balance_state.H = svg.clientHeight;
    let Whalf = svg.triad_balance_state.Whalf;
    let Hhalf = svg.triad_balance_state.Hhalf;
    svg.triad_balance_state.TRIAD_WORLD_TRIANGLE =
      get_triangle(svg.triad_balance_state.POINTS_UPWARD,
                   svg,
                   svg.triad_balance_state.SIDE_TO_MIN_BOUND);
    // This is convenient, but makes it hard for the client to
    // use this svg for their own purposes, which is probably okay
    // for this use...
    // Here is were we can adjust the Hhalf value to move the triangle
    // down a bit, I think. However, this will like make us
    // have to make our inverstion functioon formal.
    let oriented_ydpc = (svg.triad_balance_state.POINTS_UPWARD ?
                         svg.triad_balance_state.Y_DISP_PER_CENT :
                         -svg.triad_balance_state.Y_DISP_PER_CENT)

    svg.setAttribute("viewBox",
                     `-${Whalf} -${Hhalf+H*oriented_ydpc/100.0} ${W} ${H}`);
    render_svg(tbs.SVG_ELT,svg.triad_balance_state.FONT_SIZE_RATIO_TO_HEIGHT);
    rerender_marker(tbs.SVG_ELT,svg.triad_balance_state.CUR_BALANCE);
  }

  setSizeConstants(tbs.SVG_ELT);

  tbs.SVG_ELT.addEventListener(
    "click",
    (evt) =>
      clicked(evt,tbs.SVG_ELT.triad_balance_state.FONT_SIZE_RATIO_TO_HEIGHT,
              tbs.SVG_ELT,tbs.LABELS,tbs.CLICK_CALLBACK)
  );

  window.addEventListener(
    "resize",
    (evt) => {
      setSizeConstants(tbs.SVG_ELT);
    });

}

module.exports = {
  vec: vec,
  m: m,
  initialize_triad_diagram: initialize_triad_diagram,
  get_triangle: get_triangle,
  TriadBalanceState: TriadBalanceState,
  set_norm_to_use: set_norm_to_use,
  set_labels: set_labels,
  TriadBalance2to3: m.TriadBalance2to3,
  invertTriadBalance2to3: m.invertTriadBalance2to3
};

console.log(vec);

},{"../js/vec.module.js":1,"./TriadBalanceMath.js":3}],3:[function(require,module,exports){
// Copyright 2019, Robert L. Read
// This file is part of TriadBalance.
//
// TriadBalance is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// TriadBalance is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with TriadBalance.  If not, see <https://www.gnu.org/licenses/>.

"use strict";

var vecModule = require("../js/vec.module.js");

// vec-la-fp places nice names in a member named "vec"
var vec = vecModule.vec;

// TODO: This needs to be scaled!!!
function mean(wtc) {
  return vec.scale(wtc.length,vec.addAll(wtc));
}

// Test that the point is vertically oriented, origin-centered equilateral triangle.
function isCenteredEquilateral(wtc) {
  let d0 = vec.dist(wtc[0],wtc[1]);
  let d1 = vec.dist(wtc[1],wtc[2]);
  let d2 = vec.dist(wtc[2],wtc[0]);

  return vec.near(1e-5,[0,0],mean(wtc))
  // Third point vertical..
    && ((wtc[2][0] == 0) && (wtc[2][1] > 0))
  // equilateral
    && vec.scalarNear(1e-5,d0,d1) && vec.scalarNear(1e-5,d1,d2) && vec.scalarNear(1e-5,d2,d1);
}



// This is a tiny set of routines inspired by vec-la-fp, which
// does not currently handle 3d vectors...a real hero would
// fully extend that package to support 2d and 3d vectors.

let v3Add = function v3Add(a,b) {
  return [a[0]+b[0],a[1]+b[1],a[2]+b[2]];
}
let v3Sub = function v3Sub(a,b) {
  return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];
}
let v3ManhattanDistance = function v3ManhattanDistance(a,b) {
  return Math.abs(a[0]-b[0]) + Math.abs(a[1]-b[1]) + Math.abs(a[2]-b[2]);
}
let v3dist = function v3dist(a,b) {
  return Math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2);
}
let v3mag = function v3mag(v) {
  return Math.sqrt((v[0])**2 + (v[1])**2 + (v[2])**2);
}
let v3scale = function v3scale(sc,v) {
  return [sc*v[0],sc*v[1],sc*v[2]];
}
let v3normalize = function normalize(v) {
  return v3scale( 1/v3c.mag(v),v);
}

var v3c = {
  add: v3Add,
  sub: v3Sub,
  manhattan: v3ManhattanDistance,
  dist: v3dist,
  mag: v3mag,
  scale: v3scale,
  normalize: v3normalize
}



const SQRT3 = Math.sqrt(3);

function GetRayToLineSegmentIntersection(rayOrigin,rayDirection,point1,point2)
{
  // This code from here: https://stackoverflow.com/questions/14307158/how-do-you-check-for-intersection-between-a-line-segment-and-a-line-ray-emanatin
  // Note this routine seems to depend on the chirality of the points; possibly it only counts an approach from one side.
  const rdn = vec.norm(rayDirection);
  const v1 = vec.sub(rayOrigin,point1);
  const v2 = vec.sub(point2,point1);

  const v3 = [-rdn[1],rdn[0]];
  const dot = vec.dot(v2,v3);

  if (vec.scalarNear(1e-5,dot,0))
    return null;

  const t1 = vec.perpdot(v2,v1) / dot;
  const t2 = vec.dot(v1,v3) / dot;

  if (t1 >= 0.0 && (t2 >= 0.0 && t2 <= 1.0)) {
    return [vec.add(rayOrigin,vec.scale(t1,rdn)),t1];
  }
  return null;
}

// This is the fundamental math behind a TriadBalance Diagram.
// I will probably put this in LaTeX soon.
// A balance diagram is a way of choosing a unit vector
// of n dimensions (most usefully 3) from a n-gon.
// If n > 3, it is not possible to complete map all points.
// The fundamental math of a TriadBalance diagram is to convert
// between a point on the 2-dimensional n-gon (the "representation") from
// the "balance" -- a n-dimensional vector.
// Call the function that produces the repesentation from a unit vector
// "r" and the function that produces the balance vector from the respresentation "b".
// Desiderator of these functions are:
// We want them to be inversions of each other.
// We want the center of the representation to map to a balanced vector.
// A representation at the vertex is a vector having a single 1 and the rest zeros.
// As we change the angle betwen the origin and the point in a representation toward a vertex,
// the value of that vertex should increase.
// As we move along such a line, we should not change the relative proportion of the
// other values. (this is vague).
// It should be easy to compute and explain (at least geometrically.)
// I now believe this should allow a "norm" to be passed in
// as a function. I think the L1 norm is probably better than L2
// norm for some functions, but it can be optional.
// It is essential that this function be invertible.

function L1NORM(v) {
  let s = v3c.manhattan([0,0,0],v);
  return v3c.scale(1/s,v);
}
function L2NORM(v) {
  return v3c.normalize(v);
}
function L1LENGTH(v) {
  return v3c.manhattan([0,0,0],v);
}
function L2LENGTH(v) {
  return v3c.mag(v);
}

var L1 = [L1NORM,L1LENGTH];
var L2 = [L2NORM,L2LENGTH];


// Under assumption of an upward facing
// equilateral triangle, return the edge
// intersected by the ray from the origin to tp,
// without dependence on vector libraries.
// The return value is an array:
// empty iff tp is the origin
// containing two values if it is a vertex
// containing one value otherwise.
// The edges are numbered anticlockwise,
// with the zeroeth edge at the bottom.
// If two edges are returned, this routine
// returns them in sorted order.
function eqEdgeAlgebraically(wtc,p) {
  if (vec.scalarNear(1e-5,p[0],0)) {
    if (vec.scalarNear(1e-5,p[1],0)) {
      return [];
    } else if (p[1] > 0) {
      return [1,2];
    } else {
      return [0];
    }
  } else {
    let m = p[1]/p[0];
    let m1 = -SQRT3/3;
    let m2 = SQRT3/3;
    if ((p[0] > 0) && (vec.scalarNear(1e-5,m,m1))) return [0,1];
    if ((p[0] > 0) && (m > m1)) return [1];
    if ((p[0] > 0) && (m < m1)) return [0];

    if ((p[0] < 0) && (vec.scalarNear(1e-5,m,m2))) return [0,2];
    if ((p[0] < 0) && (m < m2)) return [2];
    if ((p[0] < 0) && (m > m2)) return [0];
  }
}


// Here we return the point on the edge
// where the ray from the origin to tp intersects
// the triangle.
// The math here is created on the assumption
// of the triangle being perfectly equilateral with
// the centroid at the origin. This allows us to
// solve simultaneous equations to find the points.
// This is an alternative to vector-based methods
// that are of course in the end simlar, but we take
// advantage of known slopes to make it faster and simpler.
function eqPointOnEdgeAlgebraically(wtc,tp) {
  // we should probably check equilaterality and orientation here
  let es = eqEdgeAlgebraically(wtc,tp);
  if (es.length == 0) return null; // tp is the origin
  if (es.length == 2) { // we hit a vertex, but which one?
    if ((es[0] == 0) && (es[1] == 1)) {
      return wtc[1];
    } else
    if ((es[0] == 0) && (es[1] == 2)) {
      return wtc[0];
    } else
    if ((es[0] == 1) && (es[1] == 2)) {
      return wtc[2];
    }
  } else { // now we do a case split
    let xp = tp[0];
    let yp = tp[1];
    let a = vec.dist(wtc[0],wtc[1]);
    let B = a * SQRT3/6;
    if (vec.scalarNear(1e-5,xp,0)) {
      return (yp > 0) ? wtc[2] : [0,-B];
    }
    let m = yp/xp;
    if (es[0] == 0) {
      return [-B/m,-B];
    } else if (es[0] == 1) {
      let y = a / (3 *(1/SQRT3 + 1/m));
      let x = y / m;
      return [x,y];
    } else if (es[0] == 2) {
      let y = a / (3 *(1/SQRT3 - 1/m));
      let x = y / m;
      return [x,y];
    }
  }
}


function getEdgeAndPoint(wtc,p) {

  // If we are centered, vertical, pointing up, and equilateral,
  // we can use the more efficient algorithm.
  if (isCenteredEquilateral(wtc))
  {
    // this may return two, but we can just take the first
    return [eqEdgeAlgebraically(wtc,p)[0],
            eqPointOnEdgeAlgebraically(wtc,p)];
  }
  else
  {
    var point_on_edge;
    var fe_idx = -1; // index of the first edge we intersect
    for(var i = 0; i < 3 && fe_idx < 0; i++) {
      var r = GetRayToLineSegmentIntersection([0,0],p,wtc[i],wtc[(i+1) % 3]);
      if (r != null) { // if null, the ray did not intersect the edge
        fe_idx = i;
        point_on_edge = r[0]; // The first comp. of return value is intersection
      }
    }
    return [fe_idx,point_on_edge];
  }
}


// tp is a point in the 2-dimensional triangle space
// wtc are the three vertices of an eqilateral triangle whose centroid is the origin
// LXnorm_and_length is a pair of functions to to normalize a vector and compute the length
// return the corresponding 3-vector in the attribute space
function TriadBalance2to3(p,wtc,LXnorm_and_length = L2) {
  let LXnormalize = LXnorm_and_length[0];

  if (vec.scalarNear(1e-5,vec.mag(p),0)) {
    return LXnormalize([1,1,1]);
  }

  // Now we want to do a linear interpolation of how far we are from an edge,
  // but also how far the projection to the edge is between the vertices.
  // We must first decide which edges the line from the orign to p intersects.
  // If it intersects two segments, then it is aimed at a vertex.
  let [fe_idx,point_on_edge] = getEdgeAndPoint(wtc,p);

  // now point_on_edge is a point on edge fe_idx.
  const total_distance_to_edge = vec.dist([0,0],point_on_edge);

  // If the point is outside the triangle, we clamp (truncate if needed)
  // it's length so that it is precisely on the edge.
  const pc = vec.clampMag(0,total_distance_to_edge,p);

  const distance_to_p_o_e = vec.dist(pc,point_on_edge);
  var ratio_p_to_edge =  distance_to_p_o_e/total_distance_to_edge;

  let bal = v3c.scale(ratio_p_to_edge,
                      LXnormalize([1,1,1]));

  // Now the remainder of the contribution
  // to the unit vector should come from the two
  // points on the edge, in linear proportion.
  // These coordinates are fe_idx and (fe_idx+1) % 3.
  const d1 = vec.dist(wtc[fe_idx],point_on_edge);
  const d2 = vec.dist(wtc[(fe_idx+1) % 3],point_on_edge);

  let vs = [0,0,0];
  vs[fe_idx] = d2;
  vs[(fe_idx+1) % 3] = d1;

  let imb = v3c.scale(1 - ratio_p_to_edge,LXnormalize(vs));

  return v3c.add(imb,bal);
}

// vec is a 3-vector in the attribute space
// wtc are the three vertices of an eqilateral triangle whose centroid is the origin
// LXnorm_and_length is a pair of functions to to normalize a vector and compute the length
// return the corresponding 2-vector in the triangle space
function invertTriadBalance2to3(v,wtc,LXnorm_and_length = L2) {
  let length = LXnorm_and_length[1];

  let min = Math.min(Math.min(v[0],v[1]),v[2]);

  let imb = [v[0] - min,v[1] - min,v[2] - min];
  let bal = v3c.sub(v,imb);
  // Now that we have balance, we need to compute it's length,
  // which is dependent on the norm we chose!

  let imb_r = length(imb);
  let bal_r = length(bal);

  // Now we have the ratios. We need to determine the direction.
  // This is a function of the imbalance vector. We can determine
  // which side we are on, and then compute our position along that
  // to determine a point on the triangle, and then multiply by the imb_r
  // to obtain the actual point.
  // At least one value of imb will be zero.
  var from_v,to_v,ratio;
  // the points are OPPOSITE the zero
  // ratio will be the ratio along the triangle edge
  // it requires a little thought to understand which
  // of the other points should be the "from_v" and the "to_v"
  // for the interpolation which occurs later.
  let s = imb[0] + imb[1] + imb[2]; // one of these is always zero.
  if (imb[0] == 0) {
    from_v = wtc[2];
    to_v = wtc[1];
    ratio = imb[1]/s;
  } else if (imb[1] == 0) {
    from_v = wtc[0];
    to_v = wtc[2];
    ratio = imb[2]/s;
  } else if (imb[2] == 0) {
    from_v = wtc[1];
    to_v = wtc[0];
    ratio = imb[0]/s;
  }

  // The point on the triangle is by construction
  // on one edge of the triangle.
  const onTriangle = vec.lerp(from_v,to_v,ratio);
  // now onTriangle is a point on the triangle
  // now, having found that we interpolate a ray
  // to it of length imb_r...
  return vec.lerp([0,0],onTriangle,imb_r);
}

module.exports = {
  TriadBalance2to3: TriadBalance2to3,
  invertTriadBalance2to3: invertTriadBalance2to3,
  eqPointOnEdgeAlgebraically: eqPointOnEdgeAlgebraically,
  eqEdgeAlgebraically: eqEdgeAlgebraically,
  GetRayToLineSegmentIntersection : GetRayToLineSegmentIntersection,
  L1LENGTH: L1LENGTH,
  L2LENGTH: L2LENGTH,
  L1: L1,
  L2: L2};

},{"../js/vec.module.js":1}]},{},[2])(2)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy92ZWMubW9kdWxlLmpzIiwic3JjL1RyaWFkQmFsYW5jZURpYWdyYW0uanMiLCJzcmMvVHJpYWRCYWxhbmNlTWF0aC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2VEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5VUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgeyBhcnIyW2ldID0gYXJyW2ldOyB9IHJldHVybiBhcnIyOyB9IGVsc2UgeyByZXR1cm4gQXJyYXkuZnJvbShhcnIpOyB9IH1cblxuLy8gY3VycnkgOjogKGEgLT4gYiAtPiAuLi4gLT4gbikgLT4gKGEgLT4gYikgLT4gKGIgLT4gLi4uKSAtPiAoLi4uIC0+IG4pXG52YXIgY3VycnkgPSBmdW5jdGlvbiBjdXJyeShmbikge1xuICB2YXIgY3VycmllZCA9IGZ1bmN0aW9uIGN1cnJpZWQoKSB7XG4gICAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgIGFyZ3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgfVxuXG4gICAgaWYgKGFyZ3MubGVuZ3RoID49IGZuLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGZuLmFwcGx5KHVuZGVmaW5lZCwgYXJncyk7XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICBmb3IgKHZhciBfbGVuMiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3NOZXh0ID0gQXJyYXkoX2xlbjIpLCBfa2V5MiA9IDA7IF9rZXkyIDwgX2xlbjI7IF9rZXkyKyspIHtcbiAgICAgICAgYXJnc05leHRbX2tleTJdID0gYXJndW1lbnRzW19rZXkyXTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGN1cnJpZWQuYXBwbHkodW5kZWZpbmVkLCBhcmdzLmNvbmNhdChhcmdzTmV4dCkpO1xuICAgIH07XG4gIH07XG4gIHJldHVybiBjdXJyaWVkO1xufTtcblxuLy8gcGlwZSA6OiAoYSAtPiBiKSAtPiAoYiAtPiAuLi4pIC0+ICguLi4gLT4gbilcbnZhciBwaXBlID0gZnVuY3Rpb24gcGlwZShmbjEpIHtcbiAgZm9yICh2YXIgX2xlbjMgPSBhcmd1bWVudHMubGVuZ3RoLCBmdW5jdGlvbnMgPSBBcnJheShfbGVuMyA+IDEgPyBfbGVuMyAtIDEgOiAwKSwgX2tleTMgPSAxOyBfa2V5MyA8IF9sZW4zOyBfa2V5MysrKSB7XG4gICAgZnVuY3Rpb25zW19rZXkzIC0gMV0gPSBhcmd1bWVudHNbX2tleTNdO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb25zLnJlZHVjZShmdW5jdGlvbiAoYWNjLCBmbikge1xuICAgICAgcmV0dXJuIGZuKGFjYyk7XG4gICAgfSwgZm4xLmFwcGx5KHVuZGVmaW5lZCwgYXJndW1lbnRzKSk7XG4gIH07XG59O1xuXG4vLyBjb21wb3NlIDo6ICguLi4gLT4gbikgLT4gKGIgLT4gLi4uKSAtPiAoYSAtPiBiKVxudmFyIGNvbXBvc2UgPSBmdW5jdGlvbiBjb21wb3NlKCkge1xuICBmb3IgKHZhciBfbGVuNCA9IGFyZ3VtZW50cy5sZW5ndGgsIGZ1bmN0aW9ucyA9IEFycmF5KF9sZW40KSwgX2tleTQgPSAwOyBfa2V5NCA8IF9sZW40OyBfa2V5NCsrKSB7XG4gICAgZnVuY3Rpb25zW19rZXk0XSA9IGFyZ3VtZW50c1tfa2V5NF07XG4gIH1cblxuICByZXR1cm4gcGlwZS5hcHBseSh1bmRlZmluZWQsIF90b0NvbnN1bWFibGVBcnJheShmdW5jdGlvbnMucmV2ZXJzZSgpKSk7XG59O1xuXG4vLyB2QWRkIDo6IFZlY3RvciAtPiBWZWN0b3IgLT4gVmVjdG9yXG52YXIgdkFkZCA9IGN1cnJ5KGZ1bmN0aW9uICh2LCB2Mikge1xuICByZXR1cm4gW3ZbMF0gKyB2MlswXSwgdlsxXSArIHYyWzFdXTtcbn0pO1xuXG4vLyB2QWRkMyA6OiBWZWN0b3IgLT4gVmVjdG9yIC0+IFZlY3RvciAtPiBWZWN0b3JcbnZhciB2QWRkMyA9IGN1cnJ5KGZ1bmN0aW9uICh2LCB2MiwgdjMpIHtcbiAgcmV0dXJuIFt2WzBdICsgdjJbMF0gKyB2M1swXSwgdlsxXSArIHYyWzFdICsgdjNbMV1dO1xufSk7XG5cbi8vIHZBZGRBbGwgOjogW1ZlY3Rvcl0gLT4gVmVjdG9yXG52YXIgdkFkZEFsbCA9IGZ1bmN0aW9uIHZBZGRBbGwodnMpIHtcbiAgcmV0dXJuIHZzLnJlZHVjZSh2QWRkLCBbMCwgMF0pO1xufTtcblxuLy8gdlN1YiA6OiBWZWN0b3IgLT4gVmVjdG9yIC0+IFZlY3RvclxudmFyIHZTdWIgPSBjdXJyeShmdW5jdGlvbiAodiwgdjIpIHtcbiAgcmV0dXJuIFt2WzBdIC0gdjJbMF0sIHZbMV0gLSB2MlsxXV07XG59KTtcblxuLy8gdlN1YjMgOjogVmVjdG9yIC0+IFZlY3RvciAtPiBWZWN0b3IgLT4gVmVjdG9yXG52YXIgdlN1YjMgPSBjdXJyeShmdW5jdGlvbiAodiwgdjIsIHYzKSB7XG4gIHJldHVybiBbdlswXSAtIHYyWzBdIC0gdjNbMF0sIHZbMV0gLSB2MlsxXSAtIHYzWzFdXTtcbn0pO1xuXG4vLyB2U3ViQWxsIDo6IFtWZWN0b3JdIC0+IFZlY3RvclxudmFyIHZTdWJBbGwgPSBmdW5jdGlvbiB2U3ViQWxsKHZzKSB7XG4gIHJldHVybiB2cy5zbGljZSgxKS5yZWR1Y2UodlN1YiwgdnMuc2xpY2UoMCwgMSlbMF0pO1xufTtcblxuLy8gdk1hZyA6OiBWZWN0b3IgLT4gTnVtYmVyXG52YXIgdk1hZyA9IGZ1bmN0aW9uIHZNYWcodikge1xuICByZXR1cm4gTWF0aC5zcXJ0KHZbMF0gKiB2WzBdICsgdlsxXSAqIHZbMV0pO1xufTtcblxuLy8gdk5vcm1hbCA6OiBWZWN0b3IgLT4gVmVjdG9yXG52YXIgdk5vcm1hbCA9IGZ1bmN0aW9uIHZOb3JtYWwodikge1xuICByZXR1cm4gWy12WzFdLCB2WzBdXTtcbn07XG5cbi8vIHZTY2FsZSA6OiBOdW1iZXIgLT4gVmVjdG9yXG52YXIgdlNjYWxlID0gY3VycnkoZnVuY3Rpb24gKHNjLCB2KSB7XG4gIHJldHVybiBbdlswXSAqIHNjLCB2WzFdICogc2NdO1xufSk7XG5cbi8vIHZUb3dhcmRzIDo6IE51bWJlciAtPiBWZWN0b3IgLT4gVmVjdG9yIC0+IFZlY3RvclxudmFyIHZUb3dhcmRzID0gY3VycnkoZnVuY3Rpb24gKHQsIHYxLCB2Mikge1xuICB2YXIgZCA9IHZTdWIodjIsIHYxKTtcbiAgdmFyIHNjID0gdk1hZyhkKSAqIHQ7XG4gIHJldHVybiB2QWRkKHYxLCB2U2NhbGUoc2MsIHZOb3JtKGQpKSk7XG59KTtcblxuLy8gdkxlcnAgOjogVmVjdG9yIC0+IFZlY3RvciAtPiBOdW1iZXIgLT4gVmVjdG9yXG52YXIgdkxlcnAgPSBjdXJyeShmdW5jdGlvbiAodjEsIHYyLCB0KSB7XG4gIHJldHVybiB2VG93YXJkcyh0LCB2MSwgdjIpO1xufSk7XG5cbi8vIHZTY2FsYXJOZWFyIDo6IE51bWJlciAtPiBOdW1iZXIgLT4gTnVtYmVyIC0+IGJvb2xcbnZhciB2U2NhbGFyTmVhciA9IGN1cnJ5KGZ1bmN0aW9uIChlLCBhLCBiKSB7XG4gIHJldHVybiBNYXRoLmFicyhhIC0gYikgPCBlO1xufSk7XG5cbi8vIHZOZWFyIDo6IE51bWJlciAtPiBWZWN0b3IgLT4gVmVjdG9yIC0+IGJvb2xcbnZhciB2TmVhciA9IGN1cnJ5KGZ1bmN0aW9uIChlLCBhLCBiKSB7XG4gIHJldHVybiB2U2NhbGFyTmVhcihlLCBhWzBdLCBiWzBdKSAmJiB2U2NhbGFyTmVhcihlLCBhWzFdLCBiWzFdKTtcbn0pO1xuXG4vLyB2Q2xhbXBNYWcgOjogTnVtYmVyIC0+IE51bWJlciAtPiBWZWN0b3IgLT4gVmVjdG9yXG52YXIgdkNsYW1wTWFnID0gY3VycnkoZnVuY3Rpb24gKG1pbiwgbWF4LCB2KSB7XG4gIHZhciBkID0gdmVjLm1hZyh2KTtcbiAgaWYgKGQgPCBtaW4pIHJldHVybiB2ZWMuc2NhbGUobWluIC8gZCwgdik7ZWxzZSBpZiAoZCA+IG1heCkgcmV0dXJuIHZlYy5zY2FsZShtYXggLyBkLCB2KTtlbHNlIHJldHVybiB2O1xufSk7XG5cbi8vIHZOb3JtIDo6IFZlY3RvciAtPiBWZWN0b3JcbnZhciB2Tm9ybSA9IGZ1bmN0aW9uIHZOb3JtKHYpIHtcbiAgdmFyIG1hZyA9IHZNYWcodik7XG4gIHJldHVybiBbdlswXSAvIG1hZywgdlsxXSAvIG1hZ107XG59O1xuXG4vLyBtSWQgOjogTWF0cml4XG52YXIgbUlkID0gT2JqZWN0LmZyZWV6ZShbMSwgMCwgMCwgMCwgMSwgMCwgMCwgMCwgMV0pO1xuXG4vLyB2Q3JlYXRlTWF0cml4IDo6IE51bWJlciAtPiBOdW1iZXIgLT4gTnVtYmVyIC0+IE51bWJlciAtPiBOdW1iZXIgLT4gTnVtYmVyIC0+IE1hdHJpeFxudmFyIHZDcmVhdGVNYXRyaXggPSBmdW5jdGlvbiB2Q3JlYXRlTWF0cml4KCkge1xuICB2YXIgYSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogMTtcbiAgdmFyIGIgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IDA7XG4gIHZhciBjID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiAwO1xuICB2YXIgZCA9IGFyZ3VtZW50cy5sZW5ndGggPiAzICYmIGFyZ3VtZW50c1szXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzNdIDogMTtcbiAgdmFyIHR4ID0gYXJndW1lbnRzLmxlbmd0aCA+IDQgJiYgYXJndW1lbnRzWzRdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbNF0gOiAwO1xuICB2YXIgdHkgPSBhcmd1bWVudHMubGVuZ3RoID4gNSAmJiBhcmd1bWVudHNbNV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1s1XSA6IDA7XG4gIHJldHVybiBbYSwgYywgdHgsIGIsIGQsIHR5LCAwLCAwLCAxXTtcbn07XG5cbi8vIHZUcmFuc2Zvcm0gOjogTWF0cml4IC0+IFZlY3RvciAtPiBWZWN0b3JcbnZhciB2VHJhbnNmb3JtID0gY3VycnkoZnVuY3Rpb24gKG0sIHYpIHtcbiAgcmV0dXJuIFt2WzBdICogbVswXSArIHZbMV0gKiBtWzFdICsgbVsyXSwgdlswXSAqIG1bM10gKyB2WzFdICogbVs0XSArIG1bNV1dO1xufSk7XG5cbi8vIG1Db21wb3NlIDo6IE1hdHJpeCAtPiBNYXRyaXggLT4gTWF0cml4XG52YXIgbUNvbXBvc2UgPSBjdXJyeShmdW5jdGlvbiAobSwgbTIpIHtcbiAgcmV0dXJuIFttWzBdICogbTJbMF0gKyBtWzFdICogbTJbM10gKyBtWzJdICogbTJbNl0sIG1bMF0gKiBtMlsxXSArIG1bMV0gKiBtMls0XSArIG1bMl0gKiBtMls3XSwgbVswXSAqIG0yWzJdICsgbVsxXSAqIG0yWzVdICsgbVsyXSAqIG0yWzhdLCBtWzNdICogbTJbMF0gKyBtWzRdICogbTJbM10gKyBtWzVdICogbTJbNl0sIG1bM10gKiBtMlsxXSArIG1bNF0gKiBtMls0XSArIG1bNV0gKiBtMls3XSwgbVszXSAqIG0yWzJdICsgbVs0XSAqIG0yWzVdICsgbVs1XSAqIG0yWzhdLCBtWzZdICogbTJbMF0gKyBtWzddICogbTJbM10gKyBtWzhdICogbTJbNl0sIG1bNl0gKiBtMlsxXSArIG1bN10gKiBtMls0XSArIG1bOF0gKiBtMls3XSwgbVs2XSAqIG0yWzJdICsgbVs3XSAqIG0yWzVdICsgbVs4XSAqIG0yWzhdXTtcbn0pO1xuXG4vLyBtUm90YXRlIDo6IE51bWJlciAtPiBNYXRyaXggLT4gTWF0cml4XG52YXIgbVJvdGF0ZSA9IGZ1bmN0aW9uIG1Sb3RhdGUoYSkge1xuICByZXR1cm4gbUNvbXBvc2UoW01hdGguY29zKGEpLCAtTWF0aC5zaW4oYSksIDAsIE1hdGguc2luKGEpLCBNYXRoLmNvcyhhKSwgMCwgMCwgMCwgMV0pO1xufTtcblxuLy8gbVRyYW5zbGF0ZSA6OiBWZWN0b3IgLT4gTWF0cml4IC0+IE1hdHJpeFxudmFyIG1UcmFuc2xhdGUgPSBmdW5jdGlvbiBtVHJhbnNsYXRlKHYpIHtcbiAgcmV0dXJuIG1Db21wb3NlKFsxLCAwLCB2WzBdLCAwLCAxLCB2WzFdLCAwLCAwLCAxXSk7XG59O1xuXG4vLyBtU2NhbGUgOjogVmVjdG9yIC0+IE1hdHJpeCAtPiBNYXRyaXhcbnZhciBtU2NhbGUgPSBmdW5jdGlvbiBtU2NhbGUodikge1xuICByZXR1cm4gbUNvbXBvc2UoW3ZbMF0sIDAsIDAsIDAsIHZbMV0sIDAsIDAsIDAsIDFdKTtcbn07XG5cbi8vIG1TaGVhciA6OiBWZWN0b3IgLT4gTWF0cml4IC0+IE1hdHJpeFxudmFyIG1TaGVhciA9IGZ1bmN0aW9uIG1TaGVhcih2KSB7XG4gIHJldHVybiBtQ29tcG9zZShbMSwgdlswXSwgMCwgdlsxXSwgMSwgMCwgMCwgMCwgMV0pO1xufTtcblxuLy8gdlJvdGF0ZSA6OiBOdW1iZXIgLT4gVmVjdG9yIC0+IFZlY3RvclxudmFyIHZSb3RhdGUgPSBjdXJyeShmdW5jdGlvbiAoYSwgdikge1xuICByZXR1cm4gW3ZbMF0gKiBNYXRoLmNvcyhhKSAtIHZbMV0gKiBNYXRoLnNpbihhKSwgdlswXSAqIE1hdGguc2luKGEpICsgdlsxXSAqIE1hdGguY29zKGEpXTtcbn0pO1xuXG4vLyB2Um90YXRlUG9pbnRBcm91bmQgOjogTnVtYmVyIC0+IFZlY3RvciAtPiBWZWN0b3IgLT4gVmVjdG9yXG52YXIgdlJvdGF0ZVBvaW50QXJvdW5kID0gY3VycnkoZnVuY3Rpb24gKGEsIGNwLCB2KSB7XG4gIHZhciB2MiA9IHZTdWIodiwgY3ApO1xuICByZXR1cm4gdkFkZChjcCwgW3YyWzBdICogTWF0aC5jb3MoYSkgLSB2MlsxXSAqIE1hdGguc2luKGEpLCB2MlswXSAqIE1hdGguc2luKGEpICsgdjJbMV0gKiBNYXRoLmNvcyhhKV0pO1xufSk7XG5cbi8vIHZNaWRwb2ludCA6OiBWZWN0b3IgLT4gVmVjdG9yIC0+IFZlY3RvclxudmFyIHZNaWRwb2ludCA9IGN1cnJ5KGZ1bmN0aW9uICh2LCB2Mikge1xuICByZXR1cm4gdlNjYWxlKDAuNSwgdkFkZCh2LCB2MikpO1xufSk7XG5cbi8vIHZBbmdsZSA6OiBOdW1iZXIgLT4gVmVjdG9yXG52YXIgdkFuZ2xlID0gZnVuY3Rpb24gdkFuZ2xlKGEpIHtcbiAgcmV0dXJuIFtNYXRoLmNvcyhhKSwgTWF0aC5zaW4oYSldO1xufTtcblxuLy8gdkFsb25nQW5nbGUgOjogTnVtYmVyIC0+IE51bWJlciAtPiBWZWN0b3JcbnZhciB2QWxvbmdBbmdsZSA9IGN1cnJ5KGZ1bmN0aW9uIChhLCByLCB2KSB7XG4gIHJldHVybiBjb21wb3NlKHZBZGQodiksIHZTY2FsZShyKSwgdkFuZ2xlKShhKTtcbn0pO1xuXG4vLyB2RmFzdERpc3QgOjogVmVjdG9yIC0+IFZlY3RvciAtPiBOdW1iZXJcbnZhciB2RmFzdERpc3QgPSBjdXJyeShmdW5jdGlvbiAodiwgdjIpIHtcbiAgcmV0dXJuIE1hdGgucG93KHYyWzBdIC0gdlswXSwgMikgKyBNYXRoLnBvdyh2MlsxXSAtIHZbMV0sIDIpO1xufSk7XG5cbi8vIHZEaXN0IDo6IFZlY3RvciAtPiBWZWN0b3IgLT4gTnVtYmVyXG52YXIgdkRpc3QgPSBjdXJyeShmdW5jdGlvbiAodiwgdjIpIHtcbiAgcmV0dXJuIE1hdGguaHlwb3QodjJbMF0gLSB2WzBdLCB2MlsxXSAtIHZbMV0pO1xufSk7XG5cbi8vIHZEb3QgOjogVmVjdG9yIC0+IFZlY3RvciAtPiBOdW1iZXJcbnZhciB2RG90ID0gY3VycnkoZnVuY3Rpb24gKHYsIHYyKSB7XG4gIHJldHVybiB2WzBdICogdjJbMF0gKyB2WzFdICogdjJbMV07XG59KTtcblxuLy8gdlBlcnBEb3QgOjogVmVjdG9yIC0+IFZlY3RvciAtPiBOdW1iZXJcbnZhciB2UGVycERvdCA9IGN1cnJ5KGZ1bmN0aW9uICh2LCB2Mikge1xuICByZXR1cm4gdlswXSAqIHYyWzFdIC0gdlsxXSAqIHYyWzBdO1xufSk7XG5cbi8vIHZUcmlhbmdsZUFyZWEgOjogVmVjdG9yIC0+IFZlY3RvciAtPiBWZWN0b3IgLT4gTnVtYmVyXG52YXIgdlRyaWFuZ2xlQXJlYSA9IGN1cnJ5KGZ1bmN0aW9uIChhLCBiLCBjKSB7XG4gIHJldHVybiAoKGJbMF0gLSBhWzBdKSAqIChjWzFdIC0gYVsxXSkgLSAoY1swXSAtIGFbMF0pICogKGJbMV0gLSBhWzFdKSkgLyAyO1xufSk7XG5cbi8vIHZDb2xpbmVhciA6OiBWZWN0b3IgLT4gVmVjdG9yIC0+IFZlY3RvciAtPiBib29sXG52YXIgdkNvbGluZWFyID0gY3VycnkoZnVuY3Rpb24gKHYwLCB2MSwgdjIpIHtcbiAgcmV0dXJuIHZTY2FsYXJOZWFyKDFlLTQsIHZUcmlhbmdsZUFyZWEodjAsIHYxLCB2MiksIDApO1xufSk7XG5cbi8vIHZEZXQgOjogTWF0cml4IC0+IE51bWJlclxudmFyIHZEZXQgPSBmdW5jdGlvbiB2RGV0KG0pIHtcbiAgcmV0dXJuIG1bMF0gKiBtWzRdIC0gbVszXSAqIG1bMV07XG59O1xuXG52YXIgdmVjID0ge1xuICBhZGQ6IHZBZGQsXG4gIGFkZDM6IHZBZGQzLFxuICBhZGRBbGw6IHZBZGRBbGwsXG4gIHN1YjogdlN1YixcbiAgc3ViMzogdlN1YjMsXG4gIHN1YkFsbDogdlN1YkFsbCxcbiAgbWFnOiB2TWFnLFxuICBub3JtYWw6IHZOb3JtYWwsXG4gIHNjYWxlOiB2U2NhbGUsXG4gIHRvd2FyZHM6IHZUb3dhcmRzLFxuICBsZXJwOiB2TGVycCxcbiAgc2NhbGFyTmVhcjogdlNjYWxhck5lYXIsXG4gIG5lYXI6IHZOZWFyLFxuICBjbGFtcE1hZzogdkNsYW1wTWFnLFxuICBub3JtOiB2Tm9ybSxcbiAgbUlkOiBtSWQsXG4gIGNyZWF0ZU1hdHJpeDogdkNyZWF0ZU1hdHJpeCxcbiAgdHJhbnNmb3JtOiB2VHJhbnNmb3JtLFxuICBtQ29tcG9zZTogbUNvbXBvc2UsXG4gIG1Sb3RhdGU6IG1Sb3RhdGUsXG4gIG1UcmFuc2xhdGU6IG1UcmFuc2xhdGUsXG4gIG1TY2FsZTogbVNjYWxlLFxuICBtU2hlYXI6IG1TaGVhcixcbiAgcm90YXRlOiB2Um90YXRlLFxuICByb3RhdGVQb2ludEFyb3VuZDogdlJvdGF0ZVBvaW50QXJvdW5kLFxuICBtaWRwb2ludDogdk1pZHBvaW50LFxuICBhbmdsZTogdkFuZ2xlLFxuICBhbG9uZ0FuZ2xlOiB2QWxvbmdBbmdsZSxcbiAgZmFzdERpc3Q6IHZGYXN0RGlzdCxcbiAgZGlzdDogdkRpc3QsXG4gIGRvdDogdkRvdCxcbiAgcGVycGRvdDogdlBlcnBEb3QsXG4gIHRyaWFuZ2xlQXJlYTogdlRyaWFuZ2xlQXJlYSxcbiAgY29saW5lYXI6IHZDb2xpbmVhcixcbiAgZGV0OiB2RGV0XG59O1xuXG4vKiBzdGFydCBleHBvcnRzICovXG5leHBvcnRzLmRlZmF1bHQgPSB2ZWM7XG5leHBvcnRzLnZlYyA9IHZlYztcbmV4cG9ydHMudkFkZCA9IHZBZGQ7XG5leHBvcnRzLnZBZGQzID0gdkFkZDM7XG5leHBvcnRzLnZBZGRBbGwgPSB2QWRkQWxsO1xuZXhwb3J0cy52U3ViID0gdlN1YjtcbmV4cG9ydHMudlN1YjMgPSB2U3ViMztcbmV4cG9ydHMudlN1YkFsbCA9IHZTdWJBbGw7XG5leHBvcnRzLnZNYWcgPSB2TWFnO1xuZXhwb3J0cy52Tm9ybWFsID0gdk5vcm1hbDtcbmV4cG9ydHMudlNjYWxlID0gdlNjYWxlO1xuZXhwb3J0cy52VG93YXJkcyA9IHZUb3dhcmRzO1xuZXhwb3J0cy52TGVycCA9IHZMZXJwO1xuZXhwb3J0cy52U2NhbGFyTmVhciA9IHZTY2FsYXJOZWFyO1xuZXhwb3J0cy52TmVhciA9IHZOZWFyO1xuZXhwb3J0cy52Q2xhbXBNYWcgPSB2Q2xhbXBNYWc7XG5leHBvcnRzLnZOb3JtID0gdk5vcm07XG5leHBvcnRzLm1JZCA9IG1JZDtcbmV4cG9ydHMudkNyZWF0ZU1hdHJpeCA9IHZDcmVhdGVNYXRyaXg7XG5leHBvcnRzLnZUcmFuc2Zvcm0gPSB2VHJhbnNmb3JtO1xuZXhwb3J0cy5tQ29tcG9zZSA9IG1Db21wb3NlO1xuZXhwb3J0cy5tUm90YXRlID0gbVJvdGF0ZTtcbmV4cG9ydHMubVRyYW5zbGF0ZSA9IG1UcmFuc2xhdGU7XG5leHBvcnRzLm1TY2FsZSA9IG1TY2FsZTtcbmV4cG9ydHMubVNoZWFyID0gbVNoZWFyO1xuZXhwb3J0cy52Um90YXRlID0gdlJvdGF0ZTtcbmV4cG9ydHMudlJvdGF0ZVBvaW50QXJvdW5kID0gdlJvdGF0ZVBvaW50QXJvdW5kO1xuZXhwb3J0cy52TWlkcG9pbnQgPSB2TWlkcG9pbnQ7XG5leHBvcnRzLnZBbmdsZSA9IHZBbmdsZTtcbmV4cG9ydHMudkFsb25nQW5nbGUgPSB2QWxvbmdBbmdsZTtcbmV4cG9ydHMudkZhc3REaXN0ID0gdkZhc3REaXN0O1xuZXhwb3J0cy52RGlzdCA9IHZEaXN0O1xuZXhwb3J0cy52RG90ID0gdkRvdDtcbmV4cG9ydHMudlBlcnBEb3QgPSB2UGVycERvdDtcbmV4cG9ydHMudlRyaWFuZ2xlQXJlYSA9IHZUcmlhbmdsZUFyZWE7XG5leHBvcnRzLnZDb2xpbmVhciA9IHZDb2xpbmVhcjtcbmV4cG9ydHMudkRldCA9IHZEZXQ7XG4vKiBlbmQgZXhwb3J0cyAqLyIsIi8vICAgQ29weXJpZ2h0IDIwMTksIFJvYmVydCBMLiBSZWFkXG4vL1xuLy8gICBUaGlzIGZpbGUgaXMgcGFydCBvZiBUcmlhZEJhbGFuY2UuXG4vL1xuLy8gICBUcmlhZEJhbGFuY2UgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuLy8gICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuLy8gICB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuLy8gICAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuLy9cbi8vICAgVHJpYWRCYWxhbmNlIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4vLyAgIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4vLyAgIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbi8vICAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbi8vXG4vLyAgIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4vLyAgIGFsb25nIHdpdGggVHJpYWRCYWxhbmNlLiAgSWYgbm90LCBzZWUgPGh0dHBzOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBtID0gcmVxdWlyZShcIi4vVHJpYWRCYWxhbmNlTWF0aC5qc1wiKTtcbnZhciB2ZWMgPSByZXF1aXJlKFwiLi4vanMvdmVjLm1vZHVsZS5qc1wiKTtcblxuLy8gVGhlIFRyaWFkQmFsYW5jZVN0YXRlIGlzIHN0YXNoZWQgaW4gdGhlIHN2ZyBlbGVtZW50IG9iamVjdFxuLy8gZ2l2ZW4gdXMgdG8gaW5zdXJlIHVuaXF1ZW5lc3MuIEkgdXNlIHRoZSBhbm5veWluZyBsb25nIG5hbWUgXCJ0cmlhZF9iYWxhbmNlX3N0YXRlXCJcbi8vIHNwZWNpZmljYWxseSB0byBtYWtlIHRoZSBjaGFuY2Ugb2YgbmFtZSBjb2xsaXNpb24gdmVyeSBzbWFsbC5cblxuY2xhc3MgVHJpYWRCYWxhbmNlU3RhdGUge1xuICBjb25zdHJ1Y3RvcihzdmcsY2NiLGxibHMsXG4gICAgICAgICAgICAgIHR3dCx3LGgsY2IsY3RjLFxuICAgICAgICAgICAgICBudHUgPSBtLkwxLFxuICAgICAgICAgICAgICBzX3RfbV9iID0gNy8xMCxcbiAgICAgICAgICAgICAgZnNfcl90X2ggPSAxLzIwLFxuICAgICAgICAgICAgICB5ZHBjID0gMTAsXG4gICAgICAgICAgICAgIHB1ID0gdHJ1ZSkge1xuXG4gICAgLy8gUkVRVUlSRURcbiAgICAvLyBUaGUgU1ZHIEhUTUwgRUxNRU5UXG4gICAgdGhpcy5TVkdfRUxUID0gc3ZnO1xuICAgIC8vIGNhbGxiYWNrIHRvIHJlY2VpdmUgbnVtZXJpYyBkYXRhIG9uIGNsaWNrXG4gICAgLy8gVGhpcyByb3V0aW5lIGlzIGNhbGxlZCBjY2IodHAsdGlwaSxiYWwpIHVwb24gY2xpY2tzXG4gICAgLy8gb24gdGhlIFNWRyBlbGVtZW1lbnQuXG4gICAgLy8gdHAgPSBUaGUgdHJpYW5nbGUgY29vcmRpbmF0ZXMgd2hlcmUgdGhlIGNsaWNrIG9jY3VyZWQsXG4gICAgLy8gdHBpID0gVGhlIHBvaW50IG9uIHRoZSBzYW1lIGxpbmUgZ3VhcmFudGVlZCB0byBiZSBcImluXCIgdGhlIHRyaWFuZ2xlXG4gICAgLy8gYmFsID0gVGhlIG5vcm1hbGl6ZWQgMy12ZWN0b3IgcmVwcmVzZW50aW5nIHRoZSBhdHRyaWJ1dGVzLlxuICAgIHRoaXMuQ0xJQ0tfQ0FMTEJBQ0sgPSBjY2I7XG4gICAgLy8gQW4gYXJyYXkgb2YgMyB0aXRsZXMgZm9yIHRoZSAzIGF0dHJpYnV0ZXNcbiAgICB0aGlzLkxBQkVMUyA9IGxibHM7XG5cbiAgICAvLyBUSEVTRVMgQVJFIENPTVBVVEVEIFZBTFVFU1xuICAgIC8vIFRoZSBXb3JsZCBUcmlhbmdsZSBjb29yZGluYXRlc1xuICAgIHRoaXMuVFJJQURfV09STERfVFJJQU5HTEUgPSB0d3Q7XG4gICAgLy8gVGhlIHdpZHRoIG9mIHRoZSBTVkcgZWxlbWVudFxuICAgIHRoaXMuVyA9IHc7XG4gICAgLy8gVGhlIEhlaWdodCAgb2YgdGhlIFNWRyBlbGVtZW50XG4gICAgdGhpcy5IID0gaDtcblxuICAgIC8vIFRoZXNlIGFyZSBjb252ZW5pZW50IHN0b3JhZ2VcbiAgICAvLyBUaGUgbW9zdCByZWNlbnQgXCJiYWxhbmNlIHZlY3RvclwiLCBhIDMtYXR0cmlidXRlIHZlY3RvclxuICAgIHRoaXMuQ1VSX0JBTEFOQ0UgPSBjYjtcbiAgICAvLyBUaGUgbW9zdCByZWNlbnQgY2xpY2sgcG9pbnQgaW4gMi1kaW1lbnNpb25hbCBzcGFjZSBvZiB0aGUgU1ZHIHRyaWFuZ2xlXG4gICAgdGhpcy5DVVJfVFJJQU5HTEVfQ09PUkRTID0gY3RjO1xuXG4gICAgLy8gT1BUSU9OQUxcbiAgICAvLyBFaXRoZXIgdGhlIEwxIG9yIEwyIG5vcm0gKHNlZSBUcmlhZEJhbGFuY2VNYXRoLmpzKVxuICAgIHRoaXMuTk9STV9UT19VU0UgPSBudHU7XG4gICAgLy8gRm9yIGNvbmZpcnVhdGlvbiwgdGhlIHNpemUgb2YgdGhlIGZvbnQgcmVsYXRpdmUgdG8gdGhlIHRvdGFsIGhlaWdodFxuICAgIHRoaXMuRk9OVF9TSVpFX1JBVElPX1RPX0hFSUdIVCA9IGZzX3JfdF9oO1xuICAgIC8vIFRoZSBwZXJjZW50IG9mIHRoZSBoZWlnaHQgdG8gbG93ZXIgdGhlIG9yaWduIHRvIGNyZWF0ZSBhIGJhbGFuY2VkIGFwcGVhcmFuY2VcbiAgICB0aGlzLllfRElTUF9QRVJfQ0VOVCA9IHlkcGM7XG4gICAgLy8gV2hldGhlciB0aGUgdHJpYW5nbGUgcG9pbnRzIHVwIG9yIG5vdDtcbiAgICB0aGlzLlBPSU5UU19VUFdBUkQgPSBwdTtcbiAgICAvLyBUaGUgbGVuZ3RoIG9mIGEgdHJpYW5nbGUgc2lkZSB0byBTVkcgZWxtZW50IHNpemUgKHJhdGlvKVxuICAgIHRoaXMuU0lERV9UT19NSU5fQk9VTkQgPSBzX3RfbV9iO1xuICB9XG4gIGdldCBIaGFsZigpIHtcbiAgICByZXR1cm4gdGhpcy5ILzI7XG4gIH1cbiAgZ2V0IFdoYWxmKCkge1xuICAgIHJldHVybiB0aGlzLlcvMjtcbiAgfVxufVxuXG5cbi8vIHN2ZyBpcyB0aGUgSFRNTCBFbGVtZW50LlxuLy8gbm9ybSBpcyBlaXRoZXIgTDEgb3IgTDJcbmZ1bmN0aW9uIHNldF9ub3JtX3RvX3VzZShzdmcsbm9ybSkge1xuICBzdmcudHJpYWRfYmFsYW5jZV9zdGF0ZS5OT1JNX1RPX1VTRSA9IG5vcm07XG59XG5cbi8vIHN2ZyBpcyB0aGUgSFRNTCBFbGVtZW50LlxuLy8gbGFiZWxzIGlzIGFuIGFycmF5IG9mIHRocmVlIHN0cmluZ3NcbmZ1bmN0aW9uIHNldF9sYWJlbHMoc3ZnLGxhYmVscykge1xuICBzdmcudHJpYWRfYmFsYW5jZV9zdGF0ZS5MQUJFTFMgPSBsYWJlbHM7XG4gIHJlbmRlcl9zdmcoc3ZnLHN2Zy50cmlhZF9iYWxhbmNlX3N0YXRlLkZPTlRfU0laRV9SQVRJT19UT19IRUlHSFQpO1xuICByZXJlbmRlcl9tYXJrZXIoc3ZnLHN2Zy50cmlhZF9iYWxhbmNlX3N0YXRlLkNVUl9CQUxBTkNFKTtcbn1cblxuLy8gc3ZnIGlzIHRoZSBIVE1MIEVsZW1lbnQuXG4vLyBsYWJlbHMgaXMgYW4gYXJyYXkgb2YgdGhyZWUgc3RyaW5nc1xuLy8gQ3JlYXRlIGFuIHVwd2FyZCBwb2ludGluZyB0cmlhbmdsZVxuXG5mdW5jdGlvbiBnZXRfdHJpYW5nbGUodXB3YXJkLHN2ZyxzX3RvX21fYiA9IDcvMTApIHtcbiAgbGV0IFcgPSBzdmcuY2xpZW50V2lkdGg7XG4gIGxldCBIID0gc3ZnLmNsaWVudEhlaWdodDtcbiAgLy8gd2UgY29tcHV0ZSBhZ2FpbnN0IHdoaWNoZXZlciBkaW1lbnNpb24gaXMgc21hbGxlclxuICB2YXIgbWluID0gTWF0aC5taW4oVyxIKTtcblxuICBjb25zdCBUUklBTkdMRV9XSURUSCA9IDE7XG4gIGNvbnN0IFRSSUFOR0xFX0hFSUdIVCA9IE1hdGguc3FydCgzKS8yO1xuXG4gIC8vIFRoaXMgY291bGQgYmUgYSBwYXJhbWV0ZXIuLi5cbiAgbGV0IFNJREVfTEVOR1RIX1BJWEVMID0gbWluICogc190b19tX2I7XG5cbiAgY29uc3QgU0lERV9MRU5HVEhfSEVJR0hUID0gU0lERV9MRU5HVEhfUElYRUwgKiBUUklBTkdMRV9IRUlHSFQ7XG4gIGNvbnN0IEJBU0UgPSAtKDEvMykgKiBTSURFX0xFTkdUSF9IRUlHSFQ7XG5cbiAgY29uc3QgVUYgPSB1cHdhcmQgPyAxIDogLTE7XG5cbiAgbGV0IHd0Y192ZWN0b3IgPSBbWy1TSURFX0xFTkdUSF9QSVhFTC8yLEJBU0UqVUZdLFxuICAgICAgICAgICAgICAgICAgICBbU0lERV9MRU5HVEhfUElYRUwvMixCQVNFKlVGXSxcbiAgICAgICAgICAgICAgICAgICAgWzAsKEJBU0UrU0lERV9MRU5HVEhfSEVJR0hUKSpVRl1dO1xuLy8gVGhpcyBpcyB0aGUgXCJzaGllbGRcIiBmb3JtYXRpb24gKFNjdXR1bSBGaWRlaSkuXG4gIHJldHVybiB3dGNfdmVjdG9yO1xufVxuXG4vLyByZW1vdmUgdGhlIG1hcmtlcnMgZnJvbSB0aGUgc3ZnIGVsZW1lbnQgKHRoZXJlIG1heSBiZSBvbmx5IG9uZSBvciBub25lLilcbmZ1bmN0aW9uIGNsZWFyX21hcmtlcnMoc3ZnKSB7XG4gIHZhciB4ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInRyaWFkLW1hcmtlclwiKTtcbiAgZm9yKHZhciBpID0geC5sZW5ndGggLTE7IGkgPj0gMDsgaS0tKSB7XG4gICAgeFtpXS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHhbaV0pO1xuICB9XG59XG5cbi8vIEdyYXBoaWNzIHN5c3RlbXMgbWFrZSB5IHBvc2l0dmUgcG9pbnQgZG93bndhcmQsIGJ1dCBvdXIgdmlydHVhbCB0cmlhbmdsZSBzcGFjZSBoYXMgeSB1cHdhcmRcbmZ1bmN0aW9uIHZweSh5KSB7IHJldHVybiAteTsgfVxuZnVuY3Rpb24gdnB4KHgpIHsgcmV0dXJuIHg7IH1cblxuLy8gc3ZnIGlzIHRoZSBIVE1MIEVsZW1lbnRcbi8vIGJhbF92ZWMgaXMgdGhlIGJhbGFuY2UgdmVjdG9yIChhIDMtdmVjdG9yIGluIHRoZSB1bml0IGF0dHJpYnV0ZSBzcGFjZS4pXG5mdW5jdGlvbiByZXJlbmRlcl9tYXJrZXIoc3ZnLGJhbF92ZWMpIHtcbiAgaWYgKGJhbF92ZWMpIHtcbiAgICAvLyBXZSBoYXZlIHRvIGZpbmQgdGhlIGN1cnJlbnQgbWFya2VyIGFuZCByZW1vdmUgaXQuLlxuICAgIGNsZWFyX21hcmtlcnMoc3ZnKTtcbiAgICBsZXQgdHJpX3BvaW50ID0gbS5pbnZlcnRUcmlhZEJhbGFuY2UydG8zKGJhbF92ZWMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ZnLnRyaWFkX2JhbGFuY2Vfc3RhdGUuVFJJQURfV09STERfVFJJQU5HTEUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ZnLnRyaWFkX2JhbGFuY2Vfc3RhdGUuTk9STV9UT19VU0UpO1xuICAgIGxldCBwb2ludCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsICdjaXJjbGUnKTtcbiAgICBwb2ludC5zZXRBdHRyaWJ1dGVOUyhudWxsLCAnY3gnLCB2cHgodHJpX3BvaW50WzBdKSk7XG4gICAgcG9pbnQuc2V0QXR0cmlidXRlTlMobnVsbCwgJ2N5JywgdnB5KHRyaV9wb2ludFsxXSkpO1xuICAgIC8vIFRoaXMgdmFsdWUgY2FuIGJlIG92ZXJyaWRkZW4gaW4gQ1NTXG4gICAgcG9pbnQuc2V0QXR0cmlidXRlTlMobnVsbCwgJ3InLCAzKTtcbiAgICBwb2ludC5zZXRBdHRyaWJ1dGVOUyhudWxsLFwiY2xhc3NcIixcInRyaWFkLW1hcmtlclwiKTtcbiAgICBwb2ludC5JU01BUktFUiA9IHRydWU7XG4gICAgc3ZnLmFwcGVuZENoaWxkKHBvaW50KTtcbiAgfVxufVxuXG4vLyBzdmcgaXMgdGhlIEhUTUwgRWxlbWVudFxuLy8gZnNfcmF0aW9fdG9faGVpZ2h0IGlzIHRoZSByYXRpbyBvZiB0aGUgZm9udCBzaXplIG9mIHRoZSBsYWJlbHMgdG8gdGhlIHRvdGFsIGhlaWdodFxuZnVuY3Rpb24gcmVuZGVyX3N2ZyhzdmcsZnNfcmF0aW9fdG9faGVpZ2h0KSB7XG4gIGxldCBmcyA9IHN2Zy50cmlhZF9iYWxhbmNlX3N0YXRlLkggKiBmc19yYXRpb190b19oZWlnaHQ7XG5cbiAgZnVuY3Rpb24gYXBwZW5kX3RleHQoc3ZnLGlkLGNsYXNzX25hbWUseCx5LGR5LHRleHQpIHtcbiAgICB2YXIgbmV3VGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUygnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCAndGV4dCcpO1xuICAgIG5ld1RleHQuc2V0QXR0cmlidXRlTlMobnVsbCxcInhcIix4KTtcbiAgICBuZXdUZXh0LnNldEF0dHJpYnV0ZU5TKG51bGwsXCJ5XCIseSk7XG4gICAgbmV3VGV4dC5zZXRBdHRyaWJ1dGVOUyhudWxsLFwiZHlcIixkeSk7XG4gICAgbmV3VGV4dC5zZXRBdHRyaWJ1dGVOUyhudWxsLFwiZm9udC1zaXplXCIsZnMpO1xuICAgIG5ld1RleHQuc2V0QXR0cmlidXRlTlMobnVsbCxcImNsYXNzXCIsY2xhc3NfbmFtZSk7XG4gICAgbmV3VGV4dC5zZXRBdHRyaWJ1dGVOUyhudWxsLFwiaWRcIixpZCk7XG4gICAgbmV3VGV4dC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0ZXh0KSk7XG4gICAgc3ZnLmFwcGVuZENoaWxkKG5ld1RleHQpO1xuICB9XG5cbiAgLy8gTm90ZTogaWYgd2Ugd2lzaGVkIHRvIGRlcGVuZCBvbiBqUXVlcnlVSSBvciBkMywgdGhlcmUgYXJlIG90aGVyIHNvbHV0aW9uczpcbiAgLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMzY3NDI2NS9pcy10aGVyZS1hbi1lYXN5LXdheS10by1jbGVhci1hbi1zdmctZWxlbWVudHMtY29udGVudHNcbiAgd2hpbGUgKHN2Zy5sYXN0Q2hpbGQpIHtcbiAgICBzdmcucmVtb3ZlQ2hpbGQoc3ZnLmxhc3RDaGlsZCk7XG4gIH1cblxuICB2YXIgcG9seWdvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwicG9seWdvblwiKTtcbiAgcG9seWdvbi5zZXRBdHRyaWJ1dGVOUyhudWxsLFwiaWRcIixcInRyaWFkLWJhbGFuY2UtdHJpYW5nbGVcIik7XG4gIHN2Zy5hcHBlbmRDaGlsZChwb2x5Z29uKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgIHZhciBwb2ludCA9IHN2Zy5jcmVhdGVTVkdQb2ludCgpO1xuICAgIHBvaW50LnggPSB2cHgoc3ZnLnRyaWFkX2JhbGFuY2Vfc3RhdGUuVFJJQURfV09STERfVFJJQU5HTEVbaV1bMF0pO1xuICAgIHBvaW50LnkgPSB2cHkoc3ZnLnRyaWFkX2JhbGFuY2Vfc3RhdGUuVFJJQURfV09STERfVFJJQU5HTEVbaV1bMV0pO1xuICAgIHBvbHlnb24ucG9pbnRzLmFwcGVuZEl0ZW0ocG9pbnQpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVuZGVyX2xhYmVscyhzdmcsdmVydGljZXMsZF9sYWJlbHMsZnMpIHtcbiAgICAvLyBUaGlzIGlzIGp1c3Qgd2hhdCBsb29rcyBnb29kIHRvIG1lLCBwZXJoYXBzIHRoaXMgc2hvdWxkIGJlXG4gICAgLy8gY29uZmlndXJhYmxlIG9yIHN0eWxhYmxlLlxuICAgIGxldCBwYSA9IDQ7IC8vIHBpeGVsX2FkanVzdG1lbnRcbiAgICBsZXQgdmVydGljYWxfYWRqdXN0bWVudHMgPSBbZnMrcGEsZnMrcGEsLShmcy8yICsgcGEpXTtcbiAgICBmb3IobGV0IGkgPSAwOyBpIDwgMzsgaSsrKSB7XG4vLyAgICAgIGNvbnNvbGUubG9nKFwiRFlcIixzdmcudHJpYWRfYmFsYW5jZV9zdGF0ZS5QT0lOVFNfVVBXQVJEID8gdmVydGljYWxfYWRqdXN0bWVudHNbaV0gOiAtdmVydGljYWxfYWRqdXN0bWVudHNbaV0rZnMvMik7XG4gICAgICBhcHBlbmRfdGV4dChzdmcsXCJ0cmlhZC12ZXJ0ZXgtbGFiZWwtXCIraSxcbiAgICAgICAgICAgICAgICAgIFwidHJpYWQtdmVydGljZXMtbGFiZWxzXCIsXG4gICAgICAgICAgICAgICAgICB2cHgoc3ZnLnRyaWFkX2JhbGFuY2Vfc3RhdGUuVFJJQURfV09STERfVFJJQU5HTEVbaV1bMF0pLFxuICAgICAgICAgICAgICAgICAgdnB5KHN2Zy50cmlhZF9iYWxhbmNlX3N0YXRlLlRSSUFEX1dPUkxEX1RSSUFOR0xFW2ldWzFdKSxcblxuICAgICAgICAgICAgICAgICAgLy8gV0FSTklORzogVGhpcyBpcyBzb21ld2hhdCBhcmJpdHJhcnkuXG4gICAgICAgICAgICAgICAgICBzdmcudHJpYWRfYmFsYW5jZV9zdGF0ZS5QT0lOVFNfVVBXQVJEID8gdmVydGljYWxfYWRqdXN0bWVudHNbaV0gOiAtdmVydGljYWxfYWRqdXN0bWVudHNbaV0rZnMvMixcbiAgICAgICAgICAgICAgICAgIGRfbGFiZWxzW2ldXG4gICAgICAgICAgICAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyX2xhYmVscyhzdmcsc3ZnLnRyaWFkX2JhbGFuY2Vfc3RhdGUuVFJJQURfV09STERfVFJJQU5HTEUsXG4gICAgICAgICAgICAgICAgc3ZnLnRyaWFkX2JhbGFuY2Vfc3RhdGUuTEFCRUxTLFxuICAgICAgICAgICAgICAgIGZzKTtcblxuICAvLyB0aGlzIGlzIHRoZSBjZW50ZXIgb2YgdGhlIHRyaWFuZ2xlLi4uXG4gIGxldCBvcmlnaW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCAnY2lyY2xlJyk7XG4gIG9yaWdpbi5zZXRBdHRyaWJ1dGVOUyhudWxsLCAnY3gnLCB2cHgoMCkpO1xuICBvcmlnaW4uc2V0QXR0cmlidXRlTlMobnVsbCwgJ2N5JywgdnB5KDApKTtcbiAgb3JpZ2luLnNldEF0dHJpYnV0ZU5TKG51bGwsICdyJywgMik7XG4gIG9yaWdpbi5zZXRBdHRyaWJ1dGVOUyhudWxsLFwiaWRcIixcInRyaWFuZ2xlX29yaWdpblwiKTtcbiAgc3ZnLmFwcGVuZENoaWxkKG9yaWdpbik7XG59XG5cblxuLy8gVGhpcyBpcyB0cmlja3kgYmVjYXVzZSBjbGljayBldmVudHMgb24gYW4gU1ZHXG4vLyBkZXBlbmQgb24gd2hpY2ggb2JqZWN0IGluc2lkZSB0aGUgU1ZHIGFyZSBoaXQuXG4vLyBXZSBkb24ndCByZWFsbHkgd2FudCB0byBkbyB0aGF0LCB3ZSBoYXZlXG4vLyBjcmVhdGVkIGEgZ2xvYmFsIHRyaWFuZ2xlIHNwYWNlLiBBIHNvbHV0aW9uIGlzIHRvXG4vLyB1c2Ugc2NyZWVuIGNvb3JkaW5hdGVzLCBidXQgb25seSB0byBjb21wdXRlIGEgZGlmZmVyZW5jZS5cblxuLy8gZXZ0IGlzIHRoZSBtb3VzZSBldmVudFxuLy8gZnMgaXMgdGhlIGZvbnRfc2l6ZVxuLy8gc3ZnIGlzIHRoZSBodG1sIFNWRyBlbGVtZW50XG4vLyBsYWJlbHMgaXMgdGhlIHNldCBvZiBzdHJpbmdzXG4vLyBjbGlja19jYWxsYmFjayBpcyBjYWxsZWQgd2hlbiBhIGNsaWNrIG9jY3VycyB3aXRoIHRoZSBwb3NpdGlvbiBkYXRhXG5mdW5jdGlvbiBjbGlja2VkKGV2dCxmcyxzdmcsbGFiZWxzLGNsaWNrX2NhbGxiYWNrKSB7XG4gIHZhciBiciA9IHN2Zy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgdmFyIHggPSBldnQuY2xpZW50WCAtIGJyLmxlZnQ7XG4gIHZhciB5ID0gZXZ0LmNsaWVudFkgLSBici50b3A7XG4gIC8vIHggYW5kIHkgYXJlIGluIHNjcmVlbiBjb29yZGluYXRlcyBvZiB0aGVcbiAgLy8gU1ZHIDsgd2UgbmVlZCB0byBjb252ZXJ0IHRoZW1cbiAgLy8gdG8gdGhlIGNvb3JkaW5hdGVzIG9mIG91ciB0cmlhbmdsZS5cbiAgdmFyIHhjID0geCArIC1zdmcudHJpYWRfYmFsYW5jZV9zdGF0ZS5XaGFsZjtcblxuICBsZXQgb3JpZW50ZWRfeWRwYyA9IChzdmcudHJpYWRfYmFsYW5jZV9zdGF0ZS5QT0lOVFNfVVBXQVJEID9cbiAgICAgICAgICAgICAgICAgICAgICAgc3ZnLnRyaWFkX2JhbGFuY2Vfc3RhdGUuWV9ESVNQX1BFUl9DRU5UIDpcbiAgICAgICAgICAgICAgICAgICAgICAgLXN2Zy50cmlhZF9iYWxhbmNlX3N0YXRlLllfRElTUF9QRVJfQ0VOVClcbiAgdmFyIHljID0gLSh5ICsgLXN2Zy50cmlhZF9iYWxhbmNlX3N0YXRlLkhoYWxmXG4gICAgICAgICAgICAgKyAtc3ZnLnRyaWFkX2JhbGFuY2Vfc3RhdGUuSCAqIG9yaWVudGVkX3lkcGMvMTAwLjAgKTtcbiAgLy8gTm90ZSwgd2UgYmFsYW5jZSBhbmQgaW52ZXJ0IGhlcmUgdG8gbWFrZSBzdXJlIHdlIGFyZSBpbnNpZGUgdGhlIHRyaWFuZ2xlIVxuICBzdmcudHJpYWRfYmFsYW5jZV9zdGF0ZS5DVVJfVFJJQU5HTEVfQ09PUkRTID0gW3hjLHljXTtcblxuICBzdmcudHJpYWRfYmFsYW5jZV9zdGF0ZS5DVVJfQkFMQU5DRSA9XG4gICAgbS5UcmlhZEJhbGFuY2UydG8zKHN2Zy50cmlhZF9iYWxhbmNlX3N0YXRlLkNVUl9UUklBTkdMRV9DT09SRFMsXG4gICAgICAgICAgICAgICAgICAgICBzdmcudHJpYWRfYmFsYW5jZV9zdGF0ZS5UUklBRF9XT1JMRF9UUklBTkdMRSxcbiAgICAgICAgICAgICAgICAgICAgIHN2Zy50cmlhZF9iYWxhbmNlX3N0YXRlLk5PUk1fVE9fVVNFKTtcblxuICB2YXIgdHJpX3BvaW50ID0gbS5pbnZlcnRUcmlhZEJhbGFuY2UydG8zKFxuICAgIHN2Zy50cmlhZF9iYWxhbmNlX3N0YXRlLkNVUl9CQUxBTkNFLFxuICAgIHN2Zy50cmlhZF9iYWxhbmNlX3N0YXRlLlRSSUFEX1dPUkxEX1RSSUFOR0xFLFxuICAgIHN2Zy50cmlhZF9iYWxhbmNlX3N0YXRlLk5PUk1fVE9fVVNFKTtcblxuICByZXJlbmRlcl9tYXJrZXIoc3ZnLHN2Zy50cmlhZF9iYWxhbmNlX3N0YXRlLkNVUl9CQUxBTkNFKTtcblxuICBjbGlja19jYWxsYmFjayhzdmcudHJpYWRfYmFsYW5jZV9zdGF0ZS5DVVJfVFJJQU5HTEVfQ09PUkRTLFxuICAgICAgICAgICAgICAgICB0cmlfcG9pbnQsXG4gICAgICAgICAgICAgICAgIHN2Zy50cmlhZF9iYWxhbmNlX3N0YXRlLkNVUl9CQUxBTkNFKTtcbn1cbi8vIHN2ZyBpcyB0aGUgSFRNTCBTVkcgZWxlbWVudFxuLy8gbm9ybV90b191c2UgaXMgZWl0aGVyIEwxIG9yIEwyXG4vLyBsYWJlbHMgaXMgYW4gYXJyYXkgb2YgMyBzdHJpbmdzXG4vLyBjbGlja19jYWxsYmFjayBpcyB0aGUgY2FsbGJhY2sgdGhhdCBzZW5kIHRoZSBiYWxhbmNlIHZlY3RvciBiYWNrIG9uIGEgY2xpY2tcbi8vIGZzX3JhdGlvX3RvX2hlaWdodCBpcyB0aGUgcmF0aW9uIG9mIHRoZSBmb250X3NpemUgdG8gdGhlIGhlaWdodCBvZiBzdmdcbi8vIHNfdG9fbV9iIGlzIHRoZSByYXRpbyBvZiBhIHNpZGUgb2YgdGhlIHRyaWFuZ2xlIHRvIHRoZSBtaW5pbXVtIGJvdW5kIG9mIHRoZSBzdmdcbi8vIHlkcGMgIGlzIHRoZSBZIGRpc3BsYWNlbWVudCBwZXJjZW50IChkb3dud2FyZCkgdG8gbWFrZSBpdCBsb29rIGJhbGFuY2VkXG5mdW5jdGlvbiBpbml0aWFsaXplX3RyaWFkX2RpYWdyYW0odGJzKSB7XG4gIHRicy5TVkdfRUxULnRyaWFkX2JhbGFuY2Vfc3RhdGUgPSB0YnM7XG5cbiAgLy8gV2UgbmVlZCB0aGlzIGFzIGEgc2VwYXJhdGUgZnVuY3Rpb24gdG8gaGFuZGxlIHJlc2l6ZSBldmVudHMuXG4gIGZ1bmN0aW9uIHNldFNpemVDb25zdGFudHMoc3ZnKSB7XG4gICAgbGV0IFcgPSBzdmcudHJpYWRfYmFsYW5jZV9zdGF0ZS5XID0gc3ZnLmNsaWVudFdpZHRoO1xuICAgIGxldCBIID0gc3ZnLnRyaWFkX2JhbGFuY2Vfc3RhdGUuSCA9IHN2Zy5jbGllbnRIZWlnaHQ7XG4gICAgbGV0IFdoYWxmID0gc3ZnLnRyaWFkX2JhbGFuY2Vfc3RhdGUuV2hhbGY7XG4gICAgbGV0IEhoYWxmID0gc3ZnLnRyaWFkX2JhbGFuY2Vfc3RhdGUuSGhhbGY7XG4gICAgc3ZnLnRyaWFkX2JhbGFuY2Vfc3RhdGUuVFJJQURfV09STERfVFJJQU5HTEUgPVxuICAgICAgZ2V0X3RyaWFuZ2xlKHN2Zy50cmlhZF9iYWxhbmNlX3N0YXRlLlBPSU5UU19VUFdBUkQsXG4gICAgICAgICAgICAgICAgICAgc3ZnLFxuICAgICAgICAgICAgICAgICAgIHN2Zy50cmlhZF9iYWxhbmNlX3N0YXRlLlNJREVfVE9fTUlOX0JPVU5EKTtcbiAgICAvLyBUaGlzIGlzIGNvbnZlbmllbnQsIGJ1dCBtYWtlcyBpdCBoYXJkIGZvciB0aGUgY2xpZW50IHRvXG4gICAgLy8gdXNlIHRoaXMgc3ZnIGZvciB0aGVpciBvd24gcHVycG9zZXMsIHdoaWNoIGlzIHByb2JhYmx5IG9rYXlcbiAgICAvLyBmb3IgdGhpcyB1c2UuLi5cbiAgICAvLyBIZXJlIGlzIHdlcmUgd2UgY2FuIGFkanVzdCB0aGUgSGhhbGYgdmFsdWUgdG8gbW92ZSB0aGUgdHJpYW5nbGVcbiAgICAvLyBkb3duIGEgYml0LCBJIHRoaW5rLiBIb3dldmVyLCB0aGlzIHdpbGwgbGlrZSBtYWtlIHVzXG4gICAgLy8gaGF2ZSB0byBtYWtlIG91ciBpbnZlcnN0aW9uIGZ1bmN0aW9vbiBmb3JtYWwuXG4gICAgbGV0IG9yaWVudGVkX3lkcGMgPSAoc3ZnLnRyaWFkX2JhbGFuY2Vfc3RhdGUuUE9JTlRTX1VQV0FSRCA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgc3ZnLnRyaWFkX2JhbGFuY2Vfc3RhdGUuWV9ESVNQX1BFUl9DRU5UIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAtc3ZnLnRyaWFkX2JhbGFuY2Vfc3RhdGUuWV9ESVNQX1BFUl9DRU5UKVxuXG4gICAgc3ZnLnNldEF0dHJpYnV0ZShcInZpZXdCb3hcIixcbiAgICAgICAgICAgICAgICAgICAgIGAtJHtXaGFsZn0gLSR7SGhhbGYrSCpvcmllbnRlZF95ZHBjLzEwMC4wfSAke1d9ICR7SH1gKTtcbiAgICByZW5kZXJfc3ZnKHRicy5TVkdfRUxULHN2Zy50cmlhZF9iYWxhbmNlX3N0YXRlLkZPTlRfU0laRV9SQVRJT19UT19IRUlHSFQpO1xuICAgIHJlcmVuZGVyX21hcmtlcih0YnMuU1ZHX0VMVCxzdmcudHJpYWRfYmFsYW5jZV9zdGF0ZS5DVVJfQkFMQU5DRSk7XG4gIH1cblxuICBzZXRTaXplQ29uc3RhbnRzKHRicy5TVkdfRUxUKTtcblxuICB0YnMuU1ZHX0VMVC5hZGRFdmVudExpc3RlbmVyKFxuICAgIFwiY2xpY2tcIixcbiAgICAoZXZ0KSA9PlxuICAgICAgY2xpY2tlZChldnQsdGJzLlNWR19FTFQudHJpYWRfYmFsYW5jZV9zdGF0ZS5GT05UX1NJWkVfUkFUSU9fVE9fSEVJR0hULFxuICAgICAgICAgICAgICB0YnMuU1ZHX0VMVCx0YnMuTEFCRUxTLHRicy5DTElDS19DQUxMQkFDSylcbiAgKTtcblxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICBcInJlc2l6ZVwiLFxuICAgIChldnQpID0+IHtcbiAgICAgIHNldFNpemVDb25zdGFudHModGJzLlNWR19FTFQpO1xuICAgIH0pO1xuXG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICB2ZWM6IHZlYyxcbiAgbTogbSxcbiAgaW5pdGlhbGl6ZV90cmlhZF9kaWFncmFtOiBpbml0aWFsaXplX3RyaWFkX2RpYWdyYW0sXG4gIGdldF90cmlhbmdsZTogZ2V0X3RyaWFuZ2xlLFxuICBUcmlhZEJhbGFuY2VTdGF0ZTogVHJpYWRCYWxhbmNlU3RhdGUsXG4gIHNldF9ub3JtX3RvX3VzZTogc2V0X25vcm1fdG9fdXNlLFxuICBzZXRfbGFiZWxzOiBzZXRfbGFiZWxzLFxuICBUcmlhZEJhbGFuY2UydG8zOiBtLlRyaWFkQmFsYW5jZTJ0bzMsXG4gIGludmVydFRyaWFkQmFsYW5jZTJ0bzM6IG0uaW52ZXJ0VHJpYWRCYWxhbmNlMnRvM1xufTtcblxuY29uc29sZS5sb2codmVjKTtcbiIsIi8vIENvcHlyaWdodCAyMDE5LCBSb2JlcnQgTC4gUmVhZFxuLy8gVGhpcyBmaWxlIGlzIHBhcnQgb2YgVHJpYWRCYWxhbmNlLlxuLy9cbi8vIFRyaWFkQmFsYW5jZSBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4vLyBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuLy8gdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3Jcbi8vIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4vL1xuLy8gVHJpYWRCYWxhbmNlIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4vLyBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuLy8gTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuLy8gR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbi8vXG4vLyBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuLy8gYWxvbmcgd2l0aCBUcmlhZEJhbGFuY2UuICBJZiBub3QsIHNlZSA8aHR0cHM6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIHZlY01vZHVsZSA9IHJlcXVpcmUoXCIuLi9qcy92ZWMubW9kdWxlLmpzXCIpO1xuXG4vLyB2ZWMtbGEtZnAgcGxhY2VzIG5pY2UgbmFtZXMgaW4gYSBtZW1iZXIgbmFtZWQgXCJ2ZWNcIlxudmFyIHZlYyA9IHZlY01vZHVsZS52ZWM7XG5cbi8vIFRPRE86IFRoaXMgbmVlZHMgdG8gYmUgc2NhbGVkISEhXG5mdW5jdGlvbiBtZWFuKHd0Yykge1xuICByZXR1cm4gdmVjLnNjYWxlKHd0Yy5sZW5ndGgsdmVjLmFkZEFsbCh3dGMpKTtcbn1cblxuLy8gVGVzdCB0aGF0IHRoZSBwb2ludCBpcyB2ZXJ0aWNhbGx5IG9yaWVudGVkLCBvcmlnaW4tY2VudGVyZWQgZXF1aWxhdGVyYWwgdHJpYW5nbGUuXG5mdW5jdGlvbiBpc0NlbnRlcmVkRXF1aWxhdGVyYWwod3RjKSB7XG4gIGxldCBkMCA9IHZlYy5kaXN0KHd0Y1swXSx3dGNbMV0pO1xuICBsZXQgZDEgPSB2ZWMuZGlzdCh3dGNbMV0sd3RjWzJdKTtcbiAgbGV0IGQyID0gdmVjLmRpc3Qod3RjWzJdLHd0Y1swXSk7XG5cbiAgcmV0dXJuIHZlYy5uZWFyKDFlLTUsWzAsMF0sbWVhbih3dGMpKVxuICAvLyBUaGlyZCBwb2ludCB2ZXJ0aWNhbC4uXG4gICAgJiYgKCh3dGNbMl1bMF0gPT0gMCkgJiYgKHd0Y1syXVsxXSA+IDApKVxuICAvLyBlcXVpbGF0ZXJhbFxuICAgICYmIHZlYy5zY2FsYXJOZWFyKDFlLTUsZDAsZDEpICYmIHZlYy5zY2FsYXJOZWFyKDFlLTUsZDEsZDIpICYmIHZlYy5zY2FsYXJOZWFyKDFlLTUsZDIsZDEpO1xufVxuXG5cblxuLy8gVGhpcyBpcyBhIHRpbnkgc2V0IG9mIHJvdXRpbmVzIGluc3BpcmVkIGJ5IHZlYy1sYS1mcCwgd2hpY2hcbi8vIGRvZXMgbm90IGN1cnJlbnRseSBoYW5kbGUgM2QgdmVjdG9ycy4uLmEgcmVhbCBoZXJvIHdvdWxkXG4vLyBmdWxseSBleHRlbmQgdGhhdCBwYWNrYWdlIHRvIHN1cHBvcnQgMmQgYW5kIDNkIHZlY3RvcnMuXG5cbmxldCB2M0FkZCA9IGZ1bmN0aW9uIHYzQWRkKGEsYikge1xuICByZXR1cm4gW2FbMF0rYlswXSxhWzFdK2JbMV0sYVsyXStiWzJdXTtcbn1cbmxldCB2M1N1YiA9IGZ1bmN0aW9uIHYzU3ViKGEsYikge1xuICByZXR1cm4gW2FbMF0tYlswXSxhWzFdLWJbMV0sYVsyXS1iWzJdXTtcbn1cbmxldCB2M01hbmhhdHRhbkRpc3RhbmNlID0gZnVuY3Rpb24gdjNNYW5oYXR0YW5EaXN0YW5jZShhLGIpIHtcbiAgcmV0dXJuIE1hdGguYWJzKGFbMF0tYlswXSkgKyBNYXRoLmFicyhhWzFdLWJbMV0pICsgTWF0aC5hYnMoYVsyXS1iWzJdKTtcbn1cbmxldCB2M2Rpc3QgPSBmdW5jdGlvbiB2M2Rpc3QoYSxiKSB7XG4gIHJldHVybiBNYXRoLnNxcnQoKGFbMF0tYlswXSkqKjIgKyAoYVsxXS1iWzFdKSoqMiArIChhWzJdLWJbMl0pKioyKTtcbn1cbmxldCB2M21hZyA9IGZ1bmN0aW9uIHYzbWFnKHYpIHtcbiAgcmV0dXJuIE1hdGguc3FydCgodlswXSkqKjIgKyAodlsxXSkqKjIgKyAodlsyXSkqKjIpO1xufVxubGV0IHYzc2NhbGUgPSBmdW5jdGlvbiB2M3NjYWxlKHNjLHYpIHtcbiAgcmV0dXJuIFtzYyp2WzBdLHNjKnZbMV0sc2MqdlsyXV07XG59XG5sZXQgdjNub3JtYWxpemUgPSBmdW5jdGlvbiBub3JtYWxpemUodikge1xuICByZXR1cm4gdjNzY2FsZSggMS92M2MubWFnKHYpLHYpO1xufVxuXG52YXIgdjNjID0ge1xuICBhZGQ6IHYzQWRkLFxuICBzdWI6IHYzU3ViLFxuICBtYW5oYXR0YW46IHYzTWFuaGF0dGFuRGlzdGFuY2UsXG4gIGRpc3Q6IHYzZGlzdCxcbiAgbWFnOiB2M21hZyxcbiAgc2NhbGU6IHYzc2NhbGUsXG4gIG5vcm1hbGl6ZTogdjNub3JtYWxpemVcbn1cblxuXG5cbmNvbnN0IFNRUlQzID0gTWF0aC5zcXJ0KDMpO1xuXG5mdW5jdGlvbiBHZXRSYXlUb0xpbmVTZWdtZW50SW50ZXJzZWN0aW9uKHJheU9yaWdpbixyYXlEaXJlY3Rpb24scG9pbnQxLHBvaW50MilcbntcbiAgLy8gVGhpcyBjb2RlIGZyb20gaGVyZTogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTQzMDcxNTgvaG93LWRvLXlvdS1jaGVjay1mb3ItaW50ZXJzZWN0aW9uLWJldHdlZW4tYS1saW5lLXNlZ21lbnQtYW5kLWEtbGluZS1yYXktZW1hbmF0aW5cbiAgLy8gTm90ZSB0aGlzIHJvdXRpbmUgc2VlbXMgdG8gZGVwZW5kIG9uIHRoZSBjaGlyYWxpdHkgb2YgdGhlIHBvaW50czsgcG9zc2libHkgaXQgb25seSBjb3VudHMgYW4gYXBwcm9hY2ggZnJvbSBvbmUgc2lkZS5cbiAgY29uc3QgcmRuID0gdmVjLm5vcm0ocmF5RGlyZWN0aW9uKTtcbiAgY29uc3QgdjEgPSB2ZWMuc3ViKHJheU9yaWdpbixwb2ludDEpO1xuICBjb25zdCB2MiA9IHZlYy5zdWIocG9pbnQyLHBvaW50MSk7XG5cbiAgY29uc3QgdjMgPSBbLXJkblsxXSxyZG5bMF1dO1xuICBjb25zdCBkb3QgPSB2ZWMuZG90KHYyLHYzKTtcblxuICBpZiAodmVjLnNjYWxhck5lYXIoMWUtNSxkb3QsMCkpXG4gICAgcmV0dXJuIG51bGw7XG5cbiAgY29uc3QgdDEgPSB2ZWMucGVycGRvdCh2Mix2MSkgLyBkb3Q7XG4gIGNvbnN0IHQyID0gdmVjLmRvdCh2MSx2MykgLyBkb3Q7XG5cbiAgaWYgKHQxID49IDAuMCAmJiAodDIgPj0gMC4wICYmIHQyIDw9IDEuMCkpIHtcbiAgICByZXR1cm4gW3ZlYy5hZGQocmF5T3JpZ2luLHZlYy5zY2FsZSh0MSxyZG4pKSx0MV07XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8vIFRoaXMgaXMgdGhlIGZ1bmRhbWVudGFsIG1hdGggYmVoaW5kIGEgVHJpYWRCYWxhbmNlIERpYWdyYW0uXG4vLyBJIHdpbGwgcHJvYmFibHkgcHV0IHRoaXMgaW4gTGFUZVggc29vbi5cbi8vIEEgYmFsYW5jZSBkaWFncmFtIGlzIGEgd2F5IG9mIGNob29zaW5nIGEgdW5pdCB2ZWN0b3Jcbi8vIG9mIG4gZGltZW5zaW9ucyAobW9zdCB1c2VmdWxseSAzKSBmcm9tIGEgbi1nb24uXG4vLyBJZiBuID4gMywgaXQgaXMgbm90IHBvc3NpYmxlIHRvIGNvbXBsZXRlIG1hcCBhbGwgcG9pbnRzLlxuLy8gVGhlIGZ1bmRhbWVudGFsIG1hdGggb2YgYSBUcmlhZEJhbGFuY2UgZGlhZ3JhbSBpcyB0byBjb252ZXJ0XG4vLyBiZXR3ZWVuIGEgcG9pbnQgb24gdGhlIDItZGltZW5zaW9uYWwgbi1nb24gKHRoZSBcInJlcHJlc2VudGF0aW9uXCIpIGZyb21cbi8vIHRoZSBcImJhbGFuY2VcIiAtLSBhIG4tZGltZW5zaW9uYWwgdmVjdG9yLlxuLy8gQ2FsbCB0aGUgZnVuY3Rpb24gdGhhdCBwcm9kdWNlcyB0aGUgcmVwZXNlbnRhdGlvbiBmcm9tIGEgdW5pdCB2ZWN0b3Jcbi8vIFwiclwiIGFuZCB0aGUgZnVuY3Rpb24gdGhhdCBwcm9kdWNlcyB0aGUgYmFsYW5jZSB2ZWN0b3IgZnJvbSB0aGUgcmVzcHJlc2VudGF0aW9uIFwiYlwiLlxuLy8gRGVzaWRlcmF0b3Igb2YgdGhlc2UgZnVuY3Rpb25zIGFyZTpcbi8vIFdlIHdhbnQgdGhlbSB0byBiZSBpbnZlcnNpb25zIG9mIGVhY2ggb3RoZXIuXG4vLyBXZSB3YW50IHRoZSBjZW50ZXIgb2YgdGhlIHJlcHJlc2VudGF0aW9uIHRvIG1hcCB0byBhIGJhbGFuY2VkIHZlY3Rvci5cbi8vIEEgcmVwcmVzZW50YXRpb24gYXQgdGhlIHZlcnRleCBpcyBhIHZlY3RvciBoYXZpbmcgYSBzaW5nbGUgMSBhbmQgdGhlIHJlc3QgemVyb3MuXG4vLyBBcyB3ZSBjaGFuZ2UgdGhlIGFuZ2xlIGJldHdlbiB0aGUgb3JpZ2luIGFuZCB0aGUgcG9pbnQgaW4gYSByZXByZXNlbnRhdGlvbiB0b3dhcmQgYSB2ZXJ0ZXgsXG4vLyB0aGUgdmFsdWUgb2YgdGhhdCB2ZXJ0ZXggc2hvdWxkIGluY3JlYXNlLlxuLy8gQXMgd2UgbW92ZSBhbG9uZyBzdWNoIGEgbGluZSwgd2Ugc2hvdWxkIG5vdCBjaGFuZ2UgdGhlIHJlbGF0aXZlIHByb3BvcnRpb24gb2YgdGhlXG4vLyBvdGhlciB2YWx1ZXMuICh0aGlzIGlzIHZhZ3VlKS5cbi8vIEl0IHNob3VsZCBiZSBlYXN5IHRvIGNvbXB1dGUgYW5kIGV4cGxhaW4gKGF0IGxlYXN0IGdlb21ldHJpY2FsbHkuKVxuLy8gSSBub3cgYmVsaWV2ZSB0aGlzIHNob3VsZCBhbGxvdyBhIFwibm9ybVwiIHRvIGJlIHBhc3NlZCBpblxuLy8gYXMgYSBmdW5jdGlvbi4gSSB0aGluayB0aGUgTDEgbm9ybSBpcyBwcm9iYWJseSBiZXR0ZXIgdGhhbiBMMlxuLy8gbm9ybSBmb3Igc29tZSBmdW5jdGlvbnMsIGJ1dCBpdCBjYW4gYmUgb3B0aW9uYWwuXG4vLyBJdCBpcyBlc3NlbnRpYWwgdGhhdCB0aGlzIGZ1bmN0aW9uIGJlIGludmVydGlibGUuXG5cbmZ1bmN0aW9uIEwxTk9STSh2KSB7XG4gIGxldCBzID0gdjNjLm1hbmhhdHRhbihbMCwwLDBdLHYpO1xuICByZXR1cm4gdjNjLnNjYWxlKDEvcyx2KTtcbn1cbmZ1bmN0aW9uIEwyTk9STSh2KSB7XG4gIHJldHVybiB2M2Mubm9ybWFsaXplKHYpO1xufVxuZnVuY3Rpb24gTDFMRU5HVEgodikge1xuICByZXR1cm4gdjNjLm1hbmhhdHRhbihbMCwwLDBdLHYpO1xufVxuZnVuY3Rpb24gTDJMRU5HVEgodikge1xuICByZXR1cm4gdjNjLm1hZyh2KTtcbn1cblxudmFyIEwxID0gW0wxTk9STSxMMUxFTkdUSF07XG52YXIgTDIgPSBbTDJOT1JNLEwyTEVOR1RIXTtcblxuXG4vLyBVbmRlciBhc3N1bXB0aW9uIG9mIGFuIHVwd2FyZCBmYWNpbmdcbi8vIGVxdWlsYXRlcmFsIHRyaWFuZ2xlLCByZXR1cm4gdGhlIGVkZ2Vcbi8vIGludGVyc2VjdGVkIGJ5IHRoZSByYXkgZnJvbSB0aGUgb3JpZ2luIHRvIHRwLFxuLy8gd2l0aG91dCBkZXBlbmRlbmNlIG9uIHZlY3RvciBsaWJyYXJpZXMuXG4vLyBUaGUgcmV0dXJuIHZhbHVlIGlzIGFuIGFycmF5OlxuLy8gZW1wdHkgaWZmIHRwIGlzIHRoZSBvcmlnaW5cbi8vIGNvbnRhaW5pbmcgdHdvIHZhbHVlcyBpZiBpdCBpcyBhIHZlcnRleFxuLy8gY29udGFpbmluZyBvbmUgdmFsdWUgb3RoZXJ3aXNlLlxuLy8gVGhlIGVkZ2VzIGFyZSBudW1iZXJlZCBhbnRpY2xvY2t3aXNlLFxuLy8gd2l0aCB0aGUgemVyb2V0aCBlZGdlIGF0IHRoZSBib3R0b20uXG4vLyBJZiB0d28gZWRnZXMgYXJlIHJldHVybmVkLCB0aGlzIHJvdXRpbmVcbi8vIHJldHVybnMgdGhlbSBpbiBzb3J0ZWQgb3JkZXIuXG5mdW5jdGlvbiBlcUVkZ2VBbGdlYnJhaWNhbGx5KHd0YyxwKSB7XG4gIGlmICh2ZWMuc2NhbGFyTmVhcigxZS01LHBbMF0sMCkpIHtcbiAgICBpZiAodmVjLnNjYWxhck5lYXIoMWUtNSxwWzFdLDApKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfSBlbHNlIGlmIChwWzFdID4gMCkge1xuICAgICAgcmV0dXJuIFsxLDJdO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gWzBdO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBsZXQgbSA9IHBbMV0vcFswXTtcbiAgICBsZXQgbTEgPSAtU1FSVDMvMztcbiAgICBsZXQgbTIgPSBTUVJUMy8zO1xuICAgIGlmICgocFswXSA+IDApICYmICh2ZWMuc2NhbGFyTmVhcigxZS01LG0sbTEpKSkgcmV0dXJuIFswLDFdO1xuICAgIGlmICgocFswXSA+IDApICYmIChtID4gbTEpKSByZXR1cm4gWzFdO1xuICAgIGlmICgocFswXSA+IDApICYmIChtIDwgbTEpKSByZXR1cm4gWzBdO1xuXG4gICAgaWYgKChwWzBdIDwgMCkgJiYgKHZlYy5zY2FsYXJOZWFyKDFlLTUsbSxtMikpKSByZXR1cm4gWzAsMl07XG4gICAgaWYgKChwWzBdIDwgMCkgJiYgKG0gPCBtMikpIHJldHVybiBbMl07XG4gICAgaWYgKChwWzBdIDwgMCkgJiYgKG0gPiBtMikpIHJldHVybiBbMF07XG4gIH1cbn1cblxuXG4vLyBIZXJlIHdlIHJldHVybiB0aGUgcG9pbnQgb24gdGhlIGVkZ2Vcbi8vIHdoZXJlIHRoZSByYXkgZnJvbSB0aGUgb3JpZ2luIHRvIHRwIGludGVyc2VjdHNcbi8vIHRoZSB0cmlhbmdsZS5cbi8vIFRoZSBtYXRoIGhlcmUgaXMgY3JlYXRlZCBvbiB0aGUgYXNzdW1wdGlvblxuLy8gb2YgdGhlIHRyaWFuZ2xlIGJlaW5nIHBlcmZlY3RseSBlcXVpbGF0ZXJhbCB3aXRoXG4vLyB0aGUgY2VudHJvaWQgYXQgdGhlIG9yaWdpbi4gVGhpcyBhbGxvd3MgdXMgdG9cbi8vIHNvbHZlIHNpbXVsdGFuZW91cyBlcXVhdGlvbnMgdG8gZmluZCB0aGUgcG9pbnRzLlxuLy8gVGhpcyBpcyBhbiBhbHRlcm5hdGl2ZSB0byB2ZWN0b3ItYmFzZWQgbWV0aG9kc1xuLy8gdGhhdCBhcmUgb2YgY291cnNlIGluIHRoZSBlbmQgc2ltbGFyLCBidXQgd2UgdGFrZVxuLy8gYWR2YW50YWdlIG9mIGtub3duIHNsb3BlcyB0byBtYWtlIGl0IGZhc3RlciBhbmQgc2ltcGxlci5cbmZ1bmN0aW9uIGVxUG9pbnRPbkVkZ2VBbGdlYnJhaWNhbGx5KHd0Yyx0cCkge1xuICAvLyB3ZSBzaG91bGQgcHJvYmFibHkgY2hlY2sgZXF1aWxhdGVyYWxpdHkgYW5kIG9yaWVudGF0aW9uIGhlcmVcbiAgbGV0IGVzID0gZXFFZGdlQWxnZWJyYWljYWxseSh3dGMsdHApO1xuICBpZiAoZXMubGVuZ3RoID09IDApIHJldHVybiBudWxsOyAvLyB0cCBpcyB0aGUgb3JpZ2luXG4gIGlmIChlcy5sZW5ndGggPT0gMikgeyAvLyB3ZSBoaXQgYSB2ZXJ0ZXgsIGJ1dCB3aGljaCBvbmU/XG4gICAgaWYgKChlc1swXSA9PSAwKSAmJiAoZXNbMV0gPT0gMSkpIHtcbiAgICAgIHJldHVybiB3dGNbMV07XG4gICAgfSBlbHNlXG4gICAgaWYgKChlc1swXSA9PSAwKSAmJiAoZXNbMV0gPT0gMikpIHtcbiAgICAgIHJldHVybiB3dGNbMF07XG4gICAgfSBlbHNlXG4gICAgaWYgKChlc1swXSA9PSAxKSAmJiAoZXNbMV0gPT0gMikpIHtcbiAgICAgIHJldHVybiB3dGNbMl07XG4gICAgfVxuICB9IGVsc2UgeyAvLyBub3cgd2UgZG8gYSBjYXNlIHNwbGl0XG4gICAgbGV0IHhwID0gdHBbMF07XG4gICAgbGV0IHlwID0gdHBbMV07XG4gICAgbGV0IGEgPSB2ZWMuZGlzdCh3dGNbMF0sd3RjWzFdKTtcbiAgICBsZXQgQiA9IGEgKiBTUVJUMy82O1xuICAgIGlmICh2ZWMuc2NhbGFyTmVhcigxZS01LHhwLDApKSB7XG4gICAgICByZXR1cm4gKHlwID4gMCkgPyB3dGNbMl0gOiBbMCwtQl07XG4gICAgfVxuICAgIGxldCBtID0geXAveHA7XG4gICAgaWYgKGVzWzBdID09IDApIHtcbiAgICAgIHJldHVybiBbLUIvbSwtQl07XG4gICAgfSBlbHNlIGlmIChlc1swXSA9PSAxKSB7XG4gICAgICBsZXQgeSA9IGEgLyAoMyAqKDEvU1FSVDMgKyAxL20pKTtcbiAgICAgIGxldCB4ID0geSAvIG07XG4gICAgICByZXR1cm4gW3gseV07XG4gICAgfSBlbHNlIGlmIChlc1swXSA9PSAyKSB7XG4gICAgICBsZXQgeSA9IGEgLyAoMyAqKDEvU1FSVDMgLSAxL20pKTtcbiAgICAgIGxldCB4ID0geSAvIG07XG4gICAgICByZXR1cm4gW3gseV07XG4gICAgfVxuICB9XG59XG5cblxuZnVuY3Rpb24gZ2V0RWRnZUFuZFBvaW50KHd0YyxwKSB7XG5cbiAgLy8gSWYgd2UgYXJlIGNlbnRlcmVkLCB2ZXJ0aWNhbCwgcG9pbnRpbmcgdXAsIGFuZCBlcXVpbGF0ZXJhbCxcbiAgLy8gd2UgY2FuIHVzZSB0aGUgbW9yZSBlZmZpY2llbnQgYWxnb3JpdGhtLlxuICBpZiAoaXNDZW50ZXJlZEVxdWlsYXRlcmFsKHd0YykpXG4gIHtcbiAgICAvLyB0aGlzIG1heSByZXR1cm4gdHdvLCBidXQgd2UgY2FuIGp1c3QgdGFrZSB0aGUgZmlyc3RcbiAgICByZXR1cm4gW2VxRWRnZUFsZ2VicmFpY2FsbHkod3RjLHApWzBdLFxuICAgICAgICAgICAgZXFQb2ludE9uRWRnZUFsZ2VicmFpY2FsbHkod3RjLHApXTtcbiAgfVxuICBlbHNlXG4gIHtcbiAgICB2YXIgcG9pbnRfb25fZWRnZTtcbiAgICB2YXIgZmVfaWR4ID0gLTE7IC8vIGluZGV4IG9mIHRoZSBmaXJzdCBlZGdlIHdlIGludGVyc2VjdFxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCAzICYmIGZlX2lkeCA8IDA7IGkrKykge1xuICAgICAgdmFyIHIgPSBHZXRSYXlUb0xpbmVTZWdtZW50SW50ZXJzZWN0aW9uKFswLDBdLHAsd3RjW2ldLHd0Y1soaSsxKSAlIDNdKTtcbiAgICAgIGlmIChyICE9IG51bGwpIHsgLy8gaWYgbnVsbCwgdGhlIHJheSBkaWQgbm90IGludGVyc2VjdCB0aGUgZWRnZVxuICAgICAgICBmZV9pZHggPSBpO1xuICAgICAgICBwb2ludF9vbl9lZGdlID0gclswXTsgLy8gVGhlIGZpcnN0IGNvbXAuIG9mIHJldHVybiB2YWx1ZSBpcyBpbnRlcnNlY3Rpb25cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIFtmZV9pZHgscG9pbnRfb25fZWRnZV07XG4gIH1cbn1cblxuXG4vLyB0cCBpcyBhIHBvaW50IGluIHRoZSAyLWRpbWVuc2lvbmFsIHRyaWFuZ2xlIHNwYWNlXG4vLyB3dGMgYXJlIHRoZSB0aHJlZSB2ZXJ0aWNlcyBvZiBhbiBlcWlsYXRlcmFsIHRyaWFuZ2xlIHdob3NlIGNlbnRyb2lkIGlzIHRoZSBvcmlnaW5cbi8vIExYbm9ybV9hbmRfbGVuZ3RoIGlzIGEgcGFpciBvZiBmdW5jdGlvbnMgdG8gdG8gbm9ybWFsaXplIGEgdmVjdG9yIGFuZCBjb21wdXRlIHRoZSBsZW5ndGhcbi8vIHJldHVybiB0aGUgY29ycmVzcG9uZGluZyAzLXZlY3RvciBpbiB0aGUgYXR0cmlidXRlIHNwYWNlXG5mdW5jdGlvbiBUcmlhZEJhbGFuY2UydG8zKHAsd3RjLExYbm9ybV9hbmRfbGVuZ3RoID0gTDIpIHtcbiAgbGV0IExYbm9ybWFsaXplID0gTFhub3JtX2FuZF9sZW5ndGhbMF07XG5cbiAgaWYgKHZlYy5zY2FsYXJOZWFyKDFlLTUsdmVjLm1hZyhwKSwwKSkge1xuICAgIHJldHVybiBMWG5vcm1hbGl6ZShbMSwxLDFdKTtcbiAgfVxuXG4gIC8vIE5vdyB3ZSB3YW50IHRvIGRvIGEgbGluZWFyIGludGVycG9sYXRpb24gb2YgaG93IGZhciB3ZSBhcmUgZnJvbSBhbiBlZGdlLFxuICAvLyBidXQgYWxzbyBob3cgZmFyIHRoZSBwcm9qZWN0aW9uIHRvIHRoZSBlZGdlIGlzIGJldHdlZW4gdGhlIHZlcnRpY2VzLlxuICAvLyBXZSBtdXN0IGZpcnN0IGRlY2lkZSB3aGljaCBlZGdlcyB0aGUgbGluZSBmcm9tIHRoZSBvcmlnbiB0byBwIGludGVyc2VjdHMuXG4gIC8vIElmIGl0IGludGVyc2VjdHMgdHdvIHNlZ21lbnRzLCB0aGVuIGl0IGlzIGFpbWVkIGF0IGEgdmVydGV4LlxuICBsZXQgW2ZlX2lkeCxwb2ludF9vbl9lZGdlXSA9IGdldEVkZ2VBbmRQb2ludCh3dGMscCk7XG5cbiAgLy8gbm93IHBvaW50X29uX2VkZ2UgaXMgYSBwb2ludCBvbiBlZGdlIGZlX2lkeC5cbiAgY29uc3QgdG90YWxfZGlzdGFuY2VfdG9fZWRnZSA9IHZlYy5kaXN0KFswLDBdLHBvaW50X29uX2VkZ2UpO1xuXG4gIC8vIElmIHRoZSBwb2ludCBpcyBvdXRzaWRlIHRoZSB0cmlhbmdsZSwgd2UgY2xhbXAgKHRydW5jYXRlIGlmIG5lZWRlZClcbiAgLy8gaXQncyBsZW5ndGggc28gdGhhdCBpdCBpcyBwcmVjaXNlbHkgb24gdGhlIGVkZ2UuXG4gIGNvbnN0IHBjID0gdmVjLmNsYW1wTWFnKDAsdG90YWxfZGlzdGFuY2VfdG9fZWRnZSxwKTtcblxuICBjb25zdCBkaXN0YW5jZV90b19wX29fZSA9IHZlYy5kaXN0KHBjLHBvaW50X29uX2VkZ2UpO1xuICB2YXIgcmF0aW9fcF90b19lZGdlID0gIGRpc3RhbmNlX3RvX3Bfb19lL3RvdGFsX2Rpc3RhbmNlX3RvX2VkZ2U7XG5cbiAgbGV0IGJhbCA9IHYzYy5zY2FsZShyYXRpb19wX3RvX2VkZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgTFhub3JtYWxpemUoWzEsMSwxXSkpO1xuXG4gIC8vIE5vdyB0aGUgcmVtYWluZGVyIG9mIHRoZSBjb250cmlidXRpb25cbiAgLy8gdG8gdGhlIHVuaXQgdmVjdG9yIHNob3VsZCBjb21lIGZyb20gdGhlIHR3b1xuICAvLyBwb2ludHMgb24gdGhlIGVkZ2UsIGluIGxpbmVhciBwcm9wb3J0aW9uLlxuICAvLyBUaGVzZSBjb29yZGluYXRlcyBhcmUgZmVfaWR4IGFuZCAoZmVfaWR4KzEpICUgMy5cbiAgY29uc3QgZDEgPSB2ZWMuZGlzdCh3dGNbZmVfaWR4XSxwb2ludF9vbl9lZGdlKTtcbiAgY29uc3QgZDIgPSB2ZWMuZGlzdCh3dGNbKGZlX2lkeCsxKSAlIDNdLHBvaW50X29uX2VkZ2UpO1xuXG4gIGxldCB2cyA9IFswLDAsMF07XG4gIHZzW2ZlX2lkeF0gPSBkMjtcbiAgdnNbKGZlX2lkeCsxKSAlIDNdID0gZDE7XG5cbiAgbGV0IGltYiA9IHYzYy5zY2FsZSgxIC0gcmF0aW9fcF90b19lZGdlLExYbm9ybWFsaXplKHZzKSk7XG5cbiAgcmV0dXJuIHYzYy5hZGQoaW1iLGJhbCk7XG59XG5cbi8vIHZlYyBpcyBhIDMtdmVjdG9yIGluIHRoZSBhdHRyaWJ1dGUgc3BhY2Vcbi8vIHd0YyBhcmUgdGhlIHRocmVlIHZlcnRpY2VzIG9mIGFuIGVxaWxhdGVyYWwgdHJpYW5nbGUgd2hvc2UgY2VudHJvaWQgaXMgdGhlIG9yaWdpblxuLy8gTFhub3JtX2FuZF9sZW5ndGggaXMgYSBwYWlyIG9mIGZ1bmN0aW9ucyB0byB0byBub3JtYWxpemUgYSB2ZWN0b3IgYW5kIGNvbXB1dGUgdGhlIGxlbmd0aFxuLy8gcmV0dXJuIHRoZSBjb3JyZXNwb25kaW5nIDItdmVjdG9yIGluIHRoZSB0cmlhbmdsZSBzcGFjZVxuZnVuY3Rpb24gaW52ZXJ0VHJpYWRCYWxhbmNlMnRvMyh2LHd0YyxMWG5vcm1fYW5kX2xlbmd0aCA9IEwyKSB7XG4gIGxldCBsZW5ndGggPSBMWG5vcm1fYW5kX2xlbmd0aFsxXTtcblxuICBsZXQgbWluID0gTWF0aC5taW4oTWF0aC5taW4odlswXSx2WzFdKSx2WzJdKTtcblxuICBsZXQgaW1iID0gW3ZbMF0gLSBtaW4sdlsxXSAtIG1pbix2WzJdIC0gbWluXTtcbiAgbGV0IGJhbCA9IHYzYy5zdWIodixpbWIpO1xuICAvLyBOb3cgdGhhdCB3ZSBoYXZlIGJhbGFuY2UsIHdlIG5lZWQgdG8gY29tcHV0ZSBpdCdzIGxlbmd0aCxcbiAgLy8gd2hpY2ggaXMgZGVwZW5kZW50IG9uIHRoZSBub3JtIHdlIGNob3NlIVxuXG4gIGxldCBpbWJfciA9IGxlbmd0aChpbWIpO1xuICBsZXQgYmFsX3IgPSBsZW5ndGgoYmFsKTtcblxuICAvLyBOb3cgd2UgaGF2ZSB0aGUgcmF0aW9zLiBXZSBuZWVkIHRvIGRldGVybWluZSB0aGUgZGlyZWN0aW9uLlxuICAvLyBUaGlzIGlzIGEgZnVuY3Rpb24gb2YgdGhlIGltYmFsYW5jZSB2ZWN0b3IuIFdlIGNhbiBkZXRlcm1pbmVcbiAgLy8gd2hpY2ggc2lkZSB3ZSBhcmUgb24sIGFuZCB0aGVuIGNvbXB1dGUgb3VyIHBvc2l0aW9uIGFsb25nIHRoYXRcbiAgLy8gdG8gZGV0ZXJtaW5lIGEgcG9pbnQgb24gdGhlIHRyaWFuZ2xlLCBhbmQgdGhlbiBtdWx0aXBseSBieSB0aGUgaW1iX3JcbiAgLy8gdG8gb2J0YWluIHRoZSBhY3R1YWwgcG9pbnQuXG4gIC8vIEF0IGxlYXN0IG9uZSB2YWx1ZSBvZiBpbWIgd2lsbCBiZSB6ZXJvLlxuICB2YXIgZnJvbV92LHRvX3YscmF0aW87XG4gIC8vIHRoZSBwb2ludHMgYXJlIE9QUE9TSVRFIHRoZSB6ZXJvXG4gIC8vIHJhdGlvIHdpbGwgYmUgdGhlIHJhdGlvIGFsb25nIHRoZSB0cmlhbmdsZSBlZGdlXG4gIC8vIGl0IHJlcXVpcmVzIGEgbGl0dGxlIHRob3VnaHQgdG8gdW5kZXJzdGFuZCB3aGljaFxuICAvLyBvZiB0aGUgb3RoZXIgcG9pbnRzIHNob3VsZCBiZSB0aGUgXCJmcm9tX3ZcIiBhbmQgdGhlIFwidG9fdlwiXG4gIC8vIGZvciB0aGUgaW50ZXJwb2xhdGlvbiB3aGljaCBvY2N1cnMgbGF0ZXIuXG4gIGxldCBzID0gaW1iWzBdICsgaW1iWzFdICsgaW1iWzJdOyAvLyBvbmUgb2YgdGhlc2UgaXMgYWx3YXlzIHplcm8uXG4gIGlmIChpbWJbMF0gPT0gMCkge1xuICAgIGZyb21fdiA9IHd0Y1syXTtcbiAgICB0b192ID0gd3RjWzFdO1xuICAgIHJhdGlvID0gaW1iWzFdL3M7XG4gIH0gZWxzZSBpZiAoaW1iWzFdID09IDApIHtcbiAgICBmcm9tX3YgPSB3dGNbMF07XG4gICAgdG9fdiA9IHd0Y1syXTtcbiAgICByYXRpbyA9IGltYlsyXS9zO1xuICB9IGVsc2UgaWYgKGltYlsyXSA9PSAwKSB7XG4gICAgZnJvbV92ID0gd3RjWzFdO1xuICAgIHRvX3YgPSB3dGNbMF07XG4gICAgcmF0aW8gPSBpbWJbMF0vcztcbiAgfVxuXG4gIC8vIFRoZSBwb2ludCBvbiB0aGUgdHJpYW5nbGUgaXMgYnkgY29uc3RydWN0aW9uXG4gIC8vIG9uIG9uZSBlZGdlIG9mIHRoZSB0cmlhbmdsZS5cbiAgY29uc3Qgb25UcmlhbmdsZSA9IHZlYy5sZXJwKGZyb21fdix0b192LHJhdGlvKTtcbiAgLy8gbm93IG9uVHJpYW5nbGUgaXMgYSBwb2ludCBvbiB0aGUgdHJpYW5nbGVcbiAgLy8gbm93LCBoYXZpbmcgZm91bmQgdGhhdCB3ZSBpbnRlcnBvbGF0ZSBhIHJheVxuICAvLyB0byBpdCBvZiBsZW5ndGggaW1iX3IuLi5cbiAgcmV0dXJuIHZlYy5sZXJwKFswLDBdLG9uVHJpYW5nbGUsaW1iX3IpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgVHJpYWRCYWxhbmNlMnRvMzogVHJpYWRCYWxhbmNlMnRvMyxcbiAgaW52ZXJ0VHJpYWRCYWxhbmNlMnRvMzogaW52ZXJ0VHJpYWRCYWxhbmNlMnRvMyxcbiAgZXFQb2ludE9uRWRnZUFsZ2VicmFpY2FsbHk6IGVxUG9pbnRPbkVkZ2VBbGdlYnJhaWNhbGx5LFxuICBlcUVkZ2VBbGdlYnJhaWNhbGx5OiBlcUVkZ2VBbGdlYnJhaWNhbGx5LFxuICBHZXRSYXlUb0xpbmVTZWdtZW50SW50ZXJzZWN0aW9uIDogR2V0UmF5VG9MaW5lU2VnbWVudEludGVyc2VjdGlvbixcbiAgTDFMRU5HVEg6IEwxTEVOR1RILFxuICBMMkxFTkdUSDogTDJMRU5HVEgsXG4gIEwxOiBMMSxcbiAgTDI6IEwyfTtcbiJdfQ==
