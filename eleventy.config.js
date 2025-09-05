module.exports = function(eleventyConfig) {
  // GitHub Pages用のベースパス設定
  // リポジトリ名が parallelparadoxmusic の場合
  eleventyConfig.addPassthroughCopy("src/assets");
  
  // JSONファイルを静的ファイルとして配信
  eleventyConfig.addPassthroughCopy({
    "src/_data/songs.json": "songs.json",
    "src/_data/playlists.json": "playlists.json"
  });
  
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_includes/layouts"
    },
    // GitHub Pages用のベースパス
    pathPrefix: "/parallelparadoxmusic/"
  };
};
