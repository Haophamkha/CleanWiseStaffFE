const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
const React=require('react'),{create,act}=require('react-test-renderer'),{language:core}=require('./language-support.cjs');
global.IS_REACT_ACT_ENVIRONMENT=true;
const root=path.resolve(__dirname,'../..');
function load(file,mocks={}){
 const filename=path.join(root,file),loaded=new Module(filename,module);loaded.paths=module.paths;
 loaded.require=name=>Object.hasOwn(mocks,name)?mocks[name]:name==='@/features/language/i18n'||name==='./i18n'?core:name.startsWith('.')?require(path.resolve(path.dirname(filename),name)):require(name);
 loaded._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,filename);return loaded.exports;
}
const themes=load('src/constants/theme.ts');

test('compact staff profile retains every destination and logout confirmation in both languages', async()=>{
 const routes=[];let logoutCount=0,renderer;
 const common={
  'react-native':{View:'View',Text:'Text',TouchableOpacity:'TouchableOpacity',ScrollView:'ScrollView'},
  'react-i18next':require('./language-support.cjs').react,
  '@expo/vector-icons':{Feather:'Icon'},
  'react-native-safe-area-context':{useSafeAreaInsets:()=>({top:0,bottom:0})},
  '@/features/theme/ThemeProvider':{useAppTheme:()=>themes.APP_THEMES.dark},
 };
 const {useProfile}=load('src/features/profile/hooks/useProfile.ts',{
  ...common,'@/features/auth/api/authApi':{useGetWorkerProfileQuery:()=>({data:{first_name:'Minh Anh',last_name:'Nguyễn',status:'ACTIVE',average_rating:4.6,total_completed_jobs:7}})},
  '@/store/baseApi':{performLogout:()=>logoutCount++},'@/utils/media':{resolveMediaUrl:()=>null},'expo-router':{router:{push:route=>routes.push(route)}},
 });
 const {ProfileMenu}=load('src/features/profile/components/ProfileMenu.tsx',common);
 const Screen=load('src/app/(tabs)/profile.tsx',{
  ...common,'@/components/common/TabHeader':{TabHeader:'Header'},'@/components/ui/ConfirmModal':{ConfirmModal:'ConfirmModal'},
  '@/features/profile/components/ProfileHero':{ProfileHero:'ProfileHero'},'@/features/profile/components/ProfileMenu':{ProfileMenu},'@/features/profile/hooks/useProfile':{useProfile},
 }).default;
 try{
  for(const locale of ['vi','en']){
   await core.i18n.changeLanguage(locale);routes.length=0;
   await act(async()=>{renderer=create(React.createElement(Screen))});
   const buttons=renderer.root.findAllByType('TouchableOpacity');assert.equal(buttons.length,9);
   for(const button of buttons)await act(async()=>button.props.onPress());
   assert.deepEqual([...routes].sort(),['/earnings','/payment-methods','/(profile-setup)/personal-info','/(profile-setup)/working-areas','/(profile-setup)/my-profile','/complaints','/settings','/about'].sort());
   let modal=renderer.root.findByType('ConfirmModal');assert.equal(modal.props.visible,true);
   await act(async()=>modal.props.onCancel());assert.equal(renderer.root.findByType('ConfirmModal').props.visible,false);assert.equal(logoutCount,locale==='vi'?0:1);
   await act(async()=>buttons[8].props.onPress());
   await act(async()=>renderer.root.findByType('ConfirmModal').props.onConfirm());
   assert.equal(logoutCount,locale==='vi'?1:2);
   await act(async()=>renderer.unmount());renderer=null;
  }
 }finally{if(renderer)await act(async()=>renderer.unmount());await core.i18n.changeLanguage('vi');}
});
const deferred=()=>{let resolve;const promise=new Promise(yes=>{resolve=yes});return{promise,resolve}};
async function mount(options={}){
 await core.i18n.changeLanguage('vi');let state,appearance,renderer,mounts=0;
 const saved=new Map(options.saved===undefined?[]:[[core.LANGUAGE_STORAGE_KEY,options.saved]]),writes=[],alerts=[];
 const storage={getItem:async key=>key===core.LANGUAGE_STORAGE_KEY&&options.read?options.read():saved.get(key)??null,setItem:async(key,value)=>{if(key===core.LANGUAGE_STORAGE_KEY){writes.push(value);if(options.write)await options.write(key,value)}saved.set(key,value)}};
 const ui={View:'View',Text:'Text',TouchableOpacity:'TouchableOpacity',Pressable:'Pressable',Modal:'Modal',Switch:'Switch',ScrollView:'ScrollView',Alert:{alert:(...args)=>alerts.push(args)}};
 const theme=load('src/features/theme/ThemeProvider.tsx',{
  '@/constants/theme':themes,'@react-native-async-storage/async-storage':storage,'react-native':ui,
  'expo-router/react-navigation':{DarkTheme:{colors:{}},DefaultTheme:{colors:{}},ThemeProvider:({children})=>children},
  'expo-status-bar':{StatusBar:'StatusBar'},'expo-system-ui':{setBackgroundColorAsync:async()=>{}},'expo-splash-screen':{hideAsync:async()=>{}},
  nativewind:{vars:value=>value,useColorScheme:()=>({colorScheme:'light',setColorScheme:()=>{}})},
 });
 const provider=load('src/features/language/LanguageProvider.tsx',{'@react-native-async-storage/async-storage':storage});
 const common={'react-native':ui,'@expo/vector-icons':{Feather:'Icon'},'@/features/theme/ThemeProvider':theme};
 const {LanguageSettings}=load('src/features/language/LanguageSettings.tsx',{...common,'./LanguageProvider':provider});
 const {AppearanceSettings}=load('src/features/theme/AppearanceSettings.tsx',{...common,'./ThemeProvider':theme,'@/constants/theme':themes});
 const {SettingsScreen}=load('src/features/profile/components/SettingsScreen.tsx',{
  ...common,'@/features/language/LanguageSettings':{LanguageSettings},'@/features/theme/AppearanceSettings':{AppearanceSettings},'@/constants/theme':themes,
  'react-native-safe-area-context':{useSafeAreaInsets:()=>({top:0,bottom:0})},
 });
 function Content(){state=provider.useAppLanguage();appearance=theme.useAppTheme();const[draft]=React.useState(()=>{mounts++;return'Nội dung đang nhập'});return React.createElement(React.Fragment,null,React.createElement(SettingsScreen,{onBack:()=>{},pushEnabled:true,pushDisabled:false,onTogglePush:()=>{}}),React.createElement('Draft',{value:draft}));}
 await act(async()=>{renderer=create(React.createElement(provider.AppLanguageProvider,null,React.createElement(theme.AppThemeProvider,null,React.createElement(Content))))});
 return{renderer,saved,writes,alerts,get state(){return state},get appearance(){return appearance},get mounts(){return mounts},
  choose:async label=>{if(!renderer.root.findAllByType('TouchableOpacity').some(n=>n.props.accessibilityLabel===label))await act(async()=>renderer.root.findAllByType('TouchableOpacity').find(n=>n.props.accessibilityLabel===core.translate('Chọn ngôn ngữ ứng dụng')).props.onPress());await act(async()=>renderer.root.findAllByType('TouchableOpacity').find(n=>n.props.accessibilityLabel===label).props.onPress())},
  unmount:()=>act(async()=>renderer.unmount())};
}
const texts=app=>app.renderer.root.findAllByType('Text').flatMap(n=>n.children.filter(c=>typeof c==='string'));
test('staff settings switch language immediately while preserving draft, settings screen, push and dark mode',async()=>{
 const app=await mount();try{
  assert.equal(app.state.language,'vi');assert.ok(texts(app).includes('Cài đặt'));
  await app.choose('Tối');assert.equal(app.appearance.mode,'dark');
  await app.choose('English');assert.equal(app.state.language,'en');assert.ok(texts(app).includes('Settings'));assert.ok(texts(app).includes('Push notifications'));
  await app.choose('Choose app language');
  const radios=app.renderer.root.findAllByType('TouchableOpacity').filter(n=>n.props.accessibilityRole==='radio');assert.deepEqual(radios.map(n=>n.props.accessibilityLabel),['Light','Dark','Tiếng Việt','English']);
  assert.equal(radios.find(n=>n.props.accessibilityLabel==='English').props['aria-checked'],true);assert.equal(radios.find(n=>n.props.accessibilityLabel==='Dark').props.accessibilityState.checked,true);
  assert.equal(app.appearance.mode,'dark');assert.equal(app.renderer.root.findAllByType('Modal').length,0);assert.equal(app.renderer.root.findByType('Switch').props.value,true);
  assert.equal(app.saved.get(core.LANGUAGE_STORAGE_KEY),'en');assert.equal(app.mounts,1);assert.equal(app.renderer.root.findByType('Draft').props.value,'Nội dung đang nhập');
  await app.choose('Tiếng Việt');assert.ok(texts(app).includes('Cài đặt'));assert.equal(app.appearance.mode,'dark');
 }finally{await app.unmount()}
});
test('saved English is restored before screens mount',async()=>{
 const read=deferred(),app=await mount({read:()=>read.promise});try{assert.equal(app.renderer.root.findAllByType('Draft').length,0);await act(async()=>{read.resolve('en')});assert.equal(app.state.language,'en');assert.ok(texts(app).includes('Settings'))}finally{await app.unmount()}
});
test('missing, invalid and unreadable storage use Vietnamese',async()=>{
 for(const options of[{},{saved:'fr'},{saved:'system'},{read:async()=>{throw Error('unavailable')}}]){const app=await mount(options);try{assert.equal(app.state.language,'vi');assert.equal(core.getLocale(),'vi-VN')}finally{await app.unmount()}}
});
test('rapid changes save the final preference in order',async()=>{
 const first=deferred();let calls=0;const app=await mount({write:async()=>{if(++calls===1)await first.promise}});try{
  let a,b,c;await act(async()=>{a=app.state.setLanguage('en');b=app.state.setLanguage('vi');c=app.state.setLanguage('en')});assert.equal(app.state.language,'en');assert.deepEqual(app.writes,['en']);
  await act(async()=>{first.resolve();await Promise.all([a,b,c])});assert.deepEqual(app.writes,['en','vi','en']);assert.equal(app.saved.get(core.LANGUAGE_STORAGE_KEY),'en');
 }finally{await app.unmount()}
});
test('a failed save reports the error and does not prevent the next save',async()=>{
 let calls=0;const app=await mount({write:async()=>{if(++calls===1)throw Error('full')}});try{await app.choose('English');assert.equal(app.state.language,'en');assert.equal(app.alerts[0][0],"Couldn't save language");await app.choose('Tiếng Việt');assert.equal(app.saved.get(core.LANGUAGE_STORAGE_KEY),'vi');await assert.rejects(app.state.setLanguage('fr'),/Unsupported language/)}finally{await app.unmount()}
});
test('dictionary keys, interpolation and every literal translation call match',()=>{
 const vi=require('../../src/features/language/locales/vi.json'),en=require('../../src/features/language/locales/en.json');assert.deepEqual(Object.keys(vi).sort(),Object.keys(en).sort());
 for(const key of Object.keys(vi)){assert.ok(en[key].trim(),key);assert.deepEqual((vi[key].match(/\{\{[^}]+\}\}/g)??[]).sort(),(en[key].match(/\{\{[^}]+\}\}/g)??[]).sort(),key)}
 function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,entry.name);if(entry.isDirectory())walk(f);else if(/\.(ts|tsx)$/.test(f)){const sf=ts.createSourceFile(f,fs.readFileSync(f,'utf8'),99,true);function scan(n){if(ts.isCallExpression(n)&&['tr','t','translateText','defaultTranslate'].includes(n.expression.getText(sf))&&ts.isStringLiteral(n.arguments[0]))assert.ok(Object.hasOwn(en,n.arguments[0].text),`${f}: ${n.arguments[0].text}`);ts.forEachChild(n,scan)}scan(sf)}}}walk(path.join(root,'src'));
});
test('dates, amounts and counts follow language while keeping VND',async()=>{
 const {formatCurrency,formatDateTime}=load('src/utils/format.ts'),{formatVnd}=load('src/features/earnings/utils/earningsFormat.ts');
 try{await core.i18n.changeLanguage('en');assert.equal(formatVnd(120000),'120,000 VND');assert.match(formatCurrency(120000),/120,000/);assert.match(formatCurrency(120000),/₫|VND/);
 const iso='2026-10-23T13:05:00Z';assert.equal(formatDateTime(iso),new Date(iso).toLocaleString('en-US',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}));
 assert.equal(core.translate('{{value0}} khiếu nại',{value0:1,count:1}),'1 complaint');assert.equal(core.translate('{{value0}} khiếu nại',{value0:2,count:2}),'2 complaints');
 await core.i18n.changeLanguage('vi');assert.equal(formatVnd(120000),'120.000đ');
 }finally{await core.i18n.changeLanguage('vi')}
});
test('validation and status labels change without changing business codes',async()=>{
 const validators=load('src/utils/validators.ts');
 const status=load('src/components/ui/StatusBadge.tsx',{'@/constants/theme':themes,'@/features/theme/ThemeProvider':{useAppTheme:()=>themes.APP_THEMES.light},'react-native':{Text:'Text',View:'View'}});
 try{await core.i18n.changeLanguage('en');assert.equal(validators.getLocalizedLoginSchema().safeParse({phone:'',password:''}).error.issues[0].message,'Please enter your phone number');assert.equal(status.getScheduleStatus(themes.COLORS).COMPLETED.label,'Completed');assert.equal(core.translate('Nam'),'Male');assert.equal(core.translate('Nữ'),'Female');assert.equal(core.translate('Unknown user content'),'Unknown user content')}finally{await core.i18n.changeLanguage('vi')}
});

