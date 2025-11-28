import { aboutNgo , getNgoMembers } from "../Controllers/ngoControllers.js";
import express from 'express';

const ngoRouter = express.Router()
ngoRouter.get('/about', aboutNgo)
ngoRouter.get('/ngo-members', getNgoMembers)


export default ngoRouter