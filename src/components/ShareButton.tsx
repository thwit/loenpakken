import { useState } from 'react';
import styles from '../styles/ShareButton.module.css';

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = window.location.href;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    (window as any).umami?.track('share');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button className={styles.button} onClick={handleCopy}>
      {copied ? 'Kopieret!' : 'Del link'}
    </button>
  );
}
