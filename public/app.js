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

// --- Event Listeners ---
document.querySelectorAll('.btn').forEach(btn => {
  // 長押し時のコンテキストメニューや選択を防止
  btn.addEventListener('contextmenu', e => e.preventDefault());

  // タッチ・マウスクリック開始（押し下げる）
  btn.addEventListener('pointerdown', e => {
    e.preventDefault();
    startPlay(btn);
  });

  // 指・マウスを離したとき
  btn.addEventListener('pointerup', e => {
    e.preventDefault();
    handleRelease(btn);
  });

  // ボタンの外に指・カーソルが出たとき
  btn.addEventListener('pointerleave', e => {
    e.preventDefault();
    handleRelease(btn);
  });

  btn.addEventListener('pointercancel', e => {
    handleRelease(btn);
  });
});

// PCでボタンの外でマウスを離した場合の安全策
window.addEventListener('pointerup', () => {
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
