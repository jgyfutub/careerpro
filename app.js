const express=require("express")
const app=express()
const ejs=require("ejs")
const mongoose=require("mongoose")
const bodyParser=require("body-parser")
const bcrypt = require("bcrypt");
const { response, application } = require("express")
const path=require('path')
const jsdom = require("jsdom");
const { deepStrictEqual } = require("assert")
const { JSDOM } = jsdom;
// const multer=require('multer')
// const storage=multer.diskStorage({
//     destination:(req,file,cb)=>{
//         cb(null,'Images')
//     },
//     filename:(req,file,cb)=>{
//         console.log(file)
//         cb(null,Date.now()+path.extname(file.originalname))
//     }
// })
// const upload=multer({storage:storage})
// global.document = new JSDOM(html).window.document;
app.set('views', path.join(__dirname, 'views'))
app.use(express.static('public'))
app.set('view engine','ejs')
const saltRounds=16
app.use(bodyParser.urlencoded({extended:true}))
mongoose.set("strictQuery", false);
app.use(express.json())
app.use(express.urlencoded({extended: true}))
mongoose.connect('mongodb://localhost:27017/shopDB',{useNewURLParser:true,useUnifiedTopology: true, family: 4},()=>{
    console.log("connected to mongodb")
})
const userSchema=new mongoose.Schema({
    email:{type:String,required:true},
    password:{type:String,required:true}
})
const detailSchema=new mongoose.Schema({
    id:{type:String,required:true},
    name:{type:String,required:true},
    age:{type:Number,required:true},
    date:{
    type: String,
    default: Date.now(),
    required:true
  },aboutYou:{
    type:String,
    max:551,
    default:"",
    required:true
},
followers:[String],
Companiesfollowing:[String],
Companiesfollowers:[String],
following:[String],
Posts:[{description:String,createdAt:String,likes:[String]}],
Notifications:[String],
Applied:[String],
skills:[String]
})
const companySchema=new mongoose.Schema({
    email:{type:String,required:true},
    password:{type:String,required:true}
})
const companydetailSchema=new mongoose.Schema({
    id:{type:String,required:true},
    name:{type:String,required:true},
    date:{
    type: String,
    default: Date.now(),
    required:true
  },aboutYou:{
    type:String,
    max:551,
    default:"",
    required:true},
    followers:[String],
following:[String],
Usersfollowing:[String],
Usersfollowers:[String],
Posts:[{description:String,createdAt:String,likes:[String]}],
Notifications:[String],
requirements:[String],
applications:[{job:String,applicants:[String]}],
vacancies:{
    type:Number
}
})
const User=new mongoose.model('users',userSchema)
const Detail=new mongoose.model('details',detailSchema)
const Company=new mongoose.model('companies',companySchema)
const CompanyDetail=new mongoose.model('companydetail',companydetailSchema)
//sending the mainpage of project
app.get("/",function(req,res){
    res.sendFile(__dirname +'/three.html')
})
var error_register=""
//sending the register page with errors (if any)
app.get("/register",function(req,res){
    res.render("register",{error_register:error_register})
})
app.post("/register",function(req,res){
    //taking the email and password
    const username=req.body.email
    const password=req.body.password
    //hashing the password
    const salt=bcrypt.genSaltSync(16)
    const hashedPassword=bcrypt.hashSync(password,salt)
    //if a detail not filled send the error
    if(username==""||hashedPassword==""||username=="" && hashedPassword==""){
        error_register="plz fill all details"
        res.redirect('/register')
    }else{
    User.findOne({email:username},function(err,foundUser){
        if(!foundUser){
            //add email and password to the database
            const newuser=new User({
                email:username,
                password:hashedPassword
            })
            newuser.save(function(err,docs){
                if(!err){console.log("saved!!")
                console.log(newuser._id)
                //send user to the detail page
                var url="/details/"+newuser._id
                res.redirect(url)}
                else{
                res.redirect('/register')
                console.log(err)
                error_register="error occured :("}})
        }else {
            //if user with same email already in database
            if(foundUser){
            error_register="the email already exists!!!"
            res.redirect('/register')
        }}
    })}
})
var error_comp=""
app.get('/registercompany',function(req,res){
    res.render("registercompany",{error:error_comp})
})
app.post('/registercompany',function(req,res){
    const username=req.body.email
    const password=req.body.password
    const salt=bcrypt.genSaltSync(16)
    const hashedPassword=bcrypt.hashSync(password,salt)
    if(username==""||hashedPassword==""||username=="" && hashedPassword==""){
        error_comp="please fill all details!!"
        res.redirect('/registercompany')
    }else{
    Company.findOne({email:username},function(err,foundUser){
        if(!foundUser){
            const newuser=new Company({
                email:username,
                password:hashedPassword
            })
            newuser.save(function(err,docs){
                if(!err){console.log("saved!!")
                console.log(newuser._id)
                var url="/detailscompany/"+newuser._id
                res.redirect(url)}
                else{
                res.redirect('/registercompany')
                console.log(err)
                error_comp="error occured :("}})
        }else {
            if(foundUser){
            error_comp="the email already exists!!!"
            res.redirect('/registercompany')
        }}
    })}
})
var error=""
app.get("/login",function(req,res){
    res.render("login",{error:error})
})
app.post("/login",function(req,res){
const username=req.body.email
    const password=req.body.password
    if(username==""||password==""||username=="" && password==""){
        error="plz fill all details"
        res.redirect('/login')
    }else{
    User.findOne({email:username},function(err,foundUser){
        if(!foundUser){
            console.log(err)
            error="email not registered"
            res.redirect("/login")
        }else{
            if(foundUser){
                console.log(foundUser.password)
                bcrypt.compare(password,foundUser.password,function(err,docs){
                    if(docs){
                    console.log("logged in")
                    res.redirect('/dashboard/'+foundUser._id)
                }
                else{
                    if(!docs){
                    error="account registered but password wrong"
                    res.redirect("/login")
                }}
            })}}})
            }
        })
