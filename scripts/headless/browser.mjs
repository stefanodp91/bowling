// The headless browser shared by the shot tool and the headless pilot (wiki/tools/shot.md, rule 2).
import { chromium } from 'playwright';

/**
 * Headless Chromium has no GPU: WebGL needs a software backend. ANGLE on SwiftShader renders
 * WebGL 2 on the CPU; --enable-unsafe-swiftshader opts in to it (Chromium refuses the software
 * fallback by default), --ignore-gpu-blocklist keeps WebGL enabled on it.
 */
export const SOFTWARE_GL_FLAGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];

/** Console messages that are not errors of ours: SwiftShader performance notes. */
const IGNORED_CONSOLE = [/GPU stall due to ReadPixels/, /GL Driver Message/];

export async function launchBrowser() {
  return chromium.launch({ args: SOFTWARE_GL_FLAGS });
}

/** Opens a page of the given size that records console errors and uncaught exceptions. */
export async function openPage(browser, { width, height }) {
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && !IGNORED_CONSOLE.some((re) => re.test(message.text()))) errors.push(`console.error: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`uncaught: ${error.message}`));
  return { page, errors };
}

/** The RGBA of the pixel at (x, y) of a PNG, decoded by the browser itself. */
export async function pixelOf(browser, png, x, y) {
  const page = await browser.newPage();
  try {
    return await page.evaluate(
      async ({ base64, px, py }) => {
        const image = new Image();
        image.src = `data:image/png;base64,${base64}`;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext('2d');
        if (context === null) throw new Error('no 2d context');
        context.drawImage(image, 0, 0);
        return Array.from(context.getImageData(px, py, 1, 1).data);
      },
      { base64: png.toString('base64'), px: x, py: y },
    );
  } finally {
    await page.close();
  }
}
