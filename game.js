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
        this.spriteIndex = 0;
        this.frameCount = 0;
    }
    animar() {
        this.frameCount++;
        if(this.frameCount % 10 === 0){ // muda sprite a cada 10 frames
            this.spriteIndex = (this.spriteIndex + 1) % this.sprites.length;
        }
    }
    draw() {
        const s = this.sprites[this.spriteIndex];
        ctx.drawImage(
            s.img,
            s.sx, s.sy, s.sw, s.sh,
            this.x, this.y, this.largura, this.altura
        );
    }
}

// -------------------------
// Carro
// -------------------------
class Carro {
    constructor(img, x, y, dir=1){
        this.img = img;
        this.x = x;
        this.y = y;
        this.dir = dir;
    }
    mover() {
        this.x += velocidadeCarros * this.dir;
        if(this.dir === 1 && this.x > canvas.width + 100) this.x = -Math.random()*1000;
        if(this.dir === -1 && this.x < -100) this.x = 800 + Math.random()*1000;
    }
}

// -------------------------
// Função para carregar imagem
// -------------------------
function carregarImagem(src){ const img = new Image(); img.src = src; return img; }

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
const musicaFundo = new Audio("sons/musica_fundo.mp3"); musicaFundo.loop = true; musicaFundo.play();
const batidaCarro = new Audio("sons/batida.mp3");
const casaOk = new Audio("sons/casa_ok.mp3");
const win = new Audio("sons/win.mp3");

// -------------------------
// Sprites do personagem
// -------------------------
const spriteFrames = [
    {img:spritesImg, sx:0, sy:0, sw:44, sh:44},
    {img:spritesImg, sx:0, sy:44, sw:44, sh:44},
    {img:spritesImg, sx:0, sy:88, sw:44, sh:44},
    {img:spritesImg, sx:0, sy:132, sw:44, sh:44}
];

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
// Casas
// -------------------------
const casas = [
    {x:120, y:130, entregue:false},
    {x:370, y:130, entregue:false},
    {x:635, y:130, entregue:false}
];

// -------------------------
// Controles
// -------------------------
let teclas = {};
document.addEventListener("keydown", e => teclas[e.key] = true);
document.addEventListener("keyup", e => teclas[e.key] = false);

function moverPersonagem(){
    if(teclas["ArrowUp"] && entregador.y > 0) entregador.y -= velocidadePersonagem;
    if(teclas["ArrowDown"] && entregador.y < canvas.height - entregador.altura) entregador.y += velocidadePersonagem;
    if(teclas["ArrowLeft"] && entregador.x > 0) entregador.x -= velocidadePersonagem;
    if(teclas["ArrowRight"] && entregador.x < canvas.width - entregador.largura) entregador.x += velocidadePersonagem;
}

// -------------------------
// Colisão
// -------------------------
function checarColisao(carro){
    return entregador.x < carro.x + 55 &&
           entregador.x + entregador.largura > carro.x &&
           entregador.y < carro.y + 30 &&
           entregador.y + entregador.altura > carro.y;
}

// -------------------------
// Atualização carros
// -------------------------
function atualizarCarros(){
    carros.forEach(carro => {
        carro.mover();
        if(checarColisao(carro)){
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
function checarEntregas(){
    casas.forEach(casa=>{
        if(!casa.entregue &&
           entregador.x + entregador.largura > casa.x &&
           entregador.x < casa.x + 35 &&
           entregador.y < casa.y + 10
        ){
            casa.entregue = true;
            contTotal++;
            casaOk.currentTime = 0;
            casaOk.play();
        }
    });
}

// -------------------------
// Fim ou vitória
// -------------------------
function checarFim(){
    if(contTotal === 3){
        jogoAtivo = false;
        musicaFundo.pause();
        ctx.drawImage(venceu,0,0);
        win.play();
        setTimeout(resetGame,5000); // reset automático
    } else if(contVidas === 0 || contTempo <= 0){
        jogoAtivo = false;
        musicaFundo.pause();
        ctx.drawImage(fim,0,0);
        setTimeout(resetGame,5000); // reset automático
    }
}

// -------------------------
// Reset do jogo
// -------------------------
function resetGame(){
    contVidas = 3;
    contTempo = 120;
    contTotal = 0;
    casas.forEach(c => c.entregue=false);
    entregador.x = 595;
    entregador.y = 550;
    jogoAtivo = true;
    musicaFundo.currentTime = 0;
    musicaFundo.play();
    gameLoop();
}

// -------------------------
// Loop principal
// -------------------------
function gameLoop(){
    if(!jogoAtivo) return;

    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(cenario,0,0);

    // vidas
    ctx.drawImage(vidasImgs[contVidas], 7, 17);

    // temporizador
    ctx.font = "30px Comic Sans MS";
    ctx.fillStyle = "black";
    ctx.fillText(`TIME: ${contTempo}`, 700, 50);

    // personagem
    moverPersonagem();
    entregador.animar();
    entregador.draw();

    // carros
    atualizarCarros();
    carros.forEach(carro => ctx.drawImage(carro.img, carro.x, carro.y));

    // entregas
    checarEntregas();

    // fim ou vitória
    checarFim();

    requestAnimationFrame(gameLoop);
}

// -------------------------
// Contador de tempo
// -------------------------
setInterval(()=>{
    if(jogoAtivo && contTempo > 0) contTempo--;
},1000);

// -------------------------
// Iniciar jogo
// -------------------------
gameLoop();
