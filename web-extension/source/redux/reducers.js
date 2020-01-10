import {
  SHOW_NOTIF, 
  HIDE_NOTIF,
  FETCH_MARKS,
  RECEIVE_MARK,
  ADD_MARK
} from './actions'

function replaceOrAddMark(list, mark) {
  const newList = list.slice();
  for (let i = 0; i < newList.length; i++) {
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
  notification: {show: false, message: '', severity: 'info'},
  createMarkInProgress: false, 
  rangelessMarks: [],
  rangedMarks: []
}, action) {
  switch(action.type) {
    case SHOW_NOTIF:
      return Object.assign({}, state, { notification: {...action.payload, show: true}});
    case HIDE_NOTIF:
      return Object.assign({}, state, { notification: {...(state.notification || {}), show: false}});
    case FETCH_MARKS:
      if (action.status == null) {
        return Object.assign({}, state, { isLoading: true });
      } else if (action.status === 'success') {
        return Object.assign({}, state, { 
          isLoading: false,
          rangelessMarks: action.payload.filter(m => m.start == null),
          rangedMarks: action.payload.filter(m => m.start != null)
        }); 
      } else if (action.status === 'fail') {
        return Object.assign({}, state, { isLoading: false }); 
      }
    case RECEIVE_MARK:
      if (action.payload.start == null) {
        return Object.assign({}, state, { rangelessMarks: replaceOrAddMark(state.rangelessMarks, action.payload)});
      } else {
        return Object.assign({}, state, { rangedMarks: replaceOrAddMark(state.rangedMarks, action.payload)});
      }
  }
  return state;
}

