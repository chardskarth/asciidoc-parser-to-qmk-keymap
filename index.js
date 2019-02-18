import { resolve } from "path";
import Asciidoctor from "asciidoctor.js";
import { flatten } from "lodash";

const asciidoc = Asciidoctor();

const QMK_DOCS_LOCATION = resolve(__dirname, "../qmk_firmware/docs/");
const QMK_DOCS_FILES = [
  "feature_audio",
  "feature_advanced_keycodes",
  "feature_backlight"
].map(x => resolve(QMK_DOCS_LOCATION, `${x}.md`));

const asciiLoadAndDocumentMatches = fileLocation => {
  const asciiDocument = asciidoc.loadFile(fileLocation);

  const retVal = [];
  const traverseBlock = obj => {
    if (Array.isArray(obj)) {
      obj.forEach(traverseBlock);
    }
    if ("blocks" in obj) {
      traverseBlock(obj.blocks);
    }
    if ("lines" in obj) {
      if (obj.lines.length) {
        const linesLength = obj.lines.map(x => x.split("|").length);
        const isMatch = linesLength.every(x => x === 5);
        if (isMatch) {
          console.log(`${obj.parent.converted_title} is a match`);
          retVal.push(obj);
        }
      }
    }
  };

  traverseBlock(asciiDocument.blocks);
  return retVal;
};

const matchedTables = QMK_DOCS_FILES.map(asciiLoadAndDocumentMatches);
console.log(flatten(matchedTables).map(x => x.parent.converted_title));