test('service boolean values switch language and preserve user text',async()=>{
 const {ServiceDetailReadOnly}=load('src/features/job/components/ServiceDetailReadOnly.tsx',{'@/features/profile-setup/utils/localizeService':load('src/features/profile-setup/utils/localizeService.ts'),'react-i18next':require('./language-support.cjs').react,'react-native':{View:'View',Text:'Text',Image:'Image'},'@expo/vector-icons':{Feather:'Icon'},'@/constants/theme':themes,'@/features/theme/ThemeProvider':{useAppTheme:()=>themes.APP_THEMES.light}});
 let renderer;const props={fields:[{key:'pets',type:'BOOLEAN',label:'Pets'},{key:'notes',type:'TEXT',label:'Notes'}],values:{pets:true,notes:'Khách dặn giữ nguyên nội dung'}};
 const texts=()=>renderer.root.findAllByType('Text').flatMap(n=>n.children.filter(c=>typeof c==='string'));
 try{
  await act(async()=>{renderer=create(React.createElement(ServiceDetailReadOnly,props));});
  await act(async()=>{await core.i18n.changeLanguage('en');});assert.ok(texts().includes('Yes'));assert.ok(texts().includes(props.values.notes));
  await act(async()=>{renderer.update(React.createElement(ServiceDetailReadOnly,{...props,values:{...props.values,pets:false}}));});assert.ok(texts().includes('No'));
  await act(async()=>{await core.i18n.changeLanguage('vi');});assert.ok(texts().includes('Không'));
 }finally{if(renderer)await act(async()=>renderer.unmount());await core.i18n.changeLanguage('vi');}
});

