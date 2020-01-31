import api from '../api';

export const SHOW_NOTIF = 'show_notif';
const showNotif = (severity, message) => ({
  type: SHOW_NOTIF,
  payload: { severity, message },
});

export const HIDE_NOTIF = 'hide_notif';
export const hideNotif = () => ({
  type: HIDE_NOTIF,
});

export const publishNotif = (severity, message) => dispatch => {
  dispatch(showNotif(severity, message));
  setTimeout(() => dispatch(hideNotif()), 4000);
};

export const FETCH_MARKS = 'fetch_marks';

const _fetchMarks = (status, marks) => ({
  type: FETCH_MARKS,
  payload: marks,
  status,
});

export const fetchMarks = (platform, sourceId) => dispatch => {
  dispatch(_fetchMarks(null));
  api.fetchMarks(platform, sourceId)
    .then(results => {
      dispatch(_fetchMarks('success', results));
    })
    .catch(e => {
      dispatch(_fetchMarks('fail'));
      dispatch(publishNotif('error', `Fetching marks failed: ${e.message}`));
    });
};

export const RECEIVE_MARK = 'receive_mark';

export const receiveMark = markData => ({
  type: RECEIVE_MARK,
  payload: markData,
});

export const CREATE_MARK = 'create_mark';

const _createMark = (status, mark) => ({
  type: CREATE_MARK,
  payload: { mark },
  status,
});

export const createMark = mark => dispatch => {
  dispatch(_createMark(null, mark));
  return api.createMark(mark)
    .then(resp => {
      dispatch(receiveMark(resp));
      dispatch(_createMark('success', resp));
      return true;
    })
    .catch(e => {
      dispatch(_createMark('fail', mark));
      dispatch(publishNotif('error', `Creating mark failed: ${e.message}`));
      return false;
    });
};

export const UPDATE_MARK_RANGE = 'update_mark_range';

const _updateMarkRange = (status, markId, start, end) => ({
  type: UPDATE_MARK_RANGE,
  payload: { markId, start, end },
  status,
});

export const updateMarkRange = (markId, start, end) => dispatch => {
  dispatch(_updateMarkRange(null, markId, start, end));
  api.updateMarkRange(markId, start, end)
    .then(resp => {
      dispatch(receiveMark(resp));
      dispatch(_updateMarkRange('success', markId));
      return true;
    }).catch(e => {
      dispatch(_updateMarkRange('fail', markId));
      dispatch(publishNotif('error', `Updating mark failed: ${e.message}`));
      return false;
    });
};

export const ADD_TAG = 'add_tag';

const _addTag = (status, markId, tag) => ({
  type: ADD_TAG,
  payload: { markId, tag },
  status,
});

export const addTag = (markId, tag) => dispatch => {
  dispatch(_addTag(null, markId, tag));
  return api.addTag(markId, tag)
    .then(resp => {
      dispatch(receiveMark(resp));
      dispatch(_addTag('success', markId, tag));
      return true;
    }).catch(e => {
      dispatch(_addTag('fail', markId, tag));
      dispatch(publishNotif('error', `Adding tag failed: ${e.message}`));
      return false;
    });
};

export const ADD_LABEL = 'add_annotation';

const _addAnnotation = (status, markId, annotation) => ({
  type: ADD_LABEL,
  payload: { markId, annotation },
  status,
});

export const addAnnotation = (markId, annotation) => dispatch => {
  dispatch(_addAnnotation(null, markId, annotation));
  return api.addAnnotation(markId, annotation)
    .then(resp => {
      dispatch(receiveMark(resp));
      dispatch(_addAnnotation('success', markId, annotation));
      return true;
    }).catch(e => {
      dispatch(_addAnnotation('fail', markId, annotation));
      dispatch(publishNotif('error', `Adding annotation failed: ${e.message}`));
      return false;
    });
};

export const DELETE_TAG = 'delete_tag';

const _deleteTag = (status, markId, tag) => ({
  type: DELETE_TAG,
  payload: { markId, tag },
  status,
});

export const deleteTag = (markId, tag) => dispatch => {
  dispatch(_deleteTag(null, markId, tag));
  return api.deleteTag(markId, tag)
    .then(resp => {
      dispatch(receiveMark(resp));
      dispatch(_deleteTag('success', markId, tag));
      return true;
    }).catch(e => {
      dispatch(_deleteTag('fail', markId, tag));
      dispatch(publishNotif('error', `Deleting tag failed: ${e.message}`));
      return false;
    });
};

export const DELETE_LABEL = 'delete_annotation';

const _deleteAnnotation = (status, markId, annotation) => ({
  type: DELETE_LABEL,
  payload: { markId, annotation },
  status,
});

export const deleteAnnotation = (markId, annotation) => dispatch => {
  dispatch(_deleteAnnotation(null, markId, annotation));
  return api.deleteAnnotation(markId, annotation)
    .then(resp => {
      dispatch(receiveMark(resp));
      dispatch(_deleteAnnotation('success', markId, annotation));
      return true;
    }).catch(e => {
      dispatch(_deleteAnnotation('fail', markId, annotation));
      dispatch(publishNotif('error', `Adding annotation failed: ${e.message}`));
      return false;
    });
};
