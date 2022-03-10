//https://mdn.github.io/webgl-examples/tutorial/sample5/

var cubeRotation = 0.0;

let buffers
let vertexCount = 36

main();

//
// Start here
//
function main() {
  const canvas = document.querySelector('#glCanvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program

  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;

  // Fragment shader program

  const fsSource = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVertexColor and also
  // look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    }
  };

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  buffers = initBuffers(gl);

  var then = 0;

  // Draw the scene repeatedly
  function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;

    drawScene(gl, programInfo, buffers, deltaTime);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple three-dimensional cube.
//
function initBuffers(gl) {

  // Create a buffer for the cube's vertex positions.

  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the cube.

  const positions = [
    // Front face
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,

    // Back face
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0, -1.0, -1.0,

    // Top face
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,

    // Right face
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0,  1.0,  1.0,
     1.0, -1.0,  1.0,

    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0,
  ];

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Now set up the colors for the faces. We'll use solid colors
  // for each face.

  const faceColors = [
    [1.0,  1.0,  1.0,  1.0],    // Front face: white
    [1.0,  0.0,  0.0,  1.0],    // Back face: red
    [0.0,  1.0,  0.0,  1.0],    // Top face: green
    [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
    [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
    [1.0,  0.0,  1.0,  1.0],    // Left face: purple
  ];

  // Convert the array of colors into a table for all the vertices.

  var colors = [];

  for (var j = 0; j < faceColors.length; ++j) {
    const c = faceColors[j];

    // Repeat each color four times for the four vertices of the face
    colors = colors.concat(c, c, c, c);
  }

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  // Build the element array buffer; this specifies the indices
  // into the vertex arrays for each face's vertices.

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's
  // position.

  const indices = [
    0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23,   // left
  ];

  // Now send the element array to GL

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    color: colorBuffer,
    indices: indexBuffer,
  };
}

//
// Draw the scene.
//
function drawScene(gl, programInfo, buffers, deltaTime) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
  gl.lineWidth(5)

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.ortho(projectionMatrix,
                   -2, 2, -2, 2,
                   zNear,
                   zFar);
  //mat4.rotate(projectionMatrix, projectionMatrix, -1, [1, 0, 0])

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create();

  // Now move the drawing position a bit to where we want to
  // start drawing the square.

  mat4.translate(modelViewMatrix,     // destination matrix
                 modelViewMatrix,     // matrix to translate
                 [-0.0, 0.0, -6.0]);  // amount to translate
  mat4.rotate(modelViewMatrix, modelViewMatrix, parseFloat(document.getElementById("vAngle").value) / 180 * Math.PI, [1, 0, 0]);
  mat4.rotate(modelViewMatrix,  // destination matrix
              modelViewMatrix,  // matrix to rotate
              cubeRotation,     // amount to rotate in radians
              [0, 1, 0]);
  

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute
  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
  }

  // Tell WebGL how to pull out the colors from the color buffer
  // into the vertexColor attribute.
  {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexColor);
  }

  // Tell WebGL which indices to use to index the vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program);

  // Set the shader uniforms

  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);

  {
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }

  // Update the rotation for the next draw

  cubeRotation += deltaTime * parseFloat(document.getElementById("rSpeed").value);
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}



/*let path = document.getElementById("pathTest")

path.setPathData([
	{ type: "M", values: [0, 0] },
	{ type: "L", values: [10, 10] },
	{ type: "L", values: [0, 10] },
	{ type: "Z", values: [] }
])

path.setAttribute("d", "M 0 0 L 10 10 L 0 20 Z")

console.log(path.getPathData())*/

