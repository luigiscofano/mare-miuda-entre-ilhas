# Camera, frame, and ocean

[Português](README.md) · **English**

The playable bounding box includes every firm-ground or shoal cell, even when submerged. The camera centers this box inside the frame, preserves the margin, and chooses the largest scale that keeps whole cells aligned to the presentation grid. The scenery scales with it using nearest-neighbor interpolation; the title, indicators, and buttons remain outside this scaling.

The sea uses Arquipélago's blue, with subtle particles and glints. Foam is decorative. The lighthouse base meets the lower edge in levels where it appears, without touching the route. If no visible rock remains in the frame, the game adds a decorative formation only when there is safe space.

See the [catalog of crossings at both tides](../catalogo-231-travessias/README.en.md) and the [production guide](../../producao/README.en.md).

## Status panel

The side panel uses sand-colored pixel corners and keeps counters legible. The tide forecast and heron warning use separate strips with icons. On mobile, the panel fits below the crossing without shrinking the map. Warnings remain available to screen readers.
