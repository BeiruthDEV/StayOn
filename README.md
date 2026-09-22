# StayOn

Aplicativo mobile de foco e produtividade, construído em **React Native + Expo**
a partir de um protótipo HTML de alta fidelidade.

O objetivo do projeto é *mocar* (recriar fielmente) o protótipo no Expo,
tela por tela, mantendo a mesma paleta, tipografia e comportamento.

---

## Passos do projeto

O repositório começa vazio e é construído nesta ordem, um commit por passo:

1. **Commit inicial** — projeto vazio, `.gitignore`, `.nvmrc` e este README com todos os passos.
2. **Protótipo de referência** — adicionar o HTML original e as capturas de tela que servem de fonte da verdade.
3. **Esqueleto do app Expo** — `package.json`, `app.json`, `tsconfig.json`, ESLint e `.gitignore` do app.
4. **Tema: cores** — paleta escura extraída do protótipo.
5. **Tema: tipografia** — fonte Geist e as variantes de texto.
6. **Tema: espaçamento, raios, sombras e movimento** — o restante dos tokens.
7. **Ícones** — traçados SVG do protótipo e o componente `Icon`.
8. **Componentes base** — `AppText`, `Card`, `Screen`.
9. **Componentes de ação** — `Button` e `IconButton`.
10. **Componentes de lista e feedback** — `Checkbox`, `ListRow`, `Progress`, `SectionHeader`, `Toast`.
11. **Domínio** — modelos e regras de tarefa, hábito e progresso do dia.
12. **Dados mock** — tarefas, hábitos e conteúdo fixo da Home.
13. **Estado global** — providers de tarefas, hábitos e toast.
14. **Layout raiz** — carregamento de fontes e composição dos providers.
15. **Navegação** — barra inferior com as cinco abas.
16. **Tela 1 — Início** — próxima ação, progresso do dia, prioridades, hábitos e insight.
17. **Tela 2 — Planejar** — linha do tempo do dia com blocos e alerta de replanejamento.
18. **Tela 3 — Datas importantes** — calendário do mês, filtros e próximos eventos.
19. **Tela 4 — Foco** — sessão de foco com cronômetro regressivo funcional.
20. **Tela 5 — Insights** — análise comportamental do tempo de tela.
21. **Tela 6 — Revisão semanal** — métricas da semana e recomendação do sistema.
22. **Tela 7 — Perfil** — sistema pessoal, controle de distração, conexões e app.
23. **Tela 8 — Onboarding** — seleção das áreas de foco.
24. **Limpeza** — remover o placeholder das abas não migradas.
25. **Documentação final** — README com as telas prontas e instruções de execução.

---

## Estrutura

```
apps/mobile      aplicativo Expo (expo-router)
prototype        protótipo HTML original + capturas de tela
```
