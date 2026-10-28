# 📖 Remanescente da Alma — Manual Oficial do Jogo
## *Soul's Remnant: 200 Floors of Trial*
*Inspirado na obra de Chaomoon e no motor Godot Engine 3.6.3 LTS*

---

## 📜 1. Prólogo e Contexto Narrativo

Em um cosmos fragmentado onde a realidade se dissolve no éter, ergue-se a **Torre Astral dos Esquecidos**. Você é um **Remanescente da Alma**, um guerreiro etéreo dotado da fagulha divina da espada e do arcano, incumbido de purificar as 200 camadas da torre corrompida por forças sombrias.

A jornada honra a estética clássica dos MMORPGs e plataformas 2D retrô, combinando mecânicas modernas de ação técnica:
- Movimentação responsiva com cancelamento de animações;
- Janelas de contra-ataque (*parry*) com recompensas devastadoras;
- Esquiva tática com quadros de invulnerabilidade (*I-Frames*);
- Escalar de perigo com quatro níveis de dificuldade estritos, culminando no lendário desafio de **200 Fases do Hard Master**.

---

## 🎚️ 2. Sistema de Dificuldades: Sempre 4 Modos

O jogo estabelece quatro níveis de dificuldade rigorosamente desenhados e balanceados:

| Nível de Dificuldade | Fases Totais | Janela de Parry | Multiplicador de Dano Inimigo | Chance de Inimigo Elite | Vida Base | Regeneração Astral |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| 🟢 **Fácil** | **50 Fases** | 350 ms | 0.60x | 0% | 6 Corações (12 HP) | +0.8/s (Passiva) |
| 🔵 **Médio** | **100 Fases** | 220 ms | 1.00x | 15% | 4 Corações (8 HP) | Apenas ao Golpear |
| 🔴 **Difícil** | **150 Fases** | 150 ms | 1.45x | 40% | 3 Corações (6 HP) | Apenas ao Derrotar |
| 🟣 **Hard Master** | **200 Fases** | 100 ms | 2.10x | 70% | 2 Corações (4 HP) | Restrita a Parries Perfeitos |

### Detalhes dos Modos:
1. **Fácil (50 Fases)**:
   - Destinado a exploração relaxante e aprendizado das rotas de plataforma.
   - Regeneração de alma passiva constante, permitindo uso frequente de magias.
   - Os chefes possuem ataques espaçados e menor velocidade de corrida.

2. **Médio (100 Fases)**:
   - A experiência padrão planejada para a aventura.
   - Introduz inimigos de elite brilhantes com ataques adicionais a partir do andar 20.
   - Exige domínio do pulo duplo e contra-ataques ocasionais.

3. **Difícil (150 Fases)**:
   - Para veteranos de jogos estilo Souls-like e Metroidvanias de alta precisão.
   - Dano aumentado e armadilhas posicionadas em trajetórias críticas de salto.
   - Menor janela de bloqueio e maior velocidade de projéteis inimigos.

4. **Hard Master (200 Fases — O Desafio Máximo)**:
   - **O modo definitivo exigido pelo cliente com o número máximo de fases**.
   - 200 andares implacáveis distribuídos por 10 biomas completos.
   - Janela de parry reduzida para 100 milissegundos (6 frames a 60 FPS).
   - Inimigos têm 70% de chance de spawnar como Elites com auras arcanas, projéteis acelerados e resistências elevadas.
   - Erros são fatais: dois golpes comuns podem liquidar sua alma.

---

## 🎮 3. Guia Completo de Controles

### Teclado e Mouse

| Ação | Tecla Principal | Tecla Alternativa | Descrição e Efeito |
| :--- | :---: | :---: | :--- |
| **Mover Esquerda / Direita** | `A` / `D` | `←` / `→` | Movimentação com inércia física e aceleração suave. |
| **Agachar / Descer Plataforma** | `S` | `↓` | Agacha para desviar de flechas altas ou desce de plataformas semissólidas. |
| **Pular (Suporta Salto Duplo)** | `Espaço` | `W` / `↑` | Salto de altura variável. Pressione novamente no ar para Salto Duplo. |
| **Ataque de Espada Astral** | `J` | `Z` / Botão Esquerdo | Golpe cortante de curto alcance. Causa recuo e gera energia de alma. |
| **Disparo de Alma (Projétil)** | `K` | `X` | Lança esfera de pura energia astral penetrante. Custa 25 de Alma. |
| **Esquiva Astral (Dash)** | `L` | `C` / `Shift` | Deslize ultrarrápido com 200ms de invulnerabilidade total (I-Frames). |
| **Bloqueio / Parry Perfeito** | `S` (no solo) | `Guarda no impacto` | Bloqueia dano. Se ativado até X ms antes do impacto, atordoa o agressor e reflete projéteis. |
| **Pausar / Retomar** | `Escape` | `P` | Abre menu com resumo de status, bioma e opções. |
| **Abrir Manual & Documentação** | `H` | `Tab` | Abre o manual integrado diretamente dentro da partida. |
| **Reiniciar Andar Atual** | `R` | Botão no HUD | Reinicia o andar imediatamente se você ficar sem vida ou preso. |
| **Mutar / Ativar Som** | `M` | Ícone de Som | Alterna a síntese procedural de efeitos sonoros. |

