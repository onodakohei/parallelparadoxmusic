// プレイリストの定義（Eleventyから読み込まれる）
let PLAYLISTS = [];
let SONGS = [];

// データの読み込み
async function loadData() {
  try {
    const timestamp = new Date().getTime(); // Generate a unique timestamp
    
    // GitHub Pages用のパスを動的に決定
    const basePath = window.location.hostname === 'localhost' ? '' : '/parallelparadoxmusic';
    console.log('Base path determined:', basePath);
    console.log('Current URL:', window.location.href);
    
    // 複数のパスを試行
    const possiblePaths = [
      `${basePath}/playlists.json`,
      `/playlists.json`,
      `./playlists.json`,
      `playlists.json`
    ];
    
    const possibleSongPaths = [
      `${basePath}/songs.json`,
      `/songs.json`,
      `./songs.json`,
      `songs.json`
    ];
    
    let playlistsResponse, songsResponse;
    let playlistsUrl, songsUrl;
    
    // プレイリストファイルのパスを試行
    for (const path of possiblePaths) {
      try {
        console.log('Trying playlists path:', path);
        playlistsResponse = await fetch(`${path}?v=${timestamp}`);
        if (playlistsResponse.ok) {
          playlistsUrl = path;
          console.log('Playlists found at:', path);
          break;
        }
      } catch (e) {
        console.log('Failed to load from:', path);
      }
    }
    
    // 楽曲ファイルのパスを試行
    for (const path of possibleSongPaths) {
      try {
        console.log('Trying songs path:', path);
        songsResponse = await fetch(`${path}?v=${timestamp}`);
        if (songsResponse.ok) {
          songsUrl = path;
          console.log('Songs found at:', path);
          break;
        }
      } catch (e) {
        console.log('Failed to load from:', path);
      }
    }
    
    if (!playlistsResponse || !songsResponse || !playlistsResponse.ok || !songsResponse.ok) {
      throw new Error(`Failed to load JSON files. Playlists: ${playlistsResponse?.status}, Songs: ${songsResponse?.status}`);
    }
    
    PLAYLISTS = await playlistsResponse.json();
    SONGS = await songsResponse.json();
    
    console.log('データが読み込まれました:', { PLAYLISTS, SONGS });
  } catch (error) {
    console.error('データの読み込みに失敗しました:', error);
    // フォールバック: ローカルパスで再試行
    try {
      const [playlistsResponse, songsResponse] = await Promise.all([
        fetch(`/playlists.json?v=${new Date().getTime()}`),
        fetch(`/songs.json?v=${new Date().getTime()}`)
      ]);
      
      PLAYLISTS = await playlistsResponse.json();
      SONGS = await songsResponse.json();
      
      console.log('フォールバックでデータが読み込まれました:', { PLAYLISTS, SONGS });
    } catch (fallbackError) {
      console.error('フォールバックでもデータの読み込みに失敗しました:', fallbackError);
    }
  }
}

let currentPlaylistIndex = 0;
let isAutoPlaying = false; // 自動再生中のフラグ

// プレイリスト切り替え関数
function nextPlaylist() {
  currentPlaylistIndex = (currentPlaylistIndex + 1) % PLAYLISTS.length;
  updatePlaylistDisplay();
}

function previousPlaylist() {
  currentPlaylistIndex = (currentPlaylistIndex - 1 + PLAYLISTS.length) % PLAYLISTS.length;
  updatePlaylistDisplay();
}

