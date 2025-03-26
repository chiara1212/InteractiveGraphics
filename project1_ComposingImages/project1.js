// bgImg is the background image to be modified.
// fgImg is the foreground image.
// fgOpac is the opacity of the foreground image.
// fgPos is the position of the foreground image in pixels. It can be negative and (0,0) means the top-left pixels of the foreground and background are aligned.
function composite( bgImg, fgImg, fgOpac, fgPos )
{
     //image dimensions
     const bg_width=bgImg.width;
     const fg_width=fgImg.width;
     const bg_height=bgImg.height;
     const fg_height=fgImg.height;
 
 
     //iterate over every pixel of the foreground image
     for(let fy=0; fy<fg_height; fy++){
         for(let fx=0; fx<fg_width; fx++){
             //calculate the coordinates of the foreground respect to the background
             const bx=fx+fgPos.x;
             const by=fy+fgPos.y;
 
             //we are not considering the pixels of the foreground going outside of the background
             if (bx >= 0 && bx < bg_width && by < bg_height &&  by >= 0 ){
 
                 const fg_index=(fy * fg_width + fx)*4;
                 const bg_index=(by * bg_width + bx)*4;
 
 
                 //alpha blending
                 const alpha=(fgImg.data[fg_index + 3] / 255) * fgOpac;
 
                 bgImg.data[bg_index] = fgImg.data[fg_index] * alpha + bgImg.data[bg_index] * (1-alpha);
                 bgImg.data[bg_index + 1] = fgImg.data[fg_index + 1] * alpha + bgImg.data[bg_index + 1] * (1-alpha);
                 bgImg.data[bg_index + 2] = fgImg.data[fg_index + 2] * alpha + bgImg.data[bg_index + 2] * (1-alpha);
                 bgImg.data[bg_index + 3] = Math.round(alpha * 255);
     
             }
         }
     }
}
