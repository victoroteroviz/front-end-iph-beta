import { mkdir, copyFile, cp } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

async function copyPdfFiles() {
  try {
    const publicDir = join(rootDir, 'public');

    // Crear directorio public si no existe
    await mkdir(publicDir, { recursive: true });
    console.log('✓ Directorio public creado/verificado');

    // Copiar pdf.worker.min.mjs
    const workerSource = join(
      rootDir,
      'node_modules/react-pdf/node_modules/pdfjs-dist/build/pdf.worker.min.mjs'
    );
    const workerDest = join(publicDir, 'pdf.worker.min.js');

    await copyFile(workerSource, workerDest);
    console.log('✓ pdf.worker.min.js copiado');

    // Copiar cmaps
    const cmapsSource = join(
      rootDir,
      'node_modules/react-pdf/node_modules/pdfjs-dist/cmaps'
    );
    const cmapsDest = join(publicDir, 'cmaps');

    await cp(cmapsSource, cmapsDest, { recursive: true, force: true });
    console.log('✓ cmaps copiados');

    // Copiar standard_fonts
    const fontsSource = join(
      rootDir,
      'node_modules/react-pdf/node_modules/pdfjs-dist/standard_fonts'
    );
    const fontsDest = join(publicDir, 'standard_fonts');

    await cp(fontsSource, fontsDest, { recursive: true, force: true });
    console.log('✓ standard_fonts copiados');

    console.log('\n✅ Archivos de react-pdf copiados exitosamente');
  } catch (error) {
    console.error('❌ Error copiando archivos de react-pdf:', error.message);
    process.exit(1);
  }
}

copyPdfFiles();
