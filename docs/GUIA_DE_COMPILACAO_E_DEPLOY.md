# 🛠️ Guia de Compilação, Testes e Deploy
## *Remanescente da Alma (Soul's Remnant)*

Este guia orienta engenheiros de software, testadores e administradores na compilação, execução da suíte de testes automatizados e deploy em ambientes de produção.

---

## 📋 1. Pré-requisitos de Ambiente

Para compilar e executar o projeto com estabilidade garantida:

- **Node.js**: Versão LTS v20.x ou superior (v22.x recomendada).
- **Gerenciador de Pacotes**: `npm` v10+, `bun` v1+, ou `pnpm` v9+.
- **Navegador Suportado**: Qualquer navegador moderno com suporte a ES2022, Canvas 2D e Web Audio API (Chrome 110+, Edge 110+, Firefox 115+, Safari 16+).

---

## 🚀 2. Instalação e Execução em Desenvolvimento

```bash
# 1. Clonar o repositório
git clone https://github.com/<SEU_USUARIO>/remanescente-da-alma.git
cd remanescente-da-alma

# 2. Instalar dependências
npm install

# 3. Iniciar o servidor de desenvolvimento Vite (Porta 3000)
npm run dev
```

O jogo estará acessível imediatamente em:
```
http://localhost:3000
```

---

## 🧪 3. Execução da Suíte de Testes Automatizados

O projeto inclui testes de integração e testes unitários das regras matemáticas puras de combate e progressão de andares:

```bash
# Executa todos os testes unitários via Node.js Test Runner
npx --yes tsx --test src/game/rules.test.ts
```

### O que os testes cobrem:
1. Limites de andares por dificuldade (Fácil = 50, Médio = 100, Difícil = 150, Hard Master = 200);
2. Cálculo de dano com multiplicador de dificuldade;
3. Mitigação completa (dano zero) durante janelas de parry perfeitas;
4. Janela de tolerância e expiração de Coyote Time;
5. Fórmulas de cálculo de rank de desempenho (S+, S, A, B, C);
6. Integridade de importação e exportação do esquema de Save JSON;
7. Desbloqueio e verificação idempotente de conquistas.

---

## 🔍 4. Verificação Estática de Tipagem (TypeScript Lint)

Antes de gerar qualquer pacote de produção, certifique-se de que não há erros de tipagem estrita:

```bash
# Executa a verificação TypeScript sem emitir arquivos
npx tsc --noEmit
```

Se a saída for silenciosa (código de saída 0), o projeto está em conformidade total.

---

## 📦 5. Compilação para Produção (Build)

Para compilar o código minificado, empacotado e otimizado com Tailwind CSS v4 e Vite:

```bash
npm run build
```

Os artefatos finais serão emitidos no diretório `/dist`, prontos para servir em qualquer servidor de arquivos estáticos, CDN, NGINX ou bucket de nuvem.

### Testar o Build de Produção Localmente:
```bash
npm run preview
```

---

## 🚢 6. Opções de Deploy em Nuvem

### Opção A: Vercel / Netlify
1. Conecte o repositório GitHub à sua conta Vercel ou Netlify;
2. Configure o comando de build: `npm run build`;
3. Configure o diretório de saída: `dist`;
4. Deploy automático a cada push na branch `main`.

### Opção B: GitHub Pages
O projeto conta com GitHub Actions em `.github/workflows/ci.yml`. Para publicar no GitHub Pages:
1. Habilite o GitHub Pages nas configurações do repositório (`Settings > Pages > Source: GitHub Actions`);
2. A cada push na branch `main`, a compilação e publicação acontecem automaticamente.

### Opção C: Docker / Contêiner NGINX
Crie um `Dockerfile` minimalista:
```dockerfile
# Estágio de Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Estágio de Servidor Web
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 📱 7. Conformidade com Dispositivos Móveis e Godot 3.6.3

Seguindo as novas exigências documentadas na versão de manutenção 3.6.3:
- **Android Target SDK 36 (Android 16)**: A aplicação possui suporte a gestos de toque na tela, prevenção de gestos padrão indesejados (`touch-action: none` no canvas de jogo), e escala automática de DPI.
- **iOS 15.0+**: Áudio com ativação pelo primeiro gesto do usuário (`AudioContext.resume()`), compatível com Safari mobile sem distorções WASAPI/CoreAudio.
