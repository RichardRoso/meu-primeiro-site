const classesBase = {
    "mago": { hp: 70, atk: 24, spd: 6, emoji: "🧙‍♂️" },
    "ninja": { hp: 85, atk: 14, spd: 22, emoji: "🥷" },
    "ciborgue": { hp: 130, atk: 11, spd: 4, emoji: "🤖" }
};

const aurasBase = {
    "nenhuma": { atk: 0, spd: 0, estilo: "#121821" },
    "fogo": { atk: 5, spd: 0, estilo: "radial-gradient(circle, #7a1f1f 0%, #121821 100%)" },
    "raio": { atk: 0, spd: 5, estilo: "radial-gradient(circle, #1f5f7a 0%, #121821 100%)" }
};

let pontosRestantes = 10;
let pontosDistribuidos = { hp: 0, atk: 0, spd: 0 };

let heroiCombate = { hp: 0, maxHp: 0, atk: 0, spd: 0 };
let monstroCombate = { hp: 150, maxHp: 150, atk: 15, spd: 10 };

const classeSelect = document.getElementById('classe-select');
const fundoSelect = document.getElementById('fundo-select');
const avatarDiv = document.getElementById('avatar');

function rodarCalculosDeAtributo() {
    const classeChave = classeSelect.value;
    const auraChave = fundoSelect.value;

    const cBase = classesBase[classeChave];
    const aBase = aurasBase[auraChave];

    avatarDiv.innerText = cBase.emoji;
    avatarDiv.style.background = aBase.estilo;

    document.getElementById('pontos-txt').innerText = "Pontos Restantes: " + pontosRestantes;
    document.getElementById('base-hp-txt').innerText = cBase.hp + (pontosDistribuidos.hp * 10);
    document.getElementById('base-atk-txt').innerText = cBase.atk + pontosDistribuidos.atk + aBase.atk;
    document.getElementById('base-spd-txt').innerText = cBase.spd + pontosDistribuidos.spd + aBase.spd;
}

function adicionarPontoElemento(tipo) {
    if (pontosRestantes > 0) {
        pontosRestantes--;
        pontosDistribuidos[tipo]++;
        rodarCalculosDeAtributo();
    }
}

classeSelect.addEventListener('change', () => {
    pontosRestantes = 10;
    pontosDistribuidos = { hp: 0, atk: 0, spd: 0 };
    rodarCalculosDeAtributo();
});
fundoSelect.addEventListener('change', rodarCalculosDeAtributo);

document.getElementById('btn-add-hp').addEventListener('click', () => adicionarPontoElemento('hp'));
document.getElementById('btn-add-atk').addEventListener('click', () => adicionarPontoElemento('atk'));
document.getElementById('btn-add-spd').addEventListener('click', () => adicionarPontoElemento('spd'));

document.getElementById('btn-iniciar-jornada').addEventListener('click', () => {
    const entradaNome = document.getElementById('nome-heroi-input').value.trim();
    document.getElementById('tuto-nome').innerText = entradaNome !== "" ? entradaNome : "Agente Alfa";
    document.getElementById('tuto-avatar').innerText = classesBase[classeSelect.value].emoji;

    document.getElementById('screen-creator').classList.add('hidden');
    document.getElementById('screen-tutorial').classList.remove('hidden');
});

document.getElementById('btn-ir-arena').addEventListener('click', () => {
    const cBase = classesBase[classeSelect.value];
    const aBase = aurasBase[fundoSelect.value];

    heroiCombate.maxHp = cBase.hp + (pontosDistribuidos.hp * 10);
    heroiCombate.hp = heroiCombate.maxHp;
    heroiCombate.atk = cBase.atk + pontosDistribuidos.atk + aBase.atk;
    heroiCombate.spd = cBase.spd + pontosDistribuidos.spd + aBase.spd;

    document.getElementById('bat-nome-heroi').innerText = document.getElementById('nome-heroi-input').value;
    document.getElementById('bat-avatar-heroi').innerText = cBase.emoji;

    renderizarBarrasVida();
    document.getElementById('screen-tutorial').classList.add('hidden');
    document.getElementById('screen-battle').classList.remove('hidden');
});

