import JSZip from "jszip";

// ============================================================
// PPTX 渲染器：在浏览器端解析 .pptx 文件，保持原始排版渲染
// ============================================================

export interface SlideContent {
  pageNumber: number;
  /** 渲染后的 HTML 字符串（含内联样式，保留原始排版） */
  html: string;
  /** 幻灯片宽度（EMU） */
  width: number;
  /** 幻灯片高度（EMU） */
  height: number;
  /** 纯文本备份（用于批注引用） */
  texts: string[];
}

// OOXML 命名空间
const NS = {
  A: "http://schemas.openxmlformats.org/drawingml/2006/main",
  R: "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
  P: "http://schemas.openxmlformats.org/presentationml/2006/main",
} as const;

// EMU → px 转换（基于 96 DPI 标准屏幕）
const EMU_PER_INCH = 914400;
const PX_PER_INCH = 96;
const EMU_TO_PX = PX_PER_INCH / EMU_PER_INCH;

// 默认幻灯片尺寸（EMU）
const DEFAULT_WIDTH = 12192000; // 标准 4:3
const DEFAULT_HEIGHT = 6858000;

// ============== 工具函数 ==============

function slideNumber(name: string): number {
  const m = name.match(/slide(\d+)\.xml$/);
  return m ? parseInt(m[1], 10) : 0;
}

function emuToPx(emu: number): number {
  return Math.round(emu * EMU_TO_PX * 100) / 100;
}

function resolveRelTarget(slidePath: string, target: string): string {
  const base = slidePath.substring(0, slidePath.lastIndexOf("/"));
  const parts = base.split("/");
  for (const seg of target.split("/")) {
    if (seg === "..") parts.pop();
    else if (seg !== "." && seg !== "") parts.push(seg);
  }
  return parts.join("/");
}

/** 读取 XML 元素的属性值，支持命名空间和无命名空间 */
function attr(el: Element, localName: string, ns?: string): string | null {
  if (ns) {
    const v = el.getAttributeNS(ns, localName);
    if (v !== null) return v;
  }
  return el.getAttribute(localName);
}

/** 读取 EMU 值并转为 px */
function emuAttr(el: Element, name: string): number | null {
  const v = attr(el, name, NS.A);
  if (v === null) return null;
  const n = parseInt(v, 10);
  return isNaN(n) ? null : emuToPx(n);
}

function extToMime(ext: string): string {
  const m: Record<string, string> = {
    png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg",
    gif: "image/gif", svg: "image/svg+xml", bmp: "image/bmp",
    webp: "image/webp", wmf: "image/wmf", emf: "image/emf",
  };
  return m[ext.toLowerCase()] || "";
}

// ============== 颜色解析 ==============

function parseColor(el: Element, tag: string): string | null {
  const node = el.getElementsByTagNameNS(NS.A, tag)[0];
  if (!node) return null;
  const srgb = attr(node, "srgbClr") || attr(node, "srgbClr", NS.A);
  if (srgb) return `#${srgb}`;
  const scheme = attr(node, "schemeClr") || attr(node, "schemeClr", NS.A);
  if (scheme) {
    const map: Record<string, string> = {
      dk1: "#000000", dk2: "#44546a", lt1: "#ffffff", lt2: "#e7e6e6",
      accent1: "#4472c4", accent2: "#ed7d31", accent3: "#a5a5a5",
      accent4: "#ffc000", accent5: "#5b9bd5", accent6: "#70ad47",
      bg1: "#ffffff", bg2: "#e7e6e6", tx1: "#000000", tx2: "#44546a",
    };
    return map[scheme.toLowerCase()] || null;
  }
  return null;
}

// ============== 文本运行解析 ==============

interface TextRun {
  text: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  fontSize: number | null; // pt
  color: string | null;
  fontFamily: string | null;
}

