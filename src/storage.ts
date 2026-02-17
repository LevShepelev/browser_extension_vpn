import { DEFAULT_STATE, type ExtensionState } from './types';

const STATE_KEY = 'vpnProxyState';

export async function getState(): Promise<ExtensionState> {
  const data = await chrome.storage.local.get(STATE_KEY);
  const saved = data[STATE_KEY] as ExtensionState | undefined;

  if (!saved) {
    return DEFAULT_STATE;
  }

  return {
    ...DEFAULT_STATE,
    ...saved,
    config: {
      ...DEFAULT_STATE.config,
      ...saved.config
    }
  };
}

export async function setState(state: ExtensionState): Promise<void> {
  await chrome.storage.local.set({ [STATE_KEY]: state });
}
