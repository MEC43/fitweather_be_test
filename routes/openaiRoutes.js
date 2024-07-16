const express = require("express");
const router = express.Router();
// const { callOpenAI } = require("../helpers/openaiHelper");

const { OpenAI } = require("openai"); // openai 모듈

// openai apiKey
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/talkBox", async (req, res) => {
  console.log(req.body);
  const { temperature, maxTemp, minTemp, popValue, dust, uv } = req.body;

  // 날씨를 전달해주는 prompt
  let prompt = "";
  prompt += `오늘의 날씨를 제시해줄게. 현재기온 : ${temperature}°C, 최고기온/최저기온 : ${maxTemp}°C / ${minTemp}°C, 자외선 : ${uv}, 미세먼지 : ${dust}, 강수확률: ${popValue}%`;
  prompt += `날씨는 3줄로 요약해서 말해줘야 하고, 친구에게 말하듯이 친근한 말투로 말해줘.`;
  prompt += `주의할 점은 숫자로 된 수치정보는 언급하지 말고 아래의 기준에 맞춰서 답변해줘.
  1. 최저기온이 25°C 이상이면 겉옷 얘기 금지
  2. 미세먼지 값이 좋음 또는 보통이면 마스크 얘기 금지, 미세먼지 얘기 금지
  3. 강수확률이 40% 이하이면 비 안 온다 얘기 금지, 우산 얘기 금지
  4. 강수확률이 40% 이상 60% 미만이면 “비가 올 수도 있으니 우산 챙겨가!” 답변 추가
  5. 강수확률이 60% 이상이면 “오늘 비오니까 우산 챙겨가!” 답변 추가
  6. 자외선 값이 매우높음 또는 높음이면 썬크림 얘기 해주고, 보통 또는 낮음이면 자외선, 썬크림 얘기 금지`;
  prompt += `답변의 한 문장이 끝날 때 다음 답변을 이어서 쓰지 말고 줄을 바꿔줘`;

  // prompt를 전달하고 결과를 받아옴
  const result = await callChatGPT(prompt);
  if (result) {
    res.json({ response: result });
  } else {
    res.status(500).json({ error: "실패" });
  }
});

async function callChatGPT(prompt) {
  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o", // gpt 모델 버전
      messages: [
        // 1. GPT 역할 부여 샘플
        {
          role: "system",
          content:
            "당신은 날씨에 따라 어떻게 옷을 입어야 할지 고민이 많은 친구나 동생에게 날씨를 알려줘야 한다.",
        },
        {
          role: "user",
          content:
            "당신은 날씨에 따라 어떻게 옷을 입어야 할지 고민이 많은 친구나 동생에게 날씨를 알려줘야 한다.",
        },
        {
          role: "assistant",
          content:
            "저는 주변인을 잘 챙기고 꼼꼼한 성격입니다. 날씨에 맞게 옷을 잘 입고 패션에 대해 잘 압니다.",
        },

        // 2. 내가 전달한 prompt
        { role: "user", content: prompt },
      ],
      max_tokens: 1000, // 돈 많이 나갈까봐 글자수 제한;
      temperature: 0.8, // 0.0 ~ 1.0 사이의 값. 0.0에 가까울수록 더 안전한 선택을, 1.0에 가까울수록 더 창의적인 선택을 함.
      top_p: 1, // 0.0 ~ 1.0 사이의 값. 1.0에 가까울수록 다양한 선택을 함.
      frequency_penalty: 0.0, // 0.0 ~ 1.0 사이의 값. 0.0에 가까울수록 더 반복적인 선택을 함.
      presence_penalty: 0.0, // 0.0 ~ 1.0 사이의 값. 0.0에 가까울수록 더 새로운 선택을 함.
    });

    console.log("result: ", result.choices[0].message);
    return result.choices[0].message;
  } catch (e) {
    console.log(e);
  }
}

