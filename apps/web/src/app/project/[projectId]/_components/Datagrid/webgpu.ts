// webgpu.d.ts
interface Navigator {
  gpu: GPU;
}

interface GPU {
  requestAdapter(options?: GPURequestAdapterOptions): Promise<GPUAdapter>;
}

interface GPUAdapter {
  requestDevice(options?: GPUDeviceDescriptor): Promise<GPUDevice>;
}

interface GPUDevice {
  createCommandEncoder(options?: GPUCommandEncoderDescriptor): GPUCommandEncoder;
  createBuffer(descriptor: GPUBufferDescriptor): GPUBuffer;
  createTexture(descriptor: GPUTextureDescriptor): GPUTexture;
  queue: GPUQueue;
}

interface GPUBuffer {
  mapAsync(mode: GPUMapModeFlags, offset?: number, size?: number): Promise<void>;
  getMappedRange(offset?: number, size?: number): ArrayBuffer;
  unmap(): void;
  destroy(): void;
}

interface GPUTexture {
  createView(descriptor?: GPUTextureViewDescriptor): GPUTextureView;
}

interface GPUTextureView {}

interface GPUCommandEncoder {
  copyTextureToBuffer(source: GPUImageCopyTexture, destination: GPUImageCopyBuffer, copySize: GPUExtent3D): void;
  finish(): GPUCommandBuffer;
}

interface GPUQueue {
  submit(commandBuffers: GPUCommandBuffer[]): void;
}

type GPUMapModeFlags = 'read' | 'write';
type GPUBufferUsageFlags = 'map-read' | 'map-write' | 'copy-src' | 'copy-dst';
type GPUTextureUsageFlags = 'copy-src' | 'copy-dst' | 'sampled' | 'storage' | 'render-attachment';

// Add other necessary types and interfaces as required.
