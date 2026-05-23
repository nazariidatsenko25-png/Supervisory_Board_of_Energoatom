(function() {
    // Find our script tag
    const currentScript = document.currentScript || (function() {
        const scripts = document.getElementsByTagName('script');
        return scripts[scripts.length - 1];
    })();
    
    if (!currentScript) {
        console.error('Agentic Studio Embed: Cannot find script tag');
        return;
    }
    
    const agentId = currentScript.getAttribute('data-agent');
    if (!agentId) {
        console.error('Agentic Studio Embed: data-agent attribute is missing');
        return;
    }

    // Derive base URL from script src (works on any host, not just localhost)
    const scriptSrc = currentScript.getAttribute('src');
    const baseUrl = scriptSrc ? new URL(scriptSrc).origin : 'http://localhost:3000';

    // Create the iframe
    const iframe = document.createElement('iframe');
    iframe.src = `${baseUrl}/widget/${agentId}`;
    iframe.style.cssText = 'position: fixed; bottom: 90px; right: 24px; width: 380px; height: 600px; max-height: 85vh; border: none; border-radius: 16px; display: none; z-index: 999999; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); background: transparent; overflow: hidden;';
    
    // Create the toggle button
    const btn = document.createElement('button');
    btn.innerHTML = `
        <svg style="width: 24px; height: 24px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;" viewBox="0 0 24 24">
          <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
    `;
    btn.style.cssText = 'position: fixed; bottom: 24px; right: 24px; width: 56px; height: 56px; border-radius: 28px; border: none; background: #00E5C7; color: #0C0C0E; cursor: pointer; z-index: 999999; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 30px rgba(0, 229, 199, 0.3), 0 10px 15px -3px rgba(0, 0, 0, 0.2); transition: transform 0.2s ease;';
    
    btn.onmouseover = () => { btn.style.transform = 'scale(1.05)'; };
    btn.onmouseout = () => { btn.style.transform = 'scale(1)'; };

    let isOpen = false;
    btn.onclick = () => {
        isOpen = !isOpen;
        if (isOpen) {
            iframe.style.display = 'block';
            btn.innerHTML = `
                <svg style="width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
            `;
        } else {
            iframe.style.display = 'none';
            btn.innerHTML = `
                <svg style="width: 24px; height: 24px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;" viewBox="0 0 24 24">
                  <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            `;
        }
    };

    document.body.appendChild(iframe);
    document.body.appendChild(btn);
})();
