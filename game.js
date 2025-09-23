const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// -------------------------
// Variáveis do jogo
// -------------------------
let velocidadePersonagem = 3;
let velocidadeCarros = 3;
let contVidas = 3;
let contTempo = 120;
let contTotal = 0;
let jogoAtivo = true;
let musicaIniciada = false;
let ultimoTimestamp = Date.now();
let nomeJogador = prompt("Digite seu nome:") || "Jogador";

// -------------------------
// Personagem com sprites
// -------------------------
class Personagem {
    constructor(x, y, largura, altura, sprites) {
        this.x = x;
        this.y = y;
        this.largura = largura;
        this.altura = altura;
        this.sprites = sprites;
        this.direcao = "down";
    }
    draw() {
        const s = this.sprites[this.direcao][0];
        ctx.drawImage(s.img, s.sx, s.sy, s.sw, s.sh, this.x, this.y, this.largura, this.altura);
    }
}

// -------------------------
// Carro
// -------------------------
class Carro {
    constructor(img, x, y, dir = 1) {
        this.img = img;
        this.x = x;
        this.y = y;
        this.dir = dir;
    }
    mover() {
        this.x += velocidadeCarros * this.dir;
        if (this.dir === 1 && this.x > canvas.width + 100) this.x = -Math.random() * 400;
        if (this.dir === -1 && this.x < -100) this.x = canvas.width + Math.random() * 400;
    }
}

// -------------------------
// Função para carregar imagem
// -------------------------
function carregarImagem(src) { const img = new Image(); img.src = src; return img; }

// -------------------------
// Imagens
// -------------------------
const cenario = carregarImagem("imagens/cenario.png");
const spritesImg = carregarImagem("imagens/sprites.png");
const carrosImgs = [
    carregarImagem("imagens/carro1.png"),
    carregarImagem("imagens/carro2.png"),
    carregarImagem("imagens/carro3.png"),
    carregarImagem("imagens/carro4.png"),
    carregarImagem("imagens/carro5.png"),
    carregarImagem("imagens/carro6.png")
];
const vidasImgs = [
    carregarImagem("imagens/vazio.png"),
    carregarImagem("imagens/1cheio.png"),
    carregarImagem("imagens/2cheio.png"),
    carregarImagem("imagens/3cheio.png")
];
const fim = carregarImagem("imagens/gameover.png");
const venceu = carregarImagem("imagens/venceu.png");

// -------------------------
// Sons
// -------------------------
const musicaFundo = new Audio("sons/musica_fundo.mp3"); musicaFundo.loop = true;
const batidaCarro = new Audio("sons/batida.mp3");
const casaOk = new Audio("sons/casa_ok.mp3");
const win = new Audio("sons/win.mp3");

// -------------------------
// Sprites do personagem
// -------------------------
const spriteFrames = {
    down: [{ img: spritesImg, sx: 0, sy: 0, sw: 44, sh: 44 }],
    left: [{ img: spritesImg, sx: 0, sy: 44, sw: 44, sh: 44 }],
    right: [{ img: spritesImg, sx: 0, sy: 88, sw: 44, sh: 44 }],
    up: [{ img: spritesImg, sx: 0, sy: 132, sw: 44, sh: 44 }]
};

let entregador = new Personagem(595, 550, 44, 44, spriteFrames);

// -------------------------
// Carros
// -------------------------
let carros = [
    new Carro(carrosImgs[0], 0, 358, 1),
    new Carro(carrosImgs[1], 0, 243, 1),
    new Carro(carrosImgs[2], -100, 243, 1),
    new Carro(carrosImgs[3], 1400, 405, -1),
    new Carro(carrosImgs[4], 800, 405, -1),
    new Carro(carrosImgs[5], 800, 293, -1)
];

// -------------------------
// Casas e obstáculos
// -------------------------
const casas = [
    { x: 120, y: 130, entregue: false },
    { x: 370, y: 130, entregue: false },
    { x: 635, y: 130, entregue: false }
];
const obstaculos = [
    { x: 0, y: 450, largura: 582, altura: 162 },
    { x: 0, y: 142, largura: 115, altura: 90 },
    { x: 168, y: 142, largura: 198, altura: 90 },
    { x: 325, y: 125, largura: 42, altura: 90 },
    { x: 420, y: 142, largura: 200, altura: 90 },
    { x: 600, y: 142, largura: 30, altura: 87 },
    { x: 680, y: 142, largura: 133, altura: 90 }
];

// -------------------------
// Controles
// -------------------------
let teclas = {};
document.addEventListener("keydown", e => { teclas[e.key] = true; if (!musicaIniciada) { musicaFundo.play(); musicaIniciada = true; } });
document.addEventListener("keyup", e => teclas[e.key] = false);

// -------------------------
// Controles touch mobile
// -------------------------
function criarControlesMobile() {
    const direcoes = ["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"];
    direcoes.forEach(d => {
        const btn = document.createElement("button");
        btn.innerText = d.replace("Arrow","");
        btn.style.position = "absolute";
        btn.style.bottom = d==="ArrowUp"? "100px": d==="ArrowDown"? "20px": "60px";
        btn.style.left = d==="ArrowLeft"? "20px": d==="ArrowRight"? "140px": "80px";
        btn.style.width = "60px";
        btn.style.height = "60px";
        btn.style.opacity = 0.5;
        document.body.appendChild(btn);
        btn.addEventListener("touchstart", e => { e.preventDefault(); teclas[d] = true; });
        btn.addEventListener("touchend", e => { e.preventDefault(); teclas[d] = false; });
    });
}
criarControlesMobile();

