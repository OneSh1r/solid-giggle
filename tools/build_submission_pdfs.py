from pathlib import Path
from datetime import date
import math
from PIL import Image as PILImage

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Image, KeepTogether, NextPageTemplate
)
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "submission" / "docs"
QA = ROOT / "submission" / "qa"
CROPS = QA / "crops"
OUT.mkdir(parents=True, exist_ok=True)
CROPS.mkdir(parents=True, exist_ok=True)

FONT_REGULAR = r"C:\Windows\Fonts\Deng.ttf"
FONT_BOLD = r"C:\Windows\Fonts\Dengb.ttf"
pdfmetrics.registerFont(TTFont("Deng", FONT_REGULAR))
pdfmetrics.registerFont(TTFont("DengBold", FONT_BOLD))

JADE = colors.HexColor("#2F7D6B")
JADE_LIGHT = colors.HexColor("#E7F2ED")
CLAY = colors.HexColor("#B46D3B")
CLAY_LIGHT = colors.HexColor("#F8ECDF")
INK = colors.HexColor("#213033")
INK2 = colors.HexColor("#536267")
MUTED = colors.HexColor("#7D898C")
LINE = colors.HexColor("#D9D9D9")
PAPER = colors.HexColor("#FBFAF6")
PANEL = colors.HexColor("#F5F3EC")
BLUE = colors.HexColor("#41699B")


BASE = getSampleStyleSheet()
STYLES = {
    "title": ParagraphStyle(
        "TitleCN", parent=BASE["Title"], fontName="DengBold", fontSize=26,
        leading=36, textColor=colors.black, spaceAfter=12
    ),
    "subtitle": ParagraphStyle(
        "SubtitleCN", parent=BASE["Normal"], fontName="Deng", fontSize=12.5,
        leading=21, textColor=colors.black, spaceAfter=8
    ),
    "h1": ParagraphStyle(
        "H1CN", parent=BASE["Heading1"], fontName="DengBold", fontSize=18,
        leading=26, textColor=colors.black, spaceBefore=8, spaceAfter=11
    ),
    "h2": ParagraphStyle(
        "H2CN", parent=BASE["Heading2"], fontName="DengBold", fontSize=13.5,
        leading=21, textColor=colors.black, spaceBefore=8, spaceAfter=7
    ),
    "body": ParagraphStyle(
        "BodyCN", parent=BASE["BodyText"], fontName="Deng", fontSize=10.8,
        leading=18, textColor=INK, spaceAfter=7, wordWrap="CJK"
    ),
    "body_small": ParagraphStyle(
        "BodySmallCN", parent=BASE["BodyText"], fontName="Deng", fontSize=9.2,
        leading=14.5, textColor=INK2, spaceAfter=4, wordWrap="CJK"
    ),
    "caption": ParagraphStyle(
        "CaptionCN", parent=BASE["Normal"], fontName="Deng", fontSize=8.3,
        leading=12, textColor=MUTED, alignment=TA_LEFT, spaceBefore=3, spaceAfter=7,
        wordWrap="CJK"
    ),
    "bullet": ParagraphStyle(
        "BulletCN", parent=BASE["BodyText"], fontName="Deng", fontSize=10.6,
        leading=17, textColor=INK, leftIndent=12, firstLineIndent=-8,
        bulletIndent=2, spaceAfter=5, wordWrap="CJK"
    ),
    "cover_meta": ParagraphStyle(
        "CoverMeta", parent=BASE["Normal"], fontName="Deng", fontSize=11,
        leading=19, textColor=INK2, alignment=TA_LEFT
    ),
}


def P(text, style="body"):
    return Paragraph(text, STYLES[style])


def bullet(text):
    return Paragraph("• " + text, STYLES["bullet"])


