import React from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Chip from '@material-ui/core/Chip';
import TextField from '@material-ui/core/TextField';

import { connect } from "react-redux";
import { createMark, updateMarkRange, addTag, addAnnotation, deleteTag, deleteAnnotation, publishNotif } from '../redux/actions';
import * as YT from './yt-helper';

const tagContainerStyles = makeStyles(theme => ({
  root: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'left',
    flexWrap: 'wrap',
    '& > *': {
      margin: theme.spacing(0.5),
    },
  },
}));


const CustomSlider = withStyles({
  root: {
    color: '#999',
    height: 4,
  },
  thumb: {
    height: 12,
    width: 12,
    marginTop: -4,
    marginLeft: -12,
    '&:focus,&:hover,&$active': {
      boxShadow: 'inherit',
    },
  },
  track: {
    height: 4,
    borderRadius: 2
  },
  rail: {
    height: 4,
    borderRadius: 2
  },
})(Slider);


function timeFormat(value) {
  value = Math.floor(value);
  return ("0" + (Math.floor(value / 60))).slice(-2) + ":" + ("0" + (value % 60)).slice(-2);
}
  
function Mark({
    mark, disableTime, updateMarkRange, addTag, addAnnotation, 
    deleteTag, deleteAnnotation, publishNotif, createMark
}) {
  const [range, setNewRange] = React.useState([mark.start, mark.end]);
  const [tag, setTag] = React.useState('');
  const [annotation, setAnnotation] = React.useState('');
  const [tagEnabled, setTagEnabled] = React.useState(true);
  const [annotationEnabled, setAnnotationEnabled] = React.useState(true);
  const [deletedTags, setDeletedTags] = React.useState([]);
  const [deletedAnnotations, setDeletedAnnotations] = React.useState([]);
  const tagContainerClasses = tagContainerStyles();

  const isTemplateMark = () => mark.id === '~template~';

  const handleAddTag = () => {
    if (isTemplateMark()) {
        createMark({
        ...YT.getVideoData(),
        tags: [tag],
        annotations: []
      });
    } else {
      if (mark.tags.indexOf(tag) !== -1) {
        publishNotif('error', 'Tag already exists');
        return;
      }

      setTagEnabled(false);
      addTag(mark.id, tag)
      .then(success => {
          if (success) {
            setTag('');
          }
          setTagEnabled(true);
        });
    }
  }

  const handleDeleteTag = (tag) => {
    setDeletedTags(deletedTags.concat([tag]));
    deleteTag(mark.id, tag)
    .then(success => {
      setDeletedTags(deletedTags.splice(deletedTags.indexOf(tag)));
    });
  }

  const handleAddAnnotation = () => {
    if (isTemplateMark()) {
      createMark({
        ...YT.getVideoData(),
        tags: [],
        annotations: [annotation]
      });
    } else {
      if (mark.annotations.indexOf(annotation) !== -1) {
        publishNotif('error', 'Annotation already exists');
        return;
      }

      setAnnotationEnabled(false);
      addAnnotation(mark.id, annotation)
      .then(success => {
        if (success) {
          setAnnotation('');
        }
        setAnnotationEnabled(true);
      });
    }
  }

  const handleDeleteAnnotation = (annotation) => {
    setDeletedAnnotations(deletedAnnotations.concat([annotation]));
    deleteAnnotation(mark.id, annotation)
    .then(success => {
      setDeletedAnnotations(deletedAnnotations.splice(deletedAnnotations.indexOf(annotation)));
    });
  }

  return (
    <Grid container item direction="column">
      { !disableTime && (
        <Grid container item direction="row">
          <Grid item container xs={4}>
            <ButtonGroup size="medium">
              <Button onClick={() => YT.setCurrentTime(range[0])}>{timeFormat(range[0])}</Button>
              <Button onClick={() => YT.setCurrentTime(range[1])}>{timeFormat(range[1])}</Button>
            </ButtonGroup>
          </Grid>
          <Grid item container xs={8}>
            <CustomSlider
                value={range}
                onChange={(e, range) => setNewRange(range)}
                onChangeCommitted={(e, range) => updateMarkRange(mark.id, range[0], range[1])}
                valueLabelDisplay="off"
                min={0}
                max={YT.getVideoDuration()}
                valueLabelFormat={timeFormat}
            />
          </Grid>
        </Grid>
      )}
      <div className={tagContainerClasses.root}>
        {(mark.tags || []).map(tag => (
          <Chip size="small" color="primary"
              disabled={deletedTags.indexOf(tag) >= 0}
              key={tag}            
              label={tag}
              onDelete={() => handleDeleteTag(tag)}
          />
        ))}
        {(mark.annotations || []).map(annotation => (
          <Chip size="small" color="secondary"
              disabled={deletedAnnotations.indexOf(annotation) >= 0}
              key={annotation}
              label={annotation}
              onDelete={() => handleDeleteAnnotation(annotation)}
          />
        ))}
      </div>
      <Grid container item direction="row" spacing={1}>
        <Grid item container xs={3}>
          <TextField 
            value={tag}
            onChange={e => setTag(e.target.value)}
            onKeyDown={(e) => e.keyCode === 13 && handleAddTag()} 
            disabled={!tagEnabled}
            size="small" label="Tag" fullWidth color="primary"
            />
        </Grid>
        <Grid item container xs={8}>
          <TextField
            value={annotation}
            onChange={e => setAnnotation(e.target.value)}
            onKeyDown={(e) => e.keyCode === 13 && handleAddAnnotation()}
            disabled={!annotationEnabled}
            size="small" label="Annotation" fullWidth color="secondary"
          />
        </Grid>
      </Grid>
    </Grid>
  );
}

const mapDispatchToProps = {
  addTag,
  addAnnotation,
  deleteTag,
  deleteAnnotation,
  updateMarkRange,
  publishNotif,
  createMark
};

export default connect(null, mapDispatchToProps)(Mark);