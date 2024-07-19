const express = require("express");
const router = express.Router();
const { CohereClient } = require('cohere-ai');

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY, clientName: "FitWeather"
});

const generateCohereResponse = async (preamble, prompt) => {
  try {
    const chat = await cohere.chat({
      model: "command-r-plus",
      preamble,
      message: prompt,
      temperature: 0.2,
    });
    // console.log('코히어', chat);
    return chat
  } catch (error) {
    console.error('Cohere API 에러:', error);
    throw error;
  }
}


router.post("/talkBox", async (req, res) => {
  const { temperature, maxTemp, minTemp, popValue, dust, uv } = req.body;

  let preamble = `전달받은 오늘의 날씨를 친구에게 친근한 말투로 친절하게 알려주는 역할이야. 
      숫자로 된 수치정보는 언급하면 안돼. 3~4문장으로 간결하게 알려줘.
      날씨이야기만 하고 옷차림에 대해서는 이야기 금지.
      최저기온이 25°C 이상이면 겉옷 이야기 금지.
      미세먼지 값이 좋음 또는 보통이면 마스크 이야기 와 미세먼지 이야기 금지.
      강수확률 값이 30% 혹은 그 이하면 비 올 확률이 낮으니 우산 이야기 금지.
      자외선 값이 매우높음 또는 높음이면 썬크림바르라고 해주고, 보통 또는 낮음이면 자외선, 썬크림에 대한 이야기 금지.
      야,라는 호칭 사용 금지.`

  let prompt = `오늘의 날씨를 알려줄게. 현재기온은 ${temperature}°C, 최고기온은 ${maxTemp}°C이고, 최저기온은 ${minTemp}°C이야.
  자외선은 ${uv}, 미세먼지는 ${dust}, 강수확률은 ${popValue}%야.`;

  try {
    const response = await generateCohereResponse(preamble, prompt);
    console.log('코히어작동', response);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/codiTalkBox", async (req, res) => {
  const { temperature, maxTemp, minTemp, popValue, dust, uv, clothes, selectedTemp } = req.body;
  let preamble = `전달받은 오늘의 날씨와 참고해서 ${selectedTemp}한 코디를 친구에게 친근한 말투로 친절하게 알려주는 역할이야.
      3~4문장으로 간결하게 알려줘야 돼. 하지만 날씨에 관해서 길게 이야기하는 것은 금지.
      사용자의 성별은 여자.
      사용자의 옷장에는 ${clothes} 종류의 옷들이 들어있어. 사용자의 옷자의 옷들로 조합해서 추천해줘.
      tops(상의)에는 각각 긴팔, 반팔, 민소매 종류로 있고, bottoms(하의)에는 각각 긴바지, 반바지 종류가 있어.
      사용자의 성별이 여자일 경우에만 블라우스, 롱스커트, 미니스커트, 원피스 제시할 수 있어.
      남자일 경우에는 블라우스, 롱스커트, 미니스커트, 원피스 제시 금지.
      시원한 코디를 알려줄 때, 현재기온과 최고기온이 25°C 이상일 때는 outers 종류 추천 금지.
      자외선 차단제 이야기 절대 금지.
      신발은 강수확률 값이 60% 이상일 때만 장화 추천. 그 외에 신발 이야기는 금지.
      반드시 사용자의 옷장에 있는 옷들로만 추천해줘. 옷장에 없는 옷은 절대로 추천 금지.
      옷 색깔, 옷 컬러 제시 금지, 반드시 문장으로 알려줘야돼. 비에 관한 이야기 금지. 한국어로만 이야기해줘.`


  let prompt = `오늘의 날씨를 알려줄게.현재기온은 ${temperature}°C, 최고기온은 ${maxTemp}°C이고, 최저기온은 ${minTemp}°C이야.
    자외선은 ${uv}, 미세먼지는 ${dust}, 강수확률은 ${popValue}% 야.`;



  try {
    const response = await generateCohereResponse(preamble, prompt);
    console.log('코히어작동', response);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
