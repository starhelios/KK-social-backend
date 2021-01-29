const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const experienceDateSchema = mongoose.Schema({
  experienceId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Experience',
  },
  day: {
    type: String,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  usersGoing: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'User' }],
});

// add plugin that converts mongoose to json
experienceDateSchema.plugin(toJSON);
experienceDateSchema.plugin(paginate);

const ExperienceDate = mongoose.model('Experience Date', experienceDateSchema);

module.exports = ExperienceDate;
