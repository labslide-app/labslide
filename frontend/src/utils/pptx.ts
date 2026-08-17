import JSZip from "jszip";

export interface SlideContent {
  pageNumber: number;
  texts: string[];
  images: string[]; // data URL
}

const NS_DRAWING = "http://schemas.openxmlformats.org/drawingml/2006/main";
const NS_REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";

function slideNumber(name: string): number {
  const m = name.match(/slide(\d+)\.xml$/);
  return m ? parseInt(m[1], 10) : 0;
}

function extToMime(ext: string): string {
  switch (ext.toLowerCase()) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "svg":
      return "image/svg+xml";
    case "bmp":
      return "image/bmp";
    case "webp":
      return "image/webp";
    default:
      return "";
  }
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

/**
 * 在浏览器端解包 PPTX（zip），逐页提取文字与图片，返回轻量预览数据。
 * 仅支持 .pptx；.ppt（旧二进制格式）无法用 zip 解析。
 */
export async function parsePptx(arrayBuffer: ArrayBuffer): Promise<SlideContent[]> {
  const zip = await JSZip.loadAsync(arrayBuffer);

  const slideNames = Object.keys(zip.files)
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => slideNumber(a) - slideNumber(b));

  const slides: SlideContent[] = [];

  for (const slideName of slideNames) {
    const pageNumber = slideNumber(slideName);
    const xml = await zip.file(slideName)!.async("string");
    const doc = new DOMParser().parseFromString(xml, "application/xml");

    // 逐段提取文字
    const texts: string[] = [];
    const paragraphs = doc.getElementsByTagNameNS(NS_DRAWING, "p");
    for (let i = 0; i < paragraphs.length; i++) {
      const runs = paragraphs[i].getElementsByTagNameNS(NS_DRAWING, "t");
      let line = "";
      for (let j = 0; j < runs.length; j++) line += runs[j].textContent || "";
      const trimmed = line.trim();
      if (trimmed) texts.push(trimmed);
    }

    // 提取图片引用
    const relsPath = "ppt/slides/_rels/" + slideName.substring("ppt/slides/".length).replace(/\.xml$/, ".xml.rels");
    const relsXml = zip.file(relsPath) ? await zip.file(relsPath)!.async("string") : "";
    const relMap = new Map<string, string>();
    if (relsXml) {
      const relDoc = new DOMParser().parseFromString(relsXml, "application/xml");
      const rels = relDoc.getElementsByTagNameNS("*", "Relationship");
      for (let i = 0; i < rels.length; i++) {
        relMap.set(rels[i].getAttribute("Id") || "", rels[i].getAttribute("Target") || "");
      }
    }

    const images: string[] = [];
    const seen = new Set<string>();
    const blips = doc.getElementsByTagNameNS(NS_DRAWING, "blip");
    for (let i = 0; i < blips.length; i++) {
      const embed = blips[i].getAttributeNS(NS_REL, "embed") || blips[i].getAttribute("r:embed");
      if (!embed) continue;
      const target = relMap.get(embed);
      if (!target) continue;
      const resolved = resolveRelTarget(slideName, target);
      if (seen.has(resolved)) continue;
      seen.add(resolved);
      const file = zip.file(resolved);
      if (!file) continue;
      const ext = resolved.substring(resolved.lastIndexOf(".") + 1);
      const mime = extToMime(ext);
      if (!mime) continue;
      const base64 = await file.async("base64");
      images.push(`data:${mime};base64,${base64}`);
    }

    slides.push({ pageNumber, texts, images });
  }

  return slides;
}
