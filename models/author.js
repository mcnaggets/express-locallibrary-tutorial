let mongoose = require('mongoose');
let moment = require('moment');

let Schema = mongoose.Schema;

let AuthorSchema = new Schema(
    {
        first_name: {type: String, required: true, max: 100},
        family_name: {type: String, required: true, max: 100},
        date_of_birth: {type: Date},
        date_of_death: {type: Date},
    }
);

// Virtual for author's full name
AuthorSchema
    .virtual('name')
    .get(function () {
        return this.family_name + ', ' + this.first_name;
    });

// Virtual for author's lifespan
AuthorSchema
    .virtual('lifespan')
    .get(function () {
        return `${formatAuthorDate(this.date_of_birth, "Not defined")} - ${formatAuthorDate(this.date_of_death, "Still alive")}`;
    });

// Virtual for author's URL
AuthorSchema
    .virtual('url')
    .get(function () {
        return '/catalog/author/' + this._id;
    });

function formatAuthorDate(date, notDefined) {
    return date? moment(date).format('MMMM Do, YYYY') : notDefined;
}

//Export model
module.exports = mongoose.model('Author', AuthorSchema);