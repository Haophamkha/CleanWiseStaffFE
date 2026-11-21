const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const React=require('react'),{create,act}=require('react-test-renderer');global.IS_REACT_ACT_ENVIRONMENT=true;
const code=ts.transpileModule(fs.readFileSync(path.resolve(__dirname,'../../src/features/auth/hooks/useLogin.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
test('staff tokens are saved before success overlay, independently of its finish callback',async()=>{
 let api,release;const events=[];
 const saving=new Promise(r=>{release=r});const login=()=>({unwrap:async()=>({access:'access',refresh:'refresh',user:{id:3,role:'WORKER'}})}),dispatch=a=>events.push(a.type);
 const mocks={
  'react-i18next':{useTranslation:()=>({t:x=>x})},'@/config/constants':{ROUTES:{HOME:'/home'}},
  '@/features/auth/api/authApi':{useLoginMutation:()=>[login,{isLoading:false}],saveTokens:async()=>{events.push('saving');await saving;events.push('saved')}},
  '@/features/auth/stores/authSlice':{setUser:()=>({type:'user'})},'@/store/baseApi':{baseApi:{util:{resetApiState:()=>({type:'reset'})}}},
  '@/store/hooks':{useAppDispatch:()=>dispatch},'@/utils/apiError':{getErrorMessage:()=> 'error'},'@/utils/toast':{showErrorToast:()=>{}},
  '@/utils/validators':{getLocalizedLoginSchema:()=>({safeParse:()=>({success:true})})},'expo-router':{router:{replace:()=>events.push('route')}},
 };
 const exports={};vm.runInNewContext(code,{exports,require:id=>id in mocks?mocks[id]:require(id)});
 const Harness=()=>{api=exports.useLogin();return null};let tree,pending;
 await act(async()=>{tree=create(React.createElement(Harness))});await act(async()=>{pending=api.handleLogin()});assert.equal(api.showSuccess,false);
 await act(async()=>{release();await pending});assert.equal(api.showSuccess,true);assert.deepEqual(events,['saving','saved','reset']);
 // Simulate closing the app during the overlay: finishLogin has never run,
 // but persistence already completed before this point.
 await act(async()=>tree.unmount());assert.ok(events.includes('saved'));assert.ok(!events.includes('route'));
});