app.get("/details/:id",function(req,res){
    idofUser=req.params.id
    res.render("details")
})
app.post('/details/:id',function(req,res){
    const newDetail=new Detail({
        id:idofUser,
            name:req.body.name,
            age:req.body.age,
            date:req.body.date,
            aboutYou:req.body.aboutYou,
            following:[],
            followers:[],
            Posts:[],
            Notifications:[],
            skills:[]
     })
     newDetail.save(function(err,docs){if(!err){
        console.log("details saved!!")
        res.redirect('/dashboard/'+idofUser)}})
    })
var idofCompany=''
app.get("/detailscompany/:id",function(req,res){
        idofCompany=req.params.id
        res.render("detailscompany")
    })
app.post('/detailscompany/:id',function(req,res){
        const newCompanyDetail=new CompanyDetail({
            id:idofCompany,
            name:req.body.name,
            date:req.body.date,
            aboutYou:req.body.aboutYou,
            following:[],
            followers:[],
            Posts:[],
            requirements:[],
            vacancies:0
         })
        newCompanyDetail.save(function(err,docs){if(!err){
            console.log("details of company saved!!")
            res.redirect('/dashboardcompany/'+idofCompany)}})
})
app.get("/dashboardcompany/:id",function(req,res){
    var searchcompany=[]
    var searchuser=[]
    CompanyDetail.find({},function(err,docs){
        if(docs){
            console.log(docs)
            for(i=0;i<docs.length;i++){
                console.log(docs[i]._doc.id)
                searchcompany.push(docs[i]._doc)
            }
        }
    })
    Detail.find({},function(err,docs){
        if(docs){
            console.log(docs)
            for(i=0;i<docs.length;i++){
                searchuser.push(docs[i]._doc)
            }
        }
    })
            Myid=req.params.id
            CompanyDetail.findOne({id:req.params.id},function(err,docs){
                if(docs){
                    var othersPosts=[]
                    if(docs.following.length==0){
                        console.log(searchcompany,searchuser)
                        res.render('dashboardcompany',{UserDetails:docs,OtherDetails:[],searchuser:searchuser,searchcompany:searchcompany})
                    }
                    docs.following.forEach(function(id){
                        CompanyDetail.findOne({id:id},function(err,docs1){
                            if(docs1){
                            othersPosts.push([docs1.Posts,docs1.name,docs1.id])
                            res.render('dashboardcompany',{UserDetails:docs,OtherDetails:othersPosts,searchuser:searchuser,searchcompany:searchcompany})}
                            else if(!docs1){
                                res.render('dashboardcompany',{UserDetails:docs,OtherDetails:[],searchuser:searchuser,searchcompany:searchcompany})
                            }
                        })
                    })
        }else if(!docs){
            res.write('<h1>ERROR!!!<h1>')
        }
})})
app.post('/dashboardcompany/:id/vacancies',function(req,res){
        res.redirect('/vacancies/'+Myid)
    })
