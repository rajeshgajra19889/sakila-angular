import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT || 10000;

function resolveDistDir() {
    const candidates = [
        path.join(__dirname, 'dist', 'browser'),
        path.join(__dirname, 'dist', 'sakila-angular', 'browser'),
        path.join(__dirname, 'dist'),
    ];
    for (const dir of candidates) {
        if (fs.existsSync(path.join(dir, 'index.html'))) return dir;
    }
    return null;
}

const distDir = resolveDistDir();
const app = express();

if (distDir) {
    app.use(express.static(distDir));

    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) return next();
        res.sendFile(path.join(distDir, 'index.html'));
    });
} else {
    app.get('/', (_req, res) => res.status(500).send('dist folder not found. Run npm run build first.'));
}

app.listen(port, () => {
    console.log(`Sakila Angular static server listening on port ${port}`);
});