test('setup validation errors already on screen follow language changes',async()=>{
 let setup,renderer;const draft={userId:null},toasts=[];
 const {useProfileSetup}=load('src/features/profile-setup/hooks/useProfileSetup.ts',{
  'react-i18next':require('./language-support.cjs').react,
  'react-redux':{useDispatch:()=>()=>{},useSelector:select=>select({profileDraft:draft})},
  '@/features/auth/api/authApi':{useGetWorkerProfileQuery:()=>({}),useGetActiveServicesQuery:()=>({}),useGetWorkingAreasQuery:()=>({}),useUpdateWorkerProfileMutation:()=>[],useUpdateWorkingAreasMutation:()=>[],useSubmitWorkerProfileMutation:()=>[]},
  '@/features/profile-setup/hooks/useAreaSelection':{useAreaSelection:()=>({})},
  '@/features/profile-setup/stores/profileDraftSlice':{patchDraft:()=>{},resetDraft:()=>{}},
  '@/features/profile-setup/utils/rejectionFlow':{fieldRejectionNote:()=>null,isFieldLocked:()=>false,stepRoute:s=>s,getRejectedSteps:()=>[]},
  '@/utils/apiError':{getErrorMessage:()=>''},'@/utils/media':{resolveMediaUrl:v=>v},'@/utils/toast':{showErrorToast:(...args)=>toasts.push(args)},'expo-router':{router:{push:()=>{}}},
 });
 function Probe(){setup=useProfileSetup();return null;}
 try{
  await act(async()=>{renderer=create(React.createElement(Probe));});await act(async()=>{await setup.goNext('portrait');});assert.equal(setup.error,'Vui lòng chọn ảnh chân dung.');
  await act(async()=>{await core.i18n.changeLanguage('en');});assert.equal(setup.error,'Please select a portrait photo.');
  await act(async()=>{await setup.goNext('experience');});assert.equal(setup.error,'Please write a short introduction about yourself.');
  await act(async()=>{await core.i18n.changeLanguage('vi');});assert.equal(setup.error,'Vui lòng giới thiệu đôi nét về bản thân.');
 }finally{if(renderer)await act(async()=>renderer.unmount());await core.i18n.changeLanguage('vi');}
});