app.post("/dashboardcompany/:id/delete",function(req,res){
    console.log(req.body.checkbox)
    console.log(Myid)
    CompanyDetail.findOne({id:Myid},function(err,docs){
        docs.updateOne({$pull:{Posts:{_id:req.body.checkbox}}},function(err,docs1){
            if(docs1){
            console.log("post deleted!!")
            res.redirect('/dashboardcompany/'+Myid)}
        })
    })
})
app.post('/dashboardcompany/:id/userlink',function(req,res){
    console.log(Myid,req.body.userlink)
    res.redirect('/dashboardcompany/'+Myid+'/'+req.body.userlink)
})
app.get('/dashboardcompany/:id/post',function(req,res){
    Myid=req.params.id
})
app.post('/dashboardcompany/:id/post',function(req,res){
    console.log(Myid)
    CompanyDetail.findOne({id:Myid},function(err,docs){
        console.log(req.body.post)
        docs.updateOne({$push:{Posts:{description:req.body.post[0],createdAt:Date.now(),likes:[]}}},function(err,docs){
            if(docs){
                res.redirect('/dashboardcompany/'+Myid)
                console.log(docs.post)
            }
        })
    })
})
var idofFriend1=''
var idofMe1=''
app.get('/dashboardcompany/:companyid/:userId',function(req,res){
    if(req.params.companyid==req.params.userId){
        res.write("bsdk apni id na likh bc")
    }else{
        idofFriend1=req.params.userId
        idofMe1=req.params.companyid
        User.exists({_id:idofFriend1},function(err,docs){
            if(docs){
                Detail.findOne({id:req.params.userId},function(err,docs){
                    res.render('companyuser',{worklist:docs})
                })
            }else if(!docs){
                res.redirect('/dashboardcompany/'+idofMe1+'/company/'+idofFriend1)
            }
        })
    }
})
app.post('/dashboardcompany/:companyid/:userId/follow',function(req,res){   
    console.log(idofMe1)
    CompanyDetail.findOne({id:idofMe1},function(err,docs){
        console.log(docs)       
        if(!docs.Usersfollowing.includes(idofFriend1)){                 
        docs.updateOne({$push:{Usersfollowing:idofFriend1}},function(err,docs1){           
        if(docs1){             
        Detail.findOne({id:idofFriend1},function(err,docs2){            
        docs2.updateOne({$push:{Companiesfollowers:idofMe1}},function(err,docs3){   
                      
        if(docs3){
            console.log("followed!!")
        res.redirect('/dashboardcompany/'+idofMe1+'/'+idofFriend1)
        }})})}})
        }else{
            docs.updateOne({$pull:{Usersfollowing:idofFriend1}},function(err,docs4){
            if(docs4){
            Detail.findOne({id:idofFriend1},function(err,docs5){
            docs.updateOne({$pull:{Companiesfollowers:idofMe1}},function(err,docs6){
            if(docs6){
                console.log("unfollowed!!")
            res.redirect('/dashboardcompany/'+idofMe1+'/'+idofFriend1)
            }})})}})}})})
var idofFriend2=''
var idofMe2=''
app.get('/dashboard/:id/:companyId',function(req,res){
    if(req.params.id==req.params.companyId){
        res.write("bsdk apni id na likh bc")
    }else{
        idofFriend2=req.params.companyId
        idofMe2=req.params.id
        Company.exists({_id:idofFriend2},function(err,docs){
            if(docs){
                CompanyDetail.findOne({id:req.params.companyId},function(err,docs){
                    res.render('usercompany',{worklist:docs})})
            }else if(!docs){
                res.redirect('/dashboard/'+idofMe2+'/user/'+idofFriend2)
            }
        })
        }})
