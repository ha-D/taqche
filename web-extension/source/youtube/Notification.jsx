import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

import { connect } from "react-redux";
import { hideNotif } from '../redux/actions';

const Notification = ({open, message, severity, hideNotif}) => (
  <Snackbar open={open} onClose={hideNotif} anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}>
    <MuiAlert elevation={6} variant="filled" onClose={hideNotif} severity={severity}>
      {message}
    </MuiAlert>
  </Snackbar>
);

const mapStateToProps = state => {
  return {
    open: !!((state.notification || {}).show),
    message: (state.notification || {}).message,
    severity: (state.notification || {}).severity
  };
};

const mapDispatchToProps = {
  hideNotif
};
  
export default connect(mapStateToProps, mapDispatchToProps)(Notification);