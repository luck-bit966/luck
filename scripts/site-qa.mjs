import { chromium } from 'playwright';
import { resolve } from 'node:path';
import { mkdirSync } from 'node:fs';

mkdirSync('qa-results', { recursive:true });
const browser = await chromium.launch({ headless:true });
const errors = [];
async function exercise(name, viewport) {
 const page = await browser.newPage({ viewport, deviceScaleFactor:1 });
 page.on('pageerror', e=>errors.push(name + ': ' + e.message));
 await page.goto('file://' + resolve('index.html'), {waitUntil:'load'});
 await page.waitForTimeout(1250);
 const cards=page.locator('.works-grid .work-card');
 if(await cards.count()!==8)throw Error(name+': expected 8 cards');
 if(await page.locator('.work-card .work-real-image').count()!==7)throw Error(name+': expected 7 authentic still images');
 const broken=await page.locator('.work-card .work-real-image').evaluateAll(imgs=>imgs.filter(im=>!im.complete||im.naturalWidth===0).map(im=>im.src));
 if(broken.length)throw Error(name+': missing cover(s): '+broken.join(', '));
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 if(overflow>3)throw Error(name+': horizontal overflow '+overflow);
 await page.locator('#projects').scrollIntoViewIfNeeded();
 await page.screenshot({path:'qa-results/'+name+'-works.png', fullPage:false});
 for(let i=0;i<8;i++){
  await cards.nth(i).click();
  const dialog=page.locator('#modal');
  await dialog.waitFor({state:'visible'});
  const n=await page.locator('#workGallery .work-gallery-item').count();
  if(n<1)throw Error(name+': no original gallery for project '+(i+1));
  const displayed=page.locator('#modalMedia .work-modal-cover');
  if(await displayed.count()!==1)throw Error(name+': cover missing in modal for '+(i+1));
  await displayed.evaluate(im=>im.decode());
  if(i===7&&n!==2)throw Error(name+': growth should display Jan/Feb screenshots');
  if(i===7){
   await page.locator('#workGallery .work-gallery-item').last().click();
   await displayed.evaluate(im=>im.decode());
  }
  await page.keyboard.press('Escape');
  if(await dialog.isVisible())throw Error(name+': Escape did not close modal');
 }
 await page.close();
}
try{
 await exercise('desktop', {width:1440,height:900});
 await exercise('mobile',{width:390,height:844});
 if(errors.length)throw Error('Uncaught browser errors:\n'+errors.join('\n'));
 console.log('PASS: 8 projects, 7 cover images, gallery modals, dashboard snapshots, Esc, responsive overflow, no JS errors');
}finally{await browser.close();}
