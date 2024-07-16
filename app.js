// const express = require("express");
// const mongoose = require("mongoose");
// const path = require("path");
// const { setupMiddlewares } = require("./middlewares.js");
// const config = require("./config.js");

// require("dotenv").config();

// // express
// const app = express();
// const PORT = config.PORT;

// // MongoDB 연결
// mongoose
//   .connect(config.mongoURI)
//   .then(() => console.log("MongoDB Connected..."))
//   .catch((err) => console.log(err));

// // 미들웨어 설정
// setupMiddlewares(app);
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // 라우터 설정
// const User = require("./models/user.js");

// const userRoutes = require("./routes/userRoutes.js");
// const codiRoutes = require("./routes/codiRoutes.js");
// const openaiRoutes = require("./routes/openaiRoutes.js");
// const postRouter = require("./routes/post.js");
// const commentRouter = require("./routes/comment.js")(User);
// const CommuCollRouter = require("./routes/commuColl.js");

// app.use("/users", userRoutes);
// app.use("/codi", codiRoutes);
// app.use("/openai", openaiRoutes);
// app.use("/posts", postRouter);
// app.use("/comments", commentRouter);
// app.use("/mypage", CommuCollRouter);

// // 기본 루트 경로(/)에 대한 GET 요청 핸들러
// app.get("/", (req, res) => {
//   res.send("app.get 잘 돌아감");
// });

// // HTTP 서버 - 윈도우
// app.listen(PORT, () => {
//   console.log(`포트 돌아가는 즁~!`);
// });
