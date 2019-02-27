# asciidoc-parser-to-qmk-keymap
Let awesome asciidoc be single truth for qmk keymap source code

## TODO
- [x] index.js => load all mds, map and find markdown tables we want to parse
- [x] add useful mds in our list of docs to parse
- [x] create map of { keycode: string, description: string[] }
- [x] use `fuzzyset.js`; create keycodeFuzzySet { get(string): { index, key, description } }
- [x] improve descriptionFuzzySet; add secondMatch, keyMatch, aliasMatch
- [ ] define own symbol layer (still missing _ key); Esc key returns to own default layer; see matrixman's
- [ ] define asciidoc syntax; LAYER, MACRO
- [ ] improve descriptionFuzzySet; support `(kc)`
- [ ] create `readErgodoxEzKeyboardFn`: string[][]
