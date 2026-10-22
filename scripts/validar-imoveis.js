#!/usr/bin/env node
/*
 * Validação do imoveis.json da página do mapa do Google (radar-leiloes-mapa), antes de publicar.
 * Sem dependências: o mesmo arquivo roda no robô (scripts/exportar-mapa.js) e no workflow do
 * GitHub Pages (cópia em radar-leiloes-mapa/scripts/validar-imoveis.js).
 *
 * Regras:
 * - JSON com lista "imoveis", "total" igual ao tamanho da lista e pelo menos `minimo` imóveis;
 * - cada imóvel com id único e coordenadas numéricas dentro do Brasil, x = 1 (exato) ou 0 (cidade);
 * - comparado com a versão publicada (`anterior`), o total e os pontos exatos não podem cair mais
 *   que `tolerancia` (padrão 10%): queda grande indica coleta ou leitura incompleta.
 *
 * Uso: node validar-imoveis.js imoveis.json [--anterior publicado.json] [--minimo 100] [--tolerancia 0.1]
 * Sai com código 0 quando válido e 3 quando não, com um JSON { valido, total, exatos, erros } na saída.
 */
'use strict';

var BRASIL = { latMin: -34.0, latMax: 5.5, lngMin: -74.2, lngMax: -28.5 };

function dentroDoBrasil(la, lo) {
  return typeof la === 'number' && typeof lo === 'number' && isFinite(la) && isFinite(lo) &&
    la >= BRASIL.latMin && la <= BRASIL.latMax && lo >= BRASIL.lngMin && lo <= BRASIL.lngMax;
}

function contar(dados) {
  var lista = (dados && Array.isArray(dados.imoveis)) ? dados.imoveis : [];
  return { total: lista.length, exatos: lista.filter(function (x) { return x && x.x === 1; }).length };
}

function validar(dados, anterior, opcoes) {
  opcoes = opcoes || {};
  var minimo = opcoes.minimo == null ? 100 : opcoes.minimo;
  var tolerancia = opcoes.tolerancia == null ? 0.1 : opcoes.tolerancia;
  var erros = [];
  if (!dados || !Array.isArray(dados.imoveis)) return { valido: false, total: 0, exatos: 0, erros: ['Arquivo sem a lista "imoveis".'] };
  var lista = dados.imoveis, ids = {}, ruins = 0, repetidos = 0;
  if (dados.total !== lista.length) erros.push('Campo total (' + dados.total + ') diferente da lista (' + lista.length + ').');
  if (lista.length < minimo) erros.push('Só ' + lista.length + ' imóveis (mínimo ' + minimo + ').');
  lista.forEach(function (x) {
    if (!x || typeof x.id !== 'string' || !x.id) { ruins++; return; }
    if (ids[x.id]) repetidos++;
    ids[x.id] = true;
    if (!dentroDoBrasil(x.la, x.lo) || (x.x !== 0 && x.x !== 1)) ruins++;
  });
  if (ruins) erros.push(ruins + ' imóvel(is) sem id ou com coordenada fora do Brasil/inválida.');
  if (repetidos) erros.push(repetidos + ' id(s) repetido(s).');
  var agora = contar(dados);
  if (anterior && Array.isArray(anterior.imoveis) && anterior.imoveis.length) {
    var antes = contar(anterior);
    if (agora.total < antes.total * (1 - tolerancia)) {
      erros.push('Total caiu de ' + antes.total + ' para ' + agora.total + ' (mais de ' + Math.round(tolerancia * 100) + '%).');
    }
    if (agora.exatos < antes.exatos * (1 - tolerancia)) {
      erros.push('Pontos exatos caíram de ' + antes.exatos + ' para ' + agora.exatos + ' (mais de ' + Math.round(tolerancia * 100) + '%).');
    }
  }
  return { valido: erros.length === 0, total: agora.total, exatos: agora.exatos, erros: erros };
}

function main() {
  var fs = require('fs');
  var argv = process.argv.slice(2), arq = null, op = {};
  for (var i = 0; i < argv.length; i++) {
    if (argv[i].indexOf('--') === 0) op[argv[i].slice(2)] = argv[++i];
    else arq = argv[i];
  }
  var ler = function (f) { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return null; } };
  var dados = arq ? ler(arq) : null;
  var r = dados ? validar(dados, op.anterior ? ler(op.anterior) : null, {
    minimo: op.minimo != null ? Number(op.minimo) : undefined,
    tolerancia: op.tolerancia != null ? Number(op.tolerancia) : undefined
  }) : { valido: false, total: 0, exatos: 0, erros: ['Não consegui ler ' + (arq || '(nenhum arquivo)') + ' como JSON.'] };
  console.log(JSON.stringify(r));
  if (!r.valido) process.exit(3);
}

if (typeof module !== 'undefined' && require.main === module) main();
else module.exports = { validar: validar, dentroDoBrasil: dentroDoBrasil, contar: contar, BRASIL: BRASIL };
