export const screenshotModel = () => {
  const canvas = document.getElementById('cube_model') as HTMLCanvasElement;
  const gl = canvas.getContext('webgl2', {preserveDrawingBuffer: true});

  if (!gl) {
    console.error('Unable to obtain WebGL context');
    return;
  }

  const width = canvas.width;
  const height = canvas.height;
  const pixels = new Uint8Array(width * height * 4);

  requestAnimationFrame(() => {
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    if (pixels.some((byte) => byte !== 0)) {
      console.log('Data captured!');

      // WebGL's coordinate system starts from the bottom left corner, while the typical image and canvas coordinate systems start from the top left corner. To correct this, you need to flip the image data vertically after capturing it but before using it

      // Flip the image data vertically
      const flippedPixels = new Uint8Array(width * height * 4);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          for (let c = 0; c < 4; c++) {
            flippedPixels[(x + (height - 1 - y) * width) * 4 + c] = pixels[(x + y * width) * 4 + c];
          }
        }
      }

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempContext = tempCanvas.getContext('2d');
      const imageData = new ImageData(new Uint8ClampedArray(flippedPixels), width, height);
      tempContext?.putImageData(imageData, 0, 0);

      // Download or use the image data as needed
      const dataUrl = tempCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'canvas-screenshot.png';
      link.click();
    } else {
      console.log('No data captured, trying again...');
      requestAnimationFrame(screenshotModel); // Try again
    }
  });
};
