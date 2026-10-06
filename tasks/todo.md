# Tornar o StayOn funcional

Objetivo: sair do protótipo navegável para um aplicativo que faz o que promete,
com os dados guardados no aparelho. Sem backend e sem assinatura — o app é
inteiramente gratuito e funciona offline.

## Critério de sucesso

Fechar e reabrir o aplicativo mantém tudo que foi criado, marcado e escrito.
Nenhum botão responde apenas com "chega em breve".

## Passos

- [x] Instalar AsyncStorage e fixar as versões do SDK 54 → verificar: `npx expo install --check` limpo
- [x] Camada de persistência (`src/storage`) → verificar: typecheck
- [x] Providers de tarefas, hábitos e blocos persistidos, com CRUD → verificar: typecheck
- [x] Providers de eventos, sessões de foco e preferências → verificar: typecheck
- [x] Componentes de formulário: Sheet, TextField, OptionPicker, EmptyState → verificar: lint
- [x] Início: criar/editar/apagar tarefa, data e saudação reais, próxima ação vinda da agenda
- [x] Hábitos: tela própria com criar, pausar e remover
- [x] Planejar: criar, editar e apagar blocos; concluir bloco
- [x] Datas: criar e apagar compromissos, calendário no mês corrente
- [x] Foco: gravar a sessão encerrada no histórico
- [x] Insights: métricas calculadas a partir das sessões e tarefas reais
- [x] Revisão semanal: métricas da semana corrente, reflexão salva
- [x] Perfil: nome editável, preferências salvas, apagar dados, sem assinatura
- [x] Onboarding: primeira abertura, nome e áreas salvos
- [x] README com o passo a passo para o professor rodar e testar

## Decisões

- **Sem backend.** Tudo local, em AsyncStorage. O enunciado não pede API e um
  servidor só adicionaria custo e ponto de falha na avaliação.
- **Sem assinatura.** A linha "Plano Pro" do protótipo sai do Perfil.
- **Tempo de tela não é medido.** Não existe API pública para isso em Expo Go.
  Os Insights passam a mostrar o que dá para medir de verdade (sessões de foco,
  tarefas, blocos) em vez de inventar número de tempo de tela.

## Revisão

Todos os passos concluídos. Verificações rodadas a cada commit:
`npm run typecheck` e `npm run lint` limpos, e `npx expo export --platform
android` empacotando sem erro.

Nenhuma ação do aplicativo responde mais com "chega em breve" — a busca por
essa string no código não retorna nada.

O que ficou de fora, e por quê:

- **Tempo de tela e bloqueio de aplicativos.** Sem API pública no Expo Go.
  Seria necessário um build nativo com permissões especiais em cada
  plataforma, fora do escopo do trabalho. As telas que dependiam disso foram
  refeitas com métricas que o app apura sozinho.
- **Integrações (calendário do sistema, app desktop, extensão).** Os quatro
  cartões de conexão saíram do Perfil em vez de continuarem decorativos.
- **Visão semanal na aba Planejar.** O consolidado da semana já existe na
  Revisão semanal; a aba explica onde encontrá-lo.
- **Sincronização entre aparelhos.** Exigiria backend e conta de usuário. O
  aplicativo é gratuito e offline por decisão de escopo.

## Correção — aplicativo começa vazio

Os dados de exemplo do protótipo estavam sendo usados como estado inicial, então
a primeira abertura trazia tarefas, hábitos, blocos e compromissos que a pessoa
não criou. Os quatro arquivos de exemplo saíram e cada provider nasce vazio; o
apagar todos os dados do Perfil agora apaga de verdade em vez de repor os
exemplos. Registrado em `lessons.md`.

## Correções do teste no aparelho

- [x] Formulários cortados: o corpo do Sheet precisa encolher para rolar → verificar no celular
- [x] Pause da sessão não funciona: updater impuro em toggleRunning → verificar
- [x] Sessão curta grava 0 minuto: passar a guardar segundos → verificar nos Insights
- [x] Encerrar sessão sai da aba: deve registrar e continuar em Foco
- [x] Fundir Insights e Revisão semanal numa aba só
- [x] README direto, sem enchimento

---

# Fase 2 — bloqueio real de aplicativos (Android)

O projeto deixa de ser trabalho de faculdade e passa a ser pessoal, então a
restrição que matava a ideia original cai: não precisa mais rodar no Expo Go.

Objetivo: ao dar play numa sessão, o aparelho realmente impede o acesso aos
aplicativos escolhidos até a sessão terminar.

## Critério de sucesso

Com uma sessão de 25 min rodando e o Instagram na lista de bloqueio: abrir o
Instagram volta para a tela inicial do sistema. Ao fim dos 25 min, o Instagram
abre normalmente — inclusive se o StayOn tiver sido fechado no meio.

## Pré-requisito na máquina

