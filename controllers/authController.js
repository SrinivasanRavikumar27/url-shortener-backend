const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel.js');
const config = require('../utils/config.js');
const bcrypt = require('bcrypt');
const {Info,Error} = require('../utils/logger.js');
const sendEmail = require('../controllers/mailController.js');


 // -------------------------------------------------------------------------------

// getToken function 
const getToken = (request) => {
    const authorization = request.get('authorization');
     if(authorization && authorization.toLowerCase().startsWith('bearer')){
         return authorization.substring(7);
     }
     return null;
}

 // --------------------------------------------------------------------------------------------

const authController = {

    // --------------------------------------------------------------------------------------------

    // signup
    signup : async (request,response) => {
        try {
            //  get data from client side
            const {fristName,lastName,email,password} = request.body;

            //  check if user already exists in the database
            const userExist = await userModel.findOne({ email: email });

            //   If user is not exist then create a new user and save it to the database
            if(!userExist){

                // password pattern
                const passwordPattern = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

                // password validation
                if(passwordPattern.test(password)){

 // generate salt round with hash password using  bcrypt
 const hashedPassword = await bcrypt.hash(password,10);

//  user count  for generating unique id
const userCount = await userModel.find().countDocuments();

let userId = "";

// userID genarate based on custom  algorithm
if (userCount < 10) {
     userId += "U00" + userCount;
} else if (userCount < 100) {
     userId += "U0" + userCount;
} else {
     userId += "U" + userCount;
};

//  payload
const userPayload = {
    userid : userId,
    fristName : fristName,
    lastName : lastName
}

 // activation token to activate the user
var activeToken = jwt.sign(userPayload,config.Jwt, { expiresIn : '1d'});

 //  Create an object of User and add properties to it
 const user = new userModel({
     userid : userId,
     fristName : fristName,
     lastName : lastName,
     email:email,
     password:hashedPassword,
     activationToken : activeToken
 });

 // Save the user to the database
 const savedUser = await user.save();

 // log info
 Info(`New User Created ${savedUser._id}`);
 
//  create link
const link = `${config.FE_baseUrl}/activate/${savedUser.userid}/${activeToken}`;

// set subject and  content for mail
let subject = `Activate your account`;
let htmlContent = `<h3>Hello ${savedUser.fristName} ${savedUser.lastName}</h3> 
<p>Please click on the following link to verify your account.<a href="${link}" target=”_blank” >Click Here</a>
</p>`;

// send mail for activation
const emailInfo = await sendEmail(savedUser.email,subject,htmlContent);

if (emailInfo.response.match(/OK/)) {
    Info('Email sent successfully to ..', savedUser.email);
    // send response
    return response.status(200).json({message : 'user signed up sucessfully',data:savedUser,
    message1 : "Verfication link is sent to email Address ,Please Click link and activate account within 24 hrs!"});
    
} else {
    Info('Email not sent !');
}

               }else{
                    Error("Password Doesn't Match the Pattern");
                    response.status(403).json({message:"Password should contain at least one number,one special character and be 8 characters long"});
                }

            }else{
                Error("User Already Exists");
                response.status(404).json({message:'Username or Email already exists'});
               }

        } catch (error) {
            response.status(500).json({error : error.message});
        }
    },

    // ----------------------------------------------------------------------------------

    // activate account

    activateAccount : async (request,response) => {
        try {

            const {id,token} = request.body;

            // token verify and get user 
            const user = await userModel.findOne({activationToken : token,userid : id});

            if(user){
                user.accountActive = true;
                user.activationToken = null;
                const activeUser = await user.save();
                response.status(200).json({message : "user activated  successfully"});
            }else{
                response.status(404).json({message : "Invalid Token or User Id"});
            }

        } catch (error) {
            response.status(500).json({error : error.message}); 
        }
    },

    // -----------------------------------------------------------------------------------

    // login
    login: async (request, response) => {
        try {

            const {email,password} = request.body;

            const user = await userModel.findOne({ email: email,accountActive : true });
        
            // user check
            if(!user){
                return response.status(404).json({message : "user not found or account is inactive !"});
            }
        
            // password verify
            const passwordVerify = await bcrypt.compare(password, user.password);
        
            if(!passwordVerify){
                return response.status(401).json({message:"invalid password"});
            }
        
            // payload
            const userPayload = {
                id : user._id,
                fristName : user.fristName,
                lastName : user.lastName,
                email : user.email,
                userid : user.userid
            };
        
            // jwt token define
            const token = jwt.sign(userPayload, config.Jwt, { expiresIn: '1h' });
        
            // send response 
            response.status(200).json({token,user : userPayload,message : "user Logged in sucessfully"});
            
        } catch (error) {
            response.status(500).json({Error : error.message});
        }
    },

    // ---------------------------------------------------------------------------------------

    // password reset email
    sendPasswordResetEmail: async (request, response) => { 
        try {
            const { email } = request.body;

            const oldUser = await userModel.findOne({ email: email,accountActive : true });

            if (!oldUser) {
                return response.status(404).json({ message: "user not found or account is inactive !" });
            }; 
    
            // const secret = config.Jwt + oldUser.userId; // Use the same secret for signing and verifying the token
    
            const userPayload = {
                email: oldUser.email,
                userID: oldUser.userid
            };
    
            const token = await jwt.sign(userPayload, config.Jwt, { expiresIn: '5m' });
    
            const link = `${config.FE_baseUrl}/updatePassword/${oldUser.userid}/${token}`;
    
            // set subject and  content for mail
let subject = `Password Reset`;
let htmlContent = `<h3>Hello ${oldUser.fristName} ${oldUser.lastName}</h3>  
<p>Please click on the following link to reset password.<a href="${link}" target=”_blank” >Click Here</a>
</p>`;

// send mail for activation
const emailInfo = await sendEmail(savedUser.email,subject,htmlContent);
    
            if (emailInfo.response.match(/OK/)) {
                console.log('Email sent successfully to ..', oldUser.email);
                return response.status(200).json({message : "Check your Email,mail sent sucessfully."});
            } else {
                console.log('Email not sent !');
            }
        } catch (error) {
            Error(error);
            response.status(500).json({ Error: error });
        }
    },

    // -----------------------------------------------------------------------------------------

    // update password
    updatePassword : async (request, response) => {
        try{
        const { newPassword, confirmPassword, userid } = request.body;

        const existUser = await userModel.findOne({ userid: userid,accountActive : true });

        const passwordPattern = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

        const token = getToken(request);

        const verifyPassword = await bcrypt.compare(newPassword, existUser.password);

        let errorMessage = null;
        let userPayload = null;
        let tokenValue = null;

        jwt.verify(token, config.Jwt, async (err, decodedToken) => {

            if(err instanceof jwt.TokenExpiredError){
               return errorMessage = "Session Expired,Please send email again!";
            } else if (err) {
              return  errorMessage = "invalid Token";
            } else {
                Info('password validation start here ..');
                if (!existUser) {
                  return  errorMessage = "user not found or account is inactive !";
                } else if (!passwordPattern.test(newPassword) || !passwordPattern.test(confirmPassword)) {
                  return  errorMessage = "Please enter a valid Password!, " 
                    + "Password should contain at least one number,one special character and be 8 characters long.";
                } else if (newPassword !== confirmPassword) {
                  return  errorMessage = "the new password and confirm password should be equal!";
                } else if (verifyPassword) {
                  return  errorMessage = "the new password and old password should not be equal!";
                } 
            }
        });

        if (errorMessage) {
            Error(errorMessage);
            return response.status(403).json({ message: errorMessage });
        } else {

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const updatedUser = await userModel.findOneAndUpdate({ userid: userid }, 
                { 
                    $set: {
                         password: hashedPassword,
                          updatedAt: Date.now() 
                        } 
                    });
            Info('password updated ',updatedUser.userid);
            userPayload = {
                id: updatedUser._id,
                userid: updatedUser.userid,
                fristName : updatedUser.fristName,
                lastName : updatedUser.lastName
            };
            tokenValue = jwt.sign(userPayload, config.Jwt, { expiresIn: '1h' });
            
            return response.status(200).json({ message: "Password Updated Successfully", token: tokenValue, user: userPayload });
        }

    }catch(error) {
        Error(error);
        return response.status(500).json({ error: error.message });
    }
}

// --------------------------------------------------------------------------------------------
 
};

 // --------------------------------------------------------------------------------------------

// export controller 
module.exports=authController;