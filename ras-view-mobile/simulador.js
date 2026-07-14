const WebSocket = require("ws");
const { exec } = require("child_process");

// === CONFIGURAÇÃO ===
const PORTA = 8081; 
const SSID_ALVO = "Rede Arthur 5G";

const wss = new WebSocket.Server({ port: PORTA }, () => {
    console.log("=== SIMULADOR ATIVO ===");
    console.log(`Aguardando conexão do aplicativo na porta ${PORTA}...\n`);
});

let ultimoRssi1 = -70; // Valor padrão caso o scan falhe

setInterval(() => {
    if (process.platform === "win32") {
        // === CÓDIGO PARA WINDOWS ===
        exec(`netsh wlan show networks mode=bssid | findstr /I "${SSID_ALVO} Sinal Signal"`, (err, stdout) => {
            let sinalPorcentagem = null;
            if (!err && stdout) {
                const lines = stdout.split("\n");
                for (let line of lines) {
                    line = line.trim();
                    if (/sinal|signal/i.test(line)) {
                        const partes = line.split(":");
                        if (partes[1]) {
                            sinalPorcentagem = parseInt(partes[1].trim().replace("%", ""));
                        }
                    }
                }
            }
            const rssi1 = sinalPorcentagem !== null ? Math.round((sinalPorcentagem / 2) - 100) : ultimoRssi1;
            processarEEnviar(rssi1);
        });
    } else if (process.platform === "linux") {
        // === CÓDIGO PARA LINUX (UBUNTU) ===
        // nmcli lista as redes no formato: SSID:SINAL
        exec("nmcli -t -f SSID,SIGNAL dev wifi", (err, stdout) => {
            let sinalPorcentagem = null;
            if (!err && stdout) {
                const lines = stdout.split("\n");
                for (let line of lines) {
                    const partes = line.trim().split(":");
                    if (partes[0] === SSID_ALVO && partes[1]) {
                        sinalPorcentagem = parseInt(partes[1]);
                        break; // Encontrou a rede alvo, pode parar o loop
                    }
                }
            }

            if (sinalPorcentagem !== null) {
                // Conversão de % para dBm no Linux
                const rssi1 = Math.round((sinalPorcentagem / 2) - 100);
                ultimoRssi1 = rssi1;
                processarEEnviar(rssi1);
            } else {
                console.log(`[AVISO] Rede "${SSID_ALVO}" não detectada no scan do Linux. Usando simulado: ${ultimoRssi1} dBm`);
                processarEEnviar(ultimoRssi1);
            }
        });
    } else {
        // Fallback genérico caso rode em outro lugar
        processarEEnviar(-65);
    }
}, 2000);

function processarEEnviar(rssi1) {
    // Simulação física dos outros dois beacons para a trilateração do usePosition funcionar
    const rssi2 = Math.max(-95, Math.min(-40, -135 - rssi1)); 
    const rssi3 = Math.max(-95, Math.min(-40, -110 - (rssi1 / 1.5)));

    console.log(` 🔴 ${SSID_ALVO} | B1: ${rssi1} dBm | B2: ${rssi2} dBm | B3: ${rssi3} dBm`);

    const payload = JSON.stringify({
        "BEACON_01": rssi1,
        "BEACON_02": rssi2, 
        "BEACON_03": rssi3,
        "ssid": SSID_ALVO
    });

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
        }
    });
}