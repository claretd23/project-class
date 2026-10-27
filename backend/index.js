const express=require('express');
const mongoose= require('mongoose');
const bodyparser=require('body-parser');
const cookieParser=require('cookie-parser');
const User=require('./models/user');
const db=require('./config/config').get(process.env.NODE_ENV);
const { auth } = require('./middleware/auth');


const app=express();
// app use
app.use(bodyparser.urlencoded({extended : false}));
app.use(bodyparser.json());
app.use(cookieParser());

// database connection
mongoose.Promise=global.Promise;
mongoose.connect(db.DATABASE,{ useNewUrlParser: true,useUnifiedTopology:true },function(err){
    if(err) console.log(err);
    console.log("database is connected");
});


// adding new user (sign-up route)
app.post('/api/register',function(req,res){
   // taking a user
   const newuser=new User(req.body);
   console.log(newuser);

   if(newuser.password!=newuser.password2)return res.status(400).json({message: "password not match"});
   
   User.findOne({email:newuser.email},function(err,user){
       if(user) return res.status(400).json({ auth : false, message :"email exits"});

       newuser.save((err,doc)=>{
           if(err) {console.log(err);
               return res.status(400).json({ success : false});}
           res.status(200).json({
               succes:true,
               user : doc
           });
       });
   });
});


// login user
app.post('/api/login', async function(req,res){
    //solo se usa let cuando se redeclara un valor 
    const token=req.cookies.auth;
    //para evitar el uso de callbacks usamos funciones asincronas 
    //maneja,os el error try/catch
    //manejamos en donde exista y ya esta logeado con if
    try{
        const user = await User.findByToken(token);
        if(user) return res.status(400).json({
            error :true,
            message:"You are already logged in"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:error});
    }

    try {
        const user = await User.findOne({ 'email': req.body.email});
        if(!user) return res.json({ isAuth: false, message: 'Auth failed'});
        const {e, isMatch } = user.comparepassword(req.body.pasword);
        if (!isMatch && e) return res.json({isAuth: false, message: 
        'Auth failed'});
        await user.generateToken();
        return res.status(200).cookie('auth', user.token).json({
            isAuth: true,
            id: user._id,
            email: user.email
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: error });
    }





    const newtoken = user.generatetoken

    User.findByToken(token,(err,user)=>{
        if(err) return  res(err);
        
    
        else{
            User.findOne({'email':req.body.email},function(err,user){
                if(!user) return res.json({isAuth : false, message : ' Auth failed ,email not found'});
        
                user.comparepassword(req.body.password,(err,isMatch)=>{
                    if(!isMatch) return res.json({ isAuth : false,message : "password doesn't match"});
        
                user.generateToken((err,user)=>{
                    if(err) return res.status(400).send(err);
                    res.cookie('auth',user.token).json({
                        isAuth : true,
                        id : user._id
                        ,email : user.email
                    });
                });    
            });
          });
        }
    });
});

//logout user
 app.get('/api/logout',auth, async function(req,res) {
    try {
        await req.user.deleteToken();
        return res.status(200);
    }catch (error) {
        console.log(error);
        return res.status(500).json({msg:error});
    }

    }); 

// get logged in user
app.get('/api/profile',auth,function(req,res){
        res.json({
            isAuth: true,
            id: req.user._id,
            email: req.user.email,
            name: req.user.firstname + req.user.lastname
            
        })
});


app.get('/',function(req,res){
    res.status(200).send(`Welcome to login , sign-up api`);
});

// listening port
const PORT=process.env.PORT||3000;
app.listen(PORT,()=>{
    console.log(`App is live at ${PORT}`);
});