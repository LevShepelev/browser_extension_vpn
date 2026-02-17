import { useEffect, useMemo, useState } from 'react';
import type { ExtensionState, ProxyConfig, ProxyScheme } from '../types';
import { DEFAULT_STATE } from '../types';

type ResponseState = ExtensionState | { error: string };

const schemes: ProxyScheme[] = ['socks5', 'socks4', 'http', 'https'];

function isErrorResponse(value: ResponseState): value is { error: string } {
  return typeof value === 'object' && value !== null && 'error' in value;
}

async function sendMessage<T extends object, R = ResponseState>(message: T): Promise<R> {
  return chrome.runtime.sendMessage(message) as Promise<R>;
}

export function PopupApp() {
  const [state, setState] = useState<ExtensionState>(DEFAULT_STATE);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const bypassText = useMemo(() => state.config.bypassList.join(', '), [state.config.bypassList]);

  useEffect(() => {
    void (async () => {
      const result = await sendMessage({ type: 'GET_STATE' });
      if (isErrorResponse(result)) {
        setStatus(result.error);
      } else {
        setState(result);
      }
      setLoading(false);
    })();
  }, []);

  function updateConfig<K extends keyof ProxyConfig>(key: K, value: ProxyConfig[K]) {
    setState((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        [key]: value
      }
    }));
  }

  async function saveConfig() {
    setStatus('Saving...');
    const response = await sendMessage({ type: 'SAVE_CONFIG', payload: state.config });
    if (isErrorResponse(response)) {
      setStatus(response.error);
      return;
    }
    setState(response);
    setStatus('Settings saved.');
  }

  async function enable() {
    setStatus('Enabling routing...');
    const response = await sendMessage({ type: 'ENABLE' });
    if (isErrorResponse(response)) {
      setStatus(response.error);
      return;
    }
    setState(response);
    setStatus('Routing enabled.');
  }

  async function disable() {
    setStatus('Disabling routing...');
    const response = await sendMessage({ type: 'DISABLE' });
    if (isErrorResponse(response)) {
      setStatus(response.error);
      return;
    }
    setState(response);
    setStatus('Routing disabled.');
  }

  if (loading) {
    return <main className="container">Loading...</main>;
  }

  return (
    <main className="container">
      <h1>VPN Proxy</h1>

      <label>
        Host
        <input
          value={state.config.host}
          placeholder="proxy.example.com"
          onChange={(event) => updateConfig('host', event.target.value.trim())}
        />
      </label>

      <div className="row">
        <label>
          Port
          <input
            type="number"
            min={1}
            max={65535}
            value={state.config.port}
            onChange={(event) => updateConfig('port', Number(event.target.value))}
          />
        </label>

        <label>
          Scheme
          <select
            value={state.config.scheme}
            onChange={(event) => updateConfig('scheme', event.target.value as ProxyScheme)}
          >
            {schemes.map((scheme) => (
              <option key={scheme} value={scheme}>
                {scheme.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="row">
        <label>
          Username
          <input
            value={state.config.username ?? ''}
            onChange={(event) => updateConfig('username', event.target.value)}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={state.config.password ?? ''}
            onChange={(event) => updateConfig('password', event.target.value)}
          />
        </label>
      </div>

      <label>
        Bypass list (comma separated)
        <textarea
          rows={2}
          value={bypassText}
          onChange={(event) =>
            updateConfig(
              'bypassList',
              event.target.value
                .split(',')
                .map((v) => v.trim())
                .filter(Boolean)
            )
          }
        />
      </label>

      <div className="buttons">
        <button onClick={saveConfig}>Save settings</button>
        {state.enabled ? (
          <button className="danger" onClick={disable}>
            Disable routing
          </button>
        ) : (
          <button className="success" onClick={enable}>
            Enable routing
          </button>
        )}
      </div>

      <p className="status">Status: {state.enabled ? 'ON' : 'OFF'}</p>
      <p className="message">{status}</p>
    </main>
  );
}