function updatePlaylistDisplay() {
  // データが読み込まれていない場合は何もしない
  if (!PLAYLISTS || PLAYLISTS.length === 0) {
    console.warn('プレイリストデータが読み込まれていません');
    return;
  }
  
  const playlistInfo = document.getElementById('current-playlist');
  if (playlistInfo && PLAYLISTS[currentPlaylistIndex]) {
    playlistInfo.textContent = PLAYLISTS[currentPlaylistIndex].name;
  }
  
  // プレイリスト選択モーダル内の選択状態も更新
  updatePlaylistSelectorActiveState();
  
  // プレイリスト名オーバーレイを表示
  showPlaylistOverlay();
  
  // プレイリスト切り替え時に自動再生（安全な方法で）
  const currentPlaylistId = getCurrentPlaylistId();
  console.log('プレイリスト切り替え:', PLAYLISTS[currentPlaylistIndex]?.name, 'ID:', currentPlaylistId);
  
  // データが正常に読み込まれている場合のみ自動再生
  if (PLAYLISTS.length > 0 && SONGS.length > 0 && typeof playRandomAudio === 'function' && !isAutoPlaying) {
    isAutoPlaying = true; // フラグを設定
    
    // 少し遅延させて安全に実行
    setTimeout(() => {
      playRandomAudio(currentPlaylistId, PLAYLISTS[currentPlaylistIndex]?.name);
      isAutoPlaying = false; // フラグをリセット
    }, 100);
  }
}

// プレイリスト選択モーダル内の選択状態を更新
function updatePlaylistSelectorActiveState() {
  const playlistItems = document.querySelectorAll('#playlist-list .playlist-item');
  playlistItems.forEach((item, index) => {
    if (index === currentPlaylistIndex) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

// 現在のプレイリストIDを取得
function getCurrentPlaylistId() {
  return PLAYLISTS[currentPlaylistIndex]?.id || 'all';
}

// タグベースで楽曲をフィルタリングする関数
function getSongsByTags(tags) {
  if (!SONGS || SONGS.length === 0) {
    console.warn('楽曲データが読み込まれていません');
    return [];
  }
  
  return SONGS.filter(song => {
    return tags.some(tag => song.tags.includes(tag));
  });
}

// 楽曲IDから楽曲情報を取得する関数
function getSongById(songId) {
  return SONGS.find(song => song.id === songId);
}

// プレイリスト管理クラス
class PlaylistManager {
  constructor() {
    this.currentPlaylist = null;
    this.playedVideos = {}; // プレイリストごとの再生済み曲を管理
  }

  // プレイリストからランダムな動画を取得（一巡するまで同じ曲を選ばない）
  getRandomVideo(playlistId) {
    console.log('getRandomVideo 呼び出し:', playlistId);
    
    // プレイリスト情報を取得
    const playlist = PLAYLISTS.find(p => p.id === playlistId);
    if (!playlist) {
      console.error('プレイリストが見つかりません:', playlistId);
      return null;
    }

    // タグベースで楽曲をフィルタリング
    const availableSongs = getSongsByTags(playlist.tags);
    if (availableSongs.length === 0) {
      console.error('該当する楽曲がありません');
      return null;
    }

    // プレイリストごとの再生済み曲を初期化
    if (!this.playedVideos[playlistId]) {
      this.playedVideos[playlistId] = [];
    }

    // すべての曲が再生済みの場合、リセット
    if (this.playedVideos[playlistId].length >= availableSongs.length) {
      console.log('プレイリストが一巡しました。リセットします。');
      this.playedVideos[playlistId] = [];
    }

    // まだ再生されていない曲のみから選択
    const unplayedSongs = availableSongs.filter(song => 
      !this.playedVideos[playlistId].includes(song.id)
    );

    if (unplayedSongs.length === 0) {
      console.error('再生可能な曲がありません');
      return null;
    }

    // 利用可能な曲からランダムに選択
    const randomIndex = Math.floor(Math.random() * unplayedSongs.length);
    const selectedSong = unplayedSongs[randomIndex];
    
    // 再生済みリストに追加
    this.playedVideos[playlistId].push(selectedSong.id);
    
    console.log(`選択された曲: ${selectedSong.id} (${selectedSong.title})`);
    console.log(`再生済み曲数: ${this.playedVideos[playlistId].length}/${availableSongs.length}`);
    
    return {
      id: selectedSong.id,
      title: selectedSong.title,
      thumbnail: `https://img.youtube.com/vi/${selectedSong.id}/maxresdefault.jpg`
    };
  }

  // プレイリスト情報を表示（デバッグ用）
  displayPlaylistInfo(playlistId) {
    const playlist = PLAYLISTS.find(p => p.id === playlistId);
    if (!playlist) {
      console.log('プレイリストが見つかりません');
      return;
    }

    const availableSongs = getSongsByTags(playlist.tags);

    console.log('=== プレイリスト情報 ===');
    console.log(`プレイリスト名: ${playlist.name}`);
    console.log(`タグ: ${playlist.tags.join(', ')}`);
    console.log(`楽曲数: ${availableSongs.length}`);
    console.log('楽曲一覧:');
    availableSongs.forEach((song, index) => {
      console.log(`${index + 1}. ${song.id} - ${song.title}`);
    });
  }

  // プレイリストの全楽曲を取得
  getAllSongs(playlistId) {
    const playlist = PLAYLISTS.find(p => p.id === playlistId);
    if (!playlist) return [];
    
    return getSongsByTags(playlist.tags);
  }

  // プレイリストの楽曲数を取得
  getSongCount(playlistId) {
    return this.getAllSongs(playlistId).length;
  }
}

// グローバルインスタンスを作成
const playlistManager = new PlaylistManager();

// グローバルスコープで利用可能にする
window.playlistManager = playlistManager;

// Aboutモーダル関数
function showAboutModal() {
  const modal = document.getElementById('aboutModal');
  if (modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // スクロールを無効化
  }
}

function closeAboutModal() {
  const modal = document.getElementById('aboutModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // スクロールを有効化
  }
}

// Aboutモーダル関数
function showAboutModal() {
  const modal = document.getElementById('aboutModal');
  if (modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // スクロールを無効化
  }
}

function closeAboutModal() {
  const modal = document.getElementById('aboutModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // スクロールを有効化
  }
}

// モーダル外をクリックした時に閉じる
document.addEventListener('click', function(event) {
  const aboutModal = document.getElementById('aboutModal');
  const playlistSelector = document.getElementById('playlist-selector');
  
  if (event.target === aboutModal) {
    closeAboutModal();
  }
  
  if (event.target === playlistSelector) {
    closePlaylistSelector();
  }
});

// ESCキーでモーダルを閉じる
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeAboutModal();
    closePlaylistSelector();
  }
});

