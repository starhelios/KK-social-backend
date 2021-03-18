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
  usersGoing: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'User' }],
});

const experienceSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },
    randomString: {
      type: String,
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
    startDay: {
      type: Date,
      required: true,
    },
    endDay: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
    },
    specificExperience: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'Specific Experience' }],
  },
  {
    timestamps: true,
  }
);

experienceSchema.index(
  {
    title: 'text',
    'userId.fullname': 'text',
  },
  { name: 'search' }
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
