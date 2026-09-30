# Marble Rush track designer

Designs VTech Marble Rush tracks that can be built from the pieces we own (Adventure,
Corkscrew Rush and Sky Elevator sets), checks each one with a simulated test run, and prints
bottom-up build steps.

```sh
npm test                                   # model, inventory, generator and simulator tests
node src/cli.js                            # a design with the default settings
node src/cli.js --seed 5 --width 5 --depth 5 --max-height 5 --pieces 4-6 --include T-17
node src/cli.js --seed 5 --json            # the design as data
```

Options: `--seed`, `--width`, `--depth` (board squares), `--max-height` (blocks, funnel
included), `--max-towers`, `--pieces min-max` (track pieces in the run), `--include` and
`--exclude` (part codes). Track may hang past the edge of the base plates; towers can't.

## Files
- `src/model.js`: blocks, ports, track geometry and shared 3D space.
- `src/inventory.js`: every part we own, by VTech code, with what's measured and what isn't.
- `src/simulate.js`: the test run. Checks routing, collisions, heights and piece counts.
- `src/generate.js`: searches for designs that pass the test run.
- `src/instructions.js`, `src/cli.js`: parts list and build steps.

## What the generator assumes
- The marble starts in the start funnel (M-03, 2 blocks tall) and finishes in an orange end
  block. The catch basin (M-07) isn't used yet: how track feeds it isn't settled.
- A dropped marble lands in an orange block (sent out its open side) or another drop block.
  It never lands in blue or red: which way those send a dropped marble is unconfirmed.
- It only uses track Iain has checked. The sloped U-turn (T-01) and elevator feed curve (T-27)
  wait until we know which way they turn going downhill. The long ramp (T-15) waits for its
  drop. Special pieces other than the start funnel aren't used yet.
- One level of clearance is enough for track to pass over a tower top or another track.
