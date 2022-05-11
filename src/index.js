const express = require('express');
const env = require('dotenv').config();
const {v4:uuid} =require('uuid');
const app = express();

app.use(express.json());

const customers=[]

/*
cpf - string
name - string
id  - uuid
statement []
*/

app.post("/account",(req,res)=>{
const {cpf,name}= req.body;

const customerAlreadyExist= customers.some(customer=>customer.cpf===cpf)

if(!cpf || !name)return res.status(400).json({error:"cpf and name are required"});
const statement={name,cpf,id:uuid()}

const newCustomer={name,cpf,id:uuid(),statement:[]}

if(customerAlreadyExist) res.status(400).send({error:"customer already exist"});

customers.status(201).push(newCustomer);

res.json({newCustomer})
})


app.get('/statement/:cpf',(req,res)=>{
 const {cpf}=req.params;
  if(!cpf)return res.status(400).json({error:"cpf is required"});

    const customer= customers.find(customer=>customer.cpf===cpf);
    if(!customer)return res.status(400).json({error:"customer not found"});

    const {statement}=customer;
    res.json({statement})

})







app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
})

