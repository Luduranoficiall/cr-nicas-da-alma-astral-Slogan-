# Guia de Contribuição — Remanescente da Alma

Obrigado pelo seu interesse em contribuir para o **Remanescente da Alma**! Este projeto é um RPG de ação e plataforma 2D projetado com inspiração direta na arquitetura de física e nós do Godot Engine 3.6.3.

---

## 🧭 Como Começar

1. Faça um **Fork** do repositório no GitHub.
2. Clone seu fork localmente:
   ```bash
   git clone https://github.com/<SEU_USUARIO>/remanescente-da-alma.git
   cd remanescente-da-alma
   ```
3. Crie uma branch para sua funcionalidade ou correção:
   ```bash
   git checkout -b feature/novo-bioma-ou-inimigo
   ```
4. Instale as dependências:
   ```bash
   npm install
   ```

---

## 🛠️ Padrões de Código e Testes

- **TypeScript Rigoroso**: Todos os novos módulos devem ser fortemente tipados. Evite o uso de `any`.
- **Física Determinística**: Qualquer lógica de física em `src/game/engine.ts` deve respeitar o *Fixed Delta Time* clamped.
- **Tailwind CSS v4**: O estilo da interface deve utilizar as classes utilitárias do Tailwind v4 (`@import "tailwindcss";`).
- **Testes Unitários**: Sempre execute e adicione testes quando introduzir novas regras de jogo:
  ```bash
  npx --yes tsx --test src/game/rules.test.ts
  ```
- **Verificação de Build**:
  ```bash
  npx tsc --noEmit
  npm run build
  ```

---

## 📝 Convenções de Commits

Utilizamos o padrão de **Conventional Commits**:
- `feat:` Uma nova funcionalidade (ex: novo inimigo, novo andar, novo poder)
- `fix:` Correção de um bug
- `docs:` Alterações na documentação ou manual técnico
- `test:` Adição ou modificação de testes unitários
- `refactor:` Refatoração de código sem alteração no comportamento externo

---

## 🚀 Enviando seu Pull Request

1. Garanta que todos os testes passem (`npx --yes tsx --test src/game/rules.test.ts`).
2. Faça push para a sua branch:
   ```bash
   git push origin feature/novo-bioma-ou-inimigo
   ```
3. Abra um **Pull Request** no GitHub com uma descrição clara das alterações realizadas e screenshots se houver mudanças visuais.
