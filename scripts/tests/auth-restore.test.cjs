const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const React=require('react'),{create,act}=require('react-test-renderer');global.IS_REACT_ACT_ENVIRONMENT=true;
const source=fs.readFileSync(path.resolve(__dirname,'../../src/features/auth/hooks/useAuthGuard.ts'),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
function setup(getItem,fetch,initialSegments=["(auth)","login"]){
 let segments=initialSegments;
 let auth={status:'idle',user:null},latest;const redirects=[];let clears=0,persists=0;
 const dispatch=a=>{if(a.type==='clear')auth={status:'unauthenticated',user:null};else auth={status:'authenticated',user:a.payload}};
 const trigger=()=>({unwrap:fetch}),router={replace:p=>redirects.push(p)};
 const mocks={
  '@/config/constants':{ALLOWED_APP_ROLE:'WORKER',ROUTES:{HOME:'/(tabs)/home'},STORAGE_KEYS:{ACCESS_TOKEN:'access',REFRESH_TOKEN:'refresh'}},
  '@/features/auth/api/authApi':{useLazyGetWorkerProfileQuery:()=>[trigger]},
  '@/features/auth/stores/authSlice':{clearAuth:()=>({type:'clear'}),setUser:payload=>({type:'user',payload})},
  '@/features/notification/hooks/usePushNotifications':{usePushNotifications:()=>{}},
  '@/store/hooks':{useAppDispatch:()=>dispatch,useAppSelector:fn=>fn({auth})},
  '@/utils/storage':{storage:{getItem,clearSession:async()=>{clears++},persistSession:async()=>{persists++}}},
  'expo-router':{useRouter:()=>router,useSegments:()=>segments},
 };
 const exports={};vm.runInNewContext(code,{exports,require:id=>id in mocks?mocks[id]:require(id)});
 const Harness=()=>{latest=exports.useAuthGuard();return null};
 return {Harness,read:()=>latest,auth:()=>auth,redirects,clears:()=>clears,persists:()=>persists,navigate:next=>{segments=next}};
}
async function mount(s){let tree;await act(async()=>{tree=create(React.createElement(s.Harness))});return tree;}
const close=async t=>{await act(async()=>t.unmount())};
const profile={user_id:3,role:'WORKER',first_name:'Minh'};
test('legacy/no-role JWT: server profile restores worker and redirects only after loading success',async()=>{
 const s=setup(async()=> 'legacy-no-role',async()=>profile),tree=await mount(s);
 assert.equal(s.auth().user.id,3);assert.equal(s.clears(),0);assert.equal(s.persists(),1);assert.equal(s.read().phase,'success');assert.equal(s.read().ready,false);assert.equal(s.redirects.length,0);
 await act(async()=>s.read().finish());assert.equal(s.read().ready,false);assert.equal(s.read().phase,'routing');assert.equal(s.redirects[0],'/(tabs)/home');
 s.navigate(['(tabs)','home']);await act(async()=>tree.update(React.createElement(s.Harness)));assert.equal(s.read().ready,true);await close(tree);
});
test('refresh-only session restores instead of forcing login',async()=>{
 const s=setup(async k=>k==='refresh'?'refresh-token':null,async()=>profile),tree=await mount(s);assert.equal(s.read().phase,'success');assert.equal(s.auth().user.id,3);await close(tree);
});
test('offline keeps saved tokens and retry succeeds',async()=>{
 let online=false;const s=setup(async()=>'saved',async()=>{if(!online)throw Error('offline');return profile}),tree=await mount(s);
 assert.equal(s.read().phase,'error');assert.equal(s.clears(),0);assert.equal(s.redirects.length,0);online=true;
 await act(async()=>s.read().retry());assert.equal(s.read().phase,'success');assert.equal(s.auth().user.id,3);await close(tree);
});
test('no saved session opens login without a profile request',async()=>{
 const s=setup(async()=>null,async()=>{throw Error('unexpected request')}),tree=await mount(s);assert.equal(s.read().ready,true);assert.equal(s.auth().status,'unauthenticated');await close(tree);
});
test('refresh rejection already cleared by interceptor opens login instead of hanging',async()=>{
 let revoked=false;const s=setup(async()=>revoked?null:'saved',async()=>{revoked=true;throw Error('401')}),tree=await mount(s);assert.equal(s.read().phase,'ready');assert.equal(s.auth().status,'unauthenticated');await close(tree);
});
test('mismatched server profile is not admitted as a worker',async()=>{
 const s=setup(async()=>'saved',async()=>({...profile,role:'CUSTOMER'})),tree=await mount(s);assert.equal(s.clears(),1);assert.equal(s.auth().status,'unauthenticated');await close(tree);
});

test('restored register route stays covered until Home is active',async()=>{
 const s=setup(async()=> 'saved',async()=>profile,['(auth)','register']),tree=await mount(s);
 await act(async()=>s.read().finish());assert.equal(s.read().phase,'routing');assert.equal(s.read().ready,false);assert.deepEqual(s.redirects,['/(tabs)/home']);
 s.navigate(['(tabs)','home']);await act(async()=>tree.update(React.createElement(s.Harness)));assert.equal(s.read().ready,true);await close(tree);
});
test('restoring an existing protected route preserves the destination',async()=>{
 const s=setup(async()=> 'saved',async()=>profile,['jobs','123']),tree=await mount(s);
 await act(async()=>s.read().finish());assert.equal(s.read().ready,true);assert.equal(s.redirects.length,0);await close(tree);
});
