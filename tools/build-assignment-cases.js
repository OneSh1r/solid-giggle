/* Generate the nine assignment cases, their importable packages, and the
   standalone demo bundles from one source of truth. Run with Node. */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const PACK_ROOT = path.join(ROOT, 'submission', '案例包');
const RUNTIME = path.join(ROOT, 'assets', 'cases', 'assignment-demo-runtime.js');
const UPDATED = '2026-10-26';

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');
const bold = (s) => `<b>${esc(s)}</b>`;

const CASES = [
  {
    id: 'eor-fracture-opt',
    sceneId: 'e1',
    methods: ['opt'],
    title: '压裂参数智能优化：代理模型与贝叶斯搜索',
    folder: '增采-压裂参数智能优化',
    difficulty: '高',
    problem: '压裂设计同时涉及段簇、排量、砂比、液体体系和应力条件。一个中等区块的参数组合可轻易超过十万种，但高保真裂缝模拟单次就要数小时；现场常把邻井方案平移过来，遇到天然裂缝和应力差变化时容易失效。',
    ai: '先用压裂模拟器生成少量样本训练代理模型，再用带约束的贝叶斯优化搜索“改造体积大、加砂风险低、成本可控”的方案。模型输出的是候选清单和不确定性，司压工程师仍负责最终确认。',
    dataText: '建议至少积累 30—50 口井的应力剖面、岩性脆性、天然裂缝、施工曲线和压后产量。关键是施工段、地质段与产量段能按深度准确对齐，而不是单纯追求记录条数。',
    difficultyText: '难点不是拟合一个分数，而是让代理模型知道何时不该相信：新井应力分布偏离训练区时，推荐方案必须自动降级为“需模拟器复核”。',
    refs: ['代理模型', '贝叶斯优化', '多目标优化', '不确定性量化'],
    judge: [
      ['任务类型', '代理优化', '多目标、强约束'],
      ['数据门槛', '30—50 井', '地质段、施工段、产量段对齐'],
      ['可见收益', '小时 → 分钟', '候选筛选从试算转为排序'],
      ['技术难度', '高', '模拟保真度与外推风险']
    ],
    problemMetrics: [['传统设计', '2—4 天'], ['人工覆盖率', '<1%'], ['邻井套用失效率', '28%']],
    flow: ['应力/岩性', '天然裂缝', '施工曲线', '代理模型', '约束优化', '人工复核'],
    output: '候选段簇与泵注方案',
    dataVisual: ['应力剖面', '天然裂缝', '施工曲线', '压后产量', '井段对齐'],
    riskBars: [78, 64, 52, 42],
    riskLabels: ['外推', '模拟误差', '数据对齐', '现场约束'],
    stats: [['训练井', '46 口'], ['历史压裂段', '1,280'], ['候选组合', '96 组'], ['目标', '风险 ≤22']],
    steps: [
      ['井段统一与质量控制', '数据', '把地质、射孔、施工和产量按深度和段号对齐，剔除压力计漂移与前后段串扰。', '形成可直接监督学习的“井—段—产量”样本。', '段号错一位，训练标签就会串到邻段。', ['地质段', '射孔段', '施工段'], '对齐率 ≥98%'],
      ['构建压裂代理模型', '算法', '用历史段训练改造体积与加砂风险的代理模型，并保留模拟器生成的外推样本。', '把单次小时级模拟变成毫秒级候选评分。', '只用成功井训练，会把高风险区误判为安全区。', ['参数矩阵', '代理网络', '响应曲面'], '96 组候选'],
      ['执行多目标约束搜索', '优化', '以增产为目标，以泵压、砂堵和井间干扰为约束，标出帕累托前沿。', '给出“多增产”和“更稳”两类可解释候选。', '把工程硬约束当作软惩罚，可能得到不可施工的点。', ['帕累托前沿', '约束筛选', '候选排序'], '3 个推荐点'],
      ['模拟器复算与现场确认', '复核', '对排名前 3—5 的方案运行高保真模拟，并让压裂工程师检查装备能力与邻井关系。', '模型负责缩圈，人负责承担工程决策。', '不要用代理模型结果直接下发施工指令。', ['候选方案', '全模拟', '工程师签字'], '复算 3 组']
    ],
    metricText: '看三项：90 天产油相对邻井基线的增量、加砂风险是否低于 22 分、代理模型与新井模拟器的排序一致性。最后一项低于 0.7 时，不应把推荐直接用于施工。',
    fails: [
      ['外推区过度自信', '新井应力差超出训练范围，代理模型仍给出平滑高分。应加大不确定性惩罚并触发全模拟。'],
      ['成功井选择偏差', '只学习高产井，遗漏低产样本代表的岩性和施工条件。'],
      ['目标函数偷换', '把短期产量当成最终收益，忽略砂量、返排和井间干扰成本。']
    ],
    demoLead: '从这个案例包进入可运行示范，调整脆性指数、应力差、排量和目标权重，观察 Pareto 前沿与推荐点移动。'
  },
  {
    id: 'eor-fracture-geometry',
    sceneId: 'e2',
    methods: ['cv', 'opt'],
    title: '压裂裂缝形态预测：多源融合与不确定带',
    folder: '增采-压裂裂缝形态预测',
    difficulty: '高',
    problem: '裂缝长度、高度与导流能力决定压裂是否真正连接了储量。地下裂缝几乎不能直接观测，解释员只能把微地震事件、施工压力、地质模型和示踪产剖拼在一起，单一数据都带有明显多解性。',
    ai: '深度学习把微地震点云、施工曲线和地质先验融合为裂缝概率体，再用正则化和地质约束压制不合理形态。结果必须连同不确定范围一起输出，而不是一条看似精确的裂缝线。',
    dataText: '需要按压裂段组织微地震事件及定位质量、泵压/排量/砂量、天然裂缝模型、示踪剂回收与产剖。仅有微地震图而缺少施工和产出验证，只能形成示意，不能训练可靠的几何反演。',
    difficultyText: '属于强不适定问题：不同裂缝形态可能产生相似的地表响应。真正可落地的方式是输出概率与区间，并用新段数据持续校准。',
    refs: ['多源反演', '不适定问题正则化', '不确定性量化', '图神经网络'],
    judge: [
      ['任务类型', '多源反演', '点云 + 时序 + 先验'],
      ['数据门槛', '高', '需要按段对齐的验证数据'],
      ['可见收益', '解释提速', '事件过滤与几何缩圈'],
      ['技术难度', '高', '真值不可直接观测']
    ],
    problemMetrics: [['人工解释', '8—16 h/段'], ['事件有效率', '45%—80%'], ['多解形态', '常见']],
    flow: ['微地震事件', '施工曲线', '地质先验', '多模态模型', '几何概率体', '示踪/产剖'],
    output: '裂缝半长、半高与不确定带',
    dataVisual: ['事件点云', '压力排量', '天然裂缝', '示踪回收', '分段时间'],
    riskBars: [91, 84, 69, 57],
    riskLabels: ['真值缺失', '定位误差', '多源错位', '跨区迁移'],
    stats: [['微地震事件', '4,600'], ['压裂段', '120'], ['融合通道', '6'], ['目标几何误差', '≤25 m']],
    steps: [
      ['微地震事件清洗', '数据', '按定位质量、信噪比和施工阶段筛选事件，标记远场噪声和重复定位。', '去掉低可信度点后再反演，避免裂缝被噪声“拉长”。', '简单删掉弱事件会截断裂缝尖端，需要保留概率权重。', ['原始事件', '置信度门限', '清洗点云'], '保留 68%'],
      ['施工曲线分段', '解释', '识别起裂、扩展、加砂和停泵阶段，提取压力下降、净压力与排量响应。', '为裂缝宽度和导流能力提供独立证据。', '不同段采用不同泵注程序时，压力特征不能直接横比。', ['泵压曲线', '阶段边界', '响应特征'], '阶段 4 类'],
      ['多模态几何反演', '算法', '融合事件点云、施工时序与天然裂缝方向先验，输出裂缝概率体和几何参数分布。', '从“点云轮廓”升级为可量化的储层改造模型。', '把事件包络直接当裂缝面，会高估改造体积。', ['点云编码', '时序编码', '概率体'], '多解收敛'],
      ['验证与不确定性复核', '质控', '用示踪剂、产剖和邻段干扰验证几何，标出低置信区并回流新样本。', '输出可直接进入压裂评估的区间估计。', '验证数据通常只有少数井，不能按随机划分评估。', ['几何预测', '示踪验证', '区间校准'], '误差 ±21 m']
    ],
    metricText: '除了长度和高度误差，还要看方向误差、事件覆盖率与区间校准率。例如 90% 不确定带里实际形态应至少出现 90% 的验证样本，否则只是“画得宽”，并未真正表达不确定性。',
    fails: [
      ['事件包络等于裂缝', '把微地震事件外包络直接当裂缝面，常高估储层改造体积。'],
      ['诱导事件混入', '施工扰动和远场噪声被当裂缝扩展，导致尖端虚长。'],
      ['只报点估计', '下游无法判断方案能否承担误差，应该同时交付概率区间。']
    ]
  },
  {
    id: 'eor-chemical-screening',
    sceneId: 'e3',
    methods: ['opt'],
    title: '化学驱配方筛选：主动学习减少无效实验',
    folder: '增采-化学驱配方智能筛选',
    difficulty: '中',
    problem: '聚合物、表面活性剂和助剂浓度组合形成巨大配方空间，而一组岩心驱替实验往往需要数周。若按网格逐点试验，预算会被大量低信息实验消耗，且不同实验条件难以直接比较。',
    ai: '先用已有实验训练性能代理模型，再用主动学习选择“可能表现好、又能明显降低模型不确定性”的下一组实验。模型不替代实验，而是决定实验先做哪一组。',
    dataText: '除配方参数外，必须记录原油黏度、储层温度、矿化度、岩心渗透率和实验流程。不同批次、不同岩心的结果要带批次与岩心编号，避免把系统偏差学成配方效应。',
    difficultyText: '总样本量小、异方差明显。最有价值的验证不是一次随机交叉验证，而是在留出的配方簇上测试主动学习能否更快逼近最优区。',
    refs: ['主动学习', '高斯过程回归', '实验设计', '贝叶斯优化'],
    judge: [
      ['任务类型', '小样本优化', '性能预测 + 实验选择'],
      ['数据门槛', '中', '数百组配方，条件必须可追溯'],
      ['可见收益', '实验减半', '优先探索高信息区域'],
      ['技术难度', '中', '样本少、实验条件差异']
    ],
    problemMetrics: [['单组实验周期', '2—4 周'], ['网格覆盖率', '极低'], ['可追溯条件', '12 项']],
    flow: ['原油与储层', '配方参数', '历史实验', '代理模型', '采集函数', '下一组实验'],
    output: '推荐配方与验证顺序',
    dataVisual: ['原油黏度', '储层温度', '矿化度', '岩心编号', '实验批次'],
    riskBars: [67, 59, 82, 44],
    riskLabels: ['样本稀少', '条件漂移', '批次偏差', '外推'],
    stats: [['已有实验', '126 组'], ['候选空间', '5,400'], ['首轮建议', '12 组'], ['目标', '实验减 45%']],
    steps: [
      ['统一实验记录口径', '数据', '把配方浓度、岩心物性、温度、矿化度和性能指标统一单位，标记同批次实验。', '建立可比较的小样本训练集。', '不同岩心渗透率直接混比，会把岩心差异误归因于配方。', ['配方', '岩心', '性能'], '126 组可用'],
      ['训练高斯过程代理', '算法', '分别预测界面张力、驱油效率与实验波动，输出均值和方差。', '同时获得性能预测和“模型哪里不确定”。', '只做点预测就无法判断下一组实验的信息价值。', ['历史实验', 'GP 代理', '均值/方差'], '不确定度 18%'],
      ['计算采集函数', '优化', '按“性能期望 + 信息增益”为候选配方排序，并限制每轮配方类型多样性。', '把有限实验预算集中到最可能改变决策的区域。', '只追求高分容易陷入局部最优，需保留探索项。', ['候选配方', '采集函数', '多样性约束'], '选 12 组'],
      ['实验回填与主动迭代', '闭环', '完成实验后回填结果，重新训练代理并检查排序是否稳定。', '每轮实验都缩短最优配方的置信区间。', '不能在每次回填后大幅改动目标定义，否则历史结果不可比较。', ['新实验', '模型更新', '下一轮推荐'], '迭代 3 轮']
    ],
    metricText: '用“达到目标驱油效率所需实验数”和“最优配方簇的命中率”评估。还要比较随机采样与主动学习，在同一实验预算下的提升；单看拟合优度说明不了实验是否更省。',
    fails: [
      ['只追求不确定性', '采集函数过度探索陌生区，导致前几轮实验偏离工程目标。'],
      ['批次效应混入', '忽略岩心与实验批次，模型学到的是实验流程漂移。'],
      ['目标频繁改变', '每轮回填后更改评价口径，主动学习无法积累知识。']
    ]
  },
  {
    id: 'eor-steam-cycle',
    sceneId: 'e4',
    methods: ['ts', 'opt'],
    title: '蒸汽吞吐注采优化：把单周期收益放到时间轴上',
    folder: '增采-蒸汽吞吐注采参数优化',
    difficulty: '中',
    problem: '稠油蒸汽吞吐包含注汽、焖井、采液三个相互影响的阶段。现场常按上一周期经验调参，但提高本轮注汽量可能透支后续井底温度，单周期产量最高不一定让累计油汽比最优。',
    ai: '时序模型预测不同注汽量、焖井时间和采液速度下的周期产量与温度恢复，再以多周期累计产油和油汽比为优化目标。模型可以跨井共享规律，但需要用各井前几个周期校准。',
    dataText: '最低需要逐周期注汽量、干度、焖井时间、初期采液速度、产油、产液、井温与含水。单井通常只有几十个周期，必须跨井建模，并保留井号与周期序号，避免把不同井混为独立样本。',
    difficultyText: '周期之间存在状态依赖，样本又短。短期产量预测容易，难的是在井底温度、泵能力和油汽比约束下给出多周期策略。',
    refs: ['序列预测', '滚动优化', '跨井迁移', '约束优化'],
    judge: [
      ['任务类型', '时序 + 优化', '多阶段、跨周期决策'],
      ['数据门槛', '中', '单井 10—30 周期，需跨井共享'],
      ['可见收益', '提油汽比', '减少无效注汽和过热风险'],
      ['技术难度', '中', '周期短、状态依赖强']
    ],
    problemMetrics: [['人工调参', '按上周期'], ['单井周期数', '10—30'], ['累计最优差异', '8%—18%']],
    flow: ['注汽', '焖井', '采液', '井温恢复', '时序模型', '滚动优化'],
    output: '未来周期注采参数与油汽比',
    dataVisual: ['注汽量', '干度', '焖井', '初期采液', '井温', '含水'],
    riskBars: [72, 63, 51, 46],
    riskLabels: ['周期过短', '跨井差异', '井温缺失', '外推'],
    stats: [['训练井', '68 口'], ['周期样本', '1,740'], ['预测步长', '6 周期'], ['目标', '油汽比 ≥0.58']],
    steps: [
      ['周期边界与状态编码', '数据', '把每次吞吐拆成注汽、焖井、采液阶段，并把上一周期末温度、含水与产量作为下一周期初始状态。', '让模型学习周期之间的真正传递关系。', '把每个周期当独立样本，会丢失最关键的跨周期依赖。', ['注汽', '焖井', '采液'], '状态 8 维'],
      ['跨井时序预测', '模型', '使用共享时序骨干加井级嵌入，预测未来 6 个周期的产油、产液和井温。', '在单井样本很少时借用其他井的共性。', '不同油藏类型必须分组，否则共享会变成负迁移。', ['共享模型', '井级校准', '概率预测'], '6 周期'],
      ['滚动约束优化', '优化', '在泵能力、井底温度和累计油汽比约束下搜索每周期注汽与采液参数。', '把单周期最优改为未来窗口的累计最优。', '每一步都重算到末周期会导致策略频繁跳变，应加入调整平滑约束。', ['策略搜索', '滚动窗口', '约束检查'], '油汽比 0.61'],
      ['现场执行与回填', '闭环', '执行第一阶段策略，记录温度和产量，再把真实状态回填下一轮优化。', '形成从预测到现场再到再优化的闭环。', '只用计划值而不是实际执行值回填，闭环会逐渐漂移。', ['执行', '监测', '再优化'], '每周更新']
    ],
    metricText: '主指标是未来 6 周期累计产油和累计油汽比，次指标是井底温度最低值与泵负荷超限次数。只比较单周期峰值产量，会把过度注汽的高能耗方案误判为更优。',
    fails: [
      ['单周期短视', '只看本轮产量，忽略高温蒸汽对后续周期和能耗的影响。'],
      ['井型混建', '把薄层稠油与厚层稠油混在一个共享模型中，产生负迁移。'],
      ['计划值回填', '用计划注汽量而非实际值更新状态，闭环误差不断累积。']
    ]
  },
  {
    id: 'eor-microbe-activity',
    sceneId: 'e5',
    methods: ['ts'],
    title: '微生物采油活性预测：小样本软测量与补注时机',
    folder: '增采-微生物采油菌群活性预测',
    difficulty: '高',
    problem: '微生物驱的菌群活性依靠取样培养，实验室结果常滞后一周以上；营养液、温度、盐度与代谢产物共同影响活性，人工很难判断什么时候该补注，什么时候应停止以避免成本浪费。',
    ai: '用时序模型从注采参数、井温和产出指标中软测量菌群活性，输出未来两周趋势与不确定区间。实验室培养值作为稀疏校准点，而不是唯一输入。',
    dataText: '至少需要每日注采与产出数据、每周菌浓/代谢产物/pH、营养液配方和温度盐度。更重要的是记录每次补注、停注和采样时间，用于建立因果上可解释的滞后关系。',
    difficultyText: '样本极少、机理不清、效果显现慢。相比追求高准确率，更应先建立阈值预警与“何时必须补做实验”的保守策略。',
    refs: ['小样本学习', '机理—数据混合建模', '软测量', '不确定度估计'],
    judge: [
      ['任务类型', '稀疏时序预测', '软测量 + 补注决策'],
      ['数据门槛', '高', '周级实验点、日级生产数据'],
      ['可见收益', '提前 1—2 周', '预警活性下滑'],
      ['技术难度', '高', '小样本、慢响应、机理不清']
    ],
    problemMetrics: [['实验室滞后', '7—14 天'], ['培养成本', '高'], ['补注判断', '依赖经验']],
    flow: ['注采参数', '温度/盐度', '生长指标', '软测量模型', '活性区间', '补注建议'],
    output: '未来两周活性与补注窗口',
    dataVisual: ['每日产量', '营养液', '菌浓', '代谢产物', '温度', '盐度'],
    riskBars: [93, 86, 74, 61],
    riskLabels: ['样本极少', '实验滞后', '机理不清', '跨井迁移'],
    stats: [['矿场试验', '6 个'], ['日级通道', '14'], ['周级实验', '2 年'], ['目标', '提前 10 天']],
    steps: [
      ['建立时间对齐样本', '数据', '按井与日期连接注采、产量、温度盐度和实验室采样，把采样结果视为带滞后的观测。', '形成“可观测输入 → 滞后活性”的时序样本。', '把实验日期当成真实状态日期，会错位一周以上。', ['日级生产', '周级实验', '事件时间'], '时间误差 ≤1 d'],
      ['机理特征与软测量', '建模', '提取营养液脉冲、温度偏低、盐度上升与代谢产物变化，联合预测未采样日的活性。', '把每周一次的人工检测扩展为每日风险估计。', '纯黑箱模型在样本很少时容易把季节性波动当机理。', ['营养脉冲', '温度盐度', '软测量'], '每日更新'],
      ['概率趋势预测', '预测', '滚动预测未来 14 天活性，并用历史误差形成 90% 区间。', '让现场看到“可能何时跌破阈值”，而不是只给一个平均值。', '只报均值会掩盖尾部风险，补注决策会过于激进。', ['活性均值', '90% 区间', '阈值穿越'], '提前 10 天'],
      ['补注与取样闭环', '决策', '当区间上沿接近风险阈值时安排提前取样；确认下降后按方案补注并记录响应。', '用最少实验换取足够的决策确定性。', '每次预测都补注会破坏菌群生态，也会掩盖真实趋势。', ['预警', '取样确认', '补注响应'], '每周复核']
    ],
    metricText: '用阈值穿越的提前量、补注建议命中率和抽样成本评估。平均绝对误差不能单独使用：模型在低活性区间的漏报代价，通常远高于正常区间的少量误差。',
    fails: [
      ['实验时间错位', '培养结果反映的是一周前状态，直接当当天标签会产生系统性滞后。'],
      ['黑箱过拟合', '样本极少时仍使用高容量模型，把注采操作误当菌群变化。'],
      ['频繁补注', '每次预测下降就补注，既增加成本，也破坏菌群生态。']
    ]
  },
  {
    id: 'welllog-fracture-vision',
    sceneId: 'w3',
    methods: ['cv'],
    title: '成像测井裂缝识别：从像素到产状解释',
    folder: '测井-成像测井裂缝识别',
    difficulty: '高',
    problem: '电成像与声成像把井壁展开成连续图像，裂缝、层理、孔洞和诱导缝都以细长纹理出现。解释员要逐幅勾绘裂缝，再计算产状与线密度；低角度裂缝与诱导缝很容易混淆。',
    ai: '语义分割模型先给出裂缝像素掩膜和实例骨架，再结合走向、连续性与岩心标定剔除诱导缝，自动生成裂缝密度、产状与低置信度复核队列。',
    dataText: '需要保留全井段展开图、方位与深度刻度、岩心裂缝描述和人工解释表。标签不能只画裂缝线，还应区分天然裂缝、诱导缝和层理，否则模型会把所有暗线都当裂缝。',
    difficultyText: '裂缝细长且像素占比极低，类别不均衡严重。更关键的是图像识别正确不代表地质解释正确，必须把几何标定与产状约束纳入后处理。',
    refs: ['语义分割', '实例分割', '细长目标检测', '地质规则后处理'],
    judge: [
      ['任务类型', '图像分割', '裂缝 + 诱导缝识别'],
      ['数据门槛', '高', '需像素级裂缝与岩心验证'],
      ['可见收益', '小时 → 分钟', '自动生成产状与复核队列'],
      ['技术难度', '高', '细长目标与类别不均衡']
    ],
    problemMetrics: [['单井解释', '2—5 h'], ['裂缝占比', '<2%'], ['诱导缝混淆', '常见']],
    flow: ['成像展开图', '深度/方位', '裂缝掩膜', '实例提取', '产状约束', '解释成果'],
    output: '裂缝密度、产状与复核候选',
    dataVisual: ['展开图', '方位刻度', '裂缝掩膜', '岩心描述', '人工解释'],
    riskBars: [88, 79, 73, 58],
    riskLabels: ['极端不均衡', '诱导缝', '标注歧义', '跨仪器'],
    stats: [['训练井', '36 口'], ['裂缝实例', '1,860'], ['图像幅数', '12,400'], ['目标', 'F1 ≥0.82']],
    steps: [
      ['图像标定与质量检查', '数据', '检查深度、方位和井径标定，去除接缝、坏道与严重覆盖区。', '保证像素位置能转换为真实深度和井周方位。', '方位刻度偏一圈不会报错，但产状会整体错误。', ['图像', '深度', '方位'], '标定通过'],
      ['裂缝掩膜分割', '算法', '用轻量 U-Net 输出裂缝概率，类别不均衡通过加权损失和硬例采样缓解。', '快速找到全部疑似裂缝像素。', '只用交叉熵容易让模型全部预测为背景，召回看似高但无意义。', ['图像块', '概率掩膜', '骨架'], '阈值 0.56'],
      ['实例与诱导缝鉴别', '解释', '从骨架拟合正弦线，计算倾角倾向，并用连续性、宽度和施工记录剔除诱导缝。', '把像素级检测转换为可解释的裂缝实例。', '诱导缝可能比天然缝更清晰，不能只按置信度排序。', ['正弦拟合', '倾角倾向', '诱导缝过滤'], '18 条候选'],
      ['产状统计与人工复核', '质控', '生成线密度、产状玫瑰图和复核队列，解释员只检查低置信与异常产状。', '从逐条勾绘转为抽样确认与质量把关。', '不保留原始掩膜，复核时无法判断错误发生在哪一步。', ['玫瑰图', '复核队列', '成果表'], '复核 20%']
    ],
    metricText: '除像素 F1，还要统计裂缝实例召回率、诱导缝误报率和产状误差。重点是低置信候选是否被正确送入人工复核，而不是把所有图都交给人工重做。',
    fails: [
      ['暗线即裂缝', '层理、井壁划痕和诱导缝也被检测，造成密度虚高。'],
      ['方位标定错误', '展开图像素位置没有正确映射到井周，产状整体偏移。'],
      ['全量人工复核', '算法没有给出置信度排序，省下的勾绘时间又被复核吃掉。']
    ]
  },
  {
    id: 'welllog-data-repair',
    sceneId: 'w5',
    methods: ['ts'],
    title: '测井曲线修复：多曲线一致性与薄层保留',
    folder: '测井-测井数据修复',
    difficulty: '中',
    problem: '测井曲线常出现仪器故障、井径垮塌和采样段缺失。人工插值往往只看单条曲线，虽然能补出一段平滑线，却可能抹掉薄层，造成后续储层解释和射孔分段偏差。',
    ai: '掩码自编码器或跨曲线生成模型利用 GR、DEN、电阻率、邻井和历史井段共同重建缺失区，同时输出异常置信度。修复结果必须通过物理一致性与薄层保留检查。',
    dataText: '需要同一井段的多条常规与特殊测井曲线、仪器状态、井径和人工标记的异常段；邻井曲线只能作为参考，不能直接复制，因为构造位置和地层厚度可能不同。',
    difficultyText: '“补得像”缺少真值。评价必须使用人为遮挡的完整段来量化，并同时监测曲线间物理关系和下游解释效果，避免只追求平滑。',
    refs: ['序列插补', '掩码自编码器', '跨曲线生成', '物理约束'],
    judge: [
      ['任务类型', '序列补全', '多曲线联合重建'],
      ['数据门槛', '中', '同井多曲线 + 异常段标记'],
      ['可见收益', '减少返工', '保留薄层与异常提示'],
      ['技术难度', '中', '缺少直接真值']
    ],
    problemMetrics: [['人工插值', '30—90 min/井'], ['异常漏标', '常见'], ['薄层压平', '高风险']],
    flow: ['多曲线', '异常遮罩', '跨曲线模型', '修复区间', '一致性检查', '人工复核'],
    output: '修复曲线、异常标记与置信度',
    dataVisual: ['GR', 'DEN', '电阻率', '井径', '异常段', '邻井'],
    riskBars: [76, 61, 53, 47],
    riskLabels: ['真值缺失', '深度错位', '薄层', '邻井差异'],
    stats: [['完整井段', '210 井'], ['遮挡测试', '8,600 段'], ['曲线通道', '6'], ['目标', '薄层保留 +20%']],
    steps: [
      ['异常段识别与遮罩', '数据', '依据仪器状态、井径突变和跨曲线矛盾标记异常，把真实缺失段与人工遮挡测试段分开。', '避免模型在评价时“看到答案”。', '把测试遮挡段混入训练，精度会被严重高估。', ['缺失段', '井径异常', '人工标签'], '标记 6 类'],
      ['多曲线联合重建', '算法', '输入同井多曲线与邻井上下文，预测缺失区分布并输出逐点置信度。', '补全时同时利用多条物理相关曲线。', '直接复制邻井曲线，遇到地层厚度变化会错位。', ['多曲线输入', '掩码编码', '置信度'], '6 通道'],
      ['物理与结构质控', '质控', '检查 GR—岩性、DEN—孔隙度和电阻率之间的合理关系，并保留薄层与层序边界。', '阻止“视觉平滑但物理解释错误”的补全。', '物理约束过强会把真实复杂储层压成教科书式曲线。', ['跨曲线检查', '薄层保留', '层序检查'], '一致性 92%'],
      ['遮挡测试与发布', '评价', '在完整井段人为遮挡，比较插值、单曲线模型和多曲线模型的误差，并输出人工复核清单。', '给出可复现的修复质量证据。', '只在训练井内测试，无法判断跨区使用效果。', ['遮挡测试', '误差统计', '复核清单'], 'MAE 2.8 API']
    ],
    metricText: '同时看 MAE、薄层边界保留率、曲线间物性一致性和下游解释变化。平滑插值 MAE 可能不差，但薄层保留差，不能单独据此判定修复成功。',
    fails: [
      ['用邻井直接填空', '构造位置和层厚变化被忽略，深度对齐后出现系统偏差。'],
      ['过度平滑', '序列模型只学低频趋势，小薄层全部被抹平。'],
      ['测试泄漏', '人工遮挡段进入训练，指标虚高且不可复现。']
    ]
  },
  {
    id: 'drilling-kick-early-warning',
    sceneId: 'd2',
    methods: ['ts'],
    title: '井下复杂前兆预警：多通道异常与提前量',
    folder: '钻井-井下复杂事故前兆预警',
    difficulty: '高',
    problem: '卡钻、井漏和气侵发生前，扭矩、立管压力、流量、转速等信号通常已出现微弱异常，但司钻同时监控十几条曲线，固定阈值既会漏掉缓变前兆，也会被接单根和开停泵触发误报。',
    ai: '多变量时序异常检测学习正常工况基线，把偏离模式合成为可解释异常分数，并在越过阈值时指出主要触发通道和提前量。预警只用于提示复核，不直接控制钻机。',
    dataText: '需要秒级多通道钻井数据、工况标签、事故台账与处理过程。异常样本非常少，必须把正常接单根、起下钻等操作段显式标记，否则模型会把正常工况变化当异常。',
    difficultyText: '类别极端不均衡，误报成本高。高精度不够，必须同时优化提前量、误报率和可解释触发通道，并在不同钻机和地层间验证迁移。',
    refs: ['多变量异常检测', '不均衡学习', '可解释预警', '迁移学习'],
    judge: [
      ['任务类型', '时序异常', '实时、多通道'],
      ['数据门槛', '高', '异常稀少，需要工况标签'],
      ['可见收益', '分钟级提前', '减少无效监视与误报'],
      ['技术难度', '高', '误报代价与迁移']
    ],
    problemMetrics: [['同时看曲线', '10+'], ['固定阈值', '误报高'], ['事故损失', '小时—天']],
    flow: ['实时多通道', '工况识别', '正常基线', '异常评分', '阈值预警', '司钻复核'],
    output: '风险等级、提前量与触发通道',
    dataVisual: ['扭矩', '立压', '流量', '转速', '工况', '事故标签'],
    riskBars: [95, 83, 71, 62],
    riskLabels: ['异常稀少', '工况混淆', '跨钻机', '误报代价'],
    stats: [['训练井', '72 口'], ['通道', '14'], ['异常事件', '186'], ['目标', '提前 ≥5 min']],
    steps: [
      ['多源数据对齐', '数据', '统一时间戳和采样率，关联钻头深度、钻具组合、泵开停和事故台账。', '建立可追溯的井—时间—工况样本。', '不同服务器时钟偏移几秒，就会破坏前兆与响应的因果关系。', ['扭矩', '立压', '事故时间'], '时间误差 <2 s'],
      ['工况自动分段', '识别', '先把钻进、接单根、起下钻、循环等工况分开，每种工况建立独立正常基线。', '避免把正常操作波动当成事故前兆。', '只用全井统一阈值，接单根时必然产生大量误报。', ['钻进', '接单根', '起下钻'], '工况 7 类'],
      ['多变量异常评分', '算法', '融合多通道残差与工况上下文，输出连续风险分数，并计算各通道贡献。', '同时发现缓变偏离和突增异常。', '只看单个峰值会漏掉多个通道共同偏离的早期模式。', ['通道残差', '融合评分', '贡献排序'], '提前 7 min'],
      ['分级复核与回填', '闭环', '按风险等级提示司钻，记录是否确认、采取动作和结果，再把新样本回流。', '把模型预警变成可审计的现场运行记录。', '把所有预警都当事故标签会污染训练，应区分确认与未确认。', ['预警', '复核', '事件回填'], '误报 ≤2/班']
    ],
    metricText: '核心是事件召回率、平均提前量、每班误报次数和触发通道可解释性。只报 99% 准确率没有意义，因为事故极少，模型全部预测正常也可能得到高分。',
    fails: [
      ['工况混淆', '接单根、开泵等正常操作被当成事故前兆。'],
      ['只看单通道', '多个通道共同缓慢偏离的信号被单阈值漏掉。'],
      ['预警不可解释', '司钻不知道应该先核查哪条曲线，会增加决策负担。']
    ]
  },
  {
    id: 'transport-leak-detection',
    sceneId: 't1',
    methods: ['ts'],
    title: '管道泄漏检测：小泄漏识别与站间定位',
    folder: '运输-管道泄漏智能检测',
    difficulty: '中',
    problem: '长输管道的压力、流量和声波数据持续产生，但小流量渗漏不一定有明显负压波。阀门调整、启停泵与需求变化又会制造类似异常，单靠固定阈值容易漏报或频繁误报。',
    ai: '多源时序模型同时分析压力波、站间流量差与水力模型残差，先用工况上下文抑制正常扰动，再把持续异常映射到具体站间并给出定位置信区间。',
    dataText: '需要全线压力、流量、温度和泵阀动作记录，以及历史泄漏或开挖验证事件。纯正常数据可以训练异常检测，但没有事件记录就无法评估定位误差和真实误报率。',
    difficultyText: '泄漏样本稀少，工况扰动与泄漏响应相似。精度不是唯一标准，必须同时控制误报、定位精度和预警延迟，并允许人工复核。',
    refs: ['多源异常检测', '水力模型残差', '误报抑制', '不确定性定位'],
    judge: [
      ['任务类型', '时序异常', '泄漏识别 + 定位'],
      ['数据门槛', '中', '全线压力流量 + 操作记录'],
      ['可见收益', '更快定位', '小泄漏持续监测'],
      ['技术难度', '中', '样本稀少、工况扰动']
    ],
    problemMetrics: [['人工监控', '全线多站'], ['小泄漏', '负压波弱'], ['阀调扰动', '易误报']],
    flow: ['压力/流量', '泵阀工况', '时序模型', '水力残差', '异常聚合', '站间定位'],
    output: '泄漏概率、站间位置与置信度',
    dataVisual: ['压力', '流量', '温度', '泵阀动作', '水力模型', '开挖验证'],
    riskBars: [82, 74, 63, 51],
    riskLabels: ['事件稀少', '工况扰动', '模型误差', '定位误差'],
    stats: [['管线样本', '9 条'], ['历史事件', '74 起'], ['站间', '8 段'], ['目标', '定位误差 ≤1 段']],
    steps: [
      ['多站时序对齐', '数据', '按统一时标对齐各站压力、流量与泵阀动作，剔除通信中断和传感器漂移。', '保证流量差与负压波反映同一事件。', '未同步的时间戳会让传播时差失去意义。', ['各站数据', '时钟校正', '工况标记'], '同步误差 <1 s'],
      ['正常工况学习', '算法', '学习不同输量、季节和泵组合下的正常压力—流量关系，形成动态基线。', '把静态阈值变成随工况变化的残差。', '只用一个全局基线，调泵时会产生持续误报。', ['输量', '泵组合', '动态基线'], '工况 12 组'],
      ['多证据异常聚合', '检测', '结合压力波、站间流量差与模型残差，要求多证据在时间上相互支持。', '压低阀门扰动引起的单证据误报。', '把多个高度相关通道简单相加，会虚增置信度。', ['负压波', '流量差', '残差'], '3 类证据'],
      ['站间定位与开挖排序', '决策', '按传播时差和水力模型给出候选站间及置信区间，结合巡检条件安排复核。', '把“有异常”转成可执行的巡线任务。', '定位结果必须带区间，不能给一个看似精确的公里数。', ['传播时差', '候选站间', '置信区间'], '误差 ±0.9 段']
    ],
    metricText: '用泄漏事件召回率、每百公里每日误报次数、定位正确率和预警延迟综合评估。小泄漏更要看长期持续监测能否稳定识别，而不是只展示一次演示中的最高峰值。',
    fails: [
      ['小泄漏漏检', '渗漏不产生明显负压波，仅靠压力峰值会持续漏报。'],
      ['阀门误报', '调阀和启停泵引起的流量变化未被工况标签剔除。'],
      ['虚假精确定位', '模型给出单点公里数却没有区间，导致巡线资源被错误调度。']
    ]
  }
];

