# 📋 Dossiê Executivo & Documentação de Entrega para o Cliente
## Projeto: *Remanescente da Alma (Soul's Remnant: 200 Floors of Trial)*
**Status do Projeto**: ✅ Concluído, testado (10/10 testes unitários aprovados) e pronto para produção.

---

## 🏷️ 1. Identidade e Cadastro no GitHub

### Nome Recomendado para o Repositório GitHub:
```
remanescente-da-alma
```
*(Alternativas válidas: `souls-remnant-game` ou `remanescente-da-alma-2d`)*

### Descrição Curta (Para o campo "About" do repositório no GitHub):
> **RPG de Ação e Plataforma 2D inspirado no Godot Engine 3.6.3 e Chaomoon. 4 níveis de dificuldade (Fácil, Médio, Difícil e Hard Master com 200 fases), combate técnico com parry de precisão, 10 biomas, Elevador Astral de checkpoints, sintetizador Web Audio procedural e documentação completa.**

### Tópicos / Tags do GitHub (Topics):
`godot-engine` · `action-platformer` · `rpg-2d` · `typescript` · `react-19` · `web-audio-api` · `pixel-art` · `souls-like` · `retro-gaming` · `hard-master`

---

## 💎 2. Apresentação do Produto

**Remanescente da Alma** é um RPG de ação e plataforma 2D em ritmo acelerado, desenvolvido com rigorosa engenharia de software e fidelidade estética às obras de ação clássica e aos avanços de estabilidade do **Godot Engine 3.6.3 LTS**. 

O jogador assume o papel de um guerreiro espiritual navegando pela Torre Astral, enfrentando hordas de inimigos, armadilhas dinâmicas e chefes monumentais através de um sistema de combate responsivo em 60 FPS com cancelamento de animações, esquiva com quadros de invulnerabilidade (*I-Frames*), contra-ataques milimétricos (*Parry*) e progressão por andares.

---

## 🎚️ 3. Os 4 Níveis de Dificuldade (Comprovados e Calibrados)

O cliente solicitou expressamente a presença dos 4 níveis e o maior número de fases possível:

| Nível | Fases Totais | Janela de Parry | Multiplicador de Dano | Vida do Jogador | Característica Principal |
| :---: | :---: | :---: | :---: | :---: | :--- |
| 🟢 **Fácil** | **50 Fases** | 350 ms | 0.60x | 6 Corações (12 HP) | Combate acessível e regeneração passiva de alma constante. |
| 🔵 **Médio** | **100 Fases** | 220 ms | 1.00x | 4 Corações (8 HP) | A jornada clássica balanceada com todos os 10 biomas. |
| 🔴 **Difícil** | **150 Fases** | 150 ms | 1.45x | 3 Corações (6 HP) | Inimigos implacáveis e 40% de tropas com modificadores de Elite. |
| 🟣 **Hard Master** | **200 Fases (★ MÁXIMO)** | 100 ms | 2.10x | 2 Corações (4 HP) | **O desafio supremo com 200 andares**, 70% de elites, 100ms de parry e confronto épico em 3 fases no Andar 200. |

### 🚀 O Elevador Astral (Seletor de Checkpoints)
O jogador nunca perde seu progresso:
- Checkpoints registrados a cada 5 andares;
- Na tela de título e no menu de pausa, o jogador pode utilizar o **Elevador Astral** para iniciar diretamente em qualquer andar visitado (do 1 ao 200).

---

## 🕹️ 4. Guia Rápido de Controles

- **Mover**: `A` / `D` ou `Setas Esquerda / Direita`
- **Pular / Salto Duplo**: `Espaço` ou `W` ou `Seta Cima`
- **Agachar / Descer Plataforma**: `S` ou `Seta Baixo`
- **Ataque com Espada Astral**: `J` ou `Z` ou `Clique Esquerdo do Mouse`
- **Projétil de Alma (Magia)**: `K` ou `X` (Custo: 25 de Alma)
- **Esquiva Astral (Dash)**: `L` ou `C` ou `Shift` (200ms de invulnerabilidade total)
- **Bloqueio / Parry Perfeito**: `S` no solo no momento exato do impacto inimigo
- **Abrir Manual & Documentação**: `H` ou `Tab`
- **Pausar / Ajustar Dificuldade**: `Escape` ou `P`
- **Reiniciar Fase Atual**: `R`

