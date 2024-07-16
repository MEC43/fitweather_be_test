// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config");
const { authenticateToken } = require("../middlewares");
const User = require("../models/user");
const multer = require('multer')
const path = require("path");

const salt = bcrypt.genSaltSync(10);

// 프로필 이미지 저장 경로 multer 설정
const profileImgUpload = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profilImg/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const profileImgUp = multer({ storage: profileImgUpload });


// 회원가입
router.post("/register", async (req, res) => {
  const { userid, username, password, gender } = req.body;

  try {
    const userDoc = await User.create({
      userid,
      username,
      password: bcrypt.hashSync(password, salt),
      gender,
    });
    res.json(userDoc);
  } catch (e) {
    res.status(400).json({ message: "failed", error: e.message });
  }
});

//중복확인
router.post("/check-duplicate-id", async (req, res) => {
  const { userid } = req.body;

  try {
    const userById = await User.findOne({ userid });

    if (userById) {
      return res.json({ message: "아이디가 이미 존재합니다." });
    }

    res.json({ message: "사용 가능한 아이디입니다." });
  } catch (e) {
    res.status(500).json({ message: "서버 오류", error: e.message });
  }
});

router.post("/check-duplicate-username", async (req, res) => {
  const { username } = req.body;

  try {
    const userByUsername = await User.findOne({ username });

    if (userByUsername) {
      return res.status(400).json({ message: "닉네임이 이미 존재합니다." });
    }

    res.json({ message: "사용 가능한 닉네임입니다." });
  } catch (e) {
    res.status(500).json({ message: "서버 오류", error: e.message });
  }
});

// 로그인
router.post("/login", async (req, res) => {
  const { userid, password } = req.body;
  const userDoc = await User.findOne({ userid });
  console.log('유저정보', userDoc);

  if (!userDoc) {
    res.json({ message: "nouser" });
    return;
  }

  const passOK = bcrypt.compareSync(password, userDoc.password);
  if (passOK) {
    jwt.sign(
      {
        userid,
        username: userDoc.username,
        id: userDoc._id,
        gender: userDoc.gender,
        userprofile: userDoc.userprofile,
        shortBio: userDoc.shortBio
      },
      jwtSecret,
      {},
      (err, token) => {
        if (err) throw err;
        res.cookie("token", token).json({
          token,
          id: userDoc._id,
          username: userDoc.username,
          userid,
          shortBio: userDoc.shortBio,
          gender: userDoc.gender,
          userprofile: userDoc.userprofile
        });
      }
    );
  } else {
    res.json({ message: "로그인 실패, 로그인 서버 에러" });
  }
});

// 로그아웃
router.post("/logout", (req, res) => {
  res.cookie("token", null).json();
});

//----마이페이지 메인
// 사용자 정보 get요청
router.get('/getUserInfo', async (req, res) => {
  try {
    const { userId } = req.query
    const userInfo = await User.findOne({ userid: userId });
    console.log('유저아이디와 일치하는 유저정보', userInfo);
    if (!userInfo) {
      return res.status(404).json({ message: '해당하는 사용자가 없습니다.' });
    }
    res.json(userInfo);
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ message: "사용자 정보 전송 서버 에러" });
  }
});

// 사용자 프로필 업데이트
router.post("/updateProfile", profileImgUp.single("userprofile"), async (req, res) => {
  try {
    const { username, shortBio } = req.body;
    const { userId } = req.query
    const path = req.file ? req.file.path : null;
    console.log("이미지 경로:", path);
    console.log("업데이트할 사용자 정보:", username, shortBio);

    const updateData = {
      username,
      shortBio
    };

    if (path) {
      // 이미지경로가 있을 때만 업데이트
      updateData.userprofile = path;
    }

    const user = await User.findOneAndUpdate({ userid: userId },
      updateData, { new: true });

    console.log("업데이트된 사용자 정보:", user);
    res.json(user);
  } catch (error) {
    console.error("프로필 업데이트 중 오류 발생:", error);
    res.status(500).json("프로필 업데이트 서버 오류", { error });
  }
}
);

// 사용자 정보 업데이트
router.post("/updateUserInfo", authenticateToken, async (req, res) => {
  const { password, gender } = req.body;

  try {
    const hashedPassword = bcrypt.hashSync(password, salt);
    await User.findByIdAndUpdate(req.user.id, {
      password: hashedPassword,
      gender,
    });
    res.json({ message: "User information updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// 카카오 회원가입 기능
router.post("/kakao-register", async (req, res) => {
  const { userid, username, profile_image } = req.body;
  console.log(req.body);

  try {
    const userDoc = await User.create({
      userid,
      username,
      password: String(Math.floor(Math.random() * 1000000)),
      profile_image,
    });
    console.log("문서", userDoc);
    res.json(userDoc);
  } catch (e) {
    console.error("카카오 로그인 에러", e);
    res.status(400).json({ message: "failed", error: e.message });
  }
});

// 회원 탈퇴
router.delete("/deleteUser", authenticateToken, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.clearCookie("token"); //로그아웃 처리
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
