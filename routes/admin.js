const { Router } = require("express");
const adminRouter = Router();
const { adminModel, courseModel, userModel } = require("../db");
const jwt = require("jsonwebtoken");
// brcypt, zod, jsonwebtoken
const { JWT_ADMIN_PASSWORD } = require("../config");
const { adminMiddleware } = require("../middleware/admin");

const { z } = require("zod");
const { bcrypt } = require("bcrypt");


adminRouter.post("/signup", async function (req, res) {

    const requiredBody = z.object({
        email: z.string().min(2).max(50).email(),
        password: z.string().min(6).max(30),
        firstName: z.string().min(6).max(30),
        lastName: z.string().min(6).max(30)
    })
    const parsedData = requiredBody.safeParse(req.body);

    if (!parsedData) {
        res.json({
            message: "incorrect format",
            error: parsedData.error
        })
        return
    }

    try {
        const { email, password, firstName, lastName } = req.body; // TODO: adding zod validation

        const existingUser = await userModel.findOne({
            email: email,
            password: password
        })

        if (existingUser) {
            return res.json("email already exist");
        }

        const hashedPassword = await bcrypt.hash(password, 3);

        await adminModel.create({
            email: email,
            password: hashedPassword,
            firstName: firstName,
            lastName: lastName
        })
    } catch (error) {
        return res.status.json({
            error: "unexpected error occured "
        })
    }

    res.json({
        message: "Signup succeeded"
    })
})

adminRouter.post("/signin", async function (req, res) {
    const { email, password } = req.body;

    // TODO: ideally password should be hashed, and hence you cant compare the user provided password and the database password
    const admin = await adminModel.findOne({
        email: email,
        password: password
    });

    if (admin) {
        const token = jwt.sign({
            id: admin._id
        }, JWT_ADMIN_PASSWORD);

        // Do cookie logic

        res.json({
            token: token
        })
    } else {
        res.status(403).json({
            message: "Incorrect credentials"
        })
    }
})

adminRouter.post("/course", adminMiddleware, async function (req, res) {
    const adminId = req.userId;

    const { title, description, imageUrl, price } = req.body;

    // creating a web3 saas in 6 hours
    const course = await courseModel.create({
        title: title,
        description: description,
        imageUrl: imageUrl,
        price: price,
        creatorId: adminId
    })

    res.json({
        message: "Course created",
        courseId: course._id
    })
})

adminRouter.put("/course", adminMiddleware, async function (req, res) {
    const adminId = req.userId;

    const { title, description, imageUrl, price, courseId } = req.body;

    // creating a web3 saas in 6 hours
    const course = await courseModel.updateOne({
        _id: courseId,
        creatorId: adminId
    }, {
        title: title,
        description: description,
        imageUrl: imageUrl,
        price: price
    })

    res.json({
        message: "Course updated",
        courseId: course._id
    })
})

adminRouter.get("/course/bulk", adminMiddleware, async function (req, res) {
    const adminId = req.userId;

    const courses = await courseModel.find({
        creatorId: adminId
    });

    res.json({
        message: "all course you created are as follows",
        courses
    })
})

module.exports = {
    adminRouter: adminRouter
}