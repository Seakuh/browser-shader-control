import React, { useState } from "react";
import { sendMessage } from "./websocket";

const masks = {
    "Kreis": "circle",
    "Quadrat": "square",
    "Dreieck": "triangle"
};

function MaskSelector() {
    const [selectedMask, setSelectedMask] = useState("circle");

    const handleMaskChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedMask(value);
        sendMessage(JSON.stringify({ type: "mask", value }));
    };

    return (
        <div style={{ textAlign: "center", marginTop: "10px" }}>
            <label>Schablone:</label>
            <select value={selectedMask} onChange={handleMaskChange}>
                {Object.entries(masks).map(([name, value]) => (
                    <option key={value} value={value}>{name}</option>
                ))}
            </select>
        </div>
    );
}

export default MaskSelector;
