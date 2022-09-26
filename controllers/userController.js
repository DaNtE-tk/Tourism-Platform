import User from "../mongoDB/models/users.js";
import Place from "../mongoDB/models/places.js";
import bcrypt from "bcrypt";
import generateToken from "../utilities/generateToken.js";

export const registerUser = async (req,res)=>{
  try{
    const {email,password,mobile,role} = req.body;
    if(!(email||password)){
      res.status(400).send("Insufficent input");
    }
    const old = await User.findOne({email});
    if(old){
      res.status(409).send({msg:"User already exists",data:old});
    }
    else{
      let encryptedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        email,
        mobile,
        password:encryptedPassword,
        role,
      })
      res.status(200).send(user);
    }
  }catch(err){
    console.log(err);
  }
  res.status(500).send("Internal server error");
}

export const createAdmin = async (req,res)=>{
  try{
    const {email,password,mobile,role} = req.body;
    if(!(email||password||role)){
      res.status(400).send("Insufficent input");
    }
    if(role=='superadmin'||'admin'||'blockadmin'){
      let encryptedPassword = await bcrypt.hash(password, 10);
      const data = await User.create({
        email,
        password:encryptedPassword,
        mobile,
        role
      })
      res.status(201).send(data);
    }else{
      res.status(400).send("Invalid input for role!");
    }
  }catch(err){
    console.log(err);
  res.status(500).send("Internal server error");
  }
}

export const loginUser = async (req,res)=>{
  try{
    const {email,password} = req.body;
    if(!(email||password)){
      res.status(400).send("Invalid credentials");
    }
      const user = await User.findOne({email});
      if(!user){
        res.status(400).send("No user found!")
      }else{
        if (user && (await bcrypt.compare(password, user.password))) {
        const token = generateToken(user,email,user.role);
        user.token = token;
        res.status(200).send(user);
      }
  }
  }catch(err){
    console.log(err);
    res.status(500).send("Internal server error");
  }
}

export const userProfile = async (req,res)=>{
  try{
    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user){
      res.status(400).send('No user found!');
    }else{
      res.status(200).send({data:user});
    }
  }catch(err){
    console.log(err);
    res.status(500).send("Internal server error");
  }
}

export const userUpdate = async (req,res)=>{
  try{
    const {email} = req.body;
    const {password,mobile,role} = req.body;
    let user = await User.findOne({email});
    if(!user){
      res.status(400).send("Invalid email");
    }else{
      let encryptedPassword = await bcrypt.hash(password, 10);
      const data = await User.updateOne({email},{$set:{password:encryptedPassword,mobile:mobile,role:role}});
      user = await User.findOne({email});
      res.status(201).send(user);
    }
  }catch(err){
    console.log(err);
    res.status(500).send("Internal server error");
  }
}

export const userDelete = async (req,res)=>{
  try{
    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user){
      res.status(400).send("Invalid email");
    }else{
      await User.deleteOne({email});
      res.status(202).send("User deleted!");
    }
  }catch(err){
    console.log(err);
    res.status(500).send("Internal server error");
  }
}
