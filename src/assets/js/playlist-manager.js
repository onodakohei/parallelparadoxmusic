// プレイリストの定義
const PLAYLISTS = [
  {
    id: 'PL73fsfH7Wif0WymWp6qpnPN1KkGHmSkMF',
    name: 'ALL',
    title: 'ALL'
  },
  {
    id: 'PLi7O_6eOxnHhGeS-Uezr9cNqErwHNPNby',
    name: 'POPS PPM1',
    title: 'POPS PPM1'
  }
];

let currentPlaylistIndex = 0;

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
  
  // プレイリスト切り替え時に即座に曲を再生
  const currentPlaylistId = getCurrentPlaylistId();
  console.log('プレイリスト切り替え:', PLAYLISTS[currentPlaylistIndex].name, 'ID:', currentPlaylistId);
  
  // 現在のプレイリストからランダムな曲を再生
  if (typeof playRandomAudio === 'function') {
    playRandomAudio(currentPlaylistId, PLAYLISTS[currentPlaylistIndex].name);
  }
}

// 現在のプレイリストIDを取得
function getCurrentPlaylistId() {
  return PLAYLISTS[currentPlaylistIndex].id;
}

// 手動で管理するプレイリスト情報
const PLAYLIST_DATA = {
  'PL73fsfH7Wif0WymWp6qpnPN1KkGHmSkMF': {
    name: 'Parallel Paradox Music',
    videos: [
      'VomxcNMgf-g', // 真夜中の静電気
      'wlDr5WOIjN4', // Crosswind Velocity
      'iPyg5DHFLuQ', // Tango de Lágrimas Nocturnas
      'ryptNQ6Nc-8', // February Sky
      'MRX9S4uRHEQ', // Slow Down, Moonlight
      'AQ8qx8QqtpE', // Highway Runs Through My Soul
      'r4DoNHSX1Ao', // Brilho do Verão
      'KpoQ7PdMqVU', // 衝動のままに 身体が反応している
      'FPUXAc5Yia4', // Bleed the Static
      'vCbrVIT_z3Q', // The Night Spins On
      'zCxBN5kQHqE', // ただいまを言う場所が　ひとつあればいい　夜が深くなるほどに　星は数えやすい
      'NpUwjX2oHzA', // Singet, Herzen, singet leise
      'FWdwYb-KOZo', // Heidenröslein -SUNO AI-
      '9dsA2V9oEe4', // Routine Revolution
      'BcX_CzQ6cbk', // 息を継ぐ街
      'kj81tMx_8xI', // チクタク・チョコミント
      'i8WeSEJp_aw', // Above the Horizon
      'D4B46vjEY1M', // Electric Sky
      'tzLF6lMcSBM', // 君は少し斜めでいい
      'GzajvlhqtrM', // 耳すませば　息づく町
      'Kso7Xx5uWHs', // Kyrie -SUNO AI-
      '8u3PQI1tKSM', // One Step Behind
      'lNfgWPfdfgA', // Rooted in Alabama
      'UfGBy7xGF1c', // Future Science Room
      'repdohEMtNM', // あなたが私を
      '1a_5yDik8Qw', // ALL NIGHT, ALL RIGHT!
      'kMHIbL9DVoQ', // shutdown.exe
      'Z4WQOlCyEs0', // 暗くておかしなもの
      'yMoDfqsa-h8', // Somos bossa, somos canção
      'vTM0l-41ojE', // Above the Horizon ChiptuneFusion Remix
      'NZEk-oXw41Y', // たぶん今日もいい日になる
      'TgVAm60n7z0', // E outra vez, a história é contada
      'q7el9IXQrKY', // 頼んまっせファンク
      'yNuw-oOyJps', // 春ci那tion
      'JbniOdhFDQ8', // ゼロウェイト
      'JnhVIhwgATE', // Nameless Fairy Tale
      'qq_RwDt9xy8', // Night runs backward
      'f6lkuFt7BFo', // 走り出す風
      'zx6ZVZflzww', // Turn / Return
      'XdBfCAR-iM8', // Gloria -SUNO AI-
      'ByEgypawjXM', // Twilight Rush
      'CRmpIMwH9_4', // Truth in motion, never still
      'gS6Hve0APIs', // Infinite parallel world
      'vT0-sR7aVSE', // Into the Abyss
      'pVAxWiWshYM', // 夢の中で夢のままで
      's03mEH5Ni_E', // 時空断層の矛盾律動
      'OL8vuCNWaOk', // 人類隔離クラブ
      'd1hjI9bHs5Y', // 遠い記憶がこだまを呼び、そのあとは静けさが満ちていく
      '1AkFD3tZ9jA'  // All Aboard
    ]
  },
  'PLi7O_6eOxnHhGeS-Uezr9cNqErwHNPNby': {
    name: 'POPS PPM1',
    videos: [
      'BcX_CzQ6cbk', // 息を継ぐ街
      'zCxBN5kQHqE', // ただいまを言う場所が　ひとつあればいい　夜が深くなるほどに　星は数えやすい
      'JnhVIhwgATE', // Nameless Fairy Tale
      'repdohEMtNM', // あなたが私を
      'CRmpIMwH9_4', // Truth in motion, never still
      'NZEk-oXw41Y', // たぶん今日もいい日になる
      'f6lkuFt7BFo', // 走り出す風
      'JbniOdhFDQ8', // ゼロウェイト
      'kMHIbL9DVoQ', // shutdown.exe
      'd1hjI9bHs5Y'  // 遠い記憶がこだまを呼び、そのあとは静けさが満ちていく
    ]
  }
};

