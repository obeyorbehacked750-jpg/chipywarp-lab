// Name: Requests
// Author: ChipyDev/Chipywarp
// Description: Fething to the internet usign extension
const RequestsLogo = "https://obeyorbehacked750-jpg.github.io/chipywarp-lab/assets/internet.svg";
(function(Scratch) {
  'use strict';

  class RequestsExtension {
    constructor() {
      this.method = 'GET';
      this.contentType = 'application/json';
      this.headers = {};
      this.body = '';

      this.responseText = '';
      this.responseDataUrl = '';
      this.status = 0;
      this.statusText = '';
      this.error = '';

      this.responded = false;
      this.failed = false;
      this.successed = false;

      this.fetchStatus = 0;
      this.fetchStatusText = '';
    }
    
    getInfo() {
      return {
        id: 'httpRequests',
        name: 'Requests',
        menuIconURI: RequestsLogo,
        blockIconURI: RequestsLogo,
        blocks: [
          {
            opcode: 'sendRequest',
            blockType: Scratch.BlockType.COMMAND,
            text: 'send request to [URL]',
            arguments: {
              URL: { type: Scratch.ArgumentType.STRING, defaultValue: 'https://api.github.com' }
            }
          },
          {
            opcode: 'setMethod',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set request method [METHOD]',
            arguments: {
              METHOD: { type: Scratch.ArgumentType.STRING, menu: 'methods', defaultValue: 'GET' }
            }
          },
          {
            opcode: 'setContentType',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set request content type to [TYPE]',
            arguments: {
              TYPE: { type: Scratch.ArgumentType.STRING, defaultValue: 'application/json' }
            }
          },
          {
            opcode: 'setTargetJson',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set [TARGET] json [JSON]',
            arguments: {
              TARGET: { type: Scratch.ArgumentType.STRING, menu: 'targets', defaultValue: 'header' },
              JSON: { type: Scratch.ArgumentType.STRING, defaultValue: '{"Authorization": "Bearer token"}' }
            }
          },
          {
            opcode: 'resetTarget',
            blockType: Scratch.BlockType.COMMAND,
            text: 'reset [TARGET]',
            arguments: {
              TARGET: { type: Scratch.ArgumentType.STRING, menu: 'targets', defaultValue: 'header' }
            }
          },
          '---',
          {
            opcode: 'getResponse',
            blockType: Scratch.BlockType.REPORTER,
            text: 'response',
            disableMonitor: false
          },
          {
            opcode: 'getResponseAs',
            blockType: Scratch.BlockType.REPORTER,
            text: 'response as [TYPE]',
            arguments: {
              TYPE: { type: Scratch.ArgumentType.STRING, menu: 'responseTypes', defaultValue: 'text' }
            }
          },
          {
            opcode: 'getStatus',
            blockType: Scratch.BlockType.REPORTER,
            text: 'status',
            disableMonitor: false
          },
          {
            opcode: 'getStatusText',
            blockType: Scratch.BlockType.REPORTER,
            text: 'status text',
            disableMonitor: false
          },
          {
            opcode: 'getError',
            blockType: Scratch.BlockType.REPORTER,
            text: 'error',
            disableMonitor: false
          },
          '---',
          {
            opcode: 'isResponded',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'get responded?'
          },
          {
            opcode: 'isFailed',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'request failed?'
          },
          {
            opcode: 'isSuccessed',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'request successed?'
          },
          '---',
          {
            opcode: 'fetchUtility',
            blockType: Scratch.BlockType.REPORTER,
            text: 'fetch [URL]',
            arguments: {
              URL: { type: Scratch.ArgumentType.STRING, defaultValue: 'https://api.github.com' }
            }
          },
          {
            opcode: 'getFetchStatus',
            blockType: Scratch.BlockType.REPORTER,
            text: 'fetching status',
            disableMonitor: false
          },
          {
            opcode: 'getFetchStatusText',
            blockType: Scratch.BlockType.REPORTER,
            text: 'fetching status text',
            disableMonitor: false
          }
        ],
        menus: {
          methods: {
            acceptReporters: true,
            items: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD']
          },
          targets: {
            acceptReporters: false,
            items: ['header', 'body']
          },
          responseTypes: {
            acceptReporters: false,
            items: ['text', 'dataUrl']
          }
        }
      };
    }

    sendRequest(args) {
      // Reset state for the new request
      this.responded = false;
      this.failed = false;
      this.successed = false;
      this.responseText = '';
      this.responseDataUrl = '';
      this.error = '';
      this.status = 0;
      this.statusText = '';

      const options = {
        method: this.method,
        headers: { ...this.headers }
      };

      if (this.contentType) {
        options.headers['Content-Type'] = this.contentType;
      }

      // GET and HEAD requests cannot have bodies
      if (this.method !== 'GET' && this.method !== 'HEAD' && this.body) {
        options.body = this.body;
      }

      // Run asynchronously without blocking Scratch execution
      fetch(args.URL, options)
        .then(res => {
          this.status = res.status;
          this.statusText = res.statusText;
          if (res.ok) {
            this.successed = true;
          } else {
            this.failed = true;
          }
          return res.blob();
        })
        .then(blob => {
          // Process text
          const textPromise = blob.text().then(text => { 
            this.responseText = text; 
          });
          
          // Process DataURL (Base64)
          const dataUrlPromise = new Promise(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => {
              this.responseDataUrl = reader.result;
              resolve();
            };
            reader.readAsDataURL(blob);
          });
          
          return Promise.all([textPromise, dataUrlPromise]);
        })
        .then(() => {
          this.responded = true;
        })
        .catch(err => {
          this.error = String(err);
          this.failed = true;
          this.responded = true;
        });
    }

    setMethod(args) {
      this.method = args.METHOD;
    }

    setContentType(args) {
      this.contentType = args.TYPE;
    }

    setTargetJson(args) {
      if (args.TARGET === 'header') {
        try {
          this.headers = JSON.parse(args.JSON);
        } catch (e) {
          console.warn('Invalid JSON applied to headers', e);
        }
      } else {
        this.body = args.JSON; // Raw string body
      }
    }

    resetTarget(args) {
      if (args.TARGET === 'header') {
        this.headers = {};
      } else {
        this.body = '';
      }
    }

    // Response Reporters
    getResponse() {
      return this.responseText;
    }

    getResponseAs(args) {
      if (args.TYPE === 'dataUrl') return this.responseDataUrl;
      return this.responseText;
    }

    getStatus() {
      return this.status;
    }

    getStatusText() {
      return this.statusText;
    }

    getError() {
      return this.error;
    }

    // Response Booleans
    isResponded() {
      return this.responded;
    }

    isFailed() {
      return this.failed;
    }

    isSuccessed() {
      return this.successed;
    }

    // Utilities
    fetchUtility(args) {
      // This reporter returns a Promise, so the Scratch block will wait for it to finish before continuing
      return fetch(args.URL)
        .then(res => {
          this.fetchStatus = res.status;
          this.fetchStatusText = res.statusText;
          return res.text();
        })
        .catch(err => {
          this.fetchStatus = 0;
          this.fetchStatusText = String(err);
          return '';
        });
    }

    getFetchStatus() {
      return this.fetchStatus;
    }

    getFetchStatusText() {
      return this.fetchStatusText;
    }
  }

  Scratch.extensions.register(new RequestsExtension());
})(Scratch);