function figure(caption, svg) {
  return `<div class="figure">${svg}</div><div class="figcap"><b>图</b><span>${caption}</span></div>`;
}

function problemFigure(c) {
  const labels = c.problemMetrics;
  return `<svg viewBox="0 0 640 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="传统流程与智能介入对比">
  <defs><marker id="ar-${c.sceneId}" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#b46d3b"/></marker></defs>
  <rect x="8" y="18" width="380" height="184" rx="12" fill="#f5f3ec" stroke="#e4e0d5"/>
  <rect x="410" y="18" width="222" height="184" rx="12" fill="#e7f2ed" stroke="#a8cfc2"/>
  <text x="25" y="43" font-size="10" font-family="monospace" fill="#7d898c">当前人工路径</text>
  <text x="427" y="43" font-size="10" font-family="monospace" fill="#2f7d6b">智能介入点</text>
  ${labels.map((x, i) => `<rect x="${25 + i * 112}" y="66" width="96" height="53" rx="7" fill="#fff" stroke="#e4e0d5"/>
  <text x="${73 + i * 112}" y="88" text-anchor="middle" font-size="10" fill="#536267">${esc(x[0])}</text>
  <text x="${73 + i * 112}" y="107" text-anchor="middle" font-size="10" font-family="monospace" fill="#213033">${esc(x[1])}</text>`).join('')}
  <path d="M25 139h335" stroke="#d6d1c6"/><path d="M25 157h255" stroke="#d6d1c6"/>
  <text x="25" y="178" font-size="10.5" fill="#536267">经验驱动 → 结果不一致 → 复核成本高</text>
  <path d="M373 108h31" stroke="#b46d3b" stroke-width="1.4" marker-end="url(#ar-${c.sceneId})"/>
  <circle cx="445" cy="100" r="21" fill="#fff" stroke="#2f7d6b"/>
  <text x="445" y="104" text-anchor="middle" font-size="16" font-family="monospace" fill="#2f7d6b">AI</text>
  <path d="M475 100h28" stroke="#2f7d6b" stroke-width="1.3"/>
  <text x="512" y="92" font-size="10.5" fill="#213033">候选缩圈</text>
  <text x="512" y="108" font-size="10.5" fill="#213033">置信度排序</text>
  <text x="512" y="124" font-size="10.5" fill="#213033">人工决策</text>
  <path d="M427 150h189" stroke="#a8cfc2"/><text x="427" y="172" font-size="10" fill="#356354">人负责异常确认与工程约束</text>
</svg>`;
}