---

## ⚔️ 4. Mecânicas de Combate Avançado

### 4.1. Janela de Parry (Contra-ataque Perfeito)
O Parry é o coração do combate em *Remanescente da Alma*:
- Quando um golpe físico inimigo ou projétil atinge sua hitbox enquanto sua postura defensiva acabou de ser iniciada dentro da janela permitida (100ms a 350ms):
  - **Dano Anulado**: 100% do dano recebido é neutralizado;
  - **Atordoamento (Stun)**: O inimigo agressor é paralisado por 1.2 segundos;
  - **Riposte Crítico**: Seu próximo ataque com espada tem 2.5x de dano garantido;
  - **Restauração de Alma**: Você recupera instantaneamente +30 pontos de Alma Astral.

### 4.2. Invulnerability Frames (I-Frames) da Esquiva
- A Esquiva Astral (`L` / `Shift`) desloca o personagem a alta velocidade por 300ms.
- Durante os primeiros 200ms, o personagem fica completamente transparente a hitboxes inimigas e espinhos de terreno.
- Permite atravessar chefes gigantescos para atacá-los pelas costas.

### 4.3. Coyote Time & Jump Buffering
Para garantir a responsividade de plataformas clássicas:
- **Coyote Time (100ms)**: Você ainda pode saltar por até 100 milissegundos após seu personagem deixar a borda de uma plataforma.
- **Jump Buffering (120ms)**: Se você pressionar a tecla de pulo até 120ms antes de tocar o solo, o salto será executado no exato frame em que você aterrissar.

### 4.4. Sistema de Medidor de Combo e Ranking
- Cada golpe conectado sem receber dano aumenta o multiplicador de combo:
  - **Combo 1x–4x**: Multiplicador de dano 1.0x;
  - **Combo 5x–9x**: Multiplicador de dano 1.25x (Rank C);
  - **Combo 10x–19x**: Multiplicador de dano 1.50x (Rank B);
  - **Combo 20x–34x**: Multiplicador de dano 1.80x (Rank A);
  - **Combo 35x+**: Multiplicador de dano 2.20x (Rank S+ Divino).

---

## 🌌 5. Os 10 Biomas da Torre (200 Fases)

Cada bioma introduz novos padrões visuais, tipos de terrenos e ameaças:

1. **Andares 1 a 20 — As Ruínas do Despertar**
   - *Ambiente*: Santuários de pedra desgastada, vinhas luminescentes e brisa etérea.
   - *Inimigos*: Espectros Errantes e Slimes Etéreos.
   - *Chefe do Andar 20*: Guardião da Ruína Antiga.

2. **Andares 21 a 40 — O Bosque Espectral**
   - *Ambiente*: Troncos ocos, fungos venenosos e neblina fosforescente.
   - *Inimigos*: Arqueiros do Vazio e Espectros Velozes.
   - *Chefe do Andar 40*: Ancião do Esporo Mortal.

3. **Andares 41 a 60 — As Criptas Esquecidas**
   - *Ambiente*: Catacumbas subterrâneas, lápides e espinhos afiados.
   - *Inimigos*: Cavaleiros Corrompidos e Sentinelas de Pedra.
   - *Chefe do Andar 50 / 60*: O Carrasco das Almas Perdidas.

4. **Andares 61 a 80 — O Fosso da Lava Arcana**
   - *Ambiente*: Rios de magma violeta, plataformas de calor e vapores vulcânicos.
   - *Inimigos*: Bruxos das Chamas Negras e Gárgulas Igneas.
   - *Chefe do Andar 80*: Quimera de Magma Vulcânico.

5. **Andares 81 a 100 — O Pináculo Celestial**
   - *Ambiente*: Torres acima das nuvens, ventos cortantes e plataformas flutuantes.
   - *Inimigos*: Sentinelas Aladas e Infiltradores do Vento.
   - *Chefe do Andar 100*: O Guardião do Zênite Celestial.

6. **Andares 101 a 120 — O Abismo Carmesim**
   - *Ambiente*: Cânions sangrentos, cristais escarlates e estalactites pontiagudas.
   - *Inimigos*: Assassinos de Sangue e Gárgulas Carmesim.
   - *Chefe do Andar 120*: O Arauto do Sangue Antigo.

7. **Andares 121 a 140 — A Fenda de Cristal Roxo**
   - *Ambiente*: Formações geológicas de ametista reflexiva e arcos elétricos.
   - *Inimigos*: Prismas Vivos e Feiticeiros do Cristal.
   - *Chefe do Andar 140*: Colosso Ressonante de Cristal.

8. **Andares 141 a 160 — A Forja das Almas**
   - *Ambiente*: Caldeirões titânicos de metal e engrenagens movidas a energia espectral.
   - *Inimigos*: Autômatos de Aço e Ferreiros da Morte.
   - *Chefe do Andar 150 / 160*: O Mestre da Forja Imortal.

