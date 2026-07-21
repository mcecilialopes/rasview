const WebSocket = require("ws");
const { exec } = require("child_process");

// === CONFIGURAÇÃO ===
const PORTA = 8081;
const SSIDS_ALVO = ["RAS_BEACON_01", "RAS_BEACON_02", "RAS_BEACON_03"];

const wss = new WebSocket.Server({ port: PORTA }, () => {
    console.log("=== SIMULADOR ATIVO ===");
    console.log(`Aguardando conexão do aplicativo na porta ${PORTA}...\n`);
});

let ultimosValores = {
    "RAS_BEACON_01": -70,
    "RAS_BEACON_02": -70,
    "RAS_BEACON_03": -70,
}; // Valores padrao caso o scan falhe

setInterval(() => {
    if (process.platform === "win32") {
        // === CÓDIGO PARA WINDOWS ===
        // sem findstr aqui na frente: precisamos da saida inteira pra saber
        // qual linha de "Sinal" pertence a qual SSID
        exec("netsh wlan show networks mode=bssid", (err, stdout) => {
            let sinaisEncontrados = {};

            if (!err && stdout) {
                const lines = stdout.split("\n");
                let ssidAtual = null;

                for (let line of lines) {
                    line = line.trim();

                    const matchSsid = line.match(/^SSID\s+\d+\s*:\s*(.+)$/i);
                    if (matchSsid) {
                        ssidAtual = matchSsid[1].trim();
                        continue;
                    }

                    if (/sinal|signal/i.test(line) && ssidAtual && SSIDS_ALVO.includes(ssidAtual)) {
                        const partes = line.split(":");
                        if (partes[1] && sinaisEncontrados[ssidAtual] === undefined) {
                            sinaisEncontrados[ssidAtual] = parseInt(partes[1].trim().replace("%", ""));
                        }
                    }
                }
            }

            processarEEnviar(sinaisEncontrados);
        });
    } else if (process.platform === "linux") {
        // === CÓDIGO PARA LINUX (UBUNTU) ===
        // nmcli lista as redes no formato: SSID:SINAL
        exec("nmcli -t -f SSID,SIGNAL dev wifi", (err, stdout) => {
            let sinaisEncontrados = {};

            if (!err && stdout) {
                const lines = stdout.split("\n");
                for (let line of lines) {
                    const partes = line.trim().split(":");
                    if (SSIDS_ALVO.includes(partes[0]) && partes[1]) {
                        sinaisEncontrados[partes[0]] = parseInt(partes[1]);
                        // sem break: precisamos continuar procurando os outros 2 SSIDs
                    }
                }
            }

            processarEEnviar(sinaisEncontrados);
        });
    } else {
        // Fallback generico caso rode em outro lugar
        processarEEnviar({});
    }
}, 2000);

function processarEEnviar(sinaisPorcentagem) {
    const payload = {};

    SSIDS_ALVO.forEach((ssid, indice) => {
        const nomeBeacon = `RAS_BEACON_0${indice + 1}`;

        if (sinaisPorcentagem[ssid] !== undefined) {
            const rssi = Math.round((sinaisPorcentagem[ssid] / 2) - 100);
            ultimosValores[ssid] = rssi;
            payload[nomeBeacon] = rssi;
        } else {
            console.log(`[AVISO] "${ssid}" não detectada nesse scan. Usando último valor: ${ultimosValores[ssid]} dBm`);
            payload[nomeBeacon] = ultimosValores[ssid];
        }
    });

    console.log(` 🔴 B1: ${payload.RAS_BEACON_01} dBm | B2: ${payload.RAS_BEACON_02} dBm | B3: ${payload.RAS_BEACON_03} dBm`);

    const mensagem = JSON.stringify(payload);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(mensagem);
        }
    });
}
