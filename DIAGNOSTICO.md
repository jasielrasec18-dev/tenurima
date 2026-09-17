# Relatório de Diagnóstico — Alpha Rock

## Objetivo

Este documento apresenta os problemas identificados durante a análise
funcional e responsiva da página Alpha Rock.

Os testes foram realizados utilizando diferentes larguras de viewport,
Chrome DevTools, inspeção do DOM/CSS, console JavaScript e validação
manual dos principais fluxos de interação.

Para cada problema foram documentados:

- comportamento observado;
- localização;
- provável causa técnica;
- proposta de correção;
- severidade.

## Erro 1 — Overflow horizontal em telas mobile

### O que está errado

Em telas pequenas, alguns conteúdos ultrapassam horizontalmente os limites
visíveis da página. O problema pode ser observado principalmente na seção
de garantia, onde texto e outros elementos não permanecem corretamente
contidos dentro da viewport.

O problema foi reproduzido em uma viewport de 400px.

### Onde está

Na seção `.guarantee`, que utiliza um elemento `.container`.

Ao inspecionar a página pelo Chrome DevTools, foi possível observar que,
em uma viewport de 400px, o container chega a aproximadamente 437px de
largura e apresenta deslocamento horizontal negativo.

Também foi identificada uma regra aplicada em telas abaixo de 900px que
define:

    .area-kits .container {
        width: 110%;
        max-width: 1000px;
    }

Existem ainda diferentes regras de largura e `max-width` aplicadas aos
containers da página em breakpoints semelhantes.

### Por que acontece

A responsividade utiliza regras conflitantes de dimensionamento dos
containers. Em determinados breakpoints, elementos podem receber largura
superior ao espaço disponível, como `width: 110%`.

Como consequência, o container pode se tornar maior que a viewport e seus
elementos internos deixam de respeitar os limites horizontais da página.

### Como eu corrigiria

Revisaria os breakpoints e padronizaria o comportamento dos containers,
evitando larguras superiores a 100% em telas pequenas.

Utilizaria uma estrutura fluida, por exemplo:

    width: 100%;
    max-width: 600px;
    margin-inline: auto;
    padding-inline: 16px;

O valor exato de `max-width` e espaçamento dependeria do layout desejado.

Também revisaria as regras específicas de `.area-kits .container` para
evitar que sobrescrevam o comportamento responsivo geral de `.container`.

### Gravidade

**Crítico.**

O problema afeta diretamente usuários mobile e pode provocar texto
cortado, elementos fora da área visível e scroll horizontal. O impacto é
ainda maior por ocorrer em áreas relacionadas à oferta e conversão.

## Erro 2 — Erro de JavaScript ao processar links da seção de compra

### O que está errado

Ao carregar a página, o console do navegador apresenta o seguinte erro:

`Uncaught TypeError: Cannot read properties of null (reading 'split')`

O erro interrompe a execução do callback responsável por adicionar os
parâmetros atuais da URL aos links da seção de compra.

### Onde está

O problema ocorre no arquivo `assets/js/main.js`, dentro da função
`combineParams()`.

A função executa:

    originalHref.split("?")

O valor `originalHref` é obtido anteriormente através de:

    let originalHref = button.getAttribute("href");

Os elementos são selecionados utilizando:

    document.querySelectorAll(".area-kits a");

### Por que acontece

O código assume que todos os elementos `<a>` encontrados dentro de
`.area-kits` possuem um atributo `href`.

Entretanto, pelo menos um dos elementos processados não possui esse
atributo. Nesse caso:

    button.getAttribute("href")

retorna `null`.

Esse valor é enviado para `combineParams()` e o código tenta executar
`.split("?")` sobre `null`, causando um `TypeError`.

### Como eu corrigiria

Primeiro restringiria o seletor apenas aos links que realmente possuem
`href`:

    document.querySelectorAll(".area-kits a[href]");

Também adicionaria uma validação defensiva antes de processar o valor:

    buttons.forEach(function (button) {
      const originalHref = button.getAttribute("href");

      if (!originalHref) return;

      button.setAttribute(
        "href",
        combineParams(originalHref, currentParams)
      );
    });

Dessa forma, a função `combineParams()` nunca recebe um valor `null`.

Dependendo da estrutura da página, uma solução ainda melhor seria selecionar
especificamente os links de checkout, em vez de todos os elementos `<a>`
existentes dentro da seção.

### Gravidade

**Crítico.**

