import React from "react";
import { sendMessage } from "./websocket";
import styles from './Fader.module.css';

interface FaderProps {
    label: string;
    min?: number;
    max?: number;
    step?: number;
    type: string;
    initialValue?: number;
}

const getEmoji = (label: string): string => {
    const emojiMap: { [key: string]: string } = {
        'Brightness': '✨',
        'Contrast': '🌓',
        'Saturation': '🎨',
        'Hue': '🌈',
        'Speed': '⚡',
        'Size': '📏',
        'Opacity': '👻',
        'Volume': '🔊',
        'Intensity': '💪',
    };
    
    // Sucht nach einem passenden Emoji oder gibt ein Standard-Emoji zurück
    for (const [key, emoji] of Object.entries(emojiMap)) {
        if (label.toLowerCase().includes(key.toLowerCase())) {
            return emoji;
        }
    }
    return '🎛️';
};

const Fader: React.FC<FaderProps> = ({ 
    label, 
    min = 0, 
    max = 1, 
    step = 0.01, 
    type, 
    initialValue = 0.5 
}) => {
    const [value, setValue] = React.useState(initialValue);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseFloat(e.target.value);
        setValue(newValue);
        sendMessage(JSON.stringify({ type, value: newValue }));
    };

    return (
        <div className={styles.faderContainer}>
            <div className={styles.label}>
                {getEmoji(label)} {label} 
                <span className={styles.value}>{value.toFixed(2)}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={handleChange}
                className={styles.slider}
            />
        </div>
    );
};

export default Fader;
