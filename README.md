somewhere in the root of the app => check if hand tracking enabled
if one of the inputsources has a hand => it's hand tracking because controllers take over instantly.
the ray, .... extra controller UI stuff still needs to be added on a controller level, so we always need to render it
we just need an optional hide, when we're working with hand-tracking.
dont render the main controller model when hand tracking
![](screenshots/2021-06-16-20-09-40.png)

how do I work with a profile json for the hand models? it might already have the correct states for what I want?
<https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0.8/dist/profiles/generic-hand/profile.json>

<https://github.com/immersive-web/webxr-input-profiles/tree/main/packages/assets#visual-responses>

Visual responses based on actions. but do these also exist for hands?

# react-xr-hands-test

Created with CodeSandbox
