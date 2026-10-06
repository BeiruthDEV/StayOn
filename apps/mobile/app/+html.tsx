import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/** Fundo pintado fora do React, para não haver branco entre o HTML e a tela. */
const fundo = `
  html, body, #root { background-color: #050505; }
  body { overscroll-behavior: none; }
`;

/** O registro fica inline porque precisa rodar antes do pacote principal. */
const registro = `
  if ('serviceWorker' in navigator) {
    addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
  }
`;

/**
 * Casca HTML da versão web.
 *
 * O que está aqui existe para o aplicativo poder ser guardado na tela de início
 * do celular: o manifesto diz o nome, o ícone e que ele abre sem a barra do
 * navegador, e as marcações `apple-` são a parte que o Safari lê, porque o iOS
 * ignora o manifesto nesse ponto.
 */
export default function Html({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />

        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#050505" />
        <meta name="mobile-web-app-capable" content="yes" />

        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="StayOn" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: fundo }} />
        <script dangerouslySetInnerHTML={{ __html: registro }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
