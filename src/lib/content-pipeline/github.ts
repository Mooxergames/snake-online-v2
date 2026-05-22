/**
 * Shared GitHub Contents API helpers — used by generate-post, translate-post,
 * and audit-content cron routes. Sequential commits only (parallel commits
 * occasionally drop in the Contents API — proven failure mode from the
 * pre-2026 translate-i18n implementation).
 */

const GH_API = 'https://api.github.com';

function ghHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

export interface GitHubEnv {
  token: string;
  repo: string;   // e.g. "Mooxergames/snake-online-v2"
  branch: string; // e.g. "main"
}

export function readGitHubEnv(): GitHubEnv | null {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) return null;
  return { token, repo, branch: process.env.GITHUB_BRANCH || 'main' };
}

/** Fetch the current SHA of a file, or undefined if it doesn't exist. */
export async function getFileSha(env: GitHubEnv, filePath: string): Promise<string | undefined> {
  try {
    const r = await fetch(`${GH_API}/repos/${env.repo}/contents/${filePath}?ref=${env.branch}`, {
      headers: ghHeaders(env.token),
    });
    if (!r.ok) return undefined;
    const j = await r.json() as { sha?: string };
    return j.sha;
  } catch {
    return undefined;
  }
}

/** Fetch a file's text content from GitHub. */
export async function getFileContent(env: GitHubEnv, filePath: string): Promise<string | null> {
  try {
    const r = await fetch(`${GH_API}/repos/${env.repo}/contents/${filePath}?ref=${env.branch}`, {
      headers: ghHeaders(env.token),
    });
    if (!r.ok) return null;
    const j = await r.json() as { content?: string; encoding?: string };
    if (!j.content || j.encoding !== 'base64') return null;
    return Buffer.from(j.content, 'base64').toString('utf8');
  } catch {
    return null;
  }
}

export async function commitFile(
  env: GitHubEnv,
  filePath: string,
  content: string,
  message: string,
): Promise<boolean> {
  const sha = await getFileSha(env, filePath);
  const r = await fetch(`${GH_API}/repos/${env.repo}/contents/${filePath}`, {
    method: 'PUT',
    headers: { ...ghHeaders(env.token), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      content: Buffer.from(content, 'utf8').toString('base64'),
      branch: env.branch,
      ...(sha ? { sha } : {}),
      committer: { name: 'Snake Online Bot', email: 'bot@snakeonline.io' },
    }),
  });
  if (!r.ok) {
    const body = await r.text();
    console.error(`GitHub commit failed (${r.status}) for ${filePath}: ${body.slice(0, 200)}`);
    return false;
  }
  return true;
}

/** List a directory's filenames (top-level only). */
export async function listDir(env: GitHubEnv, dirPath: string): Promise<string[]> {
  try {
    const r = await fetch(`${GH_API}/repos/${env.repo}/contents/${dirPath}?ref=${env.branch}`, {
      headers: ghHeaders(env.token),
    });
    if (!r.ok) return [];
    const j = await r.json() as Array<{ name: string; type: string }>;
    return j.filter(x => x.type === 'file').map(x => x.name);
  } catch {
    return [];
  }
}
