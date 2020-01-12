import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

import * as actions from '../redux/actions';

const Notification = ({
  open,
  message,
  severity,
  hideNotif,
}) => (
  <Snackbar open={open} onClose={hideNotif} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
    <MuiAlert elevation={6} variant="filled" onClose={hideNotif} severity={severity}>
      {message}
    </MuiAlert>
  </Snackbar>
);

Notification.propTypes = {
  open: PropTypes.bool.isRequired,
  message: PropTypes.string,
  severity: PropTypes.oneOf(['info', 'success', 'error', 'warning']),
  hideNotif: PropTypes.func.isRequired,
};

Notification.defaultProps = {
  message: '',
  severity: 'info',
};

const mapStateToProps = state => ({
  open: !!((state.notification || {}).show),
  message: (state.notification || {}).message,
  severity: (state.notification || {}).severity,
});

const mapDispatchToProps = {
  hideNotif: actions.hideNotif,
};

export default connect(mapStateToProps, mapDispatchToProps)(Notification);
