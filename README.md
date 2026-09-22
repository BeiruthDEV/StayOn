# StayOn

Aplicativo mobile de foco e produtividade em **React Native + Expo**, construído
a partir de um protótipo HTML de alta fidelidade.

Funciona **offline**, é **gratuito**, não pede conta nem cadastro e guarda tudo
no próprio aparelho. Não há servidor: nenhum dado sai do celular.

---

## Como rodar

Precisa de **Node 22** (ver `.nvmrc`) e do aplicativo **Expo Go** no celular
([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) ·
[iOS](https://apps.apple.com/app/expo-go/id982107779)).

```bash
git clone https://github.com/BeiruthDEV/StayOn.git
```

```bash
cd StayOn/apps/mobile && npm install && npm start
```

Um QR Code aparece no terminal:

- **Android** — abra o Expo Go e use *Scan QR code*
- **iOS** — aponte a câmera do sistema para o QR e toque na notificação

> O celular e o computador precisam estar na **mesma rede Wi-Fi**. Se a rede
> bloquear a conexão (comum em Wi-Fi de faculdade), rode `npm start --tunnel`,
> que passa por fora da rede local.

Para conferir o código sem abrir o app:

```bash
cd apps/mobile && npm run typecheck && npm run lint
```

---

## Roteiro de teste

Na primeira abertura o app cai na configuração inicial. O caminho abaixo passa
pelas oito telas e exercita o que cada uma faz:

1. **Configuração inicial** — escreva um nome, escolha duas ou três áreas e toque em *Continuar*.
2. **Início** — a saudação usa o nome e a hora reais. Toque em **+** e crie uma tarefa; **segure** a tarefa criada para editar ou remover; toque nela para concluir e use *Desfazer* no aviso.
3. **Planejar** — toque em **+**, crie um bloco (ex.: `14:00` às `15:00`). Tente salvar com hora inválida para ver a validação. Segure um bloco para editar, concluir ou remover. Blocos cujo horário já passou aparecem como perdidos, com a opção de replanejar.
4. **Datas importantes** (ícone de calendário no topo de Planejar) — escolha um dia no calendário, toque em *Novo compromisso* e crie um. A contagem regressiva ("em 3 dias") é calculada a partir de hoje.
5. **Foco** — o cronômetro roda de verdade. Pause (conta como interrupção), estenda em 5 minutos e toque em *Encerrar sessão*: a sessão entra no histórico e o bloco vira concluído.
6. **Insights** — os números vêm das sessões que você acabou de registrar: foco de hoje contra ontem, gráfico dos últimos sete dias e onde o tempo foi.
7. **Revisão semanal** (ícone de calendário no topo de Insights) — consolidado da semana e dois campos de reflexão que salvam sozinhos.
8. **Perfil** — edite o nome, mude a duração padrão da sessão e o nível de intervenção. *Apagar todos os dados* devolve o app ao estado inicial.

**Teste da persistência:** feche o aplicativo por completo e abra de novo. Tudo
o que você criou, marcou e escreveu continua lá.

---

## Telas

| # | Tela | Rota | O que faz |
|---|------|------|-----------|
| 1 | Início | `/` | Próxima ação, progresso do dia, tarefas com CRUD, hábitos e resumo de foco. |
| 2 | Planejar | `/planner` | Agenda do dia com criar, editar, concluir e remover blocos, marcador do horário atual e replanejamento. |
| 3 | Datas importantes | `/dates` | Calendário do mês, filtros por categoria e compromissos com criar e remover. |
| 4 | Foco | `/focus` | Cronômetro regressivo real com pausar, estender, encerrar e registro no histórico. |
| 5 | Insights | `/insights` | Foco de hoje contra ontem, últimos sete dias e tempo por área. |
| 6 | Revisão semanal | `/weekly-review` | Métricas da semana e reflexão salva por semana. |
| 7 | Perfil | `/profile` | Nome, duração da sessão, nível de intervenção e apagar dados. |
| 8 | Configuração inicial | `/onboarding` | Nome e áreas de foco, na primeira abertura. |
| + | Hábitos | `/habits` | Lista completa com criar, editar, pausar e remover. |

---

## O que é medido de verdade

Os números do app saem do que a pessoa faz nele: sessões de foco encerradas,
tarefas marcadas, hábitos cumpridos e blocos concluídos.

O protótipo original mostrava tempo de tela e tentativas de abrir aplicativos
bloqueados. **Isso foi removido**: não existe API pública no Expo Go para ler o
uso de outros aplicativos, então aqueles números só poderiam ser inventados. No
lugar entraram métricas que o app consegue apurar sozinho.

---

## Estrutura

```
apps/mobile
  app/            rotas do expo-router (abas + telas de pilha)
  src/components  componentes de interface reutilizáveis
  src/features    uma pasta por tela, com seus subcomponentes
  src/domain      tipos e regras puras, sem React
  src/data        dados de exemplo da primeira abertura
  src/state       contextos persistidos (tarefas, hábitos, blocos, eventos, sessões, preferências)
  src/storage     leitura e escrita em AsyncStorage
  src/theme       cores, tipografia, espaçamento, raios, sombras e movimento
  src/icons       traçados SVG e o componente Icon
prototype         protótipo HTML original e capturas de tela
tasks             plano de trabalho do projeto
```

A separação é proposital: `domain` guarda as regras testáveis sem React, `state`
cuida da persistência, e `features` monta as telas a partir de `components` e
`theme`. Nenhuma tela escreve cor, fonte ou espaçamento à mão.
