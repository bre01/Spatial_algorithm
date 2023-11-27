import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
@customElement("my-map")
export class Map extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      min-width: 4em;
      text-align: center;
      padding: 0.2em;
      margin: 0.2em 0.1em;
    }`;
  @property()
  lng: number = 0; 
  @property()
  lat: number = 51;
  @property()
  zoom: number = 15;
  @property()
  w: number = 600;
  @property()
  h: number = 400;
  render() {
    let result = `<div style="width:${this.w}px;height:${this.h}px;position:relative;overflow:hidden">`,
      x = 256 * (1 << this.zoom) * (this.lng / 360 + 0.5) - this.w / 2 | 0,
      y = 256 * (1 << this.zoom) * (1 - Math.log(Math.tan(Math.PI * (0.25 + this.lat / 360))) / Math.PI) / 2 - this.h / 2 | 0;
    for (let ty = y / 256 | 0; ty * 256 < y + this.h; ty++)
      for (let tx = x / 256 | 0; tx * 256 < x + this.w; tx++)
        result += `<img src="https://tile.osm.org/${this.zoom}/${tx}/${ty}.png" 
          style="position:absolute;left:${tx * 256 - x}px;top:${ty * 256 - y}px">`;

    return html `${result}<div style="position:absolute;bottom:0;right:0;font:11px sans-serif;background:#fffa;padding:1px 5px">&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors</div></div>`;
  }
}