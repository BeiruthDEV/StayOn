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