def cover(canv, doc, title, subtitle, meta_lines):
    w, h = A4
    canv.saveState()
    canv.setFillColor(PAPER)
    canv.rect(0, 0, w, h, fill=1, stroke=0)

    # Quiet field-map grid.
    canv.setStrokeColor(colors.HexColor("#E9E5DA"))
    canv.setLineWidth(0.35)
    for x in range(16, int(w), 18):
        canv.line(x * mm / mm, 0, x * mm / mm, h)
    for y in range(16, int(h), 18):
        canv.line(0, y * mm / mm, w, y * mm / mm)

    # Geological contour motif.
    canv.setStrokeColor(colors.HexColor("#B8D7CC"))
    canv.setLineWidth(1.2)
    for k in range(7):
        pts = []
        for i in range(90):
            x = w * 0.56 + i * (w * 0.38 / 89)
            y = h * 0.43 + math.sin(i / 9 + k * .42) * (10 + k * 3) + k * 15
            pts.append((x, y))
        p = canv.beginPath()
        p.moveTo(*pts[0])
        for q in pts[1:]:
            p.lineTo(*q)
        canv.drawPath(p, fill=0, stroke=1)

    canv.setFillColor(JADE)
    canv.circle(w - 53 * mm, h - 54 * mm, 9 * mm, fill=1, stroke=0)
    canv.setFillColor(colors.white)
    canv.setFont("DengBold", 12)
    canv.drawCentredString(w - 53 * mm, h - 56 * mm, "AI")

    canv.setFillColor(colors.black)
    canv.setFont("DengBold", 9)
    canv.drawString(22 * mm, h - 29 * mm, "可视化导论课程项目")
    canv.setFont("Deng", 10.5)
    canv.drawString(22 * mm, h - 36 * mm, "石油勘探开发的智能化可能性地图")

    canv.setFont("DengBold", 27)
    canv.drawString(22 * mm, 111 * mm, title)
    canv.setFont("Deng", 13)
    canv.setFillColor(INK2)
    canv.drawString(22 * mm, 98 * mm, subtitle)

    canv.setFillColor(colors.black)
    canv.setFont("Deng", 10.5)
    y = 58 * mm
    for line in meta_lines:
        canv.drawString(22 * mm, y, line)
        y -= 7 * mm

    canv.setFillColor(MUTED)
    canv.setFont("Deng", 8.5)
    canv.drawString(22 * mm, 16 * mm, "2026 年 10 月 26 日")
    canv.drawRightString(w - 22 * mm, 16 * mm, "纯前端 · 无后端依赖")
    canv.restoreState()


def page_deco(canv, doc):
    w, h = A4
    canv.saveState()
    canv.setStrokeColor(colors.HexColor("#E9E5DA"))
    canv.setLineWidth(0.5)
    canv.line(20 * mm, 16 * mm, w - 20 * mm, 16 * mm)
    canv.setFont("Deng", 8)
    canv.setFillColor(MUTED)
    canv.drawString(20 * mm, 10.5 * mm, "石油勘探开发的智能化可能性地图")
    canv.drawRightString(w - 20 * mm, 10.5 * mm, str(doc.page))
    canv.restoreState()


class AtlasDoc(BaseDocTemplate):
    def __init__(self, filename, title, subtitle, meta_lines, **kwargs):
        super().__init__(filename, pagesize=A4, leftMargin=20 * mm,
                         rightMargin=20 * mm, topMargin=19 * mm,
                         bottomMargin=22 * mm, **kwargs)
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height,
                      leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates([
            PageTemplate(
                id="cover",
                frames=[frame],
                onPage=lambda c, d: cover(c, d, title, subtitle, meta_lines)
            ),
            PageTemplate(id="content", frames=[frame], onPage=page_deco)
        ])


def image_plate(path, width_mm, caption, max_height_mm=None):
    img = Image(str(path))
    scale = (width_mm * mm) / img.imageWidth
    iw = width_mm * mm
    ih = img.imageHeight * scale
    if max_height_mm and ih > max_height_mm * mm:
        ih = max_height_mm * mm
        iw = img.imageWidth * (ih / img.imageHeight)
    img.drawWidth = iw
    img.drawHeight = ih
    return [img, P(caption, "caption")]


def section_label(text):
    return Table(
        [[Paragraph(text, ParagraphStyle(
            "SectionLabel", fontName="DengBold", fontSize=9, leading=12,
            textColor=JADE, letterSpacing=0
        ))]],
        colWidths=[42 * mm],
        style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), JADE_LIGHT),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#B8D7CC")),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ])
    )


