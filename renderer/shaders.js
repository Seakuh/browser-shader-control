// Shader-Definitionen
export const SHADERS = {
    "Default": `
        precision mediump float;
        uniform float time;
        uniform vec2 resolution;
        
        void main() {
            vec2 uv = gl_FragCoord.xy/resolution.xy;
            vec3 color = 0.5 + 0.5*cos(time + uv.xyx + vec3(0,2,4));
            gl_FragColor = vec4(color, 1.0);
        }
    `,
    
    "Kaleidoskop": `
        precision mediump float;
        uniform float time;
        uniform vec2 resolution;
        
        void main() {
            vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
            vec2 p = mod(uv * 8.0, 2.0) - 1.0;
            vec3 color = 0.5 + 0.5 * cos(time + length(p) + vec3(0,2,4));
            gl_FragColor = vec4(color, 1.0);
        }
    `,
    
    "Wellen": `
        precision mediump float;
        uniform float time;
        uniform vec2 resolution;
        uniform float amplitude;
        uniform float frequency;
        uniform float speed;

        void main() {
            vec2 uv = gl_FragCoord.xy / resolution.xy;
            
            float wave = sin(uv.x * frequency * 10.0 + time * speed) * amplitude;
            wave += sin(uv.y * frequency * 8.0 + time * speed * 0.8) * amplitude;
            
            vec3 color = vec3(0.5) + vec3(wave);
            color = mix(
                vec3(0.2, 0.5, 0.8),
                vec3(0.8, 0.2, 0.5),
                color
            );
            
            gl_FragColor = vec4(color, 1.0);
        }
    `,

    "Farbwirbel": `
        precision mediump float;
        uniform float time;
        uniform vec2 resolution;
        
        void main() {
            vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
            float angle = atan(uv.y, uv.x) + time;
            vec3 color = 0.5 + 0.5 * cos(angle + vec3(0,2,4));
            gl_FragColor = vec4(color, 1.0);
        }
    `,

    "RainbowMirror": `
        precision mediump float;
        uniform float time;
        uniform vec2 resolution;
        uniform float scale;

        #define PI 3.14159265359
        #define PHI 1.61803398875
        #define LN_PHI 0.48121182506
        #define PI_OVER_FIVE 0.62831853071
        #define FREQ1 0.5
        #define FREQ2 0.2

        // saw
        float gen(float x, float o, float s) {
            return fract(log(abs(x))/(LN_PHI + s) - o);
        }

        void main() {
            vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
            uv *= scale;
            
            float t = FREQ1 * time;
            float t2 = 1.0 + sin(FREQ2 * time);
            float sum = 0.0;
            for (int i = 0; i < 5; i++) {
                float rot = uv.x * sin(PI_OVER_FIVE * float(i)) + uv.y * cos(PI_OVER_FIVE * float(i));
                sum += gen(rot, t, t2);
            }
            vec3 col;
            if ( mod(floor(sum),2.0) == 0.0 ) {
                col = vec3(fract(sum));     
            } else {
                col = vec3(1.0 - fract(sum));
            }
            vec3 color = 0.5 + 0.5 * cos(atan(uv.y, uv.x) + time + vec3(0,2,4));
            gl_FragColor = vec4(color, 1.0);
        }
    `
};

// Initialisiere die Shader global
function initShaders() {
    window.shaders = SHADERS;
    console.log('📚 Shader geladen:', Object.keys(window.shaders));
}

// Exportiere die Initialisierungsfunktion
window.initShaders = initShaders;
