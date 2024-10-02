// import type {Navigator} from '../Datagrid/webgpu';
/**
 * This is different in that it created a link to download the model screenshot to your desktop
 * @returns {void}
 */
// export const screenshotModel = () => {
//   const canvas = document.getElementById('cube_model') as HTMLCanvasElement;
//   const gl = canvas.getContext('webgl2', {preserveDrawingBuffer: true});
//   const wgl = canvas.getContext('webgpu', {preserveDrawingBuffer: true});
//   console.log(wgl);
//   if (!gl) {
//     console.error('Unable to obtain WebGL context');
//     return;
//   }

//   const width = canvas.width;
//   const height = canvas.height;
//   const pixels = new Uint8Array(width * height * 4);

//   requestAnimationFrame(() => {
//     gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

//     if (pixels.some((byte) => byte !== 0)) {
//       console.log('Data captured!');

//       // WebGL's coordinate system starts from the bottom left corner, while the typical image and canvas coordinate systems start from the top left corner. To correct this, you need to flip the image data vertically after capturing it but before using it

//       // Flip the image data vertically
//       const flippedPixels = new Uint8Array(width * height * 4);
//       for (let y = 0; y < height; y++) {
//         for (let x = 0; x < width; x++) {
//           for (let c = 0; c < 4; c++) {
//             flippedPixels[(x + (height - 1 - y) * width) * 4 + c] = pixels[(x + y * width) * 4 + c];
//           }
//         }
//       }

//       const tempCanvas = document.createElement('canvas');
//       tempCanvas.width = width;
//       tempCanvas.height = height;
//       const tempContext = tempCanvas.getContext('2d');
//       const imageData = new ImageData(new Uint8ClampedArray(flippedPixels), width, height);
//       tempContext?.putImageData(imageData, 0, 0);

//       // Download or use the image data as needed
//       const dataUrl = tempCanvas.toDataURL('image/png');

//       const link = document.createElement('a');
//       link.href = dataUrl;
//       link.download = 'canvas-screenshot.png';
//       link.click();
//     } else {
//       console.log('No data captured, trying again...');
//       requestAnimationFrame(screenshotModel); // Try again
//     }
//   });
// };

// // Define GPUCanvasContext manually
// interface GPUCanvasContext extends CanvasRenderingContext {
//   configure(options: {
//     device: GPUDevice;
//     format: GPUTextureFormat;
//     alphaMode?: "opaque" | "premultiplied";
//   }): void;
// }

// Extend the Navigator interface to include the gpu property
// interface Navigator {
//   gpu: GPU;
// }

export const screenshotModel = async () => {
  const canvas = document.getElementById('cube_model') as HTMLCanvasElement;
  // Get WebGPU context from the canvas
  const wgpu = canvas.getContext('webgpu');

  if (!wgpu) {
    console.error('Unable to obtain WebGPU context');
    return;
  }

  // Request a GPU adapter and device
  // @ts-ignore
  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter?.requestDevice();

  // @ts-ignore
  const texture = wgpu.getCurrentTexture();
  if (!texture) {
    console.error('Unable to get WebGPU texture');
    return;
  }

  const {width, height, format, depthOrArrayLayers} = texture;

  // const newTexture = device.createTexture({
  //   format,
  //   size: {
  //     width,
  //     height,
  //   },
  //   usage: 1 | 2 | 16, // allows copy data from texture => newTexture => buffer => pixels
  // });

  // Create a buffer to hold the pixel data
  const buffer = device.createBuffer({
    size: width * height * 4, // 4 bytes per pixel (assuming RGBA)
    /**
     * bitwise op flags
     * 1 => GPUBufferUsage.MAP_READ => this allowed buffer.mapAsync
     * 8 => GPUBufferUsage.COPY_DST => this allows .copyTextureToBuffer() call (it is also the only other usage flag allowed)
     */
    usage: 1 | 8,
  });

  // console.log({texture, newTexture, adapter, device, buffer});
  console.log({texture, adapter, device, buffer});
  // Create a command encoder
  // const commandEncoder1 = device.createCommandEncoder();
  const commandEncoder = device.createCommandEncoder();

  // copy texture to texture
  // commandEncoder1.copyTextureToTexture(
  //   {
  //     texture: texture,
  //   },
  //   {
  //     texture: newTexture,
  //   },
  //   {
  //     width,
  //     height,
  //     depthOrArrayLayers,
  //   }
  // );

  // const cmd1Buffer = commandEncoder1.finish();
  // console.log({cmd1Buffer});

  // Copy the texture to the buffer
  commandEncoder.copyTextureToBuffer(
    {
      texture: texture,
    },
    {
      buffer: buffer,
      bytesPerRow: width * 4, // Each row has width * 4 bytes (RGBA)
    },
    {
      width,
      height,
      depthOrArrayLayers: 1,
    }
  );

  // const cmd2Buffer = commandEncoder2.finish();
  // console.log({cmd2Buffer});
  // Submit the commands to the GPU queue
  device.queue.submit([commandEncoder.finish()]);

  // Wait for the buffer to be mapped so we can read its contents
  await buffer.mapAsync(1);
  const mappedBuffer = buffer.getMappedRange();
  const pixels = new Uint8Array(mappedBuffer);

  // Check if there is data in the pixel buffer
  if (pixels.some((byte) => byte !== 0)) {
    console.log('Data captured!');

    // Flip the image data vertically (WebGPU data is stored upside down)
    const flippedPixels = new Uint8Array(width * height * 4);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        for (let c = 0; c < 4; c++) {
          flippedPixels[(x + (height - 1 - y) * width) * 4 + c] = pixels[(x + y * width) * 4 + c];
        }
      }
    }

    // Create a temporary canvas to draw the image
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempContext = tempCanvas.getContext('2d');
    const imageData = new ImageData(new Uint8ClampedArray(flippedPixels), width, height);
    tempContext?.putImageData(imageData, 0, 0);

    // Convert the canvas content to a data URL and download the image
    const dataUrl = tempCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'canvas-screenshot.png';
    link.click();
  } else {
    console.log('No data captured, trying again...');
  }
  // Unmap the buffer once we have the data
  await buffer.unmap();
};

/**
 * This returns the data for the screenshot to be passed into the createState action - we can probably clean this up to be more DRY but it works so I'm not touching it for now
 * @returns
 */
export const stateSnapshot = () => {
  const canvas = document.getElementById('cube_model') as HTMLCanvasElement;
  const gl = canvas.getContext('webgl2', {preserveDrawingBuffer: true});
  const wgl = canvas.getContext('webgpu', {preserveDrawingBuffer: true});
  console.log(wgl);

  if (!gl) {
    console.error('Unable to obtain WebGL context');
    return;
  }

  const width = canvas.width;
  const height = canvas.height;
  const pixels = new Uint8Array(width * height * 4);
  let data = '';
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
      data = tempCanvas.toDataURL('image/png');
    } else {
      console.log('No data captured, trying again...');
      requestAnimationFrame(screenshotModel); // Try again
    }
  });
  // Download or use the image data as needed
  return data;
};
