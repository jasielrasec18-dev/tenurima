# Tenurima — Desafio Técnico Front-End Júnior (XMX Corp)

Implementação da página do Figma em HTML semântico, CSS e JavaScript
vanilla, sem frameworks ou bibliotecas de UI.

- **Etapa 1 — Diagnóstico:** [`DIAGNOSTICO.md`](./DIAGNOSTICO.md)
- **Etapa 2 — Implementação:** este repositório
- **Etapa 3 — Vídeo:** _(link a preencher)_
- **Publicado em:** _(link a preencher)_

---

## Como rodar

Não há build, dependências ou etapa de compilação. Basta servir a pasta.

```bash
git clone https://github.com/jasielrasec18-dev/tenurima.git
cd tenurima
```

Abrir `index.html` direto no navegador funciona. Para um ambiente mais
próximo do real (caminhos relativos, cache, `loading="lazy"`):

```bash
python3 -m http.server 5500
# http://localhost:5500
```

Ou, com a extensão Live Server do VS Code: botão direito em
`index.html` → *Open with Live Server*.

---

## Estrutura

```
.
├── index.html
├── css
│   ├── reset.css        normalização entre navegadores
│   ├── variables.css    design tokens (cores, tipografia, espaços)
│   ├── base.css         elementos base e o .container
│   ├── components.css   peças reutilizadas: botões, logo, rating, marquee
│   ├── sections.css     layout de cada seção (medidas do Figma desktop)
│   └── responsive.css   todos os breakpoints, em um lugar só
├── js
│   └── main.js          accordion do FAQ + slider de depoimentos
└── assets
    ├── img/  icons/     imagens e ícones exportados do Figma
    └── referencias-figma/  prints usados na comparação lado a lado
```

Os arquivos são carregados nessa ordem no `<head>`, e a ordem importa:
`responsive.css` vem por último para que as media queries sobrescrevam o
layout desktop sem precisar de `!important`.

### Convenções de CSS

- Nomenclatura em **BEM**: `.pricing-card__header`,
  `.pricing-card--popular`. Bloco descreve o componente, elemento vem
  depois de `__`, variação depois de `--`.
- Cores, espaçamentos, raios e sombras vêm de **custom properties**
  declaradas em `variables.css`. Valores em px aparecem direto na regra
  só quando são medidas específicas de uma seção tiradas do Figma.
- Um único valor pode ser lido pelos dois lados: `--testimonials-per-view`
  é definida no CSS e lida pelo JS do slider, para que o breakpoint do
  carrossel exista em um lugar só.

---

## Responsividade

Testado em 360, 414, 768, 1024, 1440 e 1920, e redimensionando ao vivo.
Sem scroll horizontal em nenhuma dessas larguras.

| Breakpoint | O que muda |
|---|---|
| `≤ 1280px` | Folga lateral nas seções mais largas; setas do slider entram para dentro do card |
| `≤ 1080px` | Ingredientes em 2 colunas; cards de preço deixam de ter largura fixa |
| `≤ 900px` | Hero, "about" e benefícios empilham; 1 depoimento por vez; menu do header some (ver decisões) |
| `≤ 768px` | Tudo em uma coluna; ordem dos planos muda; rodapé quebra em linhas |
| `≤ 560px` | Card de depoimento com a foto em cima do texto |
| `≤ 380px` | Ajuste fino de tipografia e imagens para 360px |

O ponto mais delicado foi o hero. No desktop ele é um grid de duas
colunas fixas (390px + 500px) com garrafas, cápsulas e a caixa de
benefícios em `position: absolute`, posicionadas em px — que é o que
reproduz o Figma com fidelidade, mas não sobrevive a nenhuma largura
menor. No mobile esses elementos voltam para o fluxo normal
(`position: static`) em vez de serem reescalados. O mesmo vale para a
seção "about", que no desktop tem altura fixa de 430px e no mobile passa
a ter altura determinada pelo conteúdo.

---

## Decisões tomadas onde o Figma era omisso

**Header no mobile.** O Figma mobile mostra apenas logo + botão
"Contact Us", sem menu e sem hambúrguer. Segui o Figma: o `<nav>`
continua no HTML (para leitores de tela e para quem navega por teclado
em telas largas) e é escondido abaixo de 900px. Os mesmos destinos estão
disponíveis no rodapé, então nada fica inalcançável. Se a intenção era
ter menu no mobile, é uma troca de uma regra de CSS mais um toggle.

**Estados de hover.** O Figma não especifica hover. Adotei um padrão
consistente na página inteira: botão primário clareia levemente e sobe
1px; links de navegação e rodapé mudam opacidade; cards de ingrediente
sobem levemente. Todos com transição curta (150–250ms).

**Foco visível.** Não estava no Figma, mas é requisito de acessibilidade
do desafio. Usei um contorno sólido de 3px na cor secundária, com
`outline-offset`, aplicado via `:focus-visible` — aparece para quem
navega por teclado e não polui o clique do mouse.

**Ordem dos planos no mobile.** No Figma mobile a ordem visual é
MOST POPULAR → BUNDLE → BASIC, diferente do desktop. Resolvi com
`order` no CSS e mantive a ordem do DOM em BASIC → POPULAR → BUNDLE, que
é a ordem lógica de leitura. Isso mantém a fidelidade visual sem
bagunçar a navegação por teclado.

