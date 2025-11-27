const MAX_TOKEN_SIZE = 8192;
const getTokenSize = (token: string) => new Blob(['Bearer ' + token]).size;
const isTokenSizeSafe = (token: string) => getTokenSize(token) <= MAX_TOKEN_SIZE;

export const TokenDebugger = () => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  const accessTokenSize = accessToken ? getTokenSize(accessToken) : 0;
  const refreshTokenSize = refreshToken ? getTokenSize(refreshToken) : 0;
  const accessTokenSafe = accessToken ? isTokenSizeSafe(accessToken) : true;
  const refreshTokenSafe = refreshToken ? isTokenSizeSafe(refreshToken) : true;

  const clearAll = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: '#1a1a1a',
      color: '#fff',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
      maxWidth: '300px',
      zIndex: 9999,
    }}>
      <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>🔍 Token Debug</h4>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Access Token:</strong><br />
        Size: {accessTokenSize} bytes<br />
        Status: <span style={{ color: accessTokenSafe ? '#4ade80' : '#ef4444' }}>
          {accessTokenSafe ? '✓ Safe' : '⚠ TOO LARGE'}
        </span>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <strong>Refresh Token:</strong><br />
        Size: {refreshTokenSize} bytes<br />
        Status: <span style={{ color: refreshTokenSafe ? '#4ade80' : '#ef4444' }}>
          {refreshTokenSafe ? '✓ Safe' : '⚠ TOO LARGE'}
        </span>
      </div>

      <button
        onClick={clearAll}
        style={{
          width: '100%',
          padding: '8px',
          background: '#ef4444',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
        }}
      >
        Clear All & Reload
      </button>
    </div>
  );
};
