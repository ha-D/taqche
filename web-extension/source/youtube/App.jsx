import React, { useEffect } from 'react';
import { connect } from "react-redux";
import Mark from './Mark';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import RawDivider from '@material-ui/core/Divider';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import LinearProgress from '@material-ui/core/LinearProgress';
import NavigateNext from '@material-ui/icons/NavigateNext';
import NavigateBefore from '@material-ui/icons/NavigateBefore';

import Notification from './Notification';
import { fetchMarks, createMark } from '../redux/actions';
import * as YT from './yt-helper';

const Divider = () => (<RawDivider style={{marginTop: '15px', marginBottom: '15px'}} />)

const templateMark = {
  id: '~template~',
  tags: [],
  labels: []
}

function App({rangedMarks, rangelessMarks, createMark, 
  fetchMarks, isLoading, isCreateMarkInProgress}) {

  useEffect(() => {
    fetchMarks('youtube', YT.getVideoId());  
  }, []);

  if (isLoading) {
    return (<LinearProgress style={{marginBottom: '10px'}}/>)
  }

  const createMarkWithOffset = offset => {
    let start, end;
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
      end
    });
  }
  
  return (
    <React.Fragment>
      <Notification/>
      <Grid container direction="column" spacing={2}>
        {!rangelessMarks.length && (
          <React.Fragment>
            <Mark mark={templateMark} disableTime={true}/> 
            <Divider/>
          </React.Fragment>
        )}
        {!!rangelessMarks.length && rangelessMarks.map(mark => (
          <React.Fragment key={mark.id}>
            <Mark mark={mark} disableTime={true}/>
            <Divider/>
          </React.Fragment>
        ))}
        <div style={{textAlign: 'center'}}>
          <ButtonGroup disabled={isCreateMarkInProgress} size="small" color="primary">
            <Button startIcon={<NavigateBefore />} onClick={() => createMarkWithOffset(-600)}>10m</Button>
            <Button startIcon={<NavigateBefore />} onClick={() => createMarkWithOffset(-300)}>5m</Button>
            <Button startIcon={<NavigateBefore />} onClick={() => createMarkWithOffset(-60)}>1m</Button>
            <Button endIcon={<NavigateNext />} onClick={() => createMarkWithOffset(60)}>1m</Button>
            <Button endIcon={<NavigateNext />} onClick={() => createMarkWithOffset(300)}>5m</Button>
            <Button endIcon={<NavigateNext />} onClick={() => createMarkWithOffset(600)}>10m</Button>
          </ButtonGroup>
        </div>
        <Divider/>
        {rangedMarks.map(mark => (
          <React.Fragment key={mark.id}>
            <Mark mark={mark}/>
            <Divider/>
          </React.Fragment>
        ))}
      </Grid>
    </React.Fragment>
  )
}

const mapStateToProps = state => {
  return {
    rangelessMarks: state.rangelessMarks,
    rangedMarks: state.rangedMarks,
    isCreateMarkInProgress: state.createMarkInProgress,
    isLoading: state.isLoading
  };
};

const mapDispatchToProps = {
  createMark,
  fetchMarks
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
