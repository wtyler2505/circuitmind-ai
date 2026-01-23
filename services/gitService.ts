import git from 'isomorphic-git';
import FS from '@isomorphic-git/lightning-fs';

const fs = new FS('circuitmind_git');
const dir = '/repo';

class GitService {
  private initialized = false;

  async init() {
    if (this.initialized) return;
    
    try {
      await fs.promises.mkdir(dir);
    } catch (e) {
      // Directory already exists, that's fine
    }

    try {
      await git.init({ fs, dir });
      this.initialized = true;
      console.log('Git repo initialized in IndexedDB');
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

  async writeFile(path: string, content: string) {
    await this.init();
    await fs.promises.writeFile(`${dir}/${path}`, content);
  }

  async readFile(path: string) {
    await this.init();
    return await fs.promises.readFile(`${dir}/${path}`, 'utf8');
  }

  async log() {
    await this.init();
    return await git.log({ fs, dir, depth: 10 });
  }
}

export const gitService = new GitService();
