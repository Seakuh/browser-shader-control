import React from "react";
import { sendMessage } from "./websocket";

interface FaderProps {
    label: string;
    min?: number;
    max?: number;
    step?: number;
    type: string;
    initialValue?: number;
}

const Fader: React.FC<FaderProps> = ({ label, min = 0, max = 1, step = 0.01, type, initialValue = 0.5 }) => {
    const [value, setValue] = React.useState(initialValue);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseFloat(e.target.value);
        setValue(newValue);
        sendMessage(JSON.stringify({ type, value: newValue }));
    };

    return (
        <div style={{ margin: "10px" }}>
            <label>{label}: {value.toFixed(2)}</label>
            <input type="range" min={min} max={max} step={step} value={value} onChange={handleChange} />
        </div>
    );
};

export default Fader;
