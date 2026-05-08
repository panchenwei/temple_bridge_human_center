let amapPromise: Promise<AMapNamespace> | null = null;

export function loadAmap() {
  if (window.AMap) return Promise.resolve(window.AMap);
  if (amapPromise) return amapPromise;

  const key = import.meta.env.VITE_AMAP_KEY;
  const securityJsCode = import.meta.env.VITE_AMAP_SECURITY_JS_CODE;

  if (!key) {
    return Promise.reject(new Error('Missing VITE_AMAP_KEY'));
  }

  if (securityJsCode) {
    window._AMapSecurityConfig = { securityJsCode };
  }

  amapPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const params = new URLSearchParams({
      v: '2.0',
      key,
      plugin: 'AMap.Scale,AMap.ToolBar,AMap.Walking',
    });

    script.src = `https://webapi.amap.com/maps?${params.toString()}`;
    script.async = true;
    script.defer = true;
    script.dataset.amapJsapi = 'true';
    script.onload = () => {
      if (window.AMap) resolve(window.AMap);
      else reject(new Error('AMap script loaded without window.AMap'));
    };
    script.onerror = () => reject(new Error('Failed to load AMap JSAPI'));

    document.head.appendChild(script);
  });

  return amapPromise;
}