function flowFigure(c) {
  const nodes = c.flow;
  const w = 88, gap = 9, y = 58;
  const total = nodes.length * w + (nodes.length - 1) * gap;
  const x0 = (640 - total) / 2;
  return `<svg viewBox="0 0 640 170" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="智能方法介入流程">
  <text x="20" y="25" font-size="10" font-family="monospace" fill="#7d898c">多源观测</text>
  <path d="M20 38h600" stroke="#e4e0d5"/>
  ${nodes.map((n, i) => {
    const x = x0 + i * (w + gap);
    const hot = i === nodes.length - 2 || i === 3;
    return `<rect x="${x}" y="${y}" width="${w}" height="48" rx="7" fill="${hot ? '#e7f2ed' : '#fff'}" stroke="${hot ? '#a8cfc2' : '#e4e0d5'}"/>
    <text x="${x + w / 2}" y="${y + 22}" text-anchor="middle" font-size="9.4" fill="#213033">${esc(n)}</text>
    <text x="${x + w / 2}" y="${y + 36}" text-anchor="middle" font-size="8" font-family="monospace" fill="#7d898c">${String(i + 1).padStart(2, '0')}</text>
    ${i < nodes.length - 1 ? `<path d="M${x + w + 1} ${y + 24}h${gap - 2}" stroke="#b46d3b" stroke-width="1.2"/>` : ''}`;
  }).join('')}
  <path d="M20 135h600" stroke="#e4e0d5"/>
  <text x="20" y="155" font-size="10.5" fill="#356354">最终输出：${esc(c.output)}</text>
  <text x="620" y="155" text-anchor="end" font-size="9.5" font-family="monospace" fill="#b46d3b">HUMAN-IN-THE-LOOP</text>
</svg>`;
}