function setModel(data, perspectiveDistance, extrusionDistance) {
    let path = document.getElementById("pathTest");
    path.setAttribute("d", data)
    let minX = null
    let minY = null
    let maxX = null
    let maxY = null
    let points = []
    for (let i of path.getPathData({normalize: true})) {
        if (i.type === "C") {
            i.values[5] *= -1
            if (minX == null || minX > i.values[4]) {
                minX = i.values[4]
            }
            if (minY == null || minY > i.values[5]) {
                minY = i.values[5]
            }
            if (maxX == null || maxX < i.values[4]) {
                maxX = i.values[4]
            }
            if (maxY == null || maxY < i.values[5]) {
                maxY = i.values[5]
            }
            points.push(i.values[4], i.values[5])
        } else if (i.type == "M" || i.type == "L") {
            i.values[1] *= -1
            if (minX == null || minX > i.values[0]) {
                minX = i.values[0]
            }
            if (minY == null || minY > i.values[1]) {
                minY = i.values[1]
            }
            if (maxX == null || maxX < i.values[0]) {
                maxX = i.values[0]
            }
            if (maxY == null || maxY < i.values[1]) {
                maxY = i.values[1]
            }
            points.push(i.values[0], i.values[1])
        }
    }
    let maxScale = Math.max(maxX - minX, maxY - minY)
    document.getElementById("svgViewer").setAttribute("viewBox", `${minX} ${-minY - maxScale} ${minX + maxScale} ${-minY}`)
    for (let i in points) {
        if (i % 2 == 0) {
            points[i] -= minX
        } else {
            points[i] -= minY
        }
        points[i] /= maxScale
        points[i] *= 2
        points[i] -= 1
    }
    console.log(points)
    console.log(earcut(points))

    let backPoints = []

    for (let i = 0; i < points.length; i += 2) {
        backPoints.push(points[i] * (extrusionDistance + perspectiveDistance) / perspectiveDistance)
        backPoints.push((points[i + 1] + 1) * (extrusionDistance + perspectiveDistance) / perspectiveDistance - 1)
    }

    console.log(backPoints)

    let vertexPoints = []
    let colorPoints = []
    let indices = []

    for (let i in points) {
        vertexPoints.push(points[i])
        if (i % 2 == 1) {
            vertexPoints.push(0.5 * extrusionDistance)
            colorPoints.push(1.0, 0.0, 0.0, 1.0)
        }
    }

    for (let i in backPoints) {
        vertexPoints.push(backPoints[i])
        if (i % 2 == 1) {
            vertexPoints.push(-0.5 * extrusionDistance)
            colorPoints.push(0.0, 1.0, 0.0, 1.0)
        }
    }

    for (let i in points) {
        vertexPoints.push(points[i])
        if (i % 2 == 1) {
            vertexPoints.push(0.5 * extrusionDistance)
            colorPoints.push(1.0, 1.0, 1.0, 1.0)
        }
    }

    indices.push.apply(indices, earcut(points))
    for (let i = 0; i < points.length / 2; i++) {
        indices.push(i)
        indices.push((i + 1) % (points.length / 2))
        indices.push(i + points.length / 2)

        indices.push((i + 1) % (points.length / 2))
        indices.push(i + points.length / 2)
        indices.push(((i + 1) % (points.length / 2)) + points.length / 2)
    }
    for (let i of earcut(backPoints)) {
        indices.push(i + points.length / 2)
    }
    for (let i of earcut(points)) {
        indices.push(i + points.length)
    }

    const canvas = document.querySelector('#glCanvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    console.log(vertexPoints)
    console.log(colorPoints)
    console.log(indices)

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPoints), gl.STATIC_DRAW);
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorPoints), gl.STATIC_DRAW);
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    buffers = {
        position: positionBuffer,
        color: colorBuffer,
        indices: indexBuffer,
    }

    vertexCount = indices.length
}

setModel("M 0 0 L 10 10 20 10 L 0 20 Z", 2, 1)

function refreshModel(e) {
    setModel(document.getElementById("svgData").value,
        parseFloat(document.getElementById("pDistance").value),
        parseFloat(document.getElementById("eDistance").value))
}

document.getElementById("svgData").addEventListener('change', refreshModel)
document.getElementById("pDistance").addEventListener('change', refreshModel)
document.getElementById("eDistance").addEventListener('change', refreshModel)