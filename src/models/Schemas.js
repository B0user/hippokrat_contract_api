const { model, Schema, ObjectId } = require('mongoose');

const doctorSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    role: {
      type: String,
      required: true  
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    refreshToken: String
});

const contractSchema = new Schema({
    company_enroller: {
        type: String,
        required: true
    },
    patients: [{
        iin: {
            type: String,
            required: true
        },
        dob: {
            type: Date,
            default: null
        },
        gender: {
            type: String,
            required: true
        },
        fullname: {
            type: String,
            required: true
        },
        position: {
            type: String,
            required: true
        },
        assigned: {
            type: Map,
            of: {
                type: Date,
                default: null
            }
        },
        therapist_comment: String,
        date_added: {
            type: Date,
            default: Date.now
        },
        date_updated: {
            type: Date,
            default: Date.now
        }
    }],
    date_of_contract: {
        type: Date,
        required: true
    },
    date_added: {
        type: Date,
        default: Date.now
    },
    date_updated: {
        type: Date,
        default: Date.now
    }
});

const Doctor = model('Doctor', doctorSchema);
const Contract = model('Contract', contractSchema);

module.exports = { Doctor, Contract };
