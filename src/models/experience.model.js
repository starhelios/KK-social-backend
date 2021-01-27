const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const dateAvaibility = mongoose.Schema({
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
});

const experienceSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    images: [{ type: String }],
    categoryName: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    usersGoing: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'User' }],
    ratings: [{ type: mongoose.SchemaTypes.experience, ref: 'Rating' }],
    startDay: {
      type: Date,
      required: true,
    },
    endDay: {
      type: Date,
      required: true,
    },
    dateAvaibility: [dateAvaibility],
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
experienceSchema.plugin(toJSON);
experienceSchema.plugin(paginate);

experienceSchema.statics.isTitleTaken = async function (title, excludeExperienceId) {
  const experience = await this.findOne({ title, _id: { $ne: excludeExperienceId } });
  return !!experience;
};

const Experience = mongoose.model('Experience', experienceSchema);

module.exports = Experience;
