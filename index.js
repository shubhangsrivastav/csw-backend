"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Define Mongoose Schema
const userSchema = new mongoose_1.default.Schema({
    username: mongoose_1.default.Schema.Types.String,
    password: String,
    // purchased:[{type:mongoose.Schema.Types.ObjectId, ref:"Courses"}]
    purchased: [String]
});
const adminSchema = new mongoose_1.default.Schema({
    username: String,
    password: String,
});
const coursSchema = new mongoose_1.default.Schema({
    title: String,
    description: String,
    price: String,
    published: String,
    image: String,
    organiser: String
});
const Admin = mongoose_1.default.model("Admin", adminSchema);
const User = mongoose_1.default.model("User", userSchema);
const Courses = mongoose_1.default.model("Courses", coursSchema);
const secretKey = "shubhang";
mongoose_1.default.connect("mongodb+srv://Shubhang:67WexsBlgWqz33Qt@cluster0.ic1hndy.mongodb.net/", { dbName: "courses" });
const generateJwt = (user) => {
    const payload = { username: user };
    const token = jsonwebtoken_1.default.sign(payload, secretKey, { expiresIn: "1hr" });
    return token;
};
const authenticateJwt = (req, res, next) => {
    let header = req.headers["authorization"];
    if (header) {
        const token = header.split(' ')[1];
        jsonwebtoken_1.default.verify(token, secretKey, (err, user) => {
            if (err) {
                return res.status(403).json({ error: 'Forbidden', message: 'Token verification failed' });
            }
            // console.log(typeof user);
            // console.log(user);
            req.user = user;
            // req.headers['user']=user;
            next();
        });
    }
    else {
        return res.status(403).json({ error: 'Forbidden', message: 'Authentication failed' });
    }
};
// Admin routes
app.post('/admin/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // logic to sign up admin
    const { username, password } = req.body;
    const admin = yield Admin.findOne({ username, password });
    if (admin) {
        res.status(403).json({ message: "Admin already exists" });
    }
    else {
        const token = generateJwt(username);
        const newadmin = new Admin({ username: username, password: password });
        yield newadmin.save();
        res.json({ message: "Admin successfully created", token: token });
    }
}));
app.post('/admin/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // logic to log in admin
    const username = req.headers.username;
    const password = req.headers.password;
    const admin = yield Admin.findOne({ username, password });
    if (admin) {
        const token = generateJwt(username);
        res.status(201).json({ message: "Logged in successfully", token: token });
    }
    else {
        res.json({ message: "Authentification failed" });
    }
}));
app.get("/admin/me", authenticateJwt, (req, res) => {
    try {
        let user = req.user.username;
        res.json({ username: user });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
app.post('/admin/courses', authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // logic to create a course
    let course = req.body;
    const newcourse = new Courses(course);
    yield newcourse.save();
    res.json({ message: "Course created successfully", couseId: newcourse.id });
}));
app.put('/admin/courses/:courseId', authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // logic to edit a course
    try {
        const updatedcourse = req.body;
        const course = yield Courses.findByIdAndUpdate(req.params.courseId, updatedcourse, { new: true });
        if (course) {
            res.json({ message: "Course updated successfully" });
        }
        else {
            res.json({ message: "Course not found" });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
}));
app.get('/admin/courses', authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // logic to get all courses
    const course = yield Courses.find({});
    res.json({ course: course });
}));
app.get('/admin/courses/:courseid', authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const course = yield Courses.findById(req.params.courseid);
        if (course) {
            return res.json(course);
        }
        else {
            res.status(404).json({ message: "Course doesn't exist" });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}));
// User routes
app.post('/users/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // logic to sign up user
    const { username, password } = req.body;
    const found = yield User.findOne({ username, password });
    if (found) {
        res.json({ message: "User already exists" });
    }
    else {
        const newuser = new User({ username: username, password: password });
        yield newuser.save();
        const token = generateJwt(username);
        res.json({ message: "User successfully created", token: token });
    }
}));
app.post('/users/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // logic to log in user
    const { username, password } = req.headers;
    const found = yield User.findOne({ username: username, password: password });
    if (found) {
        const token = generateJwt(username);
        res.json({ message: "Logged in successfully", token: token });
    }
    else {
        res.json({ message: "User not found" });
    }
}));
app.get('/users/courses', authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // logic to list all courses
    const published = yield Courses.find({ published: "true" });
    res.json({ published: published });
}));
app.post('/users/courses/:courseId', authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const course = yield Courses.findById(req.params.courseId);
        if (course) {
            const user = yield User.findOne({ username: req.user.username });
            const found = user.purchased.find((ele) => {
                return ele == req.params.courseId;
            });
            if (user) {
                if (!found) {
                    user.purchased.push(req.params.courseId);
                    yield user.save();
                    res.json({ message: 'Course purchased successfully' });
                }
                else {
                    res.json({ message: 'Course already purchased' });
                }
            }
            else {
                res.status(403).json({ message: 'User not found' });
            }
        }
        else {
            res.status(404).json({ message: 'Course not found' });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server error" });
    }
}));
app.get('/users/purchasedCourses', authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // logic to view purchased courses
    const username = req.user.username;
    const user = yield User.findOne({ username: username });
    const purchasedIds = user.purchased;
    let purchasedCourses = [];
    for (let i = 0; i < purchasedIds.length; i++) {
        let temp = yield Courses.findById(purchasedIds[i]);
        purchasedCourses.push(temp);
    }
    res.json({ purchasedCourses: purchasedCourses });
}));
app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
