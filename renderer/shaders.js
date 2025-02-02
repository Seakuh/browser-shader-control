const shaders = {
    "wave.glsl": `
        precision mediump float;
        uniform float time;
        void main() {
            gl_FragColor = vec4(sin(time), cos(time), 0.5, 1.0);
        }
    `,
    "noise.glsl": `
        precision mediump float;
        uniform float time;
        void main() {
            gl_FragColor = vec4(fract(sin(dot(gl_FragCoord.xy, vec2(12.9898,78.233))) * 43758.5453));
        },
        
    `,
    "default": `
        precision mediump float;
        uniform vec3 color;
        uniform float scale;
        uniform int mask;  // 0 = Kreis, 1 = Quadrat, 2 = Dreieck

        void main() {
            vec2 uv = gl_FragCoord.xy / vec2(800.0, 600.0) - 0.5;
            float r = length(uv) * scale;

            if (mask == 0 && r > 0.3) discard;  // Kreis
            if (mask == 1 && (abs(uv.x) > 0.3 || abs(uv.y) > 0.3)) discard;  // Quadrat
            if (mask == 2 && uv.y < abs(uv.x)) discard;  // Dreieck

            gl_FragColor = vec4(color, 1.0);
        }
    `
};


const vertexShaderSource = `
    attribute vec2 position;
    uniform float scale;
    varying vec2 vPos;
    
    void main() {
        vPos = position * scale;
        gl_Position = vec4(vPos, 0.0, 1.0);
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    uniform int shape;
    varying vec2 vPos;

    void main() {
        float r = length(vPos);
        if (shape == 0 && r > 0.5) discard;  // Kreis
        if (shape == 1 && (abs(vPos.x) > 0.5 || abs(vPos.y) > 0.5)) discard;  // Quadrat
        gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
    }
`;


function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader Fehler:", gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}
