# Audio

[Português](README.md) · **English**

> **Historical record.** This document describes the *Siri na Areia — Notas Claras* soundtrack used before the offline edition with *A Outra Margem*. The instructions below belong to the previous revision and do not build the current soundtrack. See [the offline edition's soundtrack](../../docs/arte/trilha-sonora/README.en.md).

**Siri na Areia — Notas Claras** has eight arrangements (one per world), at 97 BPM. Praia and Enseadinha use the same arrangement. Arquipélago keeps the last track rather than creating a ninth. Praia comes from the approved version's PCM cycle. The score and renderer are in [scripts/trilha](../../scripts/trilha/README.en.md).

The game fetches and decodes only the active track, after audio is activated by a gesture. Each MP3 loads as a looping `AudioBuffer`; the arrangements share a period of 1,425,155 samples at 48 kHz. During travel, the new loop starts at the corresponding position on the shared clock and crossfades with the previous one over 440 ms. Moving from map → level → map within the same world does not create another source. Up to three buffers remain cached, plus a possible track in transition.

Music and effects use independent gains, and their controls are stored in the current save without migration. Synthesized effects signal rising tide, falling tide, collection, error, and victory; text remains the primary source of feedback. Setting music to zero, hiding the tab, or interrupting the audio context pauses the musical clock and cancels pending downloads. If the browser does not resume on its own, the next trusted gesture tries again. A missing or undecodable file does not interrupt the game and keeps the previous track if available; another gesture can recover the track.

The served build copies the MP3s; the standalone HTML embeds all eight tracks in inert blocks and converts them to bytes only when a track is requested. There is no CDN or external request. `npm test` covers the state machine, gains, and simulated failures; `npm run build && npm run test:offline` verifies byte equality in the build. Physical Safari testing remains separate.
