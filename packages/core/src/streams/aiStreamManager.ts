import {HfInference} from '@huggingface/inference';
import {StreamingTextResponse, LangChainStream, AnthropicStream, HuggingFaceStream, OpenAIStream} from 'ai';
import {Configuration, OpenAIApi} from 'openai-edge';
import {ChatOpenAI} from 'langchain/chat_models/openai';
import {AIChatMessage, HumanChatMessage} from 'langchain/schema';
import {ai as aiTypes} from 'types';

export class AiStreamManager {
  private streamSource: aiTypes.AiStreamSourceType;
  private defaultModels: Record<
    aiTypes.AiStreamSourceType,
    aiTypes.ANTHROPIC_MODELS | aiTypes.OPENAI_MODELS | aiTypes.LANGCHAIN_MODELS | aiTypes.HF_MODELS
  >;

  constructor(streamSource: aiTypes.AiStreamSourceType) {
    this.streamSource = streamSource;

    this.defaultModels = {
      ANTHROPIC: aiTypes.ANTHROPIC_MODELS.claude,
      HUGGINGFACE: aiTypes.HF_MODELS['bigscience/bloom'],
      LANGCHAIN: aiTypes.LANGCHAIN_MODELS.default,
      OPENAI: aiTypes.OPENAI_MODELS['gpt-3.5-turbo'],
    };
  }

  async getResponse(
    prompt: string,
    model?: aiTypes.ANTHROPIC_MODELS | aiTypes.OPENAI_MODELS | aiTypes.LANGCHAIN_MODELS | aiTypes.HF_MODELS
  ) {
    model = model || this.defaultModels[this.streamSource];

    switch (this.streamSource) {
      case 'ANTHROPIC':
        return await this.getAnthropicStream(prompt, model as aiTypes.ANTHROPIC_MODELS);
      case 'HUGGINGFACE':
        return await this.getHuggingFaceStream(prompt, model as aiTypes.HF_MODELS);
      case 'LANGCHAIN':
        return await this.getLangChainStream(prompt);
      case 'OPENAI':
        return await this.getOpenAIStream(prompt, model as aiTypes.OPENAI_MODELS);
    }
  }

  private async getAnthropicStream(prompt: string, model: aiTypes.ANTHROPIC_MODELS) {
    const response = await fetch('https://api.anthropic.com/v1/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
      },
      body: JSON.stringify({
        prompt,
        model,
        max_tokens_to_sample: 300,
        temperature: 0.9,
        stream: true,
      }),
    });
    return new StreamingTextResponse(AnthropicStream(response));
  }

  private async getHuggingFaceStream(prompt: string, model: aiTypes.HF_MODELS) {
    const Hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
    const iter = await Hf.textGenerationStream({
      model,
      inputs: prompt,
      parameters: {
        max_new_tokens: 200,
        temperature: 0.5,
        repetition_penalty: 1,
        return_full_text: false,
      },
    });
    return new StreamingTextResponse(HuggingFaceStream(iter));
  }

  private async getLangChainStream(prompt: string) {
    const {stream: lcStream, handlers} = LangChainStream();
    const llm = new ChatOpenAI({
      streaming: true,
      callbacks: [handlers],
    });
    llm
      .call(messages.map((m) => (m.role == 'user' ? new HumanChatMessage(m.content) : new AIChatMessage(m.content))))
      .catch(console.error);
    return new StreamingTextResponse(lcStream);
  }

  private async getOpenAIStream(prompt: string, model: aiTypes.OPENAI_MODELS) {
    const config = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(config);
    const response = await openai.createChatCompletion({
      model,
      stream: true,
      messages: [
        {role: 'system', content: 'You are a helpful assistant.'},
        {role: 'user', content: prompt},
      ],
    });
    return new StreamingTextResponse(OpenAIStream(response));
  }
}