**`backdrop-filter` nos itens de benefício.** A versão inicial usava
`backdrop-filter: blur(16px)` nos pills da seção "Why Thousands Choose".
Entre 768px e 1080px o Chrome perdia o conteúdo desses elementos: o pill
aparecia como um retângulo chapado, sem ícone, sem texto, sem borda e sem
`border-radius`. É uma falha de composição quando o backdrop inclui as
imagens de fundo da seção, que usam `mask-image` e `filter`. Troquei o
blur por um fundo um pouco mais opaco — visualmente quase idêntico, e sem
depender de uma propriedade que o navegador pode não conseguir compor.

**Marquee.** O Figma mostra a faixa estática, mas o componente
claramente sugere movimento. Implementei a animação em CSS puro
(`@keyframes` + `translateX(-50%)` sobre duas cópias idênticas do texto,
para o loop não ter salto). Pausa no hover e respeita
`prefers-reduced-motion`.

**Slider de depoimentos.** No Figma mobile as setas ficam sobrepostas às
laterais do card. Em 360px isso cobre parte da foto e do texto, então
abaixo de 900px movi as setas para baixo do card. É a única divergência
consciente que tenho em relação ao Figma, e foi por legibilidade.

O Figma mostra as setas mas não define quantos cards existem nem o
comportamento. Havia 4 fotos de depoimento
exportadas no Figma e só 2 cards montados — usei as 4. O slider mostra 2
por vez no desktop e 1 no mobile, as setas desabilitam nas pontas (em
vez de dar loop infinito, que esconde do usuário onde ele está), e há
suporte a arrastar com o dedo e às setas do teclado.

**Textos de FAQ e depoimentos.** O Figma usa placeholders como
`[produto]` e `[benefício 1]`. Escrevi textos coerentes com o restante da
página, mantendo o mesmo volume de texto para não alterar a altura dos
componentes.

**Links de checkout.** Os CTAs de compra apontam para `#`. Não existe URL
de checkout no material do desafio, e inventar uma seria pior do que
deixar explícito — está anotado aqui como pendência.

---

## Acessibilidade

- Estrutura semântica: `header`, `nav`, `main`, `section`, `article`,
  `footer`. Um único `h1`, na hero.
- Todas as imagens têm `alt`. As decorativas (brilhos, cápsulas, veias de
  fundo) usam `alt=""` + `aria-hidden="true"`, para não poluir o leitor de
  tela com ruído.
- Accordion do FAQ construído com `<button>` real, `aria-expanded`,
  `aria-controls` e `role="region"` no painel. Funciona por teclado sem
  nenhum código extra, porque usa o elemento certo.
- Slider: cards fora da área visível saem da ordem de tabulação
  (`tabindex="-1"`), para o Tab não "sumir" dentro de conteúdo invisível.
- Foco visível em todos os elementos interativos.
- `prefers-reduced-motion` desliga marquee, transições e o scroll suave.

---

## Performance

- 37 das 48 imagens usam `loading="lazy"`. As da primeira dobra ficam
  com carregamento imediato de propósito — `lazy` na hero atrasaria o
  maior elemento visível da página.
- Todas com `decoding="async"`.
- Zero dependências de runtime. O único recurso externo é a fonte
  Montserrat, via Google Fonts com `preconnect` e `display=swap`.

---

## O que eu faria diferente com mais tempo

1. **Converter as imagens para WebP/AVIF.** Os PNGs exportados do Figma
   somam alguns megabytes — `benefits-couple.png` sozinho tem cerca de
   1MB. Serviria as versões modernas via `<picture>` com fallback PNG.
   É de longe o maior ganho de performance disponível aqui, e não
   consegui encaixar no prazo.
2. **Servir tamanhos diferentes por tela** com `srcset`/`sizes`. Hoje o
   celular baixa a mesma imagem de 1400px que o desktop.
3. **Revisitar o hero em px.** O hero reproduz o Figma com posições
   absolutas em pixels. Funciona, mas é frágil: qualquer ajuste de
   design exige remexer em vários offsets. Com mais tempo eu reescreveria
   com grid e unidades relativas, mantendo o mesmo resultado visual.
4. **Sprite SVG para os ícones.** Hoje são arquivos separados
   (`b1.svg`, `b3.svg`…) com nomes que não dizem o que representam.
5. **Animações de entrada no scroll** com `IntersectionObserver`, que é
   o tipo de polimento esperado em página de funil.
6. **Checar contraste com ferramenta**, não no olho. Alguns textos em
   cinza claro sobre fundo claro provavelmente ficam abaixo de AA.
7. **Revisar as outras larguras fixas em px.** `.ingredient-card` tinha
   `height: 190px` fixo e o texto vazava para fora do cartão sempre que
   quebrava em mais linhas. Troquei por `min-height`, mas há outras
   medidas fixas no `sections.css` com o mesmo risco latente.
8. **Testar em Safari iOS de verdade.** Testei em Chrome e no DevTools;
   `backdrop-filter` e `mix-blend-mode` (ainda usados na caixa de
   benefícios da hero e na foto do "about") são justamente onde o Safari
   costuma divergir — e já deram problema no Chrome nesta página.

   