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
 const tree=module.exports.CustomerActivityDock();const aside=tree.props.children[1];aside.props.ref.current={offsetWidth:48,offsetHeight:48};
 return {aside,button:aside.props.children,states,changes};
}
function target() {
 const properties = new Map();
 return {
  properties,
  style: { setProperty: (key, value) => properties.set(key, value), removeProperty: key => properties.delete(key) },
  setPointerCapture() {},
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 48, height: 48 }),
 };
}
let reduced = false, fine = true;
window.matchMedia = query => ({ matches: query.includes('reduced-motion') ? reduced : fine });
for (const mode of ['collapsed', 'hidden']) {
 let r = render(mode);
 assert.equal(r.button.type, 'button');
 assert.match(r.button.props['aria-label'], /Open support menu/);
 assert.equal(r.button.props.children[1].props.children, 'Support');
 assert.equal(r.button.props.children[1].props.className, 'sr-only');
 r.button.props.onClick({ detail: 0 });
 assert.equal(r.states[1], 'expanded');
 r = render(mode);
 let prevented = false;
 r.button.props.onKeyDown({ key: 'ArrowRight', preventDefault: () => prevented = true });
 assert.ok(prevented); assert.equal(r.states[3].x, 1116);
 for (const shouldDrag of [false, true]) {
  r = render(mode); const button = target();
  r.button.props.onPointerDown({ button: 0, pointerId: 1, clientX: 10, clientY: 10, currentTarget: button });
  if (shouldDrag) r.button.props.onPointerMove({ pointerId: 1, clientX: 70, clientY: 20, currentTarget: button });
  r.button.props.onPointerUp(); r.button.props.onClick({ detail: 1 });
  assert.equal(r.states[1], shouldDrag ? mode : 'expanded');
  if (shouldDrag) assert.equal(r.states[3].x, 1160);
  assert.equal(button.properties.size, 0, 'drag must not tilt');
 }
 r = render(mode); const button = target();
 const pointer = { pointerType: 'mouse', clientX: 48, clientY: 48, currentTarget: button };
 r.button.props.onPointerMove(pointer);
 assert.equal(button.properties.get('--support-rotate-x'), '-12deg');
 assert.equal(button.properties.get('--support-rotate-y'), '12deg');
 assert.equal(r.changes.length, 0, 'hover must not trigger React state updates');
 r.button.props.onPointerMove({ ...pointer, clientX: 200, clientY: 200 });
 assert.equal(button.properties.get('--support-rotate-y'), '12deg', 'tilt is bounded');
 r.button.props.onPointerLeave({ currentTarget: button }); assert.equal(button.properties.size, 0);
 for (const pointerType of ['touch', 'pen']) {
  r.button.props.onPointerMove({ ...pointer, pointerType }); assert.equal(button.properties.size, 0);
 }
 reduced = true; r.button.props.onPointerMove(pointer); assert.equal(button.properties.size, 0); reduced = false;
 fine = false; r.button.props.onPointerMove(pointer); assert.equal(button.properties.size, 0); fine = true;
 r.button.props.onPointerMove(pointer);
 r.button.props.onPointerCancel({ currentTarget: button }); assert.equal(button.properties.size, 0);
}
console.log('PASS: compact support, tap/keyboard/drag, bounded 3D pointer tilt, reset on leave/cancel, no hover state updates, touch/coarse-pointer and reduced-motion exclusions. Controlled component fixtures.');