9. **Andares 161 a 180 — O Horizonte das Sombras**
   - *Ambiente*: O limiar do nada, escuridão densa e plataformas translúcidas instáveis.
   - *Inimigos*: Sombras Penetrantes e Aparições Fantasmagóricas.
   - *Chefe do Andar 180*: A Entidade do Crepúsculo.

10. **Andares 181 a 200 — O Núcleo da Alma Primordial**
    - *Ambiente*: A câmara de criação do universo, aurora fractal dourada e energias divinas.
    - *Inimigos*: A Guarda Celestial Primordial (apenas Elites).
    - **Chefe do Andar 200 (Hard Master Final)**: **O Titã do Vazio Supremo**, uma criatura monumental de três fases de batalha com ataques em área, chuva de meteoros astrais e feixes de energia.

---

## 👹 6. Bestiário Completo

### Inimigos Padrão

1. **Espectro Errante (Wandering Shade)**:
   - *Vida*: 35 HP | *Dano*: 1 Coração | *Velocidade*: Baixa.
   - Patrulha plataformas e avança lentamente em direção ao jogador ao avistá-lo.
   - *Dica tática*: Um combo de dois golpes é suficiente para derrotá-lo.

2. **Slime Etéreo (Ethereal Slime)**:
   - *Vida*: 25 HP | *Dano*: 0.5 Coração | *Velocidade*: Saltos Periódicos.
   - Salta sobre obstáculos e explode em pequenas partículas ao morrer.

3. **Arqueiro do Vazio (Void Archer)**:
   - *Vida*: 45 HP | *Dano*: 1.5 Corações (Projétil) | *Velocidade*: Média.
   - Mantém distância e dispara flechas sombrias horizontais a cada 2.5s.
   - *Dica tática*: Bloqueie a flecha no momento exato (`S`) para refletir o projétil de volta ao arqueiro!

4. **Gárgula Arcana (Arcane Gargoyle)**:
   - *Vida*: 70 HP | *Dano*: 1.5 Corações | *Velocidade*: Alta (Voo).
   - Paira no ar e mergulha em rasante diagonal quando alinhada com o jogador.

5. **Cavaleiro Corrompido (Corrupted Knight)**:
   - *Vida*: 120 HP | *Dano*: 2.0 Corações | *Velocidade*: Média.
   - Equipado com escudo. Bloqueia ataques frontais a menos que seja quebrado com Magia Astral (`K`) ou atacado pelas costas após uma esquiva (`L`).

6. **Bruxo das Chamas Negras (Dark Pyromancer)**:
   - *Vida*: 80 HP | *Dano*: 2.0 Corações | *Velocidade*: Teleporte.
   - Conjura chamas no chão e se teleporta após receber dois golpes.

7. **Sentinela de Pedra (Stone Sentinel)**:
   - *Vida*: 160 HP | *Dano*: 2.5 Corações | *Velocidade*: Muito Baixa.
   - Alta armadura. Imune a atordoamento normal, exigindo parry de impacto pesado.

8. **Infiltrador das Sombras (Shadow Lurker)**:
   - *Vida*: 90 HP | *Dano*: 2.5 Corações | *Velocidade*: Muito Alta.
   - Fica invisível durante a movimentação, revelando-se apenas 0.5s antes de golpear.

---

## 🚀 7. O Elevador Astral (Seleção de Checkpoints)

Na tela de título e no menu de pausa, o **Elevador Astral** permite:
- Visualizar todos os andares já alcançados;
- Saltar diretamente para o andar desejado sem perder seu progresso histórico;
- Checkpoints automáticos a cada 5 andares;
- Reinício instantâneo no último andar visitado.

---

## 🏆 8. Conquistas & Troféus (12 Desafios)

1. **Primeiro Passo Astral**: Conclua o 1º andar da Torre.
2. **Mestre do Contra-Ataque**: Execute 10 parries perfeitos.
3. **Senhor dos Combos**: Alcance um combo de 20 golpes ininterruptos.
4. **Vontade Inabalável**: Conclua 5 andares sem sofrer nenhum dano.
5. **Campeão do Bosque**: Vença o 40º andar.
6. **Muralha de Ferro**: Execute 50 parries acumulados na carreira.
7. **Dominador do Fácil**: Conclua todas as 50 fases do modo Fácil.
8. **Herói da Torre**: Conclua as 100 fases do modo Médio.
9. **Guerreiro Implacável**: Conclua as 150 fases do modo Difícil.
10. **Lenda Viva**: Alcance o lendário 200º andar no modo Hard Master.
11. **Soberano da Alma Primordial**: Derrote o Titã Supremo no 200º andar do Hard Master.
12. **Maestria Total**: Desbloqueie todas as outras 11 conquistas.

---

## 💾 9. Backup de Save JSON & Portabilidade

Para garantir segurança total dos dados do jogador:
- O progresso é armazenado automaticamente no `localStorage` do navegador;
- Você pode acessar a **Galeria de Conquistas** a qualquer momento e clicar em:
  - **Exportar Save (JSON)**: Gera um arquivo `.json` legível contendo todas as conquistas, andares desbloqueados e estatísticas;
  - **Importar Save (JSON)**: Restaura seu save em qualquer computador ou navegador instantaneamente.
