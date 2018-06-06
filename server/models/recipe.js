var mongoose = require('mongoose')
var ObjectId = Schema.Types.ObjectId
var Schema = mongoose.Schema
var schemaName = 'Recipe'

var schema = new Schema({
  title: {type: String, required: true},
  readyInMinutes: {type: Number, required: true},
  image:{type: String, required: true},  //Will put default picture once found!
  instructions: {type: String, required: true},
  sourceUrl: {type: String, required: true},
  extendedIngredients: {type: String, required: true},
  userId: {type: ObjectId, ref: 'User', required: true}
})

module.exports = mongoose.model(schemaName, schema)