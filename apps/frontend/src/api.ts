// api.ts
const BASE = import.meta.env.VITE_API_BASE || "/api";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export function signup(email: string, password: string) {
  return fetch(`${BASE}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }).then(json);
}

export function login(email: string, password: string) {
  return fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }).then(json);
}

export function logout() {
  return fetch(`${BASE}/logout`, {
    method: "POST",
    credentials: "include",
  }).then(json);
}

export function getCurrentUser() {
  return fetch(`${BASE}/me`, {
    credentials: "include",
  }).then(json);
}

export function getCompletedItems(bucketId: string) {
  return fetch(
    `${BASE}/item-action?bucketId=${encodeURIComponent(bucketId)}&done=true`,
    {
      credentials: "include",
    }
  ).then(json);
}

// collaboration functions
export function generateInvite(bucketId: string) {
  return fetch(`${BASE}/collab/generate-invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ bucketId }),
  }).then(json);
}

export function acceptInvite(inviteCode: string) {
  return fetch(`${BASE}/collab/accept-invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ inviteCode }),
  }).then(json);
}

export function getCollaborators(bucketId: string) {
  return fetch(`${BASE}/collab/collaborators/${encodeURIComponent(bucketId)}`, {
    credentials: "include",
  }).then(json);
}

export function removeCollaborator(bucketId: string, collaboratorEmail: string) {
  return fetch(`${BASE}/collab/remove-collaborator`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ bucketId, collaboratorEmail }),
  }).then(json);
}
