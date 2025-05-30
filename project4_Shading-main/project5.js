// This function takes the translation and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// You can use the MatrixMult function defined in project5.html to multiply two 4x4 matrices in the same format.
function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
{
	// [TO-DO] Modify the code below to form the transformation matrix.
	const cosX = Math.cos(rotationX), sinX = Math.sin(rotationX);
    const cosY = Math.cos(rotationY), sinY = Math.sin(rotationY);

	const rotX = [
        1,    0,     0,   0,
        0,  cosX,  sinX,  0,
        0, -sinX,  cosX,  0,
        0,    0,     0,   1
    ];

	const rotY = [
        cosY,  0, -sinY,  0,
        0,     1,    0,   0,
        sinY,  0,  cosY,  0,
        0,     0,    0,   1
    ];

	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

    trans = MatrixMult(MatrixMult(trans, rotY), rotX);
	var mv = trans;
	return mv;
}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		this.program = InitShaderProgram(meshVS, meshFS);
		gl.useProgram(this.program);
		this.mvpLoc     = gl.getUniformLocation(this.program, "mvp");
		this.mvLoc      = gl.getUniformLocation(this.program, "mv");
		this.normLoc    = gl.getUniformLocation(this.program, "normalMatrix");
		this.texLoc     = gl.getUniformLocation(this.program, "sampler");
		this.swapLoc    = gl.getUniformLocation(this.program, "useSwap");
		this.showText   = gl.getUniformLocation(this.program, "showText");
		this.lightDir   = gl.getUniformLocation(this.program, "lightDir");
		this.shininess  = gl.getUniformLocation(this.program, "shininess");

		this.attribPos   = gl.getAttribLocation(this.program, "vertPos");
		this.attribTex   = gl.getAttribLocation(this.program, "vertTexCoord");
		this.attribNorm  = gl.getAttribLocation(this.program, "vertNormal");

		this.vertexBuffer = gl.createBuffer();
		this.texBuffer    = gl.createBuffer();
		this.normBuffer   = gl.createBuffer();
	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions,
	// an array of 2D texture coordinates, and an array of vertex normals.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex and every three consecutive 
	// elements in the normals array form a vertex normal.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords, normals )
	{
		// [TO-DO] Update the contents of the vertex buffer objects.
		this.numTriangles = vertPos.length / 3;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		// [TO-DO] Set the uniform parameter(s) of the vertex shader
		gl.useProgram(this.program);
		gl.uniform1i(this.swapLoc, swap ? 1 : 0);
	}
	
	// This method is called to draw the triangular mesh.
	// The arguments are the model-view-projection transformation matrixMVP,
	// the model-view transformation matrixMV, the same matrix returned
	// by the GetModelViewProjection function above, and the normal
	// transformation matrix, which is the inverse-transpose of matrixMV.
	draw( matrixMVP, matrixMV, matrixNormal )
	{
		// [TO-DO] Complete the WebGL initializations before drawing
        gl.useProgram(this.program);

		gl.uniformMatrix4fv(this.mvpLoc, false, matrixMVP);
		gl.uniformMatrix4fv(this.mvLoc, false, matrixMV);
		gl.uniformMatrix3fv(this.normLoc, false, matrixNormal);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.vertexAttribPointer(this.attribPos, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.attribPos);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
		gl.vertexAttribPointer(this.attribTex, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.attribTex);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normBuffer);
		gl.vertexAttribPointer(this.attribNorm, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.attribNorm);

		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles );
	}
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
	{
		// [TO-DO] Bind the texture
		gl.useProgram(this.program);

		this.texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		// You can set the texture image data using the following command.
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img );

		// [TO-DO] Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.uniform1i(this.texLoc, 0);
		gl.uniform1i(this.showText, 1);
	}
	
	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture( show )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
		gl.useProgram(this.program);
		gl.uniform1i(this.showText, show ? 1 : 0);
	}
	
	// This method is called to set the incoming light direction
	setLightDir( x, y, z )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the light direction.
		gl.useProgram(this.program);
		gl.uniform3f(this.lightDir, x, y, z);
	}
	
	// This method is called to set the shininess of the material
	setShininess( shininess )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the shininess.
		gl.useProgram(this.program);
		gl.uniform1f(this.shininess, shininess);
	}
}
var meshVS = `
attribute vec3 vertPos;
attribute vec3 vertNormal;
attribute vec2 vertTexCoord;

uniform mat4 mvp;
uniform mat4 mv;
uniform mat3 normalMatrix;
varying vec2 fragTexCoord;
varying vec3 viewNormal;
varying vec3 fragPos;
uniform bool useSwap;
const mat4 SWAP = mat4(
    1, 0,  0, 0,
    0, 0, 1, 0,
    0, 1,  0, 0,
    0, 0,  0, 1 );
void main()
{
    vec4 pos = vec4(vertPos, 1.0);

    mat4 M  = useSwap ? mv  * SWAP : mv;   
    mat4 MVP= useSwap ? mvp * SWAP : mvp;  

    fragPos    = vec3(M * pos);
    viewNormal = normalize(normalMatrix * (useSwap ? mat3(SWAP) * vertNormal
                                                   : vertNormal));

    gl_Position = MVP * pos;
    fragTexCoord = vertTexCoord;
}
`;


var meshFS =  `
precision mediump float;

varying vec2 fragTexCoord;
varying vec3 viewNormal;
varying vec3 fragPos;

uniform sampler2D sampler;
uniform vec3  lightDir;
uniform float shininess;
uniform bool  showText;

void main()
{
    vec3 N = normalize(viewNormal);
    vec3 L = normalize(lightDir);
    vec3 V = normalize(-fragPos);
    vec3 H = normalize(L + V);

    float diff = max(dot(N, L), 0.0);
    float spec = pow(max(dot(N, H), 0.0), shininess);

    vec3 Kd = showText ? texture2D(sampler, fragTexCoord).rgb : vec3(1.0);
    vec3 Ks = vec3(1.0);
    vec3 ambient = 0.1 * Kd;

    gl_FragColor = vec4(ambient + diff * Kd + spec * Ks, 1.0);
}
`;