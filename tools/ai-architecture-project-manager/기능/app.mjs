import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AREAS,
  LESSON_TYPE_MAP,
  MAX_FILE_SIZE_BYTES,
  TYPES,
  assertProjectRoot,
  createDeliveryZip,
  getDeliveryPreview,
  getMissingItems,
  initializeWorkspace,
  readIndex,
  registerBuffer,
  resolveVerifiedPath,
} from './project-manager.mjs';

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const publicDirectory = path.resolve(moduleDirectory, '..', '화면');

const errorStatus = {
  DUPLICATE: 409,
  INVALID_INPUT: 400,
  INVALID_FILE: 400,
  INVALID_INDEX: 422,
  INVALID_PROJECT_ROOT: 400,
  FILE_TOO_LARGE: 413,
  UNSUPPORTED_FILE_TYPE: 415,
  FILE_CONFLICT: 409,
  FILE_CHANGED: 409,
  OUTSIDE_PROJECT_ROOT: 403,
  UNSAFE_PATH: 403,
};

const decodeBase64 = (value) => {
  if (typeof value !== 'string' || !value || value.length > Math.ceil(MAX_FILE_SIZE_BYTES * 4 / 3) + 8) {
    const error = new Error('파일 데이터가 없거나 허용 크기를 초과했습니다.');
    error.code = 'FILE_TOO_LARGE';
    throw error;
  }
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(value) || value.length % 4 !== 0) {
    const error = new Error('파일 데이터 형식이 올바르지 않습니다.');
    error.code = 'INVALID_FILE';
    throw error;
  }
  return Buffer.from(value, 'base64');
};

export function createApp({ projectRoot }) {
  const root = assertProjectRoot(projectRoot);
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '32mb' }));
  app.use(express.static(publicDirectory));

  app.get('/api/status', async (_request, response, next) => {
    try {
      await initializeWorkspace(root);
      const index = await readIndex(root);
      const deliveryPreview = await getDeliveryPreview(root, index);
      response.json({
        projectName: path.basename(root),
        areas: AREAS.map((area) => ({
          ...area,
          types: Object.entries(TYPES)
            .filter(([, definition]) => definition.area === area.key)
            .map(([key, definition]) => ({
              key,
              label: definition.label,
              lessons: Object.entries(LESSON_TYPE_MAP)
                .filter(([, types]) => types.includes(key))
                .map(([lesson]) => Number(lesson)),
            })),
        })),
        assets: index.assets,
        missing: getMissingItems(index),
        deliveryPreview,
        maxFileSizeBytes: MAX_FILE_SIZE_BYTES,
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/files', async (request, response, next) => {
    try {
      const { lesson, area, type, originalName, contentBase64, mediaType } = request.body ?? {};
      const asset = await registerBuffer(root, {
        lesson: Number(lesson),
        area,
        type,
        originalName,
        mediaType: String(mediaType ?? ''),
        buffer: decodeBase64(contentBase64),
      });
      response.status(201).json({ asset });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/delivery', async (_request, response, next) => {
    try {
      const preview = await getDeliveryPreview(root);
      const asset = await createDeliveryZip(root);
      const index = await readIndex(root);
      response.status(201).json({
        asset,
        missing: getMissingItems(index),
        includedFiles: preview.includedFiles,
        excludedFileCount: preview.excludedFileCount,
      });
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
      return response.download(await resolveVerifiedPath(root, relativePath));
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
