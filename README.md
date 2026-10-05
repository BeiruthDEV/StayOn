# StayOn

Projeto pessoal: um app de produtividade e foco, feito em React Native + Expo.

A ideia é juntar num lugar só o que costuma ficar espalhado — as tarefas do
dia, os hábitos que você quer manter, a agenda em blocos de tempo e as sessões
de foco cronometradas. No fim, o app mostra quanto tempo você realmente focou,
calculado a partir das sessões que você fez, e não de estimativa.

Durante uma sessão, o app bloqueia os aplicativos que você escolher: abrir o
Instagram devolve você para a tela inicial até o tempo acabar.

Funciona offline, é gratuito, não pede cadastro e guarda tudo no próprio
celular. Nenhum dado sai do aparelho.

## Como rodar

Android apenas. Não roda no Expo Go, porque o bloqueio depende de código
nativo. Precisa de:

- Node 22
- [Android Studio](https://developer.android.com/studio) com o Android SDK,
  com `ANDROID_HOME` apontando para ele
- **JDK 17**, com `JAVA_HOME` apontando para ela. A JDK que vem dentro do
  Android Studio é mais nova e o Gradle não aceita
- o projeto num caminho **sem acento e sem espaço**. No Windows a JDK 17 lê
  nomes de arquivo na codificação da plataforma, e um "ó" no caminho faz o
  Gradle não achar as próprias dependências
- o celular ligado por cabo, com a depuração USB ativada

```bash
git clone https://github.com/BeiruthDEV/StayOn.git
```

```bash
cd StayOn/apps/mobile && npm install && npx expo run:android
```

A primeira vez compila o projeto nativo e instala o aplicativo no aparelho;
depois disso `npm start` já basta para o dia a dia.

Para o bloqueio funcionar, conceda a permissão uma vez: aba **Foco** → **Apps
bloqueados** → **Abrir ajustes do sistema** → **StayOn** → ativar.

## Instalar sem o ambiente de desenvolvimento

Para rodar no celular sem nada instalado no computador, gere o APK uma vez e
copie para o aparelho:

```bash
cd StayOn/apps/mobile/android && ./gradlew :app:assembleRelease
```

O arquivo sai em `app/build/outputs/apk/release/app-release.apk`. Ele já vem
assinado e com o JavaScript embutido, então funciona sozinho.

## Como o bloqueio funciona

Um serviço de acessibilidade é avisado pelo Android toda vez que a janela em
primeiro plano muda. Se o aplicativo que abriu está na sua lista e a sessão
ainda não terminou, o serviço devolve você para a tela inicial. Ele não lê o
conteúdo da tela — só o nome do pacote que abriu.

O horário de término fica salvo no aparelho, então o bloqueio expira sozinho
mesmo que o StayOn seja fechado no meio da sessão — e a sessão em andamento
também é salva, então fechar o aplicativo à força não libera nada.

No Perfil, o nível de intervenção decide o que acontece: **Rígido** fecha o
aplicativo bloqueado na hora, **Suave** apenas avisa e deixa você decidir.

## Telas

| Tela | Rota | O que faz |
|---|---|---|
| Início | `/` | Tarefas do dia, próxima ação, hábitos e resumo de foco |
| Planejar | `/planner` | Agenda do dia em blocos de tempo |
| Datas importantes | `/dates` | Calendário e compromissos |
| Foco | `/focus` | Cronômetro de sessão de foco |
| Apps bloqueados | `/blocked-apps` | Escolha do que fica barrado na sessão |
| Insights | `/insights` | Números do dia e da semana |
| Perfil | `/profile` | Nome, preferências e apagar dados |
| Configuração inicial | `/onboarding` | Nome e áreas de foco |
| Hábitos | `/habits` | Lista de hábitos |

O app começa vazio. Tudo que aparece é o que você cria.

## Estrutura

```
apps/mobile
  app/            rotas (expo-router)
  modules/        módulo nativo do bloqueio (Kotlin)
  src/components  componentes de interface
  src/features    uma pasta por tela
  src/domain      regras e cálculos, sem React
  src/state       estado global, salvo no aparelho
  src/storage     leitura e escrita no AsyncStorage
  src/theme       cores, fontes e espaçamento
  src/icons       ícones SVG
```

A pasta `android/` é gerada por `npx expo prebuild` e não fica no repositório.

## Comandos

```bash
npx expo run:android   # compila o nativo e instala no aparelho
npm start              # sobe o bundler, com o app já instalado
npm run typecheck
npm run lint
```
