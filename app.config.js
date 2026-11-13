const baseConfig = require('./app.json').expo;

const variant =
  process.env.APP_VARIANT ||
  process.env.EAS_BUILD_PROFILE ||
  'development';

const variants = {
  development: {
    name: 'EMPS Developer',
    androidPackage: 'com.luixgbr.emps.dev',
    googleServicesFile: './google-services-dev.json',
  },

  preview: {
    name: 'EMPS Preview',
    androidPackage: 'com.luixgbr.emps.preview',
    googleServicesFile: './google-services-preview.json',
  },

  production: {
    name: 'EMPS',
    androidPackage: 'com.luixgbr.EMPS',
    googleServicesFile: './google-services.json',
  },
};

const selectedVariant = variants[variant];

if (!selectedVariant) {
  throw new Error(`Ambiente EMPS inválido: ${variant}`);
}

module.exports = {
  ...baseConfig,

  name: selectedVariant.name,

  android: {
    ...baseConfig.android,
    package: selectedVariant.androidPackage,
    googleServicesFile: selectedVariant.googleServicesFile,
  },
};