test('cached profile labels and experience follow language without changing profile data',async()=>{
 let state,renderer;const profile={status:'DRAFT',is_complete:true,first_name:'An',last_name:'Nguyễn',gender:'MALE',experience_years:1};
 const {useMyProfile}=load('src/features/profile-setup/hooks/useMyProfile.ts',{
  'react-i18next':require('./language-support.cjs').react,'@/features/theme/ThemeProvider':{useAppTheme:()=>themes.APP_THEMES.light},
  '@/features/auth/api/authApi':{useGetWorkerProfileQuery:()=>({data:profile})},
  '@/features/profile-setup/utils/rejectionFlow':{},'@/features/profile/hooks/useProfile':{getProfileStatusInfo:()=>({})},
  '@/utils/media':{resolveMediaUrl:v=>v},'expo-router':{router:{}},
 });
 function Probe(){state=useMyProfile();return null;}
 try{
  await act(async()=>{renderer=create(React.createElement(Probe));});
  await act(async()=>{await core.i18n.changeLanguage('en');});assert.equal(state.view.personalRows.at(-1).value,'1 year');assert.equal(state.view.personalRows[0].value,'Nguyễn An');
  assert.equal(core.translate('{{value0}} năm',{value0:2,count:2}),'2 years');
  await act(async()=>{await core.i18n.changeLanguage('vi');});assert.equal(state.view.personalRows.at(-1).value,'1 năm');
 }finally{if(renderer)await act(async()=>renderer.unmount());await core.i18n.changeLanguage('vi');}
});
