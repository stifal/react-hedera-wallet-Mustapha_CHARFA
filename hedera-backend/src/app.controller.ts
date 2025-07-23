// src/app.controller.ts
import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AppController {
  @Get()
  async home(@Res() res: Response) {
    res.type('html').send(`
      <html>
        <head>
          <title>🚀 Hedera API</title>
          <style>
            body { font-family: Arial, sans-serif; background: #f4f6f8; padding: 2em; }
            h1 { color: #2c3e50; }
            ul { list-style-type: none; padding: 0; }
            li { margin-bottom: 10px; }
            a { color: #007bff; text-decoration: none; font-weight: bold; }
            a:hover { text-decoration: underline; }
            .container { max-width: 700px; margin: auto; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🌿 Bienvenue sur l'API Hedera</h1>
            <p>Explorez les ressources disponibles :</p>
            <ul>
              <li><a href="/api">📘 Documentation Swagger</a></li>
              <li><a href="/account/create">➕ Créer un compte Hedera</a></li>
              <li><a href="/account/info">ℹ️ Infos d’un compte Hedera</a></li>
              <li><a href="/account/transfer">💸 Transférer des HBAR</a></li>
              <li><a href="/token/create">🪙 Créer un Token</a></li>
            </ul>
          </div>
        </body>
      </html>
    `);
  }
}
