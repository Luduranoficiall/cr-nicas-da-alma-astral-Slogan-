# ⚔️ Remanescente da Alma (Soul's Remnant: 200 Floors of Trial)

[![Godot 3.6.3 Inspired](https://img.shields.io/badge/Engine-Godot%203.6.3%20Inspired-478cbf?logo=godotengine&logoColor=white)](https://godotengine.org)
[![React 19](https://img.shields.io/badge/React-19.0.1-61dafb?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0%2B-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![200 Floors](https://img.shields.io/badge/Max_Stages-200%20Fases-ff4757)](#-sistema-de-dificuldade-e-200-fases)
[![Docs](https://img.shields.io/badge/Documentação-Completa%20%26%20Oficial-00b894)](./docs/MANUAL_DO_JOGO.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

> **Um épico RPG de Ação e Plataforma 2D inspirado no motor Godot Engine 3.6.3 e na obra *Soul’s Remnant* (Chaomoon). Apresenta combate técnico de alta precisão, parry em milissegundos, Elevador Astral de checkpoints, 4 modos de dificuldade escalando até o lendário 200º Andar no Hard Master, sistema de conquistas, backup de save JSON e documentação técnica completa integrada no próprio jogo.**

---

## 📚 Documentação Oficial e Manuais Técnicos

O projeto conta com documentação completa em português, disponível tanto em arquivos standalone Markdown quanto integrada diretamente na interface do jogo (tecla `[H]` ou botão *Manual*):

- 📋 **[Dossiê Executivo do Cliente (DOCUMENTACAO_DO_CLIENTE.md)](./docs/DOCUMENTACAO_DO_CLIENTE.md)**: **Documento principal para o cliente** com nome sugerido para o repositório, descrições curta e detalhada, resumo executivo dos 4 níveis de dificuldade, controles e conformidade técnica.
- 📖 **[Manual Completo do Jogo (MANUAL_DO_JOGO.md)](./docs/MANUAL_DO_JOGO.md)**: Guia completo para jogadores e testadores cobrindo lore, controles, janelas de parry em ms, I-frames da esquiva, lista dos 10 biomas, bestiário com 8 inimigos e chefes titânicos, e as 12 conquistas.
- 🏛️ **[Arquitetura Técnica & Engenharia (ARQUITETURA_TECNICA.md)](./docs/ARQUITETURA_TECNICA.md)**: Decisões de arquitetura, paridade com Godot 3.6.3 LTS (Android API 36 / iOS 15+ / FTI 2D), loop de física em delta time fixo (60Hz), AABB swept collision, síntese Web Audio procedural e modelo de testes.
- 🛠️ **[Guia de Compilação, Testes e Deploy (GUIA_DE_COMPILACAO_E_DEPLOY.md)](./docs/GUIA_DE_COMPILACAO_E_DEPLOY.md)**: Instruções passo a passo para clonar, rodar testes unitários, checar tipagem TypeScript, compilar para produção (`dist/`) e fazer deploy (Vercel, GitHub Pages, Docker).
- 🗺️ **[Tabela Completa de Fases e Biomas (TABELA_DE_FASES_E_BIOMAS.md)](./docs/TABELA_DE_FASES_E_BIOMAS.md)**: Mapeamento detalhado dos 200 andares do modo Hard Master, curva de escalada de dano e vida dos monstros, e o confronto de 3 fases no Andar 200.

---

## 🌟 Destaques do Projeto

- 🎮 **Motor de Física 2D Customizado**: Implementado em TypeScript com Fixed Delta Time (60 FPS estáveis), AABB swept collision, Coyote Time (100ms), Jump Buffering (120ms) e Squash & Stretch procedural.
- 🏰 **Campanha Monumental com 200 Fases**:
  - **Fácil**: 50 fases para exploração contemplativa e regeneração de alma.
  - **Médio**: 100 fases, balanceamento clássico e 10 biomas evolutivos.
  - **Difícil**: 150 fases, inimigos agressivos e elites implacáveis.
  - **Hard Master**: **200 fases** — o teste definitivo de reflexo, paciência e maestria.
- 🚀 **Elevador Astral (Seleção de Checkpoint)**: Salte diretamente para qualquer andar desbloqueado (do 1 ao 200) com controles ágeis de checkpoint.
- 🛡️ **Combate Técnico & Parry**: Janela de contra-ataque de 100ms a 350ms dependendo da dificuldade, combos aéreos, projéteis perfurantes e esquiva com invulnerabilidade (I-frames).
- 🏆 **Sistema de Troféus & Conquistas**: 12 conquistas desbloqueáveis em tempo real com banners animados e notificações sonoras.
- 💾 **Exportação & Importação de Save (JSON)**: Faça backup do seu progresso, andares conquistados e troféus em um único arquivo `.json` portátil.
- 📖 **Documentação Técnica Integrada (Manual In-Game)**: Pressione `[H]` ou clique em *Manual* em qualquer tela para abrir a documentação completa dos 10 biomas, fórmulas de dano, atalhos e notas de compatibilidade com Godot 3.6.3 (Android API 36 / iOS 15+).
- 🎵 **Sintetizador Web Audio Procedural**: Efeitos sonoros autônomos sem necessidade de downloads de áudio externos (zero delay de carregamento).

---

## 🕹️ Controles do Jogo

| Ação | Teclado Principal | Alternativo / Teclado |
| :--- | :--- | :--- |
| **Mover para Esquerda / Direita** | `A` / `D` | `Seta Esquerda` / `Seta Direita` |
| **Agachar / Descer Plataforma** | `S` | `Seta Baixo` |
| **Pular (Suporta Salto Duplo)** | `Espaço` | `W` / `Seta Cima` |
| **Ataque com Espada Astral** | `J` | `Z` / `Clique Esquerdo` |
| **Proétil de Alma (Magia)** | `K` | `X` |
| **Esquiva Astral / Dash com I-Frames** | `L` | `C` / `Shift Esquerdo` |
| **Defesa / Bloqueio / Parry** | `S` (no chão) | `Guarda no momento exato do impacto` |
| **Pausar / Retomar Jogo** | `Escape` | `P` |
| **Abrir Manual & Documentação** | `H` | `Tab` |
| **Reiniciar Andar Atual** | `R` | `Botão no HUD` |
| **Mutar / Desmutar Áudio** | `M` | `Botão no HUD` |

---

## 📈 Sistema de Dificuldade e 200 Fases

| Nível de Dificuldade | Total de Fases | Janela de Parry | Multiplicador de Dano | Chance de Elites | Vida Base |
| :--- | :---: | :---: | :---: | :---: | :---: |
| 🟢 **Fácil** (*Exploração Serenada*) | **50 Fases** | 350 ms | 0.60x | 0% | 6 Corações |
| 🔵 **Médio** (*Jornada do Herói*) | **100 Fases** | 220 ms | 1.00x | 15% | 4 Corações |
| 🔴 **Difícil** (*Desafio Implacável*) | **150 Fases** | 150 ms | 1.45x | 40% | 3 Corações |
| 🟣 **Hard Master** (*O Julgamento Supremo*) | **200 Fases** | 100 ms | 2.10x | 70% | 2 Corações |

### 🌌 Os 10 Biomas Procedurais
1. **Andares 1–20**: *As Ruínas do Despertar* (Pedra antiga, musgo astral)
2. **Andares 21–40**: *O Bosque Espectral* (Árvores etéreas, esporos venenosos)
3. **Andares 41–60**: *Criptas Esquecidas* (Mausoléus subterrâneos, espinhos)
4. **Andares 61–80**: *Fosso da Lava Arcana* (Magma fluorescente, alta temperatura)
5. **Andares 81–100**: *O Pináculo Celestial* (Plataformas flutuantes e ventos cortantes)
6. **Andares 101–120**: *Abismo Carmesim* (Sangue ancestral e sentinelas velozes)
7. **Andares 121–140**: *Fenda de Cristal Roxo* (Reflexos luminosos e arcos etéreos)
8. **Andares 141–160**: *Forja das Almas* (Engrenagens arcanas e fogo sagrado)
9. **Andares 161–180**: *O Horizonte das Sombras* (Vazio profundo e visibilidade reduzida)
10. **Andares 181–200**: *O Núcleo da Alma Primordial* (Arena final dos Titãs Celestiais)

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- **Node.js** v20 ou superior
- **npm** v10 ou superior

### Passo a Passo

```bash
# 1. Clone o repositório
git clone https://github.com/<SEU_USUARIO>/remanescente-da-alma.git
cd remanescente-da-alma

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev

# 4. Abra o navegador em:
http://localhost:3000
```

### Comandos Úteis

```bash
# Executar a suíte de testes unitários
npx --yes tsx --test src/game/rules.test.ts

# Validar tipagem TypeScript
npx tsc --noEmit

# Compilar para produção
npm run build

# Pré-visualizar build de produção
npm run preview
```

---

## 🏗️ Arquitetura do Projeto

```
├── .github/
│   └── workflows/
│       └── ci.yml               # Pipeline de Integração Contínua (Test + Build)
├── src/
│   ├── components/
│   │   ├── AchievementsModal.tsx # Galeria de troféus e backup/restore JSON
│   │   ├── AchievementToast.tsx  # Banner flutuante de conquista desbloqueada
│   │   ├── DocumentationModal.tsx# Manual técnico completo in-game
│   │   ├── GameHUD.tsx           # Barra de vida, alma, combo e controles
│   │   ├── GameOverModal.tsx     # Tela de derrota com análise tática
│   │   ├── PauseModal.tsx        # Menu de pausa com troca rápida de dificuldade
│   │   ├── StageClearModal.tsx   # Telas de transição entre os andares
│   │   ├── TitleScreen.tsx       # Menu principal com Elevador Astral
│   │   └── VictoryModal.tsx      # Vitória triunfal ao zerar o 200º andar
│   ├── game/
│   │   ├── achievements.ts      # Catálogo de troféus e gerenciador de save
│   │   ├── audio.ts             # Sintetizador procedural Web Audio
│   │   ├── engine.ts            # Loop principal de jogo, física e renderização
│   │   ├── rules.ts             # Regras matemáticas, multiplicadores e ranks
│   │   ├── rules.test.ts        # Testes automatizados (Node Test Runner)
│   │   └── types.ts             # Tipos TypeScript rigorosos
│   ├── App.tsx                  # Componente raiz da aplicação
│   ├── index.css                # Tailwind CSS v4 import
│   └── main.tsx                 # Ponto de entrada React 19
├── index.html                   # HTML5 com SEO e OpenGraph configurados
├── metadata.json                # Metadados oficiais do AI Studio
└── package.json                 # Dependências e scripts
```

---

## 🤝 Contribuições

Contribuições são extremamente bem-vindas! Consulte o arquivo [CONTRIBUTING.md](./CONTRIBUTING.md) para diretrizes de desenvolvimento, convenções de commits e abertura de Pull Requests.

---

## 📜 Licença e Agradecimentos

Distribuído sob a licença **MIT**. Veja [LICENSE](./LICENSE) para mais detalhes.

- Homenagem especial à **Fundação Godot** e aos criadores de *Soul's Remnant* (**Chaomoon**).
- Inspirado nas novidades de manutenção do **Godot 3.6.3** (Android SDK 36, iOS 15+ e otimizações de física).
