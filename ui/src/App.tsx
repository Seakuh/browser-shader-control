import Fader from "./Fader";
import MaskSelector from "./MaskSelector";

function App() {
    return (
        <div style={{ textAlign: "center" }}>
            <h1>Shader Control</h1>
            <MaskSelector />
            <Fader label="Scale" type="scale" min={0.5} max={2} />
            <Fader label="Color R" type="colorR" min={0} max={1} />
            <Fader label="Color G" type="colorG" min={0} max={1} />
            <Fader label="Color B" type="colorB" min={0} max={1} />
        </div>
    );
}

export default App;