function dataFigure(c) {
  return `<svg viewBox="0 0 640 210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="数据准备矩阵">
  <rect x="8" y="8" width="624" height="194" rx="10" fill="#f8f7f2" stroke="#e4e0d5"/>
  <text x="24" y="31" font-size="10" font-family="monospace" fill="#7d898c">DATA READINESS · 数据准备就绪度</text>
  ${c.dataVisual.map((d, i) => {
    const x = 24 + (i % 5) * 120, y = 54 + Math.floor(i / 5) * 52;
    return `<rect x="${x}" y="${y}" width="108" height="39" rx="6" fill="#fff" stroke="#e4e0d5"/>
    <circle cx="${x + 14}" cy="${y + 16}" r="4" fill="${i === 2 || i === 3 ? '#b46d3b' : '#2f7d6b'}" opacity=".78"/>
    <text x="${x + 24}" y="${y + 20}" font-size="9.5" fill="#213033">${esc(d)}</text>
    <rect x="${x + 12}" y="${y + 27}" width="78" height="3" rx="1.5" fill="#e9e6de"/>
    <rect x="${x + 12}" y="${y + 27}" width="${i === 3 ? 48 : i === 2 ? 58 : 70}" height="3" rx="1.5" fill="${i === 3 || i === 2 ? '#d1a23f' : '#2f7d6b'}" opacity=".76"/>`;
  }).join('')}
  <text x="24" y="185" font-size="9.5" fill="#536267">建议先解决：深度/时间对齐 · 标签口径 · 异常段记录，再讨论增加模型规模。</text>
</svg>`;
}

