const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');

const paymentInfo = mongoose.Schema({
  cardType: {
    type: String,
    required: true,
  },
  cardNumber: {
    type: String,
    required: true,
  },
  cardExpiryDate: {
    type: String,
    required: true,
  },
  cvc: {
    type: String,
    required: true,
  },
});

const bankInfo = mongoose.Schema({
  bankName: {
    type: String,
    required: true,
  },
  bankNumber: {
    type: String,
    required: true,
  },
});

const bookingInfo = mongoose.Schema({
  experienceID: {
    type: String,
    required: true,
  },
  dateAvaibilityID: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    required: false,
  },
});

const userSchema = mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
      required: false,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error('Password must contain at least one letter and one number');
        }
      },
      private: true, // used by the toJSON plugin
    },
    status: {
      type: String,
      default: 'pending',
    },
    categoryName: {
      type: String,
    },
    availableMethods: {
      type: Array,
      default: [],
    },
    stripeCustomerID: {
      type: String,
      default: '',
    },
    stripeConnectID: {
      type: String,
      default: '',
    },
    aboutMe: {
      type: String,
    },
    isHost: {
      type: Boolean,
      default: false,
    },
    joinDay: {
      type: Date,
    },
    location: {
      type: String,
    },
    experiences: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'Experience' }],
    ratingsGiven: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'Ratings' }],
    paymentInfo: [paymentInfo],
    bankInfo: [bankInfo],
    bookingInfo: [bookingInfo],
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