É um erro JavaScript não tratado em uma rotina relacionada aos links de
checkout. Além de gerar erro no console, a exceção interrompe o processamento
do `forEach`, fazendo com que links posteriores ao elemento problemático
possam deixar de receber os parâmetros esperados da URL.

Como a lógica está relacionada à área de compra, o problema pode afetar o
fluxo de conversão.

## Erro 3 — Texto com contraste insuficiente na seção "Why Alpha Rock"

### O que está errado

Os dois parágrafos da seção "Why Alpha Rock" ficam praticamente
ilegíveis. O texto está presente no DOM, porém apresenta contraste
muito baixo em relação ao fundo escuro da seção.

### Onde está

Na seção `.sobre`, dentro de:

    .sobre .container .content p

Ao inspecionar o elemento no Chrome DevTools, foi identificada a regra:

    .sobre .container .content p {
        color: #272418;
    }

Existe também uma regra global para parágrafos utilizando `color: #fff`,
porém ela é sobrescrita pela regra mais específica da seção.

### Por que acontece

A cor `#272418` aplicada especificamente aos parágrafos é muito escura
para o background utilizado nessa seção.

Devido à maior especificidade do seletor
`.sobre .container .content p`, essa declaração prevalece sobre a regra
global que utiliza texto branco.

O resultado é um contraste insuficiente entre texto e fundo.

### Como eu corrigiria

Alteraria a cor dos parágrafos para uma tonalidade clara que mantenha
contraste adequado com o fundo, respeitando a identidade visual da página.

Também validaria a combinação de cores utilizando uma ferramenta de
contraste para garantir legibilidade adequada.

### Gravidade

**Médio.**

O problema não impede a navegação da página, mas torna praticamente
inacessível uma parte importante do conteúdo que explica os benefícios
e características do produto.

## Erro 4 — FAQ não responde aos cliques

### O que está errado

A seção "Frequently Asked Questions" apresenta visualmente um componente
de accordion, com perguntas, indicadores de expansão e cursor de interação.

Entretanto, ao clicar nas perguntas, nenhuma resposta é exibida e o estado
visual dos itens não é alterado.

### Onde está

Na seção `#faq`, especificamente nos elementos:

    .accordion .item .header

Ao inspecionar `assets/js/main.js`, foi encontrado o código responsável
pela interação do accordion, porém todo o bloco está comentado.

O código deveria registrar eventos de `click` nos headers e adicionar ou
remover a classe `active` dos itens.

### Por que acontece

O JavaScript responsável pela interação do accordion está comentado e,
portanto, não é executado pelo navegador.

Consequentemente, nenhum listener de `click` é registrado nos elementos
`.accordion .item .header`, impossibilitando a alteração do estado dos
itens.

### Como eu corrigiria

Reativaria a implementação do accordion e revisaria seu funcionamento antes
de disponibilizá-la em produção.

Também implementaria acessibilidade para que o componente pudesse ser
operado por teclado, preferencialmente utilizando elementos `<button>` para
os controles e atributos como `aria-expanded` e `aria-controls`.

### Gravidade

**Médio.**

A falha não impede completamente a navegação ou o acesso à área de compra,
mas impede o usuário de acessar informações importantes do FAQ, como
entrega, política de reembolso e segurança da compra.

Em uma página de vendas, essas informações podem ser relevantes para reduzir
dúvidas antes da conversão.

## Erro 5 — Botão "BUY NOW" do pacote mais popular não funciona

### O que está errado

Na seção "Order Your Alpha Rock", o pacote destacado como "MOST POPULAR",
de 6 garrafas, possui um botão visual "BUY NOW".

Ao clicar no botão, nenhuma navegação ou ação de compra acontece.

### Onde está

No primeiro card da seção `.area-kits`, correspondente ao pacote
"6 BOTTLES / MOST POPULAR".

Ao inspecionar o HTML, foi identificado que o card está envolvido por um
elemento `<a>`, porém esse elemento não possui atributo `href`.

O botão visual "BUY NOW" também está implementado como um `<button>` dentro
desse elemento, sem uma ação própria de navegação.

### Por que acontece

O elemento responsável pela navegação do card não possui URL de destino.

Consequentemente, apesar de a interface indicar claramente uma ação de
compra, não existe um destino associado ao pacote.

### Como eu corrigiria

Associaria ao CTA a URL correta do checkout correspondente especificamente
ao pacote de 6 garrafas.

