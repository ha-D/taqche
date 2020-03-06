import axios from 'axios';

const INDEX_SETTINGS = {
  analysis: {
    char_filter: {
      replace: {
        type: 'mapping',
        mappings: [
          '&=> and ',
        ],
      },
    },
    filter: {
      word_delimiter: {
        type: 'word_delimiter',
        split_on_numerics: false,
        split_on_case_change: true,
        generate_word_parts: true,
        generate_number_parts: true,
        catenate_all: true,
        preserve_original: true,
        catenate_numbers: true,
      },
    },
    analyzer: {
      default: {
        type: 'custom',
        char_filter: [
          'html_strip',
          'replace',
        ],
        tokenizer: 'whitespace',
        filter: [
          'lowercase',
          'word_delimiter',
        ],
      },
    },
  },
};

const MAPPING = {
  properties: {
    title: {
      type: 'text',
    },
    date: {
      type: 'date',
    },
    source_id: {
      type: 'keyword',
    },
    platform: {
      type: 'keyword',
    },
    tags: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword',
        },
      },
    },
    annotations: {
      type: 'text',
    },
    channel: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword',
        },
      },
    },
  },
};

function makeRequest({ url, user, password }, method, path, data) {
  const fixedUrl = url.endsWith('/') ? url.substring(0, url.length - 1) : url;
  const auth = user ? { username: user, password } : undefined;
  return axios({
    method,
    url: fixedUrl + (path || ''),
    data,
    auth,
  });
}

export function checkIndex(esOptions) {
  return makeRequest(esOptions, 'get')
    .then(response => {
      if (response.data.cluster_uuid) {
        throw new Error('Please provide url to ElasticSearch index, not just the ElasticSearch cluster');
      }
      return true;
    })
    .catch(error => {
      if (error.response && error.response.status === 404) {
        return false;
      }
      throw error;
    });
}

export function createIndex(esOptions) {
  return makeRequest(esOptions, 'put', '');
}

export function applySettings(esOptions) {
  return makeRequest(esOptions, 'post', '/_close')
    .then(() => makeRequest(esOptions, 'put', '/_settings', INDEX_SETTINGS))
    .then(() => makeRequest(esOptions, 'post', '/_open'));
}

export function applyMappings(esOptions) {
  return makeRequest(esOptions, 'put', '/_mapping', MAPPING);
}
