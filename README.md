# StayOn

Aplicativo mobile de foco e produtividade, construído em **React Native + Expo**
a partir de um protótipo HTML de alta fidelidade.

O protótipo em `prototype/` é a fonte da verdade: paleta, tipografia, espaçamento
e comportamento foram extraídos dele e recriados no Expo, tela por tela.

---

## Telas

| # | Tela | Rota | O que faz |
|---|------|------|-----------|
| 1 | Início | `/` | Próxima ação, progresso do dia, prioridades, hábitos de hoje, próximo evento e nota de distração. Concluir tarefa ou hábito é desfazível. |
| 2 | Planejar | `/planner` | Linha do tempo do dia com blocos concluídos, perdidos e futuros, marcador do horário atual e replanejamento do bloco perdido. |
| 3 | Datas importantes | `/dates` | Calendário do mês com marcadores, filtros por categoria, destaque do próximo compromisso e lista de eventos. |
| 4 | Foco | `/focus` | Sessão de foco com cronômetro regressivo real: pausar, retomar, estender em 5 minutos, encerrar ou abandonar. |
| 5 | Insights | `/insights` | Tempo de tela dividido entre produtivo e distraído, insight principal, uso por faixa de horário e ranking de distrações. |
| 6 | Revisão semanal | `/weekly-review` | Taxa de execução contra a meta, foco profundo, janela de pico, precisão do planejamento, recomendação do sistema e campos de reflexão. |
| 7 | Perfil | `/profile` | Identidade da conta, sistema pessoal, controle de distração, conexões e ajustes do aplicativo. |
| 8 | Configuração inicial | `/onboarding` | Escolha das áreas de foco, com indicador de passos. |

As cinco primeiras abas ficam na navegação inferior; Datas importantes, Revisão
semanal e Configuração inicial abrem a partir delas.

---

## Como rodar

Requer Node 22 (ver `.nvmrc`) e o aplicativo **Expo Go** no celular.

```bash
cd apps/mobile && npm install && npm start
```

Leia o QR Code com o Expo Go (Android) ou com a câmera (iOS).

Verificações:

```bash
cd apps/mobile && npm run typecheck && npm run lint
```

---

## Estrutura

```
apps/mobile
  app/            rotas do expo-router (abas + telas de pilha)
  src/components  componentes de interface reutilizáveis
  src/features    uma pasta por tela, com seus subcomponentes
  src/domain      tipos e regras puras (sem React)
  src/data        dados mock do protótipo
  src/state       contextos de tarefas, hábitos, blocos e toast
  src/theme       cores, tipografia, espaçamento, raios, sombras e movimento
  src/icons       traçados SVG e o componente Icon
prototype         protótipo HTML original e capturas de tela
```

A separação é proposital: `domain` guarda as regras testáveis sem React,
`data` guarda apenas os mocks que um dia virão do servidor, e `features`
monta as telas a partir de `components` e `theme`. Nenhuma tela escreve cor,
fonte ou espaçamento à mão.

---

## Passos da construção

O repositório foi aberto vazio e construído em commits pequenos, nesta ordem:

1. Commit inicial com o plano completo
2. Protótipo HTML de referência
3. Esqueleto do app Expo
4. Tema: cores
5. Tema: tipografia Geist
6. Tema: espaçamento, raios, sombras e movimento
7. Ícones SVG
8. Componentes base (`AppText`, `Card`, `Screen`)
9. Componentes de ação (`Button`, `IconButton`)
10. Componentes de lista e feedback
11. Domínio de tarefa, hábito e progresso do dia
12. Dados mock
13. Estado global (providers)
14. Layout raiz com fontes e providers
15. Navegação por abas
16. Tela Início
17. Ampliação do conjunto de ícones
18. Sincronização do lockfile
19. Cores de alerta e de confirmação
20. `Chip`, `SegmentedControl`, `ScreenHeader` e `StatTile`
21. Tela Planejar
22. Tela Datas importantes
23. Tela Foco
24. Tela Insights
25. Tela Revisão semanal
26. Tela Perfil
27. Tela Configuração inicial
28. Remoção do placeholder das abas
29. Alinhamento das dependências com o SDK 54
30. Esta documentação
