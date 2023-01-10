const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const promptBase = "The following is a conversation in English between two friends. The person referred to as 'AI' is creative, clever, and very friendly. Most of AI's replies aren't typical, but uncommon, funny and short. Often, basic pleasantries are skipped. Every couple of questions, AI skillfully changes the subject and starts talking about everyday things and cultural occurrences. Also, in 1/3 of all interventions, AI just answers with some anecdotes of its own. In many interventions, AI makes a funny or clever remark.\n\n"

export default async function handler(req, res) {
  const { conversation } = req.body;
  const prompt = promptBase + conversation + "\nAI: ";

  const params = {
    model: "text-curie-001",
    prompt: prompt,
    temperature: 0.9,
    max_tokens: 150,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0.6,
    stop: [" Human:", " AI:"],
  }

  const response = await openai.createCompletion(params);
  const completion = response.data.choices[0].text;

  if (response.status === 200) {
    res.status(200).json({ reply: completion });
  } else {
    res.status(500).json({ message: response.statusText });
  }
}
