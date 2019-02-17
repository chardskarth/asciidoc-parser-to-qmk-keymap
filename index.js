import { resolve } from "path";
import Asciidoctor from "asciidoctor.js";

const QMK_DOCS_LOCATION = resolve(__dirname, "../qmk_firmware/docs/");
const QMK_DOCS_FILES = [
  "feature_audio",
  "feature_advanced_keycodes",
  "feature_backlight"
].map(x => resolve(QMK_DOCS_LOCATION, `${x}.md`));

const asciidoc = Asciidoctor();

console.log(QMK_DOCS_FILES);
console.log(asciidoc.loadFile(QMK_DOCS_FILES[0]));
