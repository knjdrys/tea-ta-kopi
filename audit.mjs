import puppeteer from 'puppeteer-core';
import { fileURLToPath } from 'url';
import path from 'path';
const here = path.dirname(fileURLToPath(import.meta.url));
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const pages = [
  ['index.html','home'], ['menu.html','menu'], ['about.html','about'], ['contact.html','contact']
];
const viewports = [
  ['desktop',1280,900], ['tablet',820,1100], ['phone',390,844], ['tiny',320,700]
];

function hexAndContrast(fg, bg) {
  // expects rgb(r,g,b) computed strings; parse and compute WCAG
  const parse = s => (s.match(/\d+/g)||[]).slice(0,3).map(Number);
  const lum = c => { const a=c.map(v=>{v/=255; return v<=0.03928? v/12.92: Math.pow((v+0.055)/1.055,2.4);}); return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2]; };
  const f=parse(fg), b=parse(bg);
  const L1=lum(f), L2=lum(b);
  const lighter=Math.max(L1,L2), darker=Math.min(L1,L2);
  return ((lighter+0.05)/(darker+0.05)).toFixed(2);
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless:'new', args:['--no-sandbox','--disable-setuid-sandbox'] });
for (const [file, name] of pages) {
  const url = 'file://' + path.join(here, file);
  for (const theme of ['light','dark']) {
    const page = await browser.newPage();
    const errors = [];
    page.on('console', m => { if (m.type()==='error' && !m.text().includes('manifest')) errors.push(m.text()); });
    page.on('pageerror', e => errors.push('PAGEERR:'+e.message));
    for (const [vn,w,h] of viewports) {
      await page.setViewport({ width:w, height:h, deviceScaleFactor:1 });
      await page.goto(url, { waitUntil:'networkidle0' });
      await page.evaluate(t => document.documentElement.setAttribute('data-theme', t), theme);
      await new Promise(r=>setTimeout(r,400));
      const o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (o > 1) {
        // find culprits
        const culprits = await page.evaluate(() => {
          const bad=[];
          document.querySelectorAll('*').forEach(el=>{
            const r=el.getBoundingClientRect();
            if (r.right > window.innerWidth + 1.5) bad.push((el.className||el.tagName)+' right='+Math.round(r.right));
          });
          return [...new Set(bad)].slice(0,6);
        });
        console.log(`OVERFLOW [${name}/${theme}/${vn}] x=${o} :: ${culprits.join(' | ')}`);
      }
    }
    if (errors.length) console.log(`JSERR [${name}/${theme}] ${JSON.stringify(errors.slice(0,3))}`);
    await page.close();
  }
}
// Contrast probe on home (light) for key text pairs
const page = await browser.newPage();
await page.setViewport({ width:1280, height:900 });
await page.goto('file://'+path.join(here,'index.html'), { waitUntil:'networkidle0' });
const contrast = await page.evaluate(() => {
  const get = sel => { const el=document.querySelector(sel); if(!el) return null; const cs=getComputedStyle(el); return {color:cs.color, bg: cs.backgroundColor==='rgba(0, 0, 0, 0)'?(getComputedStyle(el.closest('section,div,body,header')||document.body).backgroundColor):cs.backgroundColor}; };
  const pairs = {
    'body ink on bg': ['body'],
    'ink-soft p (lede)': ['.lede'],
    'footer ink-soft': ['.footer__brand p'],
    'accent btn text': ['.btn--accent'],
    'card heading': ['.values .card h3'],
    'eyebrow': ['.eyebrow'],
    'menu price note': ['.cat__price-note'],
    'nav link': ['.nav__links a'],
  };
  const out={};
  for (const [k, [sel]] of Object.entries(pairs)) {
    const g=get(sel); if(!g){out[k]='missing';continue;}
    out[k]= g.color+' / '+g.bg;
  }
  return out;
});
console.log('CONTRAST_RAW '+JSON.stringify(contrast));
await page.close();
await browser.close();
console.log('AUDIT_DONE');