function riskFigure(c) {
  return `<svg viewBox="0 0 640 188" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="技术风险剖面">
  <text x="20" y="22" font-size="10" font-family="monospace" fill="#7d898c">RISK PROFILE · 越靠右越需要验证</text>
  ${c.riskBars.map((v, i) => {
    const y = 45 + i * 31;
    return `<text x="20" y="${y + 4}" font-size="9.5" fill="#536267">${esc(c.riskLabels[i])}</text>
    <rect x="104" y="${y - 5}" width="430" height="9" rx="4.5" fill="#ece9e1"/>
    <rect x="104" y="${y - 5}" width="${v * 4.3}" height="9" rx="4.5" fill="${v > 80 ? '#b0574e' : v > 65 ? '#d1a23f' : '#2f7d6b'}" opacity=".76"/>
    <text x="548" y="${y + 4}" font-size="9" font-family="monospace" fill="#7d898c">${v}</text>`;
  }).join('')}
  <text x="20" y="176" font-size="9.5" fill="#213033">高难度不等于不可做：先做可解释基线，再按不确定性设置人工复核门槛。</text>
</svg>`;
}

function stepVisual(c, step, i) {
  const [name, role, , , , labels, metric] = step;
  return `<svg viewBox="0 0 620 82" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(name)}步骤示意">
    <rect x="2" y="8" width="616" height="66" rx="9" fill="#f8f7f2" stroke="#e4e0d5"/>
    <text x="17" y="28" font-size="9" font-family="monospace" fill="#7d898c">STEP ${String(i + 1).padStart(2, '0')} · ${esc(role)}</text>
    ${labels.map((l, k) => {
      const x = 16 + k * 166;
      return `<rect x="${x}" y="38" width="126" height="24" rx="5" fill="#fff" stroke="#e4e0d5"/>
      <text x="${x + 63}" y="54" text-anchor="middle" font-size="9" fill="#213033">${esc(l)}</text>
      ${k < labels.length - 1 ? `<path d="M${x + 127} 50h27" stroke="#b46d3b" stroke-width="1"/>` : ''}`;
    }).join('')}
    <rect x="523" y="37" width="80" height="27" rx="6" fill="#e7f2ed" stroke="#a8cfc2"/>
    <text x="563" y="54" text-anchor="middle" font-size="8.6" font-family="monospace" fill="#2f7d6b">${esc(metric)}</text>
  </svg>`;
}

