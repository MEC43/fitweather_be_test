const express = require("express");
const { callOpenAI } = require("../helpers/openaiHelper");

const router = express.Router();

router.post("/talkBox", async (req, res) => {
  const { temperature, maxTemp, minTemp, popValue, dust, uv } = req.body;

  let prompt = `오늘의 날씨를 제시해줄게. 현재기온 : ${temperature}°C, 최고기온/최저기온 : ${maxTemp}°C / ${minTemp}°C, 자외선 : ${uv}, 미세먼지 : ${dust}, 강수확률: ${popValue}%`;
  prompt += `날씨는 3~4줄로 요약해서 말해줘야 하고, 친구에게 말하듯이 친근한 말투로 말해줘.`;
  prompt += `주의할 점은 숫자로 된 수치정보는 언급하지 말고 아래의 기준에 맞춰서 답변해줘.
  1. 최저기온이 25°C 이상이면 겉옷 얘기 금지
  2. 미세먼지 값이 좋음 또는 보통이면 마스크 얘기 금지, 미세먼지 얘기 금지
  3. 강수확률이 40% 이하이면 비 안 온다 얘기 금지, 우산 얘기 금지
  4. 강수확률이 40% 이상 60% 미만이면 “비가 올 수도 있으니 우산 챙겨가!” 답변 추가
  5. 강수확률이 60% 이상이면 “오늘 비오니까 우산 챙겨가!” 답변 추가
  6. 자외선 값이 매우높음 또는 높음이면 썬크림 얘기 해주고, 보통 또는 낮음이면 자외선, 썬크림 얘기 금지`;
  prompt += `답변의 한 문장이 끝날 때 다음 답변을 이어서 쓰지 말고 줄을 바꿔줘`;

  try {
    const response = await callOpenAI(prompt);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/codiTalkBox", async (req, res) => {
  const { temperature, maxTemp, minTemp, popValue, dust, uv, clothes, selectedTemp } = req.body;

  let codiPrompt = `오늘의 날씨를 제시해줄게. 현재기온 : ${temperature}°C, 최고기온/최저기온 : ${maxTemp}°C / ${minTemp}°C, 자외선 : ${uv}, 미세먼지 : ${dust}, 강수확률: ${popValue}%`;
  codiPrompt += `오늘의 날씨와 비교해서 ${selectedTemp}한 코디를 알려줘`;
  codiPrompt += `코디 정보는 3줄 이내로 요약해서 말해줘야 하고, 친구에게 말하듯이 친근한 말투로 말해줘`;
  codiPrompt += `사용자의 성별은 여자`;
  codiPrompt += `사용자의 옷장에는 ${clothes} 이런 옷들이 들어있어. 이 옷장에 있는 옷들을 조합해서 추천해줘`;
  codiPrompt += `tops에는 각각 긴팔, 반팔, 민소매 종류로 있고, bottoms에는 각각 긴바지, 반바지 종류가 있어`;
  codiPrompt += `주의할 점은 날씨에 관한 얘기는 하면 안 되고, 사용자의 성별이 여자일 경우에만 블라우스, 롱스커트, 미니스커트, 원피스를 제시해줘. 남자일 경우에는 저 코디를 제시받으면 안 돼`;
  codiPrompt += `시원한 코디를 알려줄 때, 현재기온과 최고기온이 25°C 이상일 때는 outers 종류는 추천하면 안 돼`;
  codiPrompt += `자외선이 아무리 높아도 자외선 차단제 얘기는 하면 안 돼`;
  codiPrompt += `신발 얘기는 강수확률이 60% 이상일 때만 "비오니까 장화 신고 가!" 덧붙여줘. 그 외에는 신발 얘기는 하면 안 돼`;
  codiPrompt += `꼭 사용자의 옷장에 있는 옷들만 추천해줘. 옷장에 없는 옷은 절대로 추천하면 안 돼`;

  try {
    const response = await callOpenAI(codiPrompt);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
