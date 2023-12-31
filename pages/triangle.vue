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

        const init = async ({ canvas, pageState }) => {
            const adapter = await navigator.gpu.requestAdapter();
            const device = await adapter.requestDevice();

            if (!pageState.active) return;
            const context = canvas.getContext('webgpu');

            const devicePixelRatio = window.devicePixelRatio || 1;
            canvas.width = canvas.clientWidth * devicePixelRatio;
            canvas.height = canvas.clientHeight * devicePixelRatio;
            const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

            context.configure({
                device,
                format: presentationFormat,
                alphaMode: 'premultiplied',
            });

            const pipeline = device.createRenderPipeline({
                layout: 'auto',
                vertex: {
                module: device.createShaderModule({
                    code: triangleVertWGSL,
                }),
                entryPoint: 'main',
                },
                fragment: {
                module: device.createShaderModule({
                    code: redFragWGSL,
                }),
                entryPoint: 'main',
                targets: [
                    {
                    format: presentationFormat,
                    },
                ],
                },
                primitive: {
                topology: 'triangle-list',
                },
            });

            function frame() {
                // Sample is no longer the active page.
                if (!pageState.active) return;

                const commandEncoder = device.createCommandEncoder();
                const textureView = context.getCurrentTexture().createView();

                const renderPassDescriptor = {
                colorAttachments: [
                    {
                    view: textureView,
                    clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
                    loadOp: 'clear',
                    storeOp: 'store',
                    },
                ],
                };

                const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
                passEncoder.setPipeline(pipeline);
                passEncoder.draw(3, 1, 0, 0);
                passEncoder.end();

                device.queue.submit([commandEncoder.finish()]);
                requestAnimationFrame(frame);
            }

            requestAnimationFrame(frame);
        };

        onMounted(() => {
            console.log('12313', canvasRef.value, navigator.gpu, process)
            if (canvasRef.value) {
                init({ canvas: canvasRef.value, pageState: { active: true } }).then(data => {
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
        height: 400px;
    }
</style>