function workflowOverview(c) {
  const colors = ['#2f7d6b', '#41699b', '#b46d3b', '#7e5a8d'];
  const cards = c.steps.map((step, i) => {
    const x = 14 + i * 151;
    const name1 = step[0].slice(0, 7);
    const name2 = step[0].slice(7, 14);
    return `<rect x="${x}" y="54" width="132" height="82" rx="8" fill="#fff" stroke="#e4e0d5"/>
      <rect x="${x}" y="54" width="3" height="82" rx="1.5" fill="${colors[i]}"/>
      <text x="${x + 12}" y="75" font-size="9" font-family="monospace" fill="${colors[i]}">STEP 0${i + 1}</text>
      <text x="${x + 12}" y="94" font-size="10" fill="#213033">${esc(name1)}</text>
      <text x="${x + 12}" y="108" font-size="10" fill="#213033">${esc(name2)}</text>
      <text x="${x + 12}" y="126" font-size="8.2" fill="#7d898c">${esc(step[5].join(' / '))}</text>
      ${i < 3 ? `<path d="M${x + 136} 95h11" stroke="#b46d3b" stroke-width="1.3"/>` : ''}`;
  }).join('');
  return `<svg viewBox="0 0 620 168" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="四步案例流程总览">
    <text x="14" y="26" font-size="9.5" font-family="monospace" fill="#7d898c">WORKFLOW MAP · 输入 / 处理 / 输出 / 验收</text>
    <path d="M15 39h590" stroke="#e4e0d5"/>
    ${cards}
    <text x="14" y="156" font-size="9.5" fill="#2f7d6b">人负责异常确认、工程约束与最终决策；AI 负责缩圈、排序与不确定性提示。</text>
  </svg>`;
}