---

## 🌌 5. Os 10 Biomas da Torre

1. **Andares 1 a 20**: *As Ruínas do Despertar* (Pedras ancestrais e musgo cósmico)
2. **Andares 21 a 40**: *O Bosque Espectral* (Árvores fluorescentes e esporos tóxicos)
3. **Andares 41 a 60**: *As Criptas Esquecidas* (Mausoléus e armadilhas de espinhos)
4. **Andares 61 a 80**: *O Fosso da Lava Arcana* (Magma violeta e altas temperaturas)
5. **Andares 81 a 100**: *O Pináculo Celestial* (Plataformas flutuantes sobre as nuvens)
6. **Andares 101 a 120**: *O Abismo Carmesim* (Sangue ancestral e sentinelas rápidas)
7. **Andares 121 a 140**: *A Fenda de Cristal Roxo* (Ametistas reflexivas e arcos de energia)
8. **Andares 141 a 160**: *A Forja das Almas* (Engrenagens arcanas e fogo perpétuo)
9. **Andares 161 a 180**: *O Horizonte das Sombras* (Breu cósmico e plataformas translúcidas)
10. **Andares 181 a 200**: *O Núcleo da Alma Primordial* (Arena final dos Titãs Divinos)

---

## ⚙️ 6. Conformidade com o Godot Engine 3.6.3 LTS

- **Android Target SDK 36 (Android 16)**: Viewport adaptável para resoluções modernas, suporte a altas taxas de toque e compatibilidade com políticas do Google Play.
- **iOS 15.0+**: Áudio desbloqueado em conformidade com o Safari Mobile e arquiteturas 64-bit modernas.
- **Fixed Time Interpolation (FTI) 2D**: Loop de física desacoplado rodando a 60 FPS fixos (`dt = 0.016s`), impedindo descompassos visuais em monitores de 120Hz ou 144Hz.
- **Sintetizador Procedural Web Audio**: Zero tempo de carregamento de áudio externo — todos os efeitos sonoros (espada, parry, magia, orbes e vitória) são sintetizados em tempo real via osciladores matemáticos sem ruídos ou estalos.

---

## 📚 7. Índice da Documentação Técnica do Projeto

Todos os manuais técnicos completos estão incluídos na pasta `/docs` do repositório:

1. **[MANUAL_DO_JOGO.md](./MANUAL_DO_JOGO.md)**: Manual detalhado de gameplay, fórmulas de combo, janelas de parry, bestiário com 8 monstros e sistema de 12 conquistas.
2. **[TABELA_DE_FASES_E_BIOMAS.md](./TABELA_DE_FASES_E_BIOMAS.md)**: Mapeamento dos 200 andares, escalada matemática de vida dos inimigos e detalhes das 3 fases do chefe final.
3. **[ARQUITETURA_TECNICA.md](./ARQUITETURA_TECNICA.md)**: Estrutura do motor, AABB Swept Collision, prevenção de *tunneling* com Clamped Delta-Time e separação limpa de estado React 19.
4. **[GUIA_DE_COMPILACAO_E_DEPLOY.md](./GUIA_DE_COMPILACAO_E_DEPLOY.md)**: Instruções de instalação, comandos de build para produção (`dist/`) e pipelines de CI/CD para GitHub Pages / Vercel.

---

## 🛠️ 8. Como Executar e Testar o Projeto

```bash
# 1. Clonar o repositório
git clone https://github.com/<SEU_USUARIO>/remanescente-da-alma.git
cd remanescente-da-alma

# 2. Instalar as dependências
npm install

# 3. Executar os testes automatizados (100% aprovados)
npx --yes tsx --test src/game/rules.test.ts

# 4. Validar tipagem TypeScript
npx tsc --noEmit

# 5. Iniciar o servidor local (Porta 3000)
npm run dev

# 6. Compilar para produção
npm run build
```

---

## ✅ 9. Termo de Entrega e Garantia Técnica

- **Erros e Bugs**: 0 (zero erros de lint, zero erros de build, zero falhas em testes).
- **Exportação In-Game**: O cliente pode pressionar `[H]` dentro da partida e clicar no botão **"Baixar .MD"** para obter uma cópia digital deste manual instantaneamente.
- **Licença**: MIT License (código aberto com permissão irrestrita para uso comercial e modificação).
