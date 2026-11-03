/* =========================================================
   Assignment interactive demos
   One runtime is shared by the built-in site and every standalone
   case package. Each demo is a deterministic, front-end-only sandbox.
   ========================================================= */
(function (global) {
  'use strict';

  var ROOTS = [];

  var CSS = [
    '.ad-demo{--ad-ink:#213033;--ad-ink2:#536267;--ad-muted:#7d898c;--ad-line:#e4e0d5;',
    '--ad-paper:#fbfaf6;--ad-panel:#fff;--ad-jade:#2f7d6b;--ad-jade-soft:#e7f2ed;',
    '--ad-clay:#b46d3b;--ad-clay-soft:#f8ecdf;--ad-blue:#41699b;--ad-blue-soft:#e9eff8;',
    '--ad-red:#b0574e;--ad-red-soft:#faece8;--ad-yellow:#d1a23f;',
    'font-family:"Inter","PingFang SC","Microsoft YaHei",system-ui,sans-serif;color:var(--ad-ink);',
    'background:var(--ad-paper);font-size:13px;line-height:1.68;border:1px solid var(--ad-line);',
    'border-radius:12px;overflow:hidden}',
    '.ad-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;padding:18px 20px 14px;',
    'border-bottom:1px solid var(--ad-line);background:linear-gradient(135deg,#fff 0%,#f7faf8 100%)}',
    '.ad-kicker{font:10px/1.2 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.13em;color:var(--ad-jade)}',
    '.ad-head h3{margin:7px 0 4px;font-size:18px;line-height:1.35}',
    '.ad-head p{margin:0;color:var(--ad-ink2);max-width:720px;font-size:12.5px}',
    '.ad-badge{flex:none;border:1px solid rgba(47,125,107,.23);background:var(--ad-jade-soft);color:var(--ad-jade);',
    'border-radius:999px;padding:5px 9px;font:10px/1 ui-monospace,monospace;letter-spacing:.04em}',
    '.ad-controls{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;padding:13px 20px;',
    'border-bottom:1px solid var(--ad-line);background:#f6f4ed}',
    '.ad-ctl{display:grid;grid-template-columns:1fr auto;gap:3px 9px;align-items:center;',
    'font-size:11.5px;color:var(--ad-ink2);min-width:0}',
    '.ad-ctl output{font:11px/1 ui-monospace,monospace;color:var(--ad-jade);font-weight:700}',
    '.ad-ctl input{grid-column:1/-1;width:100%;accent-color:var(--ad-jade);margin:0}',
    '.ad-layout{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(210px,.75fr)}',
    '.ad-chart{padding:16px 18px 17px;min-width:0;background:var(--ad-panel)}',
    '.ad-side{padding:14px 16px;border-left:1px solid var(--ad-line);display:flex;flex-direction:column;gap:10px}',
    '.ad-title{display:flex;justify-content:space-between;gap:12px;align-items:baseline;margin-bottom:7px}',
    '.ad-title b{font-size:12.5px}.ad-title span{font:9.5px/1.3 ui-monospace,monospace;color:var(--ad-muted)}',
    '.ad-chart svg{display:block;width:100%;height:auto;overflow:visible}',
    '.ad-metrics{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--ad-line);',
    'border:1px solid var(--ad-line);border-radius:8px;overflow:hidden}',
    '.ad-metric{background:#fff;padding:9px 10px;min-width:0}',
    '.ad-metric span{display:block;font-size:9px;letter-spacing:.08em;color:var(--ad-muted)}',
    '.ad-metric b{display:block;margin-top:2px;font:16px/1.25 ui-monospace,monospace;color:var(--ad-ink)}',
    '.ad-metric b.good{color:var(--ad-jade)}.ad-metric b.bad{color:var(--ad-red)}',
    '.ad-metric em{font-style:normal;font-size:9px;color:var(--ad-muted);margin-left:3px}',
    '.ad-note{border-left:3px solid var(--ad-clay);background:var(--ad-clay-soft);padding:9px 11px;',
    'font-size:11px;line-height:1.7;color:#6c513c}',
    '.ad-note.good{border-color:var(--ad-jade);background:var(--ad-jade-soft);color:#356354}',
    '.ad-note b{font-weight:700}',
    '.ad-rank{border-top:1px solid var(--ad-line);padding-top:9px}',
    '.ad-rank h4{margin:0 0 5px;font-size:10px;color:var(--ad-muted);font-weight:500;letter-spacing:.08em}',
    '.ad-rank ol{list-style:none;margin:0;padding:0;counter-reset:r}',
    '.ad-rank li{counter-increment:r;display:grid;grid-template-columns:18px 1fr auto;gap:6px;align-items:center;',
    'padding:5px 0;border-bottom:1px solid #efede6;font-size:10.5px}',
    '.ad-rank li:last-child{border-bottom:0}',
    '.ad-rank li:before{content:counter(r,decimal-leading-zero);font:8.5px/1 ui-monospace,monospace;color:var(--ad-muted)}',
    '.ad-rank li span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.ad-rank li b{font:10px/1 ui-monospace,monospace;color:var(--ad-jade)}',
    '.ad-seg{display:inline-flex;border:1px solid var(--ad-line);border-radius:7px;overflow:hidden;background:#fff}',
    '.ad-seg button{border:0;border-right:1px solid var(--ad-line);background:transparent;color:var(--ad-ink2);',
    'padding:6px 9px;font:10px/1.2 inherit;cursor:pointer}.ad-seg button:last-child{border-right:0}',
    '.ad-seg button.on{background:var(--ad-jade);color:#fff}',
    '.ad-timeline{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:8px}',
    '.ad-timeline div{background:#fff;border:1px solid var(--ad-line);border-radius:7px;padding:7px 9px}',
    '.ad-timeline b{display:block;font-size:10px;color:var(--ad-ink)}',
    '.ad-timeline span{display:block;font:9px/1.4 ui-monospace,monospace;color:var(--ad-muted);margin-top:2px}',
    '.ad-foot{display:flex;justify-content:space-between;gap:12px;padding:8px 20px 10px;border-top:1px solid var(--ad-line);',
    'font-size:9.5px;color:var(--ad-muted);background:#f8f7f2}',
    '@media(max-width:720px){.ad-layout{grid-template-columns:1fr}.ad-side{border-left:0;border-top:1px solid var(--ad-line)}',
    '.ad-metrics{grid-template-columns:repeat(2,1fr)}.ad-head{padding:15px 15px 12px}.ad-controls{padding:12px 15px}',
    '.ad-chart{padding:13px 12px}.ad-side{padding:12px 15px}.ad-foot{padding:8px 15px}}'
  ].join('');

  function installStyle(doc) {
    if (!doc || doc.getElementById('assignment-demo-style')) return;
    var s = doc.createElement('style');
    s.id = 'assignment-demo-style';
    s.textContent = CSS;
    (doc.head || doc.documentElement).appendChild(s);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function fmt(v, n) { return Number(v).toFixed(n == null ? 1 : n); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function linePath(pts) {
    return pts.map(function (p, i) { return (i ? 'L' : 'M') + fmt(p[0], 1) + ' ' + fmt(p[1], 1); }).join(' ');
  }
  function scale(v, d0, d1, r0, r1) { return r0 + (clamp(v, d0, d1) - d0) / (d1 - d0) * (r1 - r0); }
  function gridLines(x0, y0, w, h, xs, ys, xfmt, yfmt) {
    var out = '';
    (ys || []).forEach(function (v) {
      var y = scale(v, ys[0], ys[ys.length - 1], y0 + h, y0);
      out += '<line x1="' + x0 + '" y1="' + fmt(y, 1) + '" x2="' + (x0 + w) + '" y2="' + fmt(y, 1) +
        '" stroke="#e7e4dc" stroke-width="1"/>';
      out += '<text x="' + (x0 - 7) + '" y="' + fmt(y + 3, 1) + '" text-anchor="end" ' +
        'font-size="9" fill="#7d898c" font-family="monospace">' + (yfmt ? yfmt(v) : v) + '</text>';
    });
    (xs || []).forEach(function (v) {
      var x = scale(v, xs[0], xs[xs.length - 1], x0, x0 + w);
      out += '<line x1="' + fmt(x, 1) + '" y1="' + y0 + '" x2="' + fmt(x, 1) + '" y2="' + (y0 + h) +
        '" stroke="#efede6" stroke-width="1"/>';
      out += '<text x="' + fmt(x, 1) + '" y="' + (y0 + h + 14) + '" text-anchor="middle" ' +
        'font-size="9" fill="#7d898c" font-family="monospace">' + (xfmt ? xfmt(v) : v) + '</text>';
    });
    return out;
  }
  function shell(root, opt) {
    installStyle(root.ownerDocument);
    root.innerHTML =
      '<div class="ad-demo">' +
      '<div class="ad-head"><div><span class="ad-kicker">' + esc(opt.kicker || 'INTERACTIVE SANDBOX') + '</span>' +
      '<h3>' + esc(opt.title) + '</h3><p>' + esc(opt.lead) + '</p></div>' +
      '<span class="ad-badge">' + esc(opt.badge || '纯前端 · 合成数据') + '</span></div>' +
      '<div class="ad-controls">' + (opt.controls || '') + '</div>' +
      '<div class="ad-layout"><div class="ad-chart"><div class="ad-title"><b>' + esc(opt.chartTitle) +
      '</b><span>' + esc(opt.chartHint || '拖动参数，图形会同步更新') + '</span></div>' +
      '<div class="ad-chartbox"></div></div><div class="ad-side">' +
      '<div class="ad-metrics"></div><div class="ad-note">' + (opt.note || '') + '</div>' +
      (opt.rankTitle ? '<div class="ad-rank"><h4>' + esc(opt.rankTitle) +
        '</h4><ol class="ad-rank-list"></ol></div>' : '') + '</div></div>' +
      '<div class="ad-foot"><span>' + esc(opt.foot || '数据为教学合成，不用于工程决策。') +
      '</span><span id="ad-live" aria-live="polite">参数已就绪</span></div></div>';
    return {
      chart: root.querySelector('.ad-chartbox'),
      metrics: root.querySelector('.ad-metrics'),
      note: root.querySelector('.ad-note'),
      rank: root.querySelector('.ad-rank-list'),
      live: root.querySelector('#ad-live')
    };
  }
  function slider(id, label, min, max, step, value) {
    return '<label class="ad-ctl"><span>' + esc(label) + '</span><output id="' + id + '-v">' +
      esc(value) + '</output><input type="range" id="' + id + '" min="' + min + '" max="' + max +
      '" step="' + step + '" value="' + value + '"></label>';
  }
  function metric(label, value, unit, cls) {
    return '<div class="ad-metric"><span>' + esc(label) + '</span><b class="' + (cls || '') + '">' +
      esc(value) + (unit ? '<em>' + esc(unit) + '</em>' : '') + '</b></div>';
  }
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ t >>> 15, 1 | t);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /* ---------------------------------------------------------
     E1 压裂参数优化
     --------------------------------------------------------- */
  function e1(root) {
    var ui = shell(root, {
      title: '从 96 组候选压裂方案中寻找“增产—风险”平衡点',
      lead: '代理模型把地质与施工参数映射为改造体积和加砂风险，贝叶斯优化只评估最有希望的组合，再用人工复核决定是否入井。',
      controls: slider('e1-b', '脆性指数', 40, 80, 1, 61) + slider('e1-s', '水平应力差', 2, 12, .5, 7.5) +
        slider('e1-r', '峰值排量', 8, 18, .5, 13) + slider('e1-w', '增产目标权重', 0, 100, 5, 72),
      chartTitle: '候选方案的代理模型响应',
      chartHint: '横轴：改造体积指数 · 纵轴：加砂风险指数',
      note: '圆点是模拟器生成的候选方案，绿线是帕累托前沿。权重向右移动时，推荐方案会更愿意用风险换取产量。',
      rankTitle: '推荐方案前三',
      badge: 'OPT · 代理模型'
    });
    var rand = rng(11102026);
    var pts = [];
    for (var i = 0; i < 96; i++) {
      var srv = 48 + rand() * 62;
      var risk = 5 + Math.pow(rand(), .78) * 39;
      pts.push({ srv: srv, risk: risk, id: i });
    }
    ['e1-b', 'e1-s', 'e1-r', 'e1-w'].forEach(function (id) {
      root.querySelector('#' + id).addEventListener('input', draw);
    });
    function draw() {
      var b = +root.querySelector('#e1-b').value;
      var s = +root.querySelector('#e1-s').value;
      var r = +root.querySelector('#e1-r').value;
      var w = +root.querySelector('#e1-w').value / 100;
      root.querySelector('#e1-b-v').textContent = b;
      root.querySelector('#e1-s-v').textContent = fmt(s, 1) + ' MPa';
      root.querySelector('#e1-r-v').textContent = fmt(r, 1) + ' m³/min';
      root.querySelector('#e1-w-v').textContent = fmt(w * 100, 0) + '%';

      var scored = pts.map(function (p) {
        var srvAdj = p.srv + (b - 60) * .34 - Math.abs(s - 7.5) * .85 + (r - 13) * .55;
        var riskAdj = p.risk + Math.max(0, r - 15) * 2.2 + Math.max(0, s - 10) * 1.4;
        var objective = w * (srvAdj / 110) + (1 - w) * (1 - riskAdj / 55);
        return { x: srvAdj, y: riskAdj, obj: objective, id: p.id };
      });
      var best = scored.reduce(function (a, p) { return p.obj > a.obj ? p : a; });
      var sorted = scored.slice().sort(function (a, b) { return b.obj - a.obj; }).slice(0, 3);
      var pareto = scored.filter(function (p) {
        return !scored.some(function (q) { return q.x >= p.x && q.y <= p.y && (q.x > p.x || q.y < p.y); });
      }).sort(function (a, b) { return a.x - b.x; });
      var W = 660, H = 330, L = 54, R = 18, T = 18, B = 42, pw = W - L - R, ph = H - T - B;
      var xx = function (v) { return scale(v, 35, 125, L, L + pw); };
      var yy = function (v) { return scale(v, 0, 55, H - B, T); };
      var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="压裂候选方案散点图">';
      svg += gridLines(L, T, pw, ph, [40, 60, 80, 100, 120], [0, 15, 30, 45], function (v) { return v; }, function (v) { return v; });
      svg += '<text x="' + (L + pw / 2) + '" y="' + (H - 7) + '" text-anchor="middle" font-size="10" fill="#536267">改造体积指数 →</text>';
      svg += '<text x="12" y="' + (T + ph / 2) + '" text-anchor="middle" font-size="10" fill="#536267" transform="rotate(-90 12 ' + (T + ph / 2) + ')">加砂风险指数 →</text>';
      svg += '<path d="' + linePath(pareto.map(function (p) { return [xx(p.x), yy(p.y)]; })) +
        '" fill="none" stroke="#2f7d6b" stroke-width="1.8" opacity=".75"/>';
      scored.forEach(function (p) {
        var hot = p.obj > best.obj - .035;
        svg += '<circle cx="' + fmt(xx(p.x), 1) + '" cy="' + fmt(yy(p.y), 1) + '" r="' + (hot ? 4 : 2.7) +
          '" fill="' + (hot ? '#b46d3b' : '#41699b') + '" opacity="' + (hot ? '.9' : '.48') + '"/>';
      });
      svg += '<line x1="' + xx(best.x) + '" y1="' + T + '" x2="' + xx(best.x) + '" y2="' + (T + ph) +
        '" stroke="#b46d3b" stroke-dasharray="3 4" opacity=".55"/>';
      svg += '<line x1="' + L + '" y1="' + yy(best.y) + '" x2="' + (L + pw) + '" y2="' + yy(best.y) +
        '" stroke="#b46d3b" stroke-dasharray="3 4" opacity=".55"/>';
      svg += '<circle cx="' + xx(best.x) + '" cy="' + yy(best.y) + '" r="8" fill="none" stroke="#b46d3b" stroke-width="1.5"/>';
      svg += '<text x="' + (xx(best.x) + 12) + '" y="' + (yy(best.y) + 4) + '" font-size="10" fill="#b46d3b" font-weight="700">推荐</text>';
      svg += '<circle cx="' + xx(72) + '" cy="' + yy(28) + '" r="5" fill="#7d898c"/>';
      svg += '<text x="' + (xx(72) + 9) + '" y="' + (yy(28) + 4) + '" font-size="9.5" fill="#7d898c">邻井经验</text></svg>';
      ui.chart.innerHTML = svg;
      var uplift = (best.x / 72 - 1) * 100;
      ui.metrics.innerHTML = metric('预测 90 天增油', (uplift > 0 ? '+' : '') + fmt(uplift, 1), '%', uplift > 5 ? 'good' : 'bad') +
        metric('加砂风险', fmt(best.y, 0), '分', best.y < 22 ? 'good' : 'bad') +
        metric('模拟次数', '96', '组') + metric('方案搜索', '贝叶斯', 'BO');
      ui.rank.innerHTML = sorted.map(function (p) {
        return '<li><span>脆性/应力/排量组合 #' + (p.id + 1) + '</span><b>' + fmt(p.obj * 100, 1) + '</b></li>';
      }).join('');
      ui.live.textContent = '已更新推荐方案';
    }
    draw();
    return function () {};
  }

  /* ---------------------------------------------------------
     E2 裂缝形态预测
     --------------------------------------------------------- */
  function e2(root) {
    var ui = shell(root, {
      title: '用微地震、施工曲线和地质先验共同反演裂缝几何',
      lead: '事件阈值越严格，参与反演的点越少；模型不会只给一条“完美裂缝”，而是保留一条可解释的几何不确定性带。',
      controls: slider('e2-th', '事件可信度门槛', .35, .95, .01, .62) + slider('e2-s', '施工段数', 4, 12, 1, 8),
      chartTitle: '俯视裂缝网络与反演不确定带',
      chartHint: '圆点：微地震事件 · 虚线：替代形态',
      note: '提高门槛会筛掉弱事件，结果更稳但裂缝尖端可能缩短。高质量反演的关键不是“画得更像”，而是知道哪里不确定。',
      rankTitle: '分段改造贡献',
      badge: 'CV + OPT · 多源反演'
    });
    var rand = rng(22026);
    var branches = [];
    for (var b = 0; b < 5; b++) {
      var ang = -1.05 + b * .52;
      var events = [];
      for (var i = 0; i < 18; i++) {
        var t = .08 + i / 18 * .9;
        events.push({
          t: t,
          dx: Math.cos(ang) * t * 210 + (rand() - .5) * 18,
          dy: Math.sin(ang) * t * 125 + (rand() - .5) * 12,
          q: .28 + rand() * .72 * (1 - t * .25)
        });
      }
      branches.push({ ang: ang, events: events });
    }
    ['e2-th', 'e2-s'].forEach(function (id) { root.querySelector('#' + id).addEventListener('input', draw); });
    function draw() {
      var th = +root.querySelector('#e2-th').value;
      var stages = +root.querySelector('#e2-s').value;
      root.querySelector('#e2-th-v').textContent = fmt(th, 2);
      root.querySelector('#e2-s-v').textContent = stages + ' 段';
      var accepted = [];
      branches.forEach(function (br) {
        br.events.forEach(function (e) { if (e.q >= th) accepted.push(e); });
      });
      var coverage = accepted.length / 90;
      var length = 180 + coverage * 95;
      var height = 90 + coverage * 58;
      var W = 660, H = 330, cx = 118, cy = 176;
      var sx = 1.1, sy = 1.05;
      var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="裂缝网络与不确定带">';
      svg += '<rect x="18" y="18" width="624" height="290" rx="10" fill="#f7f5ef" stroke="#e4e0d5"/>';
      for (var gx = 70; gx < 640; gx += 80) svg += '<line x1="' + gx + '" y1="20" x2="' + gx + '" y2="306" stroke="#e7e4dc" stroke-dasharray="2 5"/>';
      for (var gy = 56; gy < 302; gy += 56) svg += '<line x1="20" y1="' + gy + '" x2="640" y2="' + gy + '" stroke="#e7e4dc" stroke-dasharray="2 5"/>';
      branches.forEach(function (br, bi) {
        var pts = br.events.map(function (e) { return [cx + e.dx * sx, cy + e.dy * sy]; });
        svg += '<path d="' + linePath(pts) + '" fill="none" stroke="#d7e7e1" stroke-width="' + (20 + bi * 2) +
          '" stroke-linecap="round" opacity=".72"/>';
        svg += '<path d="' + linePath(pts.slice(0, Math.max(2, Math.floor(pts.length * coverage)))) +
          '" fill="none" stroke="#2f7d6b" stroke-width="2" stroke-linecap="round"/>';
        br.events.forEach(function (e) {
          if (e.q < th) return;
          svg += '<circle cx="' + fmt(cx + e.dx * sx, 1) + '" cy="' + fmt(cy + e.dy * sy, 1) +
            '" r="' + fmt(1.9 + e.q * 2.3, 1) + '" fill="#b46d3b" opacity=".7"/>';
        });
      });
      svg += '<circle cx="' + cx + '" cy="' + cy + '" r="13" fill="#213033" stroke="#fbfaf6" stroke-width="3"/>';
      svg += '<path d="M' + cx + ' ' + cy + ' l-6 0 m6 0 l0 -6" stroke="#fff" stroke-width="2"/>';
      svg += '<text x="' + cx + '" y="' + (cy + 28) + '" text-anchor="middle" font-size="9.5" fill="#536267">压裂井</text>';
      svg += '<path d="M474 58 l40 0 m-8-5 8 5-8 5" stroke="#7d898c" stroke-width="1.3" fill="none"/>';
      svg += '<text x="494" y="50" text-anchor="middle" font-size="9.5" fill="#7d898c">100 m</text>';
      svg += '<text x="26" y="34" font-size="9" fill="#7d898c" font-family="monospace">PLAN VIEW · MICROSEISMIC</text>';
      svg += '<rect x="444" y="246" width="182" height="42" rx="6" fill="#fff" stroke="#e4e0d5"/>';
      svg += '<text x="456" y="262" font-size="9" fill="#7d898c">预测半长 / 半高</text>';
      svg += '<text x="456" y="279" font-size="11" fill="#213033" font-family="monospace">' + fmt(length, 0) + ' m / ' + fmt(height, 0) + ' m</text></svg>';
      ui.chart.innerHTML = svg;
      var estErr = 13 + (1 - coverage) * 36;
      ui.metrics.innerHTML = metric('有效事件', accepted.length, '个', accepted.length > 40 ? 'good' : 'bad') +
        metric('预测半长', fmt(length, 0), 'm') + metric('几何误差', '±' + fmt(estErr, 0), 'm', estErr < 24 ? 'good' : 'bad') +
        metric('已融施工段', stages, '段');
      var contrib = 64 / stages;
      ui.rank.innerHTML = Array.from({ length: Math.min(5, stages) }, function (_, i) {
        var val = contrib * (0.72 + ((i * 7) % 13) / 25);
        return '<li><span>第 ' + (i + 1) + ' 段</span><b>' + fmt(val, 1) + '%</b></li>';
      }).join('');
      ui.live.textContent = '裂缝几何已重算';
    }
    draw();
    return function () {};
  }

  /* ---------------------------------------------------------
     E3 化学驱配方筛选
     --------------------------------------------------------- */
  function e3(root) {
    var ui = shell(root, {
      title: '主动学习把有限的室内实验，优先花在最能消除不确定性的配方上',
      lead: '先建立小样本代理模型，再按“预测性能高、模型不确定”同时兼顾的采集函数挑选下一组实验。每做一组实验，推荐区都会收窄。',
      controls: slider('e3-sal', '矿化度', 2, 20, .5, 9) + slider('e3-temp', '储层温度', 45, 95, 1, 68) +
        slider('e3-poly', '聚合物浓度', 800, 2500, 50, 1600),
      chartTitle: '候选配方：界面张力与驱油效率',
      chartHint: '空心圈：下一组主动学习实验',
      note: '星号是当前代理模型的推荐点，空心圈是主动学习建议验证的配方。两者不一定重合，因为实验首先购买的是“信息”。',
      rankTitle: '优先实验配方',
      badge: 'OPT · 主动学习'
    });
    var rand = rng(32026);
    var formulas = [];
    for (var i = 0; i < 38; i++) {
      formulas.push({
        id: i + 1, ift: .004 + rand() * .16, eff: 42 + rand() * 28,
        unc: .015 + rand() * .06, salt: 3 + rand() * 16, poly: 900 + rand() * 1500
      });
    }
    ['e3-sal', 'e3-temp', 'e3-poly'].forEach(function (id) { root.querySelector('#' + id).addEventListener('input', draw); });
    function draw() {
      var sal = +root.querySelector('#e3-sal').value;
      var temp = +root.querySelector('#e3-temp').value;
      var poly = +root.querySelector('#e3-poly').value;
      root.querySelector('#e3-sal-v').textContent = fmt(sal, 1) + '×';
      root.querySelector('#e3-temp-v').textContent = temp + '°C';
      root.querySelector('#e3-poly-v').textContent = poly + ' mg/L';
      var scored = formulas.map(function (f) {
        var score = f.eff - Math.abs(f.ift - .025) * 95 - Math.max(0, f.salt - sal) * .42 -
          Math.max(0, temp - 75) * .23 - Math.abs(f.poly - poly) / 175;
        return Object.assign({}, f, { score: score, acq: score + f.unc * 190 });
      });
      var best = scored.reduce(function (a, f) { return f.score > a.score ? f : a; });
      var next = scored.reduce(function (a, f) { return f.acq > a.acq ? f : a; });
      var top = scored.slice().sort(function (a, b) { return b.score - a.score; }).slice(0, 3);
      var W = 660, H = 330, L = 54, R = 18, T = 20, B = 42, pw = W - L - R, ph = H - T - B;
      var xx = function (v) { return scale(v, 0, .18, L, L + pw); };
      var yy = function (v) { return scale(v, 36, 75, H - B, T); };
      var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="化学驱配方性能散点图">';
      svg += gridLines(L, T, pw, ph, [0, .04, .08, .12, .16], [40, 50, 60, 70], function (v) { return fmt(v, 2); }, function (v) { return v; });
      svg += '<text x="' + (L + pw / 2) + '" y="' + (H - 7) + '" text-anchor="middle" font-size="10" fill="#536267">界面张力（mN/m，越低越好）←</text>';
      svg += '<text x="12" y="' + (T + ph / 2) + '" text-anchor="middle" font-size="10" fill="#536267" transform="rotate(-90 12 ' + (T + ph / 2) + ')">预测驱油效率（%）</text>';
      scored.forEach(function (f) {
        svg += '<circle cx="' + xx(f.ift) + '" cy="' + yy(f.eff) + '" r="' + fmt(2.6 + f.unc * 20, 1) +
          '" fill="#41699b" opacity=".46"/>';
      });
      svg += '<circle cx="' + xx(best.ift) + '" cy="' + yy(best.eff) + '" r="8" fill="none" stroke="#2f7d6b" stroke-width="1.8"/>';
      svg += '<text x="' + (xx(best.ift) + 11) + '" y="' + (yy(best.eff) + 3) + '" font-size="9.5" fill="#2f7d6b">模型最优</text>';
      svg += '<circle cx="' + xx(next.ift) + '" cy="' + yy(next.eff) + '" r="10" fill="none" stroke="#b46d3b" stroke-width="1.8" stroke-dasharray="3 3"/>';
      svg += '<circle cx="' + xx(next.ift) + '" cy="' + yy(next.eff) + '" r="3" fill="#b46d3b"/>';
      svg += '<text x="' + (xx(next.ift) + 13) + '" y="' + (yy(next.eff) - 8) + '" font-size="9.5" fill="#b46d3b">建议下一组</text></svg>';
      ui.chart.innerHTML = svg;
      var gain = best.eff - 42;
      ui.metrics.innerHTML = metric('推荐配方效率', fmt(best.eff, 1), '%', best.eff > 61 ? 'good' : 'bad') +
        metric('相对基线增量', '+' + fmt(gain, 1), 'pp') + metric('实验已用', '12', '/ 96') +
        metric('不确定性', '±' + fmt(next.unc * 100, 1), '%');
      ui.rank.innerHTML = top.map(function (f) {
        return '<li><span>F-' + String(f.id).padStart(2, '0') + ' · ' + Math.round(f.poly) + ' mg/L</span><b>' + fmt(f.eff, 1) + '</b></li>';
      }).join('');
      ui.live.textContent = '推荐配方已更新';
    }
    draw();
    return function () {};
  }

  /* ---------------------------------------------------------
     E4 蒸汽吞吐周期优化
     --------------------------------------------------------- */
  function e4(root) {
    var ui = shell(root, {
      title: '单周期最优不等于累计最优：把注汽、焖井、采液放在时间轴上比较',
      lead: '时序模型预测多个吞吐周期的产油与油汽比，优化器在热损失、峰值产液与累计增油之间寻找跨周期折中。',
      controls: slider('e4-inj', '周期注汽量', 800, 2000, 50, 1250) + slider('e4-soak', '焖井时间', 2, 10, 1, 5) +
        slider('e4-rate', '初期采液速度', 20, 80, 2, 48),
      chartTitle: '未来 6 个吞吐周期的产油与油汽比',
      chartHint: '柱：周期产油 · 线：累计油汽比',
      note: '焖井太短，热量来不及扩散；采液太快，井底温度下降，后几个周期的产量会被透支。优化目标必须看累计值。',
      rankTitle: '周期贡献',
      badge: 'TS + OPT · 序列优化'
    });
    ['e4-inj', 'e4-soak', 'e4-rate'].forEach(function (id) { root.querySelector('#' + id).addEventListener('input', draw); });
    function draw() {
      var inj = +root.querySelector('#e4-inj').value;
      var soak = +root.querySelector('#e4-soak').value;
      var rate = +root.querySelector('#e4-rate').value;
      root.querySelector('#e4-inj-v').textContent = inj + ' t';
      root.querySelector('#e4-soak-v').textContent = soak + ' d';
      root.querySelector('#e4-rate-v').textContent = rate + ' t/d';
      var oil = [], osr = [], cum = 0, steam = 0;
      for (var i = 0; i < 6; i++) {
        var q = (0.74 + inj / 2600) * (1 - Math.abs(soak - 5) * .045) *
          (1 - Math.abs(rate - 48) / 180) * (1 - i * .055) * 380;
        oil.push(Math.max(70, q));
        cum += q;
        steam += inj * .34;
        osr.push(cum / steam);
      }
      var W = 660, H = 330, L = 56, R = 18, T = 18, B = 44, pw = W - L - R, ph = H - T - B;
      var ymax = Math.max.apply(null, oil) * 1.15;
      var xx = function (i) { return L + (i + .5) * pw / 6; };
      var yy = function (v) { return scale(v, 0, ymax, H - B, T); };
      var yo = function (v) { return scale(v, 0, 1.2, H - B, T); };
      var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="蒸汽吞吐周期产量图">';
      svg += gridLines(L, T, pw, ph, [], [0, ymax / 3, ymax * 2 / 3, ymax], null, function (v) { return fmt(v, 0); });
      oil.forEach(function (v, i) {
        var h = (H - B) - yy(v);
        svg += '<rect x="' + fmt(xx(i) - 18, 1) + '" y="' + fmt(yy(v), 1) + '" width="36" height="' + fmt(h, 1) +
          '" rx="4" fill="#d5e7e0"/>';
        svg += '<text x="' + xx(i) + '" y="' + fmt(yy(v) - 5, 1) + '" text-anchor="middle" font-size="9" fill="#2f7d6b">' + fmt(v, 0) + '</text>';
        svg += '<text x="' + xx(i) + '" y="' + (H - B + 16) + '" text-anchor="middle" font-size="9" fill="#7d898c">周期 ' + (i + 1) + '</text>';
      });
      var op = osr.map(function (v, i) { return [xx(i), yo(v)]; });
      svg += '<path d="' + linePath(op) + '" fill="none" stroke="#b46d3b" stroke-width="1.8"/>';
      op.forEach(function (p) { svg += '<circle cx="' + fmt(p[0], 1) + '" cy="' + fmt(p[1], 1) + '" r="3" fill="#b46d3b"/>'; });
      svg += '<text x="' + (L + 4) + '" y="' + (T + 12) + '" font-size="9.5" fill="#7d898c">柱 / 周期产油（t） · 线 / 累计油汽比</text>';
      svg += '<text x="' + (W - R) + '" y="' + (H - 7) + '" text-anchor="end" font-size="9" fill="#7d898c">模拟工况，非现场预测</text></svg>';
      ui.chart.innerHTML = svg;
      var total = oil.reduce(function (a, b) { return a + b; }, 0);
      ui.metrics.innerHTML = metric('六周期累计产油', fmt(total, 0), 't') +
        metric('累计油汽比', fmt(osr[5], 2), 't/t', osr[5] > .55 ? 'good' : 'bad') +
        metric('热利用率', fmt(100 - Math.abs(soak - 5) * 5 - Math.max(0, 1400 - inj) / 80, 0), '%') +
        metric('推荐策略', '跨周期', '最优');
      ui.rank.innerHTML = oil.map(function (v, i) {
        return '<li><span>周期 ' + (i + 1) + '</span><b>' + fmt(v / total * 100, 1) + '%</b></li>';
      }).slice(0, 4).join('');
      ui.live.textContent = '周期方案已重算';
    }
    draw();
    return function () {};
  }

  /* ---------------------------------------------------------
     E5 微生物活性软测量
     --------------------------------------------------------- */
  function e5(root) {
    var ui = shell(root, {
      title: '把“每周培养一次”的滞后指标，变成可提前决策的菌群活性预测',
      lead: '模型融合营养液、温度、盐度与产液指标，给出菌群活性软测量、未来两周趋势和补注建议；实验室点只用于周期性校准。',
      controls: slider('e5-n', '营养液补给强度', .4, 2, .05, 1.1) + slider('e5-t', '储层温度', 35, 72, 1, 52) +
        slider('e5-sal', '矿化度扰动', 0, 100, 5, 35),
      chartTitle: '菌群活性与增产响应的未来趋势',
      chartHint: '实线：软测量 · 阴影：90% 区间',
      note: '黄线阈值是“需要补注营养”的风险线。预测区间上沿先碰到阈值，就应提前做取样确认，而不是等实验室结果滞后一周。',
      rankTitle: '决策提示',
      badge: 'TS · 小样本软测量'
    });
    ['e5-n', 'e5-t', 'e5-sal'].forEach(function (id) { root.querySelector('#' + id).addEventListener('input', draw); });
    function draw() {
      var nutrient = +root.querySelector('#e5-n').value;
      var temp = +root.querySelector('#e5-t').value;
      var sal = +root.querySelector('#e5-sal').value;
      root.querySelector('#e5-n-v').textContent = fmt(nutrient, 2) + '×';
      root.querySelector('#e5-t-v').textContent = temp + '°C';
      root.querySelector('#e5-sal-v').textContent = sal + '%';
      var W = 660, H = 330, L = 54, R = 18, T = 18, B = 44, pw = W - L - R, ph = H - T - B;
      var xx = function (w) { return scale(w, 0, 20, L, L + pw); };
      var yy = function (v) { return scale(v, .1, 1, H - B, T); };
      var vals = [], lo = [], hi = [], lab = [];
      for (var w = 0; w <= 20; w++) {
        var base = .68 + nutrient * .18 - Math.abs(temp - 52) * .006 - sal * .0016;
        var dip = .22 * Math.exp(-Math.pow((w - 11) / 3.1, 2));
        if (w >= 12) base += (nutrient - .7) * .15 * clamp((w - 12) / 5, 0, 1);
        var a = clamp(base - dip, .16, .96);
        vals.push(a);
        var u = .035 + Math.abs(w - 13) * .004;
        lo.push(a - u);
        hi.push(a + u);
      }
      var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="微生物活性预测时序图">';
      svg += gridLines(L, T, pw, ph, [0, 4, 8, 12, 16, 20], [.2, .4, .6, .8, 1], function (v) { return v + '周'; }, function (v) { return fmt(v, 1); });
      var topBand = [], bottomBand = [];
      for (var i = 0; i < vals.length; i++) {
        topBand.push([xx(i), yy(hi[i])]);
        bottomBand.unshift([xx(i), yy(lo[i])]);
      }
      svg += '<path d="' + linePath(topBand.concat(bottomBand)) + 'Z" fill="#dcece6" opacity=".85"/>';
      svg += '<line x1="' + L + '" y1="' + yy(.42) + '" x2="' + (L + pw) + '" y2="' + yy(.42) +
        '" stroke="#d1a23f" stroke-width="1.3" stroke-dasharray="5 4"/>';
      svg += '<text x="' + (L + 5) + '" y="' + (yy(.42) - 5) + '" font-size="9" fill="#a77d22">补注风险阈值 0.42</text>';
      svg += '<path d="' + linePath(vals.map(function (v, k) { return [xx(k), yy(v)]; })) +
        '" fill="none" stroke="#2f7d6b" stroke-width="2"/>';
      for (var s = 0; s <= 20; s += 2) {
        var obs = vals[s] + ((s * 7) % 9 - 4) * .006;
        svg += '<circle cx="' + xx(s) + '" cy="' + yy(obs) + '" r="2.8" fill="#b46d3b" opacity=".75"/>';
      }
      var target = 12;
      svg += '<line x1="' + xx(target) + '" y1="' + T + '" x2="' + xx(target) + '" y2="' + (T + ph) +
        '" stroke="#41699b" stroke-dasharray="3 4"/>';
      svg += '<text x="' + (xx(target) + 5) + '" y="' + (T + 12) + '" font-size="9.5" fill="#41699b">计划补注窗口</text>';
      svg += '<text x="' + (L + 4) + '" y="' + (T + 12) + '" font-size="9" fill="#7d898c">橙点：每周实验室取样（有滞后）</text></svg>';
      ui.chart.innerHTML = svg;
      var minAt = vals.indexOf(Math.min.apply(null, vals));
      var conf = clamp(.92 - Math.abs(temp - 52) * .004 - sal * .0008, .64, .94);
      ui.metrics.innerHTML = metric('未来最低活性', fmt(vals[minAt], 2), 'AU', vals[minAt] > .42 ? 'good' : 'bad') +
        metric('建议补注', '第 ' + clamp(11 + Math.round((1 - nutrient) * 4), 9, 16) + ' 周') +
        metric('模型置信度', fmt(conf * 100, 0), '%') + metric('预期增油', '+' + fmt(4.8 + nutrient * 3.6, 1), '%');
      ui.rank.innerHTML = [
        ['补给强度', nutrient > 1.4 ? '偏高，注意成本' : nutrient < .8 ? '偏低，活性将下滑' : '处于建议区间'],
        ['温度匹配', Math.abs(temp - 52) < 8 ? '与菌群适宜区间接近' : '偏差较大，需复核'],
        ['取样策略', '第 9 周提前取样一次']
      ].map(function (x) { return '<li><span>' + x[0] + ' · ' + x[1] + '</span><b>→</b></li>'; }).join('');
      ui.live.textContent = '活性趋势已重算';
    }
    draw();
    return function () {};
  }

  /* ---------------------------------------------------------
     W3 成像测井裂缝识别
     --------------------------------------------------------- */
  function w3(root) {
    var ui = shell(root, {
      title: '在井壁展开图上把裂缝从层理和诱导缝中分离出来',
      lead: '分割模型先输出裂缝像素级概率，再结合产状、连续性和岩心标定剔除诱导缝；解释员只需复核低置信度候选。',
      controls: slider('w3-th', '裂缝置信度阈值', .3, .9, .01, .56) + slider('w3-ind', '诱导缝抑制强度', 0, 1, .05, .62),
      chartTitle: '展开井壁图像、裂缝掩膜与产状分布',
      chartHint: '青色：层理 · 橙色：天然裂缝 · 灰色：诱导缝',
      note: '阈值降低时召回更高，但诱导缝和层理也更容易混入。真正可用的结果必须同时看图像、数量和走向分布。',
      rankTitle: '解释员复核队列',
      badge: 'CV · 语义分割'
    });
    ['w3-th', 'w3-ind'].forEach(function (id) { root.querySelector('#' + id).addEventListener('input', draw); });
    function draw() {
      var th = +root.querySelector('#w3-th').value;
      var ind = +root.querySelector('#w3-ind').value;
      root.querySelector('#w3-th-v').textContent = fmt(th, 2);
      root.querySelector('#w3-ind-v').textContent = fmt(ind, 2);
      var W = 660, H = 330, ix = 22, iy = 34, iw = 530, ih = 248;
      var rand = rng(5052026);
      var fr = [];
      for (var i = 0; i < 18; i++) {
        fr.push({ y: 52 + rand() * 220, amp: 3 + rand() * 14, phase: rand() * 6.28,
          q: .32 + rand() * .65, induced: rand() > .76, dip: 20 + rand() * 62 });
      }
      var detected = fr.filter(function (f) { return f.q >= th && !(f.induced && f.q < th + ind * .32); });
      var fp = fr.filter(function (f) { return f.q >= th && f.induced; }).length;
      var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="成像测井裂缝识别图">';
      svg += '<rect x="' + ix + '" y="' + iy + '" width="' + iw + '" height="' + ih + '" rx="5" fill="#263842"/>';
      for (var y = iy + 12; y < iy + ih; y += 20) {
        svg += '<line x1="' + ix + '" y1="' + y + '" x2="' + (ix + iw) + '" y2="' + y + '" stroke="#52717d" opacity=".2"/>';
      }
      for (var bx = 0; bx < 8; bx++) {
        svg += '<text x="' + (ix + bx * 68 + 5) + '" y="' + (iy + ih + 12) + '" font-size="8" fill="#7d898c">' + (bx * 45) + '°</text>';
      }
      fr.forEach(function (f, k) {
        var pts = [];
        for (var x = 0; x <= iw; x += 8) {
          var yy = f.y + Math.sin(x / iw * 6.283 + f.phase) * f.amp;
          pts.push([ix + x, yy]);
        }
        var color = f.induced ? '#9aa5a8' : '#8fd5c0';
        svg += '<path d="' + linePath(pts) + '" fill="none" stroke="' + color + '" stroke-width="' + (1.1 + f.q * 1.2) +
          '" opacity="' + (.42 + f.q * .42) + '"/>';
        if (detected.indexOf(f) >= 0) {
          svg += '<path d="' + linePath(pts) + '" fill="none" stroke="' + (f.induced ? '#7d898c' : '#f0a35f') +
            '" stroke-width="2.2" opacity=".92"/>';
        }
      });
      svg += '<text x="' + (ix + 8) + '" y="' + (iy + 17) + '" fill="#eaf4f1" font-size="9" font-family="monospace">IMAGE LOG · 360° UNWRAP</text>';
      svg += '<text x="' + (ix + iw / 2) + '" y="' + (iy + ih + 27) + '" text-anchor="middle" font-size="9" fill="#7d898c">井周方位 →</text>';
      svg += '<rect x="574" y="42" width="68" height="228" rx="6" fill="#f5f3ec" stroke="#e4e0d5"/>';
      var bins = [0, 0, 0, 0];
      detected.forEach(function (f) { bins[Math.min(3, Math.floor(f.dip / 25))]++; });
      var maxb = Math.max(1, Math.max.apply(null, bins));
      bins.forEach(function (v, k) {
        var h = v / maxb * 54;
        svg += '<rect x="' + (581 + k * 14) + '" y="' + (248 - h) + '" width="9" height="' + h + '" rx="2" fill="#b46d3b" opacity=".7"/>';
        svg += '<text x="' + (585.5 + k * 14) + '" y="' + (262) + '" text-anchor="middle" font-size="7" fill="#7d898c">' + (k * 25 + 15) + '</text>';
      });
      svg += '<text x="608" y="35" text-anchor="middle" font-size="7.5" fill="#7d898c">倾角°</text>';
      svg += '<text x="608" y="290" text-anchor="middle" font-size="8" fill="#536267">玫瑰统计</text></svg>';
      ui.chart.innerHTML = svg;
      var precision = detected.length ? (detected.length - fp) / detected.length : 0;
      ui.metrics.innerHTML = metric('已识别裂缝', detected.length, '条', detected.length >= 10 ? 'good' : 'bad') +
        metric('天然缝精确率', fmt(precision * 100, 0), '%', precision > .8 ? 'good' : 'bad') +
        metric('诱导缝误报', fp, '条', fp < 2 ? 'good' : 'bad') +
        metric('解释工时', fmt(2.8 - detected.length * .05, 1), 'h');
      ui.rank.innerHTML = detected.slice(0, 4).map(function (f, i) {
        return '<li><span>候选 ' + (i + 1) + ' · 倾角 ' + fmt(f.dip, 0) + '°</span><b>' + fmt(f.q, 2) + '</b></li>';
      }).join('');
      ui.live.textContent = '检测掩膜已更新';
    }
    draw();
    return function () {};
  }

  /* ---------------------------------------------------------
     W5 测井数据修复
     --------------------------------------------------------- */
  function w5(root) {
    var ui = shell(root, {
      title: '测井曲线断档修复：不仅补得像，还要和其他曲线物理一致',
      lead: '异常段被遮罩后，普通线性插值只看单条曲线；多曲线生成模型同时利用邻井、GR、DEN 与电阻率，约束补全结果。',
      controls: '<div class="ad-ctl"><span>修复方法</span><span></span><div class="ad-seg">' +
        '<button type="button" data-method="linear">线性插值</button>' +
        '<button type="button" class="on" data-method="multi">多曲线重建</button></div></div>' +
        slider('w5-gap', '缺失段长度', 12, 58, 1, 36),
      chartTitle: '原始曲线、缺失段与修复结果',
      chartHint: '灰线：真实曲线 · 色线：修复结果',
      note: '线性插值在很多井段看起来平滑，但会抹掉薄层；多曲线重建更接近真实结构，也更可能暴露“模型自信但物理异常”的问题。',
      rankTitle: '质量检查',
      badge: 'TS · 序列补全'
    });
    var method = 'multi';
    root.querySelectorAll('[data-method]').forEach(function (b) {
      b.addEventListener('click', function () {
        method = b.getAttribute('data-method');
        root.querySelectorAll('[data-method]').forEach(function (x) { x.classList.toggle('on', x === b); });
        draw();
      });
    });
    root.querySelector('#w5-gap').addEventListener('input', draw);
    function draw() {
      var gap = +root.querySelector('#w5-gap').value;
      root.querySelector('#w5-gap-v').textContent = gap + ' m';
      var W = 660, H = 330, L = 54, R = 18, T = 20, B = 42, pw = W - L - R, ph = H - T - B;
      var N = 120, a = 38, b = a + gap;
      var truth = [], observed = [], pred = [];
      for (var i = 0; i < N; i++) {
        var layered = 0.45 + .18 * Math.sin(i / 8) + .1 * Math.sin(i / 2.8);
        if (i > 68 && i < 77) layered += .27;
        truth.push(layered);
        observed.push(i >= a && i < b ? null : layered + Math.sin(i * 1.7) * .018);
        if (i < a || i >= b) pred.push(null);
        else {
          var li = truth[a - 1] + (truth[b] - truth[a - 1]) * (i - a) / (b - a);
          if (method === 'linear') pred.push(li + Math.sin(i * 2.1) * .007);
          else pred.push(layered + Math.sin(i * 2.1) * .019);
        }
      }
      var xx = function (i) { return L + i / (N - 1) * pw; };
      var yy = function (v) { return scale(v, .1, .9, H - B, T); };
      var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="测井曲线修复图">';
      svg += gridLines(L, T, pw, ph, [0, 20, 40, 60, 80, 100, 120], [.2, .4, .6, .8], function (v) { return v + ' m'; }, function (v) { return fmt(v, 1); });
      svg += '<rect x="' + xx(a) + '" y="' + T + '" width="' + (xx(b) - xx(a)) + '" height="' + ph +
        '" fill="#faece8" opacity=".9"/>';
      svg += '<text x="' + (xx(a) + 5) + '" y="' + (T + 13) + '" font-size="9" fill="#b0574e">缺失/异常段</text>';
      var truthPts = truth.map(function (v, i) { return [xx(i), yy(v)]; });
      svg += '<path d="' + linePath(truthPts) + '" fill="none" stroke="#9ba4a4" stroke-width="1" stroke-dasharray="2 3"/>';
      var obsGroups = [], cur = [];
      observed.forEach(function (v, i) {
        if (v == null) { if (cur.length) { obsGroups.push(cur); cur = []; } return; }
        cur.push([xx(i), yy(v)]);
      });
      if (cur.length) obsGroups.push(cur);
      obsGroups.forEach(function (g) { svg += '<path d="' + linePath(g) + '" fill="none" stroke="#213033" stroke-width="1.4"/>'; });
      var pp = [];
      pred.forEach(function (v, i) { if (v != null) pp.push([xx(i), yy(v)]); });
      svg += '<path d="' + linePath(pp) + '" fill="none" stroke="' + (method === 'multi' ? '#b46d3b' : '#41699b') +
        '" stroke-width="2.1"/>';
      svg += '<circle cx="' + xx(72) + '" cy="' + yy(.72) + '" r="4" fill="' + (method === 'multi' ? '#b46d3b' : '#41699b') + '"/>';
      svg += '<text x="' + (xx(72) + 8) + '" y="' + (yy(.72) - 6) + '" font-size="9" fill="#536267">薄层结构</text>';
      svg += '<text x="' + (L + 3) + '" y="' + (T + 13) + '" font-size="9" fill="#7d898c">GR 相对响应</text></svg>';
      ui.chart.innerHTML = svg;
      var err = method === 'multi' ? 2.8 + gap * .08 : 7.6 + gap * .14;
      var consistency = method === 'multi' ? 92 : 64;
      ui.metrics.innerHTML = metric('深度误差 MAE', '±' + fmt(err, 1), 'API', err < 6 ? 'good' : 'bad') +
        metric('曲线一致性', consistency, '%', consistency > 80 ? 'good' : 'bad') +
        metric('薄层保留', method === 'multi' ? '改善' : '丢失') +
        metric('人工复核', method === 'multi' ? '12 段' : '31 段');
      ui.rank.innerHTML = [
        ['GR', method === 'multi' ? '通过' : '薄层压平'],
        ['DEN', method === 'multi' ? '通过' : '未参与'],
        ['邻井约束', method === 'multi' ? '已启用' : '未启用']
      ].map(function (x) { return '<li><span>' + x[0] + ' · ' + x[1] + '</span><b>' + (x[1] === '通过' || x[1] === '已启用' ? '✓' : '!') + '</b></li>'; }).join('');
      ui.live.textContent = method === 'multi' ? '多曲线重建已启用' : '线性插值已启用';
    }
    draw();
    return function () {};
  }

  /* ---------------------------------------------------------
     D2 井下复杂前兆预警
     --------------------------------------------------------- */
  function d2(root) {
    var ui = shell(root, {
      title: '不是只看一条曲线：多变量时序共同识别卡钻、井漏与气侵的前兆',
      lead: '模型用扭矩、立管压力、返出流量、转速等通道建立正常工况基线，异常分数越过阈值后给出提前预警和触发通道。',
      controls: slider('d2-th', '预警阈值', .3, .95, .01, .62) + slider('d2-noise', '现场噪声强度', .1, 1.2, .05, .42),
      chartTitle: '多通道钻井时序与异常分数',
      chartHint: '虚线：预警阈值 · 红点：异常事件',
      note: '阈值不是越高越安全。过高会漏警，过低会被接单根、开停泵等正常扰动淹没；误报率必须和提前量一起验收。',
      rankTitle: '触发通道排序',
      badge: 'TS · 异常检测'
    });
    ['d2-th', 'd2-noise'].forEach(function (id) { root.querySelector('#' + id).addEventListener('input', draw); });
    function draw() {
      var th = +root.querySelector('#d2-th').value;
      var noise = +root.querySelector('#d2-noise').value;
      root.querySelector('#d2-th-v').textContent = fmt(th, 2);
      root.querySelector('#d2-noise-v').textContent = fmt(noise, 2);
      var rand = rng(7072026), W = 660, H = 330, L = 55, R = 18, T = 22, B = 44, pw = W - L - R, ph = H - T - B;
      var N = 92, chans = [
        { name: '扭矩', color: '#41699b', phase: 0 },
        { name: '立压', color: '#2f7d6b', phase: 1.2 },
        { name: '返出流量', color: '#b46d3b', phase: 2.1 }
      ];
      var series = [], score = [];
      for (var i = 0; i < N; i++) {
        var pre = i > 57 && i < 68 ? Math.exp(-Math.pow((i - 61) / 4, 2)) : 0;
        var row = [];
        chans.forEach(function (c, k) {
          var base = .5 + Math.sin(i / 8 + c.phase) * .05 + (rand() - .5) * .04 * noise;
          var signal = pre * (.22 + k * .05) * (1 + .2 * Math.sin(i));
          row.push(clamp(base + signal + (rand() - .5) * .018, .12, .92));
        });
        series.push(row);
        score.push(clamp(.14 + pre * .82 + Math.abs(row[0] - row[1]) * .55 + (rand() - .5) * .08 * noise, 0, 1));
      }
      var xx = function (i) { return L + i / (N - 1) * pw; };
      var yy = function (v) { return scale(v, 0, 1, H - B, T); };
      var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="井下多变量异常预警图">';
      svg += gridLines(L, T, pw, ph, [0, 20, 40, 60, 80], [0, .2, .4, .6, .8, 1], function (v) { return v; }, function (v) { return fmt(v, 1); });
      chans.forEach(function (c, k) {
        var pts = series.map(function (row, i) { return [xx(i), yy(row[k])]; });
        svg += '<path d="' + linePath(pts) + '" fill="none" stroke="' + c.color + '" stroke-width="1.15" opacity=".76"/>';
        svg += '<text x="' + (W - R - 4) + '" y="' + (T + 12 + k * 15) + '" text-anchor="end" font-size="8.5" fill="' + c.color + '">' + c.name + '</text>';
      });
      svg += '<line x1="' + L + '" y1="' + yy(th) + '" x2="' + (L + pw) + '" y2="' + yy(th) +
        '" stroke="#b0574e" stroke-width="1.3" stroke-dasharray="5 4"/>';
      svg += '<text x="' + (L + 4) + '" y="' + (yy(th) - 5) + '" font-size="9" fill="#b0574e">预警阈值 ' + fmt(th, 2) + '</text>';
      var first = score.findIndex(function (s) { return s >= th; });
      var peak = score.reduce(function (a, s, i) { return s > score[a] ? i : a; }, 0);
      if (first >= 0) {
        svg += '<line x1="' + xx(first) + '" y1="' + T + '" x2="' + xx(first) + '" y2="' + (T + ph) +
          '" stroke="#b0574e" stroke-dasharray="3 4" opacity=".55"/>';
        svg += '<text x="' + (xx(first) + 5) + '" y="' + (T + 12) + '" font-size="9" fill="#b0574e">首次预警</text>';
      }
      score.forEach(function (s, i) {
        if (s >= th) svg += '<circle cx="' + xx(i) + '" cy="' + yy(s) + '" r="2.2" fill="#b0574e" opacity=".65"/>';
      });
      svg += '<path d="' + linePath(score.map(function (s, i) { return [xx(i), yy(s)]; })) +
        '" fill="none" stroke="#8c5a9e" stroke-width="1.5"/>';
      svg += '<text x="' + (L + 4) + '" y="' + (H - 7) + '" font-size="9" fill="#7d898c">时间 / 分钟 →</text></svg>';
      ui.chart.innerHTML = svg;
      var lead = first >= 0 ? Math.max(0, 67 - first) : 0;
      var falseAlarms = score.filter(function (s, i) { return s >= th && (i < 54 || i > 72); }).length;
      ui.metrics.innerHTML = metric('预警状态', first >= 0 ? '已触发' : '未触发', '', first >= 0 ? 'good' : 'bad') +
        metric('提前量', lead, 'min', lead >= 4 ? 'good' : 'bad') +
        metric('非事件报警', falseAlarms, '次', falseAlarms < 3 ? 'good' : 'bad') +
        metric('最异常通道', chans[peak % 3].name);
      ui.rank.innerHTML = [
        ['扭矩—立压耦合', fmt(.74 + (1 - noise) * .08, 2)],
        ['返出流量偏离', fmt(.62 + (1 - noise) * .1, 2)],
        ['转速波动', fmt(.46 + (1 - noise) * .08, 2)]
      ].map(function (x) { return '<li><span>' + x[0] + '</span><b>' + x[1] + '</b></li>'; }).join('');
      ui.live.textContent = first >= 0 ? '预警已触发，建议复核' : '当前未越过预警阈值';
    }
    draw();
    return function () {};
  }

  /* ---------------------------------------------------------
     T1 管道泄漏定位
     --------------------------------------------------------- */
  function t1(root) {
    var ui = shell(root, {
      title: '从压力波与流量平衡中识别小泄漏，并把“在哪个站间”说清楚',
      lead: '多源时序模型识别负压波和流量差，结合水力模型把异常映射到具体管段。滑杆演示泄漏量和噪声对检出与定位的影响。',
      controls: slider('t1-size', '泄漏量', .2, 4, .1, 1.4) + slider('t1-noise', '工况噪声', .1, 1.5, .05, .45),
      chartTitle: '沿线压力剖面与流量差异常',
      chartHint: '灰线：水力模型基线 · 色线：当前观测',
      note: '小泄漏可能没有明显负压波，单靠压力会漏；只看流量差又会把阀门动作误判为泄漏。两条证据必须一起用。',
      rankTitle: '报警证据',
      badge: 'TS · 多源异常检测'
    });
    ['t1-size', 't1-noise'].forEach(function (id) { root.querySelector('#' + id).addEventListener('input', draw); });
    function draw() {
      var size = +root.querySelector('#t1-size').value;
      var noise = +root.querySelector('#t1-noise').value;
      root.querySelector('#t1-size-v').textContent = fmt(size, 1) + '%';
      root.querySelector('#t1-noise-v').textContent = fmt(noise, 2);
      var nseg = 8, leakSeg = 5, pos = (leakSeg + .55) / nseg;
      var W = 660, H = 330, L = 54, R = 18, T = 28, B = 44, pw = W - L - R, ph = H - T - B;
      var xx = function (v) { return L + v * pw; };
      var yy = function (v) { return scale(v, .35, 1.15, H - B, T); };
      var base = [], obs = [];
      for (var i = 0; i <= 80; i++) {
        var v = i / 80;
        var bp = 1.05 - v * .56;
        var drop = v >= pos ? size * .075 * (v - pos) : 0;
        base.push([xx(v), yy(bp)]);
        obs.push([xx(v), yy(bp - drop + (Math.sin(i * 2.4) + Math.cos(i * .7)) * .007 * noise)]);
      }
      var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="管道泄漏压力剖面图">';
      svg += gridLines(L, T, pw, ph, [0, .2, .4, .6, .8, 1], [.4, .6, .8, 1], function (v) { return fmt(v * 100, 0) + '%'; }, function (v) { return fmt(v, 1); });
      svg += '<path d="' + linePath(base) + '" fill="none" stroke="#9ba4a4" stroke-width="1.2" stroke-dasharray="4 4"/>';
      svg += '<path d="' + linePath(obs) + '" fill="none" stroke="#41699b" stroke-width="2"/>';
      for (var s = 0; s <= nseg; s++) {
        svg += '<circle cx="' + xx(s / nseg) + '" cy="' + (H - B + 13) + '" r="4" fill="#e4e0d5" stroke="#7d898c"/>';
        if (s < nseg) svg += '<text x="' + xx((s + .5) / nseg) + '" y="' + (H - 21) + '" text-anchor="middle" font-size="8.5" fill="#7d898c">S' + (s + 1) + '</text>';
      }
      svg += '<line x1="' + xx(pos) + '" y1="' + T + '" x2="' + xx(pos) + '" y2="' + (T + ph) +
        '" stroke="#b0574e" stroke-width="1.4" stroke-dasharray="4 3"/>';
      svg += '<circle cx="' + xx(pos) + '" cy="' + yy(.88) + '" r="7" fill="#faece8" stroke="#b0574e" stroke-width="1.5"/>';
      svg += '<text x="' + (xx(pos) + 10) + '" y="' + (yy(.88) - 8) + '" font-size="9.5" fill="#b0574e">泄漏候选 S' + leakSeg + '</text>';
      svg += '<text x="' + (L + 3) + '" y="' + (T + 12) + '" font-size="9" fill="#7d898c">压力（归一化）</text>';
      svg += '<text x="' + (W - R) + '" y="' + (H - 7) + '" text-anchor="end" font-size="9" fill="#7d898c">沿线里程 →</text></svg>';
      ui.chart.innerHTML = svg;
      var detected = size > .55 + noise * .5;
      var locErr = detected ? Math.max(.08, noise * .42 / Math.max(.6, size)) : 0;
      var falseAlarm = noise > 1.15 && size < .8;
      ui.metrics.innerHTML = metric('泄漏判定', detected ? '检出' : '未检出', '', detected ? 'good' : 'bad') +
        metric('定位误差', detected ? '±' + fmt(locErr * 8, 1) : '—', 'km', detected && locErr < .35 ? 'good' : 'bad') +
        metric('流量差证据', detected ? '一致' : '弱', '') +
        metric('误报风险', falseAlarm ? '偏高' : '低', '', falseAlarm ? 'bad' : 'good');
      ui.rank.innerHTML = [
        ['压力负波', detected ? '命中' : '未见'],
        ['站间流量差', size > .45 ? '持续' : '微弱'],
        ['水力模型残差', fmt(size * .07 + noise * .01, 2)]
      ].map(function (x) { return '<li><span>' + x[0] + ' · ' + x[1] + '</span><b>' + (x[1] === '命中' ? '✓' : '·') + '</b></li>'; }).join('');
      ui.live.textContent = detected ? '泄漏报警与定位已更新' : '当前证据不足，保持监测';
    }
    draw();
    return function () {};
  }

  var FACTORIES = {
    'eor-fracture-opt': e1,
    'eor-fracture-geometry': e2,
    'eor-chemical-screening': e3,
    'eor-steam-cycle': e4,
    'eor-microbe-activity': e5,
    'welllog-fracture-vision': w3,
    'welllog-data-repair': w5,
    'drilling-kick-early-warning': d2,
    'transport-leak-detection': t1
  };

  function mount(key, root, ctx) {
    if (!root) return;
    if (!FACTORIES[key]) {
      root.innerHTML = '<div class="ad-demo"><div class="ad-head"><h3>示范未注册</h3><p>' +
        esc(key || '(空)') + '</p></div></div>';
      return;
    }
    try {
      var cleanup = FACTORIES[key](root, ctx) || function () {};
      ROOTS.push({ root: root, cleanup: cleanup });
    } catch (err) {
      root.innerHTML = '<div class="ad-demo"><div class="ad-head"><h3>示范运行失败</h3><p>' +
        esc(err.message) + '</p></div></div>';
    }
  }

  function unmount(root) {
    for (var i = ROOTS.length - 1; i >= 0; i--) {
      if (!root || ROOTS[i].root === root) {
        try { ROOTS[i].cleanup(); } catch (e) {}
        ROOTS.splice(i, 1);
      }
    }
  }

  global.AssignmentDemo = { mount: mount, unmount: unmount, factories: Object.keys(FACTORIES) };
})(window);


(function () {
  function boot() {
    var root = document.getElementById('case-root');
    if (root && window.AssignmentDemo) window.AssignmentDemo.mount('eor-steam-cycle', root);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