function makeTabs(c) {
  const dataRows = c.dataVisual.slice(0, 5).map((d, i) =>
    `<li><b>${esc(d)}</b><span>${i === 0 ? '核心输入' : i === 1 ? '关键约束' : i === 2 ? '长尾/异常' : i === 3 ? '空间或时间对齐' : '人工复核依据'}</span></li>`
  ).join('');
  const sections = [
    {
      no: 1, en: 'PROBLEM', title: '当前做法与问题',
      html: `<p>${esc(c.problem)}</p>${figure('把传统人工路径与智能介入点放在同一条价值链上：AI 负责缩圈和排序，人负责工程约束与最终决策。', problemFigure(c))}`
    },
    {
      no: 2, en: 'INTERVENTION', title: 'AI 能做什么',
      html: `<p>${esc(c.ai)}</p>${figure('智能方法不是替代整个石油工序，而是嵌入一个可定义的子问题：输入多源观测，输出候选、风险或几何。', flowFigure(c))}`
    },
    {
      no: 3, en: 'DATA', title: '你需要准备什么',
      html: `<p>${esc(c.dataText)}</p>${figure('先检查数据的时间/深度对齐和标签口径。缺少数值可以用模型补，缺少可追溯的工程含义则无法可靠验证。', dataFigure(c))}<ul style="margin:12px 0 0;padding-left:0;list-style:none;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px">${dataRows}</ul>`
    },
    {
      no: 4, en: 'DIFFICULTY', title: '技术难度与参考方向',
      html: `<p><span class="dtag" data-d="${esc(c.difficulty)}">难度 ${esc(c.difficulty)}</span> <span class="small muted">${esc(c.difficultyText)}</span></p>${figure('不同案例的卡点不同：这里把主要风险拆开，避免“模型分数很高但工程不可用”。', riskFigure(c))}<div class="refs">${c.refs.map(r => `<span class="ref">${esc(r)}</span>`).join('')}</div>`
    }
  ];
  const workflow = {
    label: '案例流程',
    title: `${c.title} · 一段可复用的落地流程`,
    lead: [
      `这个案例把“${c.sceneId.toUpperCase()} 场景”拆成四步：先把数据变成同一时间/空间基准，再让模型缩圈，最后把不确定性和工程约束交回人。`,
      '每个步骤下方都有一张对应的流程图，说明这一步实际输入什么、输出什么、最容易死在哪里。'
    ],
    stats: c.stats,
    steps: c.steps.map((s, i) => ({
      name: s[0],
      role: s[1],
      do: s[2],
      effect: s[3],
      trap: s[4],
      visual: stepVisual(c, s, i)
    })),
    metrics: {
      title: '怎么算“做对了”',
      html: `<div class="figure">${workflowOverview(c)}</div><div class="figcap"><b>流程总览</b><span>四步共享同一组术语和验收指标，避免从专业背景到交互示范时发生语义漂移。</span></div><p>${esc(c.metricText)}</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px"><div style="padding:10px 12px;background:#e7f2ed;border-radius:7px"><b>先看工程收益</b><br><span class="small muted">时间、误差或风险是否真的下降。</span></div><div style="padding:10px 12px;background:#f8ecdf;border-radius:7px"><b>再看模型可靠性</b><br><span class="small muted">外推、迁移和不确定性是否被显式处理。</span></div></div>`
    },
    fails: c.fails.map(f => ({ name: f[0], why: f[1] }))
  };
  return {
    background: {
      label: '专业背景',
      lede: `${c.problem.slice(0, 155)} AI 的介入点是把“经验判断”变成可解释的候选排序与置信区间，同时保留人对工程安全的最终责任。`,
      judge: c.judge.map((j) => ({ label: j[0], value: j[1], desc: j[2] })),
      sections
    },
    workflow
  };
}

