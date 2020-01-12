import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Chip from '@material-ui/core/Chip';
import TextField from '@material-ui/core/TextField';

import { MarkSchema } from '../schema';
import * as actions from '../redux/actions';
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
    borderRadius: 2,
  },
  rail: {
    height: 4,
    borderRadius: 2,
  },
})(Slider);


function timeFormat(value) {
  const minutes = `0${Math.floor(Math.floor(value) / 60)}`.slice(-2);
  const seconds = `0${Math.floor(value) % 60}`.slice(-2);
  return `${minutes}:${seconds}`;
}

function Mark({
  mark,
  noTimeRange,
  createMark,
  updateMarkRange,
  addTag,
  deleteTag,
  addAnnotation,
  deleteAnnotation,
  publishNotif,
}) {
  const [timeRange, setTimeRange] = React.useState([mark.start, mark.end]);
  const [tagInput, setTagInput] = React.useState('');
  const [annotationInput, setAnnotationInput] = React.useState('');
  const [tagInputEnabled, setTagInputEnabled] = React.useState(true);
  const [annotationInputEnabled, setAnnotationInputEnabled] = React.useState(true);
  const [deletedTags, setDeletedTags] = React.useState([]);
  const [deletedAnnotations, setDeletedAnnotations] = React.useState([]);
  const tagContainerClasses = tagContainerStyles();

  const isTemplateMark = () => mark.id === '~template~';

  const handleAddTag = () => {
    if (isTemplateMark()) {
      createMark({
        ...YT.getVideoData(),
        tags: [tagInput],
        annotations: [],
      });
    } else {
      if (mark.tags.indexOf(tagInput) !== -1) {
        publishNotif('error', 'Tag already exists');
        return;
      }

      setTagInputEnabled(false);
      addTag(mark.id, tagInput)
        .then(success => {
          if (success) {
            setTagInput('');
          }
          setTagInputEnabled(true);
        });
    }
  };

  const handleDeleteTag = tag => {
    setDeletedTags(deletedTags.concat([tag]));
    deleteTag(mark.id, tag)
      .then(() => {
        setDeletedTags(deletedTags.splice(deletedTags.indexOf(tag)));
      });
  };

  const handleAddAnnotation = () => {
    if (isTemplateMark()) {
      createMark({
        ...YT.getVideoData(),
        tags: [],
        annotations: [annotationInput],
      });
    } else {
      if (mark.annotations.indexOf(annotationInput) !== -1) {
        publishNotif('error', 'Annotation already exists');
        return;
      }

      setAnnotationInputEnabled(false);
      addAnnotation(mark.id, annotationInput)
        .then(success => {
          if (success) {
            setAnnotationInput('');
          }
          setAnnotationInputEnabled(true);
        });
    }
  };

  const handleDeleteAnnotation = annotation => {
    setDeletedAnnotations(deletedAnnotations.concat([annotation]));
    deleteAnnotation(mark.id, annotation)
      .then(() => {
        setDeletedAnnotations(deletedAnnotations.splice(deletedAnnotations.indexOf(annotation)));
      });
  };

  return (
    <Grid container item direction="column">
      { !noTimeRange && (
        <Grid container item direction="row">
          <Grid item container xs={4}>
            <ButtonGroup size="medium">
              <Button onClick={() => YT.setCurrentTime(timeRange[0])}>
                {timeFormat(timeRange[0])}
              </Button>
              <Button onClick={() => YT.setCurrentTime(timeRange[1])}>
                {timeFormat(timeRange[1])}
              </Button>
            </ButtonGroup>
          </Grid>
          <Grid item container xs={8}>
            <CustomSlider
              value={timeRange}
              onChange={(e, range) => setTimeRange(range)}
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
          <Chip
            size="small"
            color="primary"
            disabled={deletedTags.indexOf(tag) >= 0}
            key={tag}
            label={tag}
            onDelete={() => handleDeleteTag(tag)}
          />
        ))}
        {(mark.annotations || []).map(annotation => (
          <Chip
            size="small"
            color="secondary"
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
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => e.keyCode === 13 && handleAddTag()}
            disabled={!tagInputEnabled}
            size="small"
            label="Tag"
            fullWidth
            color="primary"
          />
        </Grid>
        <Grid item container xs={8}>
          <TextField
            value={annotationInput}
            onChange={e => setAnnotationInput(e.target.value)}
            onKeyDown={e => e.keyCode === 13 && handleAddAnnotation()}
            disabled={!annotationInputEnabled}
            size="small"
            label="Annotation"
            fullWidth
            color="secondary"
          />
        </Grid>
      </Grid>
    </Grid>
  );
}

Mark.propTypes = {
  mark: PropTypes.shape(MarkSchema).isRequired,
  noTimeRange: PropTypes.bool,
  createMark: PropTypes.func.isRequired,
  updateMarkRange: PropTypes.func.isRequired,
  addTag: PropTypes.func.isRequired,
  deleteTag: PropTypes.func.isRequired,
  addAnnotation: PropTypes.func.isRequired,
  deleteAnnotation: PropTypes.func.isRequired,
  publishNotif: PropTypes.func.isRequired,
};

Mark.defaultProps = {
  noTimeRange: false,
};

const mapDispatchToProps = {
  createMark: actions.createMark,
  updateMarkRange: actions.updateMarkRange,
  addTag: actions.addTag,
  deleteTag: actions.deleteTag,
  addAnnotation: actions.addAnnotation,
  deleteAnnotation: actions.deleteAnnotation,
  publishNotif: actions.publishNotif,
};

export default connect(null, mapDispatchToProps)(Mark);
