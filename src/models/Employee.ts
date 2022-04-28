import mongoose from 'mongoose';
import {Schema, model} from 'mongoose';
import Restaurant from './Restaurant';

const EmployeeSchema = new Schema({
    employeeName: {type: String, required:true, unique:true},
    fullName: {type: String, required:true},
    email: {type: String, required:true},
    password: {type: String, required:true},
    creationDate: {type: Date, default:Date.now},
    salary: {type: Number, required:false},
    listRestaurants:[{type:mongoose.Schema.Types.ObjectId, ref: Restaurant}] //Array containing the IDs of the restaurants.
})


export default model('Employee', EmployeeSchema);