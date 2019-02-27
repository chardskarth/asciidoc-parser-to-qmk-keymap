import { basename, resolve } from "path";
import Asciidoctor from "asciidoctor.js";
import { flatten, chain } from "lodash";
import FuzzySet from "fuzzyset.js";

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
  const [ignore, keyWithTilde] = pipedLine;
  const keySplitted = keyWithTilde.split("`");

  if (keySplitted.length !== 3) {
    return false;
  }
  const [ignore2, retVal] = keySplitted;
  return retVal;
};

const getKeyAliasDescription = pipedLine => {
  const [ignore, keyWithTilde, alias, description] = pipedLine;
  const keySplitted = keyWithTilde.split("`");

  if (keySplitted.length !== 3) {
    return { key: false };
  }

  const [ignore2, key] = keySplitted;

  return {
    key,
    alias: alias.trim(),
    description: description.trim()
  };
};

const tryKeyAndDescription = x => {
  try {
    return getKeyAliasDescription(x);
  } catch (err) {
    return {
      key: false,
      err,
      pipedLine: x
    };
  }
};

const createDescriptionFuzzySet = keyAndDescriptions => {
  const descriptions = ({ description }) => description;
  const keys = ({ key }) => key;
  const alias = ({ alias }) => alias;

  const mappedDescriptions = keyAndDescriptions.map(descriptions);
  const mappedKeys = keyAndDescriptions.map(keys);
  const mappedAlias = keyAndDescriptions.map(alias);

  const fuzzysetDescriptions = FuzzySet(mappedDescriptions, false);
  const fuzzysetKeys = FuzzySet(mappedKeys, false);
  const fuzzysetAlias = FuzzySet(mappedAlias, false);

  const findIndexAsSpecifiedKey = (toFind, asKey) =>
    keyAndDescriptions.findIndex(
      ({ [asKey]: keyValue }) => keyValue === toFind
    );

  const updateMatchResult = asKey => match => {
    const [score, matchString] = match;
    const indexMatch = findIndexAsSpecifiedKey(matchString, asKey);

    return {
      index: indexMatch,
      score,
      ...keyAndDescriptions[indexMatch]
    };
  };

  return word => {
    const descriptionMatches = fuzzysetDescriptions.get(word) || [];
    const keyMatches = fuzzysetKeys.get(word) || [];
    const aliasMatches = fuzzysetAlias.get(word) || [];

    return {
      descriptionMatches: descriptionMatches.map(
        updateMatchResult("description")
      ),
      keyMatches: keyMatches.map(updateMatchResult("key")),
      aliasMatches: aliasMatches.map(updateMatchResult("alias"))
    };
  };
};

const keyAndDescriptions = chain(QMK_DOCS_FILES)
  .map(asciiLoadAndDocumentMatches)
  .thru(x => flatten(x))
  .map(({ pipedLines }) => pipedLines)
  .thru(x => flatten(x))
  .map(tryKeyAndDescription)
  .filter(({ key }) => key)
  .value();

const descriptionFuzzySet = createDescriptionFuzzySet(keyAndDescriptions);

// console.log(JSON.stringify(keyAndDescriptions));
console.log(descriptionFuzzySet("`A`"));
console.log(descriptionFuzzySet("`z`"));
console.log(descriptionFuzzySet("`?`"));
console.log(descriptionFuzzySet("`a` and `A`"));
console.log(descriptionFuzzySet("Ignore this key (NOOP)"));
console.log(descriptionFuzzySet("NOOP"));
console.log(descriptionFuzzySet("Stp"));
console.log(descriptionFuzzySet("Bksp"));
console.log(descriptionFuzzySet("Bckspce"));
console.log(descriptionFuzzySet("Hyper"));
console.log(descriptionFuzzySet("A"));
console.log(descriptionFuzzySet("`=`"));
console.log(descriptionFuzzySet("`+`"));
console.log(descriptionFuzzySet("MsUp"));
