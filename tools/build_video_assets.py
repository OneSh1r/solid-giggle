from pathlib import Path
import subprocess
import wave

from PIL import Image, ImageDraw, ImageFont, ImageOps
from pptx import Presentation
from pptx.util import Inches, Emu
from pptx.dml.color import RGBColor


ROOT = Path(__file__).resolve().parent.parent
VIDEO = ROOT / "submission" / "video"
QA = ROOT / "submission" / "qa"
CROPS = QA / "crops"
SLIDES = VIDEO / "slides"
NARR = VIDEO / "narration"
VIDEO.mkdir(parents=True, exist_ok=True)
SLIDES.mkdir(parents=True, exist_ok=True)
NARR.mkdir(parents=True, exist_ok=True)

FONT = r"C:\Windows\Fonts\Deng.ttf"
FONT_BOLD = r"C:\Windows\Fonts\Dengb.ttf"
W, H = 1920, 1080
INK = (33, 48, 51)
INK2 = (83, 98, 103)
MUTED = (125, 137, 140)
PAPER = (251, 250, 246)
JADE = (47, 125, 107)
JADE_L = (231, 242, 237)
CLAY = (180, 109, 59)
CLAY_L = (248, 236, 223)
LINE = (228, 224, 213)
BLUE = (65, 105, 155)


def font(size, bold=False):
    return ImageFont.truetype(FONT_BOLD if bold else FONT, size)


def wrap_cjk(draw, text, fnt, max_width):
    lines = []
    for paragraph in text.split("\n"):
        line = ""
        for ch in paragraph:
            test = line + ch
            if draw.textlength(test, font=fnt) <= max_width:
                line = test
            else:
                if line:
                    lines.append(line)
                line = ch
        lines.append(line)
    return lines


def base_slide(number, section):
    im = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(im)
    for x in range(0, W, 72):
        d.line((x, 0, x, H), fill=(237, 233, 224), width=1)
    for y in range(0, H, 72):
        d.line((0, y, W, y), fill=(237, 233, 224), width=1)
    d.rectangle((0, 0, W, 14), fill=JADE)
    d.text((94, 56), "PETRO × AI ATLAS", font=font(20, True), fill=JADE)
    d.text((94, 86), section, font=font(21), fill=MUTED)
    d.text((1760, 62), f"{number:02d} / 07", font=font(18, True), fill=MUTED)
    return im, d


