/* Private marketing workspace client for the static Estrellas Plaza app. */
(function installEPMarketing(root) {
  'use strict';
  const SESSION_KEY = 'ep-marketing-v8-supabase-session';
  const MAX_WORKSPACE_BYTES = 2 * 1024 * 1024;
  const MAX_ASSET_BYTES = 100 * 1024 * 1024;
  const ALLOWED_MIME = new Set([
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
    'application/pdf', 'video/mp4', 'audio/mpeg', 'audio/mp4', 'audio/wav',
    'audio/ogg', 'text/plain', 'text/csv', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]);
  const memory = { session: null, user: null, isAdmin: null };

  function jwtClaims(value) {
    const parts = value.split('.');
    if (parts.length !== 3) return null;
    try { return JSON.parse((root.atob || globalThis.atob)(parts[1].replace(/-/g, '+').replace(/_/g, '/'))); }
    catch { return null; }
  }
  function config() {
    const value = root.EP_SUPABASE;
    if (!value || typeof value.url !== 'string' || typeof value.anonKey !== 'string') return null;
    const url = value.url.trim().replace(/\/+$/, '');
    const anonKey = value.anonKey.trim();
    if (!url || !anonKey || /TU-PROYECTO|TU_ANON|YOUR_/i.test(url + ' ' + anonKey) || anonKey.length < 20 || /^sb_secret_/i.test(anonKey)) return null;
    if (anonKey.split('.').length === 3) { const claims = jwtClaims(anonKey); if (!claims || claims.role !== 'anon') return null; }
    try { const parsed = new URL(url); if (parsed.protocol !== 'https:' && parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1') return null; }
    catch { return null; }
    return { url, anonKey };
  }
  const fail = message => new Error(message);
  function storage() { try { return root.sessionStorage; } catch { return null; } }
  function readSession() {
    if (memory.session) return memory.session;
    try {
      const value = JSON.parse(storage()?.getItem(SESSION_KEY) || 'null');
      if (value && typeof value.access_token === 'string' && typeof value.refresh_token === 'string') memory.session = value;
    } catch { /* Ignore malformed or stale storage. */ }
    return memory.session;
  }
  function saveSession(value) {
    memory.session = value || null; memory.user = value?.user || null; memory.isAdmin = null;
    try { if (value) storage()?.setItem(SESSION_KEY, JSON.stringify(value)); else storage()?.removeItem(SESSION_KEY); }
    catch { /* Session remains available in memory for this page. */ }
  }
  async function request(path, options = {}, token = null, raw = false) {
    const cfg = config(); if (!cfg) throw fail('El espacio de marketing aún no está configurado.');
    const bearer = token || (cfg.anonKey.split('.').length === 3 ? cfg.anonKey : null);
    let response;
    try {
      response = await root.fetch(`${cfg.url}${path}`, { ...options, headers: {
        apikey: cfg.anonKey, ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
        ...(options.body && !(options.body instanceof Blob) ? { 'Content-Type': 'application/json' } : {}), ...options.headers
      }});
    } catch { throw fail('No se pudo conectar con el espacio de marketing. Revisa tu conexión e inténtalo de nuevo.'); }
    if (raw && response.ok) return response.blob();
    let body = null; try { body = await response.json(); } catch { /* Empty response. */ }
    if (!response.ok) {
      const code = body?.code || body?.error_code, msg = body?.message || '';
      if (response.status === 401 || code === 'invalid_grant') throw fail('La sesión venció. Inicia sesión nuevamente.');
      if (response.status === 403 || code === '42501') throw fail('Esta cuenta no tiene permiso para acceder al espacio de marketing.');
      if (code === 'P0001' && /marketing_version_conflict/.test(msg)) throw fail('MARKETING_VERSION_CONFLICT: otra persona guardó cambios. Recarga el espacio para ver la versión actual antes de volver a guardar.');
      if (code === '22023' || /marketing_workspace_invalid/.test(msg)) throw fail('El espacio supera el tamaño permitido o tiene un formato no válido.');
      if (response.status === 413) throw fail('El archivo supera el tamaño máximo de 100 MB.');
      if (response.status >= 500) throw fail('El servicio de marketing no está disponible por ahora. Inténtalo más tarde.');
      throw fail('No se pudo completar la solicitud. Verifica los datos e inténtalo de nuevo.');
    }
    return body;
  }
  async function refresh() {
    let session = readSession(); if (!session) return null;
    if (Number(session.expires_at || 0) * 1000 > Date.now() + 60_000) return session;
    try {
      const next = await request('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: JSON.stringify({ refresh_token: session.refresh_token }) });
      if (!next?.access_token || !next?.refresh_token) throw fail('La sesión venció. Inicia sesión nuevamente.');
      session = { ...next, expires_at: next.expires_at || Math.floor(Date.now() / 1000) + Number(next.expires_in || 3600) }; saveSession(session); return session;
    } catch (error) { saveSession(null); throw error; }
  }
  async function authRequest(path, options = {}, raw = false) {
    const session = await refresh(); if (!session) throw fail('Inicia sesión para continuar.');
    try { return await request(path, options, session.access_token, raw); }
    catch (error) { if (/sesión venció/.test(error.message)) saveSession(null); throw error; }
  }
  function requiredString(value, limit, label) {
    if (typeof value !== 'string' || !value.trim() || value.length > limit) throw fail(`El campo ${label} no es válido.`);
    return value.trim();
  }
  async function assertAdmin() {
    const session = await refresh(); if (!session) throw fail('Inicia sesión para continuar.');
    if (memory.isAdmin === true) return;
    const value = await authRequest('/rest/v1/rpc/is_gallery_brief_admin', { method: 'POST', body: '{}' });
    memory.isAdmin = value === true;
    if (!memory.isAdmin) throw fail('Esta cuenta no tiene permiso para acceder al espacio de marketing.');
  }
  function safeFilename(name) { return String(name || 'archivo').normalize('NFKD').replace(/[^\w.-]+/g, '-').replace(/^-+|-+$/g, '').slice(-100) || 'archivo'; }
  const api = {
    configured() { return Boolean(config()); },
    async login(email, password) {
      requiredString(email, 254, 'correo'); requiredString(password, 1024, 'contraseña');
      const result = await request('/auth/v1/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email: email.trim(), password }) });
      if (!result?.access_token || !result?.refresh_token || !result?.user) throw fail('No se pudo iniciar sesión. Verifica tus datos.');
      saveSession({ ...result, expires_at: result.expires_at || Math.floor(Date.now() / 1000) + Number(result.expires_in || 3600) });
      return { user: result.user };
    },
    async signup(email, password) {
      requiredString(email, 254, 'correo'); requiredString(password, 1024, 'contraseña');
      const result = await request('/auth/v1/signup', { method: 'POST', body: JSON.stringify({ email: email.trim(), password }) });
      if (result?.access_token && result?.refresh_token && result?.user) saveSession({ ...result, expires_at: result.expires_at || Math.floor(Date.now() / 1000) + Number(result.expires_in || 3600) });
      return { needsEmailConfirmation: !result?.access_token, user: result?.user || (result?.id ? result : null) };
    },
    async logout() {
      const session = readSession(); saveSession(null);
      if (session && config()) try { await request('/auth/v1/logout', { method: 'POST' }, session.access_token); } catch { /* Local logout is complete. */ }
    },
    async getUser() {
      const session = await refresh().catch(() => null); if (!session) return null;
      try { const user = await request('/auth/v1/user', {}, session.access_token); memory.user = user; return user; }
      catch (error) { if (/sesión venció/.test(error.message)) { saveSession(null); return null; } throw error; }
    },
    async isAdmin() {
      if (!await api.getUser()) return false;
      try { await assertAdmin(); return true; } catch (error) { if (/no tiene permiso/.test(error.message)) return false; throw error; }
    },
    async loadWorkspace() {
      await assertAdmin();
      const result = await authRequest('/rest/v1/rpc/get_marketing_workspace', { method: 'POST', body: '{}' });
      if (!result || !Object.hasOwn(result, 'data') || !Number.isInteger(result.version)) throw fail('El espacio devolvió una respuesta no válida.');
      return { data: result.data, version: result.version };
    },
    async saveWorkspace(data, expectedVersion) {
      await assertAdmin();
      if (!Number.isInteger(expectedVersion) || expectedVersion < 0) throw fail('La versión del espacio no es válida.');
      let body; try { body = JSON.stringify(data); } catch { throw fail('El espacio tiene un formato no válido.'); }
      if (!data || typeof data !== 'object' || Array.isArray(data) || new TextEncoder().encode(body).byteLength > MAX_WORKSPACE_BYTES) throw fail('El espacio supera el tamaño permitido o tiene un formato no válido.');
      const result = await authRequest('/rest/v1/rpc/save_marketing_workspace', { method: 'POST', body: JSON.stringify({ workspace_data: data, expected_version: expectedVersion }) });
      if (!result || !Object.hasOwn(result, 'data') || !Number.isInteger(result.version)) throw fail('El espacio devolvió una respuesta no válida.');
      return { data: result.data, version: result.version };
    },
    async listBriefs() {
      await assertAdmin();
      const rows = await authRequest('/rest/v1/brief_submissions?select=receipt_id,business_id,answers,status,version,updated_at&order=updated_at.desc');
      if (!Array.isArray(rows)) throw fail('La recepción devolvió una respuesta no válida.');
      return rows.map(row => ({ id: row.business_id, answers: row.answers, status: row.status, version: row.version, updatedAt: row.updated_at, receiptId: row.receipt_id }));
    },
    async updateBriefStatus(receiptId, status) {
      await assertAdmin(); requiredString(receiptId, 80, 'comprobante');
      if (!new Set(['PARA_REVISAR', 'APROBADO', 'CAMBIOS_SOLICITADOS']).has(status)) throw fail('El estado solicitado no es válido.');
      return authRequest('/rest/v1/rpc/update_gallery_brief_status', { method: 'POST', body: JSON.stringify({ brief_receipt_id: receiptId, next_status: status }) });
    },
    async uploadAsset(file) {
      await assertAdmin();
      if (!file || typeof file.size !== 'number' || file.size < 1 || file.size > MAX_ASSET_BYTES) throw fail('El archivo debe pesar entre 1 byte y 100 MB.');
      const mime = String(file.type || '').toLowerCase();
      if (!ALLOWED_MIME.has(mime)) throw fail('Este tipo de archivo no está permitido.');
      const name = safeFilename(file.name), path = `${crypto.randomUUID()}-${name}`;
      await authRequest(`/storage/v1/object/marketing-private/${encodeURIComponent(path)}`, { method: 'POST', body: file, headers: { 'Content-Type': mime, 'x-upsert': 'false' } });
      return { path, name, size: file.size, mime };
    },
    async listAssets() {
      await assertAdmin();
      const items = await authRequest('/storage/v1/object/list/marketing-private', { method: 'POST', body: JSON.stringify({ prefix: '', limit: 1000, offset: 0, sortBy: { column: 'name', order: 'asc' } }) });
      if (!Array.isArray(items)) throw fail('El archivo de recursos devolvió una respuesta no válida.');
      return items.filter(item => item?.name && item.name !== '.emptyFolderPlaceholder').map(item => ({ path: item.name, name: item.name.replace(/^[0-9a-f-]{36}-/i, ''), size: Number(item.metadata?.size || 0), mime: item.metadata?.mimetype || 'application/octet-stream' }));
    },
    async downloadAsset(path) {
      await assertAdmin(); requiredString(path, 240, 'archivo');
      if (path.includes('/') || path.includes('..')) throw fail('La ruta del archivo no es válida.');
      return authRequest(`/storage/v1/object/marketing-private/${encodeURIComponent(path)}`, { method: 'GET' }, true);
    }
  };
  root.EPMarketing = api;
})(typeof window !== 'undefined' ? window : globalThis);
