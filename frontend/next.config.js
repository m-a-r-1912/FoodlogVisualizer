/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  env: {
    REACT_APP_FITBIT_OAUTH_REDIRECT: process.env.REACT_APP_FITBIT_OAUTH_REDIRECT,
    REACT_APP_FITBIT_OAUTH_CLIENT_ID: process.env.REACT_APP_FITBIT_OAUTH_CLIENT_ID,
  },
};

module.exports = nextConfig;
