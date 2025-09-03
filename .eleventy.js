module.exports = function(eleventyConfig) {
  // 静的アセットをコピー
  eleventyConfig.addPassthroughCopy({"src/assets": "assets"});

  // 日付フィルタ（ISO & 年のみ）
  eleventyConfig.addFilter("iso", (date) => new Date(date).toISOString());
  eleventyConfig.addFilter("year", (date) => new Date(date).getFullYear());

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    templateFormats: ["njk","md","html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    passthroughFileCopy: true
  };
};
