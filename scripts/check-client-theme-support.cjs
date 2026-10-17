const fs=require('node:fs'),assert=require('node:assert/strict');
const ts=require('typescript');
const code=ts.transpileModule(fs.readFileSync('features/activity/components/CustomerActivityDock.tsx','utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const listeners = new Map(), frames = new Map(); let nextFrame = 1;
const mediaListeners = new Set(); let reduced = false, fine = true;
global.window = {
 innerWidth: 1280, innerHeight: 800,
 addEventListener: (name, callback) => listeners.set(name, callback),
 removeEventListener: name => listeners.delete(name),
 requestAnimationFrame: callback => { const id = nextFrame++; frames.set(id, callback); return id; },
 cancelAnimationFrame: id => frames.delete(id),
 matchMedia: query => ({ get matches() { return query.includes('reduced-motion') ? reduced : fine; }, addEventListener: (_, f) => mediaListeners.add(f), removeEventListener: (_, f) => mediaListeners.delete(f) }),
};
global.document = { hidden: false, documentElement: { style: { getPropertyValue: () => '' } }, addEventListener() {}, removeEventListener() {} };
const flush = () => { const pending = [...frames.values()]; frames.clear(); pending.forEach(f => f()); };
const icon=()=>null,jsx=(type,props)=>({type,props});
function render(mode){
 const states=[{accountKey:'owner',counts:{}},mode,'expanded',{x:1100,y:500},null,''];let index=0;
 const effects=[],changes=[],react={useState:(initial)=>{const i=index++;return [states[i]??initial,value=>{states[i]=typeof value==='function'?value(states[i]):value;changes.push([i,states[i]])}]},useRef:v=>({current:v}),useEffect:f=>effects.push(f),useCallback:f=>f};
 const stubs={'react':react,'react/jsx-runtime':{jsx,jsxs:jsx,Fragment:'fragment'},'next/navigation':{usePathname:()=>'/dashboard/projects/project-owned'},'lucide-react':new Proxy({},{get:()=>icon}),'@/features/client/components/projects/ProjectSupportBubble':{ProjectSupportBubble:icon},'./CustomerMobileNavigation':{CustomerMobileNavigation:icon},'./CustomerActivityDock.module.css':new Proxy({},{get:(_,key)=>key==='__esModule'?false:key})};
 const module={exports:{}};new Function('require','module','exports',code)(name=>{if(!(name in stubs))throw Error(name);return stubs[name]},module,module.exports);
 const tree=module.exports.CustomerActivityDock();const aside=tree.props.children[1];aside.props.ref.current={offsetWidth:48,offsetHeight:48};
 return {aside,button:aside.props.children,states,changes,effects};
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
for (const mode of ['collapsed', 'hidden']) {
 let r = render(mode);
 assert.equal(r.button.props.children[1].props.children, 'Support');
 assert.equal(r.button.props.children[1].props.className, 'sr-only');
 r.button.props.onClick({ detail: 0 }); assert.equal(r.states[1], 'expanded');
 for (const shouldDrag of [false, true]) {
  r = render(mode); const button = target();
  r.button.props.onPointerDown({ button: 0, pointerId: 1, clientX: 10, clientY: 10, currentTarget: button });
  if (shouldDrag) r.button.props.onPointerMove({ pointerId: 1, clientX: 70, clientY: 20, currentTarget: button });
  r.button.props.onPointerUp(); r.button.props.onClick({ detail: 1 });
  assert.equal(r.states[1], shouldDrag ? mode : 'expanded');
  if (shouldDrag) assert.equal(r.states[3].x, 1160);
 }
 r = render(mode); const button = target(); r.button.props.ref.current = button;
 const cleanup = r.effects[0]();
 const pointer = { pointerType: 'mouse', clientX: 1280, clientY: 800 };
 listeners.get('pointermove')(pointer); listeners.get('pointermove')(pointer);
 assert.equal(frames.size, 1, 'page mouse moves share one animation frame'); flush();
 assert.equal(button.properties.get('--support-rotate-x'), '-28deg');
 assert.equal(button.properties.get('--support-rotate-y'), '28deg');
 assert.equal(r.changes.length, 0, 'page motion must not update React state');
 listeners.get('pointerout')({ relatedTarget: null }); assert.equal(button.properties.size, 0);
 for (const pointerType of ['touch', 'pen']) { listeners.get('pointermove')({ ...pointer, pointerType }); flush(); assert.equal(button.properties.size, 0); }
 reduced = true; listeners.get('pointermove')(pointer); flush(); assert.equal(button.properties.size, 0); reduced = false;
 fine = false; listeners.get('pointermove')(pointer); flush(); assert.equal(button.properties.size, 0); fine = true;
 listeners.get('pointermove')(pointer); flush(); listeners.get('blur')(); assert.equal(button.properties.size, 0);
 listeners.get('pointermove')(pointer);
 r.button.props.onPointerDown({ button: 0, pointerId: 1, clientX: 10, clientY: 10, currentTarget: button }); flush(); assert.equal(button.properties.size, 0, 'drag pauses page tilt');
 r.button.props.onPointerUp();
 let prevented = false; r.button.props.onKeyDown({ key: 'ArrowRight', preventDefault: () => prevented = true }); assert.ok(prevented);
 listeners.get('pointermove')(pointer); cleanup(); assert.equal(frames.size, 0); assert.equal(listeners.size, 0); assert.equal(mediaListeners.size, 0);
}
console.log('PASS: page-wide 3D pointer following, one animation frame per update, compact size, drag and keyboard controls, cleanup, touch/coarse/reduced-motion exclusions. Controlled fixtures.');
