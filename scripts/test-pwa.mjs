import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const manifest=JSON.parse(fs.readFileSync('docs/manifest.webmanifest','utf8'));assert.equal(manifest.display,'standalone');assert.equal(manifest.start_url,'./');assert.equal(manifest.scope,'./');
for(const size of [192,512]){const icon=manifest.icons.find(i=>i.sizes===`${size}x${size}`),png=fs.readFileSync('docs/'+icon.src);assert.equal(png.readUInt32BE(16),size);assert.equal(png.readUInt32BE(20),size)}
const handlers={},cache=new Map();let offline=false,claimed=false;
const absolute=s=>new URL(typeof s==='string'?s:s.url,'https://test.local/daylane-planner/').href;
class ScopedRequest{constructor(url){this.url=absolute(url);this.method='GET'}}
const store={async addAll(requests){for(const request of requests){let relative=new URL(request.url).pathname.replace('/daylane-planner/','')||'index.html';assert(fs.existsSync('docs/'+relative));cache.set(absolute(request),new Response(fs.readFileSync('docs/'+relative))) }},async put(req,response){cache.set(absolute(req),response)},async match(req){const url=absolute(req).split('?')[0];for(const [key,value] of cache)if(key.split('?')[0]===url)return value.clone()}};
const context=vm.createContext({self:{registration:{scope:'https://test.local/daylane-planner/'},addEventListener:(name,fn)=>handlers[name]=fn,skipWaiting:async()=>{},clients:{claim:async()=>{claimed=true}}},URL,Request:ScopedRequest,caches:{open:async()=>store,keys:async()=>['daylane-app-old','other-app-cache'],delete:async key=>assert.equal(key,'daylane-app-old')},fetch:async()=>{if(offline)throw Error('offline');return new Response('fresh')}});
vm.runInContext(fs.readFileSync('docs/sw.js','utf8'),context);
let install;handlers.install({waitUntil:p=>install=p});await install;let activate;handlers.activate({waitUntil:p=>activate=p});await activate;assert(claimed);offline=true;
let response;handlers.fetch({request:{url:'https://test.local/daylane-planner/',method:'GET',mode:'navigate'},respondWith:p=>response=p});assert((await (await response).text()).includes('Daylane Planner'));
response=null;handlers.fetch({request:{url:'https://test.local/daylane-planner/app.js?v=test',method:'GET',mode:'cors'},respondWith:p=>response=p});assert((await (await response).text()).includes('function render'));
let intercepted=false;handlers.fetch({request:{url:'https://api.github.com/repos/private/contents/planner.json',method:'GET',mode:'cors'},respondWith:()=>intercepted=true});assert.equal(intercepted,false);
console.log('PASS: install manifest, 192/512 icons, complete offline cache, update activation, offline navigation, offline scripts, private API excluded from cache');
