import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
@customElement("my-hello")
export class Hello extends LitElement {
    static styles = css`
        h1 {
            color: blue;
        }
    `;
    render(){
        return html`<h1>hello</h1>`;
    }
}