import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const TARGET_ADMIN_UUID = '70f6038d-7ffd-4a9f-945b-8ee450d0ba71';

app.use(express.json());

// API health endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'Liberty Homes API',
    brand: 'WHERE YOUR DREAM HOME BEGINS',
    timestamp: new Date().toISOString(),
    adminTargetConfigured: Boolean(TARGET_ADMIN_UUID),
    supabaseUrlConfigured: Boolean(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL),
  });
});

// Privileged server-side administrative verification & bootstrap status
app.get('/api/admin/bootstrap-status', (_req: Request, res: Response) => {
  const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const hasSupabaseUrl = Boolean(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL);

  res.json({
    targetAdminUuid: TARGET_ADMIN_UUID,
    isServiceRoleConfigured: hasServiceKey,
    isSupabaseUrlConfigured: hasSupabaseUrl,
    message: hasServiceKey
      ? 'Server has privileged service-role credentials available.'
      : 'Service role key not set in server env. Role assignment can be verified via database migration or SQL editor.',
  });
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Liberty Homes server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