// 曲のタイトル情報
const SONG_TITLES = {
  'VomxcNMgf-g': '真夜中の静電気',
  'wlDr5WOIjN4': 'Crosswind Velocity',
  'iPyg5DHFLuQ': 'Tango de Lágrimas Nocturnas',
  'ryptNQ6Nc-8': 'February Sky',
  'MRX9S4uRHEQ': 'Slow Down, Moonlight',
  'AQ8qx8QqtpE': 'Highway Runs Through My Soul',
  'r4DoNHSX1Ao': 'Brilho do Verão',
  'KpoQ7PdMqVU': '衝動のままに 身体が反応している',
  'FPUXAc5Yia4': 'Bleed the Static',
  'vCbrVIT_z3Q': 'The Night Spins On',
  'zCxBN5kQHqE': 'ただいまを言う場所が　ひとつあればいい　夜が深くなるほどに　星は数えやすい',
  'NpUwjX2oHzA': 'Singet, Herzen, singet leise',
  'FWdwYb-KOZo': 'Heidenröslein -SUNO AI-',
  '9dsA2V9oEe4': 'Routine Revolution',
  'BcX_CzQ6cbk': '息を継ぐ街',
  'kj81tMx_8xI': 'チクタク・チョコミント',
  'i8WeSEJp_aw': 'Above the Horizon',
  'D4B46vjEY1M': 'Electric Sky',
  'tzLF6lMcSBM': '君は少し斜めでいい',
  'GzajvlhqtrM': '耳すませば　息づく町',
  'Kso7Xx5uWHs': 'Kyrie -SUNO AI-',
  '8u3PQI1tKSM': 'One Step Behind',
  'lNfgWPfdfgA': 'Rooted in Alabama',
  'UfGBy7xGF1c': 'Future Science Room',
  'repdohEMtNM': 'あなたが私を',
  '1a_5yDik8Qw': 'ALL NIGHT, ALL RIGHT!',
  'kMHIbL9DVoQ': 'shutdown.exe',
  'Z4WQOlCyEs0': '暗くておかしなもの',
  'yMoDfqsa-h8': 'Somos bossa, somos canção',
  'vTM0l-41ojE': 'Above the Horizon ChiptuneFusion Remix',
  'NZEk-oXw41Y': 'たぶん今日もいい日になる',
  'TgVAm60n7z0': 'E outra vez, a história é contada',
  'q7el9IXQrKY': '頼んまっせファンク',
  'yNuw-oOyJps': '春ci那tion',
  'JbniOdhFDQ8': 'ゼロウェイト',
  'JnhVIhwgATE': 'Nameless Fairy Tale',
  'qq_RwDt9xy8': 'Night runs backward',
  'f6lkuFt7BFo': '走り出す風',
  'zx6ZVZflzww': 'Turn / Return',
  'XdBfCAR-iM8': 'Gloria -SUNO AI-',
  'ByEgypawjXM': 'Twilight Rush',
  'CRmpIMwH9_4': 'Truth in motion, never still',
  'gS6Hve0APIs': 'Infinite parallel world',
  'vT0-sR7aVSE': 'Into the Abyss',
  'pVAxWiWshYM': '夢の中で夢のままで',
  's03mEH5Ni_E': '時空断層の矛盾律動',
  'OL8vuCNWaOk': '人類隔離クラブ',
  'd1hjI9bHs5Y': '遠い記憶がこだまを呼び、そのあとは静けさが満ちていく',
  '1AkFD3tZ9jA': 'All Aboard'
};

// プレイリスト管理クラス
class PlaylistManager {
  constructor() {
    this.currentPlaylist = null;
    this.playedVideos = {}; // プレイリストごとの再生済み曲を管理
  }

