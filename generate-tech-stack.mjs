// Gera assets/tech-stack.svg: card com CSS + animação embutidos.
// (README do GitHub não executa JS/CSS, mas exibe SVG via <img> — o CSS vive dentro do SVG.)
// Uso: node generate-tech-stack.mjs   (Node 18+)
import { mkdir, writeFile } from "node:fs/promises";

const DEVICON = (n) => `https://raw.githubusercontent.com/devicons/devicon/v2.18.0/icons/${n}/${n}-original.svg`;
const SIMPLE = (n) => `https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/${n}.svg`;

// [label, url do ícone, cor opcional (só para ícones monocromáticos do simple-icons)]
const GROUPS = [
  { title: "Dev", items: [
    ["Spring", DEVICON("spring")], ["Express", SIMPLE("express"), "#FFFFFF"], ["NestJS", SIMPLE("nestjs"), "#E0234E"],
    ["Next.js", DEVICON("nextjs")], ["Nuxt.js", DEVICON("nuxtjs")],
    ["TypeScript", DEVICON("typescript")], ["Go", DEVICON("go")], ["Kafka", SIMPLE("apachekafka"), "#FFFFFF"],
    ["RabbitMQ", DEVICON("rabbitmq")], ["PostgreSQL", DEVICON("postgresql")],
  ] },
  { title: "Infra", items: [
    ["K8s", DEVICON("kubernetes")], ["K3s", DEVICON("k3s")], ["Helm", SIMPLE("helm"), "#5C7CFA"],
    ["ArgoCD", DEVICON("argocd")], ["Terraform", DEVICON("terraform")],
    ["Ansible", DEVICON("ansible")], ["Grafana", DEVICON("grafana")], ["Prometheus", DEVICON("prometheus")],
    ["Proxmox", SIMPLE("proxmox"), "#E57000"], ["VMware", DEVICON("vsphere")],
  ] },
];

const W = 1000, PAD = 40, COLS = 5, TILE = 60, ICON = 34, ROW_H = 98, HEAD_H = 46, ACCENT = "#00C878";
const COL_W = (W - PAD * 2) / COLS;

// <img> do GitHub não carrega recursos externos: cada ícone entra embutido (data URI).
async function icon(url, color) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ao baixar ${url}`);
  let svg = await res.text();
  if (color) svg = svg.replace("<svg ", `<svg fill="${color}" `);
  return "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
}

let n = 0, y = 26, body = "";
for (const g of GROUPS) {
  const cy = y + 14, half = g.title.length * 6.5 + 18, lineW = W / 2 - half - PAD;
  body += `<g class="h">
<rect x="${PAD}" y="${cy - 0.75}" width="${lineW}" height="1.5" fill="url(#fadeL)"/>
<rect x="${W / 2 + half}" y="${cy - 0.75}" width="${lineW}" height="1.5" fill="url(#fadeR)"/>
<text x="${W / 2}" y="${cy + 5}" text-anchor="middle" class="ttl">${g.title.toUpperCase()}</text></g>\n`;
  y += HEAD_H;
  for (let i = 0; i < g.items.length; i++) {
    const [label, url, color] = g.items[i];
    const cx = PAD + COL_W * (i % COLS) + COL_W / 2, top = y + Math.floor(i / COLS) * ROW_H;
    const uri = await icon(url, color);
    body += `<g class="t" style="animation-delay:${n++ * 45}ms">
<rect x="${cx - TILE / 2}" y="${top}" width="${TILE}" height="${TILE}" rx="14" fill="url(#tile)" stroke="#30363d"/>
<image x="${cx - ICON / 2}" y="${top + (TILE - ICON) / 2}" width="${ICON}" height="${ICON}" href="${uri}" xlink:href="${uri}"/>
<text x="${cx}" y="${top + TILE + 19}" text-anchor="middle" class="lbl">${label}</text></g>\n`;
  }
  y += Math.ceil(g.items.length / COLS) * ROW_H + 8;
}
const H = y + 8;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
<title id="t">Current Working Tech Stack</title>
<desc id="d">${GROUPS.map((g) => `${g.title}: ${g.items.map((i) => i[0]).join(", ")}`).join(" · ")}</desc>
<style>
text{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif}
.ttl{font-size:13px;font-weight:700;letter-spacing:.28em;fill:${ACCENT}}
.lbl{font-size:13px;fill:#c9d1d9}
.t{animation:pop .55s cubic-bezier(.2,.8,.2,1) backwards}
.h{animation:fade .9s ease-out backwards}
.glow{animation:breathe 7s ease-in-out infinite}
@keyframes pop{from{opacity:0;transform:translateY(10px)}}
@keyframes fade{from{opacity:0}}
@keyframes breathe{50%{opacity:.5}}
@media (prefers-reduced-motion:reduce){.t,.h,.glow{animation:none}}
</style>
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f151c"/><stop offset="1" stop-color="#0b0f14"/></linearGradient>
<radialGradient id="glow" cx=".5" cy="0" r=".65"><stop offset="0" stop-color="${ACCENT}" stop-opacity=".18"/><stop offset="1" stop-color="${ACCENT}" stop-opacity="0"/></radialGradient>
<linearGradient id="tile" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c232d"/><stop offset="1" stop-color="#141a22"/></linearGradient>
<linearGradient id="fadeL" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${ACCENT}" stop-opacity="0"/><stop offset="1" stop-color="${ACCENT}" stop-opacity=".6"/></linearGradient>
<linearGradient id="fadeR" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${ACCENT}" stop-opacity=".6"/><stop offset="1" stop-color="${ACCENT}" stop-opacity="0"/></linearGradient>
</defs>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="16" fill="url(#bg)" stroke="#30363d"/>
<rect class="glow" x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="16" fill="url(#glow)"/>
${body}</svg>
`;

await mkdir("assets", { recursive: true });
await writeFile("assets/tech-stack.svg", svg);
console.log(`assets/tech-stack.svg gerado: ${(svg.length / 1024).toFixed(0)} KB, ${W}x${H}`);
