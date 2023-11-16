module.exports = function override(config) {
  config.module.rules.push({
    test: /\.py$/i,
    type: 'asset/source',
  });

  return config;
};
