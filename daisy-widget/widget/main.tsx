import { createRoot } from 'react-dom/client';
import styles from './styles.css?inline';
import { App } from './App';
import './config';
import { ErrorBoundary } from './errorBoundary';

function mount() {
    const anchor = document.getElementById('daisy-booking');
    if (!anchor) {
        console.warn('[Daisy] Element #daisy-booking introuvable sur la page. ');
        return;
    }

    const studioKey = anchor.dataset.studio ?? '';
    const host = document.createElement('daisy-booking');
    anchor.appendChild(host);

    const shadow = host.attachShadow({mode: 'open'});

    const style = document.createElement('style');
    style.textContent = styles;
    const container = document.createElement('div');
    container.className = 'daisy-root';
    shadow.append(style, container);

    createRoot(container).render(
        <ErrorBoundary>
          <App studioKey={studioKey} />
        </ErrorBoundary>,
      );
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
} else {
    mount();
}

