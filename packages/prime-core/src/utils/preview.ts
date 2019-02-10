import express from 'express';
import { getRepository } from 'typeorm';
import { Document } from '../entities/Document';
import { Schema } from '../entities/Schema';
import { DocumentTransformer } from './DocumentTransformer';

export const previewRoutes = (app: express.Application) => {
  app.get('/prime/redirect', (req, res) => {
    const { id, url, accessToken, refreshToken } = req.query;
    if (id.length === 36) {
      const cookieConfig = {
        path: '/',
        maxAge: 86400000,
      };
      res.cookie('prime.accessToken', accessToken, cookieConfig);
      res.cookie('prime.refreshToken', refreshToken, cookieConfig);
      res.cookie('prime.preview', id.toLowerCase(), cookieConfig);
      res.redirect(303, url.toLowerCase() + '?prime.id=' + id.toLowerCase());
      return;
    }

    res.json({ success: false });
  });

  app.get('/prime/preview', async (req, res) => {
    const cookie = String(req.headers.cookie);
    const cookies = cookie.split(';').reduce((acc, item) => {
      const [key, value] = item
        .trim()
        .split('=')
        .map(decodeURIComponent);
      acc[key] = value;
      return acc;
    }, {});

    const transformer = new DocumentTransformer();
    const documentRepository = getRepository(Document);
    const schemaRepository = await getRepository(Schema);

    if (req.query.id) {
      try {
        const document = await documentRepository.findOneOrFail(req.query.id);
        const schema = await schemaRepository.findOneOrFail(document.schemaId);
        const data = await transformer.transformOutput(document, schema);
        res.json({
          success: true,
          document: { ...document, data },
          schema,
          accessToken: cookies['prime.accessToken'],
          refreshToken: cookies['prime.refreshToken'],
        });
        return;
      } catch (err) {
        // noop
      }
    }
    res.json({ success: false });
  });
};
