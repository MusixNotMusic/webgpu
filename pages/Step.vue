<template>
    <div>
        <canvas ref="canvasRef"></canvas>
    </div>
</template>
<script>
// import { ref, onMounted } from 'vue';
import triangleVertWGSL from '../shaders/triangle.vert.wgsl';
import redFragWGSL from '../shaders/red.frag.wgsl';
export default {
    name: 'triangle',
    setup() {
        const canvasRef = ref(null);

        const init = async (canvas) => {
            // vertex color indices 
            const positions = new Float32Array([
                1.0, -1.0, 0.0, -1.0, -1.0, 0.0, 0.0, 1.0, 0.0
            ]);

            const colors = new Float32Array([
                1.0,
                0.0,
                0.0,
                0.0,
                1.0,
                0.0,
                0.0,
                0.0,
                1.0 
            ]);

            const indices = new Uint16Array([0, 1, 2]);

            // initial gpu
            const adapter = await navigator.gpu.requestAdapter();
            const device = await adapter.requestDevice();
            const queue = device.queue;

            // initial canvas context 
            const context = canvas.getContext('webgpu');

            const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

            context.configure({
                device,
                format: 'bgra8unorm',
                usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
                alphaMode: 'opaque'
            });

            // config depth
            const depthTextureDesc = {
                size: [canvas.width, canvas.height, 1],
                dimension: '2d',
                format: 'depth24plus-stencil8',
                usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
            };

            let depthTexture = device.createTexture(depthTextureDesc);
            let depthTextureView = depthTexture.createView();

            let colorTexture;
            let colorTextureView;

            // create buffer
            const createBuffer = (arr, usage) => {
                // 📏 Align to 4 bytes (thanks @chrimsonite)
                let desc = {
                    size: (arr.byteLength + 3) & ~3,
                    usage,
                    mappedAtCreation: true
                };
                let buffer = device.createBuffer(desc);

                const writeArray =
                    arr instanceof Uint16Array
                        ? new Uint16Array(buffer.getMappedRange())
                        : new Float32Array(buffer.getMappedRange());
                writeArray.set(arr);
                buffer.unmap();
                return buffer;
            };

            let positionBuffer = createBuffer(positions, GPUBufferUsage.VERTEX);
            let colorBuffer = createBuffer(colors, GPUBufferUsage.VERTEX);
            let indexBuffer = createBuffer(indices, GPUBufferUsage.INDEX);

            
            // shader
            const vertWgsl = `
            struct VSOut {
                @builtin(position) nds_position: vec4<f32>,
                @location(0) color: vec3<f32>,
            };

            @vertex
            fn main(@location(0) in_pos: vec3<f32>,
                    @location(1) in_color: vec3<f32>) -> VSOut {
                var vsOut: VSOut;
                vsOut.nds_position = vec4<f32>(in_pos, 1.0);
                vsOut.color = in_color;
                return vsOut;
            }
            `;

            const fragWgsl = `
            @fragment
            fn main(@location(0) inColor: vec3f) -> @location(0) vec4f {
                return vec4f(inColor, 1);
            }
            `;


            const vsmDesc = { code: vertWgsl };
            const vertModule = device.createShaderModule(vsmDesc);

            const fsmDesc = { code: fragWgsl };
            const fragModule = device.createShaderModule(fsmDesc);

            // create [Attribute] position color input vertex shader
            const positionAttribDesc = {
                shaderLocation: 0, // [[location(0)]]
                offset: 0,
                format: 'float32x3'
            };

            const colorAttribDesc = {
                shaderLocation: 1, // [[location(1)]]
                offset: 0,
                format: 'float32x3'
            };

            const positionBufferDesc = {
                attributes: [positionAttribDesc],
                arrayStride: 4 * 3, // sizeof(float) * 3
                stepMode: 'vertex'
            };

            const colorBufferDesc = {
                attributes: [colorAttribDesc],
                arrayStride: 4 * 3, // sizeof(float) * 3
                stepMode: 'vertex'
            };

            const depthStencil = {
                depthWriteEnabled: true,
                depthCompare: 'less',
                format: 'depth24plus-stencil8'
            };


            // uniform Data
            const pipelineLayoutDesc = { bindGroupLayouts: [] };
            const layout = device.createPipelineLayout(pipelineLayoutDesc);


            // shader stages
            const vertex = {
                module: vertModule,
                entryPoint: 'main',
                buffers: [positionBufferDesc, colorBufferDesc]
            };

            const colorState = {
                format: 'bgra8unorm'
            };

            const fragment = {
                module: fragModule,
                entryPoint: 'main',
                targets: [colorState]
            };

            const primitive = {
                frontFace: 'cw',
                cullMode: 'none',
                topology: 'triangle-list'
            };

            const pipelineDesc = {
                layout,
                vertex,
                fragment,
                primitive,
                depthStencil
            };

            const pipeline = device.createRenderPipeline(pipelineDesc);

            const encodeCommands = () => {
                let colorAttachment = {
                    view: colorTextureView,
                    clearValue: { r: 0, g: 0, b: 0, a: 1 },
                    loadOp: 'clear',
                    storeOp: 'store'
                };

                const depthAttachment = {
                    view: depthTextureView,
                    depthClearValue: 1,
                    depthLoadOp: 'clear',
                    depthStoreOp: 'store',
                    stencilClearValue: 0,
                    stencilLoadOp: 'clear',
                    stencilStoreOp: 'store'
                };

                const renderPassDesc = {
                    colorAttachments: [colorAttachment],
                    depthStencilAttachment: depthAttachment
                }

                const commandEncoder = device.createCommandEncoder();

                const passEncoder = commandEncoder.beginRenderPass(renderPassDesc);

                passEncoder.setPipeline(pipeline);
                passEncoder.setViewport(0, 0, canvas.width, canvas.height, 0, 1);

                passEncoder.setScissorRect(0, 0, canvas.width, canvas.height);
                passEncoder.setVertexBuffer(0, positionBuffer);
                passEncoder.setVertexBuffer(1, colorBuffer);
                passEncoder.setIndexBuffer(indexBuffer, 'uint16');
                passEncoder.drawIndexed(3, 1);
                passEncoder.end();

                queue.submit([commandEncoder.finish()]);
            }

            const render = () => {
                colorTexture = context.getCurrentTexture();
                colorTextureView = colorTexture.createView();

                encodeCommands();
                requestAnimationFrame(render);
            }
            requestAnimationFrame(render);
        };

        onMounted(() => {
            if (canvasRef.value) {
                init(canvasRef.value).then(data => {
                    console.log('init finish')
                })
            }
        })

        return {
            canvasRef
        }
    }
}
</script>

<style scoped lang="scss">
    canvas {
        width: 500px;
        height: 500px;
    }
</style>