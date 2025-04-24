// This function takes the projection matrix, the translation, and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// The given projection matrix is also a 4x4 matrix stored as an array in column-major order.
// You can use the MatrixMult function defined in project4.html to multiply two 4x4 matrices in the same format.
function GetModelViewProjection( projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY )
{
	// [TO-DO] Modify the code below to form the transformation matrix.
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	var cosX = Math.cos(rotationX);
    var sinX = Math.sin(rotationX);
    var rotX = [
        1, 0, 0, 0,
        0, cosX, sinX, 0,
        0, -sinX, cosX, 0,
        0, 0, 0, 1
    ];
    
    var cosY = Math.cos(rotationY);
    var sinY = Math.sin(rotationY);
    var rotY = [
        cosY, 0, -sinY, 0,
        0, 1, 0, 0,
        sinY, 0, cosY, 0,
        0, 0, 0, 1
    ];
    
    var mvp = MatrixMult(projectionMatrix, trans);
    mvp = MatrixMult(mvp, rotY);
    mvp = MatrixMult(mvp, rotX);
    
    return mvp;

}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		// [TO-DO] initializations
        this.positionBuffer = gl.createBuffer();
        this.texCoordBuffer = gl.createBuffer();
        this.texture = null;
        this.numTriangles = 0;
  
        const vsSource = `
            attribute vec3 aPosition;
            attribute vec2 aTexCoord;
            uniform mat4 uMVP;
            uniform bool uSwapYZ;
            varying vec2 vTexCoord;
            
            void main() {
                vec3 position = aPosition;
                if (uSwapYZ) {
                    position = vec3(position.x, position.z, -position.y);
                }
                gl_Position = uMVP * vec4(position, 1.0);
                vTexCoord = aTexCoord;
            }
        `;
        
        const fsSource = `
            precision mediump float;
            varying vec2 vTexCoord;
            uniform sampler2D uSampler;
            uniform bool uShowTexture;
            
            void main() {
                if (uShowTexture) {
                    gl_FragColor = texture2D(uSampler, vTexCoord);
                } else {
                    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
                }
            }
        `;
        
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vsSource);
        gl.compileShader(vertexShader);
        
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fsSource);
        gl.compileShader(fragmentShader);
        
        this.shaderProgram = gl.createProgram();
        gl.attachShader(this.shaderProgram, vertexShader);
        gl.attachShader(this.shaderProgram, fragmentShader);
        gl.linkProgram(this.shaderProgram);
        
        this.aPosition = gl.getAttribLocation(this.shaderProgram, "aPosition");
        this.aTexCoord = gl.getAttribLocation(this.shaderProgram, "aTexCoord");
        this.uMVP = gl.getUniformLocation(this.shaderProgram, "uMVP");
        this.uSwapYZ = gl.getUniformLocation(this.shaderProgram, "uSwapYZ");
        this.uSampler = gl.getUniformLocation(this.shaderProgram, "uSampler");
        this.uShowTexture = gl.getUniformLocation(this.shaderProgram, "uShowTexture");
        
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions
	// and an array of 2D texture coordinates.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords )
	{
		// [TO-DO] Update the contents of the vertex buffer objects.
        
		this.numTriangles = vertPos.length / 3 / 3;
    
    
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords || []), gl.STATIC_DRAW);
	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		
	// [TO-DO] Set the uniform parameter(s) of the vertex shader
	gl.useProgram(this.shaderProgram);
	gl.uniform1i(this.uSwapYZ, swap ? 1 : 0);
	}
	
	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
	draw( trans )
	{
		// [TO-DO] Complete the WebGL initializations before drawing
		gl.useProgram(this.shaderProgram);
		gl.uniformMatrix4fv(this.uMVP, false, trans);
	
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.enableVertexAttribArray(this.aPosition);
		gl.vertexAttribPointer(this.aPosition, 3, gl.FLOAT, false, 0, 0);
	
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
		gl.enableVertexAttribArray(this.aTexCoord);
		gl.vertexAttribPointer(this.aTexCoord, 2, gl.FLOAT, false, 0, 0);
	
		gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles * 3);
	}
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
	{
		// [TO-DO] Bind the texture
	
		// You can set the texture image data using the following command.
		//gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img );

		// [TO-DO] Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.

		gl.useProgram(this.shaderProgram);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		
		
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
		gl.uniform1i(this.uSampler, 0);
		
		gl.uniform1i(this.uShowTexture, 1);
	}
	
	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture( show )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
		gl.useProgram(this.shaderProgram);
        gl.uniform1i(this.uShowTexture, show ? 1 : 0);
	}
	
}