def data_table(header, rows, widths):
    data = [[Paragraph(h, ParagraphStyle(
        "TH", fontName="DengBold", fontSize=8.5, leading=12,
        textColor=colors.white, alignment=TA_LEFT
    )) for h in header]]
    for row in rows:
        data.append([Paragraph(str(c), ParagraphStyle(
            "TD", fontName="Deng", fontSize=8.2, leading=12.5,
            textColor=INK, wordWrap="CJK"
        )) for c in row])
    t = Table(data, colWidths=[x * mm for x in widths], repeatRows=1, hAlign="LEFT")
    style = [
        ("BACKGROUND", (0, 0), (-1, 0), INK),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("BOX", (0, 0), (-1, -1), 0.55, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.55, LINE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]
    for r in range(1, len(data)):
        if r % 2 == 0:
            style.append(("BACKGROUND", (0, r), (-1, r), colors.HexColor("#F7F9F8")))
    t.setStyle(TableStyle(style))
    return t


def crop_assets():
    specs = {
        "home.png": (68, 42, 1362, 930),
        "eor-bg.png": (105, 154, 1335, 1020),
        "eor-flow.png": (105, 150, 1335, 940),
        "eor-demo.png": (105, 142, 1335, 1082),
        "w3-demo.png": (105, 142, 1335, 1082),
        "d2-demo.png": (105, 142, 1335, 1082),
    }
    for name, box in specs.items():
        src = QA / name
        if not src.exists():
            continue
        im = PILImage.open(src)
        im.crop(box).save(CROPS / name)


def build_overview():
    filename = OUT / "网站关键亮点说明.pdf"
    meta = [
        "项目名称：石油勘探开发的智能化可能性地图",
        "文档用途：说明网站结构、案例体系、可视化方法与验收结果",
        "学号：________",
        "姓名：________",
    ]
    doc = AtlasDoc(str(filename), "网站关键亮点说明", "案例体系、可视化设计与验收结果", meta)
    story = [NextPageTemplate("content"), PageBreak()]
    story += [
        section_label("PROJECT SUMMARY"),
        Spacer(1, 5 * mm),
        P("本项目把石油作业链拆成可检索的智能化机会，并为关键场景提供可运行的纯前端案例。网站现状包含 13 个环节、61 个候选场景和 10 个可运行案例，其中 9 个为本轮新增案例。新增案例覆盖增采环节全部 5 个子场景，并扩展到钻井、测井与运输环节。", "body"),
        P("网站不是生产控制软件，也不是论文案例汇编。它帮助使用者判断一个石油场景能否被智能化方法改造成可定义的任务：输入是什么，数据门槛在哪里，AI 替代哪一步，结果应在什么条件下交给人工复核。", "body"),
        Spacer(1, 2 * mm),
        data_table(
            ["交付项", "当前结果", "说明"],
            [
                ["场景地图", "13 环节 / 61 场景", "按环节、方法、难度浏览"],
                ["新增案例", "9 个", "每个案例均有背景、流程、可运行示范"],
                ["增采覆盖", "e1 - e5 全部", "按学号末两位 11 映射至第 11 环节"],
                ["上传兼容", "9 / 9 通过", "在原始门户框架上逐包导入验证"],
                ["前端依赖", "0 个后端", "file:// 直接打开也可运行"],
            ],
            [33, 43, 75]
        ),
        Spacer(1, 5 * mm),
        section_label("WHY THE SYSTEM WORKS"),
        Spacer(1, 4 * mm),
        P("网站首页提供两条互补的检索路径。按环节浏览适合回答“我站在作业链哪一步”，按方法反查适合回答“手上的 CV、时序或优化技术能落到哪里”。场景详情再统一收束到专业背景、案例流程和可运行示范三个层次，避免把行业背景、技术方案和演示代码混成一段长文。", "body"),
        P("案例包与主站通过稳定接口连接。每个案例包包含 case.json、demo/index.html、demo/demo.css 和 demo/demo.js，既能作为站点内置插件，也能在不修改主框架的情况下通过“添加案例”按钮导入。流程步骤的图示字段由原门户的渲染器扩展而来，旧案例仍保持兼容。", "body"),
        Spacer(1, 3 * mm),
        P("本说明的范围", "h2"),
        bullet("覆盖交付物：网页本体、9 个案例包、亮点说明、结课报告与答辩脚本。"),
        bullet("不包含：真实油田数据、生产模型标定和线上服务器运维。"),
        bullet("验收重点：案例能否通过添加案例入口进入统一场景，并证明交互结果会改变工程判断。"),
        PageBreak(),
    ]

    story += [
        section_label("CASE PORTFOLIO"),
        Spacer(1, 5 * mm),
        P("九个新增案例的选题", "h1"),
        P("增采 5 个案例覆盖压裂参数、裂缝形态、化学驱配方、蒸汽吞吐和微生物采油；另外 4 个案例分别覆盖成像测井裂缝识别、测井数据修复、井下复杂前兆预警和管道泄漏检测。这些任务分布在不同的 AI 方法上，但都坚持同一原则：石油专业问题先成立，算法价值随后解释。", "body"),
        data_table(
            ["大类 - 小类", "场景", "主要方法", "示范中可观察的结果"],
            [
                ["增采 - 压裂参数优化", "e1", "OPT / 代理模型", "Pareto 前沿与风险权重"],
                ["增采 - 裂缝形态", "e2", "CV + OPT", "事件过滤与不确定带"],
                ["增采 - 化学驱配方", "e3", "OPT / 主动学习", "下一组实验的采集函数"],
                ["增采 - 蒸汽吞吐", "e4", "TS + OPT", "多周期产量与油汽比"],
                ["增采 - 微生物活性", "e5", "TS / 软测量", "阈值穿越与补注窗口"],
                ["测井 - 成像裂缝", "w3", "CV / 分割", "裂缝掩膜、产状与误报"],
                ["测井 - 数据修复", "w5", "TS / 序列补全", "插值与多曲线重建对比"],
                ["钻井 - 前兆预警", "d2", "TS / 异常检测", "提前量、误报与触发通道"],
                ["运输 - 泄漏检测", "t1", "TS / 多源检测", "站间定位与证据聚合"],
            ],
            [48, 17, 36, 58]
        ),
        Spacer(1, 4 * mm),
        P("案例内容不是“算法介绍 + 石油名词”的拼接。每个案例都从现场工序、传统做法及其局限出发，再说明 AI 替换哪一步、需要哪些数据、怎样评测、哪类错误最危险。背景、流程和示范使用同一组术语与指标，读者能从概念一路追到交互结果。", "body"),
        Spacer(1, 2 * mm),
        data_table(
            ["内容层", "回答的问题", "案例中的证据"],
            [
                ["专业背景", "为什么需要智能化", "传统流程、AI 介入点、数据就绪度"],
                ["案例流程", "怎样把方法落到工序", "四步流程、每步预期效果与常见坑"],
                ["可运行示范", "方法何时有效或失效", "参数滑杆、图表和状态判断"],
                ["验收指标", "结果能否被信任", "误差、区间、误报、提前量或复核队列"],
            ],
            [30, 55, 70]
        ),
        KeepTogether(image_plate(CROPS / "home.png", 153, "图 1  网站首页同时提供按环节浏览、按方法反查和案例覆盖统计。", 91)),
        P("首页的信息层级按“角色任务”组织：先看覆盖规模，再选检索路径，最后进入某一环节或某一方法。场景卡片只承担摘要职责，具体的问题、数据和难度在详情页展开，避免首页变成难以扫描的长列表。", "body"),
        data_table(
            ["页面", "主要问题", "视觉证据"],
            [
                ["首页", "从哪里开始找机会", "13 环节链条、方法卡、覆盖统计"],
                ["环节页", "这一环节有哪些任务", "方法、难度筛选与场景摘要"],
                ["详情页", "这个方向值不值得做", "四段背景、流程图、交互示范"],
                ["方法页", "我的技术能落到哪里", "跨环节分组与数量对比"],
            ],
            [29, 58, 68]
        ),
        PageBreak(),
    ]

    story += [
        section_label("VISUAL DESIGN"),
        Spacer(1, 5 * mm),
        P("四个层次的视觉强化", "h1"),
        P("专业背景层用流程对比、数据就绪度和风险剖面帮助非石油专业读者建立地图。案例流程层把每一步压缩成输入、处理、输出和验收指标，并在文字旁标出预期效果与常见坑。可运行示范层用参数滑杆、散点图、时序图、时间轴、井壁图像和管线剖面呈现结果。导航层保持稳定的方法色、难度色和面包屑，让用户在跨案例比较时依赖结构而非记忆。", "body"),
        KeepTogether(image_plate(CROPS / "eor-bg.png", 153, "图 2  专业背景把传统路径、AI 介入点、数据条件和技术风险放在同一阅读顺序中。", 86)),
        KeepTogether(image_plate(CROPS / "eor-flow.png", 153, "图 3  案例流程的每一步都带有描述本步关键变量的图示，而不是只有文字编号。", 84)),
        PageBreak(),
    ]

    story += [
        section_label("INTERACTIVE EVIDENCE"),
        Spacer(1, 5 * mm),
        P("可运行示范如何体现智能化价值", "h1"),
        P("示范不是播放动画，而是让参数改变结果。e1 的权重滑杆会改变 Pareto 推荐点；e2 的事件可信度门槛会同时影响裂缝半长和几何误差；e3 的候选散点区分“模型最优”和“下一组实验”；e4 把单周期产量放到六个周期的累计油汽比中比较；e5 的预测区间让补注决策看到尾部风险。", "body"),
        KeepTogether(image_plate(CROPS / "eor-demo.png", 154, "图 4  e1 压裂参数优化：候选方案、Pareto 前沿、推荐点与风险指标同步更新。", 86)),
        KeepTogether(image_plate(CROPS / "w3-demo.png", 154, "图 5  w3 成像测井裂缝识别：展开图像、检测掩膜、复核队列与产状统计同时出现。", 86)),
        PageBreak(),
        KeepTogether(image_plate(CROPS / "d2-demo.png", 154, "图 6  d2 井下复杂前兆预警：多通道异常、提前量、误报和触发通道被放在同一决策界面。", 86)),
        P("交互设计还检查“状态成对出现”：同一个参数变化后，必须同时改变结果和判断。下表是自动化测试中实际触发的三组状态，而不是仅验证控件是否存在。", "body"),
        data_table(
            ["案例", "改变的量", "界面同步改变"],
            [
                ["e1", "增产目标权重", "推荐点沿 Pareto 前沿移动"],
                ["d2", "现场噪声强度", "异常分数、提前量与误报数变化"],
                ["t1", "泄漏量与噪声", "检出状态、站间定位与误报风险变化"],
            ],
            [28, 55, 72]
        ),
        PageBreak(),
    ]

    story += [
        section_label("QUALITY GATE"),
        Spacer(1, 5 * mm),
        P("上传兼容与验证结果", "h1"),
        P("所有案例包在原始门户框架的独立副本上逐个通过“添加案例”按钮导入。测试使用真实文件输入，不是只读取 JSON 文本。每个包导入后都完成了案例注册、场景跳转和示范挂载；九个案例的交互滑杆也分别触发过更新。", "body"),
        data_table(
            ["检查项", "结果", "证据"],
            [
                ["案例注册", "10 / 10", "1 个内置样例 + 9 个新增案例"],
                ["可运行示范", "10 / 10", "实例化成功且无运行异常"],
                ["案例包导入", "9 / 9", "原始框架真实上传并提交"],
                ["工程实现", "纯前端", "无需服务器、数据库或外部素材"],
                ["流程可视化", "9 / 9", "四步流程均含过程图"],
            ],
            [43, 34, 78]
        ),
        Spacer(1, 5 * mm),
        P("我认为做得最好的地方", "h2"),
        bullet("<b>同一个案例内保持专业语义一致。</b>e2 的“事件可信度”同时出现在背景、流程和示范中，读者不必在两套词汇间转换。"),
        bullet("<b>把不确定性作为一等信息。</b>裂缝形态、微生物活性、管道定位都展示区间或误差，而不是只展示一个漂亮点估计。"),
        bullet("<b>交互结果能改变决策。</b>每个示范至少有一条参数会改变推荐、报警、修复或定位结果，避免“拖滑杆只动一根线”的空互动。"),
        bullet("<b>上传与内置共用内容。</b>案例包和站点插件使用同一套交互运行时，答辩内容与提交包内容保持一致。"),
        Spacer(1, 5 * mm),
        P("提交前必须补齐的信息", "h2"),
        P("本版本按“学号末两位 11，对应第 11 环节增采”完成必修覆盖。由于当前材料未提供学号与姓名，报告封面保留了填写位；如果实际学号末两位不是 11，需要重新核对必修类别。网站公开发布链接也需要在所选平台部署后替换。", "body"),
    ]
    doc.build(story)
    return filename


def build_report():
    filename = OUT / "可视化导论结课报告.pdf"
    meta = [
        "项目名称：石油勘探开发的智能化可能性地图",
        "学号：________",
        "姓名：________",
        "课程：可视化导论",
    ]
    doc = AtlasDoc(str(filename), "可视化导论结课报告", "石油勘探开发的智能化可能性地图", meta)
    story = [NextPageTemplate("content"), PageBreak()]
    story += [
        section_label("REPORT OUTLINE"),
        Spacer(1, 5 * mm),
        P("报告摘要", "h1"),
        P("这份结课报告围绕“可视化如何帮助人做判断”展开。我的网站把石油作业链拆成 61 个智能化候选场景，并为其中 10 个场景接入可运行案例。新增的 9 个案例均采用纯前端实现，既能作为站点内置内容，也能通过统一案例包格式导入原始门户。", "body"),
        P("我对可视化的核心理解是：可视化不是把数据装饰得更漂亮，而是把复杂关系压缩成可比较、可追溯、可操作的认知界面。好的可视化应该让读者看见变量之间的关系、发现异常、理解不确定性，并知道下一步该做什么。", "body"),
        data_table(
            ["报告部分", "讨论内容"],
            [
                ["1", "可视化的理解"],
                ["2", "网站与案例体系设计"],
                ["3", "使用的可视化技术与效果"],
                ["4", "可运行案例与验收结果"],
                ["5", "课程建议与个人反思"],
            ],
            [28, 127]
        ),
        Spacer(1, 4 * mm),
        P("本报告的组织方式", "h2"),
        P("第一章讨论判断标准，第二章说明系统结构，第三章把技术选择对应到具体案例，第四章给出运行与导入验证，第五章整理课程建议。报告中的截图来自最终版本，案例数量和测试结果与交付文件一致。", "body"),
        Spacer(1, 3 * mm),
        bullet("讨论对象：可视化如何帮助确定问题、选择方法并理解结果边界。"),
        bullet("证据来源：提交网站、9 个案例包、真实上传测试和交互状态测试。"),
        bullet("结论重点：可视化价值取决于它是否改变读者的比较、判断或下一步动作。"),
        PageBreak(),
    ]

    story += [
        section_label("01 UNDERSTANDING"),
        Spacer(1, 5 * mm),
        P("一、我对可视化的理解", "h1"),
        P("可视化首先是一种信息组织的责任。原始数据往往记录得完整，却不天然可以比较：一条测井曲线有上万采样点，一份压裂施工记录有十几个参数，一张微地震图有数千事件。读者真正需要的并不是看完所有数字，而是知道哪些差异决定结论，哪些噪声可以忽略。", "body"),
        P("其次，可视化必须保留不确定性。石油行业中的地下信息通常不能直接观测，裂缝形态、储层参数和微生物活性都存在多解性。如果界面只给出一条光滑曲线或一个精确推荐值，视觉会制造虚假的确定性。我的案例主动用区间、置信度门槛、帕累托前沿、误差和复核队列表达“模型知道什么、不知道什么”。", "body"),
        P("再次，可视化要支持动作。e1 的观点通过推荐点和风险权重体现；d2 的观点通过提前量和触发通道体现；t1 的观点通过站间定位与证据聚合体现。如果一张图不能改变读者的下一步动作，那么它可能只是展示，而不是决策界面。", "body"),
        P("最后，图示必须和文字互相校验。图能帮助快速扫读，但不能替代术语定义与边界条件。网站每个案例都先交代石油场景，再说明 AI 介入点，最后才进入交互。这种顺序避免了“先炫算法，再补背景”的阅读倒置。", "body"),
        Spacer(1, 5 * mm),
        P("我对“可视化质量”的判断", "h2"),
        data_table(
            ["判断维度", "本项目采用的检验问题"],
            [
                ["关系是否清楚", "图中的两个轴或两条序列是否表达真实工程变量"],
                ["比较是否公平", "模型结果是否有传统基线、是否有相同容差"],
                ["不确定性是否可见", "误差、置信区间或风险是否与推荐同时出现"],
                ["交互是否有效", "改变参数后，结果和判断是否一起改变"],
                ["专业含义是否准确", "图示单位、术语和场景是否经得起行业解释"],
            ],
            [43, 112]
        ),
        PageBreak(),
    ]

    story += [
        section_label("02 SYSTEM DESIGN"),
        Spacer(1, 5 * mm),
        P("二、网站与案例体系设计", "h1"),
        P("网站首页保留两条检索路径：按环节浏览和按方法反查。环节页按方法与难度筛选，方法页按环节分组，场景页统一挂载专业背景、案例流程和可运行示范。案例通过注册表接入，外壳不依赖案例内部实现，因此新增案例不会破坏导航、检索或上传功能。", "body"),
        P("本轮按“每 13 个学号循环、末两位映射到 13 个环节”的规则，采用学号末两位 11 的情形，重点完成第 11 环节增采的全部子场景。为避免案例数量刚过最低要求，我另外完成了 4 个跨环节案例，使总案例数达到 10 个。", "body"),
        data_table(
            ["层次", "技术组织", "可视化职责"],
            [
                ["场景数据", "assets/data.js", "统一名称、方法、难度、数据和参考方向"],
                ["案例内容", "background / workflow / demo", "从概念到流程再到交互证据"],
                ["外壳", "shell / registry / upload", "路由、筛选、案例切换与导入校验"],
                ["案例包", "case.json + demo/*", "脱离主站也可独立导入运行"],
            ],
            [32, 58, 65]
        ),
        Spacer(1, 4 * mm),
        KeepTogether(image_plate(CROPS / "home.png", 158, "图 1  首页把 13 个环节、方法分布、案例覆盖和难度构成压缩到同一个总览中。", 91)),
        P("首页先用规模统计建立范围感，再用 13 节点作业链建立位置感，最后用方法卡建立检索入口。背景纹样只提供空间层次，不承载数据含义，因此不会和真实图表争夺注意力。", "body"),
        PageBreak(),
        section_label("03 VISUAL METHODS"),
        Spacer(1, 5 * mm),
        P("三、使用的可视化技术及达成效果", "h1"),
        P("系统中的图表主要采用原生 SVG 和 Canvas/HTML 控件实现，不依赖在线图表库。这样既能保证 file:// 离线运行，也能让坐标、标注、交互和主题保持一致。九类示范分别使用散点、折线、柱形、时间轴、图像掩膜、状态指标和风险排序，但它们共享同一套视觉语义。", "body"),
        data_table(
            ["可视化技术", "使用案例", "达成效果"],
            [
                ["流程对比图", "所有新增案例背景", "把人工路径与 AI 介入点并列比较"],
                ["数据就绪矩阵", "所有新增案例背景", "看出哪类数据是门槛、哪类只是辅助"],
                ["风险剖面", "所有新增案例背景", "让高难度不只是标签"],
                ["步骤过程图", "全部流程步骤", "每一步说明输入、处理、输出与验收值"],
                ["交互散点图", "e1 / e3", "比较候选、Pareto 前沿与下一实验"],
                ["概率时序图", "e5 / d2 / t1", "表达预测区间、阈值和异常证据"],
                ["图像与掩膜", "w3", "把像素识别与产状解释连接起来"],
                ["多周期时间轴", "e4", "从单周期产量转向累计油汽比"],
            ],
            [42, 36, 77]
        ),
        Spacer(1, 5 * mm),
        P("以 w3 为例，展开井壁图不是装饰性插图。图中的正弦曲线对应井壁裂缝，右侧产状分布和倾角阈值会把像素结果转成地质解释。以 e5 为例，软测量曲线旁边的区间和风险阈值共同回答“何时需要提前取样”。这些设计使图不只是结果的容器，而是论证过程的一部分。", "body"),
        KeepTogether(image_plate(CROPS / "w3-demo.png", 154, "图 2  w3 通过图像、掩膜、指标和复核队列组织一次完整解释过程。", 86)),
        PageBreak(),
    ]

    story += [
        section_label("04 CASE EFFECTS"),
        Spacer(1, 5 * mm),
        P("四、可运行案例与验收结果", "h1"),
        P("案例演示只追求讲清智能化方法的要点，不使用真实生产数据。所有数值均为教学合成，但任务结构、指标含义和失败模式来自所给场景。演示中的参数滑杆会实时改变推荐、风险、定位或报警状态，便于在答辩时直接说明方法的价值及边界。", "body"),
        KeepTogether(image_plate(CROPS / "eor-demo.png", 154, "图 3  e1 的代理模型与多目标搜索演示。", 74)),
        KeepTogether(image_plate(CROPS / "d2-demo.png", 154, "图 4  d2 的多通道前兆预警演示。", 74)),
        P("工程验证结果显示，10 个案例全部注册，10 个带可运行示范；新增案例包在原始门户副本中逐个通过真实“添加案例”入口导入，9 个案例均成功跳转并挂载。主站脚本没有抛出运行异常。对课程作业而言，这一验证比单纯截图更能证明案例不是孤立网页，而是能进入统一系统。", "body"),
        P("我也保留了每份案例包的独立压缩文件，文件名按“大类别-小类别”组织。答辩时可任选 e1、e5、w3 或 d2 演示：e1 适合讲优化，e5 适合讲小样本和风险阈值，w3 适合讲图像与专业解释，d2 适合讲数据不均衡和误报代价。", "body"),
        PageBreak(),
    ]

    story += [
        section_label("05 REFLECTION"),
        Spacer(1, 5 * mm),
        P("五、课程建议与个人反思", "h1"),
        P("这次设计让我认识到，跨专业可视化的主要难点不是绘图 API，而是术语和目标的翻译。石油场景包含大量默认知识，AI 场景又包含另一套默认知识。要让两者结合，必须把“业务问题、数据条件、模型输出、人工责任”分别说清，并让图示与文字保持同一语义。", "body"),
        P("课程建议一：增加“反面样例”讨论。只展示优秀可视化容易让同学把风格当方法，比较一张误导性图表和一张可解释图表，能更快理解坐标尺度、基线、总量与比例、不确定性的作用。", "body"),
        P("课程建议二：设置跨专业小组短作业。石油、地质或医学背景的同学可以负责任务定义，计算机背景同学负责数据与交互。先在 30 分钟内统一术语，再做图，比直接开始写页面更能训练信息设计能力。", "body"),
        P("课程建议三：把“交互是否改变判断”纳入评分。拖滑杆后如果所有结论保持不变，说明交互没有信息价值。可以要求每组提交两条状态截图，并说明参数变化如何影响结论。", "body"),
        P("课程建议四：增加可访问性和离线交付检查。中文课程项目常用网页提交，但投屏环境、字体和网络不总是可控。检查键盘操作、对比度、图例、备选文本和离线运行，能减少答辩现场的不确定性。", "body"),
        P("如果继续改进，我会把真实公开数据集接入一个最成熟的案例，例如用 FORCE 岩性数据替换部分合成测井曲线；同时增加跨案例搜索，让用户从“问题、数据、方法、人工复核方式”四个维度同时筛选。当前版本已经把案例、流程和演示打通，下一步应加强真实数据验证和跨案例比较。", "body"),
        Spacer(1, 10 * mm),
        P("项目结论", "h2"),
        P("可视化把一个跨学科问题从“名词很多”变成“可以逐步判断的决策链”。网站通过统一的场景地图、可视化的专业背景、逐步骤的案例流程和可交互的算法示范，证明了智能化可能性可以被浏览、解释和验证，而不只是被列举。", "body"),
    ]
    doc.build(story)
    return filename


if __name__ == "__main__":
    crop_assets()
    a = build_overview()
    b = build_report()
    print(a)
    print(b)
