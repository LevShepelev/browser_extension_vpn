import { getState, setState } from './storage';
import type { ProxyConfig } from './types';

const PROXY_SCOPE: chrome.types.ChromeSettingScope = 'regular';

function toChromeProxyConfig(config: ProxyConfig): chrome.proxy.ProxyConfig {
  return {
    mode: 'fixed_servers',
    rules: {
      singleProxy: {
        scheme: config.scheme,
        host: config.host,
        port: config.port
      },
      bypassList: config.bypassList
    }
  };
}

async function applyProxy(config: ProxyConfig): Promise<void> {
  await chrome.proxy.settings.set({
    value: toChromeProxyConfig(config),
    scope: PROXY_SCOPE
  });
}

async function clearProxy(): Promise<void> {
  await chrome.proxy.settings.clear({ scope: PROXY_SCOPE });
}

chrome.runtime.onInstalled.addListener(async () => {
  const state = await getState();
  if (state.enabled && state.config.host) {
    await applyProxy(state.config);
  }
});

chrome.runtime.onStartup.addListener(async () => {
  const state = await getState();
  if (state.enabled && state.config.host) {
    await applyProxy(state.config);
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  (async () => {
    const state = await getState();

    if (message.type === 'GET_STATE') {
      sendResponse(state);
      return;
    }

    if (message.type === 'SAVE_CONFIG') {
      const nextState = {
        ...state,
        config: message.payload
      };
      await setState(nextState);
      if (nextState.enabled) {
        await applyProxy(nextState.config);
      }
      sendResponse(nextState);
      return;
    }

    if (message.type === 'ENABLE') {
      if (!state.config.host) {
        throw new Error('Host is required before enabling proxy.');
      }
      const nextState = { ...state, enabled: true };
      await applyProxy(nextState.config);
      await setState(nextState);
      sendResponse(nextState);
      return;
    }

    if (message.type === 'DISABLE') {
      const nextState = { ...state, enabled: false };
      await clearProxy();
      await setState(nextState);
      sendResponse(nextState);
      return;
    }

    sendResponse(state);
  })().catch((error: unknown) => {
    const messageText = error instanceof Error ? error.message : 'Unexpected extension error';
    sendResponse({ error: messageText });
  });

  return true;
});

chrome.webRequest.onAuthRequired.addListener(
  async () => {
    const state = await getState();

    if (!state.enabled) {
      return {};
    }

    const { username, password } = state.config;
    if (!username || !password) {
      return {};
    }

    return {
      authCredentials: {
        username,
        password
      }
    };
  },
  { urls: ['<all_urls>'] },
  ['asyncBlocking']
);