Também simplificaria a estrutura do componente, evitando um `<button>`
dentro de um `<a>`. Utilizaria um único elemento interativo apropriado para
a ação.

Caso a ação seja navegação para checkout, por exemplo:

    <a href="[URL_DO_CHECKOUT]" class="button">
        BUY NOW
    </a>

A URL real deveria ser fornecida/confirmada pelo responsável pelo checkout,
e não inferida.

### Gravidade

**Crítico.**

O erro ocorre no pacote destacado como "MOST POPULAR" e impede que o usuário
prossiga para a compra através do principal CTA desse produto.

Em uma página de vendas, isso afeta diretamente o fluxo de conversão.

## Erro 6 — Links de compra direcionam para páginas inexistentes

### O que está errado

Os botões "BUY NOW" de outros pacotes da seção de compra realizam uma
navegação, porém direcionam o usuário para páginas que retornam HTTP 404
(Not Found).

O problema foi reproduzido ao testar os pacotes disponíveis na seção
"Order Your Alpha Rock".

### Onde está

Nos links associados aos cards de compra da seção `.area-kits`.

Durante o teste de um dos CTAs, por exemplo, o navegador foi direcionado
para:

    /linkoffer3

O servidor respondeu com:

    404 Not Found

O DevTools também registrou a requisição GET com status 404.

### Por que acontece

Os CTAs estão associados a rotas/URLs que não existem atualmente no
servidor ou não estão configuradas corretamente.

Diferentemente do pacote "MOST POPULAR", no qual não existe `href`, nesses
cards existe um destino, porém o recurso solicitado não é encontrado pelo
servidor.

### Como eu corrigiria

Confirmaria com o responsável pelo projeto quais são as URLs oficiais de
checkout de cada pacote.

Depois substituiria os links inválidos pelas URLs corretas e testaria
individualmente todos os CTAs.

Também incluiria uma verificação dos links antes da publicação para evitar
que rotas inexistentes fossem disponibilizadas em produção.

### Gravidade

**Crítico.**

O usuário demonstra intenção explícita de compra ao clicar em "BUY NOW",
mas é enviado para uma página de erro 404.

Isso interrompe diretamente o fluxo de conversão e pode impedir a
finalização da compra.

## Erro 7 — Imagem principal do produto é sobreposta pela seção seguinte em telas abaixo de 420px

### O que está errado

Em dispositivos com largura de tela menor ou igual a 420px, a imagem
principal do produto na primeira seção deixa de ocupar corretamente seu
espaço no layout.

Como consequência, a seção seguinte, com fundo dourado e informações como
"Secure & Discreet Payment" e "60-DAY Guarantee", sobe e ocupa a região
onde parte da imagem deveria ser exibida.

O problema foi reproduzido em uma viewport de 393px.

Em larguras maiores, como 430px e 480px, a imagem permanece corretamente
posicionada antes da seção seguinte.

### Onde está

Na imagem:

    main .container .area-img .main_product

A regra padrão encontrada no CSS é:

```css
main .container .area-img .main_product {
  margin: 0 auto;
  position: relative;
  z-index: 5;
}

## Resumo dos resultados

| # | Problema | Categoria | Severidade |
|---|---|---|---|
| 1 | Overflow horizontal em telas mobile | Responsividade | Média |
| 2 | TypeError ao processar links da compra | JavaScript | Alta |
| 3 | Texto com contraste insuficiente | UI/Acessibilidade | Média |
| 4 | FAQ não responde aos cliques | Funcionalidade | Média |
| 5 | BUY NOW do MOST POPULAR não funciona | Conversão | Alta |
| 6 | Links de compra retornam 404 | Conversão | Alta |
| 7 | Imagem principal sobreposta em ≤420px | Responsividade | Média |

## Conclusão

A análise identificou sete problemas envolvendo responsividade,
JavaScript, acessibilidade e fluxo de compra.

Os problemas de maior impacto estão concentrados na área de conversão:
um dos principais CTAs não possui destino, outros links de compra
direcionam para páginas inexistentes e a rotina JavaScript responsável
pelo processamento desses links lança uma exceção durante a execução.

Também foram identificados problemas específicos de responsividade,
incluindo overflow horizontal e uma regressão abaixo do breakpoint de
420px, além de problemas de legibilidade e interação no FAQ.

As correções propostas priorizam preservar o comportamento existente
da página, corrigindo as causas identificadas sem alterar
desnecessariamente sua estrutura visual.