// プレイリスト選択モーダル関数
function showPlaylistSelector() {
  const modal = document.getElementById('playlist-selector');
  if (modal) {
    // プレイリスト一覧を動的に生成
    generatePlaylistList();
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function closePlaylistSelector() {
  const modal = document.getElementById('playlist-selector');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
  }
}

// プレイリスト一覧を動的に生成
function generatePlaylistList() {
  const playlistList = document.getElementById('playlist-list');
  if (!playlistList || PLAYLISTS.length === 0) {
    return;
  }
  
  // 既存の内容をクリア
  playlistList.innerHTML = '';
  
  // 各プレイリストを生成
  PLAYLISTS.forEach((playlist, index) => {
    const playlistItem = document.createElement('div');
    playlistItem.className = 'playlist-item';
    if (index === currentPlaylistIndex) {
      playlistItem.classList.add('active');
    }
    playlistItem.onclick = () => selectPlaylist(index);
    
    const playlistName = document.createElement('span');
    playlistName.className = 'playlist-name';
    playlistName.textContent = playlist.name;
    
    playlistItem.appendChild(playlistName);
    playlistList.appendChild(playlistItem);
  });
}

// プレイリスト選択関数
function selectPlaylist(index) {
  if (index >= 0 && index < PLAYLISTS.length) {
    currentPlaylistIndex = index;
    updatePlaylistDisplay();
    closePlaylistSelector();
  }
}

// プレイリスト名オーバーレイ表示関数
function showPlaylistOverlay() {
  const overlay = document.getElementById('playlist-overlay');
  const overlayName = document.getElementById('playlist-overlay-name');
  
  if (overlay && overlayName && PLAYLISTS.length > 0) {
    // プレイリスト名を設定
    overlayName.textContent = PLAYLISTS[currentPlaylistIndex].name;
    
    // オーバーレイを表示
    overlay.classList.add('show');
    
    // 3秒後に自動的に非表示
    setTimeout(() => {
      overlay.classList.remove('show');
    }, 3000);
  }
}

// 初期化時にプレイリスト情報を表示
document.addEventListener('DOMContentLoaded', async function() {
  console.log('プレイリストマネージャーが初期化されました');
  console.log('現在のURL:', window.location.href);
  console.log('ホスト名:', window.location.hostname);
  
  // データを読み込み
  await loadData();
  
  // データが正常に読み込まれた場合のみ処理を続行
  if (PLAYLISTS.length === 0 || SONGS.length === 0) {
    console.warn('プレイリストまたは楽曲データが読み込まれていません');
    console.log('PLAYLISTS length:', PLAYLISTS.length);
    console.log('SONGS length:', SONGS.length);
    
    // 3秒後に再試行
    setTimeout(async () => {
      console.log('データの再読み込みを試行します...');
      await loadData();
      if (PLAYLISTS.length > 0 && SONGS.length > 0) {
        initializePlaylistManager();
      }
    }, 3000);
    return;
  }
  
  initializePlaylistManager();
});

function initializePlaylistManager() {
  console.log('PLAYLISTS:', PLAYLISTS);
  console.log('SONGS:', SONGS);
  console.log('利用可能なプレイリスト:');
  PLAYLISTS.forEach(playlist => {
    playlistManager.displayPlaylistInfo(playlist.id);
  });
  
  // 初期表示を設定
  const playlistInfo = document.getElementById('current-playlist');
  if (playlistInfo && PLAYLISTS.length > 0) {
    playlistInfo.textContent = PLAYLISTS[0].name;
  }
  
  const currentSongElement = document.getElementById('current-song');
  if (currentSongElement) {
    currentSongElement.textContent = '';
  }
  
  // 初期化時に自動再生（安全な方法で）
  if (PLAYLISTS.length > 0 && SONGS.length > 0 && typeof playRandomAudio === 'function' && !isAutoPlaying) {
    isAutoPlaying = true;
    setTimeout(() => {
      const currentPlaylistId = getCurrentPlaylistId();
      console.log('初期自動再生開始:', currentPlaylistId, PLAYLISTS[0].name);
      playRandomAudio(currentPlaylistId, PLAYLISTS[0].name);
      isAutoPlaying = false;
    }, 500); // 初期化時は少し長めの遅延
  }
}

// 現在のプレイリストから再生
function playCurrentPlaylist() {
  // データが読み込まれていない場合は何もしない
  if (!PLAYLISTS || PLAYLISTS.length === 0) {
    console.warn('プレイリストデータが読み込まれていません');
    return;
  }
  
  // 現在のプレイリストIDを取得
  const currentPlaylistId = getCurrentPlaylistId();
  const currentPlaylistName = PLAYLISTS[currentPlaylistIndex]?.name;
  
  console.log('現在のプレイリストから再生:', currentPlaylistId, currentPlaylistName);
  
  // playRandomAudioを呼び出し
  playRandomAudio(currentPlaylistId, currentPlaylistName);
}

// トップページ用：音声のみランダム再生（プレイヤーは表示しない）
function playRandomAudio(playlistId, title) {
  // playlistManagerが利用可能になるまで待つ
  if (typeof playlistManager === 'undefined' || !playlistManager) {
    console.log('playlistManagerが利用できません。1秒後に再試行します...');
    setTimeout(() => playRandomAudio(playlistId, title), 1000);
    return;
  }
  
  // 渡されたプレイリストIDを使用（getCurrentPlaylistId()は使用しない）
  console.log('playRandomAudio 呼び出し:', playlistId, title);
  
  // 手動プレイリストからランダムな動画を取得
  const randomVideo = playlistManager.getRandomVideo(playlistId);
  if (!randomVideo) {
    console.error('動画が見つかりません。プレイリストID:', playlistId);
    console.log('利用可能なプレイリスト:', PLAYLISTS);
    console.log('利用可能な楽曲:', SONGS);
    return;
  }

  console.log('ランダム動画取得:', randomVideo);

  // 音声再生用の隠しプレイヤーを作成
  let hiddenPlayer = document.getElementById('hidden-audio-player');
  if (!hiddenPlayer) {
    hiddenPlayer = document.createElement('iframe');
    hiddenPlayer.id = 'hidden-audio-player';
    hiddenPlayer.style.position = 'absolute';
    hiddenPlayer.style.left = '-9999px';
    hiddenPlayer.style.top = '-9999px';
    hiddenPlayer.style.width = '1px';
    hiddenPlayer.style.height = '1px';
    hiddenPlayer.style.opacity = '0';
    hiddenPlayer.style.pointerEvents = 'none';
    hiddenPlayer.allow = 'autoplay; encrypted-media';
    document.body.appendChild(hiddenPlayer);
  }

    // 従来のiframe方式で再生（音声が出ていた方式）
  console.log('iframe方式で再生開始');
  const audioUrl = `https://www.youtube.com/embed/${randomVideo.id}?autoplay=1&modestbranding=1&rel=0&controls=0&disablekb=1&fs=0&iv_load_policy=3&cc_load_policy=0&autohide=1&loop=0&mute=0&enablejsapi=1&origin=${window.location.origin}`;
  console.log('iframe URL:', audioUrl);
  hiddenPlayer.src = audioUrl;
  
  // iframe方式で曲終了を検知（タイマーで監視）
  const videoDuration = 180; // 平均的な曲の長さ（秒）
  setTimeout(() => {
    console.log('タイマーによる曲終了検知。次の曲を再生します。');
    const currentPlaylistId = getCurrentPlaylistId();
    const currentPlaylistName = PLAYLISTS[currentPlaylistIndex].name;
    playRandomAudio(currentPlaylistId, currentPlaylistName);
  }, (videoDuration + 5) * 1000); // 5秒の余裕を持たせる

  // 背景を更新
  updateBackgroundThumbnail(randomVideo.id, randomVideo.thumbnail);

  console.log('音声再生開始:', randomVideo.title);
  
  // 曲名を更新
  updateCurrentSong(randomVideo.title);
  
  // プレイヤーの読み込み完了を監視
  hiddenPlayer.onload = function() {
    console.log('隠しプレイヤー読み込み完了');
  };
  
  // エラーハンドリング
  hiddenPlayer.onerror = function() {
    console.error('隠しプレイヤー読み込みエラー');
  };

  // 曲終了時のイベントリスナーを設定
  hiddenPlayer.addEventListener('ended', function() {
    console.log('曲が終了しました。次の曲を再生します。');
    // 現在のプレイリストから次の曲を再生
    const currentPlaylistId = getCurrentPlaylistId();
    const currentPlaylistName = PLAYLISTS[currentPlaylistIndex].name;
    playRandomAudio(currentPlaylistId, currentPlaylistName);
  });
}

// 曲名を更新する
function updateCurrentSong(songTitle) {
  const currentSongElement = document.getElementById('current-song');
  if (currentSongElement) {
    currentSongElement.textContent = songTitle;
    console.log('曲名を更新しました:', songTitle);
  } else {
    console.error('current-song要素が見つかりません');
  }
}

// 音声を停止する
function stopAudio() {
  const hiddenPlayer = document.getElementById('hidden-audio-player');
  if (hiddenPlayer) {
    hiddenPlayer.src = '';
    console.log('音声停止');
  }
  
  // 背景もリセット
  resetBackground();
}

// 背景を動画サムネイルに更新
function updateBackgroundThumbnail(videoId, thumbnailUrl) {
  // 背景要素を作成または更新
  let backgroundElement = document.getElementById('dynamic-background');
  if (!backgroundElement) {
    backgroundElement = document.createElement('div');
    backgroundElement.id = 'dynamic-background';
    backgroundElement.className = 'dynamic-background';
    document.body.appendChild(backgroundElement);
  }
  
  // 背景画像を設定
  backgroundElement.style.backgroundImage = `url(${thumbnailUrl})`;
  
  // フェードイン効果
  backgroundElement.style.opacity = '0';
  setTimeout(() => {
    backgroundElement.style.opacity = '1';
  }, 100);
}

// 背景を元に戻す
function resetBackground() {
  const backgroundElement = document.getElementById('dynamic-background');
  if (backgroundElement) {
    backgroundElement.style.opacity = '0';
    setTimeout(() => {
      backgroundElement.remove();
    }, 500);
  }

  // 隠しプレイヤーも停止
  const hiddenPlayer = document.getElementById('hidden-audio-player');
  if (hiddenPlayer) {
    hiddenPlayer.src = '';
  }
}
