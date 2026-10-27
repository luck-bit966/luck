// Live smoke test for the deployed GitHub Pages build.
// Kept independent from the repository's local Playwright visual audit.
const base='https://luck-bit966.github.io/luck/';
const html=await fetch(base,{redirect:'follow'}).then(async r=>{
 if(!r.ok)throw Error('Homepage HTTP '+r.status);
 return r.text();
});
const items=['assets/jiayi-portrait.svg',
 ...[1,2,3,4,5,6,7].map(i=>'assets/works/work-0'+i+'.webp'),
 'assets/works/work-02-alt.webp',
 'assets/works/work-07-alt.webp',
 'assets/works/infoflow-structure.webp',
 'assets/works/infoflow-kids.webp',
 'assets/works/infoflow-family.webp',
 'assets/works/growth-jan.png',
 'assets/works/growth-feb.png'
];
if(!html.includes('JIAYI.exe')||!html.includes('class="work-card w08"'))throw Error('Unexpected published homepage');
const checks=await Promise.all(items.map(async path=>{
 const r=await fetch(new URL(path,base));
 return {path,status:r.status,type:r.headers.get('content-type')};
}));
const bad=checks.filter(x=>x.status!==200||!x.type?.startsWith('image/'));
if(bad.length)throw Error('Deployed image failures: '+JSON.stringify(bad));
console.log('LIVE PASS: homepage + '+items.length+' deployed image assets responded HTTP 200');
