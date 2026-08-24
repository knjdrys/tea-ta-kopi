/* Tea-Ta Kopi - tactile sound (vanilla, no audio files)
   - Generated at runtime via Web Audio API (clicks/pops), zero network, instant.
   - Browser autoplay policy: AudioContext is created lazily on the first user gesture.
   - Respects a persisted mute toggle and prefers-reduced-motion (still allows sound,
     but the toggle is the user's call; reduced-motion only gates the visual fly).
*/
(function () {
  "use strict";

  var MUTE_KEY = "ttk-muted";
  var muted = false;
  try { muted = localStorage.getItem(MUTE_KEY) === "1"; } catch (e) {}

  var ctx = null;
  function ensureCtx() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { ctx = new AC(); } catch (e) { ctx = null; }
    return ctx;
  }

  // A short, pleasant percussive blip. type: "tick" (soft UI click) | "pop" (add-to-cart)
  function blip(type) {
    if (muted) return;
    var c = ensureCtx();
    if (!c) return;
    if (c.state === "suspended") { try { c.resume(); } catch (e) {} }
    var now = c.currentTime;
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = type === "pop" ? "triangle" : "sine";
    var base = type === "pop" ? 440 : 660;
    osc.frequency.setValueAtTime(base, now);
    osc.frequency.exponentialRampToValueAtTime(base * (type === "pop" ? 1.5 : 1.25), now + 0.04);
    var peak = type === "pop" ? 0.16 : 0.10;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    osc.connect(gain).connect(c.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  window.__ttkSound = {
    tick: function () { blip("tick"); },
    pop: function () { blip("pop"); },
    isMuted: function () { return muted; },
    toggleMute: function () {
      muted = !muted;
      try { localStorage.setItem(MUTE_KEY, muted ? "1" : "0"); } catch (e) {}
      return muted;
    }
  };
})();