function renderizarBarrasVida() {
    document.getElementById('bat-hp-heroi').innerText = heroiCombate.hp;
    document.getElementById('bat-maxhp-heroi').innerText = heroiCombate.maxHp;
    document.getElementById('bat-hp-monstro').innerText = monstroCombate.hp;

    const percentualHeroi = Math.max(0, (heroiCombate.hp / heroiCombate.maxHp) * 100);
    const percentualMonstro = Math.max(0, (monstroCombate.hp / monstroCombate.maxHp) * 100);

    document.getElementById('bar-heroi').style.width = percentualHeroi + '%';
    document.getElementById('bar-monstro').style.width = percentualMonstro + '%';
}

function adicionarLogTerminal(mensagem) {
    const terminal = document.getElementById('log');
    terminal.innerHTML += "<br>> " + mensagem;
    terminal.scrollTop = terminal.scrollHeight;
}

function dispararEfeitoDanoCard(elementoId) {
    const card = document.getElementById(elementoId);
    card.classList.add('take-damage');
    setTimeout(() => card.classList.remove('take-damage'), 400);
}

function processarRodadaDeCombate(acaoEscolhida) {
    if (heroiCombate.hp <= 0 || monstroCombate.hp <= 0) return;

    if (heroiCombate.spd >= monstroCombate.spd) {
        executarGolpeJogador(acaoEscolhida);
        if (monstroCombate.hp > 0) setTimeout(executarGolpeBoss, 700);
    } else {
        adicionarLogTerminal("⚠️ O Inimigo atacou primeiro por possuir maior velocidade!");
        executarGolpeBoss();
        if (heroiCombate.hp > 0) setTimeout(() => executarGolpeJogador(acaoEscolhida), 700);
    }
}

function executarGolpeJogador(acao) {
    if (acao === 'atacar') {
        let chanceCritico = 0.05 + (heroiCombate.spd * 0.01); 
        let eCritico = Math.random() < chanceCritico;
        
        let danoBase = Math.floor(heroiCombate.atk * (0.9 + Math.random() * 0.25));
        if (eCritico) {
            danoBase = Math.floor(danoBase * 2);
            adicionarLogTerminal(`🔥 CRÍTICO! Dano em dobro aplicado.`);
        }

        monstroCombate.hp = Math.max(0, monstroCombate.hp - danoBase);
        adicionarLogTerminal(`Você atacou e causou ${danoBase} de dano.`);
        dispararEfeitoDanoCard('card-monstro');
    } else {
        let fatorCura = Math.floor(25 + (heroiCombate.maxHp * 0.1));
        heroiCombate.hp = Math.min(heroiCombate.maxHp, heroiCombate.hp + fatorCura);
        adicionarLogTerminal(`🧪 Você usou poção e restaurou ${fatorCura} de HP.`);
    }
    renderizarBarrasVida();
    avaliarCondicaoFinal();
}

function executarGolpeBoss() {
    if (monstroCombate.hp <= 0 || heroiCombate.hp <= 0) return;
    
    let danoInimigo = Math.floor(monstroCombate.atk * (0.85 + Math.random() * 0.3));
    heroiCombate.hp = Math.max(0, heroiCombate.hp - danoInimigo);
    
    adicionarLogTerminal(`💥 O Arqui-demônio desferiu ${danoInimigo} de dano.`);
    dispararEfeitoDanoCard('card-heroi');
    renderizarBarrasVida();
    avaliarCondicaoFinal();
}

function avaliarCondicaoFinal() {
    if (monstroCombate.hp <= 0) {
        adicionarLogTerminal("🏆 Vitória absoluta! O Boss foi destruído!");
        document.getElementById('botoes-combate').innerHTML = "<h3 style='color:#39ff14;'>VITÓRIA GLORIOSA!</h3>";
    } else if (heroiCombate.hp <= 0) {
        adicionarLogTerminal("💀 Seus pontos de vida chegaram a zero. Fim de jogo.");
        document.getElementById('botoes-combate').innerHTML = "<h3 style='color:#ff4a4a;'>GAME OVER</h3>";
    }
}

// Inicialização segura
rodarCalculosDeAtributo();

document.getElementById('btn-atacar-combate').addEventListener('click', () => processarRodadaDeCombate('atacar'));
document.getElementById('btn-curar-combate').addEventListener('click', () => processarRodadaDeCombate('curar'));
