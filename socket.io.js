// Demo stand-in for socket.io-client: talks to the engine in the parent page by postMessage.
window.confirm = () => true; // the sandbox blocks native dialogs
window.io = function () {
  const on = {}, wait = new Map();
  const sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
  let rid = 0;
  const fire = (ev, d) => (on[ev] || []).forEach((f) => f(d));
  window.addEventListener('message', (e) => {
    const m = e.data; if (!m || !m.demo || e.source !== window.parent) return;
    if (m.demo === 'event') fire(m.ev, m.data);
    if (m.demo === 'reply' && wait.has(m.rid)) { wait.get(m.rid)(m.res); wait.delete(m.rid); }
  });
  window.parent.postMessage({ demo: 'hello', sid }, '*');
  const sock = {
    connected: true,
    on(ev, f) { (on[ev] ||= []).push(f); return sock; },
    emit(ev, payload, cb) { const id = ++rid; if (cb) wait.set(id, cb); window.parent.postMessage({ demo: 'call', sid, rid: id, ev, payload: payload ?? {} }, '*'); return sock; },
    timeout() { return { emit: (ev, payload, cb) => sock.emit(ev, payload, (r) => cb(null, r)) }; },
  };
  setTimeout(() => fire('connect'), 30);
  return sock;
};
