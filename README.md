<div align="center">

<img src="StayOn_Icon.png" alt="StayOn" width="96" />

# StayOn

**App de foco para Android que fecha de verdade os aplicativos que distraem.**

[![CI](https://github.com/BeiruthDEV/StayOn/actions/workflows/ci.yml/badge.svg)](https://github.com/BeiruthDEV/StayOn/actions/workflows/ci.yml)
[![Última versão](https://img.shields.io/github/v/release/BeiruthDEV/StayOn?label=vers%C3%A3o)](https://github.com/BeiruthDEV/StayOn/releases/latest)
![Plataforma](https://img.shields.io/badge/plataforma-Android-3ddc84)
![Expo SDK](https://img.shields.io/badge/Expo-SDK%2054-000020)
[![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-blue)](LICENSE)

[Baixar o APK](https://github.com/BeiruthDEV/StayOn/releases/latest) · [Como rodar](#como-rodar) · [Arquitetura](#arquitetura) · [Segurança e privacidade](#segurança-e-privacidade)

</div>

---

## Sobre

O StayOn junta num lugar só o que costuma ficar espalhado: as tarefas do dia, os
hábitos, a rotina da semana, a agenda em blocos e as sessões de foco
cronometradas. Os números de foco vêm das sessões que você de fato fez, não de
estimativa.

Durante uma sessão, o app bloqueia os aplicativos que você escolher. Abrir o
Instagram devolve você para a tela inicial até o tempo acabar.

- **Gratuito, sem anúncios e sem cadastro.** Entrar pede só um nome.
- **Funciona offline.** Tudo o que você cria fica no próprio aparelho.
- **Código aberto**, sob licença MIT.

## Funcionalidades

| | |
|---|---|
| **Foco com bloqueio** | Cronômetro de sessão. Aplicativos da sua lista ficam barrados até o fim, mesmo que o StayOn seja fechado. |
| **Tarefas e hábitos** | Prioridades do dia e hábitos que podem ser pausados. |
| **Rotina semanal** | Semana fixa: a cada dia os blocos voltam desmarcados e o cumprido vira histórico. Importa de TXT, PDF ou texto colado. |
| **Agenda** | Planejamento em blocos de tempo, calendário e compromissos. |
| **Feriados nacionais** | Lista por ano e detalhe por data, vindos da BrasilAPI, com cache para uso sem internet. |
| **Insights** | Foco do dia e da semana, calculado a partir das suas sessões. |

## Como rodar

### Instalar o APK (mais simples)

1. Abra a [última release](https://github.com/BeiruthDEV/StayOn/releases/latest).
2. Baixe o `StayOn.apk` no celular Android e instale. O Android pode pedir para
   permitir a instalação de fontes desconhecidas.
3. Para o bloqueio funcionar, conceda a permissão uma vez: aba **Foco** →
   **Apps bloqueados** → **Abrir ajustes do sistema** → **StayOn** → ativar.

### Rodar o código

O bloqueio depende de código nativo, então o app é **só Android** e **não roda
no Expo Go**. Sem o módulo nativo ele ainda abre, mas com o bloqueio
desativado. É preciso:

- Node 22 (versão em [`.nvmrc`](.nvmrc))
- [Android Studio](https://developer.android.com/studio) com o Android SDK e
  `ANDROID_HOME` configurado
- **JDK 17** com `JAVA_HOME` configurado. A JDK que vem no Android Studio é mais
  nova e o Gradle não a aceita
- o projeto num caminho **sem acento e sem espaço**. No Windows, a JDK 17 lê
  nomes de arquivo na codificação da plataforma, e um "ó" no caminho impede o
  Gradle de achar as próprias dependências
- celular com depuração USB ativada, ligado por cabo

```bash
git clone https://github.com/BeiruthDEV/StayOn.git
cd StayOn/apps/mobile
npm install
npx expo run:android
```

A primeira vez compila o projeto nativo e instala o app no aparelho. Depois,
`npm start` basta para o dia a dia.

### Gerar o APK localmente

```bash
cd apps/mobile/android && ./gradlew :app:assembleRelease
```

O arquivo sai em `app/build/outputs/apk/release/app-release.apk`, já assinado e
com o JavaScript embutido. O workflow [`apk.yml`](.github/workflows/apk.yml)
faz o mesmo no GitHub e anexa o APK a cada release publicada.

### Comandos

| Comando | O que faz |
|---|---|
| `npm start` | Sobe o bundler, com o app já instalado |
| `npx expo run:android` | Compila o nativo e instala no aparelho |
| `npm run typecheck` | Confere os tipos (TypeScript estrito) |
| `npm run lint` | Confere o estilo do código |
| `npm test` | Roda os testes automatizados |

## Arquitetura

| Camada | Tecnologia |
|---|---|
| Aplicativo | React Native 0.81 · Expo SDK 54 · TypeScript estrito |
| Navegação | Expo Router (rotas por arquivo, grupos `(auth)` e `(app)`, rotas dinâmicas) |
| Dados locais | AsyncStorage para listas e preferências · SecureStore para a sessão |
| Rede | `fetch` atrás de uma camada própria, com cache de validade (TTL) |
| Bloqueio | Módulo nativo Android em Kotlin, usando um serviço de acessibilidade |
| Qualidade | `node --test` via tsx · ESLint · GitHub Actions |

### Estrutura

```
apps/mobile
├── app/             rotas (Expo Router)
├── modules/         módulo nativo do bloqueio (Kotlin)
└── src/
    ├── components/  componentes de interface
    ├── features/    uma pasta por tela
    ├── domain/      regras e cálculos, sem React e testáveis
    ├── hooks/       hooks reutilizáveis (ex.: useFetch)
    ├── services/    acesso à rede (api.ts) e feriados
    ├── state/       estado global, salvo no aparelho
    ├── storage/     AsyncStorage, SecureStore e cache com TTL
    ├── theme/       cores, fontes e espaçamento
    └── icons/       ícones SVG
```

A pasta `android/` é gerada por `npx expo prebuild` e não fica no repositório.

### Rotas

| Rota | Tela |
|---|---|
| `/login` | Entrada por nome |
| `/` | Início: tarefas do dia, próxima ação, hábitos e resumo de foco |
| `/routine` | Rotina semanal |
| `/planner` | Agenda do dia em blocos |
| `/focus` | Cronômetro de foco |
| `/insights` | Números do dia e da semana |
| `/profile` | Nome, preferências, sair e apagar dados |
| `/dates` | Calendário e compromissos |
| `/habits` | Hábitos |
| `/blocked-apps` | Aplicativos bloqueados na sessão |
| `/feriados` e `/feriado/[date]` | Feriados nacionais e detalhe |
| `/task/[id]` | Detalhe da tarefa |
| `/onboarding` | Configuração inicial: nome e áreas de foco |

O app começa vazio: tudo o que aparece foi você quem criou.

## Como o bloqueio funciona

Um serviço de acessibilidade é avisado pelo Android toda vez que a janela em
primeiro plano muda. Se o aplicativo que abriu está na sua lista e a sessão
ainda não terminou, o serviço devolve você para a tela inicial. Ele não lê o
conteúdo da tela, só o nome do pacote que abriu.

O horário de término fica salvo no aparelho. O bloqueio expira sozinho mesmo
que o StayOn seja fechado no meio da sessão, e fechar o app à força não libera
nada. No Perfil, o nível de intervenção define o comportamento: **Rígido**
fecha o aplicativo bloqueado na hora; **Suave** só avisa.

## Segurança e privacidade

- **Os dados ficam no aparelho.** A única chamada de rede é a lista pública de
  feriados (BrasilAPI), que leva apenas o ano consultado.
- **Sessão no cofre do sistema.** O nome do usuário é guardado no SecureStore
  (Keystore no Android, Keychain no iOS), não em texto puro.
- **Listas em AsyncStorage, sem criptografia.** Tarefas, hábitos e reflexões
  não são criptografados; quem tiver acesso root ao aparelho pode lê-los.
- **Rede endurecida.** Só HTTPS, com tempo limite de 10 s. A resposta da API é
  validada e recusada por inteiro se vier fora do formato esperado. As
  mensagens de erro não expõem a URL.
- **Entrada externa é validada.** Parâmetros de rota, como a data do feriado,
  passam por validação antes de serem usados.
- **Sair limpa o rastro.** Encerrar a sessão apaga o nome do cofre e o cache de
  rede.
- **O serviço de bloqueio não é exportado** para outros aplicativos e exige a
  permissão de sistema `BIND_ACCESSIBILITY_SERVICE`.

## Testes e integração contínua

```bash
cd apps/mobile
npm test
```

Os testes cobrem a lógica sem interface: validação do JSON da API, camada de
rede (HTTPS, status HTTP, tempo limite, resposta inválida), cache com validade e
modo offline, e a sessão do usuário. A cada pull request e a cada push no
`main`, o workflow [`ci.yml`](.github/workflows/ci.yml) roda tipos, lint e
testes.

## Licença

Distribuído sob a licença [MIT](LICENSE).
