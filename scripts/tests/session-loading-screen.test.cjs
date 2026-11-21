const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const React=require('react'),{create,act}=require('react-test-renderer');
global.IS_REACT_ACT_ENVIRONMENT=true;
const root=path.resolve(__dirname,'../..');
function load(file,mocks={},globals={}){
 const code=ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const exports={};vm.runInNewContext(code,{exports,require:id=>id in mocks?mocks[id]:require(id),...globals});return exports;
}
const {APP_THEMES,ON_DARK}=load('src/constants/theme.ts',{'../../tokens':require('../../tokens')});
const animation=()=>({start(){},stop(){}});
class Value {setValue(){} interpolate(){return '0deg'}}
const host=name=>({children,...props})=>React.createElement(name,props,children);
for(const mode of ['light','dark'])for(const phase of ['loading','error','success']){
 const error=phase==='error',success=phase==='success';
 test(`loading screen: ${mode}, ${phase} uses staff theme without raw text`,async()=>{
  const theme=APP_THEMES[mode];
  const timers=[];let completed=0;const finish=()=>{completed++};
  const {SessionLoadingScreen}=load('src/features/auth/components/SessionLoadingScreen.tsx',{
   '@/constants/theme':{ON_DARK},
   '@/features/theme/ThemeProvider':{useAppTheme:()=>theme},
   '@expo/vector-icons/Feather':{__esModule:true,default:host('Icon')},
   'expo-status-bar':{StatusBar:()=>null},
   'expo-linear-gradient':{LinearGradient:host('Gradient')},
   'react-i18next':{useTranslation:()=>({t:x=>x})},
   'react-native':{Platform:{select:values=>values.android},
    ActivityIndicator:host('Spinner'),Text:host('Text'),View:host('View'),ScrollView:host('ScrollView'),TouchableOpacity:host('Button'),
    Animated:{Value,View:host('AnimatedView'),loop:animation,timing:animation,spring:animation},
    Easing:{linear:x=>x},BackHandler:{addEventListener:()=>({remove(){}})},
    StyleSheet:{create:x=>x,absoluteFill:{}},useWindowDimensions:()=>({width:390,height:844}),
   },
   'react-native-safe-area-context':{useSafeAreaInsets:()=>({top:24,bottom:24})},
   'react-native-svg':{__esModule:true,default:host('Svg'),Circle:host('Circle'),Path:host('Path')},
  },{setTimeout:(fn,ms)=>{timers.push({fn,ms});return 1},clearTimeout:()=>{}});
  let tree;await act(async()=>{tree=create(React.createElement(SessionLoadingScreen,{error,success,onComplete:finish,onRetry:()=>{}}))});
  try{
   function inspect(node,parent){
    if(node==null)return;
    if(typeof node==='string'){assert.equal(parent,'Text',`Raw text under ${parent}: ${JSON.stringify(node)}`);return;}
    for(const child of node.children||[])inspect(child,node.type);
   }
   inspect(tree.toJSON());
   const gradients=tree.root.findAllByType('Gradient');
   assert.ok(gradients[0].props.colors.includes(theme.COLORS.primaryFillDark));
   assert.ok(gradients[1].props.colors.includes(theme.COLORS.primaryFillDark));
   assert.ok(gradients[1].props.colors.includes(theme.COLORS.primary));
   assert.equal(tree.root.findAllByType('Button').length,error?1:0);
   if(success) {
    assert.equal(timers.length,1);assert.ok(timers[0].ms>0 && timers[0].ms<=1000);assert.equal(completed,0);
    assert.ok(!tree.root.findAllByType('Icon').some(n=>n.props.name==='check'));
    await act(async()=>timers[0].fn());
    assert.ok(tree.root.findAllByType('Icon').some(n=>n.props.name==='check'));
    assert.equal(timers.length,2);assert.equal(timers[1].ms,1100);assert.equal(completed,0);
    await act(async()=>timers[1].fn());assert.equal(completed,1);
   } else assert.equal(timers.length,0);
  } finally {await act(async()=>tree.unmount())}
 });
}
