import { defineConfig } from 'wxt';

export default defineConfig({
  modules: [],
  manifest: {
    name: '__MSG_extName__',
    description: '__MSG_extDescription__',
    default_locale: 'zh_CN',
    version: '1.0.0',
    permissions: ['activeTab'],
    host_permissions: ['*://x.com/*', '*://twitter.com/*'],
  },
});
