import git from 'isomorphic-git';
import FS from '@isomorphic-git/lightning-fs';
import http from 'isomorphic-git/http/web';

const fs = new FS('circuitmind_git');
const dir = '/repo';

class GitService {
  private initialized = false;

  async init() {
    if (this.initialized) return;
    
    try {
      await fs.promises.mkdir(dir);
    } catch (_e) {
      // Directory already exists, that's fine
    }

    try {
      await git.init({ fs, dir, defaultBranch: 'master' });
      
      // Ensure master branch exists by making a commit if repo is empty
      try {
        const branches = await git.listBranches({ fs, dir });
        if (branches.length === 0 || !branches.includes('master')) {
          // Create an initial commit to establish the branch
          await fs.promises.writeFile(`${dir}/README.md`, '# CircuitMind AI Project Repository\n');
          await git.add({ fs, dir, filepath: 'README.md' });
          await git.commit({
            fs,
            dir,
            message: 'Initial commit',
            author: { name: 'System', email: 'system@circuitmind.ai' }
          });
        }
      } catch (_err) {
        // If listBranches fails, it might be truly empty, try initial commit
        await fs.promises.writeFile(`${dir}/README.md`, '# CircuitMind AI Project Repository\n');
        await git.add({ fs, dir, filepath: 'README.md' });
        await git.commit({
          fs,
          dir,
          message: 'Initial commit',
          author: { name: 'System', email: 'system@circuitmind.ai' }
        });
      }

      this.initialized = true;
    } catch (e) {
      console.error('Failed to init git repo', e);
    }
  }

  async commit(message: string, author = { name: 'User', email: 'user@circuitmind.ai' }) {
    await this.init();
    
    try {
      await git.add({ fs, dir, filepath: '.' });
      const sha = await git.commit({
        fs,
        dir,
        message,
        author
      });
      return sha;
    } catch (e) {
      console.error('Commit failed', e);
      return null;
    }
  }

  async push(url: string) {
    await this.init();
    try {
      return await git.push({
        fs,
        http,
        dir,
        url,
        remote: 'peer',
        force: true
      });
    } catch (e) {
      console.error('Push failed', e);
      throw e;
    }
  }

  async pull(url: string) {
    await this.init();
    try {
      return await git.pull({
        fs,
        http,
        dir,
        url,
        remote: 'peer',
        author: { name: 'User', email: 'user@circuitmind.ai' }
      });
    } catch (e) {
      console.error('Pull failed', e);
      throw e;
    }
  }

  async writeFile(path: string, content: string) {
    await this.init();
    await fs.promises.writeFile(`${dir}/${path}`, content);
  }

  async readFile(path: string) {
    await this.init();
    return await fs.promises.readFile(`${dir}/${path}`, 'utf8');
  }

  async log() {
    try {
      await this.init();
      return await git.log({ fs, dir, depth: 50 });
    } catch (e) {
      console.warn('Git log failed, repository might be inconsistent:', e);
      return [];
    }
  }

  async branch(name: string) {
    await this.init();
    await git.branch({ fs, dir, ref: name });
  }

  async checkout(name: string) {
    await this.init();
    await git.checkout({ fs, dir, ref: name });
  }

  async listBranches() {
    await this.init();
    return await git.listBranches({ fs, dir });
  }

  async currentBranch() {
    await this.init();
    return await git.currentBranch({ fs, dir });
  }

  async getCommit(sha: string) {
    await this.init();
    const commit = await git.readCommit({ fs, dir, oid: sha });
    return commit;
  }
}

export const gitService = new GitService();
