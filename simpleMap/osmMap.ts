import {html} from "lit"
export default function osmMap = (lng, lat, zoom, w = width, h = 400) => {
    let result = `<div style="width:${w}px;height:${h}px;position:relative;overflow:hidden">`,
        x = 256 * (1 << zoom) * (lng / 360 + 0.5) - w / 2 | 0,
        y = 256 * (1 << zoom) * (1 - Math.log(Math.tan(Math.PI * (0.25 + lat / 360))) / Math.PI) / 2 - h / 2 | 0;
    for (let ty = y / 256 | 0; ty * 256 < y + h; ty++)
        for (let tx = x / 256 | 0; tx * 256 < x + w; tx++)
            result += `<img src="https://tile.osm.org/${zoom}/${tx}/${ty}.png" 
          style="position:absolute;left:${tx * 256 - x}px;top:${ty * 256 - y}px">`;

    return html`${result}<div style="position:absolute;bottom:0;right:0;font:11px sans-serif;background:#fffa;padding:1px 5px">&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors</div></div>`;
}