router.post("/codiTalkBox", async (req, res) => {
  console.log(req.body);
  const {
    temperature,
    maxTemp,
    minTemp,
    popValue,
    dust,
    uv,
    clothes,
    selectedTemp,
    gender,
  } = req.body;

  // 날씨를 전달해주는 prompt
  let codiPrompt = "";
  codiPrompt += `오늘의 날씨를 제시해줄게. 현재기온 : ${temperature}°C, 최고기온/최저기온 : ${maxTemp}°C / ${minTemp}°C, 자외선 : ${uv}, 미세먼지 : ${dust}, 강수확률: ${popValue}%`;
  codiPrompt += `오늘의 날씨와 비교해서 ${selectedTemp}한 코디를 알려줘`;
  codiPrompt += `코디 정보는 3줄 이내로 요약해서 말해줘야 하고, 친구에게 말하듯이 친근한 말투로 말해줘`;
  codiPrompt += `사용자의 성별은 ${gender}`;
  codiPrompt += `사용자의 옷장에는 ${clothes} 이런 옷들이 들어있어. 이 옷장에 있는 옷들을 조합해서 추천해줘`;
  codiPrompt += `tops에는 각각 긴팔, 반팔, 민소매 종류로 있고, bottoms에는 각각 긴바지, 반바지 종류가 있어`;
  codiPrompt += `주의할 점은 날씨에 관한 얘기는 하면 안 되고, 사용자의 성별이 female일 경우에만 블라우스, 롱스커트, 미니스커트, 원피스를 제시해줘. male일 경우에는 저 코디를 제시받으면 안 돼`;
  codiPrompt += `시원한 코디를 알려줄 때, 현재기온과 최고기온이 25°C 이상일 때는 outers 종류는 추천하면 안 돼`;
  codiPrompt += `자외선이 아무리 높아도 자외선 차단제 얘기는 하면 안 돼`;
  codiPrompt += `신발 얘기는 강수확률이 60% 이상일 때만 "비오니까 장화 신고 가!" 덧붙여줘. 그 외에는 신발 얘기는 하면 안 돼`;
  codiPrompt += `꼭 사용자의 옷장에 있는 옷들만 추천해줘. 옷장에 없는 옷은 절대로 추천하면 안 돼.`;

  // prompt를 전달하고 결과를 받아옴
  const result = await callCodiAI(codiPrompt);
  if (result) {
    res.json({ response: result });
  } else {
    res.status(500).json({ error: "실패" });
  }
});

async function callCodiAI(codiPrompt) {
  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o", // gpt 모델 버전
      messages: [
        // 1. GPT 역할 부여 샘플
        {
          role: "system",
          content:
            "당신은 날씨에 따라 어떻게 옷을 입어야 할지 고민이 많은 친구나 동생에게 코디를 알려줘야 한다.",
        },
        {
          role: "user",
          content:
            "당신은 날씨에 따라 어떻게 옷을 입어야 할지 고민이 많은 친구나 동생에게 코디를 알려줘야 한다.",
        },
        {
          role: "assistant",
          content:
            "저는 주변인을 잘 챙기고 꼼꼼한 성격입니다. 날씨에 맞게 옷을 잘 입고 패션에 대해 잘 압니다.",
        },

        // 2. 내가 전달한 prompt
        { role: "user", content: codiPrompt },
      ],
      max_tokens: 1000, // 돈 많이 나갈까봐 글자수 제한;
      temperature: 0.5, // 0.0 ~ 1.0 사이의 값. 0.0에 가까울수록 더 안전한 선택을, 1.0에 가까울수록 더 창의적인 선택을 함.
      top_p: 1, // 0.0 ~ 1.0 사이의 값. 1.0에 가까울수록 다양한 선택을 함.
      frequency_penalty: 0.0, // 0.0 ~ 1.0 사이의 값. 0.0에 가까울수록 더 반복적인 선택을 함.
      presence_penalty: 0.0, // 0.0 ~ 1.0 사이의 값. 0.0에 가까울수록 더 새로운 선택을 함.
    });

    console.log("result: ", result.choices[0].message);
    return result.choices[0].message;
  } catch (e) {
    console.log(e);
  }
}

module.exports = router;
