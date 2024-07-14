// routes/codiRoutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const CodiLogModel = require("../models/codiLog");
const fs = require("fs");

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/codiLog",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });


// codiLogDetail GET
router.get("/codiLogDetail/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const codiLog = await CodiLogModel.findById(id);
    res.json(codiLog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// codiLogToday GET
router.get("/codiLogToday/:today/:userid", async (req, res) => {
  const { today, userid } = req.params;
  try {
    const codiLogToday = await CodiLogModel.find({
      userid: userid,
      codiDate: today,
    });
    if (codiLogToday.length > 0) {
      // console.log(codiLogToday[0]);
      res.json(codiLogToday[0]);
    } else {
      // console.log("해당날짜 기록 없음");
      res.json(null); // 해당 날짜에 대한 데이터가 없을 때
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// codiLogSimilar GET
router.get(
  "/codiLogSimilar/:maxTemp/:minTemp/:sky/:userid/:today",
  async (req, res) => {
    const { maxTemp, minTemp, sky, userid, today } = req.params;
    // console.log("-------------요청 성공 >> ", maxTemp, minTemp, sky, userid); // 예 ) 31 21 구름많음 nayoung
    // 비슷한 날씨 : 기온 차이 4도 미만 으로 설정
    //1순위 : 기온차 조건 ok + sky 똑같음 //2순위 : 기온차 조건 ok   //부합하는 기록이 여러개라면 : 랜덤
    try {
      const ListSimilarTemp = await CodiLogModel.find({
        userid: userid,
        maxTemp: { $gte: parseInt(maxTemp) - 2, $lte: parseInt(maxTemp) + 2 },
        minTemp: { $gte: parseInt(minTemp) - 2, $lte: parseInt(minTemp) + 2 },
        codiDate: { $ne: today },
      });

      let setListCheckSimilar = []; //
      if (ListSimilarTemp.length > 0) {
        const ListSimilarSky = ListSimilarTemp.filter(
          (item) => item.sky === sky
        );
        if (ListSimilarSky.length !== 0) {
          setListCheckSimilar = [...ListSimilarSky];
        } else {
          setListCheckSimilar = [...ListSimilarTemp];
        }

        // console.log("---조건 부합한 기록 갯수 ---", setListCheckSimilar.length);
        const randomIndex = Math.floor(
          Math.random() * setListCheckSimilar.length
        ); // 0부터 (listLength-1) 사이의 랜덤한 정수 얻기
        // console.log(
        //   "@@@랜덤숫자, 해당 기록@@@@",
        //   randomIndex,
        //   setListCheckSimilar[randomIndex]
        // );
        res.json(setListCheckSimilar[randomIndex]);
      } else {
        res.json(null); // 해당하는 데이터가 없을 때
        console.log("!!!!조간 부합한 기록이 없다!!!!");
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "codiLogSimilar : Internal Server Error" });
    }
  }
);

// codiLogList GET
router.get("/codiLogList/:userid", async (req, res) => {
  const { userid } = req.params;
  const limit = parseInt(req.query.limit, 10) || 32;
  const page = parseInt(req.query.page, 10) || 0;
  const skip = page * limit;

  try {
    const codiLogList = await CodiLogModel.find({ userid })
      .sort({ codiDate: -1 })
      .skip(skip)
      .limit(limit);
    res.json(codiLogList);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// codiWrite POST
router.post("/codiWrite", upload.single("file"), async (req, res) => {
  const { memo, tag, address, maxTemp, minTemp, codiDate, sky, userid } =
    req.body;
  const { path } = req.file;

  try {
    const codiDoc = await CodiLogModel.create({
      image: path,
      tag,
      memo,
      address,
      maxTemp,
      minTemp,
      sky,
      codiDate,
      userid,
    });
    res.json(codiDoc);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// codiEdit PUT
router.put("/codiEdit/:id", upload.single("file"), async (req, res) => {
  const { id } = req.params;
  const { memo, tag } = req.body;
  const { path } = req.file;
  console.log("---codiEdit 잘 돌아감", id, memo, tag, path);

  try {
    await CodiLogModel.findByIdAndUpdate(id, {
      memo,
      tag,
      image: path,
    });
    res.status(200).json({ message: "CodiEdit successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

// codiDelete DELETE
router.delete("/codiDelete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const codiLog = await CodiLogModel.findById(id);
    const imgPath = codiLog.image;

    await CodiLogModel.findByIdAndDelete(id);

    fs.unlink(imgPath, (err) => {
      //uploads/codiLog 폴더의 이미지파일도 삭제되도록
      if (err) {
        console.error("파일 삭제 실패:", err);
        return;
      }
      console.log("파일이 성공적으로 삭제되었습니다.");
    });

    res.status(200).json({ message: "codiDelete successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
