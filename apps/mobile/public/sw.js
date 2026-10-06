/**
 * Guarda o aplicativo no aparelho para ele abrir sem internet.
 *
 * São duas estratégias, porque os dois tipos de arquivo têm necessidades
 * opostas. As telas vêm da rede primeiro, para uma versão nova aparecer assim
 * que é publicada, e só caem no que está guardado quando não há conexão. Os
 * arquivos estáticos vêm do que está guardado primeiro, porque o nome deles
 * carrega um hash do conteúdo: mudou o arquivo, mudou o nome, então o que já
 * foi guardado nunca fica velho.
 */
const CACHE = 'stayon-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

async function guardar(requisicao, resposta) {
  if (!resposta || !resposta.ok) return resposta;
  const cache = await caches.open(CACHE);
  await cache.put(requisicao, resposta.clone());
  return resposta;
}

async function daRedePrimeiro(requisicao) {
  try {
    return await guardar(requisicao, await fetch(requisicao));
  } catch {
    return (await caches.match(requisicao)) ?? (await caches.match('/')) ?? Response.error();
  }
}

async function doCachePrimeiro(requisicao) {
  const guardado = await caches.match(requisicao);
  if (guardado) return guardado;
  try {
    return await guardar(requisicao, await fetch(requisicao));
  } catch {
    return Response.error();
  }
}

self.addEventListener('fetch', (evento) => {
  const { request } = evento;
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  evento.respondWith(
    request.mode === 'navigate' ? daRedePrimeiro(request) : doCachePrimeiro(request),
  );
});