def fit_image(path, box, radius=20):
    x0, y0, x1, y1 = box
    image = Image.open(path).convert("RGB")
    target = (x1 - x0, y1 - y0)
    image = ImageOps.contain(image, target, method=Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", target, (255, 255, 255))
    canvas.paste(image, ((target[0] - image.width) // 2, (target[1] - image.height) // 2))
    image = canvas
    mask = Image.new("L", target, 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle((0, 0, target[0], target[1]), radius=radius, fill=255)
    frame = Image.new("RGB", target, (255, 255, 255))
    frame.paste(image, (0, 0), mask)
    return frame


def title_slide():
    im, d = base_slide(1, "项目总览")
    d.text((94, 238), "石油勘探开发的", font=font(76, True), fill=INK)
    d.text((94, 338), "智能化可能性地图", font=font(88, True), fill=INK)
    d.text((99, 462), "案例体系、可视化设计与可运行示范", font=font(34), fill=INK2)
    d.rounded_rectangle((94, 558, 315, 606), 20, fill=JADE_L, outline=(168, 207, 194), width=2)
    d.text((125, 568), "可视化导论课程项目", font=font(22, True), fill=JADE)
    d.rounded_rectangle((335, 558, 582, 606), 20, fill=CLAY_L, outline=(224, 191, 160), width=2)
    d.text((366, 568), "纯前端 · 无后端", font=font(22, True), fill=CLAY)
    d.text((99, 705), "13 个环节", font=font(38, True), fill=JADE)
    d.text((99, 760), "61 个候选场景", font=font(25), fill=INK2)
    d.text((372, 705), "10 个案例", font=font(38, True), fill=CLAY)
    d.text((372, 760), "9 个为本次新增", font=font(25), fill=INK2)
    d.text((645, 705), "13 / 13", font=font(38, True), fill=BLUE)
    d.text((645, 760), "作业链全覆盖浏览", font=font(25), fill=INK2)
    # subtle contour motif
    for k in range(6):
        points = []
        for i in range(100):
            x = 1130 + i * 7
            y = 785 + k * 25 + int(30 * __import__("math").sin(i / 9 + k * .42))
            points.append((x, y))
        d.line(points, fill=(181, 215, 204), width=3)
    d.text((94, 980), "汇报演示 · 2026-10-26", font=font(20), fill=MUTED)
    im.save(SLIDES / "slide-1.png")


def overview_slide():
    im, d = base_slide(2, "网站结构与浏览路径")
    d.text((94, 142), "先确定位置，再选择任务", font=font(54, True), fill=INK)
    body = ("首页同时提供按环节浏览和按方法反查。场景页统一分为专业背景、"
            "案例流程和可运行示范，读者可以沿着同一条语义链完成判断。")
    for i, line in enumerate(wrap_cjk(d, body, font(31), 760)):
        d.text((98, 238 + i * 47), line, font=font(31), fill=INK2)
    rows = [
        ("01", "看哪里", "13 环节作业链"),
        ("02", "怎么找", "方法、难度与案例筛选"),
        ("03", "能不能做", "数据门槛、AI 介入点与风险"),
        ("04", "怎么验证", "交互结果与人工复核边界"),
    ]
    for i, (n, head, sub) in enumerate(rows):
        y = 440 + i * 105
        d.text((100, y), n, font=font(22, True), fill=JADE)
        d.text((164, y - 7), head, font=font(31, True), fill=INK)
        d.text((360, y - 3), sub, font=font(27), fill=INK2)
        d.line((100, y + 65, 840, y + 65), fill=LINE, width=2)
    shot = fit_image(CROPS / "home.png", (954, 178, 1760, 863))
    im.paste(shot, (954, 178))
    d.rounded_rectangle((954, 178, 1760, 863), 20, outline=(217, 217, 217), width=2)
    d.text((1050, 893), "首页把覆盖规模、作业链和方法入口压缩在一屏内", font=font(22), fill=MUTED)
    im.save(SLIDES / "slide-2.png")


def e1_slide():
    im, d = base_slide(3, "案例一 · 压裂参数优化")
    d.text((94, 142), "用代理模型把方案搜索", font=font(46, True), fill=INK)
    d.text((94, 202), "从“试算”变为“排序”", font=font(46, True), fill=INK)
    bullets = [
        "输入：脆性、应力差、排量与施工约束",
        "模型：代理模型预测改造体积与加砂风险",
        "优化：贝叶斯搜索给出 Pareto 候选",
        "人：复核装备能力和井间干扰",
    ]
    for i, text in enumerate(bullets):
        y = 302 + i * 78
        d.ellipse((100, y + 12, 113, y + 25), fill=JADE)
        for k, line in enumerate(wrap_cjk(d, text, font(28), 615)):
            d.text((136, y + k * 36), line, font=font(28), fill=INK2)
    d.rounded_rectangle((96, 670, 770, 880), 18, fill=JADE_L, outline=(168, 207, 194), width=2)
    d.text((124, 700), "交互验证", font=font(24, True), fill=JADE)
    d.text((124, 746), "拖动“增产目标权重”", font=font(30), fill=INK)
    d.text((124, 793), "推荐点沿 Pareto 前沿移动，", font=font(27), fill=INK2)
    d.text((124, 832), "风险与收益的判断同时变化。", font=font(27), fill=INK2)
    shot = fit_image(CROPS / "eor-demo.png", (860, 168, 1766, 909))
    im.paste(shot, (860, 168))
    d.rounded_rectangle((860, 168, 1766, 909), 20, outline=(217, 217, 217), width=2)
    im.save(SLIDES / "slide-3.png")


def w3_slide():
    im, d = base_slide(4, "案例二 · 成像测井裂缝识别")
    d.text((94, 142), "从像素检测走到地质解释", font=font(54, True), fill=INK)
    body = ("图像分割只回答“哪里像裂缝”。案例继续结合连续性、倾角和诱导缝约束，"
            "输出产状玫瑰图与人工复核队列。")
    for i, line in enumerate(wrap_cjk(d, body, font(30), 730)):
        d.text((98, 238 + i * 46), line, font=font(30), fill=INK2)
    chain = ["展开图", "像素掩膜", "实例拟合", "产状统计", "复核"]
    for i, item in enumerate(chain):
        x = 98 + i * 148
        d.rounded_rectangle((x, 405, x + 126, 466), 13, fill=(255, 255, 255), outline=LINE, width=2)
        d.text((x + 63, 422), item, font=font(20, True), fill=INK, anchor="ma")
        if i < len(chain) - 1:
            d.line((x + 128, 435, x + 156, 435), fill=CLAY, width=3)
    d.text((98, 540), "阈值降低", font=font(30, True), fill=CLAY)
    d.text((98, 585), "召回提高，但层理和诱导缝也更容易混入。", font=font(27), fill=INK2)
    d.text((98, 650), "真正可用的输出不是一张掩膜，", font=font(28), fill=INK)
    d.text((98, 693), "而是能支持解释员决策的证据组合。", font=font(28), fill=INK)
    shot = fit_image(CROPS / "w3-demo.png", (915, 168, 1766, 909))
    im.paste(shot, (915, 168))
    d.rounded_rectangle((915, 168, 1766, 909), 20, outline=(217, 217, 217), width=2)
    im.save(SLIDES / "slide-4.png")


def d2_slide():
    im, d = base_slide(5, "案例三 · 井下复杂前兆预警")
    d.text((94, 142), "预警不是一条阈值线", font=font(46, True), fill=INK)
    d.text((94, 202), "而是提前量与误报的权衡", font=font(46, True), fill=INK)
    body = ("扭矩、立压、返出流量共同偏离正常工况时，模型输出连续异常分数、"
            "提前量和触发通道。现场据此安排复核，而不是直接控制钻机。")
    for i, line in enumerate(wrap_cjk(d, body, font(30), 760)):
        d.text((98, 284 + i * 46), line, font=font(30), fill=INK2)
    metrics = [
        ("提前量", "分钟级", "为人工确认留出窗口"),
        ("误报", "每班计数", "与提前量一起验收"),
        ("可解释", "通道排序", "先核查最异常的信号"),
    ]
    for i, (k, v, s) in enumerate(metrics):
        x = 98 + i * 245
        d.rounded_rectangle((x, 408, x + 218, 610), 16, fill=(255, 255, 255), outline=LINE, width=2)
        d.text((x + 20, 432), k, font=font(21), fill=MUTED)
        d.text((x + 20, 478), v, font=font(26, True), fill=JADE)
        for j, line in enumerate(wrap_cjk(d, s, font(19), 180)):
            d.text((x + 20, 528 + j * 28), line, font=font(19), fill=INK2)
    d.text((98, 700), "核心价值", font=font(22, True), fill=CLAY)
    d.text((98, 742), "让多通道异常比人工盯屏更早出现，", font=font(29), fill=INK)
    d.text((98, 788), "同时保留可核查的证据与人工责任。", font=font(29), fill=INK)
    shot = fit_image(CROPS / "d2-demo.png", (905, 168, 1766, 909))
    im.paste(shot, (905, 168))
    d.rounded_rectangle((905, 168, 1766, 909), 20, outline=(217, 217, 217), width=2)
    im.save(SLIDES / "slide-5.png")


def packaging_slide():
    im, d = base_slide(6, "案例包与上传兼容")
    d.text((94, 142), "每个案例既能独立提交，也能进入统一网站", font=font(50, True), fill=INK)
    body = ("案例包包含清单、整页示范和独立脚本。流程步骤的图示字段通过案例清单传递，"
            "因此导入后仍保留石油背景、流程可视化与交互。")
    for i, line in enumerate(wrap_cjk(d, body, font(30), 1100)):
        d.text((98, 238 + i * 46), line, font=font(30), fill=INK2)
    d.rounded_rectangle((112, 370, 780, 850), 20, fill=(255, 255, 255), outline=LINE, width=2)
    d.text((148, 400), "案例包目录", font=font(26, True), fill=INK)
    tree = [
        ("大类别-小类别/", 0, JADE),
        ("case.json", 1, INK2),
        ("demo/", 1, INK2),
        ("index.html", 2, INK2),
        ("demo.css", 2, INK2),
        ("demo.js", 2, INK2),
        ("README.txt", 1, INK2),
    ]
    for i, (txt, level, color) in enumerate(tree):
        y = 475 + i * 49
        d.text((150 + level * 42, y), ("└ " if level else "") + txt, font=font(28), fill=color)
    steps = [
        ("1", "拖入文件夹"),
        ("2", "逐项校验"),
        ("3", "提交并跳转"),
        ("4", "三标签运行"),
    ]
    for i, (n, text) in enumerate(steps):
        x = 874 + (i % 2) * 414
        y = 390 + (i // 2) * 220
        d.rounded_rectangle((x, y, x + 354, y + 162), 18, fill=(255, 255, 255), outline=LINE, width=2)
        d.ellipse((x + 26, y + 28, x + 70, y + 72), fill=JADE)
        d.text((x + 48, y + 39), n, font=font(18, True), fill=(255, 255, 255), anchor="ma")
        for j, line in enumerate(wrap_cjk(d, text, font(28, True), 260)):
            d.text((x + 92, y + 38 + j * 34), line, font=font(28, True), fill=INK)
    d.rounded_rectangle((875, 844, 1622, 912), 16, fill=JADE_L, outline=(168, 207, 194), width=2)
    d.text((902, 861), "验收：9 个案例包在原始门户副本中全部真实导入成功", font=font(24, True), fill=JADE)
    im.save(SLIDES / "slide-6.png")


def summary_slide():
    im, d = base_slide(7, "总结")
    d.text((94, 142), "把“哪里能做智能化”变成一条可验证的判断链", font=font(50, True), fill=INK)
    body = ("本次新增 9 个案例，完成增采 5 个子场景，并扩展到钻井、测井和运输。"
            "每个案例都用专业背景建立语境，用流程图示拆解方法，用交互结果说明价值与边界。")
    for i, line in enumerate(wrap_cjk(d, body, font(32), 1240)):
        d.text((98, 246 + i * 48), line, font=font(32), fill=INK2)
    stats = [("9", "新增案例"), ("5 / 5", "增采覆盖"), ("10 / 10", "可运行"), ("9 / 9", "上传通过")]
    for i, (v, k) in enumerate(stats):
        x = 98 + i * 410
        d.rounded_rectangle((x, 465, x + 360, 650), 20, fill=(255, 255, 255), outline=LINE, width=2)
        d.text((x + 30, 492), v, font=font(61, True), fill=JADE if i < 2 else CLAY)
        d.text((x + 30, 584), k, font=font(25), fill=INK2)
    d.text((98, 728), "答辩建议", font=font(23, True), fill=JADE)
    d.text((98, 773), "e1 讲优化  ·  e5 讲小样本  ·  w3 讲图像解释  ·  d2 讲异常与误报", font=font(29), fill=INK)
    d.text((98, 879), "谢谢", font=font(56, True), fill=INK)
    d.text((98, 948), "提交内容与课堂演示使用同一套案例和页面。", font=font(23), fill=MUTED)
    im.save(SLIDES / "slide-7.png")


NARRATION = [
    "大家好，这里汇报我的可视化导论课程大作业，石油勘探开发的智能化可能性地图。"
    "网站把石油作业链拆成十三个环节和六十一个候选场景，并接入十个可运行案例，其中九个是本次新增。"
    "我重点验证了三件事：案例能不能进入统一网站，专业背景能不能被快速理解，交互结果能不能改变工程判断。",
    "先看网站结构。首页有两条检索路径：按环节浏览，适合回答我现在站在作业链哪一步；按方法反查，适合回答已有的计算机视觉、时序或优化技术能落到哪里。"
    "进入场景后，页面统一分为专业背景、案例流程和可运行示范。这样读者会先理解石油问题，再看算法替代哪一步，最后用交互结果检查方法和它的失效条件。",
    "第一个代表案例是压裂参数智能优化。压裂设计同时涉及应力、脆性、排量、砂比和施工约束，参数组合多，高保真模拟又很慢。"
    "网站用代理模型快速预测改造体积和加砂风险，再用贝叶斯搜索给出候选。演示中拖动增产目标权重，推荐点会沿帕累托前沿移动，风险和收益的判断同步变化。"
    "这体现了智能化的价值：模型负责缩圈和排序，工程师负责装备能力、井间干扰和最终决策。",
    "第二个案例是成像测井裂缝识别。成像图把井壁展开成连续图像，裂缝、层理和诱导缝都表现为细长纹理。"
    "语义分割先给出裂缝像素掩膜，案例再加入连续性、倾角、诱导缝抑制和产状统计。降低阈值会增加召回，但也会混入更多层理和诱导缝。"
    "所以真正可用的结果不是一张漂亮掩膜，而是图像、数量、产状和复核队列共同构成的解释证据。",
    "第三个案例是井下复杂事故前兆预警。卡钻、井漏或者气侵发生前，扭矩、立压、返出流量等信号可能出现微弱偏离。"
    "单条曲线和固定阈值容易漏报或误报，网站用多变量时序共同建立正常工况基线，并输出提前量、误报次数和触发通道排序。"
    "这个案例强调，智能化不是直接控制钻机，而是让预警更早、更可解释，同时保留司钻复核和现场决策。",
    "所有新增案例都按大类别小类别分别打包。每个包包含案例清单、整页示范、样式和脚本，可以独立导入原始门户。"
    "流程步骤除了文字，还带有对应图示，说明输入、处理、输出和验收值。我在原始门户的独立副本上用真实文件选择框逐个导入九个案例，全部完成注册、场景跳转和示范挂载，没有脚本异常。",
    "总结一下，这次工作新增九个案例，完整覆盖增采五个子场景，并扩展到钻井、测井和运输。"
    "我认为可视化最核心的作用，是让跨专业知识从名词堆叠变成可以比较、可以追溯、可以行动的判断链。"
    "答辩时可以从 e1 讲优化，从 e5 讲小样本，从 w3 讲图像解释，或者从 d2 讲异常和误报。我的汇报结束，谢谢大家。",
]


def synthesize():
    for i, text in enumerate(NARRATION, 1):
        (NARR / f"narration-{i}.txt").write_text(text, encoding="utf-8")
    ps = VIDEO / "_tts.ps1"
    lines = [
        "$s = New-Object -ComObject SAPI.SpVoice",
        "foreach ($v in $s.GetVoices()) { if ($v.GetDescription() -match 'Huihui') { $s.Voice = $v; break } }",
        "$s.Rate = -1",
        "$s.Volume = 100",
        "$stream = New-Object -ComObject SAPI.SpFileStream",
    ]
    for i in range(1, len(NARRATION) + 1):
        txt = str(NARR / f"narration-{i}.txt").replace("'", "''")
        wav = str(NARR / f"narration-{i}.wav").replace("'", "''")
        lines += [
            f"$text = [System.IO.File]::ReadAllText('{txt}', [System.Text.Encoding]::UTF8)",
            f"$stream.Open('{wav}', 3, $false)",
            "$s.AudioOutputStream = $stream",
            "$s.Speak($text)",
            "$stream.Close()",
        ]
    lines += [
        "[System.Runtime.InteropServices.Marshal]::ReleaseComObject($stream) | Out-Null",
        "[System.Runtime.InteropServices.Marshal]::ReleaseComObject($s) | Out-Null",
    ]
    ps.write_text("\n".join(lines), encoding="utf-8-sig")
    subprocess.run(["powershell.exe", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", str(ps)], check=True)
    ps.unlink(missing_ok=True)


def duration(path):
    with wave.open(str(path), "rb") as wf:
        return wf.getnframes() / float(wf.getframerate())


def build_pptx():
    prs = Presentation()
    prs.slide_width = Inches(13.333333)
    prs.slide_height = Inches(7.5)
    blank = prs.slide_layouts[6]
    poster = VIDEO / "blank.png"
    Image.new("RGB", (2, 2), (255, 255, 255)).save(poster)
    durations = []
    for i in range(1, 8):
        slide = prs.slides.add_slide(blank)
        slide.shapes.add_picture(str(SLIDES / f"slide-{i}.png"), 0, 0, width=prs.slide_width, height=prs.slide_height)
        wav = NARR / f"narration-{i}.wav"
        # Audio is placed outside the visible canvas and marked to play automatically through PowerPoint COM.
        slide.shapes.add_movie(str(wav), Emu(12000000), Emu(7000000), Emu(10000), Emu(10000), poster_frame_image=str(poster), mime_type="audio/wav")
        durations.append(duration(wav))
    out = VIDEO / "演示稿.pptx"
    prs.save(out)
    (VIDEO / "durations.txt").write_text("\n".join(f"{x:.3f}" for x in durations), encoding="utf-8")
    poster.unlink(missing_ok=True)
    return out, durations


def export_video(pptx, durations):
    ps = VIDEO / "_export.ps1"
    video = VIDEO / "石油勘探开发智能化可能性地图_网站演示_720p.mp4"
    dur_list = ",".join(str(round(x, 3)) for x in durations)
    lines = [
        "$ErrorActionPreference = 'Stop'",
        "$app = New-Object -ComObject PowerPoint.Application",
        f"$pres = $app.Presentations.Open('{str(pptx).replace(chr(39), chr(39)*2)}', $false, $false, $false)",
        f"$durations = @({dur_list})",
        "for ($i = 1; $i -le $pres.Slides.Count; $i++) {",
        "  $slide = $pres.Slides.Item($i)",
        "  foreach ($shape in $slide.Shapes) {",
        "    if ($shape.Type -eq 16) {",
        "      $shape.AnimationSettings.PlaySettings.PlayOnEntry = -1",
        "      $shape.AnimationSettings.PlaySettings.HideWhileNotPlaying = -1",
        "      $shape.AnimationSettings.PlaySettings.LoopUntilStopped = 0",
        "    }",
        "  }",
        "  $slide.SlideShowTransition.AdvanceOnTime = -1",
        "  $slide.SlideShowTransition.AdvanceTime = [single]$durations[$i-1]",
        "}",
        "$pres.Save()",
        f"$pres.CreateVideo('{str(video).replace(chr(39), chr(39)*2)}', -1, 1, 720, 30, 60)",
        "for ($n=0; $n -lt 240; $n++) {",
        "  Start-Sleep -Seconds 2",
        "  if ($pres.CreateVideoStatus -ne 1) { break }",
        "}",
        "Write-Output ('VIDEO_STATUS=' + $pres.CreateVideoStatus)",
        "$pres.Close()",
        "$app.Quit()",
    ]
    ps.write_text("\n".join(lines), encoding="utf-8-sig")
    subprocess.run(["powershell.exe", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", str(ps)], check=True)
    ps.unlink(missing_ok=True)
    return video


if __name__ == "__main__":
    title_slide()
    overview_slide()
    e1_slide()
    w3_slide()
    d2_slide()
    packaging_slide()
    summary_slide()
    synthesize()
    pptx, durations = build_pptx()
    print("PPTX", pptx)
    print("DURATION", sum(durations))
    if "--export" in __import__("sys").argv:
        print("VIDEO", export_video(pptx, durations))
