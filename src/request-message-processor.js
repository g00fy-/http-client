import {HttpResponseMessage} from './http-response-message';

export class RequestMessageProcessor {
  constructor(xhrType, transformers){
    this.XHRType = xhrType;
    this.transformers = transformers;
  }

  abort(){
    this.xhr.abort();
  }

  process(client, message){
    return new Promise((resolve, reject) => {
      var xhr = this.xhr = new this.XHRType(),
          transformers = this.transformers,
          i, ii;

      for(i = 0, ii = transformers.length; i < ii; ++i){
        transformers[i](client, this, message, xhr);
      }

      xhr.open(message.method, message.fullUri || message.uri, true);

      xhr.onload = (e) => {
        var response = new HttpResponseMessage(message, xhr, message.responseType, message.reviver);
        if(response.isSuccess){
          resolve(response);
        }else{
          reject(response);
        }
      };

      xhr.ontimeout = (e) => {
        reject(new HttpResponseMessage(message, {
          response:e,
          status:xhr.status,
          statusText:xhr.statusText
        }, 'timeout'));
      };

      xhr.onerror = (e) => {
        reject(new HttpResponseMessage(message, {
          response:e,
          status:xhr.status,
          statusText:xhr.statusText
        }, 'error'));
      };

      xhr.onabort = (e) => {
        reject(new HttpResponseMessage(message, {
          response:e,
          status:xhr.status,
          statusText:xhr.statusText
        }, 'abort'));
      };

      xhr.send(message.content);
    });
  }
}