function parseRpr(rPr: Element | null): Omit<TextRun, "text"> {
  if (!rPr) return { bold: false, italic: false, underline: false, strikethrough: false, fontSize: null, color: null, fontFamily: null };
  return {
    bold: rPr.getAttribute("b") === "1" || !!rPr.getElementsByTagNameNS(NS.A, "b")[0],
    italic: rPr.getAttribute("i") === "1" || !!rPr.getElementsByTagNameNS(NS.A, "i")[0],
    underline: rPr.getAttribute("u") === "sng" || !!rPr.getElementsByTagNameNS(NS.A, "u")[0],
    strikethrough: rPr.getAttribute("strike") === "sngStrike" || !!rPr.getElementsByTagNameNS(NS.A, "strike")[0],
    fontSize: (() => { const s = attr(rPr, "sz", NS.A); return s ? parseInt(s) / 100 : null; })(),
    color: parseColor(rPr, "solidFill"),
    fontFamily: (() => {
      const latin = rPr.getElementsByTagNameNS(NS.A, "latin")[0];
      return latin ? (attr(latin, "typeface") || attr(latin, "typeface", NS.A)) : null;
    })(),
  };
}

function parseParagraph(pEl: Element): TextRun[] {
  const runs: TextRun[] = [];
  const rEls = pEl.getElementsByTagNameNS(NS.A, "r");
  const defaultRPr = parseRpr(pEl.getElementsByTagNameNS(NS.A, "rPr")[0]);

  for (let i = 0; i < rEls.length; i++) {
    const rEl = rEls[i];
    const tEl = rEl.getElementsByTagNameNS(NS.A, "t")[0];
    const text = tEl?.textContent || "";
    const rpr = parseRpr(rEl.getElementsByTagNameNS(NS.A, "rPr")[0]);
    runs.push({
      text,
      bold: rpr.bold || defaultRPr.bold,
      italic: rpr.italic || defaultRPr.italic,
      underline: rpr.underline || defaultRPr.underline,
      strikethrough: rpr.strikethrough || defaultRPr.strikethrough,
      fontSize: rpr.fontSize ?? defaultRPr.fontSize,
      color: rpr.color ?? defaultRPr.color,
      fontFamily: rpr.fontFamily ?? defaultRPr.fontFamily,
    });
  }
  return runs;
}

function runsToHtml(runs: TextRun[]): string {
  if (runs.length === 0) return "";
  return runs.map(r => {
    let style = "";
    if (r.fontSize) style += `font-size:${r.fontSize}pt;`;
    if (r.color) style += `color:${r.color};`;
    if (r.fontFamily) style += `font-family:'${r.fontFamily}',sans-serif;`;
    if (r.bold) style += "font-weight:bold;";
    if (r.italic) style += "font-style:italic;";
    if (r.underline || r.strikethrough) {
      style += "text-decoration:";
      const deco: string[] = [];
      if (r.underline) deco.push("underline");
      if (r.strikethrough) deco.push("line-through");
      style += deco.join(" ") + ";";
    }
    const escaped = r.text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `<span style="${style}">${escaped}</span>`;
  }).join("");
}

// ============== 段落对齐 ==============

function parseAlignment(pEl: Element): string {
  const pPr = pEl.getElementsByTagNameNS(NS.A, "pPr")[0];
  if (!pPr) return "left";
  const algn = attr(pPr, "algn", NS.A);
  const map: Record<string, string> = { ctr: "center", r: "right", just: "justify", dist: "justify" };
  return map[algn || ""] || "left";
}

// ============== 形状渲染 ==============

