const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const React=require('react'),{create,act}=require('react-test-renderer');global.IS_REACT_ACT_ENVIRONMENT=true;
const host=name=>({children,...props})=>React.createElement(name,props,children);
async function render(user,showSuccess=false){
 const code=ts.transpileModule(fs.readFileSync(path.resolve(__dirname,'../../src/app/(auth)/login.tsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const mocks={
  'react-i18next':{useTranslation:()=>({t:x=>x})},
  '@/components/ui/FormInput':{FormInput:host('Input')},'@/components/ui/PrimaryButton':{PrimaryButton:host('Button')},
  '@/features/auth/components/AuthKit':Object.fromEntries(['AuthFooter','AuthScreen','ErrorNotice','FormField','LinkText'].map(name=>[name,host(name)])),
  '@/features/auth/components/LoginSuccessOverlay':{LoginSuccessOverlay:host('SuccessOverlay')},
  '@/features/auth/hooks/useLogin':{useLogin:()=>({showSuccess})},
  '@/store/hooks':{useAppSelector:fn=>fn({auth:{user}})},'@/config/constants':{ROUTES:{HOME:'/(tabs)/home'}},
  'expo-router':{Link:host('Link'),Redirect:host('Redirect')},'react-native':{View:host('View')},
 };
 const exports={};vm.runInNewContext(code,{exports,require:id=>id in mocks?mocks[id]:require(id)});
 let tree;await act(async()=>{tree=create(React.createElement(exports.default))});return tree;
}
const close=async tree=>{await act(async()=>tree.unmount())};
test('restored worker on login route redirects home instead of showing the form',async()=>{
 const tree=await render({id:1,role:'WORKER'});assert.equal(tree.root.findByType('Redirect').props.href,'/(tabs)/home');assert.equal(tree.root.findAllByType('AuthScreen').length,0);await close(tree);
});
test('signed-out visitor can use the staff login form',async()=>{
 const tree=await render(null);assert.equal(tree.root.findAllByType('AuthScreen').length,1);assert.equal(tree.root.findAllByType('Redirect').length,0);await close(tree);
});
test('active new-login success animation is not interrupted by the redirect guard',async()=>{
 const tree=await render({id:1,role:'WORKER'},true);assert.equal(tree.root.findAllByType('Redirect').length,0);assert.equal(tree.root.findByType('SuccessOverlay').props.visible,true);await close(tree);
});
