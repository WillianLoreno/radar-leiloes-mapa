# Radar Leilões · Mapa

Mapa dos imóveis em leilão do app Radar Leilões no Google Maps: marcadores coloridos pelo score de
oportunidade, agrupamento, filtros (tipo, estado, fonte, score mínimo, aceita financiamento) e, em cada
imóvel, lance, valor de mercado, desconto, data do leilão e links para Google Maps, Street View e edital.

Endereço: https://willianloreno.github.io/radar-leiloes-mapa/

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | a página do mapa (HTML, CSS e JS, sem etapa de build) |
| `imoveis.json` | os imóveis: dados públicos dos anúncios e a análise padrão do app, atualizados pelo robô do app |
| `.github/workflows/pages.yml` | publica no GitHub Pages e gera o `config.js` com a chave do Google Maps |
| `config.example.js` | modelo do `config.js` para testar localmente |
| `.nojekyll` | serve os arquivos como estão, sem processar com Jekyll |

O `config.js` não fica no repositório: é gerado na publicação a partir do segredo
`GOOGLE_MAPS_BROWSER_KEY` (Settings → Secrets and variables → Actions). Use uma chave de navegador do
Google Maps restrita a `https://willianloreno.github.io/*` e à Maps JavaScript API. Essa chave aparece no
código da página quando ela abre no navegador (é assim que o Google Maps funciona); a restrição por
endereço é o que impede o uso em outros sites.

Anotações e edições feitas no app não são publicadas aqui.
