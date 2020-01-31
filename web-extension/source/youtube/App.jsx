import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import RawDivider from '@material-ui/core/Divider';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import LinearProgress from '@material-ui/core/LinearProgress';
import NavigateNext from '@material-ui/icons/NavigateNext';
import NavigateBefore from '@material-ui/icons/NavigateBefore';

import Mark from './Mark';
import Notification from './Notification';
import { MarkSchema, RangedMarkSchema } from '../schema';
import * as actions from '../redux/actions';
import * as YT from './yt-helper';

const Divider = () => (<RawDivider style={{ marginTop: '15px', marginBottom: '15px' }} />);

const templateMark = {
  id: '~template~',
  tags: [],
  annotations: [],
};

function App({
  rangedMarks,
  rangelessMarks,
  createMark,
  fetchMarks,
  isLoading,
  isCreateMarkInProgress,
}) {
  useEffect(() => {
    YT.addVideoChangeListener(() => {
      console.log('YEP IT"S CHANGED');
      fetchMarks('youtube', YT.getVideoId());
    });
    fetchMarks('youtube', YT.getVideoId());
  }, []);

  if (isLoading) {
    return (<LinearProgress style={{ marginBottom: '10px' }} color="secondary" />);
  }

  const handleAddMark = offset => {
    let start; let end;
    if (offset < 0) {
      end = YT.getCurrentTime();
      start = Math.max(0, end + offset);
    } else {
      start = YT.getCurrentTime();
      end = Math.min(YT.getVideoDuration(), start + offset);
    }

    createMark({
      ...YT.getVideoData(),
      start,
      end,
    });
  };

  return (
    <>
      <Notification />
      <Grid container direction="column" spacing={2}>
        {!rangelessMarks.length && (
          <>
            <Mark mark={templateMark} noTimeRange />
            <Divider />
          </>
        )}
        {!!rangelessMarks.length && rangelessMarks.map(mark => (
          <React.Fragment key={mark.id}>
            <Mark mark={mark} noTimeRange />
            <Divider />
          </React.Fragment>
        ))}
        <div style={{ textAlign: 'center' }}>
          <ButtonGroup disabled={isCreateMarkInProgress} size="small" color="primary">
            <Button startIcon={<NavigateBefore />} onClick={() => handleAddMark(-600)}>10m</Button>
            <Button startIcon={<NavigateBefore />} onClick={() => handleAddMark(-300)}>5m</Button>
            <Button startIcon={<NavigateBefore />} onClick={() => handleAddMark(-60)}>1m</Button>
            <Button endIcon={<NavigateNext />} onClick={() => handleAddMark(60)}>1m</Button>
            <Button endIcon={<NavigateNext />} onClick={() => handleAddMark(300)}>5m</Button>
            <Button endIcon={<NavigateNext />} onClick={() => handleAddMark(600)}>10m</Button>
          </ButtonGroup>
        </div>
        <Divider />
        {rangedMarks.map(mark => (
          <React.Fragment key={mark.id}>
            <Mark mark={mark} />
            <Divider />
          </React.Fragment>
        ))}
      </Grid>
    </>
  );
}

App.propTypes = {
  rangedMarks: PropTypes.arrayOf(PropTypes.shape(MarkSchema)).isRequired,
  rangelessMarks: PropTypes.arrayOf(PropTypes.shape(RangedMarkSchema)).isRequired,
  createMark: PropTypes.func.isRequired,
  fetchMarks: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isCreateMarkInProgress: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  rangelessMarks: state.rangelessMarks,
  rangedMarks: state.rangedMarks,
  isCreateMarkInProgress: state.createMarkInProgress,
  isLoading: state.isLoading,
});

const mapDispatchToProps = {
  createMark: actions.createMark,
  fetchMarks: actions.fetchMarks,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
