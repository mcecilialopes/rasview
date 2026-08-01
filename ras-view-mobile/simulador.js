const WebSocket = require("ws");
const { exec } = require("child_process");


const PORTA = 8081;

const wss = new WebSocket.Server({ port: PORTA }, () => {
    console.log("simulador ligado");
    console.log(`esperando conexão do aplicativo na porta ${PORTA}...\n`);
});

// último sinal conhecido 
let ultimosSinais = {}; 

setInterval(() => {
    if (process.platform === "win32") {
        //windows
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

                    //  qualuqer sinal com o nome ras 
                    if (/sinal|signal/i.test(line) && ssidAtual && ssidAtual.toUpperCase().includes("RAS")) {
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
        // linux
        exec("nmcli -t -f SSID,SIGNAL dev wifi", (err, stdout) => {
            let sinaisEncontrados = {};

            if (!err && stdout) {
                const lines = stdout.split("\n");
                for (let line of lines) {
                    const partes = line.trim().split(":");
                    
                    // verifica se existe 
                    if (partes[0] && partes[0].toUpperCase().includes("RAS") && partes[1]) {
                        sinaisEncontrados[partes[0]] = parseInt(partes[1]);
                    }
                }
            }

            processarEEnviar(sinaisEncontrados);
        });
    } else {
        processarEEnviar({});
    }
}, 2000);

function processarEEnviar(sinaisPorcentagem) {
    let redesProcessadas = [];

    // porcentagem para rssid
    for (let ssid in sinaisPorcentagem) {
        const rssi = Math.round((sinaisPorcentagem[ssid] / 2) - 100);
        ultimosSinais[ssid] = rssi;
        redesProcessadas.push({ ssid, rssi });
    }

    // caso de falha
    if (redesProcessadas.length === 0 && Object.keys(ultimosSinais).length > 0) {
        for (let ssid in ultimosSinais) {
            redesProcessadas.push({ ssid, rssi: ultimosSinais[ssid] });
        }
    }

    // ordem da força do sinal
    redesProcessadas.sort((a, b) => b.rssi - a.rssi);

    
    const top3 = redesProcessadas.slice(0, 3);

    const payload = {};
    top3.forEach((rede) => {
        
        payload[rede.ssid] = rede.rssi;
    });

    //terminal
    if (top3.length > 0) {
        const logTexto = top3.map(r => `${r.ssid}: ${r.rssi} dBm`).join(" | ");
        console.log(` Top ${top3.length}: ${logTexto}`);
    } else {
        console.log(` nenhuma rede RAS detectada neste ciclo.`);
    }

    // Envia via WebSocket
    const mensagem = JSON.stringify(payload);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(mensagem);
        }
    });
}