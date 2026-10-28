# 🏛️ Arquitetura Técnica & Engenharia do Motor
## *Remanescente da Alma (Soul's Remnant: 200 Floors of Trial)*

Este documento descreve a arquitetura de software, decisões de engenharia, ciclo de vida do motor de jogo 2D e a paridade técnica com as diretrizes do **Godot Engine 3.6.3 LTS**.

---

## 📐 1. Visão Geral da Arquitetura

O projeto adota uma arquitetura em camadas de alto desempenho (*Decoupled High-Performance Canvas Engine*), dividida em três pilares principais:

```
┌─────────────────────────────────────────────────────────────┐
│                    React 19 Presentation                    │
│    (HUD, Modais de Conquistas, Manual de Jogo, Pause, UI)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ Eventos Discretos & Estado
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               Game Loop & Engine Core (engine.ts)           │
│   - Loop de Física Fixed Delta Time (60 Hz estável)         │
│   - Sistema de Colisão AABB Swept & Plataformas             │
│   - Máquina de Estados do Jogador (Parry, Dash, I-Frames)   │
│   - Ring Buffer de Partículas & Efeitos Visuais             │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌───────────────────────────┐         ┌───────────────────────────┐
│     Regras Matemáticas    │         │  Sintetizador Procedural  │
│   Puras & Testes Unitários│         │       Web Audio API       │
│      (src/game/rules.ts)  │         │    (src/game/audio.ts)    │
└───────────────────────────┘         └───────────────────────────┘
```

---

## ⚙️ 2. Paridade e Homenagem ao Godot Engine 3.6.3 LTS

O Godot 3.6.3 é a versão de suporte de longo prazo (LTS) focada em estabilidade industrial, requisitos móveis modernos e precisão física. Implementamos estes princípios diretamente no motor web:

1. **Target Android API Nível 36 (Android 16)**:
   - Estrutura de viewport responsiva e suporte a telas de alta densidade (HiDPI / Retina com `window.devicePixelRatio`).
   - Ajuste de taxa de amostragem de toque e suporte a layouts com entalhes (*notches*).

2. **iOS 15.0+ e Arquiteturas 64-bit Modernas**:
   - Eliminação de dependências legadas de 32-bit.
   - Suporte completo a Safari iOS via Web Audio desbloqueado no primeiro toque do usuário.

3. **FTI (Fixed Time Interpolation) 2D**:
   - Inspirado no PR GH-111195 do Godot 3.6.3.
   - O loop de física roda em passos fixos de tempo (`dt = 1/60s`), desacoplado da taxa de varredura da tela (`requestAnimationFrame`), evitando o efeito de "gagueira" (*stuttering*) em monitores de 120Hz ou 144Hz.

4. **Entropia e Aleatoriedade Criptográfica**:
   - Inspirado nas atualizações GH-121894 e GH-122647 do Godot 3.6.3 (`get_entropy()`).
   - Geração de sementes procedurais de andares e posições de inimigos utilizando aleatoriedade de alta qualidade.

5. **Correção de Buffer de Áudio Sem Estalos (WASAPI / Web Audio Parity)**:
   - Inspirado na correção GH-89283 do Godot 3.6.3.
   - Uso de buffers circulares de áudio com rampas lineares e exponenciais de ganho (`gainNode.linearRampToValueAtTime`) para evitar cliques ou artefatos sonoros quando múltiplos efeitos ocorrem em paralelo.

---

## ⏱️ 3. Loop de Física & Detecção de Colisão

### 3.1. Clamped Delta-Time
```typescript
export function clampDeltaTime(rawDt: number, maxDt = 0.05): number {
  if (rawDt <= 0 || isNaN(rawDt)) return 1 / 60;
  return Math.min(rawDt, maxDt);
}
```
Mesmo que o usuário minimize a aba do navegador por minutos ou o processador sofra uma pausa de coleta de lixo pesada, o delta time máximo passado para a física nunca ultrapassa **50ms**. Isso impede que o personagem atravesse o chão ou paredes (*tunneling effect*).

