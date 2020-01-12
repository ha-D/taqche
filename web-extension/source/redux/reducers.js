import {
  SHOW_NOTIF,
  HIDE_NOTIF,
  FETCH_MARKS,
  RECEIVE_MARK,
} from './actions';

function replaceOrAddMark(list, mark) {
  const newList = list.slice();
  for (let i = 0; i < newList.length; i += 1) {
    if (newList[i].id === mark.id) {
      newList[i] = mark;
      return newList;
    }
  }
  newList.unshift(mark);
  return newList;
}

export default function rootReducer(state = {
  isLoading: false,
  notification: { show: false, message: '', severity: 'info' },
  createMarkInProgress: false,
  rangelessMarks: [],
  rangedMarks: [],
}, action) {
  switch (action.type) {
    case SHOW_NOTIF:
      return { ...state, notification: { ...action.payload, show: true } };
    case HIDE_NOTIF:
      return { ...state, notification: { ...(state.notification || {}), show: false } };
    case FETCH_MARKS:
      if (action.status == null) {
        return { ...state, isLoading: true };
      } else if (action.status === 'success') {
        return {
          ...state,
          isLoading: false,
          rangelessMarks: action.payload.filter(m => m.start == null),
          rangedMarks: action.payload.filter(m => m.start != null),
        };
      } else if (action.status === 'fail') {
        return { ...state, isLoading: false };
      }
      break;
    case RECEIVE_MARK:
      if (action.payload.start == null) {
        return { ...state, rangelessMarks: replaceOrAddMark(state.rangelessMarks, action.payload) };
      } else {
        return { ...state, rangedMarks: replaceOrAddMark(state.rangedMarks, action.payload) };
      }
    default:
  }
  return state;
}
