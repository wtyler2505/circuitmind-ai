import ThreeCodeWorker from './threeCodeRunner.worker?worker';

export const executeInWorker = (code: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const worker = new ThreeCodeWorker();
    
    // 5s execution timeout to prevent infinite loops freezing the app
    const timeout = setTimeout(() => {
        worker.terminate();
        reject(new Error('Execution timed out (5s limit). Infinite loop detected?'));
    }, 5000);

    worker.onmessage = (e) => {
        clearTimeout(timeout);
        if (e.data.success) {
            resolve(e.data.json);
        } else {
            reject(new Error(e.data.error || 'Worker execution failed'));
        }
        worker.terminate();
    };

    worker.onerror = (err) => {
        clearTimeout(timeout);
        reject(new Error('Worker error: ' + err.message));
        worker.terminate();
    };

    worker.postMessage({ code });
  });
};