### 3.2. AABB Swept Collision
A colisão de entidades dinâmicas contra plataformas sólidas e semissólidas calcula tanto a posição futura quanto a trajetória contínua:
1. **Passo Horizontal**: Resolve `dx = vx * dt`, ajustando a borda lateral contra blocos sólidos.
2. **Passo Vertical**: Resolve `dy = vy * dt`. Se o jogador estiver caindo (`vy > 0`) e a base dos seus pés cruzar o topo de uma plataforma semissólida enquanto a tecla de agachar (`S`) **não** estiver pressionada, o movimento é travado exatamente no topo da plataforma, e `isGrounded` se torna verdadeiro.

### 3.3. Coyote Time & Jump Buffering
- **Coyote Time (100ms)**: Permite que o jogador salte mesmo após 6 frames fora da borda.
- **Jump Buffer (120ms)**: Registra o comando de pulo até 7 frames antes da aterrissagem, acionando o salto instantaneamente ao tocar o solo.

---

## 🎵 4. Síntese de Áudio Procedural (Zero-Download Web Audio)

Em vez de carregar arquivos de áudio externos pesados (`.mp3` ou `.wav`), que poderiam falhar no carregamento ou causar atrasos em redes lentas, o jogo possui um sintetizador procedural autônomo baseado na **Web Audio API**:

- **Ataque de Espada**: Ruído branco filtrado por filtro passa-faixa com varredura rápida de frequência (2.4kHz a 300Hz em 70ms).
- **Parry Perfeito**: Dois osciladores sinusoidais em harmonia (880Hz e 1760Hz) com envelope de sino e decaimento estendido de 500ms, simulando o choque metálico de lâminas sagradas.
- **Projétil de Alma**: Onda triangular modulada em frequência (FM) subindo de 220Hz a 660Hz com reverberação estéreo sintética.
- **Impacto / Dano**: Oscilador de onda dente-de-serra (*sawtooth*) descendente de 180Hz a 40Hz com distorção não-linear suave.
- **Subida de Fase / Vitória**: Acorde arpejado em quinta perfeita (Dó-Mi-Sol-Si) sintetizado com osciladores puros.

---

## 🧪 5. Estratégia de Testes Unitários Desacoplados

O módulo `src/game/rules.ts` foi rigorosamente isolado de qualquer dependência do DOM, Canvas ou React. Ele contém funções puras que governam:
- Fórmulas de dano sofrido com mitigação de parry e multiplicador de dificuldade;
- Verificação de elegibilidade de Coyote Time com tolerância temporal;
- Fórmulas de cálculo de Rank (S+, S, A, B, C) baseado em tempo, combo e vida restante;
- Validação dos tetos de fases de cada dificuldade:
  - Fácil: 50 fases
  - Médio: 100 fases
  - Difícil: 150 fases
  - Hard Master: 200 fases

Os testes rodam nativamente via **Node.js Test Runner** (`node:test` + `node:assert/strict`) através do comando:
```bash
npx --yes tsx --test src/game/rules.test.ts
```

---

## 💾 6. Esquema de Armazenamento e Backup JSON

O progresso do jogador é serializado na chave de armazenamento local `souls_remnant_save_v1`:

```typescript
export interface SaveData {
  version: number;
  highestFloorByDifficulty: {
    facil: number;       // 1 a 50
    medio: number;       // 1 a 100
    dificil: number;     // 1 a 150
    hard_master: number; // 1 a 200
  };
  totalEnemiesDefeated: number;
  totalParriesExecuted: number;
  highestComboAchieved: number;
  unlockedAchievementIds: string[];
  lastPlayedTimestamp: number;
}
```

O arquivo de exportação é gerado com formatação identada (`JSON.stringify(saveData, null, 2)`), permitindo auditoria humana e restauração sem perda de integridade.