Nada de Android instalado hoje: sem Java, sem SDK, sem Android Studio.

- [ ] Instalar Android Studio com o Android SDK → verificar: `adb version` responde
- [ ] `ANDROID_HOME` apontando para o SDK e `platform-tools` no PATH
- [ ] Depuração USB ligada no celular → verificar: `adb devices` lista o aparelho

## Passos

- [x] `npx expo prebuild --platform android`, app vira build próprio → verificar: `npx expo run:android` abre no aparelho
- [x] Cronômetro passa a ser por horário de término, não por contagem de ticks → verificar: sair do app 2 min e voltar, tempo restante correto
- [x] Módulo nativo local `modules/stay-on-blocker` em Kotlin → verificar: uma função de teste responde do Kotlin no JS
- [x] Listar aplicativos instalados que têm ícone na gaveta → verificar: a lista aparece no app
- [x] `AccessibilityService` que detecta o app em primeiro plano e expulsa → verificar: critério de sucesso acima
- [x] Tela "Apps bloqueados": estado da permissão e seleção salva → verificar: seleção sobrevive a fechar o app
- [x] Ligar o bloqueio ao ciclo da sessão, com expiração por horário → verificar: matar o app no meio da sessão não deixa o bloqueio preso
- [x] README deixa de falar em Expo Go → verificar: leitura

## Decisões

- **`AccessibilityService`, não `UsageStatsManager`.** Os dois conseguem saber
  qual app está na frente, mas o `UsageStatsManager` exige ficar consultando em
  laço, o que gasta bateria e atrasa a reação. O serviço de acessibilidade é
  avisado pelo sistema na hora que a janela troca.

- **Expulsar com `GLOBAL_ACTION_HOME`, não com janela sobreposta.** Jogar o
  usuário para a tela inicial não pede permissão nenhuma além da própria
  acessibilidade. Uma tela de aviso por cima do app bloqueado é mais bonita,
  mas precisa de `SYSTEM_ALERT_WINDOW` e esbarra na restrição do Android 10+
  para abrir tela em segundo plano. Fica para depois, se incomodar.

- **Estado do bloqueio em `SharedPreferences`, não em memória.** O serviço de
  acessibilidade vive fora do React e pode ser reiniciado pelo sistema a
  qualquer momento. Guardar "bloqueado até tal horário" e a lista de pacotes no
  disco significa que ele acorda já sabendo o que fazer, e que o bloqueio
  expira sozinho mesmo se o StayOn tiver sido morto.

- **Cronômetro por horário de término.** Hoje o tempo restante é um contador
  decrementado de segundo em segundo por `setInterval`. Com o app em segundo
  plano o JavaScript é estrangulado pelo sistema e esse contador atrasa — o que
  num app de bloqueio é justamente o cenário normal, já que a pessoa sai do app
  para tentar abrir outro. Guardando o horário em que a sessão acaba, o tempo
  restante é sempre calculado a partir do relógio e não existe atraso.

- **Módulo local do Expo, com manifesto próprio.** As permissões e a declaração
  do serviço ficam dentro de `modules/stay-on-blocker` e são mescladas no build.
  Assim a pasta `android/` continua descartável e regenerável por `prebuild`.

- **Loja de aplicativos não é objetivo.** O Google Play restringe bastante o uso
  de `AccessibilityService` e de `QUERY_ALL_PACKAGES`. Como o app é pessoal e
  instalado direto, isso não pesa — mas inviabiliza publicar depois sem
  retrabalho.

## Verificação

Compilado e rodado num emulador Android (API 37). O critério de sucesso desta
fase foi atingido:

| O que foi testado | Resultado |
|---|---|
| Chrome, na lista de bloqueio, com sessão rodando | volta para a tela inicial |
| Relógio, na lista de bloqueio | volta para a tela inicial |
| Gmail, **fora** da lista | abre normalmente |
| Encerrar a sessão | `terminaEm` zera e o Chrome abre |
| Matar o processo do StayOn no meio da sessão | continua bloqueando |
| Reabrir depois de morto | sessão volta com o tempo certo, descontado |

O estado gravado pelo módulo nativo foi conferido direto no aparelho:
`terminaEm` com o horário correto, a lista de pacotes e `estrito=true`.

Também verificado: o ícone adaptativo na gaveta, o splash escuro com a marca, a
lista de aplicativos instalados vinda do `PackageManager`, a leitura da
permissão de acessibilidade e o registro da sessão encerrada no histórico.

**Uma limitação que o teste revelou:** Configurações → Forçar parada derruba o
bloqueio, porque o Android remove o serviço de acessibilidade da lista de
ativos. Nenhum aplicativo escapa disso; é o sistema desligando o serviço, não o
StayOn falhando. Matar o processo pela memória, que é o caso comum, não afeta.

## Limpeza e acabamento

