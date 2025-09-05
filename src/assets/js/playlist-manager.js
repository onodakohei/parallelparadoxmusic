// プレイリストの定義（Eleventyから読み込まれる）
let PLAYLISTS = [];
let SONGS = [];

// データの読み込み
async function loadData() {
  try {
    const timestamp = new Date().getTime(); // Generate a unique timestamp
    const [playlistsResponse, songsResponse] = await Promise.all([
      fetch(`/playlists.json?v=${timestamp}`), // Add timestamp to URL
      fetch(`/songs.json?v=${timestamp}`)     // Add timestamp to URL
    ]);
    
    PLAYLISTS = await playlistsResponse.json();
    SONGS = await songsResponse.json();
    
    console.log('データが読み込まれました:', { PLAYLISTS, SONGS });
  } catch (error) {
    console.error('データの読み込みに失敗しました:', error);
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
  const playlistInfo = document.getElementById('current-playlist');
  if (playlistInfo) {
    playlistInfo.textContent = PLAYLISTS[currentPlaylistIndex].name;
  }
  
  // プレイリスト選択モーダル内の選択状態も更新
  updatePlaylistSelectorActiveState();
  
  // プレイリスト名オーバーレイを表示
  showPlaylistOverlay();
  
  // プレイリスト切り替え時に自動再生（安全な方法で）
  const currentPlaylistId = getCurrentPlaylistId();
  console.log('プレイリスト切り替え:', PLAYLISTS[currentPlaylistIndex].name, 'ID:', currentPlaylistId);
  
  // データが正常に読み込まれている場合のみ自動再生
  if (PLAYLISTS.length > 0 && SONGS.length > 0 && typeof playRandomAudio === 'function' && !isAutoPlaying) {
    isAutoPlaying = true; // フラグを設定
    
    // 少し遅延させて安全に実行
    setTimeout(() => {
      playRandomAudio(currentPlaylistId, PLAYLISTS[currentPlaylistIndex].name);
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
  
  // データを読み込み
  await loadData();
  
  // データが正常に読み込まれた場合のみ処理を続行
  if (PLAYLISTS.length === 0 || SONGS.length === 0) {
    console.warn('プレイリストまたは楽曲データが読み込まれていません');
    return;
  }
  
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
      playRandomAudio(currentPlaylistId, PLAYLISTS[0].name);
      isAutoPlaying = false;
    }, 200); // 初期化時は少し長めの遅延
  }
});
