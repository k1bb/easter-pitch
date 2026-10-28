// --- Web Audio API Engine ---
let audioCtx = null;
const audioBuffers = {}; // file -> AudioBuffer
let currentPlay = null;  // { source, gain, btn, startTime, isHolding }

const LOOP_START = 5.0; // 最後の音の安定サステイン開始秒
const LOOP_END = 7.6;   // 最後の音の安定サステイン終了秒
const RELEASE_TIME = 0.4; // 指を離したときのフェードアウト秒数

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 音源ファイルをプリロード & デコード
async function loadAudioBuffer(url) {
  if (audioBuffers[url]) return audioBuffers[url];
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const ctx = getAudioContext();
  const decoded = await ctx.decodeAudioData(arrayBuffer);
  audioBuffers[url] = decoded;
  return decoded;
}

// 全音源を事前にバックグラウンド読み込み
document.querySelectorAll('.btn').forEach(btn => {
  const file = btn.dataset.src;
  loadAudioBuffer(file).catch(() => {});
});

// 現在鳴っている音をフェードアウト停止
function stopCurrentSound(fade = 0.05) {
  if (!currentPlay) return;
  const { source, gain, btn } = currentPlay;
  currentPlay = null;

  try {
    const ctx = getAudioContext();
    gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + fade);
    setTimeout(() => {
      try { source.stop(); } catch (_) {}
    }, fade * 1000 + 50);
  } catch (_) {}

  btn.classList.remove('playing');
}

// 再生開始（長押し・短押し両対応）
async function startPlay(btn) {
  const ctx = getAudioContext();
  const file = btn.dataset.src;

  // 前の音が鳴っていれば即座に停止
  if (currentPlay) {
    stopCurrentSound(0.05);
  }

  const buffer = await loadAudioBuffer(file);
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();

  source.buffer = buffer;
  source.loop = true;
  source.loopStart = LOOP_START;
  source.loopEnd = LOOP_END;

  source.connect(gain);
  gain.connect(ctx.destination);

  const playObj = {
    source,
    gain,
    btn,
    startTime: ctx.currentTime,
    isHolding: true
  };
  currentPlay = playObj;

  btn.classList.add('playing');

  source.start(0);

  // 自然終了時（短押しでループ解除された場合など）
  source.onended = () => {
    if (currentPlay === playObj) {
      currentPlay = null;
      btn.classList.remove('playing');
    }
  };
}

// 指やマウスを離したときの処理（押している間だけ鳴る！）
function handleRelease(btn) {
  if (!currentPlay) return;
  if (!btn || currentPlay.btn === btn) {
    // 離した瞬間に0.3秒でふわっとフェードアウト停止！
    stopCurrentSound(RELEASE_TIME);
  }
}

// --- Event Listeners (長押しバイブ・メニュー・選択を完全防止) ---
window.addEventListener('contextmenu', e => e.preventDefault());

document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('contextmenu', e => e.preventDefault());

  let isTouch = false;

  // スマホ用: touchstart で preventDefault() を呼ぶことで長押しバイブレーションを完全に抑制
  btn.addEventListener('touchstart', e => {
    e.preventDefault();
    isTouch = true;
    startPlay(btn);
  }, { passive: false });

  btn.addEventListener('touchend', e => {
    e.preventDefault();
    handleRelease(btn);
  }, { passive: false });

  btn.addEventListener('touchcancel', () => {
    handleRelease(btn);
  });

  // PC（マウス）用
  btn.addEventListener('mousedown', e => {
    if (isTouch) return;
    e.preventDefault();
    startPlay(btn);
  });

  btn.addEventListener('mouseup', e => {
    if (isTouch) return;
    e.preventDefault();
    handleRelease(btn);
  });

  btn.addEventListener('mouseleave', () => {
    if (isTouch) return;
    handleRelease(btn);
  });
});

// PCでボタン外でマウスを離した場合の安全策
window.addEventListener('mouseup', () => {
  if (currentPlay && currentPlay.isHolding) {
    handleRelease(currentPlay.btn);
  }
});

// オフライン対応（Service Worker）
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
