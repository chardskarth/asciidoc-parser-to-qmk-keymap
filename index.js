import { basename, resolve } from "path";
import Asciidoctor from "asciidoctor.js";
import { flatten, chain } from "lodash";

const asciidoc = Asciidoctor();

const QMK_DOCS_LOCATION = resolve(__dirname, "../qmk_firmware/docs/");
const QMK_DOCS_FILES = ["keycodes"].map(x =>
  resolve(QMK_DOCS_LOCATION, `${x}.md`)
);

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
          //           console.log(
          //             `${obj.parent.converted_title} is a match in file ${basename(
          //               fileLocation,
          //               ".md"
          //             )}`
          //           );
          retVal.push({
            title: obj.parent.converted_title,
            lines: obj.lines,
            pipedLines: obj.lines.map(x => x.split("|"))
          });
        }
      }
    }
  };

  traverseBlock(asciiDocument.blocks);
  return retVal;
};

const getKey = pipedLine => {
  const [ignore, key] = pipedLine;
  const keySplitted = key.split("`");

  if (keySplitted.length !== 3) {
    return false;
  }
  const [ignore2, retVal] = keySplitted;
  return retVal;
};

const getDescription = pipedLine => {
  const [ignore, ignore1, ignore2, retVal] = pipedLine;
  return retVal.trim();
};

const keyAndDescription = x => ({
  key: getKey(x),
  description: getDescription(x)
});

const tryKeyAndDescription = x => {
  try {
    return keyAndDescription(x);
  } catch (err) {
    return {
      key: false,
      err,
      pipedLine: x
    };
  }
};

const keyAndDescriptions = chain(QMK_DOCS_FILES)
  .map(asciiLoadAndDocumentMatches)
  .thru(x => flatten(x))
  .map(({ pipedLines }) => pipedLines)
  .thru(x => flatten(x))
  .map(tryKeyAndDescription)
  .filter(({ key }) => key)
  .value();

console.log(JSON.stringify(keyAndDescriptions));
