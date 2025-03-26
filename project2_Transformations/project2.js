// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The transformation first applies scale, then rotation, and finally translation.
// The given rotation value is in degrees.

function GetTransform( positionX, positionY, rotation, scale )
{
    var res = new Array(9);
	var rad = rotation * Math.PI / 180;

    res[0] = Math.cos(rad)*scale;
    res[1] = Math.sin(rad)*scale;
    res[2] = 0;
    res[3] = -Math.sin(rad)*scale;
    res[4] = Math.cos(rad)*scale;
    res[5] = 0;
    res[6] = positionX;
    res[7] = positionY;
    res[8] = 1;
    
	return res;
}

// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The arguments are transformation matrices in the same format.
// The returned transformation first applies trans1 and then trans2.
function ApplyTransform( trans1, trans2 )
{   
  res = new Array(9);

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        res[i + j * 3] = 0;
        for (let k = 0; k < 3; k++) {
            res[i + j * 3] += trans2[i + k * 3] * trans1[k + j * 3];
        }
      }
    }
return res;
}

