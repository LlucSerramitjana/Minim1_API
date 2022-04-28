import {Request, response, Response, Router} from 'express';
import { request } from 'http';
import {authJwt} from '../middlewares/index';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config';

import Employee from '../models/Employee';

class EmployeeRoutes {
    public router: Router;
    constructor() {
        this.router = Router();
        this.routes(); //This has to be written here so that the method can actually be configured when called externally.
    }

    public async getAllEmployees(req: Request, res: Response) : Promise<void> { //It returns a void, but internally it's a promise.
        const allEmployees = await Employee.find();
        if (allEmployees.length == 0){
            res.status(404).send("There are no owners yet.")
        }
        else{
            res.status(200).send(allEmployees);
        }
    }
    

    public async getEmployeeById(req: Request, res: Response) : Promise<void> {
        const employeeFound = await Employee.findById(req.params._id).populate("listRestaurants");
        if(employeeFound == null){
            res.status(404).send("Employee not found.");
        }
        else{
            res.status(200).send(employeeFound);
        }
    }

    public async getEmployeeByName(req: Request, res: Response) : Promise<void> {
        const employeeFound = await Employee.findOne({employeeName: req.params.employeeName});
        if(employeeFound == null){
            res.status(404).send("Employee not found.");
        }
        else{
            res.status(200).send(employeeFound);
        }
    }
    

    public async addEmployee(req: Request, res: Response) : Promise<void> {
        const employeeFound = await Employee.findOne({employeeName: req.body.employeeName})
        if (employeeFound != null){
            res.status(409).send("This employee already exists.")
        }
        else{
            const {employeeName, fullName, email, password} = req.body;
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(password, salt);
            const newEmployee = new Employee({employeeName, fullName, email, password: hashed});

            const savedEmployee = await newEmployee.save();
            const token = jwt.sign({id: savedEmployee._id, username: savedEmployee.employeeName}, config.SECRET,{
                expiresIn: 3600 //seconds
            });
            res.status(201).send({token});
        }
    }

    public async updateEmployee(req: Request, res: Response) : Promise<void> {
        const employeeToUpdate = await Employee.findOneAndUpdate ({employeeName: req.params.employeeName}, req.body);
        if(employeeToUpdate == null){
            res.status(404).send("Employee not found.");
        }
        else{
            res.status(201).send('Employee updated.');
        }
    }

    public async deleteEmployee(req: Request, res: Response) : Promise<void> {
        const employeeToDelete = await Employee.findByIdAndDelete (req.params._id);
        if (employeeToDelete == null){
            res.status(404).send("Employee not found.")
        }
        else{
            res.status(200).send('Employee deleted.');
        }
    } 

    
    routes() {
        this.router.get('/', this.getAllEmployees);
        this.router.get('/:_id', this.getEmployeeById);
        this.router.get('/name/:employeeName', this.getEmployeeByName);
        this.router.post('/', this.addEmployee);
        this.router.put('/:employeeName', this.updateEmployee);
        this.router.delete('/:_id', this.deleteEmployee);
    }
}
const employeeRoutes = new EmployeeRoutes();

export default employeeRoutes.router;
