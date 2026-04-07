import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const projectRoot = process.cwd();
const distDir = path.join(projectRoot, 'dist');
const outputPdf =
  process.argv[2] ??
  path.join(projectRoot, 'exports', 'extrato-simulado-revolut.pdf');

await runCommand('npm', ['run', 'build']);

const server = await startStaticServer(distDir);
const browser = await chromium.launch();

try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
  });

  await page.goto(`${server.origin}/`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-statement-ready="true"]');

  const validationState = await page.locator('[data-validation-status]').first().getAttribute('data-validation-status');
  if (validationState !== 'ok') {
    throw new Error('The statement data failed validation in the rendered app.');
  }

  await mkdir(path.dirname(outputPdf), { recursive: true });
  await page.emulateMedia({ media: 'print' });
  await page.pdf({
    path: outputPdf,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    preferCSSPageSize: true,
  });

  console.log('PDF compiled successfully.');
  console.log(`Output: ${outputPdf}`);
} finally {
  await browser.close();
  await server.close();
}

async function runCommand(command, args) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      shell: true,
      stdio: 'inherit',
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(' ')} exited with code ${code ?? 'unknown'}`));
    });

    child.on('error', reject);
  });
}

async function startStaticServer(rootDir) {
  const server = createServer(async (request, response) => {
    try {
      const requestPath = sanitizePath(request.url ?? '/');
      const resolvedPath = path.join(rootDir, requestPath);
      const existingPath = await resolveExistingPath(resolvedPath);
      const fileBuffer = await readFile(existingPath);
      const mimeType = getMimeType(existingPath);

      response.writeHead(200, { 'Content-Type': mimeType });
      response.end(fileBuffer);
    } catch {
      response.writeHead(404);
      response.end('Not found');
    }
  });

  await new Promise((resolve, reject) => {
    server.listen(0, '127.0.0.1', () => resolve(undefined));
    server.on('error', reject);
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Unable to determine the local server address.');
  }

  return {
    origin: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(undefined);
        });
      }),
  };
}

async function resolveExistingPath(resolvedPath) {
  try {
    const entry = await stat(resolvedPath);
    if (entry.isDirectory()) {
      return path.join(resolvedPath, 'index.html');
    }

    return resolvedPath;
  } catch {
    return path.join(distDir, 'index.html');
  }
}

function sanitizePath(rawUrl) {
  const pathname = new URL(rawUrl, 'http://127.0.0.1').pathname;
  const safePath = path.normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, '');
  const normalizedPath = safePath.replace(/^[/\\]+/, '');
  return normalizedPath === '' || normalizedPath === '.' ? 'index.html' : normalizedPath;
}

function getMimeType(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case '.html':
      return 'text/html; charset=utf-8';
    case '.js':
      return 'text/javascript; charset=utf-8';
    case '.css':
      return 'text/css; charset=utf-8';
    case '.svg':
      return 'image/svg+xml';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.webp':
      return 'image/webp';
    case '.json':
      return 'application/json; charset=utf-8';
    default:
      return 'application/octet-stream';
  }
}
