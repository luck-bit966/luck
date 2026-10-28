// Live smoke test for the deployed GitHub Pages build.
const base = 'https://luck-bit966.github.io/luck/';
const response = await fetch(base, { redirect:'follow', cache:'no-store' });
if (!response.ok) throw Error('Homepage HTTP ' + response.status);
const html = await response.text();
if (!html.includes('JIAYI.exe') || !html.includes('id="creative-universe"') ||
    !html.includes('id="projects"') || !html.includes('把创意，') ||
    !html.includes('data-work-index="7"')) {
  throw Error('Published homepage does not contain the new portfolio wall after Creative Universe');
}
const images = [
  'assets/works/work-01.webp','assets/works/work-02.webp','assets/works/work-03.webp',
  'assets/works/work-04.webp','assets/works/work-05.webp','assets/works/work-06.webp',
  'assets/works/work-07.webp','assets/works/growth-feb.png',
  'assets/works/growth-jan.png','assets/works/work-02-alt.webp',
  'assets/works/work-07-alt.webp','assets/works/infoflow-structure.webp',
  'assets/works/infoflow-kids.webp','assets/works/infoflow-family.webp'
];
const videos = [
  'assets/videos/ai-story.mp4','assets/videos/ai-visual-web.mp4',
  'assets/videos/product-tvc.mp4','assets/videos/real-person.mp4'
];
const checks = await Promise.all([...images.map(async path => {
  const r = await fetch(new URL(path, base), { cache:'no-store' });
  return { path, status:r.status, type:r.headers.get('content-type'), expected:'image/' };
}), ...videos.map(async path => {
  const r = await fetch(new URL(path, base), { method:'GET', headers:{ Range:'bytes=0-0' }, cache:'no-store' });
  return { path, status:r.status, type:r.headers.get('content-type'), expected:'video/' };
})]);
const bad = checks.filter(x => !(x.status === 200 || x.status === 206) || !x.type?.startsWith(x.expected));
if (bad.length) throw Error('Deployed asset failures: ' + JSON.stringify(bad));
console.log('LIVE PASS: new portfolio wall published; ' + checks.length + ' image/video assets accessible');