function renderShape(
  spEl: Element,
  slidePath: string,
  relMap: Map<string, string>,
  imageCache: Map<string, string>,
  zip: JSZip,
): { html: string; texts: string[] } {
  const texts: string[] = [];
  const spPr = spEl.getElementsByTagNameNS(NS.A, "spPr")[0];
  const xfrm = spPr?.getElementsByTagNameNS(NS.A, "xfrm")[0];
  const off = xfrm?.getElementsByTagNameNS(NS.A, "off")[0];
  const ext = xfrm?.getElementsByTagNameNS(NS.A, "ext")[0];

  const left = off ? emuAttr(off, "x") ?? 0 : 0;
  const top = off ? emuAttr(off, "y") ?? 0 : 0;
  const width = ext ? emuAttr(ext, "cx") ?? 200 : 200;
  const height = ext ? emuAttr(ext, "cy") ?? 100 : 100;

  let style = `position:absolute;left:${left}px;top:${top}px;width:${width}px;height:${height}px;overflow:hidden;`;
  style += "box-sizing:border-box;";

  // 填充颜色
  const solidFill = spPr?.getElementsByTagNameNS(NS.A, "solidFill")[0];
  if (solidFill) {
    const fillColor = parseColor(spPr!, "solidFill");
    if (fillColor) style += `background-color:${fillColor};`;
  }

  // 边框
  const ln = spPr?.getElementsByTagNameNS(NS.A, "ln")[0];
  if (ln) {
    const w = emuAttr(ln, "w") ?? 1;
    const borderColor = parseColor(ln, "solidFill") || "#000000";
    style += `border:${Math.max(0.5, w)}px solid ${borderColor};`;
  }

  // 文本内容
  const txBody = spEl.getElementsByTagNameNS(NS.A, "txBody")[0];
  let innerHtml = "";
  if (txBody) {
    const bodyPr = txBody.getElementsByTagNameNS(NS.A, "bodyPr")[0];
    const lIns = bodyPr ? emuAttr(bodyPr, "lIns") ?? emuToPx(91440) : emuToPx(91440);
    const rIns = bodyPr ? emuAttr(bodyPr, "rIns") ?? emuToPx(91440) : emuToPx(91440);
    const tIns = bodyPr ? emuAttr(bodyPr, "tIns") ?? emuToPx(45720) : emuToPx(45720);
    const bIns = bodyPr ? emuAttr(bodyPr, "bIns") ?? emuToPx(45720) : emuToPx(45720);
    const wrap = bodyPr ? (attr(bodyPr, "wrap", NS.A) || "square") : "square";
    const anchor = bodyPr ? (attr(bodyPr, "anchor", NS.A) || "t") : "t";

    let anchorStyle = "justify-content:flex-start;";
    if (anchor === "ctr" || anchor === "mid") anchorStyle = "justify-content:center;";
    else if (anchor === "b" || anchor === "bottom") anchorStyle = "justify-content:flex-end;";

    const paragraphs = txBody.getElementsByTagNameNS(NS.A, "p");
    const paraHtmls: string[] = [];
    for (let i = 0; i < paragraphs.length; i++) {
      const runs = parseParagraph(paragraphs[i]);
      const align = parseAlignment(paragraphs[i]);
      const runsHtml = runsToHtml(runs);
      if (runsHtml) {
        paraHtmls.push(`<div style="text-align:${align};line-height:1.2;">${runsHtml}</div>`);
        const lineText = runs.map(r => r.text).join("").trim();
        if (lineText) texts.push(lineText);
      }
    }
    innerHtml = `<div style="display:flex;flex-direction:column;${anchorStyle}height:100%;padding:${tIns}px ${rIns}px ${bIns}px ${lIns}px;word-wrap:${wrap === "none" ? "normal" : "break-word"};">${paraHtmls.join("")}</div>`;
  }

  // 图片
  const blipFill = spPr?.getElementsByTagNameNS(NS.A, "blipFill")[0];
  if (blipFill) {
    const blip = blipFill.getElementsByTagNameNS(NS.A, "blip")[0];
    if (blip) {
      const embed = attr(blip, "embed", NS.R) || blip.getAttribute("r:embed");
      if (embed) {
        const target = relMap.get(embed);
        if (target) {
          const resolved = resolveRelTarget(slidePath, target);
          let dataUrl = imageCache.get(resolved);
          if (!dataUrl) {
            const file = zip.file(resolved);
            if (file) {
              const ext = resolved.substring(resolved.lastIndexOf(".") + 1);
              const mime = extToMime(ext);
              if (mime) {
                // 同步读取小文件，避免异步问题
                dataUrl = `__IMG_PENDING__:${resolved}`;
              }
            }
          }
          if (dataUrl) {
            style += `background-image:url(${dataUrl});background-size:contain;background-repeat:no-repeat;background-position:center;`;
          }
        }
      }
    }
  }

  return { html: `<div style="${style}">${innerHtml}</div>`, texts };
}

