import axios from 'axios';


function makeId(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

class API {
  constructor() {
    this.axios = axios.create({
      baseURL: 'http://localhost:9200',
      timeout: 10000,
    });
  }

  createMark(mark) {
    const markId = makeId(11);
    const markWithId = { ...mark, id: markId };
    return this.axios.put(`marks/_doc/${markId}`, markWithId)
      .then(resp => {
        if (resp.status === 201) {
          return markWithId;
        }
        throw new Error(
          `Creating mark failed with status ${resp.status}`,
        );
      });
  }

  fetchMarks(platform, sourceId) {
    const query = {
      query: {
        bool: {
          must: [
            { match: { source_id: sourceId } },
            { match: { platform } },
          ],
        },
      },
    };
    return this.axios.get('/marks/_search', {
      params: {
        source_content_type: 'application/json',
        source: JSON.stringify(query),
      },
    }).then(resp => resp.data.hits.hits)
      .then(results => results.map(item => item._source))
      .then(results => results.map(item => ({
        ...item,
        tags: item.tags || [],
        annotations: item.annotations || [],
      })));
  }

  getMark(markId) {
    return this.axios.get(`/marks/_doc/${markId}`)
      .then(resp => resp.data._source);
  }

  updateMarkRange(markId, start, end) {
    return this.axios.post(`marks/_update/${markId}`, {
      doc: { start, end },
    })
      .then(() => this.getMark(markId));
  }

  addTag(markId, tag) {
    const script = {
      script: {
        source: 'if (ctx._source.tags == null) ctx._source.tags = []; ctx._source.tags.add(params.tag)',
        lang: 'painless',
        params: { tag },
      },
    };

    return this.axios.post(`marks/_update/${markId}`, script)
      .then(() => this.getMark(markId));
  }

  addAnnotation(markId, annotation) {
    const script = {
      script: {
        source: 'if (ctx._source.annotations == null) ctx._source.annotations = []; ctx._source.annotations.add(params.annotation)',
        lang: 'painless',
        params: { annotation },
      },
    };

    return this.axios.post(`marks/_update/${markId}`, script)
      .then(() => this.getMark(markId));
  }

  deleteTag(markId, tag) {
    const script = {
      script: {
        source: 'if (ctx._source.tags != null && ctx._source.tags.contains(params.tag)) { ctx._source.tags.remove(ctx._source.tags.indexOf(params.tag)) }',
        lang: 'painless',
        params: { tag },
      },
    };

    return this.axios.post(`marks/_update/${markId}`, script)
      .then(() => this.getMark(markId));
  }

  deleteAnnotation(markId, annotation) {
    const script = {
      script: {
        source: 'if (ctx._source.annotations != null && ctx._source.annotations.contains(params.annotation)) { ctx._source.annotations.remove(ctx._source.annotations.indexOf(params.annotation)) }',
        lang: 'painless',
        params: { annotation },
      },
    };

    return this.axios.post(`marks/_update/${markId}`, script)
      .then(() => this.getMark(markId));
  }
}

export default new API();
