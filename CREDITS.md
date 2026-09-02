# Credits & data provenance

This is a fan-made, non-commercial tool. It is **not affiliated with, endorsed by, or sponsored by
Capcom**. *MONSTER HUNTER: WORLD*, *Iceborne*, and all related names, data, and imagery are
trademarks and copyright © CAPCOM Co., Ltd. All in-game facts and assets belong to Capcom; this
project only reorganizes publicly compiled data for personal use.

## Where each piece of data comes from

| Data | Source | Author | Licence |
| --- | --- | --- | --- |
| Weapons (base tree: attack, affinity, element, slots, sharpness) | [MHWorldData](https://github.com/gatheringhallstudios/MHWorldData) | Carlos Fernandez | MIT |
| Kulve Taroth (Kjárr) + Safi'jiiva weapons | bundled `mhw-kulve-safi-supplement.js` (compiled for this project from community data) | — | project file |
| Armor, decorations, charms, skills, set bonuses | [mhw-db.com API](https://mhw-db.com) (repo [MHWDB-API](https://github.com/LartTyler/MHWDB-API)) | Tyler Lartonoix (LartTyler) | AGPL-3.0 (server software) |
| Weapon / armour / charm / decoration icons | [MHW_Icons_SVG](https://github.com/OthelloRhin/MHW_Icons_SVG) via jsDelivr | Thibault "Othello" Benoit | MIT |
| Decoration gem colour index (for the correct icon per jewel) | cross-referenced from [Kiranico](https://mhworld.kiranico.com) | Kiranico | game-ripped Capcom assets — no open licence |

### Notes on usage
- **MHWorldData** and **MHW_Icons_SVG** are MIT-licensed; their full notices are reproduced below,
  as MIT requires the copyright notice to travel with redistributed copies/portions.
- **mhw-db.com**: the API *software* is AGPL-3.0. This project does not copy or modify that software;
  it consumes the public HTTP API as a client. Only the returned game data (facts) is used.
- **Kiranico** icons are extracted game sprites (Capcom IP) with no redistribution licence. They are
  used only as an optional runtime image source; the MIT-licensed `MHW_Icons_SVG` set is the
  licence-clean alternative and can be made the sole source (see below).

To depend only on openly-licensed assets, disable the Kiranico image source in `index.html`
(`decoIconEl`) so the MIT `MHW_Icons_SVG` icons are used exclusively.

---

## MHWorldData — MIT License

```
MIT License

Copyright (c) 2018 Carlos Fernandez

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## MHW_Icons_SVG — MIT License

```
MIT License

Copyright (c) 2020 Thibault "Othello" BENOIT

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## mhw-db.com API — GNU AGPL v3

The mhw-db.com API server software is licensed under the GNU Affero General Public License v3.
Full text: <https://www.gnu.org/licenses/agpl-3.0.txt>. Source: <https://github.com/LartTyler/MHWDB-API>.
This project uses the public API as a client and does not redistribute the API software.
