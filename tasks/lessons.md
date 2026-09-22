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
