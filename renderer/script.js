// 🎨 WebGL Shader Renderer mit WebSockets & QR-Code 🖥️
// 🚀 Lädt QR-Code, verbindet mit WebSocket, zeigt Shader-Canvas an 🎛️

document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Initialisierung gestartet...");

    // 📌 HTML-Elemente abrufen
    const qrContainer = document.getElementById("qr-container"); // QR-Code Box 📷
    const qrCodeImg = document.getElementById("qr-code"); // QR-Code Bild 🖼️
    const canvas = document.getElementById("glCanvas"); // WebGL Canvas 🖥️
    const gl = canvas.getContext("webgl"); // WebGL Rendering-Context 🎨

    // 🌐 Server- & WebSocket-Einstellungen
    const SERVER_IP = "192.168.53.236";  // Ersetze mit deiner Server-IP 🌍
    const SERVER_PORT = 3000; // Express-Server für QR-Code 🚀
    const WS_PORT = 8080; // WebSocket Server 📡

    // 🖼️ 1️⃣ Funktion: QR-Code vom Server abrufen
    async function fetchQRCode() {
        try {
            console.log("📡 Lade QR-Code...");
            const response = await fetch(`http://${SERVER_IP}:${SERVER_PORT}/qrcode`);
            const data = await response.json(); // 📥 JSON richtig parsen
            qrCodeImg.src = data.qr; // 🖼️ Bild-URL setzen
            console.log("✅ QR-Code erfolgreich geladen!");
        } catch (error) {
            console.error("❌ Fehler beim Laden des QR-Codes:", error);
        }
    }
    

    // 🔌 2️⃣ Funktion: WebSocket-Verbindung aufbauen
    function connectWebSocket() {
        console.log("📡 Versuche WebSocket-Verbindung...");
        const socket = new WebSocket(`ws://${SERVER_IP}:${WS_PORT}`);
    
        socket.onopen = () => {
            console.log("✅ Renderer-WebSocket verbunden!");
            socket.send(JSON.stringify({ type: "renderer_connected" })); // 🟢 Renderer meldet sich an
        };
    
        socket.onmessage = (event) => {
            console.log("📩 Nachricht empfangen im Renderer:", event.data);
            const data = JSON.parse(event.data);
    
            if (data.type === "hide_qr") {
                console.log("🎭 UI verbunden! QR-Code verstecken & Shader anzeigen!");
                qrContainer.style.display = "none"; 
                startShaderRendering(); // 🎨 Starte WebGL Rendering!
            }
            
            handleWebSocketMessage(data);
        };
    
        socket.onerror = (error) => console.error("❌ WebSocket-Fehler im Renderer:", error);
        socket.onclose = () => console.log("🔌 Renderer-WebSocket getrennt.");
    }
    
    
    

    // 🎨 3️⃣ Funktion: Shader-Handling & Rendering
    function handleWebSocketMessage(data) {
        console.log("🖥️ WebGL: Nachricht verarbeitet:", data);
    
        if (data.type === "scale") {
            console.log(`🔍 Skaliere Shader: ${data.value}`);
            gl.uniform1f(scaleLocation, data.value);
        }
        if (data.type === "colorR") {
            console.log(`🔍 Ändere Rot-Wert: ${data.value}`);
            gl.uniform3f(colorLocation, data.value, 0.0, 0.0);
        }
        if (data.type === "colorG") {
            console.log(`🔍 Ändere Grün-Wert: ${data.value}`);
            gl.uniform3f(colorLocation, 0.0, data.value, 0.0);
        }
        if (data.type === "colorB") {
            console.log(`🔍 Ändere Blau-Wert: ${data.value}`);
            gl.uniform3f(colorLocation, 0.0, 0.0, data.value);
        }
        if (data.type === "mask") {
            const maskType = data.value === "circle" ? 0 : data.value === "square" ? 1 : 2;
            console.log(`🔍 Schablone setzen: ${data.value} (${maskType})`);
            gl.uniform1i(maskLocation, maskType);
        }
    
        render(); // 🎨 Szene neu rendern
    }
    

    // 🎥 4️⃣ Funktion: WebGL Shader Setup
    function setupWebGL() {
        console.log("🖥️ Initialisiere WebGL...");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const vertexShaderSource = `
            attribute vec2 position;
            uniform float scale;
            void main() {
                gl_Position = vec4(position * scale, 0.0, 1.0);
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;
            uniform vec3 color;
            uniform int mask;
            void main() {
                vec2 uv = gl_FragCoord.xy / vec2(800.0, 600.0) - 0.5;
                float r = length(uv);

                if (mask == 0 && r > 0.3) discard;  // 🟠 Kreis
                if (mask == 1 && (abs(uv.x) > 0.3 || abs(uv.y) > 0.3)) discard;  // 🟦 Quadrat
                if (mask == 2 && uv.y < abs(uv.x)) discard;  // 🔺 Dreieck

                gl_FragColor = vec4(color, 1.0);
            }
        `;

        function createShader(gl, type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            return shader;
        }

        function createProgram(gl, vertexSource, fragmentSource) {
            const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
            const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
            const program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            return program;
        }

        const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
        gl.useProgram(program);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -0.5, -0.5,  0.5, -0.5,  -0.5, 0.5,
             0.5, -0.5,  0.5, 0.5,  -0.5, 0.5
        ]), gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(program, "position");
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        scaleLocation = gl.getUniformLocation(program, "scale");
        colorLocation = gl.getUniformLocation(program, "color");
        maskLocation = gl.getUniformLocation(program, "mask");

        gl.uniform1f(scaleLocation, 1.0);
        gl.uniform3f(colorLocation, 1.0, 0.0, 0.0); // 🎨 Standardfarbe Rot
        gl.uniform1i(maskLocation, 0); // 🟠 Standard-Schablone: Kreis

        render();
    }

    // 🖼️ 5️⃣ Funktion: WebGL Render-Aufruf
    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    function startShaderRendering() {
        console.log("🖥️ Starte WebGL Shader Rendering...");
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    
        const vertexShaderSource = `
            attribute vec2 position;
            void main() {
                gl_Position = vec4(position, 0.0, 1.0);
            }
        `;
    
        const fragmentShaderSource = `
            precision mediump float;
            uniform float time;
            void main() {
                float r = sin(time) * 0.5 + 0.5;
                float g = sin(time + 2.0) * 0.5 + 0.5;
                float b = sin(time + 4.0) * 0.5 + 0.5;
                gl_FragColor = vec4(r, g, b, 1.0);
            }
        `;
    
        function createShader(gl, type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            return shader;
        }
    
        function createProgram(gl, vertexSource, fragmentSource) {
            const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
            const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
            const program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            return program;
        }
    
        const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
        gl.useProgram(program);
    
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1,  1, -1,  -1, 1,
             1, -1,  1,  1,  -1, 1
        ]), gl.STATIC_DRAW);
    
        const positionLocation = gl.getAttribLocation(program, "position");
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    
        const timeLocation = gl.getUniformLocation(program, "time");
    
        function render() {
            const time = performance.now() / 1000; // Zeit in Sekunden
            gl.uniform1f(timeLocation, time);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            requestAnimationFrame(render);
        }
    
        render();
    }
    

    // 🚀 6️⃣ Initialisierung starten
    fetchQRCode(); // 🔄 Lade QR-Code
    connectWebSocket(); // 🌐 Verbinde mit WebSocket
    setupWebGL(); // 🖥️ Starte WebGL
});