// ============== 主解析函数 ==============

export async function parsePptx(arrayBuffer: ArrayBuffer): Promise<SlideContent[]> {
  const zip = await JSZip.loadAsync(arrayBuffer);

  // 读取幻灯片尺寸
  let slideWidth = DEFAULT_WIDTH;
  let slideHeight = DEFAULT_HEIGHT;
  const presXml = zip.file("ppt/presentation.xml");
  if (presXml) {
    const presStr = await presXml.async("string");
    const presDoc = new DOMParser().parseFromString(presStr, "application/xml");
    const sldSz = presDoc.getElementsByTagNameNS(NS.P, "sldSz")[0];
    if (sldSz) {
      const cx = parseInt(attr(sldSz, "cx") || "", 10);
      const cy = parseInt(attr(sldSz, "cy") || "", 10);
      if (!isNaN(cx)) slideWidth = cx;
      if (!isNaN(cy)) slideHeight = cy;
    }
  }

  const slideNames = Object.keys(zip.files)
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => slideNumber(a) - slideNumber(b));

  const slides: SlideContent[] = [];

  // 预加载所有图片
  const imageCache = new Map<string, string>();
  const imageFiles = Object.keys(zip.files).filter((n) =>
    /^ppt\/media\/image\d+\.\w+$/i.test(n) || /^ppt\/media\/image\d+\.\w+$/i.test(n),
  );
  await Promise.all(
    imageFiles.map(async (path) => {
      const file = zip.file(path);
      if (!file) return;
      const ext = path.substring(path.lastIndexOf(".") + 1);
      const mime = extToMime(ext);
      if (!mime) return;
      const base64 = await file.async("base64");
      imageCache.set(path, `data:${mime};base64,${base64}`);
    }),
  );

  for (const slideName of slideNames) {
    const pageNumber = slideNumber(slideName);
    const xml = await zip.file(slideName)!.async("string");
    const doc = new DOMParser().parseFromString(xml, "application/xml");

    // 读取关系文件
    const relsPath = "ppt/slides/_rels/" + slideName.substring("ppt/slides/".length).replace(/\.xml$/, ".xml.rels");
    const relsXml = zip.file(relsPath) ? await zip.file(relsPath)!.async("string") : "";
    const relMap = new Map<string, string>();
    if (relsXml) {
      const relDoc = new DOMParser().parseFromString(relsXml, "application/xml");
      const rels = relDoc.getElementsByTagNameNS("*", "Relationship");
      for (let i = 0; i < rels.length; i++) {
        const id = rels[i].getAttribute("Id");
        const target = rels[i].getAttribute("Target");
        if (id && target) relMap.set(id, target);
      }
    }

    const allTexts: string[] = [];
    const shapesHtml: string[] = [];

    // 渲染所有形状
    const spTree = doc.getElementsByTagNameNS(NS.P, "spTree")[0];
    if (spTree) {
      const shapes = spTree.children;
      for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const tagName = shape.localName || shape.tagName;
        if (tagName === "sp" || tagName === "pic" || tagName === "grpSp" || tagName === "graphicFrame") {
          try {
            const result = renderShape(shape, slideName, relMap, imageCache, zip);
            shapesHtml.push(result.html);
            allTexts.push(...result.texts);
          } catch {
            // 跳过无法渲染的形状
          }
        }
      }
    }

    // 计算显示比例（让幻灯片适配 960px 宽度）
    const displayWidth = 960;
    const scale = displayWidth / emuToPx(slideWidth);

    const html = `
      <div style="
        position:relative;
        width:${displayWidth}px;
        height:${Math.round(emuToPx(slideHeight) * scale)}px;
        background:#ffffff;
        overflow:hidden;
        transform-origin:top left;
        transform:scale(${scale});
        margin-bottom:${Math.round(emuToPx(slideHeight) * scale) - emuToPx(slideHeight)}px;
      ">
        ${shapesHtml.join("\n")}
      </div>
    `;

    slides.push({
      pageNumber,
      html,
      width: slideWidth,
      height: slideHeight,
      texts: allTexts,
    });
  }

  return slides;
}