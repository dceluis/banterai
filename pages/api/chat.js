import { languages, getPrompt } from "../../utils/lang";
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  const { conversation, language } = req.body;
  const selectedLang = languages[languages.indexOf(language)] || "English";
  const promptBase = getPrompt(selectedLang);
  const prompt = promptBase + conversation + "\nAI: ";

  const params = {
    model: "text-curie-001",
    // model: "text-davinci-003",
    prompt: prompt,
    temperature: 0.9,
    max_tokens: 150,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0.6,
    stop: [" Human:", " AI:"],
  }
  console.log("Params: ", params);

  const response = await openai.createCompletion(params);
  const completion = response.data.choices[0].text.trim();

  if (response.status === 200) {
    res.status(200).json({ reply: completion });
  } else {
    res.status(500).json({ message: response.statusText });
  }
}
