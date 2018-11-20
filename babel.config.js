 module.exports = {
  presets: ["@babel/env"], 
  plugins: ["@babel/plugin-proposal-function-bind", 
      [ "@babel/plugin-proposal-pipeline-operator", { proposal: "minimal" }]],};
