var manifestJSON = require("./public/manifest.json");
const pwaArgs = {
  themeColor: manifestJSON.theme_color,
  name: manifestJSON.short_name,
  msTileColor: manifestJSON.background_color
};
module.exports = {
  publicPath:
    process.env.NODE_ENV === "production" ? "/image-colors-extractor/" : "/",
  devServer: {
    disableHostCheck: true
  },
  pwa: pwaArgs
};
