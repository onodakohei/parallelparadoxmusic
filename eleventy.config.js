module.exports = function(eleventyConfig) {
  // GitHub Pages用のベースパス設定
  // リポジトリ名が parallelparadoxmusic の場合
  eleventyConfig.addPassthroughCopy("src/assets");
  
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
