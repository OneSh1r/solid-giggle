/* Upload every generated case folder to an untouched copy of the original
   framework, exercising the real file input and commit button. */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const BASE = path.join(ROOT, 'submission', 'qa', 'clean-base', 'index.html');
const PACK_ROOT = path.join(ROOT, 'submission', '案例包');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9341;
const PROFILE = path.join(os.tmpdir(), 'atlas-import-' + Date.now());
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function json(url, opts) {
  const r = await fetch(url, opts);
  if (!r.ok) throw new Error('HTTP ' + r.status + ': ' + url);
  return r.json();
}

async function main() {
  const chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--allow-file-access-from-files',
    '--remote-debugging-port=' + PORT, '--user-data-dir=' + PROFILE, 'about:blank'
  ], { stdio: 'ignore', windowsHide: true });
  try {
    for (let i = 0; i < 30; i++) {
      try { await json('http://127.0.0.1:' + PORT + '/json/version'); break; }
      catch (e) { await wait(150); }
    }
    const tab = await json('http://127.0.0.1:' + PORT + '/json/new?about:blank', { method: 'PUT' });
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((ok, no) => { ws.onopen = ok; ws.onerror = no; });
    let seq = 0;
    const pending = new Map();
    const exceptions = [];
    ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && pending.has(m.id)) {
        const p = pending.get(m.id);
        pending.delete(m.id);
        m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result);
      }
      if (m.method === 'Runtime.exceptionThrown') exceptions.push(m.params.exceptionDetails.text);
    };
    const cdp = (method, params) => new Promise((resolve, reject) => {
      const id = ++seq;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params: params || {} }));
    });
    const evalJs = async (expression) => {
      const r = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
      return r.result.value;
    };
    await cdp('Page.enable');
    await cdp('Runtime.enable');
    await cdp('DOM.enable');
    const indexUrl = new URL('file:///' + BASE.replace(/\\/g, '/')).href;

    const folders = fs.readdirSync(PACK_ROOT, { withFileTypes: true })
      .filter((d) => d.isDirectory()).map((d) => d.name);
    const results = [];
    for (const folder of folders) {
      await cdp('Page.navigate', { url: indexUrl + '#/' });
      await wait(700);
      await evalJs('localStorage.clear(); location.reload()');
      await wait(800);
      const manifest = JSON.parse(fs.readFileSync(path.join(PACK_ROOT, folder, 'case.json'), 'utf8'));
      await evalJs("document.querySelector('[data-import]').click()");
      await wait(170);
      const doc = await cdp('DOM.getDocument', { depth: -1, pierce: true });
      const q = await cdp('DOM.querySelector', { nodeId: doc.root.nodeId, selector: '#imp-file' });
      const dir = path.join(PACK_ROOT, folder);
      await cdp('DOM.setFileInputFiles', {
        nodeId: q.nodeId,
        files: ['case.json', 'demo/index.html', 'demo/demo.css', 'demo/demo.js'].map((f) => path.join(dir, f))
      });
      await wait(900);
      const before = await evalJs(`(() => ({
        title: document.querySelector('#imp-title-in').value,
        fileRows: document.querySelectorAll('#imp-list [data-del]').length,
        disabled: document.querySelector('#imp-ok').disabled
      }))()`);
      await evalJs("document.querySelector('#imp-ok').click()");
      await wait(1000);
      const after = await evalJs(`(() => {
        const c = Cases.get('${manifest.id}');
        return {
          registered: !!c,
          imported: !!(c && c.imported),
          demo: !!(c && c.tabs && c.tabs.demo && typeof c.tabs.demo.mount === 'function'),
          scene: location.hash
        };
      })()`);
      results.push({ folder, id: manifest.id, before, after });
    }
    const report = { base: BASE, results, exceptions, allPassed: results.every((r) => r.after.registered && r.after.imported && r.after.demo) && exceptions.length === 0 };
    fs.writeFileSync(path.join(ROOT, 'submission', 'qa', 'import-clean-report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    if (!report.allPassed) process.exitCode = 1;
    ws.close();
  } finally {
    chrome.kill();
    await wait(300);
    try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (e) {}
  }
}

main().catch((e) => { console.error(e.stack || e.message); process.exit(2); });
