import React, { useState } from "react";
import { sendMessage } from "./websocket";
import styles from './MaskSelector.module.css';
import Fader from './Fader';

const shaders = {
    "Kaleidoskop": {
        name: "Kaleidoskop",
        uniforms: {
            segments: { type: "float", min: 2, max: 16, default: 6 },
            rotation: { type: "float", min: 0, max: 6.28, default: 0 },
            zoom: { type: "float", min: 0.1, max: 2, default: 1 }
        }
    },
    "Wellen": {
        name: "Wellen",
        uniforms: {
            amplitude: { type: "float", min: 0, max: 1, default: 0.5 },
            frequency: { type: "float", min: 0, max: 10, default: 4 },
            speed: { type: "float", min: 0, max: 5, default: 1 }
        }
    },
    "Farbwirbel": {
        name: "Farbwirbel",
        uniforms: {
            intensity: { type: "float", min: 0, max: 2, default: 1 },
            colorMix: { type: "float", min: 0, max: 1, default: 0.5 },
            swirl: { type: "float", min: -5, max: 5, default: 0 }
        }
    },
    "RainbowMirror": {
        name: "RainbowMirror",
        uniforms: {
            scale: { type: "float", min: 0.5, max: 2, default: 1 }
        }
    }
};

function MaskSelector() {
    const [selectedShader, setSelectedShader] = useState("");

    const handleShaderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedShader(value);
        sendMessage(JSON.stringify({ 
            type: "shader_select", 
            value: value 
        }));
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Shader Controller 🎨</h1>
            <div className={styles.selectWrapper}>
                <select
                    value={selectedShader}
                    onChange={handleShaderChange}
                    className={styles.select}
                >
                    <option value="">Wähle einen Shader 🎭</option>
                    {Object.entries(shaders).map(([key, shader]) => (
                        <option key={key} value={key}>
                            {shader.name}
                        </option>
                    ))}
                </select>
                <span className={styles.selectIcon}>▼</span>
            </div>
            
            {selectedShader && shaders[selectedShader] && (
                <div className={styles.faderGrid}>
                    {Object.entries(shaders[selectedShader].uniforms).map(([name, config]) => (
                        <Fader
                            key={name}
                            label={name}
                            type={`uniform:${name}`}
                            min={config.min}
                            max={config.max}
                            initialValue={config.default}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default MaskSelector;