- [x] Varredura de código e arquivos sem uso → verificar: typecheck e lint
- [x] Sessão salva no aparelho, fechar o app à força não derruba o bloqueio
- [x] Splash escuro com a marca, no lugar do logo padrão em fundo branco
- [x] Nível de intervenção deixa de ser decorativo e passa a valer no bloqueio
- [x] Apagar os dados desliga o bloqueio ativo

O que a varredura encontrou e foi removido: 16 ícones nunca usados, o peso 700
da fonte (que era carregado à toa na abertura), `pendingTasks`, `touchTarget`,
`colors.dangerStrong`, `motion.fast`, `motion.slow`, `radius.lg` e o
`favicon.png`. Nenhum arquivo órfão: todos os 116 arquivos de código são
alcançáveis a partir das rotas.

Ficou de fora de propósito: onze exportações que só são usadas dentro do
próprio arquivo. Não são código morto, apenas visibilidade mais larga do que o
necessário, e estreitar isso mexeria em onze arquivos sem ganho real.

## Em aberto

- **Aviso de bloqueio é um toast.** Funciona, mas uma tela própria explicando
  quanto falta seria mais clara. Precisa de `SYSTEM_ALERT_WINDOW`.
- **A pasta `prototype/` foi removida.** Eram 1,3 MB de HTML e capturas que o
  aplicativo não usava. Continua no histórico do Git, então nada se perdeu de
  verdade: `git show <commit>^:prototype/StayOn.dc.html` recupera o arquivo.

## Versão web, para iPhone

O bloqueio é um serviço de acessibilidade do Android e não existe no iOS.
Publicar na App Store ou distribuir por TestFlight custa 99 dólares por ano, o
que não se justifica para mostrar o aplicativo a algumas pessoas. A saída é
exportar o mesmo código como site instalável: quem abre no Safari e escolhe
"Adicionar à Tela de Início" passa a ter o StayOn em tela cheia, com ícone, sem
loja e sem revisão.

Vale para tudo menos o bloqueio: tarefas, hábitos, planner, datas, cronômetro e
insights são React Native puro e atravessam sem mudança.

- [x] Habilitar a plataforma web: `npx expo install react-native-web
      @expo/metro-runtime` → verificar: `npx expo start --web` abre o
      aplicativo e as sete rotas navegam
- [x] Esconder o bloqueio onde ele não existe: a linha "Apps bloqueados" sai da
      tela Foco e a tela de escolha explica a ausência sem citar Expo Go →
      verificar: `npm run typecheck` e `npm run lint` limpos, e nenhuma menção a
      bloqueio no navegador
- [x] Exportar estático: `npx expo export --platform web` → verificar: servir a
      pasta gerada e percorrer as rotas sem erro no console
- [x] Manifesto e ícones: `manifest.json` com `display: standalone` e fundo
      `#050505`, mais `apple-touch-icon` de 180px → verificar: no iPhone, o
      ícone correto aparece em "Adicionar à Tela de Início" e o aplicativo abre
      sem a barra do Safari
- [ ] Service worker guardando o essencial → verificar: abrir em modo avião
- [ ] Hospedar landing e aplicativo no mesmo endereço, a landing na raiz e o
      aplicativo em `/app` → verificar: as duas URLs abrem em rede externa
- [ ] Convite na landing explicando o passo a passo do Safari → verificar:
      visível em tela de celular

Limites conhecidos, para registrar antes e não descobrir depois: a instalação
na tela de início só acontece pelo Safari, no Chrome do iPhone vira atalho
comum; e o iOS descarta dados de sites pouco usados, o que torna o histórico
menos durável do que no aplicativo instalado.

O export estático gera um arquivo por rota — `focus.html`, `planner.html` e
assim por diante — em vez de uma página só. O Cloudflare Pages entrega
`/focus` a partir de `focus.html` sem configuração nenhuma; servidores que não
fazem essa associação devolvem 404, que foi o que apareceu no teste local até
o servidor de teste passar a imitar esse comportamento.

Duas coisas ficaram verificadas pela metade e vale registrar por quê:

- **O service worker não pôde ser testado aqui.** O navegador embutido recusa
  qualquer registro, inclusive servindo sem cabeçalho nenhum: `Failed to
  register a ServiceWorker ... An unknown error occurred when fetching the
  script`. O arquivo está sintaticamente válido e é servido com o tipo certo,
  mas quem confirma que ele guarda o aplicativo é o primeiro acesso ao
  endereço publicado.
- **A pré-renderização e o cliente discordam na primeira pintura.** O React
  reclama de hidratação (`Minified React error #418`) porque o HTML é gerado na
  compilação, quando ainda não existe nem saudação por horário nem dado salvo.
  Ele se recupera sozinho redesenhando no cliente e o aplicativo funciona, mas
  é um remendo e não uma solução.
