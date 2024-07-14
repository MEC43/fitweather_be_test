const { Configuration, OpenAIApi } = require("openai");
const { openaiApiKey } = require("../config");

const configuration = new Configuration({ apiKey: openaiApiKey });
const openai = new OpenAIApi(configuration);

const callOpenAI = async (prompt) => {
  try {
    const response = await openai.createCompletion({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "당신은 날씨에 따라 어떻게 옷을 입어야 할지 고민이 많은 친구나 동생에게 날씨를 알려줘야 한다." },
        { role: "user", content: "당신은 날씨에 따라 어떻게 옷을 입어야 할지 고민이 많은 친구나 동생에게 날씨를 알려줘야 한다." },
        { role: "assistant", content: "저는 주변인을 잘 챙기고 꼼꼼한 성격입니다. 날씨에 맞게 옷을 잘 입고 패션에 대해 잘 압니다." },
        { role: "user", content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.8,
      top_p: 1,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    });
    return response.data.choices[0].message;
  } catch (error) {
    console.error("OpenAI API call error:", error);
    throw new Error("Failed to get response from OpenAI");
  }
};

module.exports = { callOpenAI };
