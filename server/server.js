const WebSocket = require("ws");
const express = require("express");
const QRCode = require("qrcode");
const cors = require("cors");
const os = require("os");

const app = express();
const PORT = 3000;
const WS_PORT = 8080;
const wss = new WebSocket.Server({ port: WS_PORT });

app.use(cors());

// 🖥️ Lokale IP abrufen
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (let iface of Object.values(interfaces)) {
        for (let info of iface) {
            if (info.family === "IPv4" && !info.internal) {
                return info.address;
            }
        }
    }
    return "127.0.0.1"; // Fallback
}

const localIP = getLocalIP();
console.log(`🌍 Lokale IP für QR-Code: ${localIP}`);

let rendererSocket = null;
let uiClients = new Set();

// 🎯 QR-Code API
app.get("/qrcode", async (req, res) => {
    try {
        const url = `http://${localIP}:5174/`;
        console.log(`📡 Generiere QR-Code für: ${url}`);
        const qrCodeData = await QRCode.toDataURL(url);
        res.json({ qr: qrCodeData });
    } catch (error) {
        console.error("❌ Fehler beim Generieren des QR-Codes:", error);
        res.status(500).json({ error: "QR-Code Fehler" });
    }
});

// 🎛️ WebSocket-Handling
wss.on("connection", (ws, req) => {
    const ip = req.socket.remoteAddress;
    console.log(`📡 WebSocket-Verbindung von ${ip}`);

    ws.on("message", (message) => {
        try {
            const msgString = message.toString(); // 🛠 Buffer in String konvertieren
            console.log("📩 Nachricht erhalten:", msgString);
            
            const data = JSON.parse(msgString); // 🔄 JSON parsen
    
            if (data.type === "renderer_connected") {
                rendererSocket = ws;
                console.log("✅ Renderer verbunden!");
                return;
            }
    
            if (data.type === "ui_connected") {
                uiClients.add(ws);
                console.log("✅ UI verbunden! 🔗 Anzahl:", uiClients.size);
    
                if (rendererSocket && rendererSocket.readyState === WebSocket.OPEN) {
                    console.log("📤 Sende 'hide_qr' an Renderer!");
                    rendererSocket.send(JSON.stringify({ type: "hide_qr" }));
                }
                return;
            }
    
            if (!rendererSocket || rendererSocket.readyState !== WebSocket.OPEN) {
                console.warn("⚠️ Kein Renderer verbunden! Nachricht nicht weitergeleitet.");
                return;
            }
    
            console.log(`📤 Weiterleite an Renderer: ${msgString}`);
            rendererSocket.send(msgString);
    
        } catch (err) {
            console.error("⚠️ Fehler beim Verarbeiten der Nachricht:", err);
        }
    });
    
    // 🛑 Verbindung schließen, wenn ein UI-Client trennt
    ws.on("close", () => {
        if (uiClients.has(ws)) {
            uiClients.delete(ws);
            console.log("🔌 UI getrennt. Verbleibende UI-Clients:", uiClients.size);
        }
        if (ws === rendererSocket) {
            console.log("❌ Renderer getrennt.");
            rendererSocket = null;
        }
    });
});

// 🛠 UI-Hosting
app.use("/ui", express.static("../ui/dist"));

app.listen(PORT, () => console.log(`✅ Server läuft auf http://${localIP}:${PORT}`));
console.log(`📡 WebSocket-Server läuft auf ws://${localIP}:${WS_PORT}`);
