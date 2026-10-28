// --- Web Audio API Engine ---
let audioCtx = null;
const rawAudioBuffers = {};    // url -> ArrayBuffer (先行ダウンロード)
const decodedAudioBuffers = {}; // url -> AudioBuffer (デコード済み)
let currentPlay = null;        // { source, gain, btn, startTime, isHolding }

const LOOP_START = 5.0; // 最後の音の安定サステイン開始秒
const LOOP_END = 7.6;   // 最後の音の安定サステイン終了秒
const RELEASE_TIME = 0.4; // 指を離したときのフェードアウト秒数

// AudioContext は必ず「ユーザーの最初のタップ操作（touchstart/mousedown）」内で生成・初期化する
// ※ ページ読み込み時に生成すると、iOS SafariでBluetooth/音声出力先ルーティングが片耳化する既知バグを回避
function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
    try {
      audioCtx.destination.channelCount = 2;
      audioCtx.destination.channelCountMode = 'explicit';
      audioCtx.destination.channelInterpretation = 'speakers';
    } catch (_) {}
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// ネットワークからのバイナリ先読み（AudioContextを作らずに実行可能）
async function preloadFile(url) {
  if (rawAudioBuffers[url]) return rawAudioBuffers[url];
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    rawAudioBuffers[url] = arrayBuffer;
    return arrayBuffer;
  } catch (err) {
    console.warn('Preload failed:', url, err);
  }
}

// 全音源のバイナリを事前にバックグラウンド読み込み（ユーザー操作前でもダウンロードを完了させておく）
document.querySelectorAll('.btn').forEach(btn => {
  const file = btn.dataset.src;
  preloadFile(file).catch(() => {});
});

// 音源ファイルをデコードし、左右チャンネルを完全一致（デュアルモノラル）に強制
async function getDecodedBuffer(url) {
  if (decodedAudioBuffers[url]) return decodedAudioBuffers[url];

  let raw = rawAudioBuffers[url];
  if (!raw) {
    raw = await preloadFile(url);
  }

  const ctx = getAudioContext();
  // decodeAudioData は ArrayBuffer を消費（detach）するため、コピーを渡す
  const decoded = await ctx.decodeAudioData(raw.slice(0));

  // 左耳・右耳に100%同一の波形データを強制（片耳イヤホンでも両耳イヤホンでも確実に同音量で鳴る）
  let finalBuffer;
  if (decoded.numberOfChannels === 1) {
    // 1chモノラルの場合、明示的に2chステレオバッファを作成してLとRに同一データを複製
    finalBuffer = ctx.createBuffer(2, decoded.length, decoded.sampleRate);
    const monoData = decoded.getChannelData(0);
    finalBuffer.getChannelData(0).set(monoData);
    finalBuffer.getChannelData(1).set(monoData);
  } else {
    // 2chステレオの場合、LとRの平均を取り、両チャンネルをPCMレベルで完全に同一化
    finalBuffer = decoded;
    const ch0 = finalBuffer.getChannelData(0);
    const ch1 = finalBuffer.getChannelData(1);
    for (let i = 0; i < finalBuffer.length; i++) {
      const avg = (ch0[i] + ch1[i]) * 0.5;
      ch0[i] = avg;
      ch1[i] = avg;
    }
  }

  decodedAudioBuffers[url] = finalBuffer;
  return finalBuffer;
}

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

  const buffer = await getDecodedBuffer(file);
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();

  source.buffer = buffer;
  source.loop = true;
  source.loopStart = LOOP_START;
  source.loopEnd = LOOP_END;

  // バッファ自体が左右完全同一のステレオ（Dual Mono）のため、
  // 癖のあるMerger/Splitterノードを使わず直接ルーティングすることで全端末・全イヤホンで確実に両耳再生
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

  // 自然終了時
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
    // 離した瞬間に0.4秒でふわっとフェードアウト停止！
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
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      // 新しいService Workerがあれば即座にチェック
      reg.update().catch(() => {});
    }).catch(() => {});
  });
}
