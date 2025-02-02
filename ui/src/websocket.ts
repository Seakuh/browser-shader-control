const SERVER_IP = "192.168.53.236"; // Deine lokale IP-Adresse 🌍
const WS_PORT = 8080;
const socket = new WebSocket(`ws://${SERVER_IP}:${WS_PORT}`);

socket.onopen = () => {
    console.log("✅ UI WebSocket verbunden! Melde Verbindung an den Server...");
    socket.send(JSON.stringify({ type: "ui_connected" }));
};

export function sendMessage(message: string) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(message);
    }
}

