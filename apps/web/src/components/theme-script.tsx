const script = `(function(){try{var k='ez2h-theme';var t=localStorage.getItem(k);var m=window.matchMedia('(prefers-color-scheme: dark)');var d=t==='dark'||(t!=='light'&&(t==='system'||!t)&&m.matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
