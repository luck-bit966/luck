import { chromium } from 'playwright';
import { resolve } from 'node:path';
import { mkdirSync } from 'node:fs';

mkdirSync('qa-results', { recursive:true });
const browser = await chromium.launch({ headless:true });
const errors = [];

async function exercise(name, viewport) {
  const page = await browser.newPage({ viewport, deviceScaleFactor:1 });
  page.on('pageerror', e => errors.push(name + ': ' + e.message));
  await page.goto('file://' + resolve('index.html'), { waitUntil:'load' });
  await page.waitForTimeout(900);

  const section = page.locator('#projects.selected-works');
  if (await section.count() !== 1) throw Error(name + ': selected projects section missing or duplicated');
  if (!(await page.locator('#creative-universe').evaluate(a => a.compareDocumentPosition(document.querySelector('#projects')) & Node.DOCUMENT_POSITION_FOLLOWING))) {
    throw Error(name + ': portfolio wall must follow Creative Universe');
  }
  if (!(await page.locator('#selectedWorksTitle').innerText()).includes('把创意')) throw Error(name + ': new section heading missing');

  const cards = page.locator('.selected-works__grid .work-tile');
  if (await cards.count() !== 8) throw Error(name + ': expected 8 portfolio cards');
  if (await page.locator('.work-tile--wide').count() !== 2) throw Error(name + ': expected wide cards 01 and 08');
  if (await page.locator('.work-tile--tall').count() !== 6) throw Error(name + ': expected portrait cards 02–07');

  const broken = await page.locator('.selected-works__grid .work-tile__image').evaluateAll(imgs =>
    imgs.filter(im => !im.complete || im.naturalWidth === 0).map(im => im.getAttribute('src'))
  );
  if (broken.length) throw Error(name + ': missing cover(s): ' + broken.join(', '));

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (overflow > 3) throw Error(name + ': horizontal overflow ' + overflow);
  await section.scrollIntoViewIfNeeded();
  await page.screenshot({ path:'qa-results/' + name + '-works.png', fullPage:false });

  for (let i = 0; i < 8; i++) {
    await cards.nth(i).click();
    const dialog = page.locator('#worksDialog');
    await dialog.waitFor({ state:'visible' });
    const media = page.locator('#worksDialogMedia');
    if (await media.locator('img,video').count() !== 1) throw Error(name + ': modal media missing for card ' + (i + 1));
    if ([0,1,4,6].includes(i)) {
      const video = media.locator('video');
      if (await video.count() !== 1) throw Error(name + ': expected video player for card ' + (i + 1));
      const duration = await video.evaluate(v => new Promise((resolve, reject) => {
        if (v.readyState >= 1 && Number.isFinite(v.duration)) return resolve(v.duration);
        v.addEventListener('loadedmetadata', () => resolve(v.duration), { once:true });
        v.addEventListener('error', () => reject(new Error('video failed to load: ' + v.currentSrc)), { once:true });
      }));
      if (!(duration > 0)) throw Error(name + ': invalid video duration for card ' + (i + 1));
    } else {
      const image = media.locator('img');
      if (await image.count() !== 1) throw Error(name + ': expected still cover for card ' + (i + 1));
      await image.evaluate(img => img.decode());
    }
    await page.keyboard.press('Escape');
    if (await dialog.isVisible()) throw Error(name + ': Escape did not close modal');
  }
  await page.close();
}

try {
  await exercise('desktop', { width:1440, height:900 });
  await exercise('mobile', { width:390, height:844 });
  if (errors.length) throw Error('Uncaught browser errors:\n' + errors.join('\n'));
  console.log('PASS: new portfolio wall follows Creative Universe; 8 cards (01/08 wide, 02–07 portrait); cover assets, 4 video players, modal close, responsive overflow, no JS errors');
} finally {
  await browser.close();
}
