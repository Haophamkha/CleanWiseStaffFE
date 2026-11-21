const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const exportsObj={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.resolve(__dirname,'../../src/utils/sessionStorage.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:exportsObj});
const {createSessionStorage}=exportsObj;
function backend(){const data=new Map();return {data,getItem:async k=>data.get(k)??null,setItem:async(k,v)=>{data.set(k,v)},deleteItem:async k=>{data.delete(k)}};}
const role=t=>t.startsWith('worker')?'WORKER':t.startsWith('customer')?'CUSTOMER':undefined;
test('one atomic write persists access and refresh across immediate process restart',async()=>{
 const db=backend();let writes=0;const original=db.setItem;db.setItem=async(k,v)=>{writes++;await original(k,v)};
 const first=createSessionStorage(db,'worker-session','WORKER',role);await first.setSession('worker-access','worker-refresh');assert.equal(writes,1);
 const reopened=createSessionStorage(db,'worker-session','WORKER',role);assert.equal(await reopened.getItem('access_token'),'worker-access');assert.equal(await reopened.getItem('refresh_token'),'worker-refresh');
});
test('customer and worker sessions remain separate on the same backend',async()=>{
 const db=backend(),staff=createSessionStorage(db,'staff','WORKER',role),customer=createSessionStorage(db,'customer','CUSTOMER',role);
 await staff.setSession('worker-access','worker-refresh');await customer.setSession('customer-access','customer-refresh');
 assert.equal(await staff.getItem('access_token'),'worker-access');await customer.clearSession();assert.equal(await staff.getItem('refresh_token'),'worker-refresh');
});
test('save promise waits for durable storage completion',async()=>{
 const db=backend();let finish;db.setItem=()=>new Promise(r=>{finish=r});let done=false;
 const storage=createSessionStorage(db,'staff','WORKER',role);const saving=storage.setSession('worker-a','worker-r').then(()=>{done=true});
 await new Promise(r=>setImmediate(r));assert.equal(done,false);finish();await saving;assert.equal(done,true);
});
test('legacy token migration keeps the right app and never deletes the other role',async()=>{
 const db=backend();db.data.set('access_token','worker-old');db.data.set('refresh_token','worker-refresh');
 const customer=createSessionStorage(db,'customer','CUSTOMER',role);assert.equal(await customer.getItem('access_token'),null);assert.equal(db.data.get('access_token'),'worker-old');
 const staff=createSessionStorage(db,'staff','WORKER',role);assert.equal(await staff.getItem('access_token'),'worker-old');await staff.persistSession();db.data.set('access_token','customer-new');assert.equal(await staff.getItem('access_token'),'worker-old');
});
test('legacy tokens without role are retained for server-side verification',async()=>{
 const db=backend();db.data.set('refresh_token','legacy-no-role');const staff=createSessionStorage(db,'staff','WORKER',role);assert.equal(await staff.getItem('refresh_token'),'legacy-no-role');
});
test('logout tombstone prevents resurrecting legacy tokens after restart',async()=>{
 const db=backend();db.data.set('access_token','worker-old');db.data.set('refresh_token','worker-old-refresh');
 await createSessionStorage(db,'staff','WORKER',role).clearSession();const next=createSessionStorage(db,'staff','WORKER',role);assert.equal(await next.getItem('access_token'),null);assert.equal(await next.getItem('refresh_token'),null);
});
test('refresh rotates both tokens together and concurrent writes remain ordered',async()=>{
 const db=backend(),storage=createSessionStorage(db,'staff','WORKER',role);
 await Promise.all([storage.setSession('worker-a1','worker-r1'),storage.setSession('worker-a2','worker-r2')]);assert.equal(await storage.getItem('access_token'),'worker-a2');assert.equal(await storage.getItem('refresh_token'),'worker-r2');
});
test('failed persistence does not report success and retry remains possible',async()=>{
 const db=backend(),write=db.setItem;let fails=true;db.setItem=async(k,v)=>{if(fails)throw Error('disk');await write(k,v)};
 const storage=createSessionStorage(db,'staff','WORKER',role);await assert.rejects(storage.setSession('worker-a','worker-r'));assert.equal(await storage.getItem('refresh_token'),null);fails=false;await storage.setSession('worker-a','worker-r');assert.equal(await storage.getItem('refresh_token'),'worker-r');
});
