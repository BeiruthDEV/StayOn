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

## Situação

Tudo que não depende do SDK do Android está escrito e commitado. O que foi
verificado até aqui, sem aparelho:

- `npm run typecheck` e `npm run lint` limpos
- `npx expo prebuild --platform android` gera o projeto nativo
- o autolinking do Expo encontra o `stay-on-blocker`
- `npx expo export --platform android` empacota o bundle sem erro
- os XML do serviço de acessibilidade são bem formados

Falta a verificação que só existe no aparelho, e que é o critério de sucesso
desta fase: compilar com `npx expo run:android`, conceder a permissão e
confirmar que o aplicativo bloqueado volta para a tela inicial.

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
- **A pasta `prototype/`** tem 1,2 MB de HTML e capturas do protótipo original.
  Nada no aplicativo a usa; fica como histórico até ser decidido o contrário.
