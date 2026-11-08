# Contributing

Thank you for helping grow ragTech's Pixel Mask Library! We keep things small on purpose, so a few gentle rules apply. Everything here is meant to make your contribution easy to review.

## For pull requests

- Open the PR from a branch with a clear name, such as `icon/umbrella` or `fix/tile-edge`.
- Describe what you added or changed, and why. For new art, tell us the use case.
- Put as much detail as you can in your commit messages. We use `type(scope): subject`, for example `feat(icons): add umbrella icon`.
- Include a screenshot or a render from `pnpm docs:images` for anything visual.
- Run the checks below before you push.

## For new art requests

Not an artist, or short on time? Ask for what you'd like to see.

1. Search the open issues first. If someone already asked, add a 💚 reaction to their issue instead of opening a new one.
2. If nobody has, open an issue titled `Art request: <name>` (for example `Art request: umbrella icon`). Say what it's for and add as much detail as you can.

## The art rules

- **Constrained by design.** Art is `"0"` and `"1"` masks, and colours come from the fixed palettes and ramps. The library never accepts arbitrary images, and avatars never accept arbitrary colours; icons, objects and tiles accept only a validated hex colour.
- **Keep it light.** No new dependencies without checking their size and licence first. Please mention the size change in your PR.
- **Gentle gestures only.** If you add animation or gestures, keep them non-contact: a wave, a sparkle, a tipped hat.
- **Licence.** By contributing, you agree your art is released under CC BY 4.0 and your code under MIT, as described in [LICENSE-ART.md](LICENSE-ART.md) and [LICENSE](LICENSE).

## Adding art with the scaffolding wizard

Run it, and it creates the files for you and tells you what's left to edit:

```sh
pnpm install
pnpm new
```

1. **Choose what to add:** an icon, an avatar garment (top, which includes a dress or overalls, bottom or shoes), an avatar hair style, a world object or a world tile.
2. **Answer the prompts:** an id, the parts it's made of, and a placeholder size. Press Enter to accept the default in brackets.
3. **Draw the masks:** the wizard creates placeholder mask files in the right folder. Replace the placeholder rows with your art: `"1"` is filled and `"0"` is empty. Outline, highlight and shadow are added for you.
4. **Make the listed edits:** it prints each file you still need to change (type unions, tables, tests) with the imports and entries already written out, ready to paste.
5. **Check your work** (see below).

It never edits existing files and never overwrites one, so it's safe to run again. `pnpm new --dry-run` shows what it would create without writing anything. Edge and nine-patch tiles aren't scaffolded, because they're built from the edge families in `src/world/tiles/tileDefs.ts`, so edit those by hand.

### Where things live

| Kind | Masks go in |
| --- | --- |
| Icon | `src/icons/<category>/`, with categories named after [Lucide's](https://lucide.dev/icons/) |
| Avatar garment | `src/avatar/masks/clothes/<slot>/` |
| Avatar hair | `src/avatar/masks/hair/` |
| World object | `src/world/masks/objects/` |
| World tile | `src/world/masks/tiles/` |

An icon or object with one mask is a single `name.mask.ts` file. One with several masks gets a folder with a file per part.

### Driving the wizard from a script or an agent

Answers can be piped in, one per line (an empty line takes the default):

```sh
printf '4\nlamp\n1\n2\n1\n\n\n\n' | pnpm new
```

Coding agents are welcome to scaffold, draw the masks and wire everything up. The wizard only makes placeholder shapes, so replace them with real art, then run `pnpm check:masks` and look at the render (`pnpm docs:images`) before you open a PR.

## Seeing your art in the studio

`pnpm dev` starts the studio, which shows every icon, tile, object and avatar from `src/`. New art appears automatically, so it is the quickest way to check how a mask looks at full size, at 8x8 and 16x16, and in 1 and 2-bit colour.

## Before you push

```sh
pnpm typecheck       # types, plus a no-DOM check of the core entry
pnpm check:masks     # validates every mask (add avatar, world or icons to limit it)
pnpm stats           # refreshes the numbers in the README and re-renders the images
pnpm test            # builds and runs the tests; fails if the README numbers are stale
pnpm build:studio    # the studio still builds
```

Commit the updated `README.md` and `docs/images/` along with your change. A new tile also needs its pixel fingerprint in `test/fixtures/tile-golden.json`: run `pnpm test` once and the failure prints the value to paste in.

Thank you again. We're glad you're here. 💚
