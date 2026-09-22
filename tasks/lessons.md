# Lições

Padrões que geraram correção do usuário, e a regra que evita repetir.

---

## Mock do protótipo não pode vazar para o produto

**O que aconteceu:** ao migrar o protótipo, os dados de exemplo viraram o estado
inicial do aplicativo. Quem abria pela primeira vez encontrava três tarefas,
quatro hábitos, cinco blocos e três compromissos que nunca criou — incluindo
"Estudar Spring Boot", que era conteúdo do protótipo, não do usuário.

**Por que passou despercebido:** durante a construção, ter dados na tela era
conveniente para conferir o layout. A conveniência de desenvolvimento virou
comportamento de produto sem ninguém decidir isso.

**Regra:** um aplicativo que guarda dados do usuário começa vazio. Dado de
exemplo serve para desenvolver, não para entregar. Se a tela precisa de conteúdo
para não parecer quebrada, o certo é um estado vazio que explica o que criar ali
— não um conteúdo falso.

**Como verificar:** instalar do zero (ou apagar os dados) e percorrer todas as
telas. Qualquer texto que a pessoa não escreveu é suspeito.

---

## Não inventar número que o app não consegue medir

**O que aconteceu:** as telas de Insights e Revisão semanal exibiam tempo de
tela, tentativas de app bloqueado e uso por hora. Nada disso era mensurável: o
Expo Go não dá acesso ao uso de outros aplicativos.

**Regra:** antes de exibir uma métrica, confirmar que existe fonte real para
ela. Sem fonte, a métrica sai da tela — não vira um valor plausível.

**Como verificar:** para cada número na interface, apontar a linha de código que
o calcula a partir de dado registrado.

---

## Force-push não apaga commit no GitHub

**O que aconteceu:** para tirar a co-autoria do Claude do repositório, o
histórico foi reescrito com `filter-branch` e enviado com `--force-with-lease`.
As APIs `/contributors` e `stats/contributors` passaram a mostrar só o dono —
mas o card Contributors da interface continuou mostrando dois.

**Causa:** force-push só move a referência do branch. Os commits antigos viram
objetos órfãos e seguem acessíveis por SHA no GitHub por tempo indeterminado.
O índice de contributors é montado a partir de todos os commits que o
repositório conhece, órfãos incluídos.

**Diagnóstico errado no caminho:** concluí "é cache do navegador" a partir de um
`curl` em `/contributors-list`, que na verdade devolve 404 — eu estava contando
ocorrências no HTML da própria página de erro. Duas idas e vindas desperdiçadas.

**Regras:**
- Reescrever histórico remove o vestígio do *branch*, não do *servidor*. Se o
  objetivo é apagar de verdade no GitHub, o caminho é apagar e recriar o
  repositório.
- Antes de usar a resposta de um endpoint como prova, conferir o status HTTP.
  Um 404 com corpo HTML passa por `grep` como se fosse dado válido.
- Melhor ainda: não gerar o vestígio. Definir a atribuição de commit antes do
  primeiro push, não depois.
