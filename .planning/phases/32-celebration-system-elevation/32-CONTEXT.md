# Phase 32: Celebration System Elevation - Context

**Gathered:** 2026-02-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Achievements and milestones trigger choreographed, multi-sensory celebrations — confetti, sound, haptics, and animation work together in timed sequences that scale to the significance of what the user accomplished. This phase fixes the existing confetti leak, creates a unified `useCelebration` hook, builds the test results choreography, adds DotLottie animations, enriches sounds with harmonics, and adds XP counter animations. No new achievement types are added — this elevates the celebration experience for existing milestones.

</domain>

<decisions>
## Implementation Decisions

### Celebration Personality
- **Vibe**: Playful & energetic — game-like pop, bouncy animations, satisfying sounds (Duolingo/Kahoot energy)
- **Intensity scaling**: Gradual build — even small wins feel good (visible confetti), big wins add more layers. Every celebration feels rewarding, just bigger ones are richer
- **Overlap handling**: Queue celebrations — each plays fully in sequence with ~300ms gap between them. Nothing gets lost
- **Subtle queue counter**: Show a tiny "2 more" pill in the corner during queued celebrations for anticipation
- **Reduced motion**: Full respect — no confetti, no scale animations, no DotLottie playback. Only color changes, static badge frames, and text. Sound still plays
- **No celebrations toggle**: Reduced-motion handles accessibility; no separate user toggle needed
- **Surprises**: Occasional rare variations — Claude gets creative with 2-3 surprise elements to keep celebrations fresh
- **First-time specials**: First occurrence of each milestone type gets an elevated celebration; subsequent ones are the standard version
- **Dismissal**: Celebrations always play fully — no tap-to-skip. They're short enough
- **Blocking**: Brief blocking overlay (~1-2 seconds during peak moment), then non-blocking for fade-out
- **Colors**: Mix of app theme colors for base confetti + gold accents for big achievements
- **Particle shapes**: Themed — mix of stars, circles, and small flag/shield shapes (civics theme)
- **Confetti physics**: Party popper style — bursts from bottom-center, fans outward and up, then falls
- **Aftermath**: Subtle remnants — a few pieces settle briefly, then fade. Realistic physics touch
- **Low-end devices**: Reduce particle count (e.g., 200 → 50) but same celebration style
- **Dark mode**: Theme-adapted — brighter/more luminous particles in dark mode, slightly more saturated in light mode
- **Screen shake**: Subtle shake (100-200ms) for biggest celebrations only (100% perfect score)
- **XP counter**: Bouncy spring scale-up with floating "+N" text that drifts upward and fades
- **XP ding pitch**: Rising pitch on consecutive correct answers — ascending scale builds momentum
- **Silent mode**: Mute sound only; visual celebrations + haptics still fire

### Choreography Pacing
- **Overall feel**: Adaptive — pass = snappy celebratory (~2.5-3s), fail = slower/gentler reveal
- **Score count-up duration**: ~1.5 seconds with dramatic easing (slow start → fast middle → spring overshoot)
- **Count-up format**: Whole numbers only, no decimals
- **Count-up overshoot**: Visible — overshoots by ~3-5 points AND font-size grows during overshoot, then both settle back
- **Count-up color**: Number color shifts from neutral to green (pass) or amber (fail) as it crosses thresholds — foreshadows result
- **X/Y fraction**: Animates in sync alongside percentage count-up
- **Gap between count-up and pass/fail**: Immediate (~100ms)
- **Confetti sync**: Teaser burst when score crosses pass threshold during count-up, then full burst at pass/fail reveal
- **Card entrance**: Slide up from below + scale in together
- **Pass/fail badge**: Pop + bounce (spring overshoot from scale 0)
- **Fail badge**: Same pop+bounce animation but in warm amber/orange instead of green
- **Fail state choreography**: Subdued but warm — slower count-up, gentle landing, no confetti, soft glow, encouraging tone
- **Action buttons**: Quick cascade — one-by-one with ~100ms gaps, total ~300-400ms
- **Sound + confetti sync**: Simultaneous — sound and confetti fire at the same instant
- **Haptic sync**: Every stage — light tap at card entrance, medium at count-up landing, strong at pass/fail + confetti
- **Mid-quiz celebrations**: Noticeable duration (~1-1.5 seconds), then auto-advance to next question
- **Practice mode**: Light celebration — mini count-up (~800ms faster) + checkmark Lottie + light sound
- **Replay**: Static by default on return visit; "replay" button lets users trigger choreography again
- **Background**: Subtle gradient shift — warm celebratory tone (golden for pass, soft amber for fail) during reveal
- **100% ultimate**: Unique choreography — golden palette + multi-burst fireworks from different screen positions + 3D spinning trophy Lottie + unique fanfare. Distinctly different from regular pass

