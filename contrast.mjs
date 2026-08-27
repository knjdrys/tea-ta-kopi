import puppeteer from 'puppeteer-core';
import { fileURLToPath } from 'url';
import path from 'path';
const here = path.dirname(fileURLToPath(import.meta.url));
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const pages = [['index.html','home'],['menu.html','menu'],['about.html','about'],['contact.html','contact']];

function lum(c){const a=c.map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2];}
function cr(fg,bg){const F=fg.map(Number),B=bg.map(Number);const L1=lum(F),L2=lum(B);const hi=Math.max(L1,L2),lo=Math.min(L1,L2);return ((hi+0.05)/(lo+0.05)).toFixed(2);}
function pr(s){if(!s)return null;const m=(s.match(/-?\d+/g)||[]).slice(0,3).map(Number);return m.length===3?m:null;}

const browser = await puppeteer.launch({ executablePath: CHROME, headless:'new', args:['--no-sandbox','--disable-setuid-sandbox'] });
for (const [file,name] of pages) {
  const url='file://'+path.join(here,file);
  for (const theme of ['light','dark']) {
    const page=await browser.newPage();
    await page.setViewport({width:1280,height:900});
    await page.goto(url,{waitUntil:'networkidle0'});
    await page.evaluate(t=>document.documentElement.setAttribute('data-theme',t),theme);
    await new Promise(r=>setTimeout(r,300));
    const res = await page.evaluate(() => {
      const p=(s)=>{const el=document.querySelector(s);if(!el)return null;const cs=getComputedStyle(el);let bg=cs.backgroundColor;let node=el;while((bg==='rgba(0, 0, 0, 0)'||bg==='transparent')&&node){node=node.parentElement;if(!node){bg=getComputedStyle(document.body).backgroundColor;break;}bg=getComputedStyle(node).backgroundColor;}return {c:cs.color,bg};};
      const targets={ 'body':['body'], 'lede':['.lede'], 'footer-soft':['.footer__brand p'], 'eyebrow':['.eyebrow'], 'accent-btn':['.btn--accent'], 'menu-price-note':['.cat__price-note'], 'nav-link':['.nav__links a'], 'info-row-v':['.info-row__v'], 'item-name':['.item__name'], 'value-card-h':['.values .card h3'] };
      const out={};
      for(const[k,[s]]of Object.entries(targets)){const g=p(s);if(!g){out[k]='MISSING';continue;}out[k]=g.c+' on '+g.bg;}
      return out;
    });
    const calc={};
    for(const[k,v]of Object.entries(res)){const m=v.split(' on ');const f=pr(m[0]),b=pr(m[1]);if(f&&b)calc[k]=cr(f,b);else calc[k]=v;}
    console.log(`[${name}/${theme}] ${JSON.stringify(calc)}`);
    await page.close();
  }
}
await browser.close();
console.log('CONTRAST_DONE');
