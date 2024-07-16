// 필요한 모듈 불러오기
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
require("dotenv").config();

// Express 앱 초기화
const app = express();
const PORT = 8080;

// 미들웨어 설정
app.use(cors({
  credentials: true,
  origin: true,
  methods: ["GET", "POST", "DELETE", "PUT"],
  allowedHeaders: ["Content-Type"],
}));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB 연결
const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

// 모델 및 설정
const User = require("./models/user");

// 라우트 설정
// 회원가입 / 마이페이지
const UserRouter = require('./routes/userRoutes.js');
const CommuCollRouter = require("./routes/commuColl.js");
app.use("/user", UserRouter);
app.use("/collection", CommuCollRouter);

// 코디페이지
const CodiRouter = require('./routes/codiRoutes.js');
app.use('/codi', CodiRouter);

// 커뮤니티 페이지
const postRouter = require("./routes/post.js");
const commentRouter = require("./routes/comment.js")(User);
app.use("/posts", postRouter);
app.use("/comments", commentRouter);

// 메인 - GPT 프롬프트
const mainRouter = require('./routes/openaiRoutes.js');
app.use("/main", mainRouter);

// 기본 루트 경로
app.get("/", (req, res) => {
  res.send("app.get 잘 돌아감");
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`${PORT}번 포트 돌아가는 즁~!`);
});