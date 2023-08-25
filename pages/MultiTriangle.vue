<template>
  <div>
    <canvas ref="canvasRef"></canvas>
  </div>
</template>
<script>
import { ref, onMounted } from 'vue';
import multiTriangle from '../shaders/multiTriangle.wgsl';
export default {
  name: 'MultiTriangle',
  setup() {
    const canvasRef = ref(null);

    const rand = (min, max) => {
      if (min === undefined) {
        min = 0;
        max = 1;
      } else if (max === undefined) {
        max = min;
        min = 0;
      }
      return min + Math.random() * (max - min);
    };

    const init = async ({ canvas, pageState }) => {
      const adapter = await navigator.gpu.requestAdapter();
      const device = await adapter.requestDevice();

      if (!device) {
        throw 'need a browser that supports WebGPU';
      }

      const ctx = canvas.getContext('webgpu');
      const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
      ctx.configure({
        device,
        format: presentationFormat,
      });

      const module = device.createShaderModule({
        code: multiTriangle,
      });

      const pipeline = device.createRenderPipeline({
        label: 'storage buffer like uniform',
        layout: 'auto',
        vertex: {
          module,
          entryPoint: 'vs',
        },
        fragment: {
          module,
          entryPoint: 'fs',
          targets: [{ format: presentationFormat }],
        },
      });

      // create 2 buffers for the uniform values
      const staticUniformBufferSize =
        4 * 4 + // color is 4 32bit floats (4bytes each)
        2 * 4 + // offset is 2 32bit floats (4bytes each)
        2 * 4; // padding
      const uniformBufferSize = 2 * 4; // scale is 2 32bit floats (4bytes each)

      // offsets to the various uniform values in float32 indices
      const kColorOffset = 0;
      const kOffsetOffset = 4;

      const kScaleOffset = 0;

      const kNumObjects = 100;
      const objectInfos = [];

      for (let i = 0; i < kNumObjects; ++i) {
        const staticUniformBuffer = device.createBuffer({
          label: `static uniforms for obj: ${i}`,
          size: staticUniformBufferSize,
          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });

        // These are only set once so set them now
        {
          const uniformValues = new Float32Array(staticUniformBufferSize / 4);
          uniformValues.set([rand(), rand(), rand(), 1], kColorOffset); // set the color
          uniformValues.set([rand(-0.9, 0.9), rand(-0.9, 0.9)], kOffsetOffset); // set the offset

          // copy these values to the GPU
          device.queue.writeBuffer(staticUniformBuffer, 0, uniformValues);
        }

        // create a typedarray to hold the values for the uniforms in JavaScript
        const uniformValues = new Float32Array(uniformBufferSize / 4);
        const uniformBuffer = device.createBuffer({
          label: `changing uniforms for obj: ${i}`,
          size: uniformBufferSize,
          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });

        const bindGroup = device.createBindGroup({
          label: `bind group for obj: ${i}`,
          layout: pipeline.getBindGroupLayout(0),
          entries: [
            { binding: 0, resource: { buffer: staticUniformBuffer } },
            { binding: 1, resource: { buffer: uniformBuffer } },
          ],
        });

        objectInfos.push({
          scale: rand(0.2, 0.5),
          uniformBuffer,
          uniformValues,
          bindGroup,
        });
      }

      const renderPassDescriptor = {
        label: 'our basic canvas renderPass',
        colorAttachments: [
          {
            // view: <- to be filled out when we render
            clearValue: [0.3, 0.3, 0.3, 1],
            loadOp: 'clear',
            storeOp: 'store',
          },
        ],
      };

      function render() {
        // Get the current texture from the canvas context and
        // set it as the texture to render to.
        renderPassDescriptor.colorAttachments[0].view = ctx
          .getCurrentTexture()
          .createView();

        const encoder = device.createCommandEncoder();
        const pass = encoder.beginRenderPass(renderPassDescriptor);
        pass.setPipeline(pipeline);

        // Set the uniform values in our JavaScript side Float32Array
        const aspect = canvas.width / canvas.height;

        for (const {
          scale,
          bindGroup,
          uniformBuffer,
          uniformValues,
        } of objectInfos) {
          uniformValues.set([scale / aspect, scale], kScaleOffset); // set the scale
          device.queue.writeBuffer(uniformBuffer, 0, uniformValues);

          pass.setBindGroup(0, bindGroup);
          pass.draw(3); // call our vertex shader 3 times
        }

        pass.end();

        const commandBuffer = encoder.finish();
        device.queue.submit([commandBuffer]);
      }

      requestAnimationFrame(render);
    };

    onMounted(() => {
      console.log('12313', canvasRef.value, navigator.gpu, process);
      if (canvasRef.value) {
        init({ canvas: canvasRef.value, pageState: { active: true } }).then(
          (data) => {
            console.log('init finish');
          }
        );
      }
    });

    return {
      canvasRef,
    };
  },
};
</script>

<style scoped lang="scss">
canvas {
  width: 500px;
  height: 500px;
}
</style>
