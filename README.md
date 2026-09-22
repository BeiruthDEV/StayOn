# StayOn

App de foco e produtividade em React Native + Expo. Funciona offline, é
gratuito, não pede cadastro e guarda tudo no próprio celular.

## Como rodar

Precisa de Node 22 e do app **Expo Go** no celular
([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) ·
[iOS](https://apps.apple.com/app/expo-go/id982107779)).

```bash
git clone https://github.com/BeiruthDEV/StayOn.git
```

```bash
cd StayOn/apps/mobile && npm install && npm start
```

Leia o QR Code que aparece no terminal com o Expo Go (Android) ou com a câmera
(iOS). O celular precisa estar na mesma rede Wi-Fi do computador — se a rede
bloquear, rode `npm start --tunnel`.

## Telas

| Tela | Rota | O que faz |
|---|---|---|
| Início | `/` | Tarefas do dia, próxima ação, hábitos e resumo de foco |
| Planejar | `/planner` | Agenda do dia em blocos de tempo |
| Datas importantes | `/dates` | Calendário e compromissos |
| Foco | `/focus` | Cronômetro de sessão de foco |
| Insights | `/insights` | Números do dia e da semana |
| Perfil | `/profile` | Nome, preferências e apagar dados |
| Configuração inicial | `/onboarding` | Nome e áreas de foco |
| Hábitos | `/habits` | Lista de hábitos |

O app começa vazio. Tudo que aparece é o que você cria.

## Estrutura

```
apps/mobile
  app/            rotas (expo-router)
  src/components  componentes de interface
  src/features    uma pasta por tela
  src/domain      regras e cálculos, sem React
  src/state       estado global, salvo no aparelho
  src/storage     leitura e escrita no AsyncStorage
  src/theme       cores, fontes e espaçamento
  src/icons       ícones SVG
prototype         protótipo HTML original
```

## Comandos

```bash
npm start        # sobe o app
npm run typecheck
npm run lint
```