app.post('/dashboard/:id/:companyId/apply',function(req,res){
    console.log(idofFriend2)
    var name=''
    var jugaad=''
    Detail.findOne({id:idofMe2},function(err,docs){
        console.log(idofMe2)
        name=docs.name
    })
    CompanyDetail.findOne({id:idofFriend2},function(err,docs){
        docs.applications.forEach(function(application){
            console.log(req.body.applybutton)
            console.log(application.job)
            if(application.job==req.body.applybutton){
                console.log(idofFriend2)
                jugaad=name+"+"+idofMe2
                jugaad1=docs.name+'+'+application.job
                console.log(jugaad1)
                if(!application.applicants.includes(jugaad)){
                application.applicants.push(jugaad)
                Detail.findOne({id:idofMe2},function(err,docs1){
                    docs1.Applied.push(jugaad1)
                    docs1.save()
                })
                }else{
                    application.applicants.remove(jugaad)
                    Detail.findOne({id:idofMe2},function(err,docs1){
                        docs1.Applied.pull(jugaad1)
                        docs1.save()
                    })}
                docs.save(function(err,docs1){
                    if(docs1){
                        res.redirect('/dashboard/'+idofMe2+'/'+idofFriend2)
                    }
                })
            }
        })
    })
})
app.post('/dashboard/:id/:companyId/follow',function(req,res){
        console.log(idofMe2)
        Detail.findOne({id:idofMe2},function(err,docs){       
        if(!docs.Companiesfollowing.includes(idofFriend2)){                 
        docs.updateOne({$push:{Companiesfollowing:idofFriend2}},function(err,docs1){       
            docs.Notifications.push('hello')    
            docs.save()
        if(docs1){             
        CompanyDetail.findOne({id:idofFriend2},function(err,docs2){            
        docs2.updateOne({$push:{Usersfollowers:idofMe2}},function(err,docs3){      
                   
        if(docs3){
            console.log("followed!!")
        res.redirect('/dashboard/'+idofMe2+'/'+idofFriend2)
        }})})}})
        }else{
            docs.updateOne({$pull:{Companiesfollowing:idofFriend2}},function(err,docs4){
            if(docs4){
            CompanyDetail.findOne({id:idofFriend2},function(err,docs5){
            docs.updateOne({$pull:{Usersfollowers:idofMe2}},function(err,docs6){
            if(docs6){
                console.log("unfollowed!!")
            res.redirect('/dashboard/'+idofMe2+'/'+idofFriend2)
            }})})}})}})
})

var idofFriend3=''
var idofMe3=''
app.get('/dashboardcompany/:companyid/company/:companyId',function(req,res){
    if(req.params.companyid==req.params.companyId){
        res.write("bsdk apni id na likh bc")
    }else{
        idofFriend3=req.params.companyId
        idofMe3=req.params.companyid
        CompanyDetail.findOne({id:req.params.companyId},function(err,docs){
            res.render('companyfollow',{worklist:docs})
        })
    }
})
app.post('/dashboardcompany/:companyid/company/:companyId/follow',function(req,res){
    console.log(idofMe3)
    CompanyDetail.findOne({id:idofMe3},function(err,docs){       
        if(!docs.Usersfollowing.includes(idofFriend3)){                 
        docs.updateOne({$push:{followers:idofFriend3}},function(err,docs1){           
        if(docs1){             
        CompanyDetail.findOne({id:idofFriend3},function(err,docs2){            
        docs2.updateOne({$push:{following:idofMe3}},function(err,docs3){    
            docs2.Notifications.push(docs.name+' started following you!!')
            docs2.save()       
        if(docs3){
            console.log("followed!!")
        res.redirect('/dashboardcompany/'+idofMe3+'/'+idofFriend3)
        }})})}})
        }else{
            docs.updateOne({$pull:{Usersfollowers:idofFriend3}},function(err,docs4){
            if(docs4){
            CompanyDetail.findOne({id:idofFriend3},function(err,docs5){
            docs.updateOne({$pull:{following:idofMe3}},function(err,docs6){
            if(docs6){
                console.log("unfollowed!!")
            res.redirect('/dashboardcompany/'+idofMe3+'/'+idofFriend3)
            }})})}})}})})
