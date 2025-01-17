const { Router } = require("express");
const { userModel, purchaseModel, courseModel } = require("../db");
const jwt = require("jsonwebtoken");
const { JWT_USER_PASSWORD } = require("../config");
const { userMiddleware } = require("../middleware/user");

const { z } = require("zod");
const { bcrypt } = require("bcrypt");


const userRouter = Router();

userRouter.post("/signup", async function (req, res) {
    //  adding zod validation
    const requiredBody = z.object({
        email: z.string().min(2).max(50).email(),
        password: z.string().min(6).max(30),
        firstName: z.string().min(2).max(30),
        lastName: z.string().min(2).max(30)
    })

    const parsedData = requiredBody.safeParse(req.body);

    if (!parsedData.success) {
        res.json({
            message: "incorrect format",
            error: parsedData.error
        })
        return
    }

    try {
        const { email, password, firstName, lastName } = req.body; //------

        //is user already signed up
        const existingUser = await userModel.findOne({
            email: email,
            password: password
        });
        if (existingUser) {
            return res.json("email already exist ");
        }

        // TODO: hash the password so plaintext pw is not stored in the DB
        const hashedPassword = await bcrypt.hash(password, 3); //here 3 is salt round you can put any no
        // //or ...brcypt.hash(password)

        // TODO: Put inside a try catch block
        await userModel.create({
            email: email,
            password: hashedPassword,
            firstName: firstName,
            lastName: lastName
        })

    } catch (error) {
        return res.status(500).json({
            error: "unexpected error occured "
        });
    }

    res.json({
        message: "Signup succeeded"
    })
})

userRouter.post("/signin", async function (req, res) {
    //  adding zod validation
    const requiredBody = z.object({
        email: z.string().min(3).max(50).email(),
        password: z.string().min(6).max(20)
    })

    const parsedData = requiredBody.safeParse(req.body);

    if (!parsedData.success) {
        res.json({
            message: "incorrect format",
            error: parsedData.error
        })
        return
    }

    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({
            email: email
        }); //[]

        //if user not found
        if (!user) {
            return res.status(403).json({
                message: "User does not exist"
            })
        }
        //password is hashed, and hence you cant compare the user provided password and the database password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
            const token = jwt.sign({
                id: user._id,
            }, JWT_USER_PASSWORD);

            // Do cookie logic

            res.json({
                token: token
            })
        } else {
            res.status(403).json({
                message: "incorrect credentials"
            })
        }

    } catch (error) {
        return res.status(500).json({
            error: "unexpected error occured "
        });
    }
})

userRouter.get("/purchases", userMiddleware, async function (req, res) {
    const userId = req.userId;

    const purchases = await purchaseModel.find({
        userId,
    });

    const purchasedCourseIds = purchases.map(purchase => purchase.courseId);
    /*  above line ----OR---- below commented code
        let purchasedCourseIds = [];
        for (let i = 0; i<purchases.length;i++){ 
            purchasedCourseIds.push(purchases[i].courseId)
        }
    */
    const coursesData = await courseModel.find({
        _id: { $in: purchasedCourseIds }
    })

    res.json({
        purchases,
        coursesData
    })
})

module.exports = {
    userRouter: userRouter
}