### DotLottie Visual Style
- **Style**: Playful & detailed — rounded shapes, slight gradients, depth effects (Duolingo/Headspace feel)
- **Colors**: Theme base + gold accents — primary shapes use theme colors, highlights/sparkles always gold
- **Source**: Marketplace (LottieFiles) + customize colors/timing to match the app
- **File size**: Claude's discretion based on animation complexity
- **Loop behavior**: Context-dependent — checkmark plays once, badge glow loops while visible, trophy plays once, star burst plays once
- **Badge glow loop**: Starts strong (bright reveal), then settles into subtle shimmer
- **Render size**: Varies by type — checkmark ~80px inline, trophy/star burst ~200px+ centered, badge glow matches badge size
- **DotLottie library**: Claude's discretion (dotlottie-react vs dotlottie-web)
- **Fallback**: None needed — if DotLottie fails, skip it; confetti and sound carry the celebration
- **Trophy speed**: Claude's discretion to fit choreography
- **Colored glow**: Yes — soft colored glow behind animations (golden for trophy, green for checkmark). Adds depth
- **Preloading**: Claude's discretion based on total file sizes
- **Adaptive framerate**: Start at 60fps, detect performance issues, drop to 30fps on struggling devices
- **Star burst**: Multi-star explosion with category icon in the center — personalized to the mastered category
- **Checkmark**: Check draws in + sparkle particles radiate outward
- **Tier mapping**: Different DotLottie animations per celebration tier (not reused at different sizes)
- **Reduced-motion fallback**: Show static final frame of animation (no playback)

### Sound Character
- **Overall style**: Game-like SFX — coin collect sounds, level-up chimes, power-up swooshes
- **Harmonics**: Warm & full — 2nd and 3rd harmonics at moderate volume. Noticeable transformation from thin beeps to warm, round tones
- **Count-up sound**: Rapid ticking that accelerates with the count, like a slot machine/score counter
- **Confetti burst**: Pop + sparkle — satisfying 'pop' on burst, followed by gentle sparkle/shimmer as confetti falls
- **100% fanfare**: Unique victory fanfare — Claude designs from scratch. Only plays on perfect scores
- **Fail sound**: Soft, warm tone — gentle, low-pitched, encouraging, not punishing
- **Audio sources**: Mix of synthesized (Web Audio API oscillators with harmonics) + pre-recorded audio files for complex SFX
- **Pre-recorded source**: Claude's discretion (freesound.org, AI-generated, etc.)
- **Sound layering**: Layered — sounds overlap naturally, tick fades as pop fires, creating rich building audio
- **Volume**: Claude's discretion relative to existing app sounds
- **Streak sounds**: Distinct ascending chimes for streaks — higher pitch for bigger streaks, separate from confetti sounds
- **XP ding**: Coin collect style, with rising pitch on consecutive correct answers
- **Incorrect answer**: Soft error tone — brief, low, gentle 'bonk'. Not a buzzer
- **Practice completion**: Light sound — quick chime on finish
- **Audio file size**: Claude's discretion
- **Tick vs ding distinction**: Claude's discretion — make them clearly different timbres

### Claude's Discretion
- DotLottie file size budget
- DotLottie library choice (dotlottie-react vs dotlottie-web)
- DotLottie preloading strategy
- Trophy animation playback speed
- Celebration volume levels
- Score tick vs XP ding sound distinction
- Pre-recorded audio file sources and size budget
- 100% fanfare design
- 2-3 rare surprise celebration variations
- Count-up tick/ding pitch reset behavior at results screen

</decisions>

<specifics>
## Specific Ideas

- Confetti particle shapes should include small flag/shield shapes as a civics theme nod
- XP counter should have floating "+N" text that drifts upward and fades (RPG-style feedback)
- 100% perfect score = golden multi-burst fireworks (3-4 bursts over 2s) + 3D spinning trophy Lottie + unique fanfare — the "ultimate" celebration
- Score count-up crosses pass threshold → teaser confetti burst, then full burst at pass/fail reveal — two-act celebration arc
- Badge glow animation: shimmer sweep across surface, then radial pulse outward (combined effect)
- Star burst: multi-star explosion with category icon inside — personalized to achievement
- Checkmark: inline 80px in answer option + centered 200px+ overlay for streak milestones (both)
- Rising XP ding pitch on consecutive correct answers creates an ascending musical scale
- Party popper burst physics from bottom-center for all confetti
- Results screen replay button for users who want to re-experience the celebration

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 32-celebration-system-elevation*
*Context gathered: 2026-02-20*