var Myid=''
app.get("/dashboard/:id",function(req,res){
    var searchcompany=[]
    var searchuser=[]
    CompanyDetail.find({},function(err,docs){
        if(docs){
            console.log(docs)
            for(i=0;i<docs.length;i++){
                console.log(docs[i]._doc.id)
                searchcompany.push(docs[i]._doc)
            }
        }
    })
    Detail.find({},function(err,docs){
        if(docs){
            console.log(docs)
            for(i=0;i<docs.length;i++){
                searchuser.push(docs[i]._doc)
            }
        }
    })
    Myid=req.params.id
    var othersPosts=[]
    Detail.findOne({id:req.params.id},function(err,docs){
        if(docs){
            if(docs.following.length==0 && docs.Companiesfollowing.length==0){
                res.render('dashboard',{UserDetails:docs,OtherDetails:[]})
            }
            if(docs.following.length==0 && docs.Companiesfollowing.length!=0){
                docs.Companiesfollowing.forEach(function(companyid){
                    CompanyDetail.findOne({id:companyid},function(err,docs2){
                        if(docs2){
                            othersPosts.push([docs2.Posts,docs2.name,docs2.id])
                            res.render('dashboard',{UserDetails:docs,OtherDetails:othersPosts})
                        }
                    })
                })
            }
            if(docs.following.length!=0 && docs.Companiesfollowing.length==0){
                docs.following.forEach(function(id){
                    Detail.findOne({id:id},function(err,docs2){
                        if(docs2){
                            othersPosts.push([docs2.Posts,docs2.name,docs2.id])
                            res.render('dashboard',{UserDetails:docs,OtherDetails:othersPosts})
                        }
                    })
                })
            }
            docs.following.forEach(function(id){
                Detail.findOne({id:id},function(err,docs1){
                    if(docs1){
                    othersPosts.push([docs1.Posts,docs1.name,docs1.id])
                    docs.Companiesfollowing.forEach(function(companyid){
                        console.log(companyid)
                        CompanyDetail.findOne({id:companyid},function(err,docs2){
                            if(docs2){
                                othersPosts.push([docs2.Posts,docs2.name,docs2.id])}
                        })
                    })
                    res.render('dashboard',{UserDetails:docs,OtherDetails:othersPosts}) }
                    else if(!docs1){
                        docs.Companiesfollowing.forEach(function(companyid){
                            CompanyDetail.findOne({id:companyid},function(err,docs2){
                                if(docs2){
                                    othersPosts.push([docs2.Posts,docs2.name,docs2.id])
                                }
                            })
                        })
                        res.render('dashboard',{UserDetails:docs,OtherDetails:othersPosts})
                    }
                })
            })
}else if(!docs){
    res.write('<h1>ERROR!!!<h1>')
}
})})
app.post("/dashboard/:id/delete",function(req,res){
    console.log(req.body.checkbox)
    console.log(Myid)
    Detail.findOne({id:Myid},function(err,docs){
        docs.updateOne({$pull:{Posts:{_id:req.body.checkbox}}},function(err,docs1){
            if(docs1){
            console.log("post deleted!!")
            res.redirect('/dashboard/'+Myid)}
        })
    })
})
app.get('/dashboard/:id/post',function(req,res){
    Myid=req.params.id
})
app.post('/dashboard/:id/post',function(req,res){
    console.log(Myid)
    Detail.findOne({id:Myid},function(err,docs){
        console.log(req.body.post)
        docs.updateOne({$push:{Posts:{description:req.body.post[0],createdAt:Date.now(),likes:[]}}},function(err,docs){
            if(docs){
                res.redirect('/dashboard/'+Myid)
                console.log(docs.post)
            }
        })
    })
})
app.post('/dashboard/:id/skills',function(req,res){
    res.redirect('/skill/'+Myid)
})
//code for liking posts
app.post('/dashboard/:id/liked',function(req,res){
    var arr=req.body.likebutton.split(',')
    Detail.findOne({id:arr[1]},function(err,docs){
        console.log(docs)
        docs.Posts.forEach(function(post){
            if(post._id==arr[0]){
                if(!post.likes.includes(Myid)){
                post.likes.push(Myid)
                docs3.Notifications.push('someone liked your post!!')    
                docs.save((err,docs)=>{
                    if(docs){
                        res.redirect('/dashboard/'+Myid)
                    }
                })}else{
                    post.likes.remove(Myid)
                    docs.save((err,docs)=>{
                    if(docs){
                        res.redirect('/dashboard/'+Myid)
                    }
                })
                }
            }
        })
    })
})
var idofFriend=''
var idofMe=''
app.get("/dashboard/:id/user/:userId",function(req,res){
    if(req.params.id==req.params.userId){
        res.write("bsdk apni id na likh bc")
    }else{
        idofFriend=req.params.userId
        idofMe=req.params.id
        Detail.findOne({id:req.params.userId},function(err,docs){
            res.render('userfollow',{worklist:docs})
        })
    }
})
app.post('/dashboard/:id/user/:userId/follow',function(req,res){   
    Detail.findOne({id:idofMe},function(err,docs){       
        if(!docs.following.includes(idofFriend)){                 
        docs.updateOne({$push:{following:idofFriend}},function(err,docs1){           
        if(docs1){             
        Detail.findOne({id:idofFriend},function(err,docs2){            
        docs2.updateOne({$push:{followers:idofMe}},function(err,docs3){     
              
        if(docs3){
            console.log("followed!!")
        res.redirect('/dashboard/'+idofMe+'/'+idofFriend)
        }})})}})
        }else{
            docs.updateOne({$pull:{following:idofFriend}},function(err,docs4){
            if(docs4){
            Detail.findOne({id:idofFriend},function(err,docs5){
            docs.updateOne({$pull:{followers:idofMe}},function(err,docs6){
            if(docs6){
                console.log("unfollowed!!")
            res.redirect('/dashboard/'+idofMe+'/'+idofFriend)
            }})})}})}})})
