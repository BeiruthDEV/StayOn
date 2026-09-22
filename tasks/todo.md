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
- [ ] Início: criar/editar/apagar tarefa, data e saudação reais, próxima ação vinda da agenda
- [ ] Hábitos: tela própria com criar, pausar e remover
- [ ] Planejar: criar, editar e apagar blocos; concluir bloco
- [ ] Datas: criar e apagar compromissos, calendário no mês corrente
- [ ] Foco: gravar a sessão encerrada no histórico
- [ ] Insights: métricas calculadas a partir das sessões e tarefas reais
- [ ] Revisão semanal: métricas da semana corrente, reflexão salva
- [ ] Perfil: nome editável, preferências salvas, apagar dados, sem assinatura
- [ ] Onboarding: primeira abertura, nome e áreas salvos
- [ ] README com o passo a passo para o professor rodar e testar

## Decisões

- **Sem backend.** Tudo local, em AsyncStorage. O enunciado não pede API e um
  servidor só adicionaria custo e ponto de falha na avaliação.
- **Sem assinatura.** A linha "Plano Pro" do protótipo sai do Perfil.
- **Tempo de tela não é medido.** Não existe API pública para isso em Expo Go.
  Os Insights passam a mostrar o que dá para medir de verdade (sessões de foco,
  tarefas, blocos) em vez de inventar número de tempo de tela.
