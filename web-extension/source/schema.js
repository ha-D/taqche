import PropTypes from 'prop-types';


export const MarkSchema = {
  id: PropTypes.string.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  annotations: PropTypes.arrayOf(PropTypes.string).isRequired,
  start: PropTypes.number,
  end: PropTypes.number,
};

export const RangedMarkSchema = {
  ...MarkSchema,
  start: PropTypes.number.isRequired,
  end: PropTypes.number.isRequired,
};