function manifest(c) {
  const tabs = makeTabs(c);
  return {
    id: c.id,
    sceneId: c.sceneId,
    methods: c.methods,
    title: c.title,
    version: '1.0.0',
    updated: UPDATED,
    tabs: {
      background: tabs.background,
      workflow: tabs.workflow,
      demo: {
        mode: 'auto',
        html: 'demo/index.html',
        label: '可运行示范',
        intro: c.demoLead || '拖动参数，观察智能化方法如何把一个石油场景变成可解释的候选和风险判断。',
        height: 620
      }
    }
  };
}

function writeFile(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
}

function buildDataAndPlugin() {
  const data = {};
  CASES.forEach((c) => {
    const t = makeTabs(c);
    data[c.id] = {
      id: c.id,
      sceneId: c.sceneId,
      methods: c.methods,
      title: c.title,
      version: '1.0.0',
      updated: UPDATED,
      tabs: t
    };
  });
  const dataJs = `/* Generated by tools/build-assignment-cases.js. */
window.ASSIGNMENT_CASES = ${JSON.stringify(data, null, 2)};
`;
  writeFile(path.join(ROOT, 'assets', 'cases', 'assignment-case-data.js'), dataJs);

  const plugin = `/* Generated by tools/build-assignment-cases.js. */
(function () {
  'use strict';
  if (!window.ASSIGNMENT_CASES || !window.AssignmentDemo) return;
  Object.keys(window.ASSIGNMENT_CASES).forEach(function (key) {
    var def = window.ASSIGNMENT_CASES[key];
    var tabs = {
      background: def.tabs.background,
      workflow: def.tabs.workflow,
      demo: {
        label: '可运行示范',
        mount: function (root, ctx) { window.AssignmentDemo.mount(key, root, ctx); },
        unmount: function (root) { window.AssignmentDemo.unmount(root); }
      }
    };
    Cases.register({
      id: def.id,
      sceneId: def.sceneId,
      title: def.title,
      methods: def.methods,
      version: def.version,
      updated: def.updated,
      status: 'ready',
      tabs: tabs
    });
  });
})();
`;
  writeFile(path.join(ROOT, 'assets', 'cases', 'assignment-cases.js'), plugin);
}

function buildPacks() {
  const runtime = fs.readFileSync(RUNTIME, 'utf8');
  fs.mkdirSync(PACK_ROOT, { recursive: true });
  CASES.forEach((c) => {
    const dir = path.join(PACK_ROOT, c.folder);
    writeFile(path.join(dir, 'case.json'), JSON.stringify(manifest(c), null, 2));
    writeFile(path.join(dir, 'README.txt'),
      `${c.folder}\n=========================\n\n` +
      '这是一个可直接上传到“石油勘探开发的智能化可能性地图”的独立案例包。\n\n' +
      '使用方法：\n1. 打开主站，点击右上角「＋ 添加案例」；\n' +
      `2. 把本文件夹「${c.folder}」整体拖入；\n3. 校验全绿后提交，网站会跳到“${c.sceneId.toUpperCase()}”场景；\n` +
      '4. 三个 tab 依次是专业背景、案例流程、可运行示范。\n\n' +
      '文件：case.json / demo/index.html / demo/demo.css / demo/demo.js。\n' +
      '不依赖后端、外部字体或网络接口。\n');
    writeFile(path.join(dir, 'demo', 'index.html'), `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(c.title)} · 可运行示范</title>
  <link rel="stylesheet" href="demo.css">
</head>
<body>
  <main id="case-root"></main>
  <script>window.__ASSIGNMENT_CASE_KEY__ = '${c.id}';</script>
  <script src="demo.js"></script>
</body>
</html>
`);
    writeFile(path.join(dir, 'demo', 'demo.css'), `:root{
  color-scheme: light;
  --paper:#fbfaf6; --ink:#213033; --line:#e4e0d5;
}
*{box-sizing:border-box}
body{
  margin:0; padding:14px; background:var(--paper); color:var(--ink);
  font-family:"Inter","PingFang SC","Microsoft YaHei",system-ui,sans-serif;
}
#case-root{max-width:980px;margin:0 auto}
@media (max-width:560px){body{padding:7px}}
`);
    const boot = `\n\n(function () {\n  function boot() {\n    var root = document.getElementById('case-root');\n    if (root && window.AssignmentDemo) window.AssignmentDemo.mount('${c.id}', root);\n  }\n  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);\n  else boot();\n})();\n`;
    writeFile(path.join(dir, 'demo', 'demo.js'), runtime + boot);

    const zip = path.join(PACK_ROOT, `${c.folder}.zip`);
    try { fs.rmSync(zip, { force: true }); } catch (e) {}
    execFileSync('tar.exe', [
      '-a', '-c', '-f', zip, '-C', PACK_ROOT, c.folder
    ], { stdio: 'pipe' });
  });
}

function writeIndex() {
  const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  if (src.includes('assignment-demo-runtime.js')) return;
  const needle = '<script src="assets/cases/welllog-layer.demo.js?v=20261022i"></script>';
  const add = needle +
    '\n<script src="assets/cases/assignment-demo-runtime.js?v=20261026a"></script>' +
    '\n<script src="assets/cases/assignment-case-data.js?v=20261026a"></script>' +
    '\n<script src="assets/cases/assignment-cases.js?v=20261026a"></script>';
  writeFile(path.join(ROOT, 'index.html'), src.replace(needle, add));
}

buildDataAndPlugin();
buildPacks();
writeIndex();
console.log(JSON.stringify({
  cases: CASES.length,
  packRoot: PACK_ROOT,
  folders: CASES.map((c) => c.folder)
}, null, 2));
