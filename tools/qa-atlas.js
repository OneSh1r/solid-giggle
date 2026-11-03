/* Headless Chrome smoke test using the DevTools protocol.
   No npm dependencies. Run after building the assignment cases. */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const INDEX = path.join(ROOT, 'index.html');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9337;
const PROFILE = path.join(os.tmpdir(), 'atlas-qa-' + Date.now());

function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function getJson(url, opts) {
  const r = await fetch(url, opts);
  if (!r.ok) throw new Error(url + ': HTTP ' + r.status);
  return r.json();
}

async function main() {
  const chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--allow-file-access-from-files',
    '--remote-debugging-port=' + PORT, '--user-data-dir=' + PROFILE, 'about:blank'
  ], { stdio: 'ignore', windowsHide: true });

  try {
    let ready = false;
    for (let i = 0; i < 30; i++) {
      try {
        await getJson('http://127.0.0.1:' + PORT + '/json/version');
        ready = true;
        break;
      } catch (e) {
        await wait(150);
      }
    }
    if (!ready) throw new Error('Chrome DevTools port did not open');

    const tab = await getJson('http://127.0.0.1:' + PORT + '/json/new?about:blank', { method: 'PUT' });
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let seq = 0;
    const pending = new Map();
    const exceptions = [];
    ws.onmessage = (event) => {
      const m = JSON.parse(event.data);
      if (m.id && pending.has(m.id)) {
        const p = pending.get(m.id);
        pending.delete(m.id);
        if (m.error) p.reject(new Error(m.error.message));
        else p.resolve(m.result);
      }
      if (m.method === 'Runtime.exceptionThrown') {
        exceptions.push(m.params.exceptionDetails.text + ': ' +
          (m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description || ''));
      }
    };
    function cdp(method, params) {
      const id = ++seq;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params: params || {} }));
      });
    }
    async function evaluate(expression) {
      const r = await cdp('Runtime.evaluate', {
        expression,
        awaitPromise: true,
        returnByValue: true,
        userGesture: true
      });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
      return r.result.value;
    }
    async function navigate(url) {
      await cdp('Page.navigate', { url });
      await wait(650);
    }

    await cdp('Page.enable');
    await cdp('Runtime.enable');
    await cdp('DOM.enable');
    const indexUrl = new URL('file:///' + INDEX.replace(/\\/g, '/')).href;
    await navigate(indexUrl + '#/');
    await wait(900);

    const cases = [
      ['e1', 'eor-fracture-opt'],
      ['e2', 'eor-fracture-geometry'],
      ['e3', 'eor-chemical-screening'],
      ['e4', 'eor-steam-cycle'],
      ['e5', 'eor-microbe-activity'],
      ['w3', 'welllog-fracture-vision'],
      ['w5', 'welllog-data-repair'],
      ['d2', 'drilling-kick-early-warning'],
      ['t1', 'transport-leak-detection']
    ];

    const summary = await evaluate(`(() => ({
      registered: Cases.list().length,
      withDemo: Cases.list().filter(c => c.tabs && c.tabs.demo).length,
      requested: ${JSON.stringify(cases.map((x) => x[1]))},
      missing: ${JSON.stringify(cases.map((x) => x[1]))}.filter(id => !Cases.get(id)),
      stats: Cases.stats(),
      atlas: ATLAS.stats()
    }))()`);

    const results = [];
    for (const [scene, id] of cases) {
      await evaluate(`location.hash='#/scene/${scene}?tab=demo&case=${id}'`);
      await wait(360);
      const result = await evaluate(`(() => {
        const root = document.getElementById('case-demo-root');
        const ranges = root ? [...root.querySelectorAll('input[type=range]')] : [];
        const before = root ? root.innerText : '';
        if (ranges.length) {
          const input = ranges[0];
          input.value = input.max;
          input.dispatchEvent(new Event('input', {bubbles:true}));
        }
        const after = root ? root.innerText : '';
        return {
          id: '${id}',
          hasDemo: !!root && !!root.querySelector('.ad-demo'),
          metrics: root ? root.querySelectorAll('.ad-metric').length : 0,
          ranges: ranges.length,
          changed: before !== after,
          errorText: root ? /失败|未注册/.test(root.innerText) : false
        };
      })()`);
      results.push(result);
    }

    /* Validate every manifest against the live ATLAS scene ids and contract. */
    const packRoot = path.join(ROOT, 'submission', '案例包');
    const folders = fs.readdirSync(packRoot, { withFileTypes: true })
      .filter((d) => d.isDirectory()).map((d) => d.name);
    const packChecks = [];
    for (const folder of folders) {
      const file = path.join(packRoot, folder, 'case.json');
      const m = JSON.parse(fs.readFileSync(file, 'utf8'));
      const valid = !!m.id && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(m.id) &&
        !!m.sceneId && !!m.tabs && !!m.tabs.background && !!m.tabs.workflow &&
        m.tabs.background.sections.length === 4 && m.tabs.workflow.steps.length === 4 &&
        m.tabs.workflow.steps.every((s) => !!s.visual);
      packChecks.push({ folder, id: m.id, sceneId: m.sceneId, valid });
    }

    /* Exercise the real file input with one generated package. */
    await navigate(indexUrl + '#/cases');
    await wait(500);
    await evaluate(`document.querySelector('[data-import]').click()`);
    await wait(200);
    const doc = await cdp('DOM.getDocument', { depth: -1, pierce: true });
    const q = await cdp('DOM.querySelector', { nodeId: doc.root.nodeId, selector: '#imp-file' });
    const sampleDir = path.join(packRoot, folders[0]);
    const files = [
      path.join(sampleDir, 'case.json'),
      path.join(sampleDir, 'demo', 'index.html'),
      path.join(sampleDir, 'demo', 'demo.css'),
      path.join(sampleDir, 'demo', 'demo.js')
    ];
    await cdp('DOM.setFileInputFiles', { nodeId: q.nodeId, files });
    await wait(1200);
    const importState = await evaluate(`(() => ({
      title: document.querySelector('#imp-title-in') && document.querySelector('#imp-title-in').value,
      scene: document.querySelector('#imp-scene') && document.querySelector('#imp-scene').value,
      errors: [...document.querySelectorAll('[data-lvl="error"], .res-error')].filter(x=>x.offsetParent!==null).length,
      summary: (document.querySelector('#imp-summary')||{}).innerText || '',
      fileRows: document.querySelectorAll('#imp-list [data-del]').length
    }))()`);

    const failedDemos = results.filter((r) => !r.hasDemo || r.metrics !== 4 || r.errorText);
    const failedPacks = packChecks.filter((p) => !p.valid);
    const report = { summary, results, packChecks, importState, exceptions, failedDemos, failedPacks };
    const out = path.join(ROOT, 'submission', 'qa', 'qa-report.json');
    fs.writeFileSync(out, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    if (summary.missing.length || failedDemos.length || failedPacks.length ||
        exceptions.length || importState.fileRows < 4) process.exitCode = 1;
    ws.close();
  } finally {
    chrome.kill();
    await wait(350);
    try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (e) {}
  }
}

main().catch((e) => {
  console.error(e.stack || e.message);
  process.exit(2);
});