  // プレイリストからランダムな動画を取得（一巡するまで同じ曲を選ばない）
  getRandomVideo(playlistId) {
    console.log('getRandomVideo 呼び出し:', playlistId);
    console.log('PLAYLIST_DATA:', PLAYLIST_DATA);
    console.log('利用可能なプレイリストID:', Object.keys(PLAYLIST_DATA));
    
    const playlist = PLAYLIST_DATA[playlistId];
    if (!playlist || playlist.videos.length === 0) {
      console.error('プレイリストが見つからないか、動画がありません');
      console.error('検索したプレイリストID:', playlistId);
      console.error('利用可能なプレイリスト:', Object.keys(PLAYLIST_DATA));
      return null;
    }

    // プレイリストごとの再生済み曲を初期化
    if (!this.playedVideos[playlistId]) {
      this.playedVideos[playlistId] = [];
    }

    // すべての曲が再生済みの場合、リセット
    if (this.playedVideos[playlistId].length >= playlist.videos.length) {
      console.log('プレイリストが一巡しました。リセットします。');
      this.playedVideos[playlistId] = [];
    }

    // まだ再生されていない曲のみから選択
    const availableVideos = playlist.videos.filter(videoId => 
      !this.playedVideos[playlistId].includes(videoId)
    );

    if (availableVideos.length === 0) {
      console.error('再生可能な曲がありません');
      return null;
    }

    // 利用可能な曲からランダムに選択
    const randomIndex = Math.floor(Math.random() * availableVideos.length);
    const videoId = availableVideos[randomIndex];
    
    // 再生済みリストに追加
    this.playedVideos[playlistId].push(videoId);
    
    console.log(`選択された曲: ${videoId} (${SONG_TITLES[videoId] || 'Unknown'})`);
    console.log(`再生済み曲数: ${this.playedVideos[playlistId].length}/${playlist.videos.length}`);
    
    return {
      id: videoId,
      title: SONG_TITLES[videoId] || `Track ${randomIndex + 1}`,
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    };
  }

  // プレイリスト情報を表示（デバッグ用）
  displayPlaylistInfo(playlistId) {
    const playlist = PLAYLIST_DATA[playlistId];
    if (!playlist) {
      console.log('プレイリストが見つかりません');
      return;
    }

    console.log('=== プレイリスト情報 ===');
    console.log(`プレイリスト名: ${playlist.name}`);
    console.log(`動画数: ${playlist.videos.length}`);
    console.log('動画ID一覧:');
    playlist.videos.forEach((videoId, index) => {
      console.log(`${index + 1}. ${videoId}`);
    });
  }

  // 動画IDを追加
  addVideo(playlistId, videoId, title = '') {
    if (!PLAYLIST_DATA[playlistId]) {
      PLAYLIST_DATA[playlistId] = {
        name: 'Custom Playlist',
        videos: []
      };
    }
    
    PLAYLIST_DATA[playlistId].videos.push(videoId);
    console.log(`動画ID ${videoId} を追加しました (${title})`);
  }

  // 動画IDを削除
  removeVideo(playlistId, videoId) {
    const playlist = PLAYLIST_DATA[playlistId];
    if (!playlist) return false;
    
    const index = playlist.videos.indexOf(videoId);
    if (index > -1) {
      playlist.videos.splice(index, 1);
      console.log(`動画ID ${videoId} を削除しました`);
      return true;
    }
    return false;
  }

  // プレイリストの全動画を取得
  getAllVideos(playlistId) {
    const playlist = PLAYLIST_DATA[playlistId];
    return playlist ? playlist.videos : [];
  }

  // プレイリストの動画数を取得
  getVideoCount(playlistId) {
    const playlist = PLAYLIST_DATA[playlistId];
    return playlist ? playlist.videos.length : 0;
  }
}

// グローバルインスタンスを作成
const playlistManager = new PlaylistManager();

// グローバルスコープで利用可能にする
window.playlistManager = playlistManager;

// 初期化時にプレイリスト情報を表示
document.addEventListener('DOMContentLoaded', function() {
  console.log('プレイリストマネージャーが初期化されました');
  console.log('PLAYLIST_DATA:', PLAYLIST_DATA);
  console.log('PLAYLISTS:', PLAYLISTS);
  console.log('利用可能なプレイリスト:');
  Object.keys(PLAYLIST_DATA).forEach(playlistId => {
    playlistManager.displayPlaylistInfo(playlistId);
  });
  console.log('動画IDを追加するには、playlistManager.addVideo() を使用してください');
  
  // 初期表示を設定
  const playlistInfo = document.getElementById('current-playlist');
  if (playlistInfo) {
    playlistInfo.textContent = 'ALL';
  }
  
  const currentSongElement = document.getElementById('current-song');
  if (currentSongElement) {
    currentSongElement.textContent = '';
  }
  

});
