const WebSocket = require("ws");
const { exec } = require("child_process");

const wss = new WebSocket.Server({ port: 81 }, () => {
    console.log("simulador ativo");
    console.log("Aguardando conexão do aplicativo na porta 81..");
});

// O nome do Wi-Fi do seu Tablet (Roteador)
const SSID_ALVO = "brisa-4195049";

setInterval(() => {
    // Filtra apenas as linhas de SSID e Sinal da rede alvo no Windows
    exec(`netsh wlan show networks mode=bssid | findstr /I "${SSID_ALVO} Sinal Signal"`, (err, stdout) => {
        if (err || !stdout) {
            console.log(`Rede "${SSID_ALVO}" não detectada (Wi-Fi desligado ou fora de alcance).`);
            return;
        }

        const lines = stdout.split("\n");
        let sinalPorcentagem = null;

        for (let line of lines) {
            line = line.trim();
            if (line.startsWith("Sinal") || line.startsWith("Signal") || line.toLowerCase().includes("sinal")) {
                const partes = line.split(":");
                if (partes[1]) {
                    sinalPorcentagem = parseInt(partes[1].trim().replace("%", ""));
                }
            }
        }

        if (sinalPorcentagem !== null) {
            //conversão de % para dBm
            const rssi1 = Math.round((sinalPorcentagem / 2) - 100);
            
            // SIMULAÇÃO DO BEACON 02 (Inversamente proporcional ao BEACON 01)-  para teste 
            const rssi2 = -120 - rssi1;

            console.log(` 🔴 ${SSID_ALVO} | BEACON_01: ${rssi1} dBm | BEACON_02: ${rssi2} dBm`);

            // Envia os dados dos DOIS beacons para o app (consertar/revisar)
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        BEACON_01: rssi1,
                        BEACON_02: rssi2, 
                        ssid: SSID_ALVO
                    }));
                }
            });
        } else {
            console.log(`SSID encontrado, mas não foi possível ler a linha de porcentagem do sinal.`);
        }
    }); 
}, 2000); 