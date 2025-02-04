// 🎨 WebGL Shader Renderer mit WebSockets & QR-Code 🖥️
// 🚀 Lädt QR-Code, verbindet mit WebSocket, zeigt Shader-Canvas an 🎛️

import { SHADERS } from "./shaders.js";

let gl;
let program;
let timeLocation;
let resolutionLocation;
let startTime;
let ws;

// WebGL Setup und Initialisierung
function initGL() {
    const canvas = document.getElementById('glCanvas');
    gl = canvas.getContext('webgl');

    if (!gl) {
        console.error('❌ WebGL nicht verfügbar');
        return;
    }

    // Canvas-Größe setzen
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
}

// Shader kompilieren und einrichten
function setupShader(fragmentShaderSource) {
        const vertexShaderSource = `
        attribute vec4 position;
            void main() {
            gl_Position = position;
        }
    `;

    // Vertex Shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    // Fragment Shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    // Shader-Programm erstellen
    if (program) {
        gl.deleteProgram(program);
    }
    program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);

    // Fehlerprüfung
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Shader Programm Fehler:', gl.getProgramInfoLog(program));
        return;
    }

    // Attribute und Uniforms
    const positions = new Float32Array([
        -1, -1,
        1, -1,
        -1, 1,
        1, 1
    ]);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(program, "position");
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    timeLocation = gl.getUniformLocation(program, "time");
    resolutionLocation = gl.getUniformLocation(program, "resolution");
}

// Animation Loop
function animate() {
    if (!program) return;
    
    gl.useProgram(program);
    
    const time = (Date.now() - startTime) * 0.001;
    gl.uniform1f(timeLocation, time);
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(animate);
}

// QR Code Management
//only show qr code 60 secunds after start
async function setupQRCode() {
    const qrContainer = document.getElementById('qr-container');
    const qrImage = document.getElementById('qr-code');
    
    try {
        const response = await fetch('http://localhost:3000/qrcode');
        const data = await response.json();
        qrImage.src = data.qr;
        qrContainer.style.display = 'block';
    } catch (error) {
        console.error('❌ QR-Code Fehler:', error);
    }
}

// WebSocket Verbindung
function setupWebSocket() {
    const WS_PORT = 8080;
    ws = new WebSocket(`ws://localhost:${WS_PORT}`);

    ws.onopen = () => {
        console.log('📡 WebSocket verbunden');
        ws.send(JSON.stringify({ type: 'renderer_connected' }));
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log('📩 Nachricht erhalten:', data);

            switch (data.type) {
                case 'hide_qr':
                    document.getElementById('qr-container').style.display = 'none';
                    break;
                    
                case 'shader_select':
                    if (SHADERS[data.value]) {
                        console.log(`🎨 Lade Shader: ${data.value}`);
                        setupShader(SHADERS[data.value]);
                    }
                    break;
                    
                case 'uniform':
                    if (program) {
                        const location = gl.getUniformLocation(program, data.name);
                        if (location) {
                            // Unterschiedliche Uniform-Typen behandeln
                            switch (data.type) {
                                case 'float':
                                    gl.uniform1f(location, data.value);
                                    break;
                                case 'vec2':
                                    gl.uniform2f(location, data.value[0], data.value[1]);
                                    break;
                                case 'vec3':
                                    gl.uniform3f(location, data.value[0], data.value[1], data.value[2]);
                                    break;
                                case 'scale':
                                    gl.uniform1f(location, data.value);
                                    break;
                            }
                        }
                    }
                    break;
            }
        } catch (error) {
            console.error('❌ Fehler beim Verarbeiten der Nachricht:', error);
        }
    };

    ws.onclose = () => {
        console.log('🔌 WebSocket getrennt, versuche neu zu verbinden...');
        setTimeout(setupWebSocket, 2000);
    };
}

// Initialer Default-Shader
const defaultShader = `
            precision mediump float;
    
    uniform float time;
    uniform vec2 resolution;
    
    void main() {
        vec2 uv = gl_FragCoord.xy/resolution.xy;
        vec3 color = 0.5 + 0.5*cos(time + uv.xyx + vec3(0,2,4));
                gl_FragColor = vec4(color, 1.0);
            }
        `;

// Startup
async function init() {
    initGL();
    setupShader(SHADERS["RainbowMirror"]);
    startTime = Date.now();
    animate();
    setTimeout(async () => {
        await setupQRCode();
    }, 500);
    setupWebSocket();
}

// Start wenn das DOM geladen ist
document.addEventListener('DOMContentLoaded', init);
