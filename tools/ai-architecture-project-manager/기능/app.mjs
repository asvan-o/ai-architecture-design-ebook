import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AREAS,
  TYPES,
  createDeliveryZip,
  getMissingItems,
  initializeWorkspace,
  readIndex,
  registerBuffer,
  safeResolve,
} from './project-manager.mjs';

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const publicDirectory = path.resolve(moduleDirectory, '..', '화면');

const errorStatus = {
  DUPLICATE: 409,
  INVALID_INPUT: 400,
  OUTSIDE_PROJECT_ROOT: 403,
};

export function createApp({ projectRoot }) {
  const root = path.resolve(projectRoot);
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '32mb' }));
  app.use(express.static(publicDirectory));

  app.get('/api/status', async (_request, response, next) => {
    try {
      await initializeWorkspace(root);
      const index = await readIndex(root);
      response.json({
        projectName: path.basename(root),
        areas: AREAS.map((area) => ({
          ...area,
          types: Object.entries(TYPES)
            .filter(([, definition]) => definition.area === area.key)
            .map(([key, definition]) => ({ key, label: definition.label })),
        })),
        assets: index.assets,
        missing: getMissingItems(index),
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/files', async (request, response, next) => {
    try {
      const { lesson, area, type, originalName, contentBase64 } = request.body ?? {};
      const asset = await registerBuffer(root, {
        lesson: Number(lesson),
        area,
        type,
        originalName,
        buffer: Buffer.from(String(contentBase64 ?? ''), 'base64'),
      });
      response.status(201).json({ asset });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/delivery', async (_request, response, next) => {
    try {
      const asset = await createDeliveryZip(root);
      const index = await readIndex(root);
      response.status(201).json({ asset, missing: getMissingItems(index) });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/download', async (request, response, next) => {
    try {
      const relativePath = String(request.query.path ?? '');
      const index = await readIndex(root);
      if (!index.assets.some((asset) => asset.relativePath === relativePath)) {
        return response.status(404).json({ error: '등록된 파일을 찾을 수 없습니다.' });
      }
      return response.download(safeResolve(root, relativePath));
    } catch (error) {
      return next(error);
    }
  });

  app.use((error, _request, response, _next) => {
    response.status(errorStatus[error.code] ?? 500).json({
      error: error.message || '처리 중 오류가 발생했습니다.',
      code: error.code ?? 'INTERNAL_ERROR',
      duplicate: error.duplicate,
      missing: error.missing,
    });
  });

  return app;
}