var Myid2='';
var error_skill=''
app.get('/skill/:id',function(req,res){
    Myid2=req.params.id;
    console.log(Myid2)
    Detail.findOne({id:Myid2},function(err,docs){
        console.log(docs)
             res.render('skill',{skilllist:docs.skills,error:error_skill});
        })
    })
app.post('/skill/:id',function(req,res){
    console.log(req.body.skill[0]);
    console.log(Myid2)
    Detail.findOne({id:Myid2},function(err,docs){
        console.log(docs.name)
    if(docs.skills.includes(req.body.skill[0])){
        error_skill="this skill is already included"
        res.redirect('/skill/'+Myid2)
    }else{
    docs.skills.push(req.body.skill[0])
    docs.save((err,docs)=>{
        res.redirect('/skill/'+Myid2)
    })}
})
})
app.post('/skill/:id/delete',function(req,res){
    Detail.findOne({id:Myid2},function(err,docs){
        docs.skills.remove(req.body.checkbox)
        docs.save((err,docs)=>{
            if(docs){
                res.redirect('/skill/'+Myid2)
            }
        })
    })
})
app.post('/skill/:id/dashboard',function(req,res){
    res.redirect('/dashboard/'+Myid2)
})

var Myid3='';
var error_skill1=''
app.get('/vacancies/:id',function(req,res){
    Myid3=req.params.id;
    CompanyDetail.findOne({id:Myid3},function(err,docs){
        console.log(docs)
             res.render('vacancies',{skilllist:docs.requirements,error:error_skill1});
        })
    })
app.post('/vacancies/:id',function(req,res){
    console.log(req.body.skill[0]);
    console.log(Myid3)
    CompanyDetail.findOne({id:Myid3},function(err,docs){
        // console.log(docs.name)
    if(docs.requirements.includes(req.body.skill[0])){
        error_skill="this skill is already included"
        res.redirect('/vacancies/'+Myid3)
    }else{
    docs.requirements.push(req.body.skill[0])
    docs.applications.push({job:req.body.skill[0],applicants:[]})
    docs.save((err,docs)=>{
        res.redirect('/vacancies/'+Myid3)
    })
    docs.Usersfollowing.forEach(function(user){
        Detail.findOne({id:user},function(err,docs1){
            // docs1.Notifications.push(docs.name+'has released new vacancies!!')
        })
    })
}
})
})
app.post('/vacancies/:id/delete',function(req,res){
    CompanyDetail.findOne({id:Myid3},function(err,docs){
        docs.requirements.remove(req.body.checkbox)
        // docs.applications.remove({job:req.body.skills[0],applicants:[]})
        docs.save((err,docs)=>{
            if(docs){
                res.redirect('/vacancies/'+Myid3)
            }
        })
    })
})
app.post('/vacancies/:id/dashboardcompany',function(req,res){   
    res.redirect('/dashboardcompany/'+Myid3)
})
app.listen(3000,()=>{
    console.log("Server running on port 3000")
})
