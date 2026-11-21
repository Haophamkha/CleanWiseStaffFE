const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const React=require('react'),{create,act}=require('react-test-renderer');global.IS_REACT_ACT_ENVIRONMENT=true;
const root=path.resolve(__dirname,'../..');
function load(file,mocks={}){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:id=>id in mocks?mocks[id]:require(id)});return exports;}
const policy=load('src/features/profile-setup/utils/rejectionFlow.ts');
async function setup(status='DRAFT',rejected_fields={}){
 let state;const updates=[],submits=[];const profile={status,rejected_fields,first_name:'Minh Anh',last_name:'Nguyễn',phone_number:'0901234567',gender:'FEMALE',birth_date:'1995-01-01',bio:'Kinh nghiệm cũ',experience_years:3};
 const update=payload=>({unwrap:async()=>{updates.push(payload)}}),submit=()=>({unwrap:async()=>{submits.push(true)}});
 const {usePersonalInfo}=load('src/features/profile-setup/hooks/usePersonalInfo.ts',{
  '@/features/language/i18n':{translate:x=>x},'react-i18next':{useTranslation:()=>({t:x=>x})},
  '@/features/auth/api/authApi':{useGetWorkerProfileQuery:()=>({data:profile,isLoading:false}),useUpdateWorkerProfileMutation:()=>[update,{isLoading:false}],useSubmitWorkerProfileMutation:()=>[submit,{isLoading:false}]},
  '@/features/profile-setup/utils/rejectionFlow':policy,'@/utils/toast':{showSuccessToast(){},showErrorToast(){}},'@/utils/navigation':{goBackOrReplace(){}},'expo-router':{router:{push(){},replace(){}}},
 });
 const Harness=()=>{state=usePersonalInfo();return null};let tree;await act(async()=>{tree=create(React.createElement(Harness))});
 return {read:()=>state,updates,submits,close:async()=>{await act(async()=>tree.unmount())}};
}
test('names are prefilled in the correct fields and save without swapping',async()=>{
 const s=await setup();assert.equal(s.read().values.firstName,'Minh Anh');assert.equal(s.read().values.lastName,'Nguyễn');assert.equal(s.read().canSubmit,false);
 await act(async()=>s.read().setBio('Mới'));await act(async()=>s.read().handleSave());assert.equal(s.updates[0].first_name,'Minh Anh');assert.equal(s.updates[0].last_name,'Nguyễn');await s.close();
});
for(const status of ['ACTIVE','PENDING','SUSPENDED'])test(`${status}: protected identity fields are locked and never submitted`,async()=>{
 const s=await setup(status);for(const key of ['firstName','lastName','gender','birth'])assert.equal(s.read().locked[key],true);
 for(const key of ['phone','bio','years'])assert.equal(s.read().locked[key],false);
 await act(async()=>s.read().setFirstName('Tampered'));assert.equal(s.read().canSubmit,false);
 await act(async()=>s.read().setBio('Mới'));assert.equal(s.read().canSubmit,true);await act(async()=>s.read().handleSave());
 for(const key of ['first_name','last_name','gender','birth_date'])assert.ok(!(key in s.updates[0]));assert.equal(s.updates[0].bio,'Mới');await s.close();
});
test('rejected profile opens only flagged fields and keeps resubmission flow',async()=>{
 const s=await setup('REJECTED',{first_name:'Sửa tên'});assert.equal(s.read().locked.firstName,false);assert.equal(s.read().locked.lastName,true);
 await act(async()=>s.read().setFirstName('Anh'));await act(async()=>s.read().handleSave());assert.equal(s.updates[0].first_name,'Anh');assert.ok(!('last_name' in s.updates[0]));assert.equal(s.submits.length,1);await s.close();
});
test('document and service edit locks match review status; initial draft remains editable',()=>{
 for(const status of ['ACTIVE','PENDING','SUSPENDED'])for(const key of ['service_id','portrait','identity_number','identity_front','identity_back','certificate_file'])assert.equal(policy.isFieldLocked({status,rejected_fields:{}},key),true);
 assert.equal(policy.isFieldLocked({status:'DRAFT',rejected_fields:{}},'service_id'),false);
});
