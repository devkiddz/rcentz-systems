const fs=require('node:fs'),assert=require('node:assert/strict');
const ts=require('typescript');
const code=ts.transpileModule(fs.readFileSync('features/activity/components/CustomerActivityDock.tsx','utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
global.window={innerWidth:1280,innerHeight:800};
global.document={documentElement:{style:{getPropertyValue:()=>''}}};
const icon=()=>null,jsx=(type,props)=>({type,props});
function render(mode){
 const states=[{accountKey:'owner',counts:{}},mode,'expanded',{x:1100,y:500},null,''];let index=0;
 const changes=[],react={useState:(initial)=>{const i=index++;return [states[i]??initial,value=>{states[i]=typeof value==='function'?value(states[i]):value;changes.push([i,states[i]])}]},useRef:v=>({current:v}),useEffect:()=>{},useCallback:f=>f};
 const stubs={'react':react,'react/jsx-runtime':{jsx,jsxs:jsx,Fragment:'fragment'},'next/navigation':{usePathname:()=>'/dashboard/projects/project-owned'},'lucide-react':new Proxy({},{get:()=>icon}),'@/features/client/components/projects/ProjectSupportBubble':{ProjectSupportBubble:icon},'./CustomerMobileNavigation':{CustomerMobileNavigation:icon},'./CustomerActivityDock.module.css':new Proxy({},{get:(_,key)=>key==='__esModule'?false:key})};
 const module={exports:{}};new Function('require','module','exports',code)(name=>{if(!(name in stubs))throw Error(name);return stubs[name]},module,module.exports);
 const tree=module.exports.CustomerActivityDock();const aside=tree.props.children[1];aside.props.ref.current={offsetWidth:72,offsetHeight:80};
 return {aside,button:aside.props.children,states,changes};
}
for(const mode of ['collapsed','hidden']){
 let r=render(mode);assert.equal(r.button.type,'button');assert.match(r.button.props['aria-label'],/Open support menu/);assert.equal(r.button.props.children[1].props.children,'Support');
 r.button.props.onClick({detail:0});assert.equal(r.states[1],'expanded');
 r=render(mode);let prevented=false;r.button.props.onKeyDown({key:'ArrowRight',preventDefault:()=>prevented=true});assert.ok(prevented);assert.equal(r.states[3].x,1116);
 r=render(mode);r.button.props.onPointerDown({button:0,pointerId:1,clientX:10,clientY:10,currentTarget:{setPointerCapture(){}}});r.button.props.onPointerMove({pointerId:1,clientX:70,clientY:20});r.button.props.onPointerUp();r.button.props.onClick({detail:1});assert.equal(r.states[1],mode,'drag must not open menu');assert.equal(r.states[3].x,1160);
 r=render(mode);r.button.props.onPointerDown({button:0,pointerId:1,clientX:10,clientY:10,currentTarget:{setPointerCapture(){}}});r.button.props.onPointerUp();r.button.props.onClick({detail:1});assert.equal(r.states[1],'expanded','ordinary tap opens menu');
}
console.log('PASS: both saved compact modes show labelled support; tap/keyboard opens; drag repositions without opening; arrow-key movement preserved. Controlled component fixtures.');
