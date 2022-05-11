const express = require('express');
const env = require('dotenv').config();
const {v4:uuid} =require('uuid');
const app = express();

app.use(express.json());
const customers=[]

function getAccountByCPF(req,res,next){
    const {cpf}=req.headers;
    if(!cpf)return res.status(400).json({error:"cpf is required"});
  
      const customer= customers.find(customer=>customer.cpf===cpf);
      if(!customer)return res.status(400).json({error:"customer not found"});
        req.customer=customer;
      next();
}

function getBalance(statement){
    const balance=statement.reduce((acumulador, operation)=>{
        if(operation.type==="credit"){
            return acumulador+operation.ammount;
        }else{
            return acumulador-operation.ammount;
        }

    },0);

    return balance;
}



// ROTAS

app.post("/account",(req,res)=>{
const {cpf,name}= req.body;

const customerAlreadyExist= customers.some(customer=>customer.cpf===cpf)

if(!cpf || !name)return res.status(400).json({error:"cpf and name are required"});
const statement={name,cpf,id:uuid()}

const newCustomer={name,cpf,id:uuid(),statement:[]}

if(customerAlreadyExist) res.status(400).send({error:"customer already exist"});

customers.push(newCustomer);

res.status(201).json({newCustomer})
})


app.get('/statement/:cpf',(req,res)=>{
 const {cpf}=req.params;
  if(!cpf)return res.status(400).json({error:"cpf is required"});

    const customer= customers.find(customer=>customer.cpf===cpf);
    if(!customer)return res.status(400).json({error:"customer not found"});

    const {statement}=customer;
    res.json({statement})

})


app.get("/statement/date",getAccountByCPF,(req,res)=>{

    const {customer}=req;
    const {date}=req.query;
    if(!date)return res.status(400).json({error:"date is required"});

    const dateFormat= new Date(date + "00:00");

    const statement=customer.statement.filter(statement=>statement.created_at.toDateString()=== new Date(dateFormat.toDateString()));
    if(!statement)return res.status(400).json({error:"statement not found"});
    return res.satus(200).json({statement})

})


app.get('/statement',getAccountByCPF,(req,res)=>{
   
       const {statement}=req.customer;
       res.json({statement})
   
})

app.post("/deposit",getAccountByCPF,(req,res)=>{
    const {customer}=req;
    const {description,ammount}=req.body;
    if(!description || !ammount)return res.status(400).json({error:"description and ammount are required"});

    const statementOperation={
        description,
        ammount,
        created_at:new Date(),
        type:"credit"
    }

   customer.statement.push(statementOperation);

   return res.status(201).json({message:"depositado com sucesso"})

})

app.post("/withdraw",getAccountByCPF,(req,res)=>{
    const {customer}=req;
    const {ammount}=req.body;

    const balance= getBalance(customer.statement);
    if(balance<ammount)return res.status(400).json({error:"insuficient funds"});

    const statementOperation={
        ammount,
        created_at:new Date(),
        type:"debit"
    }

    customer.statement.push(statementOperation);
    return res.status(201).json({message:"sacado com sucesso"})

})


app.put("/update-account",getAccountByCPF,(req,res)=>{
    const {name}=req.body;
    const {customer}=req;

    if(!name)return res.status(400).json({error:"name is required"});

    customer.name=name;

    return res.status(201).json({message:"conta atualizada com sucesso"})
})

app.delete("/delete-account",getAccountByCPF,(req,res)=>{
    const {customer}=req;

customers.splice(customer,1);
return res.status(200).json({message:"conta deletada com sucesso"})
})

app.get("/obter-dados",getAccountByCPF, (req,res)=>{

    const {customer}=req;
    return res.status(200).json({customer})
})


app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
})