// -------------------------
// Colisão
// -------------------------
function checarColisao(carro) {
    return entregador.x < carro.x + 55 &&
        entregador.x + entregador.largura > carro.x &&
        entregador.y < carro.y + 30 &&
        entregador.y + entregador.altura > carro.y;
}
function checarColisaoObstaculo(nx, ny) {
    for (let obs of obstaculos) {
        if (nx < obs.x + obs.largura &&
            nx + entregador.largura > obs.x &&
            ny < obs.y + obs.altura &&
            ny + entregador.altura > obs.y) {
            return true;
        }
    }
    return false;
}

// -------------------------
// Movimentação personagem
// -------------------------
function moverPersonagem() {
    let nx = entregador.x;
    let ny = entregador.y;

    if (teclas["ArrowUp"] && entregador.y > 0) { ny -= velocidadePersonagem; entregador.direcao = "up"; }
    if (teclas["ArrowDown"] && entregador.y < canvas.height - entregador.altura) { ny += velocidadePersonagem; entregador.direcao = "down"; }
    if (teclas["ArrowLeft"] && entregador.x > 0) { nx -= velocidadePersonagem; entregador.direcao = "left"; }
    if (teclas["ArrowRight"] && entregador.x < canvas.width - entregador.largura) { nx += velocidadePersonagem; entregador.direcao = "right"; }

    // Não ultrapassar casas entregues
    for (let casa of casas) {
        if (casa.entregue) {
            let casaTopo = casa.y;
            if (ny < casaTopo && nx + entregador.largura > casa.x && nx < casa.x + 35) {
                ny = casaTopo;
            }
        }
    }

    if (!checarColisaoObstaculo(nx, ny)) { entregador.x = nx; entregador.y = ny; }
}

// -------------------------
// Atualização carros
// -------------------------
function atualizarCarros() {
    carros.forEach(carro => {
        carro.mover();
        if (checarColisao(carro)) {
            batidaCarro.currentTime = 0;
            batidaCarro.play();
            entregador.x = 595;
            entregador.y = 550;
            contVidas--;
        }
    });
}

// -------------------------
// Entregas
// -------------------------
function checarEntregas() {
    casas.forEach(casa => {
        if (!casa.entregue &&
            entregador.x + entregador.largura > casa.x &&
            entregador.x < casa.x + 35 &&
            entregador.y < casa.y + 10
        ) {
            casa.entregue = true;
            contTotal++;
            casaOk.currentTime = 0;
            casaOk.play();
        }
    });
}

// -------------------------
// Enviar placar para AWS
// -------------------------
function enviarPlacar() {
    const dados = {
        nome: nomeJogador,       // Nome do jogador
        pontuacao: contTotal      // Pontuação do jogador
    };

    fetch("https://id-seu-api.execute-api.us-east-1.amazonaws.com/dev/placar", { // URL completa com stage e rota
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    })
    .then(res => res.json())
    .then(resp => console.log("✅ Placar salvo:", resp))
    .catch(err => console.error("❌ Erro ao salvar placar:", err));
}


// -------------------------
// Fim ou vitória
// -------------------------
function checarFim() {
    if (contTotal === 3) {
        jogoAtivo = false;
        musicaFundo.pause();
        ctx.drawImage(venceu, 0, 0);
        win.play();
        enviarPlacar();
        setTimeout(resetGame, 5000);
    } else if (contVidas === 0 || contTempo <= 0) {
        jogoAtivo = false;
        musicaFundo.pause();
        ctx.drawImage(fim, 0, 0);
        enviarPlacar();
        setTimeout(resetGame, 5000);
    }
}

// -------------------------
// Reset do jogo
// -------------------------
function resetGame() {
    contVidas = 3;
    contTempo = 120;
    contTotal = 0;
    casas.forEach(c => c.entregue = false);
    entregador.x = 595;
    entregador.y = 550;
    jogoAtivo = true;
    musicaFundo.currentTime = 0;
    musicaFundo.play();
    ultimoTimestamp = Date.now();
    requestAnimationFrame(gameLoop);
}

// -------------------------
// Loop principal
// -------------------------
function gameLoop() {
    if (!jogoAtivo) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(cenario, 0, 0);

    ctx.drawImage(vidasImgs[contVidas], 7, 17);

    // temporizador
    const tempoX = 740, tempoY = 50, tempoWidth = 60, tempoHeight = 40;
    ctx.fillStyle = "white";
    ctx.fillRect(tempoX - 5, tempoY - 30, tempoWidth, tempoHeight);
    ctx.font = "30px Comic Sans MS";
    ctx.fillStyle = "black";
    ctx.fillText(contTempo, tempoX, tempoY);

    const agora = Date.now();
    if (jogoAtivo && contTempo > 0 && agora - ultimoTimestamp >= 1000) {
        contTempo--;
        ultimoTimestamp = agora;
    }

    moverPersonagem();
    entregador.draw();

    atualizarCarros();
    carros.forEach(carro => ctx.drawImage(carro.img, carro.x, carro.y));

    checarEntregas();
    checarFim();

    requestAnimationFrame(gameLoop);
}

// -------------------------
// Iniciar jogo
// -------------------------
requestAnimationFrame(gameLoop);
