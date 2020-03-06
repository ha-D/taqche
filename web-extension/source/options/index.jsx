import React from 'react';
import ReactDOM from 'react-dom';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Alert from '@material-ui/lab/Alert';

import * as es from './es';

const PHASE_INPUT = 0;
const PHASE_CHECKING = 1;
const PHASE_EXISTS = 2;
const PHASE_DOESNT_EXIST = 3;
const PHASE_ERROR = 4;
const PHASE_CREATING = 5;
const PHASE_DONE = 6;

const App = props => {
  const [esUrl, setESUrl] = React.useState(localStorage.getItem('es_url') || '');
  const [esUser, setESUser] = React.useState(localStorage.getItem('es_user') || '');
  const [esPassword, setESPassword] = React.useState(localStorage.getItem('es_password') || '');
  const [phase, _setPhase] = React.useState(PHASE_INPUT);
  const [status, setStatus] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  const getESOptions = () => ({ url: esUrl, user: esUser, password: esPassword });

  const onError = err => {
    console.error(err);
    _setPhase(PHASE_ERROR);
    if (err.message === 'Network Error') {
      setStatus('Unable to connect to ElasticSearch instance');
    } else {
      setStatus(err.message);
    }
  };

  const onPhaseChecking = nextPhase => {
    if (!esUrl) {
      nextPhase(PHASE_INPUT);
      return;
    }
    setStatus('Checking ElasticSearch connection...');
    es.checkIndex(getESOptions())
      .then(exists => (exists ? nextPhase(PHASE_DONE) : nextPhase(PHASE_DOESNT_EXIST)))
      .catch(onError);
  };

  const onPhaseDone = () => {
    localStorage.setItem('es_url', esUrl);
    localStorage.setItem('es_user', esUser);
    localStorage.setItem('es_password', esPassword);
  };

  const onPhaseCreating = nextPhase => {
    setStatus('Creating index...');
    es.createIndex(getESOptions())
      .then(() => {
        setStatus('Applying index settings...');
        return es.applySettings(getESOptions());
      })
      .then(() => {
        setStatus('Applying index mappings...');
        return es.applyMappings(getESOptions());
      })
      .then(() => nextPhase(PHASE_DONE))
      .catch(onError);
  };

  const setPhase = newPhase => {
    _setPhase(newPhase);
    ({
      [PHASE_CHECKING]: onPhaseChecking,
      [PHASE_DONE]: onPhaseDone,
      [PHASE_CREATING]: onPhaseCreating,
    }[newPhase] || (() => {}))(setPhase);
  };

  const renderInfoPhase = () => <Alert severity="info">{status}</Alert>;
  const renderPhaseDoesntExist = () => (
    <Alert
      severity="warning"
      action={
      (
        <>
          <Button color="inherit" size="small" onClick={() => setPhase(PHASE_CREATING)}>YES</Button>
          <Button color="inherit" size="small" onClick={() => setPhase(PHASE_INPUT)}>NO</Button>
        </>
      )
    }
    >
      Index does not exist, create index?
    </Alert>
  );
  const renderPhaseError = () => <Alert severity="error">{status}</Alert>;
  const renderPhaseDone = () => <Alert severity="success">Settings saved</Alert>;
  const renderStatus = () => {
    const phaseField = ({
      [PHASE_CHECKING]: renderInfoPhase,
      [PHASE_DOESNT_EXIST]: renderPhaseDoesntExist,
      [PHASE_CREATING]: renderInfoPhase,
      [PHASE_ERROR]: renderPhaseError,
      [PHASE_DONE]: renderPhaseDone,
    }[phase] || (() => {}))();
    return (<Grid item style={{ marginTop: '10px' }}>{phaseField}</Grid>);
  };

  const isDisabled = () => phase !== PHASE_INPUT && phase !== PHASE_ERROR && phase !== PHASE_DONE;
  return (
    <div style={{ padding: '10px' }}>
      <Grid container direction="column">
        <Grid item>
          <TextField
            error={submitted && esUrl === ''}
            value={esUrl}
            onChange={e => setESUrl(e.target.value)}
            size="small"
            label="Elastic Search Index URL"
            fullWidth
            disabled={isDisabled()}
          />
        </Grid>
        <Grid item style={{ marginTop: '10px' }}>
          <TextField
            value={esUser}
            onChange={e => setESUser(e.target.value)}
            size="small"
            label="ES Username"
            disabled={isDisabled()}
          />
          <TextField
            style={{ marginLeft: '20px' }}
            value={esPassword}
            onChange={e => setESPassword(e.target.value)}
            size="small"
            label="ES Password"
            disabled={isDisabled()}
          />
        </Grid>
        {renderStatus()}
        <Grid item style={{ marginTop: '15px' }}>
          <Button onClick={() => { setSubmitted(true); setPhase(PHASE_CHECKING); }} disabled={isDisabled()} fullWidth>Save</Button>
        </Grid>
      </Grid>

    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('app'));
