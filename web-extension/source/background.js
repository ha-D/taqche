import axios from 'axios';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const dataKey = request.method === 'get' ? 'params' : 'data';
  let baseUrl = localStorage.getItem('es_url');
  const user = localStorage.getItem('es_user');
  const password = localStorage.getItem('es_password');

  if (!baseUrl) {
    sendResponse([null, { message: 'ElasticSearch settings have not been set in extension options' }]);
    return true;
  }

  baseUrl = baseUrl.endsWith('/') ? baseUrl.substring(0, baseUrl.length - 1) : baseUrl;
  const path = request.path.startsWith('/') ? request.path.substring(1) : request.path;
  const auth = user ? { username: user, password } : undefined;

  axios({
    method: request.method,
    url: `${baseUrl}/${path}`,
    [dataKey]: request.data,
    auth,
    timeout: 10000,
  }).then(response => {
    sendResponse([{
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    }, null]);
  }, error => {
    sendResponse([null, { message: error.message }]);
  });
  return true;
});


chrome.browserAction.onClicked.addListener(() => {
  chrome.tabs.create({ url: 'search/index.html' });
});